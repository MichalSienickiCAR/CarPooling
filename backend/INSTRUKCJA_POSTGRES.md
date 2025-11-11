# Instrukcja: Odinstalowanie i ponowna instalacja PostgreSQL

## Krok 1: Odinstalowanie PostgreSQL

### Metoda A: Przez Panel Sterowania
1. Otwórz **Panel Sterowania** → **Programy i funkcje**
2. Znajdź **PostgreSQL** na liście
3. Kliknij prawym przyciskiem → **Odinstaluj**
4. Postępuj zgodnie z instrukcjami

### Metoda B: Przez PowerShell (jako Administrator)
1. Otwórz PowerShell jako Administrator
2. Wpisz:
   ```powershell
   Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*PostgreSQL*"} | ForEach-Object {$_.Uninstall()}
   ```

### Po odinstalowaniu:
- Usuń ręcznie folder danych (jeśli istnieje): `C:\Program Files\PostgreSQL`
- Usuń folder danych (jeśli istnieje): `C:\ProgramData\PostgreSQL`

## Krok 2: Zatrzymanie serwisów (jeśli jeszcze działają)
1. Otwórz PowerShell jako Administrator
2. Wpisz:
   ```powershell
   Stop-Service postgresql* -Force
   ```

## Krok 3: Instalacja PostgreSQL

1. **Pobierz instalator:**
   - Przejdź na: https://www.postgresql.org/download/windows/
   - Kliknij "Download the installer"
   - Wybierz najnowszą wersję (PostgreSQL 16)
   - Pobierz instalator dla Windows x86-64

2. **Uruchom instalator:**
   - Kliknij "Next" przez wszystkie kroki
   - **Port:** Zostaw 5432 (domyślny)
   - **Superuser password:** Wprowadź hasło dla użytkownika `postgres` (zapamiętaj je!)
   - **Data Directory:** Zostaw domyślne
   - Zakończ instalację

## Krok 4: Utworzenie bazy danych i użytkownika

1. Otwórz **SQL Shell (psql)** (z menu Start) lub PowerShell

2. Połącz się (wpisz hasło które ustawiłeś dla postgres):
   ```powershell
   psql -U postgres
   ```

3. W psql wykonaj:
   ```sql
   CREATE DATABASE carpooling;
   CREATE USER carpool WITH PASSWORD 'ZJ<170yuJ~{>rOx3c_Mq@b$g';
   GRANT ALL PRIVILEGES ON DATABASE carpooling TO carpool;
   \c carpooling
   GRANT ALL ON SCHEMA public TO carpool;
   \q
   ```

## Krok 5: Utworzenie pliku .env

W katalogu `backend/` utwórz plik `.env` z zawartością:
```
DB_NAME=carpooling
DB_USER=carpool
DB_PASSWORD=ZJ<170yuJ~{>rOx3c_Mq@b$g
DB_HOST=localhost
DB_PORT=5432
```

## Krok 6: Uruchom migracje Django

```powershell
cd backend
python manage.py migrate
```

Gotowe!

---

## Resetowanie hasła PostgreSQL

Jeśli nie pamiętasz hasła użytkownika `postgres`, wykonaj następujące kroki:

### Krok 1: Zatrzymaj serwis PostgreSQL
1. Otwórz PowerShell jako Administrator
2. Wpisz:
   ```powershell
   Stop-Service postgresql* -Force
   ```

### Krok 2: Znajdź i edytuj plik pg_hba.conf
1. Plik znajduje się zazwyczaj w:
   - `C:\Program Files\PostgreSQL\[wersja]\data\pg_hba.conf`
   - Lub `C:\ProgramData\PostgreSQL\[wersja]\data\pg_hba.conf`
   
2. Otwórz plik `pg_hba.conf` jako Administrator (np. w Notatniku)

3. Znajdź linię zaczynającą się od:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

4. Zmień `scram-sha-256` na `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   ```

5. Zapisz plik

### Krok 3: Uruchom PostgreSQL
```powershell
Start-Service postgresql*
```

### Krok 4: Połącz się i zresetuj hasło
1. Otwórz PowerShell
2. Połącz się bez hasła:
   ```powershell
   psql -U postgres
   ```

3. W psql ustaw nowe hasło:
   ```sql
   ALTER USER postgres WITH PASSWORD 'twoje_nowe_haslo';
   \q
   ```

### Krok 5: Przywróć bezpieczne ustawienia
1. Zatrzymaj PostgreSQL:
   ```powershell
   Stop-Service postgresql* -Force
   ```

2. Otwórz ponownie `pg_hba.conf` i zmień z powrotem `trust` na `scram-sha-256`

3. Uruchom PostgreSQL:
   ```powershell
   Start-Service postgresql*
   ```

Gotowe! Teraz możesz używać nowego hasła.


