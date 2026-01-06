from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from datetime import date
import logging
from .serializers import UserSerializer, TripSerializer, BookingSerializer, UserProfileSerializer, FavoriteRouteSerializer, TripTemplateSerializer, NotificationSerializer
from .models import Trip, Booking, UserProfile, FavoriteRoute, TripTemplate, Notification

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
            # Filtrujemy przejazdy od wybranej daty wzwyż (nie tylko dokładnie w tym dniu)
            queryset = queryset.filter(date__gte=trip_date)
        
        # Filtrujemy tylko przejazdy z dostępnymi miejscami
        # Używamy prostszego filtru - sprawdzamy czy available_seats > 0
        # (rzeczywista dostępność jest sprawdzana w create_booking)
        queryset = queryset.filter(available_seats__gt=0)
        
        return queryset.order_by('date', 'time')

    def create(self, request, *args, **kwargs):
        """Override create to add better error handling"""
        logger.info(f"Creating trip for user {request.user.username}")
        logger.info(f"Request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                trip = serializer.save(driver=request.user)
                logger.info(
                    f"Trip created successfully: ID={trip.id}, Driver={request.user.username} (ID: {request.user.id}), "
                    f"Route={trip.start_location} → {trip.end_location}, "
                    f"Date={trip.date}, Seats={trip.available_seats}, Price={trip.price_per_seat}, "
                    f"Driver FK in DB: {trip.driver_id}"
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error saving trip: {str(e)}", exc_info=True)
                return Response(
                    {'detail': f'Błąd podczas zapisywania przejazdu: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Serializer validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    def create_booking(self, request, pk=None):
        """Tworzy rezerwację miejsca w przejeździe (pasażer)"""
        trip = self.get_object()
        
        # Sprawdź czy użytkownik nie jest kierowcą tego przejazdu
        if trip.driver == request.user:
            return Response(
                {'detail': 'Nie możesz zarezerwować miejsca w swoim własnym przejeździe.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Sprawdź czy użytkownik już ma rezerwację w tym przejeździe
        existing_booking = Booking.objects.filter(trip=trip, passenger=request.user).first()
        if existing_booking and existing_booking.status != 'cancelled':
            return Response(
                {'detail': 'Masz już rezerwację w tym przejeździe.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Pobierz liczbę miejsc z requestu (domyślnie 1)
        seats = request.data.get('seats', 1)
        try:
            seats = int(seats)
            if seats < 1:
                return Response(
                    {'detail': 'Liczba miejsc musi być większa od 0.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Nieprawidłowa liczba miejsc.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Sprawdź dostępność miejsc
        total_reserved = sum(b.seats for b in trip.bookings.filter(status__in=['reserved', 'accepted']))
        if total_reserved + seats > trip.available_seats:
            return Response(
                {'detail': f'Brak wystarczającej liczby miejsc. Dostępne: {trip.available_seats - total_reserved}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Sprawdź czy przejazd nie jest w przeszłości
        if trip.date < date.today():
            return Response(
                {'detail': 'Nie można zarezerwować miejsca w przejeździe z przeszłości.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Utwórz rezerwację
        if existing_booking and existing_booking.status == 'cancelled':
            # Jeśli była anulowana rezerwacja, zaktualizuj ją
            existing_booking.seats = seats
            existing_booking.status = 'reserved'
            existing_booking.save()
            booking = existing_booking
        else:
            booking = Booking.objects.create(
                trip=trip,
                passenger=request.user,
                seats=seats,
                status='reserved'
            )
        
        logger.info(
            f"Booking created: Trip ID={trip.id}, Passenger={request.user.username} (ID: {request.user.id}), "
            f"Seats={seats}, Status=reserved"
        )
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def accept_booking(self, request, pk=None):
        """Akceptuje rezerwację (tylko kierowca)"""
        trip = self.get_object()
        if trip.driver != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do akceptowania rezerwacji w tym przejeździe.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'detail': 'Brak ID rezerwacji.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(id=booking_id, trip=trip)
            if booking.status != 'reserved':
                return Response(
                    {'detail': 'Rezerwacja nie może być zaakceptowana (nieprawidłowy status).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Sprawdź czy są dostępne miejsca
            total_reserved = sum(b.seats for b in trip.bookings.filter(status='accepted'))
            if total_reserved + booking.seats > trip.available_seats:
                return Response(
                    {'detail': 'Brak wystarczającej liczby miejsc.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking.status = 'accepted'
            booking.save()
            
            logger.info(f"Booking {booking_id} accepted by driver {request.user.username}")
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Rezerwacja nie została znaleziona.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def reject_booking(self, request, pk=None):
        """Odrzuca rezerwację (tylko kierowca)"""
        trip = self.get_object()
        if trip.driver != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do odrzucania rezerwacji w tym przejeździe.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'detail': 'Brak ID rezerwacji.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(id=booking_id, trip=trip)
            if booking.status == 'cancelled':
                return Response(
                    {'detail': 'Rezerwacja jest już anulowana.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking.status = 'cancelled'
            booking.save()
            
            logger.info(f"Booking {booking_id} rejected by driver {request.user.username}")
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Rezerwacja nie została znaleziona.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        """Anuluje rezerwację (tylko pasażer - właściciel rezerwacji)"""
        trip = self.get_object()
        
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'detail': 'Brak ID rezerwacji.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(id=booking_id, trip=trip, passenger=request.user)
            
            # Sprawdź czy rezerwacja może być anulowana
            if booking.status == 'cancelled':
                return Response(
                    {'detail': 'Rezerwacja jest już anulowana.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking.status = 'cancelled'
            booking.save()
            
            logger.info(f"Booking {booking_id} cancelled by passenger {request.user.username}")
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Rezerwacja nie została znaleziona lub nie masz do niej uprawnień.'},
                status=status.HTTP_404_NOT_FOUND
            )

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
        try:
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
            logger.info(f"Serialized {len(serializer.data)} trips successfully")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in my_trips endpoint: {str(e)}", exc_info=True)
            return Response(
                {'detail': f'Błąd podczas pobierania przejazdów: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
                
                # Jeśli data jest w przeszłości, pokazujemy tylko przyszłe przejazdy
                if search_date < today:
                    logger.warning(f"Search date {search_date} is in the past! Showing only future trips.")
                    queryset = queryset.filter(date__gte=today)
                    logger.info(f"After filtering out past trips: {queryset.count()}")
                else:
                    # Jeśli data jest dzisiaj lub w przyszłości, pokazujemy przejazdy od tej daty wzwyż
                    # (nie dokładnie po dacie, ale >= data, żeby użytkownik widział wszystkie przyszłe przejazdy)
                    queryset = queryset.filter(date__gte=search_date)
                    logger.info(f"After date filter (>= {search_date}): {queryset.count()}")
                    
            except ValueError as e:
                # Jeśli format daty jest nieprawidłowy, ignorujemy filtr daty i pokazujemy tylko przyszłe
                logger.warning(f"Invalid date format: {trip_date}, error: {e}")
                queryset = queryset.filter(date__gte=today)
                logger.info(f"Invalid date format, showing only future trips (>= {today}): {queryset.count()}")
        else:
            # Jeśli nie podano daty, pokazujemy przejazdy na najbliższy miesiąc (od dzisiaj do miesiąc w przód)
            from datetime import timedelta
            month_from_now = today + timedelta(days=30)
            queryset = queryset.filter(date__gte=today, date__lte=month_from_now)
            logger.info(f"No date provided, showing trips for next month ({today} to {month_from_now}): {queryset.count()}")
        
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


class FavoriteRouteViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla ulubionych tras użytkownika.
    Użytkownik może tylko zarządzać swoimi własnymi ulubionymi trasami.
    """
    serializer_class = FavoriteRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Zwraca tylko ulubione trasy zalogowanego użytkownika"""
        return FavoriteRoute.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """Automatycznie przypisuje trasę do zalogowanego użytkownika"""
        route = serializer.save(user=self.request.user)
        logger.info(
            f"Favorite route created: User={self.request.user.username} (ID: {self.request.user.id}), "
            f"Route={route.start_location} → {route.end_location}"
        )
        return route


class TripTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla szablonów przejazdów kierowcy.
    Kierowca może tylko zarządzać swoimi własnymi szablonami.
    """
    serializer_class = TripTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Zwraca tylko szablony zalogowanego kierowcy"""
        return TripTemplate.objects.filter(driver=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        """Automatycznie przypisuje szablon do zalogowanego kierowcy"""
        template = serializer.save(driver=self.request.user)
        logger.info(
            f"Trip template created: Driver={self.request.user.username} (ID: {self.request.user.id}), "
            f"Template={template.name}, Route={template.start_location} → {template.end_location}"
        )
        return template
    
    @action(detail=True, methods=['post'])
    def create_trip(self, request, pk=None):
        """Tworzy przejazd na podstawie szablonu"""
        template = self.get_object()
        if template.driver != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do użycia tego szablonu.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Pobierz datę z requestu (wymagana)
        trip_date = request.data.get('date')
        if not trip_date:
            return Response(
                {'detail': 'Data jest wymagana do utworzenia przejazdu.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Utwórz przejazd na podstawie szablonu
        trip_data = {
            'start_location': template.start_location,
            'end_location': template.end_location,
            'intermediate_stops': template.intermediate_stops,
            'date': trip_date,
            'time': template.time or '08:00',  # Domyślna godzina jeśli nie ustawiona
            'available_seats': template.available_seats,
            'price_per_seat': template.price_per_seat,
        }
        
        trip_serializer = TripSerializer(data=trip_data)
        if trip_serializer.is_valid():
            trip = trip_serializer.save(driver=request.user)
            logger.info(
                f"Trip created from template: Template ID={template.id}, Trip ID={trip.id}, "
                f"Driver={request.user.username}"
            )
            return Response(trip_serializer.data, status=status.HTTP_201_CREATED)
            return Response(trip_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet dla powiadomień użytkownika.
    Tylko odczyt - powiadomienia są tworzone automatycznie przez system.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Zwraca tylko powiadomienia zalogowanego użytkownika"""
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Filtrowanie po statusie przeczytania
        read_filter = self.request.query_params.get('read', None)
        if read_filter is not None:
            read_bool = read_filter.lower() == 'true'
            queryset = queryset.filter(read=read_bool)
        
        return queryset.order_by('-created_at')


class MyBookingsView(generics.ListAPIView):
    """
    Widok do pobierania rezerwacji zalogowanego pasażera.
    Pokazuje wszystkie rezerwacje użytkownika z szczegółami przejazdów.
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Zwraca wszystkie rezerwacje zalogowanego użytkownika"""
        queryset = Booking.objects.filter(passenger=self.request.user)
        
        # Filtrowanie po statusie (opcjonalne)
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrowanie po dacie przejazdu (opcjonalne)
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(trip__date=date_filter)
        
        # Domyślnie sortujemy po dacie przejazdu (najbliższe najpierw)
        return queryset.order_by('trip__date', 'trip__time')
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Oznacza powiadomienie jako przeczytane"""
        notification = self.get_object()
        if notification.user != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do tego powiadomienia.'},
                status=status.HTTP_403_FORBIDDEN
            )
        notification.read = True
        notification.save()
        return Response({'status': 'Powiadomienie oznaczone jako przeczytane'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Oznacza wszystkie powiadomienia użytkownika jako przeczytane"""
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'status': 'Wszystkie powiadomienia oznaczone jako przeczytane'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Zwraca liczbę nieprzeczytanych powiadomień"""
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({'count': count})
