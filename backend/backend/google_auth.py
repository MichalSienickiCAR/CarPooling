import requests
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
import logging

logger = logging.getLogger(__name__)


class GoogleAuthService:
    """Serwis do obsługi autentykacji Google OAuth"""

    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    @staticmethod
    def exchange_code_for_token(code: str) -> dict:
        """
        Wymienia kod autoryzacyjny na token dostępu

        Args:
            code: Kod autoryzacyjny z Google

        Returns:
            dict z tokenem dostępu i informacjami o użytkowniku

        Raises:
            AuthenticationFailed: Gdy wymiana kodu nie powiedzie się
        """
        try:
            # Wymiana kodu na token
            token_response = requests.post(
                GoogleAuthService.GOOGLE_TOKEN_URL,
                data={
                    'code': code,
                    'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
                    'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
                    'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
                    'grant_type': 'authorization_code',
                },
                timeout=10
            )

            if token_response.status_code != 200:
                logger.error(f"Google token exchange failed: {token_response.text}")
                raise AuthenticationFailed('Nie udało się wymienić kodu na token')

            token_data = token_response.json()
            access_token = token_data.get('access_token')

            if not access_token:
                raise AuthenticationFailed('Brak tokenu dostępu w odpowiedzi')

            # Pobranie informacji o użytkowniku
            userinfo_response = requests.get(
                GoogleAuthService.GOOGLE_USERINFO_URL,
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )

            if userinfo_response.status_code != 200:
                logger.error(f"Google userinfo failed: {userinfo_response.text}")
                raise AuthenticationFailed('Nie udało się pobrać informacji o użytkowniku')

            userinfo = userinfo_response.json()

            return {
                'access_token': access_token,
                'email': userinfo.get('email'),
                'first_name': userinfo.get('given_name', ''),
                'last_name': userinfo.get('family_name', ''),
                'picture': userinfo.get('picture'),
                'google_id': userinfo.get('id'),
            }

        except requests.exceptions.Timeout:
            logger.error("Google OAuth timeout")
            raise AuthenticationFailed('Przekroczono czas oczekiwania na odpowiedź Google')
        except requests.exceptions.RequestException as e:
            logger.error(f"Google OAuth request error: {e}")
            raise AuthenticationFailed('Błąd połączenia z Google')
        except Exception as e:
            logger.error(f"Google OAuth error: {e}")
            raise AuthenticationFailed('Błąd podczas autentykacji Google')

    @staticmethod
    def get_google_user_info(access_token: str) -> dict:
        """
        Pobiera dane użytkownika z Google na podstawie access tokena.
        """
        if not access_token:
            raise AuthenticationFailed('Brak tokenu dostępu')

        try:
            userinfo_response = requests.get(
                GoogleAuthService.GOOGLE_USERINFO_URL,
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            if userinfo_response.status_code != 200:
                logger.error(f"Google userinfo failed: {userinfo_response.text}")
                raise AuthenticationFailed('Nie udało się pobrać informacji o użytkowniku')

            userinfo = userinfo_response.json()
            return {
                'email': userinfo.get('email'),
                'first_name': userinfo.get('given_name', ''),
                'last_name': userinfo.get('family_name', ''),
                'picture': userinfo.get('picture'),
                'google_id': userinfo.get('id'),
            }
        except requests.exceptions.Timeout:
            logger.error("Google userinfo timeout")
            raise AuthenticationFailed('Przekroczono czas oczekiwania na odpowiedź Google')
        except requests.exceptions.RequestException as e:
            logger.error(f"Google userinfo request error: {e}")
            raise AuthenticationFailed('Błąd połączenia z Google')

    @staticmethod
    def get_or_create_user(user_info: dict) -> dict:
        """
        Tworzy lub pobiera użytkownika na podstawie danych Google i zwraca JWT (access/refresh).
        """
        from django.contrib.auth.models import User
        from rest_framework_simplejwt.tokens import RefreshToken
        from api.models import UserProfile

        email = (user_info.get('email') or '').strip().lower()
        google_id = user_info.get('google_id')
        first_name = user_info.get('first_name', '') or ''
        last_name = user_info.get('last_name', '') or ''

        if not email:
            raise AuthenticationFailed('Brak email w danych Google')

        user = None

        # 1) Spróbuj po google_id (w profilu)
        if google_id:
            profile = UserProfile.objects.filter(google_id=google_id).select_related('user').first()
            if profile:
                user = profile.user

        # 2) Spróbuj po email (User)
        if user is None:
            user = User.objects.filter(email__iexact=email).first()

        # 3) Utwórz nowego usera
        if user is None:
            base_username = email.split('@')[0]
            username = base_username
            suffix = 1
            while User.objects.filter(username=username).exists():
                suffix += 1
                username = f"{base_username}{suffix}"

            # Hasło nie jest potrzebne do OAuth; ustawiamy losowe.
            user = User.objects.create_user(username=username, email=email)
            user.set_unusable_password()
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        # Upewnij się, że profil istnieje i ma ustawione google_id
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'preferred_role': 'passenger'})
        if not profile.preferred_role:
            profile.preferred_role = 'passenger'
        if google_id and profile.google_id != google_id:
            profile.google_id = google_id
        profile.save()

        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
