$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# SQL commands to grant permissions
$sqlCommands = @"
-- Grant usage on schema public
GRANT USAGE ON SCHEMA public TO carpool;
GRANT USAGE ON SCHEMA public TO postgres;

-- Grant all privileges on all tables in schema public
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO carpool;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;

-- Grant all privileges on all sequences (important for IDs)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO carpool;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Make sure future tables are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO carpool;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO carpool;
"@

Write-Host "Naprawianie uprawnien dla bazy carpooling..." -ForegroundColor Yellow

# Execute for 'carpooling' database
try {
    $result = & $psqlPath -U postgres -d carpooling -c $sqlCommands 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Uprawnienia nadane dla bazy carpooling!" -ForegroundColor Green
    } else {
        Write-Host "[UWAGA] Blad podczas nadawania uprawnien (moze uzytkownik carpool nie istnieje?):" -ForegroundColor Yellow
        Write-Host $result
    }
} catch {
    Write-Host "[BLAD] Nie udalo sie uruchomic psql: $_" -ForegroundColor Red
}

Write-Host "`nProba odblokowania tabeli api_userprofile..."
# Specific fix for the user profile table just in case
$fixTable = "GRANT ALL ON api_userprofile TO carpool; GRANT ALL ON api_userprofile_id_seq TO carpool;"
& $psqlPath -U postgres -d carpooling -c $fixTable 2>&1
