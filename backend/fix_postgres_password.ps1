# Skrypt do resetowania hasła PostgreSQL
# Uruchom jako Administrator: .\fix_postgres_password.ps1

$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
$pgServiceName = "postgresql-x64-18"
$newPassword = "Kp9mN2xQvR7wF4jL8hT3bY6cZ1a"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reset hasla PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Sprawdź czy plik istnieje
if (-not (Test-Path $pgHbaPath)) {
    Write-Host "[BLAD] Nie znaleziono pliku pg_hba.conf" -ForegroundColor Red
    Write-Host "Sciezka: $pgHbaPath" -ForegroundColor Yellow
    exit 1
}

# Utwórz backup
$backupPath = "$pgHbaPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $pgHbaPath $backupPath
Write-Host "[OK] Utworzono backup: $backupPath" -ForegroundColor Green

# Przeczytaj plik
$content = Get-Content $pgHbaPath -Raw

# Zmień scram-sha-256 na trust dla localhost (IPv4 i IPv6)
$content = $content -replace '(host\s+all\s+all\s+127\.0\.0\.1/32\s+)scram-sha-256', '$1trust'
$content = $content -replace '(host\s+all\s+all\s+::1/128\s+)scram-sha-256', '$1trust'

# Zapisz zmiany
Set-Content -Path $pgHbaPath -Value $content -NoNewline
Write-Host "[OK] Zmieniono pg_hba.conf na trust dla localhost" -ForegroundColor Green

# Zrestartuj usługę PostgreSQL
Write-Host "`nRestartowanie uslugi PostgreSQL..." -ForegroundColor Yellow
try {
    Restart-Service $pgServiceName -ErrorAction Stop
    Write-Host "[OK] Usluga PostgreSQL zrestartowana" -ForegroundColor Green
} catch {
    Write-Host "[BLAD] Nie mozna zrestartowac uslugi: $_" -ForegroundColor Red
    Write-Host "Sprobuj recznie: Restart-Service $pgServiceName" -ForegroundColor Yellow
    exit 1
}

Start-Sleep -Seconds 3

# Połącz się i zmień hasło
Write-Host "`nZmiana hasla..." -ForegroundColor Yellow
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# Zmień hasło dla postgres
$sqlCommands = @"
ALTER USER postgres WITH PASSWORD '$newPassword';
ALTER USER carpool WITH PASSWORD '$newPassword';
"@

try {
    $result = & $psqlPath -U postgres -d postgres -c $sqlCommands 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Haslo zmienione!" -ForegroundColor Green
    } else {
        Write-Host "[UWAGA] Wynik: $result" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[BLAD] Nie mozna zmienic hasla automatycznie" -ForegroundColor Red
    Write-Host "Sprobuj recznie:" -ForegroundColor Yellow
    Write-Host "  & `"$psqlPath`" -U postgres" -ForegroundColor Cyan
    Write-Host "  ALTER USER postgres WITH PASSWORD '$newPassword';" -ForegroundColor Cyan
    Write-Host "  ALTER USER carpool WITH PASSWORD '$newPassword';" -ForegroundColor Cyan
}

# Przywróć bezpieczną konfigurację
Write-Host "`nPrzywracanie bezpiecznej konfiguracji..." -ForegroundColor Yellow
$content = Get-Content $pgHbaPath -Raw
$content = $content -replace '(host\s+all\s+all\s+127\.0\.0\.1/32\s+)trust', '$1scram-sha-256'
$content = $content -replace '(host\s+all\s+all\s+::1/128\s+)trust', '$1scram-sha-256'
Set-Content -Path $pgHbaPath -Value $content -NoNewline
Write-Host "[OK] Przywrocono scram-sha-256" -ForegroundColor Green

# Zrestartuj usługę ponownie
Restart-Service $pgServiceName
Start-Sleep -Seconds 2

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Gotowe!" -ForegroundColor Green
Write-Host "Nowe haslo: $newPassword" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nSprawdz polaczenie:" -ForegroundColor Cyan
Write-Host "  python check_db_connection.py" -ForegroundColor Yellow

