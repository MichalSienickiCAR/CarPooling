@echo off
REM Uruchom najpierw: docker compose up -d db (w katalogu glownego projektu)
REM Albo ustaw w backend\.env: DB_ENGINE=sqlite

cd /d "%~dp0backend"
if not exist "..\venv\Scripts\activate.bat" (
    echo Tworze venv...
    python -m venv ..\venv
)
call ..\venv\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
