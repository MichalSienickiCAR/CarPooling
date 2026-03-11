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

- **Backend:** Python 3.8+, virtual environment (venv)
- **Baza:** **PostgreSQL w Dockerze** – wszyscy w zespole używamy Postgresa, żeby nie mieszać w kodzie i uniknąć problemów (u jednego SQLite, u drugiego Postgres). Potrzebny jest **Docker**.
- **Frontend:** Node.js 16+, npm

## Szybki start dla nowych członków zespołu

**Standard zespołu: każdy pracuje na Postgresie z Dockera.** Nie zmieniaj `DB_ENGINE` na sqlite – wartości w `backend/.env` (skopiowanym z `.env.example`) są ustawione pod Docker i mają tak zostać.

### 1. Sklonuj i przygotuj konfigurację

```bash
git clone https://devtools.wi.pb.edu.pl/bitbucket/projects/CAR/repos/carpooling.git
cd carpooling
```

**Backend – plik .env:**

- Windows: `copy backend\.env.example backend\.env`
- Linux/Mac: `cp backend/.env.example backend/.env`

W pliku `backend/.env` **zostaw domyślne wartości** – są ustawione pod Postgresa w Dockerze (DB_ENGINE=postgres, DB_HOST=localhost itd.). Nic nie zmieniaj przy bazie.

**Frontend – plik .env.local:**

- Windows: `copy frontend\.env.example frontend\.env.local`
- Linux/Mac: `cp frontend/.env.example frontend/.env.local`

Domyślnie logowanie przez Google jest **wyłączone** (logujesz się zwykłym kontem / rejestracja). Aby włączyć Google – patrz sekcja „Jak włączyć Google OAuth lokalnie” poniżej.

### 2. Uruchom bazę (Postgres w Dockerze)

W katalogu głównym projektu:

```bash
docker compose up -d db
```

Poczekaj chwilę, aż kontener się podniesie. Backend łączy się z `localhost:5432` (wartości z `backend/.env`). **Docker jest wymagany** – wszyscy używamy Postgresa.

### 3. Backend

```bash
cd backend
python -m venv ..\venv
..\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend: `http://localhost:8000`

(W Linux/Mac: `source ../venv/bin/activate` zamiast `..\venv\Scripts\activate`.)

### 4. Frontend (w drugim terminalu)

```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:3000`

### 5. Pierwsze konto

Wejdź na `http://localhost:3000`, kliknij **Nie masz konta? Zarejestruj się**, załóż konto (login/hasło). Przycisk „Zaloguj przez Google” nie jest widoczny, dopóki nie włączysz Google OAuth (patrz niżej).

---

## Szybki start z Dockerem (podsumowanie)

| Krok | Komenda |
|------|--------|
| Baza | `docker compose up -d db` (w katalogu głównym) |
| Backend | `cd backend` → venv + `pip install -r requirements.txt` → `python manage.py migrate` → `python manage.py runserver` |
| Frontend | `cd frontend` → `npm install` → `npm start` |

Pliki `.env` i `.env.local` tworzysz z `.env.example` (nie trafiają do repo).

---

## Awaryjnie: SQLite (bez Dockera)

Tylko jeśli **naprawdę** nie możesz użyć Dockera. W `backend/.env` ustaw `DB_ENGINE=sqlite` – wtedy baza będzie w pliku `backend/db.sqlite3`. W zespole standard to Postgres; SQLite na własną odpowiedzialność.

---

## Jak włączyć Google OAuth lokalnie (opcjonalnie)

Domyślnie w DEV logowanie przez Google jest wyłączone, żeby każdy mógł od razu pracować bez konfiguracji.

1. **Google Cloud Console:** Utwórz projekt (lub użyj wspólnego zespołowego), włącz „Google+ API” / „People API”, utwórz dane uwierzytelniające OAuth 2.0 (typ: aplikacja internetowa). W „Authorized redirect URIs” dodaj: `http://localhost:3000/auth/google/callback`.
2. **Backend** – w `backend/.env` ustaw:
   - `ENABLE_GOOGLE_OAUTH=true`
   - `GOOGLE_OAUTH_CLIENT_ID=...` (Client ID z konsoli)
   - `GOOGLE_OAUTH_CLIENT_SECRET=...` (Client secret)
   - `GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/google/callback`
3. **Frontend** – w `frontend/.env.local` ustaw:
   - `REACT_APP_GOOGLE_OAUTH_ENABLED=true`
4. Zrestartuj backend i frontend. Na stronie logowania pojawi się przycisk „Zaloguj przez Google”.

Sekrety trzymaj tylko w `.env` / `.env.local` – nie commituj ich do repo.

---

## Gdy coś nie działa (rozwiązywanie problemów)

| Objaw | Co sprawdzić |
|--------|----------------|
| Błąd połączenia z bazą (backend) | Upewnij się, że Docker działa i wykonałeś `docker compose up -d db` w katalogu projektu. W `.env` ma być `DB_ENGINE=postgres`. |
| `ModuleNotFoundError` / brak pakietów | Czy venv jest aktywowany i czy wykonałeś `pip install -r requirements.txt`? |
| Frontend nie łączy się z API | Czy backend działa na `http://localhost:8000`? W `.env.local`: `REACT_APP_API_URL=http://localhost:8000/api`. |
| Brak przycisku Google | To normalne – w DEV jest wyłączony. Aby włączyć: sekcja „Jak włączyć Google OAuth lokalnie” powyżej. |
| Błąd kodowania / hasło PostgreSQL | Użyj hasła bez znaków specjalnych w `.env` (np. `carpool`) lub przejdź na SQLite. |

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

## Pliki pomocnicze

- `dev_setup.md` – komendy do uruchomienia backendu i frontendu (ściąga)
- `start_backend.bat` / `start_frontend.bat` – skrypty startowe dla Windows (wymagają wcześniejszego `copy .env.example .env` i `docker compose up -d db`)

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

