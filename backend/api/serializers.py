from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip, Booking, UserProfile, FavoriteRoute, TripTemplate, Notification, Wallet, Transaction, Message, Review, Friendship, TrustedUser, Report, RecurringTrip, Waitlist


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
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()
        return super().update(instance, validated_data)


class DriverProfileSerializer(serializers.Serializer):
    username = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    phone_number = serializers.CharField(read_only=True)
    
    def get_username(self, obj):
        if hasattr(obj, 'user'):
            return obj.user.username
        return None
    
    def get_first_name(self, obj):
        if hasattr(obj, 'user') and obj.user:
            return obj.user.first_name or None
        return None
    
    def get_last_name(self, obj):
        if hasattr(obj, 'user') and obj.user:
            return obj.user.last_name or None
        return None
    
    def get_avatar(self, obj):
        if hasattr(obj, 'avatar') and obj.avatar:
            try:
                return obj.avatar.url
            except:
                return None
        return None


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    preferred_role = serializers.CharField(write_only=True, required=True)
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'preferred_role', 'profile']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_preferred_role(self, value):
        """Walidacja roli - tylko driver lub passenger"""
        if value not in ['driver', 'passenger']:
            raise serializers.ValidationError("Rola musi być 'driver' lub 'passenger'")
        return value

    def create(self, validated_data):
        preferred_role = validated_data.pop('preferred_role')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.preferred_role = preferred_role
        profile.save()
        return user


class BookingSerializer(serializers.ModelSerializer):
    passenger_username = serializers.ReadOnlyField(source='passenger.username')
    trip_details = serializers.SerializerMethodField()
    trip_start_location = serializers.ReadOnlyField(source='trip.start_location')
    trip_end_location = serializers.ReadOnlyField(source='trip.end_location')
    trip_date = serializers.ReadOnlyField(source='trip.date')
    trip_time = serializers.SerializerMethodField()
    trip_price_per_seat = serializers.ReadOnlyField(source='trip.price_per_seat')
    driver_username = serializers.ReadOnlyField(source='trip.driver.username')
    paid_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'passenger', 'passenger_username', 'seats', 'status', 
            'paid_at', 'created_at', 'trip_details', 
            'trip_start_location', 'trip_end_location', 'trip_date', 
            'trip_time', 'trip_price_per_seat', 'driver_username'
        ]
        read_only_fields = [
            'id', 'created_at', 'passenger_username', 'trip_details',
            'trip_start_location', 'trip_end_location', 'trip_date',
            'trip_time', 'trip_price_per_seat', 'driver_username', 'paid_at'
        ]
    
    def get_trip_time(self, obj):
        return str(obj.trip.time) if obj.trip.time else None
    
    def get_trip_details(self, obj):
        trip = obj.trip
        driver_profile = None
        try:
            profile = trip.driver.profile
            driver_profile = {
                'id': trip.driver.id,
                'username': trip.driver.username,
                'first_name': trip.driver.first_name if trip.driver.first_name else None,
                'last_name': trip.driver.last_name if trip.driver.last_name else None,
                'avatar': profile.avatar.url if profile.avatar else None,
            }
        except UserProfile.DoesNotExist:
            driver_profile = {
                'id': trip.driver.id,
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
    driver_average_rating = serializers.SerializerMethodField()
    driver_review_count = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'driver', 'driver_username', 'driver_profile', 'start_location', 'end_location',
            'intermediate_stops', 'date', 'time', 'available_seats',
            'price_per_seat', 'estimated_duration_minutes', 'luggage_ok',
            'completed', 'completed_at', 'created_at', 'updated_at', 'bookings',
            'driver_average_rating', 'driver_review_count'
        ]
        read_only_fields = ['id', 'driver', 'created_at', 'updated_at', 'bookings', 'driver_profile', 'completed', 'completed_at', 'driver_average_rating', 'driver_review_count']
    
    def get_driver_average_rating(self, obj):
        from django.db.models import Avg
        from .models import Review
        avg_rating = Review.objects.filter(reviewed_user=obj.driver).aggregate(
            average_rating=Avg('rating')
        )['average_rating']
        return round(avg_rating, 2) if avg_rating else None
    
    def get_driver_review_count(self, obj):
        from .models import Review
        return Review.objects.filter(reviewed_user=obj.driver).count()
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('intermediate_stops') is None:
            data['intermediate_stops'] = []
        return data
    
    def create(self, validated_data):
        if 'intermediate_stops' not in validated_data or validated_data['intermediate_stops'] is None:
            validated_data['intermediate_stops'] = []
        return super().create(validated_data)


class FavoriteRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteRoute
        fields = ['id', 'start_location', 'end_location', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        if data.get('start_location') == data.get('end_location'):
            raise serializers.ValidationError(
                {'end_location': 'Punkt docelowy musi być różny od punktu początkowego.'}
            )
        return data


class TripTemplateSerializer(serializers.ModelSerializer):
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
        if data.get('intermediate_stops') is None:
            data['intermediate_stops'] = []
        return data
    
    def create(self, validated_data):
        if 'intermediate_stops' not in validated_data or validated_data['intermediate_stops'] is None:
            validated_data['intermediate_stops'] = []
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    trip_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'trip', 'trip_info', 'notification_type', 'message', 'read', 'created_at']
        read_only_fields = ['id', 'created_at', 'trip_info']
    
    def get_trip_info(self, obj):
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
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Wallet
        fields = ['id', 'user', 'username', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'username', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
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
        if obj.trip:
            return {
                'id': obj.trip.id,
                'start_location': obj.trip.start_location,
                'end_location': obj.trip.end_location,
                'date': obj.trip.date,
            }
        return None
    
    def get_booking_info(self, obj):
        if obj.booking:
            return {
                'id': obj.booking.id,
                'seats': obj.booking.seats,
                'status': obj.booking.status,
            }
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    recipient_username = serializers.ReadOnlyField(source='recipient.username')
    booking_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'booking', 'booking_info', 'sender', 'sender_username',
            'recipient', 'recipient_username', 'message', 'read', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'sender_username', 'recipient', 'recipient_username', 'created_at', 'booking_info']
        extra_kwargs = {
            'message': {'required': True},
            'booking': {'required': True},
        }
    
    def get_booking_info(self, obj):
        booking = obj.booking
        trip = booking.trip
        return {
            'id': booking.id,
            'trip_id': trip.id,
            'trip_route': f"{trip.start_location} → {trip.end_location}",
            'trip_date': trip.date,
            'status': booking.status,
        }
    
    def validate_booking(self, value):
        if value is None:
            raise serializers.ValidationError('Rezerwacja jest wymagana.')
        from .models import Booking
        try:
            if isinstance(value, int):
                booking = Booking.objects.get(id=value)
            elif hasattr(value, 'id'):
                booking = Booking.objects.get(id=value.id)
            else:
                booking = value
        except (Booking.DoesNotExist, TypeError, ValueError):
            raise serializers.ValidationError('Rezerwacja nie istnieje.')
        return booking
    
    def validate_message(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Treść wiadomości nie może być pusta.')
        if len(value.strip()) > 1000:
            raise serializers.ValidationError('Wiadomość nie może być dłuższa niż 1000 znaków.')
        return value.strip()


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.ReadOnlyField(source='reviewer.username')
    reviewed_user_username = serializers.ReadOnlyField(source='reviewed_user.username')
    trip_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewer_username', 'reviewed_user', 'reviewed_user_username',
            'trip', 'trip_info', 'booking', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'reviewer_username', 'reviewed_user_username', 'created_at', 'trip_info']
        extra_kwargs = {
            'rating': {'required': True},
            'trip': {'required': True},
            'reviewed_user': {'required': True},
        }
    
    def get_trip_info(self, obj):
        trip = obj.trip
        return {
            'id': trip.id,
            'start_location': trip.start_location,
            'end_location': trip.end_location,
            'date': trip.date,
            'time': str(trip.time) if trip.time else None,
        }
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Ocena musi być w zakresie 1-5.')
        return value
    
    def validate_comment(self, value):
        if value and len(value.strip()) > 500:
            raise serializers.ValidationError('Komentarz nie może być dłuższy niż 500 znaków.')
        return value.strip() if value else ''
    
    def validate(self, data):
        return data


