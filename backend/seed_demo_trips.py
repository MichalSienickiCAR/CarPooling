"""
Skrypt do zasiania demo przejazdów (ok. 20–30) z różnymi kierowcami,
w różnych dniach od dzisiaj włącznie. Uruchom z katalogu backend:
  python seed_demo_trips.py
"""
import os
import django
import random
from datetime import date, timedelta, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User  # noqa: E402
from api.models import Trip, Booking, UserProfile  # noqa: E402


DRIVER_USERNAMES = ['kierowca1', 'kierowca2', 'kierowca3', 'kierowca4', 'kierowca5']
PASSENGER_USERNAMES = ['pasazer1', 'pasazer2', 'pasazer3', 'pasazer4', 'pasazer5']
ROUTES = [
    ('Białystok', 'Warszawa'),
    ('Warszawa', 'Białystok'),
    ('Białystok', 'Gdańsk'),
    ('Warszawa', 'Kraków'),
    ('Poznań', 'Wrocław'),
    ('Kraków', 'Warszawa'),
    ('Gdańsk', 'Białystok'),
    ('Wrocław', 'Poznań'),
    ('Łódź', 'Warszawa'),
    ('Warszawa', 'Łódź'),
]


def get_or_create_users(usernames, role='both'):
    users = []
    for username in usernames:
        user, _ = User.objects.get_or_create(
            username=username,
            defaults={'email': f'{username}@example.com'}
        )
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={'preferred_role': role}
        )
        if profile.preferred_role not in ('driver', 'both') and role == 'driver':
            profile.preferred_role = 'both'
            profile.save()
        users.append(user)
    return users


def seed_trips(total_trips_target=28, days_ahead=5):
    """
    Tworzy ok. total_trips_target przejazdów (domyślnie 28),
    rozłożonych od dzisiaj przez days_ahead dni (włącznie z dzisiaj).
    """
    drivers = get_or_create_users(DRIVER_USERNAMES, role='driver')
    passengers = get_or_create_users(PASSENGER_USERNAMES, role='passenger')
    today = date.today()

    # Rozkład przejazdów: część dziś, reszta na kolejne dni
    trips_per_day = max(1, total_trips_target // days_ahead)
    remainder = total_trips_target - (trips_per_day * days_ahead)

    created_trips = 0
    created_bookings = 0

    for d in range(days_ahead):
        trip_date = today + timedelta(days=d)
        n_this_day = trips_per_day + (1 if d < remainder else 0)
        for _ in range(n_this_day):
            driver = random.choice(drivers)
            start, end = random.choice(ROUTES)
            hour = random.randint(6, 20)
            minute = random.choice([0, 15, 30, 45])
            trip_time = time(hour=hour, minute=minute)
            price = random.choice([15, 20, 25, 30, 35, 40])
            seats = random.randint(1, 4)
            estimated_min = random.choice([60, 90, 120, 150, 180, 210, 240])
            luggage_ok = random.random() < 0.85

            trip, created_flag = Trip.objects.get_or_create(
                driver=driver,
                start_location=start,
                end_location=end,
                date=trip_date,
                time=trip_time,
                defaults={
                    'intermediate_stops': [],
                    'available_seats': seats,
                    'price_per_seat': price,
                    'estimated_duration_minutes': estimated_min,
                    'luggage_ok': luggage_ok,
                },
            )
            if created_flag:
                created_trips += 1

            # Losowe rezerwacje (0–3 pasażerów na przejazd)
            initial_seats = trip.available_seats
            free_seats = initial_seats
            random.shuffle(passengers)
            for passenger in passengers[: random.randint(0, 3)]:
                if free_seats <= 0:
                    break
                requested_seats = random.randint(1, min(2, free_seats))
                status = random.choice(['reserved', 'accepted'])
                booking, created_b = Booking.objects.get_or_create(
                    trip=trip,
                    passenger=passenger,
                    defaults={'seats': requested_seats, 'status': status},
                )
                if created_b:
                    created_bookings += 1
                    free_seats -= booking.seats

            # Aktualizacja dostępnych miejsc po rezerwacjach
            total_booked = sum(b.seats for b in trip.bookings.all())
            trip.available_seats = max(0, initial_seats - total_booked)
            trip.save(update_fields=['available_seats'])

    print(f'Utworzono {created_trips} przykładowych przejazdów (od {today}, przez {days_ahead} dni).')
    print(f'Utworzono {created_bookings} przykładowych rezerwacji.')


if __name__ == '__main__':
    seed_trips(total_trips_target=28, days_ahead=5)
