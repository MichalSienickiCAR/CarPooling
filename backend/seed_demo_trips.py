import os
import django
import random
from datetime import date, timedelta, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User  # noqa: E402
from api.models import Trip, Booking  # noqa: E402


DRIVER_USERNAMES = ['kierowca1', 'kierowca2', 'kierowca3']
PASSENGER_USERNAMES = ['pasazer1', 'pasazer2', 'pasazer3', 'pasazer4', 'pasazer5']
ROUTES = [
    ('Białystok', 'Warszawa'),
    ('Warszawa', 'Białystok'),
    ('Białystok', 'Gdańsk'),
    ('Warszawa', 'Kraków'),
    ('Poznań', 'Wrocław'),
]


def get_or_create_users(usernames):
    users = []
    for username in usernames:
        user, _ = User.objects.get_or_create(
            username=username,
            defaults={'email': f'{username}@example.com'}
        )
        users.append(user)
    return users


def seed_trips(days_ahead: int = 7, per_day: int = 10):
    """
    Seed:
    - kierowców z kilkoma przejazdami na kolejne dni
    - losowe rezerwacje pasażerów (różne statusy)
    """
    drivers = get_or_create_users(DRIVER_USERNAMES)
    passengers = get_or_create_users(PASSENGER_USERNAMES)
    today = date.today()

    created_trips = 0
    created_bookings = 0

    for d in range(days_ahead):
        trip_date = today + timedelta(days=d + 1)
        for _ in range(per_day):
            driver = random.choice(drivers)
            start, end = random.choice(ROUTES)
            hour = random.randint(6, 20)
            minute = random.choice([0, 15, 30, 45])
            trip_time = time(hour=hour, minute=minute)
            price = random.choice([15, 20, 25, 30, 35, 40])
            seats = random.randint(2, 4)

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
                },
            )
            if created_flag:
                created_trips += 1

            # Losowe rezerwacje pasażerów (0–3 na przejazd)
            free_seats = trip.available_seats
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

    print(f'Utworzono {created_trips} przykładowych przejazdów.')
    print(f'Utworzono {created_bookings} przykładowych rezerwacji.')


if __name__ == '__main__':
    seed_trips()

