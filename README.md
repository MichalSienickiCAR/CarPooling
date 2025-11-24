# Carpooling Project

Projekt zespołowy - aplikacja do wspólnych przejazdów.

## Struktura projektu

- `backend/` - Django REST API
- `frontend/` - React TypeScript aplikacja

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

4. Utwórz plik `.env` w katalogu `backend/` (jeśli nie istnieje):
```env
DB_NAME=carpooling
DB_USER=carpool
DB_PASSWORD=twoje_haslo
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=twoj-secret-key
DEBUG=True
```

5. Upewnij się, że PostgreSQL jest uruchomiony i baza danych istnieje.

6. Wykonaj migracje:
```bash
python manage.py migrate
```

7. Utwórz superusera (opcjonalnie):
```bash
python manage.py createsuperuser
```

8. Uruchom serwer deweloperski:
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

- `POST /api/user/register/` - Rejestracja użytkownika
- `POST /api/token/` - Pobranie tokenu JWT (logowanie)
- `POST /api/token/refresh/` - Odświeżenie tokenu JWT
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

## Uwagi

- Plik `.env` jest w `.gitignore` i nie powinien być commitowany
- Wszystkie zmiany powinny być robione na Twoim branchu `feature/michal-work`
- Przed rozpoczęciem pracy zawsze pobierz najnowsze zmiany z `main`

