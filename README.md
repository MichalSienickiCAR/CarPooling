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

## Pobieranie projektu

### 1. Sklonuj repozytorium

```bash
git clone https://devtools.wi.pb.edu.pl/bitbucket/projects/CAR/repos/carpooling.git
cd carpooling
```

### 2. Utwórz własny branch do pracy

```bash
# Sprawdź dostępne branche
git branch -a

# Utwórz nowy branch (np. feature/twoje-imie lub feature/PT2025NFCP-XX-opis)
git checkout -b feature/twoje-imie

# Lub przełącz się na istniejący branch
git checkout feature/nazwa-brancha
```

### 3. Pobierz najnowsze zmiany (jeśli branch już istnieje)

```bash
git fetch origin
git pull origin feature/nazwa-brancha
```

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

2. **Utwórz virtual environment** (jeśli jeszcze nie istnieje):
```bash
# Windows
python -m venv ..\venv

# Linux/Mac
python3 -m venv ../venv
```

3. **Aktywuj virtual environment:**
```bash
# Windows
..\venv\Scripts\activate

# Linux/Mac
source ../venv/bin/activate
```

4. **Zainstaluj zależności:**
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

## Szybki start dla nowych członków zespołu

Jeśli dopiero pobierasz projekt, wykonaj następujące kroki w kolejności:

1. **Sklonuj repozytorium** (patrz sekcja "Pobieranie projektu" powyżej)
2. **Zainstaluj PostgreSQL** i utwórz lokalną bazę danych
3. **Utwórz plik `.env`** w katalogu `backend/` z konfiguracją bazy danych
4. **Utwórz virtual environment** i zainstaluj zależności Pythona
5. **Wykonaj migracje** Django (`python manage.py migrate`)
6. **Zainstaluj zależności frontendowe** (`npm install` w katalogu `frontend/`)
7. **Uruchom backend** (`python manage.py runserver` w katalogu `backend/`)
8. **Uruchom frontend** (`npm start` w katalogu `frontend/`)

**Ważne:**
- Każdy członek zespołu musi mieć **własną lokalną bazę PostgreSQL** i **własny plik `.env`**
- Plik `.env` **nie jest** w repozytorium (jest w `.gitignore`)
- Virtual environment (`venv/`) **nie jest** w repozytorium - każdy tworzy własny
- Pracuj tylko na **własnym branchu**, nie pushuj na `main`

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

### Tworzenie i przełączanie branchy

```bash
# Sprawdź dostępne branche
git branch -a

# Utwórz nowy branch (np. feature/PT2025NFCP-XX-opis)
git checkout -b feature/nazwa-brancha

# Przełącz się na istniejący branch
git checkout feature/nazwa-brancha
```

### Pobieranie najnowszych zmian

```bash
# Pobierz informacje o wszystkich branchach
git fetch origin

# Sprawdź, który branch jest najnowszy
git for-each-ref --sort=-committerdate refs/remotes/origin --format='%(refname:short) - %(committerdate:short)'

# Pobierz zmiany z konkretnego brancha
git pull origin feature/nazwa-brancha
```

### Commity i push

```bash
# Dodaj zmiany
git add .

# Zrób commit (używaj formatu: "PT2025NFCP-XX: Opis zmian")
git commit -m "PT2025NFCP-XX: Opis zmian"

# Wyślij zmiany na swój branch
git push origin feature/nazwa-twojego-brancha
```

**WAŻNE:** 
- Nie pushuj niczego na branch `main` - pracuj tylko na swoim branchu!
- Używaj opisowych commitów z numerem taska (np. `PT2025NFCP-XX`)
- Przed rozpoczęciem pracy zawsze pobierz najnowsze zmiany z głównego brancha

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

