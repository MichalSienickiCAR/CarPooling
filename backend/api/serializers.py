from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip, Booking


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
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
        # Automatycznie ustawiamy kierowcę na zalogowanego użytkownika
        validated_data['driver'] = self.context['request'].user
        # Upewniamy się, że intermediate_stops jest listą
        if 'intermediate_stops' not in validated_data or validated_data['intermediate_stops'] is None:
            validated_data['intermediate_stops'] = []
        return super().create(validated_data)