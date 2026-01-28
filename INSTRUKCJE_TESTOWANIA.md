# Instrukcje Testowania Funkcji Zaawansowanych

## Przygotowanie Środowiska

### Backend
```bash
cd /home/keinek/Projekt/projekcik/carpooling/backend
source venv/bin/activate  # jeśli używasz virtualenv
python manage.py runserver
```

Backend będzie dostępny na: http://localhost:8000

### Frontend
```bash
cd /home/keinek/Projekt/projekcik/carpooling/frontend
npm start
```

Frontend będzie dostępny na: http://localhost:3000

**Uwaga**: Przed uruchomieniem frontendu, może być konieczne:
```bash
# Restart TypeScript server w VSCode (Ctrl+Shift+P -> "TypeScript: Restart TS Server")
# lub restart VS Code, jeśli występują błędy cache TypeScript
```

## Scenariusze Testowe

### 1. Cykliczne Przejazdy

#### Krok 1: Dodanie cyklicznego przejazdu (tygodniowy)
1. Zaloguj się jako kierowca
2. Na Dashboard kliknij kafelek "Cykliczne Przejazdy"
3. Kliknij "Dodaj Cykliczny Przejazd"
4. Wypełnij formularz:
   - Punkt początkowy: "Warszawa"
   - Punkt końcowy: "Kraków"
   - Częstotliwość: "Co tydzień"
   - Zaznacz dni: Poniedziałek, Środa, Piątek
   - Godzina: 08:00
   - Dostępne miejsca: 3
   - Cena za miejsce: 50
   - Data rozpoczęcia: dziś
   - Data zakończenia: (opcjonalnie za 2 miesiące)
5. Kliknij "Zapisz"

**Oczekiwany rezultat**: 
- Przejazd pojawi się na liście z statusem "Aktywny"
- Częstotliwość: "Co tydzień"
- Dni: "Pn, Śr, Pt"

#### Krok 2: Generowanie przejazdów
1. Na liście cyklicznych przejazdów kliknij ikonę "Refresh" (⟳)
2. Poczekaj na wiadomość o liczbie wygenerowanych przejazdów

**Oczekiwany rezultat**:
- Alert: "Wygenerowano X przejazdów"
- Przejdź do "Moje Przejazdy" - powinny pojawić się nowe przejazdy w poniedziałki, środy i piątki na następne 30 dni

#### Krok 3: Wyłączenie cyklicznego przejazdu
1. Kliknij ikonę "Pause" (⏸) przy cyklicznym przejeździe
2. Status zmieni się na "Nieaktywny"
3. Próba generowania przejazdów powinna być zablokowana

**Oczekiwany rezultat**:
- Chip zmienia kolor z zielonego (success) na szary (default)
- Przycisk "Refresh" jest nieaktywny

#### Krok 4: Edycja cyklicznego przejazdu
1. Kliknij ikonę "Edit" (✎)
2. Zmień cenę na 60 PLN
3. Dodaj jeszcze jeden dzień (np. Czwartek)
4. Zapisz

**Oczekiwany rezultat**:
- Zmiany widoczne na liście
- Nowe generowane przejazdy będą miały zaktualizowaną cenę i dni

#### Krok 5: Usunięcie cyklicznego przejazdu
1. Kliknij ikonę "Delete" (🗑)
2. Potwierdź usunięcie
3. Przejazd znika z listy

**Oczekiwany rezultat**:
- Cykliczny przejazd usunięty
- Uwaga: Wcześniej wygenerowane przejazdy pozostają w "Moje Przejazdy"

### 2. Lista Oczekujących

#### Krok 1: Utworzenie pełnego przejazdu
1. Zaloguj się jako kierowca
2. Dodaj nowy przejazd z 2 miejscami
3. Wyloguj się

#### Krok 2: Wypełnienie przejazdu
1. Zaloguj się jako pasażer1
2. Zarezerwuj 2 miejsca (przejazd powinien być teraz pełny)
3. Wyloguj się

#### Krok 3: Zapis na listę oczekujących
1. Zaloguj się jako pasażer2
2. Wejdź w szczegóły pełnego przejazdu
3. Powinien być widoczny przycisk "Zapisz się na listę oczekujących"
4. Kliknij przycisk
5. W dialogu wprowadź liczbę miejsc: 1
6. Kliknij "Zapisz się"

**Oczekiwany rezultat**:
- Alert: "Zapisano na listę oczekujących"
- Dialog się zamyka

