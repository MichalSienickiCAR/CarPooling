from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from datetime import date, datetime, timedelta
import logging
from decimal import Decimal
from .serializers import UserSerializer, TripSerializer, BookingSerializer, UserProfileSerializer, FavoriteRouteSerializer, TripTemplateSerializer, NotificationSerializer, WalletSerializer, TransactionSerializer, MessageSerializer, ReviewSerializer, FriendshipSerializer, TrustedUserSerializer, ReportSerializer
from .models import Trip, Booking, UserProfile, FavoriteRoute, TripTemplate, Notification, Wallet, Transaction, Message, Review, Friendship, TrustedUser, Report

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
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def patch(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.username} updated profile.")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Użytkownik nie istnieje.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile_data = UserProfileSerializer(profile).data
        
        from django.db.models import Avg, Count
        reviews_data = Review.objects.filter(reviewed_user=user).aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id')
        )
        
        trips_as_driver = Trip.objects.filter(driver=user).count()
        trips_as_passenger = Booking.objects.filter(
            passenger=user,
            status__in=['accepted', 'paid']
        ).count()
        
        recent_reviews = Review.objects.filter(reviewed_user=user).order_by('-created_at')[:5]
        reviews_list = []
        for review in recent_reviews:
            reviews_list.append({
                'id': review.id,
                'reviewer_username': review.reviewer.username,
                'rating': review.rating,
                'comment': review.comment,
                'created_at': review.created_at.isoformat(),
                'trip_route': f"{review.trip.start_location} → {review.trip.end_location}",
            })
        
        return Response({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'profile': profile_data,
            'statistics': {
                'average_rating': round(reviews_data['average_rating'] or 0, 2),
                'total_reviews': reviews_data['total_reviews'] or 0,
                'trips_as_driver': trips_as_driver,
                'trips_as_passenger': trips_as_passenger,
                'total_trips': trips_as_driver + trips_as_passenger,
            },
            'recent_reviews': reviews_list,
        })


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Trip.objects.filter(date__gte=date.today())
        start_location = self.request.query_params.get('start_location', None)
        end_location = self.request.query_params.get('end_location', None)
        trip_date = self.request.query_params.get('date', None)
        
        if start_location:
            queryset = queryset.filter(start_location__icontains=start_location)
        
        if end_location:
            queryset = queryset.filter(end_location__icontains=end_location)
        
        if trip_date:
            queryset = queryset.filter(date__gte=trip_date)
        
        queryset = queryset.filter(available_seats__gt=0)
        
        return queryset.order_by('date', 'time')

    def create(self, request, *args, **kwargs):
        # Sprawdź czy użytkownik ma rolę kierowcy
        try:
            user_profile = request.user.profile
            if user_profile.preferred_role != 'driver':
                logger.warning(
                    f"User {request.user.username} (role: {user_profile.preferred_role}) "
                    f"attempted to create a trip but is not a driver"
                )
                return Response(
                    {'detail': 'Tylko użytkownicy z rolą kierowcy mogą dodawać przejazdy.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except UserProfile.DoesNotExist:
            logger.error(f"User {request.user.username} has no profile")
            return Response(
                {'detail': 'Profil użytkownika nie istnieje.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        # Sprawdź czy użytkownik ma rolę pasażera
        try:
            user_profile = request.user.profile
            if user_profile.preferred_role != 'passenger':
                logger.warning(
                    f"User {request.user.username} (role: {user_profile.preferred_role}) "
                    f"attempted to create a booking but is not a passenger"
                )
                return Response(
                    {'detail': 'Tylko użytkownicy z rolą pasażera mogą rezerwować miejsca.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except UserProfile.DoesNotExist:
            logger.error(f"User {request.user.username} has no profile")
            return Response(
                {'detail': 'Profil użytkownika nie istnieje.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trip = self.get_object()
        if trip.driver == request.user:
            return Response(
                {'detail': 'Nie możesz zarezerwować miejsca w swoim własnym przejeździe.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        existing_booking = Booking.objects.filter(trip=trip, passenger=request.user).first()
        if existing_booking and existing_booking.status != 'cancelled':
            return Response(
                {'detail': 'Masz już rezerwację w tym przejeździe.'},
                status=status.HTTP_400_BAD_REQUEST
            )
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
        total_reserved = sum(b.seats for b in trip.bookings.filter(status__in=['reserved', 'accepted']))
        if total_reserved + seats > trip.available_seats:
            return Response(
                {'detail': f'Brak wystarczającej liczby miejsc. Dostępne: {trip.available_seats - total_reserved}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if trip.date < date.today():
            return Response(
                {'detail': 'Nie można zarezerwować miejsca w przejeździe z przeszłości.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if existing_booking and existing_booking.status == 'cancelled':
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
        trip = self.get_object()
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'detail': 'Brak ID rezerwacji.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            booking = Booking.objects.get(id=booking_id, trip=trip, passenger=request.user)
            if booking.status == 'cancelled':
                return Response(
                    {'detail': 'Rezerwacja jest już anulowana.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if booking.status == 'paid':
                wallet, _ = Wallet.objects.get_or_create(user=request.user)
                total_amount = booking.seats * trip.price_per_seat
                wallet.balance += total_amount
                wallet.save()
                Transaction.objects.create(
                    user=request.user,
                    transaction_type='refund',
                    amount=total_amount,
                    booking=booking,
                    trip=trip,
                    description=f'Zwrot za anulowaną rezerwację: {trip.start_location} → {trip.end_location}'
                )
                logger.info(f"Refund for cancelled booking {booking_id}: {total_amount} zł")
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
    def pay_booking(self, request, pk=None):
        trip = self.get_object()
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response(
                {'detail': 'Brak ID rezerwacji.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            booking = Booking.objects.get(id=booking_id, trip=trip, passenger=request.user)
            if booking.status != 'accepted':
                return Response(
                    {'detail': 'Można płacić tylko za zaakceptowane rezerwacje.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if booking.status == 'paid':
                return Response(
                    {'detail': 'Rezerwacja jest już opłacona.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            trip_datetime = datetime.combine(trip.date, trip.time or datetime.min.time())
            time_until_trip = trip_datetime - datetime.now()
            hours_until_trip = time_until_trip.total_seconds() / 3600
            if hours_until_trip < 10:
                return Response(
                    {'detail': f'Płatność możliwa tylko do 10 godzin przed przejazdem. Pozostało {hours_until_trip:.1f} godzin.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            total_amount = booking.seats * trip.price_per_seat
            if wallet.balance < total_amount:
                return Response(
                    {'detail': f'Niewystarczające środki w portfelu. Wymagane: {total_amount} zł, dostępne: {wallet.balance} zł.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            wallet.balance -= total_amount
            wallet.save()
            booking.status = 'paid'
            booking.paid_at = datetime.now()
            booking.save()
            Transaction.objects.create(
                user=request.user,
                transaction_type='payment',
                amount=total_amount,
                booking=booking,
                trip=trip,
                description=f'Płatność za przejazd: {trip.start_location} → {trip.end_location} ({booking.seats} miejsc)'
            )
            logger.info(f"Payment for booking {booking_id}: {total_amount} zł by {request.user.username}")
            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Rezerwacja nie została znaleziona lub nie masz do niej uprawnień.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
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

    @action(detail=True, methods=['post'])
    def complete_trip(self, request, pk=None):
        trip = self.get_object()
        if trip.driver != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do zakończenia tego przejazdu.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if trip.date > date.today():
            return Response(
                {'detail': 'Nie można zakończyć przejazdu, który jeszcze się nie odbył.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if trip.completed:
            return Response(
                {'detail': 'Ten przejazd jest już oznaczony jako zakończony.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        paid_bookings = trip.bookings.filter(status='paid')
        total_driver_amount = Decimal('0')
        if paid_bookings.exists():
            PLATFORM_FEE = Decimal('0.05')
            driver_wallet, _ = Wallet.objects.get_or_create(user=trip.driver)
            for booking in paid_bookings:
                total_payment = booking.seats * trip.price_per_seat
                driver_amount = total_payment * (1 - PLATFORM_FEE)
                driver_wallet.balance += driver_amount
                total_driver_amount += driver_amount
                Transaction.objects.create(
                    user=trip.driver,
                    transaction_type='driver_payment',
                    amount=driver_amount,
                    booking=booking,
                    trip=trip,
                    description=f'Wypłata za przejazd: {trip.start_location} → {trip.end_location} ({booking.seats} miejsc, prowizja 5%)'
                )
            driver_wallet.save()
        trip.completed = True
        trip.completed_at = timezone.now()
        trip.save()
        logger.info(
            f"Trip {trip.id} completed: Driver {trip.driver.username} "
            f"{f'received {total_driver_amount} zł (from {paid_bookings.count()} paid bookings)' if paid_bookings.exists() else 'no paid bookings'}"
        )
        if paid_bookings.exists():
            return Response({
                'detail': f'Przejazd zakończony. Wypłacono {total_driver_amount} zł do portfela kierowcy.',
                'amount': str(total_driver_amount),
                'bookings_count': paid_bookings.count()
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'detail': 'Przejazd oznaczony jako zakończony. Brak opłaconych rezerwacji do wypłaty.',
                'amount': '0',
                'bookings_count': 0
            }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def my_trips(self, request):
        try:
            trips = Trip.objects.filter(driver=request.user).order_by('-date', '-time')
            logger.info(
                f"Driver {request.user.username} (ID: {request.user.id}) viewed their trips: "
                f"{trips.count()} trips found"
            )
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
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Trip.objects.exclude(driver=self.request.user)
        start_location = self.request.query_params.get('start_location', None)
        end_location = self.request.query_params.get('end_location', None)
        trip_date = self.request.query_params.get('date', None)
        logger.info(
            f"Trip search initiated by {self.request.user.username} (ID: {self.request.user.id}): "
            f"start_location={start_location}, end_location={end_location}, date={trip_date}"
        )
        initial_count = queryset.count()
        if start_location and start_location.strip():
            queryset = queryset.filter(start_location__icontains=start_location.strip())
        if end_location and end_location.strip():
            queryset = queryset.filter(end_location__icontains=end_location.strip())
        today = date.today()
        if trip_date and trip_date.strip():
            try:
                from datetime import datetime
                search_date = datetime.strptime(trip_date.strip(), '%Y-%m-%d').date()
                if search_date < today:
                    queryset = queryset.filter(date__gte=today)
                else:
                    queryset = queryset.filter(date__gte=search_date)
            except ValueError:
                queryset = queryset.filter(date__gte=today)
        else:
            from datetime import timedelta
            month_from_now = today + timedelta(days=30)
            queryset = queryset.filter(date__gte=today, date__lte=month_from_now)
        queryset = queryset.filter(available_seats__gt=0)
        return queryset.order_by('date', 'time')


class FavoriteRouteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteRouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteRoute.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        route = serializer.save(user=self.request.user)
        logger.info(
            f"Favorite route created: User={self.request.user.username} (ID: {self.request.user.id}), "
            f"Route={route.start_location} → {route.end_location}"
        )
        return route


class TripTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TripTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TripTemplate.objects.filter(driver=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        template = serializer.save(driver=self.request.user)
        logger.info(
            f"Trip template created: Driver={self.request.user.username} (ID: {self.request.user.id}), "
            f"Template={template.name}, Route={template.start_location} → {template.end_location}"
        )
        return template
    
    @action(detail=True, methods=['post'])
    def create_trip(self, request, pk=None):
        template = self.get_object()
        if template.driver != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do użycia tego szablonu.'},
                status=status.HTTP_403_FORBIDDEN
            )
        trip_date = request.data.get('date')
        if not trip_date:
            return Response(
                {'detail': 'Data jest wymagana do utworzenia przejazdu.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        trip_data = {
            'start_location': template.start_location,
            'end_location': template.end_location,
            'intermediate_stops': template.intermediate_stops,
            'date': trip_date,
            'time': template.time or '08:00',
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
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        read_filter = self.request.query_params.get('read', None)
        if read_filter is not None:
            read_bool = read_filter.lower() == 'true'
            queryset = queryset.filter(read=read_bool)
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
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
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'status': 'Wszystkie powiadomienia oznaczone jako przeczytane'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({'count': count})


class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Booking.objects.filter(passenger=self.request.user)
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(trip__date=date_filter)
        return queryset.order_by('trip__date', 'trip__time')


class WalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        data = serializer.data
        pending_amount = Decimal('0')
        trips_with_pending = []
        driver_trips = Trip.objects.filter(
            driver=request.user,
            date__gte=date.today()
        ).prefetch_related('bookings')
        for trip in driver_trips:
            paid_bookings = trip.bookings.filter(status='paid')
            if paid_bookings.exists():
                trip_total = sum(booking.seats * trip.price_per_seat for booking in paid_bookings)
                driver_amount = trip_total * Decimal('0.95')
                pending_amount += driver_amount
                trips_with_pending.append({
                    'trip_id': trip.id,
                    'route': f"{trip.start_location} → {trip.end_location}",
                    'date': trip.date.isoformat(),
                    'amount': str(driver_amount),
                    'bookings_count': paid_bookings.count()
                })
        data['pending_amount'] = str(pending_amount)
        data['pending_trips'] = trips_with_pending
        return Response(data)
    
    def post(self, request):
        try:
            amount = request.data.get('amount')
            logger.info(f"Wallet deposit request from {request.user.username}: amount={amount}, data={request.data}")
            if not amount:
                return Response({'detail': 'Brak kwoty do wpłaty.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                amount = Decimal(str(amount))
                if amount <= 0:
                    return Response({'detail': 'Kwota musi być większa od 0.'}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError) as e:
                return Response({'detail': 'Nieprawidłowa kwota.'}, status=status.HTTP_400_BAD_REQUEST)
            wallet, created = Wallet.objects.get_or_create(user=request.user)
            old_balance = wallet.balance
            wallet.balance += amount
            wallet.save()
            Transaction.objects.create(
                user=request.user,
                transaction_type='deposit',
                amount=amount,
                description=f'Wpłata przez BLIK (symulacja) - {amount} zł'
            )
            serializer = WalletSerializer(wallet)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'Błąd podczas wpłaty: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        return queryset.order_by('-created_at')


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        user = self.request.user
        booking_id = self.request.query_params.get('booking', None)
        
        if booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
                if booking.trip.driver != user and booking.passenger != user:
                    return Message.objects.none()
                if booking.status not in ['accepted', 'paid']:
                    return Message.objects.none()
                return Message.objects.filter(booking=booking).order_by('created_at')
            except Booking.DoesNotExist:
                return Message.objects.none()
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        booking_id = self.request.data.get('booking')
        if not booking_id:
            raise serializers.ValidationError({'booking': 'Rezerwacja jest wymagana.'})
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            raise serializers.ValidationError({'booking': 'Rezerwacja nie istnieje.'})
        user = self.request.user
        if booking.trip.driver != user and booking.passenger != user:
            raise serializers.ValidationError({'detail': 'Nie masz uprawnień do wysyłania wiadomości w tej rezerwacji.'})
        if booking.status not in ['accepted', 'paid']:
            raise serializers.ValidationError({'detail': 'Możesz wysyłać wiadomości tylko dla zaakceptowanych rezerwacji.'})
        recipient = booking.passenger if booking.trip.driver == user else booking.trip.driver
        serializer.save(
            sender=user,
            recipient=recipient,
            booking=booking
        )
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        if message.recipient != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do oznaczania tej wiadomości jako przeczytanej.'},
                status=status.HTTP_403_FORBIDDEN
            )
        message.read = True
        message.save()
        return Response({'status': 'Wiadomość oznaczona jako przeczytana'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        booking_id = request.data.get('booking')
        if not booking_id:
            return Response(
                {'detail': 'ID rezerwacji jest wymagane.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Rezerwacja nie istnieje.'},
                status=status.HTTP_404_NOT_FOUND
            )
        if booking.trip.driver != request.user and booking.passenger != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do tej rezerwacji.'},
                status=status.HTTP_403_FORBIDDEN
            )
        updated = Message.objects.filter(
            booking=booking,
            recipient=request.user,
            read=False
        ).update(read=True)
        return Response({'status': f'Oznaczono {updated} wiadomości jako przeczytane'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        booking_id = self.request.query_params.get('booking', None)
        if booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
                if booking.trip.driver != request.user and booking.passenger != request.user:
                    return Response({'count': 0})
                count = Message.objects.filter(
                    booking=booking,
                    recipient=request.user,
                    read=False
                ).count()
            except Booking.DoesNotExist:
                return Response({'count': 0})
        else:
            count = Message.objects.filter(
                recipient=request.user,
                read=False
            ).count()
        return Response({'count': count})


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        user = self.request.user
        trip_id = self.request.query_params.get('trip', None)
        reviewed_user_id = self.request.query_params.get('reviewed_user', None)
        queryset = Review.objects.all()
        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        if reviewed_user_id:
            queryset = queryset.filter(reviewed_user_id=reviewed_user_id)
        reviewer_filter = self.request.query_params.get('as_reviewer', None)
        if reviewer_filter == 'true':
            queryset = queryset.filter(reviewer=user)
        else:
            queryset = queryset.filter(reviewed_user=user)
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        reviews = Review.objects.filter(reviewer=request.user).order_by('-created_at')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def received_reviews(self, request):
        reviews = Review.objects.filter(reviewed_user=request.user).order_by('-created_at')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


class FriendshipViewSet(viewsets.ModelViewSet):
    """ViewSet do zarządzania znajomościami"""
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        user = self.request.user
        status_filter = self.request.query_params.get('status', None)
        
        # Znajomości gdzie użytkownik jest requester lub receiver
        queryset = Friendship.objects.filter(
            Q(requester=user) | Q(receiver=user)
        )
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Wysyłanie zaproszenia do znajomych"""
        serializer.save(requester=self.request.user)
        logger.info(f"User {self.request.user.username} sent friend request")
    
    @action(detail=False, methods=['get'])
    def my_friends(self, request):
        """Lista zaakceptowanych znajomych"""
        friendships = Friendship.objects.filter(
            Q(requester=request.user) | Q(receiver=request.user),
            status='accepted'
        )
        serializer = self.get_serializer(friendships, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_requests(self, request):
        """Oczekujące zaproszenia (otrzymane)"""
        friendships = Friendship.objects.filter(
            receiver=request.user,
            status='pending'
        )
        serializer = self.get_serializer(friendships, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sent_requests(self, request):
        """Wysłane zaproszenia"""
        friendships = Friendship.objects.filter(
            requester=request.user,
            status='pending'
        )
        serializer = self.get_serializer(friendships, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Akceptacja zaproszenia do znajomych"""
        friendship = self.get_object()
        
        if friendship.receiver != request.user:
            return Response(
                {'detail': 'Możesz akceptować tylko zaproszenia skierowane do Ciebie.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if friendship.status != 'pending':
            return Response(
                {'detail': 'To zaproszenie nie oczekuje na akceptację.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        friendship.status = 'accepted'
        friendship.save()
        
        logger.info(f"User {request.user.username} accepted friend request from {friendship.requester.username}")
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Odrzucenie zaproszenia do znajomych"""
        friendship = self.get_object()
        
        if friendship.receiver != request.user:
            return Response(
                {'detail': 'Możesz odrzucać tylko zaproszenia skierowane do Ciebie.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if friendship.status != 'pending':
            return Response(
                {'detail': 'To zaproszenie nie oczekuje na odpowiedź.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        friendship.status = 'rejected'
        friendship.save()
        
        logger.info(f"User {request.user.username} rejected friend request from {friendship.requester.username}")
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        """Zablokowanie użytkownika"""
        friendship = self.get_object()
        
        if friendship.receiver != request.user and friendship.requester != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do tej akcji.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        friendship.status = 'blocked'
        friendship.save()
        
        logger.info(f"User {request.user.username} blocked user")
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def search_users(self, request):
        """Wyszukiwanie użytkowników do dodania jako znajomi"""
        query = request.data.get('query', '').strip()
        
        if not query or len(query) < 2:
            return Response(
                {'detail': 'Zapytanie musi zawierać co najmniej 2 znaki.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Wyszukaj użytkowników
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:20]
        
        # Sprawdź status znajomości dla każdego użytkownika
        results = []
        for user in users:
            friendship = Friendship.objects.filter(
                Q(requester=request.user, receiver=user) |
                Q(requester=user, receiver=request.user)
            ).first()
            
            try:
                profile = user.profile
                avatar_url = profile.avatar.url if profile.avatar else None
            except:
                avatar_url = None
            
            results.append({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name or None,
                'last_name': user.last_name or None,
                'avatar': avatar_url,
                'friendship_status': friendship.status if friendship else None,
                'friendship_id': friendship.id if friendship else None,
            })
        
        return Response(results)


class TrustedUserViewSet(viewsets.ModelViewSet):
    """ViewSet do zarządzania zaufanymi użytkownikami"""
    serializer_class = TrustedUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        return TrustedUser.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Dodawanie użytkownika do zaufanych"""
        serializer.save(user=self.request.user)
        logger.info(f"User {self.request.user.username} marked user as trusted")
    
    @action(detail=False, methods=['get'])
    def my_trusted(self, request):
        """Lista moich zaufanych użytkowników"""
        trusted = self.get_queryset()
        serializer = self.get_serializer(trusted, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def check_trusted(self, request):
        """Sprawdź czy użytkownik jest zaufany"""
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'detail': 'user_id jest wymagane.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_trusted = TrustedUser.objects.filter(
            user=request.user,
            trusted_user_id=user_id
        ).exists()
        
        return Response({'is_trusted': is_trusted})


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet do zarządzania zgłoszeniami"""
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        user = self.request.user
        
        # Użytkownik widzi tylko swoje zgłoszenia
        # (Admini mogą widzieć wszystkie - można dodać później)
        queryset = Report.objects.filter(reporter=user)
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Tworzenie nowego zgłoszenia"""
        serializer.save(reporter=self.request.user)
        logger.info(f"User {self.request.user.username} created a report")
    
    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        """Moje zgłoszenia"""
        reports = self.get_queryset()
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statystyki zgłoszeń"""
        reports = self.get_queryset()
        
        stats = {
            'total': reports.count(),
            'pending': reports.filter(status='pending').count(),
            'under_review': reports.filter(status='under_review').count(),
            'resolved': reports.filter(status='resolved').count(),
            'dismissed': reports.filter(status='dismissed').count(),
        }
        
        return Response(stats)
