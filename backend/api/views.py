from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from datetime import date
import logging
from .serializers import UserSerializer, TripSerializer, BookingSerializer, UserProfileSerializer
from .models import Trip, Booking, UserProfile

logger = logging.getLogger('api')


class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        user = serializer.save()
        preferred_role = serializer.validated_data.get('preferred_role', 'both')
        logger.info(
            f"New user registered: {user.username} (ID: {user.id}, Email: {user.email}, Role: {preferred_role})"
        )
        return user


from rest_framework.parsers import MultiPartParser, FormParser

class UserProfileView(APIView):
    """Endpoint do pobierania i aktualizacji profilu zalogowanego użytkownika"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        """Pobiera profil użytkownika"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def patch(self, request):
        """Aktualizuje profil (dane osobowe, rola, avatar)"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.username} updated profile.")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Dla akcji 'my_trips' używamy własnego querysetu w metodzie my_trips
        # Więc tutaj nie filtrujemy po akcji
        
        # Dla listy przejazdów pokazujemy tylko przyszłe (włącznie z dzisiaj)
        queryset = Trip.objects.filter(date__gte=date.today())
        
        # Filtrowanie po parametrach query
        start_location = self.request.query_params.get('start_location', None)
        end_location = self.request.query_params.get('end_location', None)
        trip_date = self.request.query_params.get('date', None)
        
        if start_location:
            queryset = queryset.filter(start_location__icontains=start_location)
        
        if end_location:
            queryset = queryset.filter(end_location__icontains=end_location)
        
        if trip_date:
            queryset = queryset.filter(date=trip_date)
        
        # Filtrujemy tylko przejazdy z dostępnymi miejscami
        queryset = queryset.filter(available_seats__gt=0)
        
        return queryset.order_by('date', 'time')

    def perform_create(self, serializer):
        trip = serializer.save(driver=self.request.user)
        logger.info(
            f"Trip created: ID={trip.id}, Driver={self.request.user.username} (ID: {self.request.user.id}), "
            f"Route={trip.start_location} → {trip.end_location}, "
            f"Date={trip.date}, Seats={trip.available_seats}, Price={trip.price_per_seat}, "
            f"Driver FK in DB: {trip.driver_id}"
        )
        return trip

    @action(detail=True, methods=['get'])
    def passengers(self, request, pk=None):
        """Zwraca listę pasażerów dla danego przejazdu"""
        trip = self.get_object()
        if trip.driver != request.user:
            logger.warning(
                f"Unauthorized access attempt: User {request.user.username} tried to view "
                f"passengers for trip {trip.id} (driver: {trip.driver.username})"
            )
            return Response(
                {'detail': 'Nie masz uprawnień do przeglądania pasażerów tego przejazdu.'},
                status=status.HTTP_403_FORBIDDEN
            )
        bookings = trip.bookings.all()
        logger.info(f"Driver {request.user.username} viewed passengers for trip {trip.id}: {bookings.count()} bookings")
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Anuluje przejazd (tylko kierowca)"""
        trip = self.get_object()
        if trip.driver != request.user:
            logger.warning(
                f"Unauthorized cancel attempt: User {request.user.username} tried to cancel "
                f"trip {trip.id} (driver: {trip.driver.username})"
            )
            return Response(
                {'detail': 'Nie masz uprawnień do anulowania tego przejazdu.'},
                status=status.HTTP_403_FORBIDDEN
            )
        trip_id = trip.id
        trip_route = f"{trip.start_location} → {trip.end_location}"
        trip.delete()
        logger.info(f"Trip cancelled: ID={trip_id}, Route={trip_route}, Driver={request.user.username}")
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def my_trips(self, request):
        """Zwraca wszystkie przejazdy zalogowanego kierowcy (bez filtrowania po dacie)"""
        # Pobieramy wszystkie przejazdy kierowcy, nie tylko przyszłe
        trips = Trip.objects.filter(driver=request.user).order_by('-date', '-time')
        logger.info(
            f"Driver {request.user.username} (ID: {request.user.id}) viewed their trips: "
            f"{trips.count()} trips found"
        )
        # Logujemy szczegóły przejazdów dla debugowania
        for trip in trips:
            logger.info(
                f"  - Trip ID: {trip.id}, Route: {trip.start_location} → {trip.end_location}, "
                f"Date: {trip.date}, Driver ID: {trip.driver.id}, Driver username: {trip.driver.username}"
            )
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)