#### Krok 4: Anulowanie rezerwacji i powiadomienie
1. Zaloguj się ponownie jako pasażer1
2. Anuluj swoją rezerwację (2 miejsca)
3. Wyloguj się

#### Krok 5: Sprawdzenie powiadomienia
1. Zaloguj się jako pasażer2
2. Przejdź do powiadomień (🔔)
3. Powinno być powiadomienie: "Miejsce się zwolniło dla przejazdu X"

**Oczekiwany rezultat**:
- Pasażer2 otrzymał powiadomienie typu `waitlist_spot_available`
- Może teraz zarezerwować miejsce

#### Krok 6: Lista oczekujących dla kierowcy
1. Zaloguj się jako kierowca (właściciel przejazdu)
2. Backend: `GET /api/waitlist/for_trip/?trip_id={id}`
3. Powinni być widoczni wszyscy pasażerowie z listy oczekujących

**Oczekiwany rezultat**:
- JSON z listą oczekujących pasażerów
- Każdy wpis zawiera: passenger_username, seats_requested, created_at

### 3. Automatyczna Akceptacja dla Zaufanych

#### Krok 1: Oznaczenie użytkownika jako zaufanego
1. Zaloguj się jako kierowca
2. Przejdź do "Historia"
3. Znajdź zakończony przejazd z pasażerem
4. Kliknij "Dodaj do zaufanych"
5. Opcjonalnie dodaj notatkę
6. Zapisz

#### Krok 2: Włączenie automatycznej akceptacji
1. Przejdź do "Zaufani użytkownicy"
2. Znajdź dodanego użytkownika
3. Zaznacz checkbox "Automatyczna akceptacja rezerwacji"

**Oczekiwany rezultat**:
- Checkbox jest zaznaczony
- W bazie danych: `auto_accept = True` dla tego TrustedUser

#### Krok 3: Test automatycznej akceptacji
1. Dodaj nowy przejazd jako kierowca
2. Wyloguj się
3. Zaloguj się jako zaufany pasażer
4. Zarezerwuj miejsce w przejeździe tego kierowcy
5. Sprawdź status rezerwacji

**Oczekiwany rezultat**:
- Status rezerwacji: "Zaakceptowana" (nie "Oczekująca")
- Kierowca otrzymał powiadomienie: "X zarezerwował miejsce (automatycznie zaakceptowano)"
- Pasażer otrzymał powiadomienie: "Twoja rezerwacja została automatycznie zaakceptowana"

#### Krok 4: Wyłączenie automatycznej akceptacji
1. Jako kierowca odznacz checkbox przy zaufanym użytkowniku
2. Dodaj nowy przejazd
3. Jako zaufany pasażer zarezerwuj miejsce

**Oczekiwany rezultat**:
- Status rezerwacji: "Oczekująca" (wymaga ręcznej akceptacji kierowcy)

### 4. Test Kombinacji Funkcji

#### Scenariusz: Cykliczny przejazd + Auto-accept
1. Jako kierowca dodaj cykliczny przejazd (tygodniowy, 3 dni)
2. Wygeneruj przejazdy na 30 dni
3. Oznacz pasażera jako zaufanego z auto_accept=True
4. Jako pasażer zarezerwuj miejsca w kilku wygenerowanych przejazdach

**Oczekiwany rezultat**:
- Wszystkie rezerwacje automatycznie zaakceptowane
- Kierowca otrzymuje powiadomienia o każdej rezerwacji

#### Scenariusz: Pełny przejazd + Waitlist + Auto-accept
1. Kierowca ma zaufanego pasażera1 z auto_accept=True
2. Kierowca dodaje przejazd (2 miejsca)
3. Pasażer2 (niezaufany) rezerwuje 2 miejsca (przejazd pełny)
4. Pasażer1 (zaufany) zapisuje się na listę oczekujących
5. Pasażer2 anuluje rezerwację

**Oczekiwany rezultat**:
- Pasażer1 otrzymuje powiadomienie o zwolnieniu miejsca
- Pasażer1 rezerwuje miejsce - jest automatycznie zaakceptowane

## Endpointy API do Testowania

