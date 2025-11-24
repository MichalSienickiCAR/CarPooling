from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripSearchView, UserProfileView

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    # Ważne: trips/search/ musi być PRZED router.urls, żeby nie było konfliktu
    path('trips/search/', TripSearchView.as_view(), name='trip-search'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)),
]

