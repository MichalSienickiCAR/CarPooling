# Architektura Aplikacji Django - Carpooling

## Przegląd

Projekt Carpooling to aplikacja webowa oparta na Django REST Framework, umożliwiająca użytkownikom organizowanie wspólnych przejazdów.

## Struktura Projektu

```
backend/
├── backend/              # Główny projekt Django
│   ├── __init__.py
│   ├── settings.py       # Konfiguracja projektu
│   ├── urls.py          # Główna konfiguracja URL
│   ├── wsgi.py          # WSGI config (deployment)
│   └── asgi.py          # ASGI config (async support)
├── api/                  # Aplikacja Django - API
│   ├── __init__.py
│   ├── admin.py         # Konfiguracja Django Admin
│   ├── apps.py          # Konfiguracja aplikacji
│   ├── models.py        # Modele danych (Trip, Booking)
│   ├── serializers.py   # Serializery DRF
│   ├── views.py         # Widoki API
│   ├── urls.py          # Routing API
│   ├── tests.py         # Testy jednostkowe
│   └── migrations/      # Migracje bazy danych
├── manage.py            # Django management script
├── requirements.txt     # Zależności Python
└── .env                 # Zmienne środowiskowe (nie w repo)
```

## Komponenty Architektury

### 1. Projekt Django (`backend/`)

Główny projekt Django zawiera:

- **settings.py**: Konfiguracja całego projektu
  - Baza danych PostgreSQL
  - Django REST Framework
  - JWT Authentication
  - CORS headers
  - Zmienne środowiskowe (.env)

- **urls.py**: Główny router URL
  - `/admin/` - Panel administracyjny Django
  - `/api/user/register/` - Rejestracja użytkownika
  - `/api/token/` - Autentykacja JWT
  - `/api/token/refresh/` - Odświeżanie tokenu
  - `/api/` - Routing do aplikacji API

- **wsgi.py / asgi.py**: Konfiguracja serwera aplikacji

### 2. Aplikacja API (`api/`)

Aplikacja Django odpowiedzialna za logikę biznesową:

#### Modele (`models.py`)

- **UserProfile**: Profil użytkownika z preferowaną rolą
  - `user`: Użytkownik (OneToOneField do User)
  - `preferred_role`: Preferowana rola (driver/passenger/both)
  - `created_at`, `updated_at`: Daty utworzenia i aktualizacji

- **Trip**: Model przejazdu
  - `driver`: Kierowca (ForeignKey do User)
  - `start_location`: Punkt początkowy
  - `end_location`: Punkt docelowy
  - `intermediate_stops`: Punkty pośrednie (JSONField)
  - `date`, `time`: Data i godzina przejazdu
  - `available_seats`: Liczba dostępnych miejsc
  - `price_per_seat`: Cena za miejsce

- **Booking**: Model rezerwacji
  - `trip`: Przejazd (ForeignKey)
  - `passenger`: Pasażer (ForeignKey do User)
  - `seats`: Liczba miejsc
  - `status`: Status rezerwacji (reserved/accepted/cancelled)

#### Serializery (`serializers.py`)

- **UserSerializer**: Serializacja użytkownika (rejestracja z preferred_role)
- **UserProfileSerializer**: Serializacja profilu użytkownika
- **TripSerializer**: Serializacja przejazdu
- **BookingSerializer**: Serializacja rezerwacji

#### Widoki (`views.py`)

- **UserCreateView**: Rejestracja nowego użytkownika z preferred_role
- **UserProfileView**: Pobieranie i aktualizacja profilu użytkownika
- **TripViewSet**: ViewSet dla przejazdów (CRUD + akcje)
  - `my_trips`: Lista przejazdów kierowcy
  - `passengers`: Lista pasażerów przejazdu
  - `cancel`: Anulowanie przejazdu
- **TripSearchView**: Wyszukiwanie przejazdów (wyklucza przejazdy użytkownika)

