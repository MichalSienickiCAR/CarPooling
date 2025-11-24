from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip, Booking, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['preferred_role']
        read_only_fields = ['created_at', 'updated_at']


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

    class Meta:
        model = Booking
        fields = ['id', 'passenger', 'passenger_username', 'seats', 'status', 'created_at']
        read_only_fields = ['id', 'created_at', 'passenger_username']


class TripSerializer(serializers.ModelSerializer):
    driver_username = serializers.ReadOnlyField(source='driver.username')
    bookings = BookingSerializer(many=True, read_only=True)
    intermediate_stops = serializers.JSONField(default=list, required=False)

    class Meta:
        model = Trip
        fields = [
            'id', 'driver', 'driver_username', 'start_location', 'end_location',
            'intermediate_stops', 'date', 'time', 'available_seats',
            'price_per_seat', 'created_at', 'updated_at', 'bookings'
        ]
        read_only_fields = ['id', 'driver', 'created_at', 'updated_at', 'bookings']
    
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