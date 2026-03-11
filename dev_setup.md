# Komendy do uruchomienia projektu (DEV)

Szybka ściąga – zakładamy, że repo jest sklonowane i `.env` / `.env.local` są już z `.env.example`. **Standard zespołu: wszyscy używamy Postgresa w Dockerze** – nie zmieniamy DB_ENGINE na sqlite.

## Windows (PowerShell lub CMD)

### Terminal 1 – baza i backend

```cmd
docker compose up -d db
cd backend
python -m venv ..\venv
..\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Terminal 2 – frontend

```cmd
cd frontend
npm install
npm start
```

## Awaryjnie bez Dockera (SQLite)

Tylko jeśli nie możesz użyć Dockera: w `backend\.env` ustaw `DB_ENGINE=sqlite`, pomiń `docker compose up -d db`. W zespole standard to Postgres.

## Pierwsza konfiguracja (tylko raz)

- `copy backend\.env.example backend\.env`
- `copy frontend\.env.example frontend\.env.local`

Pełny opis: README.md, sekcja „Szybki start dla nowych członków zespołu”.

Na Windows możesz też użyć skryptów z katalogu głównego: **start_backend.bat** i **start_frontend.bat** (wymagają wcześniejszego skopiowania .env i uruchomienia `docker compose up -d db`).
