from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripSearchView, UserProfileView, UserDetailsView, FavoriteRouteViewSet, TripTemplateViewSet, NotificationViewSet, MyBookingsView, WalletView, TransactionListView, MessageViewSet, ReviewViewSet, FriendshipViewSet, TrustedUserViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'favorite-routes', FavoriteRouteViewSet, basename='favorite-route')
router.register(r'trip-templates', TripTemplateViewSet, basename='trip-template')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'friendships', FriendshipViewSet, basename='friendship')
router.register(r'trusted-users', TrustedUserViewSet, basename='trusted-user')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('trips/search/', TripSearchView.as_view(), name='trip-search'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('user/<int:user_id>/details/', UserDetailsView.as_view(), name='user-details'),
    path('bookings/my/', MyBookingsView.as_view(), name='my-bookings'),
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('transactions/', TransactionListView.as_view(), name='transactions'),
    path('', include(router.urls)),
]
