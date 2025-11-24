# Struktura Projektu Django - Carpooling

## Drzewo Katalogów

```
backend/
│
├── backend/                          # Główny projekt Django
│   ├── __init__.py                   # Inicjalizacja pakietu
│   ├── settings.py                    # ⚙️ Konfiguracja projektu
│   ├── urls.py                       # 🔗 Główny router URL
│   ├── wsgi.py                       # 🌐 WSGI config (deployment)
│   └── asgi.py                       # ⚡ ASGI config (async)
│
├── api/                              # Aplikacja Django - API
│   ├── __init__.py                   # Inicjalizacja aplikacji
│   ├── admin.py                      # 👤 Konfiguracja Django Admin
│   ├── apps.py                       # 📱 Konfiguracja aplikacji
│   ├── models.py                     # 🗄️ Modele danych
│   ├── serializers.py                # 📦 Serializery DRF
│   ├── views.py                      # 👁️ Widoki API
│   ├── urls.py                       # 🔗 Routing API
│   ├── tests.py                      # 🧪 Testy jednostkowe
│   └── migrations/                   # 📊 Migracje bazy danych
│       └── __init__.py
│
├── manage.py                         # 🛠️ Django management script
├── requirements.txt                  # 📋 Zależności Python
├── .env                              # 🔐 Zmienne środowiskowe (gitignored)
├── ARCHITECTURE.md                   # 📖 Dokumentacja architektury
└── STRUCTURE.md                      # 📁 Ten plik
```

## Opis Komponentów

### 📁 backend/ (Główny Projekt)

#### settings.py
- Konfiguracja całego projektu Django
- Ustawienia bazy danych (PostgreSQL)
- Konfiguracja Django REST Framework
- Ustawienia JWT Authentication
- Konfiguracja CORS
- Ładowanie zmiennych środowiskowych z .env

#### urls.py
- Główny router URL projektu
- Definiuje ścieżki:
  - `/admin/` - Panel administracyjny
  - `/api/user/register/` - Rejestracja
  - `/api/token/` - Autentykacja JWT
  - `/api/token/refresh/` - Odświeżanie tokenu
  - `/api/` - Delegacja do api.urls

#### wsgi.py / asgi.py
- Konfiguracja serwera aplikacji
- WSGI dla tradycyjnych serwerów
- ASGI dla serwerów async

### 📁 api/ (Aplikacja)

#### models.py
Definiuje modele danych:
- **Trip**: Przejazd (kierowca, trasa, data, miejsca, cena)
- **Booking**: Rezerwacja (pasażer, przejazd, miejsca, status)

#### serializers.py
Serializery Django REST Framework:
- **UserSerializer**: Rejestracja użytkownika
- **TripSerializer**: Serializacja przejazdu
- **BookingSerializer**: Serializacja rezerwacji

#### views.py
Widoki API:
- **UserCreateView**: Rejestracja
- **TripViewSet**: CRUD + akcje dla przejazdów
- **TripSearchView**: Wyszukiwanie przejazdów

#### urls.py
Routing API:
- `/api/trips/` - ViewSet przejazdów
- `/api/trips/search/` - Wyszukiwanie

#### admin.py
Konfiguracja Django Admin:
- Rejestracja modeli Trip i Booking
- Konfiguracja list_display, list_filter, search_fields

#### migrations/
Folder zawierający migracje bazy danych:
- `__init__.py` - Inicjalizacja
- Migracje są generowane przez Django

### 🛠️ manage.py
Django management script - główne narzędzie do zarządzania projektem:
```bash
python manage.py runserver      # Uruchomienie serwera
python manage.py migrate         # Zastosowanie migracji
python manage.py makemigrations  # Utworzenie migracji
python manage.py createsuperuser # Utworzenie admina
python manage.py test            # Uruchomienie testów
```

## Przepływ Request-Response

```
Client Request
    ↓
backend/urls.py (główny router)
    ↓
api/urls.py (routing API)
    ↓
api/views.py (logika biznesowa)
    ↓
api/serializers.py (walidacja/transformacja)
    ↓
api/models.py (operacje na bazie danych)
    ↓
PostgreSQL Database
    ↓
Response (JSON)
```

## Konwencje Nazewnictwa

- **Pliki Python**: snake_case (np. `models.py`, `views.py`)
- **Klasy**: PascalCase (np. `TripViewSet`, `UserSerializer`)
- **Funkcje/Metody**: snake_case (np. `get_queryset`, `perform_create`)
- **Zmienne**: snake_case (np. `start_location`, `available_seats`)
- **URL patterns**: kebab-case (np. `/api/trips/search/`)

## Zależności Między Komponentami

```
settings.py
    ├── INSTALLED_APPS → api
    ├── DATABASES → PostgreSQL
    └── REST_FRAMEWORK → JWT Auth

urls.py
    ├── include('api.urls')
    └── path('api/...')

api/urls.py
    └── router.register('trips', TripViewSet)

api/views.py
    ├── TripViewSet → TripSerializer
    └── TripSerializer → Trip model

api/models.py
    └── Trip, Booking → PostgreSQL
```

## Status Komponentów

| Komponent | Status | Opis |
|-----------|--------|------|
| Django Project | ✅ | Utworzony i skonfigurowany |
| API App | ✅ | Utworzona i zarejestrowana |
| Models | ✅ | Trip i Booking zdefiniowane |
| Serializers | ✅ | Wszystkie serializery gotowe |
| Views | ✅ | ViewSets i widoki działające |
| URLs | ✅ | Routing skonfigurowany |
| Admin | ✅ | Modele zarejestrowane |
| Migrations | ⚠️ | Folder istnieje, migracje do utworzenia |
| Tests | 📝 | Plik istnieje, testy do napisania |
| Documentation | ✅ | ARCHITECTURE.md i STRUCTURE.md |

## Następne Kroki

1. ✅ Architektura przygotowana
2. ⏭️ Utworzenie migracji: `python manage.py makemigrations`
3. ⏭️ Zastosowanie migracji: `python manage.py migrate`
4. ⏭️ Utworzenie superusera: `python manage.py createsuperuser`
5. ⏭️ Uruchomienie serwera: `python manage.py runserver`

---

**Task Jira**: PT2025NFCP-39 - Przygotowanie architektury aplikacji (Django start project)