class FriendshipSerializer(serializers.ModelSerializer):
    requester_username = serializers.ReadOnlyField(source='requester.username')
    receiver_username = serializers.ReadOnlyField(source='receiver.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_profile = serializers.SerializerMethodField()
    receiver_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        fields = [
            'id', 'requester', 'requester_username', 'requester_profile',
            'receiver', 'receiver_username', 'receiver_profile',
            'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'requester', 'requester_username', 'receiver_username', 'status_display', 'created_at', 'updated_at']
    
    def get_requester_profile(self, obj):
        try:
            profile = obj.requester.profile
            return {
                'username': obj.requester.username,
                'first_name': obj.requester.first_name or None,
                'last_name': obj.requester.last_name or None,
                'avatar': profile.avatar.url if profile.avatar else None,
            }
        except:
            return {
                'username': obj.requester.username,
                'first_name': obj.requester.first_name or None,
                'last_name': obj.requester.last_name or None,
                'avatar': None,
            }
    
    def get_receiver_profile(self, obj):
        try:
            profile = obj.receiver.profile
            return {
                'username': obj.receiver.username,
                'first_name': obj.receiver.first_name or None,
                'last_name': obj.receiver.last_name or None,
                'avatar': profile.avatar.url if profile.avatar else None,
            }
        except:
            return {
                'username': obj.receiver.username,
                'first_name': obj.receiver.first_name or None,
                'last_name': obj.receiver.last_name or None,
                'avatar': None,
            }
    
    def validate_receiver(self, value):
        request = self.context.get('request')
        if request and request.user == value:
            raise serializers.ValidationError('Nie możesz dodać samego siebie jako znajomego.')
        return value


class TrustedUserSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    trusted_user_username = serializers.ReadOnlyField(source='trusted_user.username')
    trusted_user_profile = serializers.SerializerMethodField()
    trip_info = serializers.SerializerMethodField()
    
    class Meta:
        model = TrustedUser
        fields = [
            'id', 'user', 'user_username', 'trusted_user', 'trusted_user_username',
            'trusted_user_profile', 'trip', 'trip_info', 'note', 'auto_accept', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'user_username', 'trusted_user_username', 'created_at']
    
    def get_trusted_user_profile(self, obj):
        try:
            profile = obj.trusted_user.profile
            return {
                'username': obj.trusted_user.username,
                'first_name': obj.trusted_user.first_name or None,
                'last_name': obj.trusted_user.last_name or None,
                'avatar': profile.avatar.url if profile.avatar else None,
                'preferred_role': profile.preferred_role,
            }
        except:
            return {
                'username': obj.trusted_user.username,
                'first_name': obj.trusted_user.first_name or None,
                'last_name': obj.trusted_user.last_name or None,
                'avatar': None,
                'preferred_role': None,
            }
    
    def get_trip_info(self, obj):
        if obj.trip:
            return {
                'id': obj.trip.id,
                'start_location': obj.trip.start_location,
                'end_location': obj.trip.end_location,
                'date': obj.trip.date,
            }
        return None
    
    def validate_trusted_user(self, value):
        request = self.context.get('request')
        if request and request.user == value:
            raise serializers.ValidationError('Nie możesz dodać samego siebie jako zaufanego.')
        return value


class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.ReadOnlyField(source='reporter.username')
    reported_user_username = serializers.ReadOnlyField(source='reported_user.username')
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    trip_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reporter_username', 'reported_user', 'reported_user_username',
            'trip', 'trip_info', 'reason', 'reason_display', 'description',
            'status', 'status_display', 'admin_notes', 'created_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'reporter', 'reporter_username', 'reported_user_username',
            'reason_display', 'status_display', 'admin_notes', 'created_at', 'resolved_at'
        ]
        extra_kwargs = {
            'reason': {'required': True},
            'description': {'required': True},
            'reported_user': {'required': True},
        }
    
    def get_trip_info(self, obj):
        if obj.trip:
            return {
                'id': obj.trip.id,
                'start_location': obj.trip.start_location,
                'end_location': obj.trip.end_location,
                'date': obj.trip.date,
            }
        return None
    
    def validate_reported_user(self, value):
        request = self.context.get('request')
        if request and request.user == value:
            raise serializers.ValidationError('Nie możesz zgłosić samego siebie.')
        return value
    
    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Opis zgłoszenia jest wymagany.')
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Opis musi zawierać co najmniej 10 znaków.')


class RecurringTripSerializer(serializers.ModelSerializer):
    driver_username = serializers.ReadOnlyField(source='driver.username')
    intermediate_stops = serializers.JSONField(default=list, required=False)
    weekdays = serializers.JSONField(default=list, required=False)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    
    class Meta:
        model = RecurringTrip
        fields = [
            'id', 'driver', 'driver_username', 'start_location', 'end_location',
            'intermediate_stops', 'time', 'available_seats', 'price_per_seat',
            'frequency', 'frequency_display', 'weekdays', 'start_date', 'end_date',
            'active', 'last_generated', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'driver', 'driver_username', 'last_generated', 'created_at', 'updated_at']
    
    def validate(self, data):
        if data.get('frequency') == 'weekly' and not data.get('weekdays'):
            raise serializers.ValidationError({
                'weekdays': 'Dla przejazdów co tydzień musisz wybrać dni tygodnia.'
            })
        
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({
                    'end_date': 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.'
                })
        
        return data
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('intermediate_stops') is None:
            data['intermediate_stops'] = []
        if data.get('weekdays') is None:
            data['weekdays'] = []
        return data


class WaitlistSerializer(serializers.ModelSerializer):
    passenger_username = serializers.ReadOnlyField(source='passenger.username')
    trip_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Waitlist
        fields = [
            'id', 'trip', 'trip_info', 'passenger', 'passenger_username',
            'seats_requested', 'notified', 'created_at'
        ]
        read_only_fields = ['id', 'passenger', 'passenger_username', 'notified', 'created_at']
    
    def get_trip_info(self, obj):
        trip = obj.trip
        return {
            'id': trip.id,
            'start_location': trip.start_location,
            'end_location': trip.end_location,
            'date': trip.date,
            'time': str(trip.time) if trip.time else None,
            'available_seats': trip.available_seats,
        }
    
    def validate_seats_requested(self, value):
        if value < 1:
            raise serializers.ValidationError('Liczba miejsc musi być większa niż 0.')
        return value
    
    def validate(self, data):
        request = self.context.get('request')
        trip = data.get('trip')
        
        if request and trip:
            from .models import Booking
            # Sprawdź czy użytkownik już ma rezerwację
            existing_booking = Booking.objects.filter(
                trip=trip,
                passenger=request.user,
                status__in=['reserved', 'accepted', 'paid']
            ).exists()
            
            if existing_booking:
                raise serializers.ValidationError('Masz już rezerwację na ten przejazd.')
            
            # Sprawdź czy użytkownik już jest na liście oczekujących
            existing_waitlist = Waitlist.objects.filter(
                trip=trip,
                passenger=request.user
            ).exists()
            
            if existing_waitlist:
                raise serializers.ValidationError('Już jesteś na liście oczekujących dla tego przejazdu.')
        
        return data
