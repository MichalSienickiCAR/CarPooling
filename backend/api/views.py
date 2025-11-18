from django.contrib.auth.models import User
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import date
from .serializers import UserSerializer, TripSerializer, BookingSerializer
from .models import Trip, Booking


class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Jeśli to akcja 'my_trips', zwróć tylko przejazdy zalogowanego kierowcy
        if self.action == 'my_trips':
            return Trip.objects.filter(driver=self.request.user).order_by('-date', '-time')
        
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
        serializer.save(driver=self.request.user)

    @action(detail=True, methods=['get'])
    def passengers(self, request, pk=None):
        """Zwraca listę pasażerów dla danego przejazdu"""
        trip = self.get_object()
        if trip.driver != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do przeglądania pasażerów tego przejazdu.'},
                status=status.HTTP_403_FORBIDDEN
            )
        bookings = trip.bookings.all()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Anuluje przejazd (tylko kierowca)"""
        trip = self.get_object()
        if trip.driver != request.user:
            return Response(
                {'detail': 'Nie masz uprawnień do anulowania tego przejazdu.'},
                status=status.HTTP_403_FORBIDDEN
            )
        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def my_trips(self, request):
        """Zwraca wszystkie przejazdy zalogowanego kierowcy"""
        trips = Trip.objects.filter(driver=request.user).order_by('-date', '-time')
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)


class TripSearchView(generics.ListAPIView):
    """
    Widok do wyszukiwania przejazdów dla pasażerów.
    Filtruje po miejscu startu, celu i dacie.
    """
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Zaczynamy od wszystkich przejazdów (bez filtrowania po dacie na początku)
        queryset = Trip.objects.all()
        
        start_location = self.request.query_params.get('start_location', None)
        end_location = self.request.query_params.get('end_location', None)
        trip_date = self.request.query_params.get('date', None)
        
        # Debug - logowanie parametrów
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Search params: start={start_location}, end={end_location}, date={trip_date}")
        logger.info(f"Initial queryset count (all trips): {queryset.count()}")
        
        # Filtrowanie po lokalizacji - case insensitive, częściowe dopasowanie
        if start_location and start_location.strip():
            queryset = queryset.filter(start_location__icontains=start_location.strip())
            logger.info(f"After start_location filter: {queryset.count()}")
        
        if end_location and end_location.strip():
            queryset = queryset.filter(end_location__icontains=end_location.strip())
            logger.info(f"After end_location filter: {queryset.count()}")
        
        # Filtrowanie po dacie - dokładne dopasowanie
        if trip_date and trip_date.strip():
            try:
                from datetime import datetime
                search_date = datetime.strptime(trip_date.strip(), '%Y-%m-%d').date()
                queryset = queryset.filter(date=search_date)
                logger.info(f"After date filter ({search_date}): {queryset.count()}")
            except ValueError:
                # Jeśli format daty jest nieprawidłowy, ignorujemy filtr daty
                logger.warning(f"Invalid date format: {trip_date}")
                pass
        else:
            # Jeśli nie podano daty, pokazujemy tylko przyszłe przejazdy
            queryset = queryset.filter(date__gte=date.today())
            logger.info(f"After future date filter: {queryset.count()}")
        
        # Filtrujemy tylko przejazdy z dostępnymi miejscami
        queryset = queryset.filter(available_seats__gt=0)
        logger.info(f"After available_seats filter: {queryset.count()}")
        
        return queryset.order_by('date', 'time')