### Recurring Trips
```bash
# Lista cyklicznych przejazdów
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/recurring-trips/

# Dodanie nowego
curl -X POST -H "Authorization: Bearer {token}" -H "Content-Type: application/json" \
  -d '{"frequency":"weekly","weekdays":[0,2,4],"start_location":"Warszawa","end_location":"Kraków","time":"08:00","available_seats":3,"price_per_seat":"50.00","start_date":"2025-01-20"}' \
  http://localhost:8000/api/recurring-trips/

# Toggle active
curl -X POST -H "Authorization: Bearer {token}" http://localhost:8000/api/recurring-trips/{id}/toggle_active/

# Generowanie przejazdów
curl -X POST -H "Authorization: Bearer {token}" -H "Content-Type: application/json" \
  -d '{"days":30}' \
  http://localhost:8000/api/recurring-trips/{id}/generate_trips/
```

### Waitlist
```bash
# Moja lista oczekujących
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/waitlist/

# Zapisz się na listę
curl -X POST -H "Authorization: Bearer {token}" -H "Content-Type: application/json" \
  -d '{"trip":123,"seats_requested":1}' \
  http://localhost:8000/api/waitlist/

# Lista oczekujących dla przejazdu (tylko kierowca)
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/waitlist/for_trip/?trip_id=123
```

### Trusted Users
```bash
# Lista zaufanych
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/trusted-users/my_trusted/

# Aktualizacja auto_accept
curl -X PATCH -H "Authorization: Bearer {token}" -H "Content-Type: application/json" \
  -d '{"auto_accept":true}' \
  http://localhost:8000/api/trusted-users/{id}/
```

## Znane Problemy

1. **TypeScript cache errors**: Po dodaniu nowych plików TypeScript może wymagać restartu:
   - VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
   - Lub restart VS Code

2. **Import AddRecurringTrip**: Jeśli występuje błąd "Cannot find module", zrestartuj TypeScript server.

3. **auto_accept property**: Jeśli TypeScript nie widzi pola auto_accept, sprawdź czy interfejs TrustedUser w api.ts ma pole `auto_accept?: boolean;`

## Debugging

### Backend Logs
```bash
# W terminalu gdzie działa backend zobaczysz logi:
python manage.py runserver

# Przykładowe logi:
# - "User X created recurring trip"
# - "Recurring trip Y active set to True"
# - "Generated Z trips from recurring trip Y"
# - "User X joined waitlist"
# - "Booking auto-accepted for trusted user X"
```

### Frontend Console
Otwórz Developer Tools (F12) i sprawdź:
- Network tab: Czy API calls zwracają 200 OK
- Console: Czy nie ma błędów JavaScript

### Database
```bash
cd backend
python manage.py shell

# Sprawdź cykliczne przejazdy
from api.models import RecurringTrip
RecurringTrip.objects.all()

# Sprawdź listę oczekujących
from api.models import Waitlist
Waitlist.objects.all()

# Sprawdź auto_accept
from api.models import TrustedUser
TrustedUser.objects.filter(auto_accept=True)
```

## Raportowanie Błędów

Jeśli znajdziesz błąd, zapisz:
1. Kroki do reprodukcji
2. Oczekiwany rezultat
3. Aktualny rezultat
4. Logi backendu (jeśli są)
5. Błędy w konsoli przeglądarki (jeśli są)
6. Screenshots (jeśli pomogą)

## Checklisty Testowe

### Cykliczne Przejazdy
- [ ] Dodanie cyklicznego przejazdu (daily)
- [ ] Dodanie cyklicznego przejazdu (weekly)
- [ ] Dodanie cyklicznego przejazdu (biweekly)
- [ ] Dodanie cyklicznego przejazdu (monthly)
- [ ] Generowanie przejazdów (30 dni)
- [ ] Toggle active/inactive
- [ ] Edycja cyklicznego przejazdu
- [ ] Usunięcie cyklicznego przejazdu
- [ ] Walidacja: weekdays required dla weekly/biweekly
- [ ] Walidacja: end_date >= start_date

### Lista Oczekujących
- [ ] Zapis na listę (pełny przejazd)
- [ ] Powiadomienie po anulowaniu rezerwacji
- [ ] Widok listy dla kierowcy
- [ ] Opuszczenie listy oczekujących
- [ ] Walidacja: nie można zapisać się gdy ma się już booking
- [ ] Walidacja: seats_requested > 0

### Auto-Accept
- [ ] Oznaczenie użytkownika jako zaufanego
- [ ] Włączenie auto_accept
- [ ] Test automatycznej akceptacji
- [ ] Wyłączenie auto_accept
- [ ] Test rezerwacji bez auto_accept
- [ ] Powiadomienia przy auto-accept

## Sukces!
Jeśli wszystkie testy przechodzą, funkcje są gotowe do produkcji! 🎉