class TripSearchView(generics.ListAPIView):
    """
    Widok do wyszukiwania przejazdów dla pasażerów.
    Filtruje po miejscu startu, celu i dacie.
    Wyklucza przejazdy użytkownika (kierowca nie może rezerwować miejsca w swoim przejeździe).
    
    Parametry query (wszystkie opcjonalne):
    - start_location: część nazwy miejsca startowego
    - end_location: część nazwy miejsca docelowego  
    - date: data w formacie YYYY-MM-DD (opcjonalne)
    """
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Zaczynamy od wszystkich przejazdów, wykluczając przejazdy zalogowanego użytkownika
        # NIE filtrujemy po dacie na początku - pozwalamy na elastyczne wyszukiwanie
        queryset = Trip.objects.exclude(driver=self.request.user)
        
        start_location = self.request.query_params.get('start_location', None)
        end_location = self.request.query_params.get('end_location', None)
        trip_date = self.request.query_params.get('date', None)
        
        # Logowanie parametrów wyszukiwania
        logger.info(
            f"Trip search initiated by {self.request.user.username} (ID: {self.request.user.id}): "
            f"start_location={start_location}, end_location={end_location}, date={trip_date}"
        )
        initial_count = queryset.count()
        logger.info(f"Initial queryset count (excluding user's trips): {initial_count}")
        
        # Logujemy wszystkie przejazdy przed filtrowaniem (dla debugowania)
        if initial_count > 0:
            logger.info("All trips before filtering:")
            for trip in queryset[:10]:  # Loguj max 10 pierwszych
                logger.info(
                    f"  - Trip ID: {trip.id}, Driver: {trip.driver.username} (ID: {trip.driver.id}), "
                    f"Route: {trip.start_location} → {trip.end_location}, "
                    f"Date: {trip.date}, Seats: {trip.available_seats}"
                )
        else:
            logger.warning(f"No trips found in database (excluding user {self.request.user.username})")
            # Sprawdzamy czy w ogóle są przejazdy w bazie
            all_trips_count = Trip.objects.count()
            logger.info(f"Total trips in database: {all_trips_count}")
            if all_trips_count > 0:
                logger.info("All trips in database:")
                for trip in Trip.objects.all()[:5]:
                    logger.info(
                        f"  - Trip ID: {trip.id}, Driver: {trip.driver.username} (ID: {trip.driver.id}), "
                        f"Route: {trip.start_location} → {trip.end_location}, Date: {trip.date}"
                    )
        
        # Filtrowanie po lokalizacji - case insensitive, częściowe dopasowanie
        # Jeśli pole jest puste, nie filtrujemy
        if start_location and start_location.strip():
            queryset = queryset.filter(start_location__icontains=start_location.strip())
            logger.info(f"After start_location filter ('{start_location.strip()}'): {queryset.count()}")
        
        if end_location and end_location.strip():
            queryset = queryset.filter(end_location__icontains=end_location.strip())
            logger.info(f"After end_location filter ('{end_location.strip()}'): {queryset.count()}")
        
        # Filtrowanie po dacie
        today = date.today()
        logger.info(f"Today's date: {today}")
        
        if trip_date and trip_date.strip():
            try:
                from datetime import datetime
                search_date = datetime.strptime(trip_date.strip(), '%Y-%m-%d').date()
                logger.info(f"Search date from user: {search_date}, Today: {today}")
                
                # Filtrujemy dokładnie po podanej dacie
                queryset = queryset.filter(date=search_date)
                logger.info(f"After exact date filter (date={search_date}): {queryset.count()}")
                
                # Dodatkowo: jeśli szukana data jest w przyszłości, upewniamy się że pokazujemy tylko przyszłe przejazdy
                # (to nie powinno zmienić wyniku, ale zapewnia spójność)
                if search_date < today:
                    logger.warning(f"Search date {search_date} is in the past! Showing only future trips.")
                    queryset = queryset.filter(date__gte=today)
                    logger.info(f"After filtering out past trips: {queryset.count()}")
                    
            except ValueError as e:
                # Jeśli format daty jest nieprawidłowy, ignorujemy filtr daty
                logger.warning(f"Invalid date format: {trip_date}, error: {e}")
                pass
        else:
            # Jeśli nie podano daty, pokazujemy tylko przyszłe przejazdy (włącznie z dzisiaj)
            queryset = queryset.filter(date__gte=today)
            logger.info(f"No date provided, showing only future trips (>= {today}): {queryset.count()}")
        
        # Filtrujemy tylko przejazdy z dostępnymi miejscami
        before_seats_filter = queryset.count()
        queryset = queryset.filter(available_seats__gt=0)
        after_seats_filter = queryset.count()
        logger.info(f"After available_seats filter (> 0): {before_seats_filter} -> {after_seats_filter}")
        
        final_count = queryset.count()
        logger.info(
            f"Trip search completed: {final_count} trips found for user {self.request.user.username} "
            f"(excluding user's own trips)"
        )
        
        # Logujemy znalezione przejazdy
        if final_count > 0:
            logger.info("Found trips:")
            for trip in queryset[:5]:  # Loguj max 5 pierwszych
                logger.info(
                    f"  - Trip ID: {trip.id}, Route: {trip.start_location} → {trip.end_location}, "
                    f"Date: {trip.date}, Seats: {trip.available_seats}"
                )
        else:
            logger.warning("No trips found matching search criteria!")
        
        return queryset.order_by('date', 'time')
