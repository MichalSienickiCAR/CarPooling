from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip, Booking, UserProfile, FavoriteRoute, TripTemplate, Notification, Wallet, Transaction, Wallet, Transaction


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    class Meta:
        model = UserProfile
        fields = ['username', 'first_name', 'last_name', 'email', 'phone_number', 'avatar', 'preferred_role', 'notifications_enabled']
        read_only_fields = ['created_at', 'updated_at']

    def update(self, instance, validated_data):
        # Wyciągamy dane dla modelu User (są w kluczu 'user' bo source='user.xyz')
        user_data = validated_data.pop('user', {})
        
        # Aktualizacja User
        user = instance.user
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()
        
        # Aktualizacja UserProfile (reszta pól)
        return super().update(instance, validated_data)


class DriverProfileSerializer(serializers.Serializer):
    """Prosty serializer do wyświetlania danych kierowcy przy przejeździe"""
    username = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    phone_number = serializers.CharField(read_only=True)
    
    def get_username(self, obj):
        """Pobiera username z powiązanego User"""
        if hasattr(obj, 'user'):
            return obj.user.username
        return None
    
    def get_first_name(self, obj):
        """Pobiera first_name z powiązanego User"""
        if hasattr(obj, 'user') and obj.user:
            return obj.user.first_name or None
        return None
    
    def get_last_name(self, obj):
        """Pobiera last_name z powiązanego User"""
        if hasattr(obj, 'user') and obj.user:
            return obj.user.last_name or None
        return None
    
    def get_avatar(self, obj):
        """Pobiera URL avatara"""
        if hasattr(obj, 'avatar') and obj.avatar:
            try:
                return obj.avatar.url
            except:
                return None
        return None


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    preferred_role = serializers.CharField(write_only=True, required=False)
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'preferred_role', 'profile']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        preferred_role = validated_data.pop('preferred_role', 'both')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Ustawiamy preferowaną rolę w profilu
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.preferred_role = preferred_role
        profile.save()
        return user


class BookingSerializer(serializers.ModelSerializer):
    passenger_username = serializers.ReadOnlyField(source='passenger.username')
    trip_details = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'passenger', 'passenger_username', 'seats', 'status', 'created_at', 'trip_details']
        read_only_fields = ['id', 'created_at', 'passenger_username', 'trip_details']
    
    def get_trip_details(self, obj):
        """Zwraca szczegóły przejazdu dla rezerwacji"""
        trip = obj.trip
        driver_profile = None
        try:
            profile = trip.driver.profile
            driver_profile = {
                'username': trip.driver.username,
                'first_name': trip.driver.first_name if trip.driver.first_name else None,
                'last_name': trip.driver.last_name if trip.driver.last_name else None,
                'avatar': profile.avatar.url if profile.avatar else None,
            }
        except UserProfile.DoesNotExist:
            driver_profile = {
                'username': trip.driver.username,
                'first_name': trip.driver.first_name if trip.driver.first_name else None,
                'last_name': trip.driver.last_name if trip.driver.last_name else None,
                'avatar': None,
            }
        
        return {
            'id': trip.id,
            'start_location': trip.start_location,
            'end_location': trip.end_location,
            'date': trip.date,
            'time': str(trip.time) if trip.time else None,
            'price_per_seat': str(trip.price_per_seat),
            'driver_username': trip.driver.username,
            'driver_profile': driver_profile,
        }


class TripSerializer(serializers.ModelSerializer):
    driver_username = serializers.ReadOnlyField(source='driver.username')
    driver_profile = DriverProfileSerializer(source='driver.profile', read_only=True)
    bookings = BookingSerializer(many=True, read_only=True)
    intermediate_stops = serializers.JSONField(default=list, required=False)

    class Meta:
        model = Trip
        fields = [
            'id', 'driver', 'driver_username', 'driver_profile', 'start_location', 'end_location',
            'intermediate_stops', 'date', 'time', 'available_seats',
            'price_per_seat', 'created_at', 'updated_at', 'bookings'
        ]
        read_only_fields = ['id', 'driver', 'created_at', 'updated_at', 'bookings', 'driver_profile']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Upewniamy się, że intermediate_stops jest zawsze listą
        if data.get('intermediate_stops') is None:
            data['intermediate_stops'] = []
        return data
    
    def create(self, validated_data):
        # Kierowca jest ustawiany w perform_create w views.py
        # Upewniamy się, że intermediate_stops jest listą
        if 'intermediate_stops' not in validated_data or validated_data['intermediate_stops'] is None:
            validated_data['intermediate_stops'] = []
        return super().create(validated_data)


class FavoriteRouteSerializer(serializers.ModelSerializer):
    """Serializer dla ulubionych tras użytkownika"""
    
    class Meta:
        model = FavoriteRoute
        fields = ['id', 'start_location', 'end_location', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Walidacja - upewniamy się, że start_location i end_location są różne"""
        if data.get('start_location') == data.get('end_location'):
            raise serializers.ValidationError(
                {'end_location': 'Punkt docelowy musi być różny od punktu początkowego.'}
            )
        return data


class TripTemplateSerializer(serializers.ModelSerializer):
    """Serializer dla szablonów przejazdów kierowcy"""
    intermediate_stops = serializers.JSONField(default=list, required=False)
    
    class Meta:
        model = TripTemplate
        fields = [
            'id', 'name', 'start_location', 'end_location', 'intermediate_stops',
            'time', 'available_seats', 'price_per_seat', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Upewniamy się, że intermediate_stops jest zawsze listą
        if data.get('intermediate_stops') is None:
            data['intermediate_stops'] = []
        return data
    
    def create(self, validated_data):
        # Upewniamy się, że intermediate_stops jest listą
        if 'intermediate_stops' not in validated_data or validated_data['intermediate_stops'] is None:
            validated_data['intermediate_stops'] = []
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer dla powiadomień"""
    trip_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'trip', 'trip_info', 'notification_type', 'message', 'read', 'created_at']
        read_only_fields = ['id', 'created_at', 'trip_info']
    
    def get_trip_info(self, obj):
        """Zwraca podstawowe informacje o przejeździe"""
        if obj.trip:
            return {
                'id': obj.trip.id,
                'start_location': obj.trip.start_location,
                'end_location': obj.trip.end_location,
                'date': obj.trip.date,
                'time': obj.trip.time,
                'price_per_seat': str(obj.trip.price_per_seat),
                'available_seats': obj.trip.available_seats,
            }
        return None


class WalletSerializer(serializers.ModelSerializer):
    """Serializer dla portfela użytkownika"""
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Wallet
        fields = ['id', 'user', 'username', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'username', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer dla transakcji"""
    username = serializers.ReadOnlyField(source='user.username')
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    trip_info = serializers.SerializerMethodField()
    booking_info = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'username', 'transaction_type', 'transaction_type_display',
            'amount', 'booking', 'booking_info', 'trip', 'trip_info',
            'description', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'username', 'transaction_type_display', 'created_at']
    
    def get_trip_info(self, obj):
        """Zwraca podstawowe informacje o przejeździe"""
        if obj.trip:
            return {
                'id': obj.trip.id,
                'start_location': obj.trip.start_location,
                'end_location': obj.trip.end_location,
                'date': obj.trip.date,
            }
        return None
    
    def get_booking_info(self, obj):
        """Zwraca podstawowe informacje o rezerwacji"""
        if obj.booking:
            return {
                'id': obj.booking.id,
                'seats': obj.booking.seats,
                'status': obj.booking.status,
            }
        return None