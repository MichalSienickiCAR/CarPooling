# Test Funkcjonalności Powiadomień Kierowcy

## Funkcjonalność
Kierowca może wysłać powiadomienie do wszystkich pasażerów z aktywnymi rezerwacjami (reserved, accepted, paid) w swoim przejeździe.

## Endpointy

### POST /api/trips/{trip_id}/notify_passengers/

**Uprawnienia:** Tylko kierowca tego przejazdu

**Request Body:**
```json
{
  "message": "Opóźnienie 15 minut z powodu korku. Proszę o cierpliwość!"
}
```

**Response (sukces):**
```json
{
  "detail": "Powiadomienie wysłane do 3 pasażera/ów.",
  "notifications_sent": 3,
  "total_passengers": 3
}
```

**Response (błąd - brak pasażerów):**
```json
{
  "detail": "Brak pasażerów z aktywnymi rezerwacjami w tym przejeździe."
}
```

**Response (błąd - brak uprawnień):**
```json
{
  "detail": "Nie masz uprawnień do wysyłania powiadomień dla tego przejazdu."
}
```

## Scenariusz Testowy

### Przygotowanie:
1. Zaloguj się jako kierowca
2. Utwórz nowy przejazd
3. Zaloguj się jako pasażer (inna przeglądarka/incognito)
4. Zarezerwuj miejsce w przejeździe
5. Zaloguj się ponownie jako kierowca
6. Zaakceptuj rezerwację

### Test:
1. Przejdź do "Moje Przejazdy" (`/my-trips`)
2. Znajdź przejazd z pasażerami
3. Kliknij przycisk "Wyślij powiadomienie" (ikona dzwonka)
4. Wpisz wiadomość, np.:
   - "Opóźnienie 15 minut"
   - "Zmiana miejsca spotkania na parking przy dworcu"
   - "Wyjazd o 5 minut wcześniej"
5. Kliknij "Wyślij"
6. Zaloguj się jako pasażer
7. Sprawdź powiadomienia (ikona dzwonka w prawym górnym rogu)
8. Zobaczysz powiadomienie od kierowcy z treścią wiadomości

## Model Notification - Nowy Typ

Dodany nowy typ powiadomienia:
- **Type:** `driver_message`
- **Display:** "Wiadomość od kierowcy"

**Format wiadomości:**
```
Wiadomość od kierowcy (Warszawa → Kraków, 2026-01-22): Opóźnienie 15 minut z powodu korku. Proszę o cierpliwość!
```

## Walidacja

Backend sprawdza:
- ✅ Czy użytkownik jest kierowcą tego przejazdu
- ✅ Czy wiadomość nie jest pusta
- ✅ Czy są pasażerowie z aktywnymi rezerwacjami
- ✅ Czy pasażer ma włączone powiadomienia (notifications_enabled)

Frontend sprawdza:
- ✅ Czy wiadomość nie jest pusta przed wysłaniem

## Logi

Backend loguje:
```
INFO: Driver username sent notification to N passengers for trip ID: message_preview
```

## Konfiguracja

Pasażerowie mogą wyłączyć powiadomienia w ustawieniach profilu:
- `/profile` → "Powiadomienia włączone" (przełącznik)
- Jeśli wyłączone, nie otrzymają powiadomień od kierowcy

## Testowanie przez API (curl)

```bash
# Pobierz token (login jako kierowca)
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "driver1", "password": "password123"}'

# Wyślij powiadomienie (użyj tokenu z poprzedniego requestu)
curl -X POST http://localhost:8000/api/trips/1/notify_passengers/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"message": "Opóźnienie 15 minut"}'

# Sprawdź powiadomienia jako pasażer
curl -X GET http://localhost:8000/api/notifications/ \
  -H "Authorization: Bearer PASSENGER_ACCESS_TOKEN"
```

## UI

### Przycisk w MyTrips.tsx:
- **Ikona:** Dzwonek (Notifications)
- **Tekst:** "Wyślij powiadomienie"
- **Kolor:** Niebieski (#e3f2fd background)
- **Pozycja:** Obok przycisku "Pasażerowie"

### Dialog:
- **Tytuł:** "Wyślij powiadomienie pasażerom"
- **Opis:** Informacja o przejeździe i liczbie pasażerów
- **Pole tekstowe:** Multiline (4 wiersze)
- **Przyciski:** "Anuluj" i "Wyślij"

## Integracja

Funkcjonalność jest w pełni zintegrowana z:
- ✅ Systemem powiadomień
- ✅ Systemem rezerwacji
- ✅ Ustawieniami użytkownika (notifications_enabled)
- ✅ Frontend (React + Material-UI)
- ✅ Backend (Django REST Framework)
