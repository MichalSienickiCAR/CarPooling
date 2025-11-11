from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip

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


class TripSerializer(serializers.ModelSerializer):
    driver_username = serializers.CharField(source='driver.username', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id',
            'driver',
            'driver_username',
            'start_location',
            'end_location',
            'intermediate_stops',
            'date',
            'time',
            'available_seats',
            'price_per_seat',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['driver', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatycznie ustawiamy kierowcę na zalogowanego użytkownika
        validated_data['driver'] = self.context['request'].user
        return super().create(validated_data)