from django.contrib import admin
from .models import Trip, Booking, FavoriteRoute, TripTemplate, Notification, Wallet, Transaction


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


@admin.register(FavoriteRoute)
class FavoriteRouteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'start_location', 'end_location', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'start_location', 'end_location']


@admin.register(TripTemplate)
class TripTemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'driver', 'name', 'start_location', 'end_location', 'created_at']
    list_filter = ['created_at']
    search_fields = ['driver__username', 'name', 'start_location', 'end_location']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'notification_type', 'read', 'created_at']
    list_filter = ['read', 'notification_type', 'created_at']
    search_fields = ['user__username', 'message']
    readonly_fields = ['created_at']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'balance', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'transaction_type', 'amount', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__username', 'description']
    readonly_fields = ['created_at']
