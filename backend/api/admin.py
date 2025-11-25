from django.contrib import admin
from .models import Trip, Booking


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['id', 'driver', 'start_location', 'end_location', 'date', 'time', 'available_seats', 'price_per_seat']
    list_filter = ['date', 'created_at']
    search_fields = ['start_location', 'end_location', 'driver__username']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'trip', 'passenger', 'seats', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['passenger__username', 'trip__start_location', 'trip__end_location']
