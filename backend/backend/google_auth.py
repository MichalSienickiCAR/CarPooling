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
