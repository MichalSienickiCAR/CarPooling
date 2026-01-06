from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripSearchView, UserProfileView, FavoriteRouteViewSet, TripTemplateViewSet, NotificationViewSet, MyBookingsView, WalletView, TransactionListView

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'favorite-routes', FavoriteRouteViewSet, basename='favorite-route')
router.register(r'trip-templates', TripTemplateViewSet, basename='trip-template')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Ważne: trips/search/ musi być PRZED router.urls, żeby nie było konfliktu
    path('trips/search/', TripSearchView.as_view(), name='trip-search'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('bookings/my/', MyBookingsView.as_view(), name='my-bookings'),
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('transactions/', TransactionListView.as_view(), name='transactions'),
    path('', include(router.urls)),
]

