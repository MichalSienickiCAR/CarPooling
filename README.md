# Carpooling Project

Projekt zespołowy - aplikacja do wspólnych przejazdów (carpooling).

## Opis projektu

Aplikacja webowa umożliwiająca użytkownikom organizowanie wspólnych przejazdów. Kierowcy mogą dodawać przejazdy, a pasażerowie mogą wyszukiwać i rezerwować miejsca w przejazdach.

## Struktura projektu

```
carpooling/
├── backend/          # Django REST API
├── frontend/         # React TypeScript aplikacja
├── venv/            # Virtual environment (nie w repo)
├── README.md        # Ten plik
└── .gitignore       # Pliki ignorowane przez Git
```

- `backend/` - Django REST API z PostgreSQL
- `frontend/` - React TypeScript aplikacja z Material-UI

## Wymagania

### Backend
- Python 3.8+
- PostgreSQL
- Virtual environment (venv)

### Frontend
- Node.js 16+
- npm

## Instalacja i uruchomienie

### Backend

1. Przejdź do katalogu backend:
```bash
cd backend
```

2. Aktywuj virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Zainstaluj zależności (jeśli jeszcze nie są zainstalowane):
```bash
pip install -r requirements.txt
```

4. **Skonfiguruj PostgreSQL:**
   
   a. Upewnij się, że PostgreSQL jest zainstalowany i uruchomiony na Twoim systemie.
   
   b. Utwórz bazę danych w PostgreSQL:
   ```sql
   -- Zaloguj się do PostgreSQL jako superuser
   psql -U postgres
   
   -- Utwórz bazę danych
   CREATE DATABASE carpooling;
   
   -- (Opcjonalnie) Utwórz użytkownika
   CREATE USER carpool WITH PASSWORD 'twoje_haslo';
   GRANT ALL PRIVILEGES ON DATABASE carpooling TO carpool;
   ```
   
   c. Utwórz plik `.env` w katalogu `backend/` z następującą konfiguracją:
   ```env
   # Django Settings
   SECRET_KEY=twoj-secret-key-tutaj
   DEBUG=True
   
   # Database Configuration (PostgreSQL)
   DB_NAME=carpooling
   DB_USER=postgres
   DB_PASSWORD=twoje_haslo_postgres
   DB_HOST=localhost
   DB_PORT=5432
   
   # Ustaw USE_SQLITE=True tylko jeśli chcesz użyć SQLite (niezalecane)
   USE_SQLITE=False
   ```
   
   **Uwaga:** 
   - Każdy członek zespołu powinien mieć własny plik `.env` z własnymi danymi dostępowymi do lokalnej bazy PostgreSQL.
   - **Ważne:** Jeśli hasło PostgreSQL zawiera znaki specjalne, może wystąpić błąd `UnicodeDecodeError`.
   
   **Rozwiązanie problemu z kodowaniem hasła:**
   
   Jeśli widzisz błąd `UnicodeDecodeError: 'utf-8' codec can't decode byte...`:
   
   1. Zmień hasło użytkownika PostgreSQL na proste (tylko litery i cyfry):
   ```sql
   -- Zaloguj się do PostgreSQL jako superuser
   psql -U postgres
   
   -- Zmień hasło użytkownika
   ALTER USER carpool WITH PASSWORD 'prostehaslo123';
   -- lub dla użytkownika postgres:
   ALTER USER postgres WITH PASSWORD 'prostehaslo123';
   ```
   
   2. Zaktualizuj `DB_PASSWORD` w pliku `.env`:
   ```env
   DB_PASSWORD=prostehaslo123
   ```
   
   3. Upewnij się, że plik `.env` jest zapisany w kodowaniu UTF-8 (bez BOM).
   
   4. Sprawdź połączenie uruchamiając:
   ```bash
   python check_db_connection.py
   ```

5. Upewnij się, że PostgreSQL jest uruchomiony i baza danych istnieje.

