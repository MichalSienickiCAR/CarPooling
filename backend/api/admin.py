from django.contrib import admin
from .models import Trip

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['id', 'driver', 'start_location', 'end_location', 'date', 'time', 'available_seats', 'price_per_seat']
    list_filter = ['date', 'created_at']
    search_fields = ['start_location', 'end_location', 'driver__username']
    readonly_fields = ['created_at', 'updated_at']