#### Routing (`urls.py`)

- `/api/trips/` - ViewSet przejazdów
- `/api/trips/search/` - Wyszukiwanie przejazdów
- `/api/trips/my_trips/` - Moje przejazdy (kierowca)
- `/api/user/profile/` - Profil użytkownika (GET/PATCH)

## Technologie

### Backend
- **Django 5.2.7**: Framework webowy
- **Django REST Framework**: API REST
- **djangorestframework-simplejwt**: Autentykacja JWT
- **django-cors-headers**: Obsługa CORS
- **psycopg2-binary**: Adapter PostgreSQL
- **python-dotenv**: Zarządzanie zmiennymi środowiskowymi

### Baza Danych
- **PostgreSQL**: Relacyjna baza danych

## Bezpieczeństwo

### Autentykacja
- JWT (JSON Web Tokens) dla autentykacji API
- Access token: 30 minut
- Refresh token: 1 dzień

### Autoryzacja
- Domyślnie wymagana autentykacja dla wszystkich endpointów
- Wyjątki: rejestracja, logowanie, odświeżanie tokenu

### CORS
- W trybie development: wszystkie źródła dozwolone
- W produkcji: należy skonfigurować dozwolone źródła

## Konfiguracja Środowiska

### Zmienne Środowiskowe (.env)

```env
DB_NAME=carpooling
DB_USER=carpool
DB_PASSWORD=haslo
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=secret-key
DEBUG=True
```

## Przepływ Danych

1. **Rejestracja/Logowanie**
   - Klient → `/api/user/register/` lub `/api/token/`
   - Serwer → JWT token
   - Klient przechowuje token w localStorage

2. **Tworzenie Przejazdu**
   - Klient → `POST /api/trips/` (z tokenem)
   - Serwer → Walidacja → Zapis do bazy → Zwrot danych

3. **Wyszukiwanie Przejazdów**
   - Klient → `GET /api/trips/search/?start_location=...&end_location=...&date=...`
   - Serwer → Filtrowanie → Zwrot listy przejazdów

4. **Rezerwacja**
   - Klient → `POST /api/trips/{id}/bookings/` (z tokenem)
   - Serwer → Walidacja → Utworzenie rezerwacji

## Best Practices

1. **Separacja odpowiedzialności**: Logika biznesowa w views, modele w models
2. **Serializery**: Walidacja i transformacja danych
3. **ViewSets**: Reużywalne widoki dla operacji CRUD
4. **Zmienne środowiskowe**: Wrażliwe dane w .env
5. **Migrations**: Wersjonowanie schematu bazy danych

## Rozwój

### Dodawanie nowych funkcji

1. Utwórz/zmodyfikuj modele w `api/models.py`
2. Utwórz migracje: `python manage.py makemigrations`
3. Zastosuj migracje: `python manage.py migrate`
4. Utwórz serializery w `api/serializers.py`
5. Utwórz widoki w `api/views.py`
6. Dodaj routing w `api/urls.py`

### Testy

Plik `api/tests.py` zawiera testy jednostkowe. Uruchom:
```bash
python manage.py test
```

## Deployment

### WSGI
Dla tradycyjnych serwerów (Apache, Nginx + Gunicorn):
- `backend.wsgi.application`

### ASGI
Dla serwerów async (Daphne, Uvicorn):
- `backend.asgi.application`

## Status

- Projekt Django utworzony
- Aplikacja API skonfigurowana
- Modele danych zdefiniowane (UserProfile, Trip, Booking)
- REST API endpoints działające
- Autentykacja JWT zaimplementowana
- CORS skonfigurowany
- Zmienne środowiskowe skonfigurowane
- PostgreSQL skonfigurowany jako domyślna baza danych

---

**Data utworzenia**: 2025-11-24
**Wersja Django**: 5.2.8
**Task Jira**: PT2025NFCP-39

