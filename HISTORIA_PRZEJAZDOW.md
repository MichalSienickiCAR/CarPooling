# Historia Przejazdów - Dokumentacja

## Funkcjonalność
Użytkownicy mogą przeglądać historię swoich zakończonych przejazdów - zarówno jako kierowca, jak i jako pasażer. Pozwala to śledzić swoją aktywność w aplikacji.

## Endpointy Backend

### 1. GET /api/trips/history/
**Opis:** Historia zakończonych przejazdów kierowcy

**Uprawnienia:** Tylko zalogowani użytkownicy (kierowcy)

**Parametry:** Brak

**Response:**
```json
[
  {
    "id": 1,
    "driver": 1,
    "driver_username": "kierowca1",
    "start_location": "Warszawa",
    "end_location": "Kraków",
    "date": "2026-01-15",
    "time": "10:00:00",
    "available_seats": 3,
    "price_per_seat": "30.00",
    "completed": true,
    "completed_at": "2026-01-15T14:30:00Z",
    "bookings": [
      {
        "id": 1,
        "passenger_username": "pasazer1",
        "seats": 2,
        "status": "paid"
      }
    ]
  }
]
```

**Filtrowanie:**
- Tylko przejazdy z `completed=True`
- Tylko przejazdy zalogowanego użytkownika (`driver=request.user`)
- Sortowanie: `-completed_at, -date, -time` (najnowsze pierwsze)

### 2. GET /api/bookings/history/
**Opis:** Historia zakończonych rezerwacji pasażera

**Uprawnienia:** Tylko zalogowani użytkownicy (pasażerowie)

**Parametry zapytania:**
- `status` (opcjonalny) - filtruj po statusie (np. `?status=paid`)

**Response:**
```json
[
  {
    "id": 1,
    "passenger": 2,
    "passenger_username": "pasazer1",
    "seats": 2,
    "status": "paid",
    "paid_at": "2026-01-14T12:00:00Z",
    "created_at": "2026-01-10T10:00:00Z",
    "trip_start_location": "Warszawa",
    "trip_end_location": "Kraków",
    "trip_date": "2026-01-15",
    "trip_time": "10:00:00",
    "trip_price_per_seat": "30.00",
    "driver_username": "kierowca1",
    "trip_details": {
      "id": 1,
      "start_location": "Warszawa",
      "end_location": "Kraków",
      "date": "2026-01-15",
      "time": "10:00:00",
      "price_per_seat": "30.00",
      "driver_username": "kierowca1"
    }
  }
]
```

**Filtrowanie:**
- Tylko rezerwacje z zakończonych przejazdów (`trip.completed=True`)
- Tylko rezerwacje zalogowanego użytkownika (`passenger=request.user`)
- Opcjonalnie po statusie
- Sortowanie: `-trip__completed_at, -trip__date, -trip__time` (najnowsze pierwsze)

## Frontend

### Komponent: History.tsx
**Route:** `/history`

**Funkcje:**
- Automatyczne wykrywanie roli użytkownika (`driver` lub `passenger`)
- Wyświetlanie odpowiedniej historii na podstawie roli
- Ładowanie danych przy montowaniu komponentu
- Przyjazny UI z Material-UI
- Obsługa stanów: ładowanie, pusty stan, lista z danymi

### Widok Kierowcy
Wyświetla:
- Lista zakończonych przejazdów
- Dla każdego przejazdu:
  - Trasa (start → koniec)
  - Data i godzina
  - Data zakończenia
  - Cena za miejsce
  - Liczba miejsc
  - Liczba pasażerów
  - Badge "Zakończony"
  - Punkty pośrednie (jeśli są)

### Widok Pasażera
Wyświetla:
- Lista zakończonych rezerwacji
- Dla każdej rezerwacji:
  - Trasa (start → koniec)
  - Data i godzina
  - Kierowca
  - Status rezerwacji (badge: opłacone, zaakceptowane, anulowane)
  - Liczba miejsc
  - Całkowita cena
  - Data rezerwacji
  - Data opłacenia (jeśli opłacone)

### API Service
**Funkcje:**
```typescript
// Dla kierowcy
async getTripHistory(): Promise<Trip[]>

// Dla pasażera
async getBookingHistory(status?: string): Promise<Booking[]>
```

## Routing

### App.tsx
```typescript
<Route element={<ProtectedRoute />}> 
  <Route path="/history" element={<History />} />
</Route>
```

**Dostęp:** Wszyscy zalogowani użytkownicy (zarówno kierowcy, jak i pasażerowie)

### Nawigacja
**DriverDashboard.tsx:**
- Nowy kafelek "Historia" (pomarańczowa ikona History)
- onClick: `navigate('/history')`

**PassengerDashboard.tsx:**
- Nowy kafelek "Historia" (pomarańczowa ikona History)
- onClick: `navigate('/history')`

## Modele Backend

### Trip
```python
completed = models.BooleanField(default=False)
completed_at = models.DateTimeField(null=True, blank=True)
```