6. **Sprawdź połączenie z bazą danych** (opcjonalnie, ale zalecane):
   ```bash
   python check_db_connection.py
   ```
   Ten skrypt sprawdzi czy:
   - PostgreSQL jest uruchomiony
   - Baza danych istnieje
   - Połączenie działa poprawnie
   
   Jeśli wystąpi błąd, zobacz sekcję "Rozwiązanie problemu z kodowaniem hasła" powyżej.

7. Wykonaj migracje:
```bash
python manage.py migrate
```

8. Utwórz superusera (opcjonalnie):
```bash
python manage.py createsuperuser
```

9. Uruchom serwer deweloperski:
```bash
python manage.py runserver
```

Backend będzie dostępny pod adresem: `http://localhost:8000`

### Frontend

1. Przejdź do katalogu frontend:
```bash
cd frontend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom aplikację:
```bash
npm start
```

Frontend będzie dostępny pod adresem: `http://localhost:3000`

## API Endpoints

### Autentykacja
- `POST /api/user/register/` - Rejestracja użytkownika (z preferred_role)
- `POST /api/token/` - Pobranie tokenu JWT (logowanie)
- `POST /api/token/refresh/` - Odświeżenie tokenu JWT
- `GET /api/user/profile/` - Pobranie profilu użytkownika
- `PATCH /api/user/profile/` - Aktualizacja profilu użytkownika (preferred_role)

### Przejazdy
- `GET /api/trips/` - Lista przejazdów
- `POST /api/trips/` - Utworzenie przejazdu (wymaga autentykacji)
- `GET /api/trips/{id}/` - Szczegóły przejazdu
- `PUT/PATCH /api/trips/{id}/` - Aktualizacja przejazdu
- `DELETE /api/trips/{id}/` - Usunięcie przejazdu
- `GET /api/trips/search/` - Wyszukiwanie przejazdów
- `GET /api/trips/my_trips/` - Moje przejazdy (jako kierowca)

### Admin
- `GET /admin/` - Panel administracyjny Django

## Praca z Git

### Twój branch do pracy
Aktualnie pracujesz na branchu: `feature/michal-work`

### Pobieranie najnowszych zmian
Najpierw sprawdź, który branch jest najnowszy:
```bash
git fetch origin
git for-each-ref --sort=-committerdate refs/remotes/origin --format='%(refname:short) - %(committerdate:short)'
```

Następnie pobierz najnowsze zmiany z najnowszego brancha (obecnie: `feature/PT2025NFCP-WyszukiwaniePrzejazdow`):
```bash
git pull origin feature/PT2025NFCP-WyszukiwaniePrzejazdow
```

### Commity i push
```bash
git add .
git commit -m "Opis zmian"
git push origin feature/michal-work
```

**WAŻNE:** Nie pushuj niczego na branch `main` - pracuj tylko na swoim branchu!

## Dokumentacja

- `backend/ARCHITECTURE.md` - Dokumentacja architektury aplikacji
- `backend/STRUCTURE.md` - Struktura projektu Django
- `DEFINITION_OF_DONE.md` - Definition of Done dla projektu

## Linki

- **Repozytorium Git**: https://devtools.wi.pb.edu.pl/bitbucket/projects/CAR/repos/carpooling
- **Backend API**: http://localhost:8000 (po uruchomieniu)
- **Frontend**: http://localhost:3000 (po uruchomieniu)

## Uwagi

- Plik `.env` jest w `.gitignore` i nie powinien być commitowany
- Wszystkie zmiany powinny być robione na własnym branchu (np. `feature/PT2025NFCP-XX-opis`)
- Przed rozpoczęciem pracy zawsze pobierz najnowsze zmiany z najnowszego brancha
- Virtual environment (`venv/`) nie jest w repozytorium - każdy tworzy własny

## Zespół

Projekt zespołowy - Car Pooling Team

## Licencja

Projekt edukacyjny