### Booking
Brak zmian w modelu, rozszerzony serializer.

## Serializers

### TripSerializer
Zawiera pola:
- `completed` (bool)
- `completed_at` (datetime, nullable)

### BookingSerializer
Dodane pola:
- `trip_start_location` (ReadOnly)
- `trip_end_location` (ReadOnly)
- `trip_date` (ReadOnly)
- `trip_time` (SerializerMethodField)
- `trip_price_per_seat` (ReadOnly)
- `driver_username` (ReadOnly)
- `paid_at` (DateTime, ReadOnly)

## TypeScript Interfaces

### Trip
```typescript
export interface Trip {
  // ... inne pola
  completed?: boolean;
  completed_at?: string | null;
}
```

### Booking
```typescript
export interface Booking {
  // ... inne pola
  trip_start_location?: string;
  trip_end_location?: string;
  trip_date?: string;
  trip_time?: string;
  trip_price_per_seat?: number | string;
  driver_username?: string;
  paid_at?: string | null;
}
```

## Scenariusz Testowy

### Przygotowanie:
1. Utwórz konto kierowcy i dodaj przejazd
2. Utwórz konto pasażera i zarezerwuj miejsce
3. Jako kierowca, zaakceptuj rezerwację
4. Jako pasażer, opłać rezerwację
5. Jako kierowca, oznacz przejazd jako zakończony (POST `/api/trips/{id}/complete_trip/`)

### Test Kierowcy:
1. Zaloguj się jako kierowca
2. Przejdź do panelu głównego
3. Kliknij kafelek "Historia"
4. Zweryfikuj:
   - ✅ Widoczny zakończony przejazd
   - ✅ Poprawna trasa i data
   - ✅ Data zakończenia wyświetlona
   - ✅ Liczba pasażerów poprawna
   - ✅ Badge "Zakończony" widoczny

### Test Pasażera:
1. Zaloguj się jako pasażer
2. Przejdź do panelu głównego
3. Kliknij kafelek "Historia"
4. Zweryfikuj:
   - ✅ Widoczna zakończona rezerwacja
   - ✅ Poprawna trasa, data i kierowca
   - ✅ Status "Opłacone" z zielonym badge
   - ✅ Data opłacenia wyświetlona
   - ✅ Całkowita cena poprawna

### Test API (curl):
```bash
# Login jako kierowca
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "driver1", "password": "password123"}' \
  | jq -r '.access')

# Pobierz historię przejazdów kierowcy
curl -X GET http://localhost:8000/api/trips/history/ \
  -H "Authorization: Bearer $TOKEN" | jq

# Login jako pasażer
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "passenger1", "password": "password123"}' \
  | jq -r '.access')

# Pobierz historię rezerwacji pasażera
curl -X GET http://localhost:8000/api/bookings/history/ \
  -H "Authorization: Bearer $TOKEN" | jq

# Filtrowanie po statusie
curl -X GET "http://localhost:8000/api/bookings/history/?status=paid" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Walidacja

### Backend:
- ✅ Tylko zalogowani użytkownicy
- ✅ Kierowca widzi tylko swoje przejazdy
- ✅ Pasażer widzi tylko swoje rezerwacje
- ✅ Tylko zakończone przejazdy w historii
- ✅ Poprawne sortowanie (najnowsze pierwsze)

### Frontend:
- ✅ Automatyczne wykrywanie roli
- ✅ Obsługa stanu ładowania
- ✅ Przyjazny komunikat gdy brak danych
- ✅ Responsywny layout
- ✅ Kolorowe badge dla statusów

## Style UI

### Kafelek Historia w Dashboard:
- Kolor: Pomarańczowy (#ff5722)
- Ikona: History (zegar)
- Hover: Efekt podniesienia + pomarańczowy border
- Pozycja: W trzecim rzędzie kafelków

### Komponenty:
- Paper z rounded corners (16px)
- Gradient shadows na hover
- Chips dla statusów (kolorowe)
- Divide line między informacjami
- Icons: CheckCircle (zakończony), ArrowForward (kierunek)

## Logowanie

Backend loguje:
```python
logger.info(f"Driver {username} viewed trip history: {count} completed trips found")
logger.info(f"Passenger {username} viewed booking history: {count} completed bookings found")
```

## Integracja

Funkcjonalność jest w pełni zintegrowana z:
- ✅ Systemem przejazdów (Trip model)
- ✅ Systemem rezerwacji (Booking model)
- ✅ Systemem zakończania przejazdów (`complete_trip` action)
- ✅ Autentykacją użytkowników
- ✅ Dashboard kierowcy i pasażera
- ✅ Routing aplikacji
- ✅ Material-UI theme

## Przyszłe rozszerzenia

Możliwe ulepszenia:
- Filtrowanie po dacie (zakres dat)
- Wyszukiwanie po trasie
- Eksport do PDF/CSV
- Statystyki (łączny dystans, łączny zarobek itp.)
- Wykresy aktywności
- Oceny w historii
