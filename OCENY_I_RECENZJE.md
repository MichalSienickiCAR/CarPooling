# System Ocen i Recenzji (PT2025NFCP-16)

## Podsumowanie

Zaimplementowano kompletny system ocen i recenzji dla użytkowników aplikacji carpoolingowej Sheero.

## Zaimplementowane Funkcjonalności

### Backend (Django REST Framework)

#### Model Review
Model już istniał w bazie danych z następującymi polami:
- `reviewer` - użytkownik wystawiający recenzję
- `reviewed_user` - użytkownik oceniany
- `trip` - przejazd, którego dotyczy recenzja
- `booking` - rezerwacja (opcjonalnie)
- `rating` - ocena w skali 1-5
- `comment` - komentarz (opcjonalnie, max 500 znaków)
- `created_at` - data utworzenia

Unikalność: Jeden użytkownik może wystawić tylko jedną recenzję danemu użytkownikowi za konkretny przejazd (`unique_together = ('reviewer', 'trip', 'reviewed_user')`).

#### API Endpoints
Wszystkie endpointy już były zaimplementowane:

- `GET /api/reviews/` - lista recenzji (z filtrami: trip, reviewed_user, as_reviewer)
- `POST /api/reviews/` - dodanie nowej recenzji
- `GET /api/reviews/{id}/` - szczegóły recenzji
- `PATCH /api/reviews/{id}/` - aktualizacja recenzji
- `DELETE /api/reviews/{id}/` - usunięcie recenzji
- `GET /api/reviews/my_reviews/` - recenzje wystawione przez użytkownika
- `GET /api/reviews/received_reviews/` - recenzje otrzymane przez użytkownika

#### Zmiany w Backendzie

**Plik: `backend/api/serializers.py`**
- Dodano `id` kierowcy do `driver_profile` w `BookingSerializer.get_trip_details()` - niezbędne do prawidłowego działania funkcji oceniania kierowców

### Frontend (React + TypeScript + Material-UI)

#### Nowe Komponenty

**1. `Reviews.tsx`**
- Wyświetla recenzje użytkownika w dwóch zakładkach:
  - **Otrzymane** - pokazuje średnią ocenę i listę otrzymanych recenzji
  - **Wystawione** - lista recenzji wystawionych przez użytkownika
- Każda recenzja zawiera:
  - Ocenę gwiazdkową (1-5)
  - Nazwę użytkownika
  - Informacje o przejeździe
  - Komentarz (jeśli został dodany)
  - Datę wystawienia recenzji

**2. `AddReviewDialog.tsx`**
- Dialog do wystawiania nowych recenzji
- Zawiera:
  - Wybór oceny (gwiazdki 1-5) - pole wymagane
  - Pole tekstowe na komentarz (opcjonalne, max 500 znaków)
  - Informacje o ocenianym użytkowniku i przejeździe
  - Walidację przed wysłaniem
  - Obsługę błędów (np. duplikat recenzji)

#### Zmodyfikowane Komponenty

**`History.tsx`**
- Dodano możliwość wystawiania recenzji po zakończonych przejazdach:
  - **Dla kierowców**: przyciski "Oceń [username]" dla każdego pasażera
  - **Dla pasażerów**: przycisk "Oceń kierowcę" dla opłaconych/zaakceptowanych rezerwacji
- Integracja z `AddReviewDialog`
- Powiadomienie o sukcesie po dodaniu recenzji

**`DriverDashboard.tsx` i `PassengerDashboard.tsx`**
- Dodano nową sekcję "Recenzje" z ikoną gwiazdki
- Przekierowanie do strony `/reviews`
- Spójny design z pozostałymi sekcjami dashboardu

**`App.tsx`**
- Dodano routing dla strony `/reviews`
- Chroniony endpointem wymagającym autoryzacji

#### Serwisy API

**Plik: `frontend/src/services/api.ts`**

Dodano interfejsy:
```typescript
interface Review {
  id: number;
  reviewer: number;
  reviewer_username: string;
  reviewed_user: number;
  reviewed_user_username: string;
  trip: number;
  trip_info: TripInfo;
  booking?: number;
  rating: number;
  comment: string;
  created_at: string;
}

interface CreateReviewData {
  reviewed_user: number;
  trip: number;
  booking?: number;
  rating: number;
  comment?: string;
}
```

Dodano `reviewService` z metodami:
- `getMyReviews()` - pobiera recenzje wystawione przez użytkownika
- `getReceivedReviews()` - pobiera recenzje otrzymane przez użytkownika
- `getReviewsByTrip(tripId)` - pobiera recenzje dla konkretnego przejazdu
- `getReviewsByUser(userId)` - pobiera recenzje dla konkretnego użytkownika
- `createReview(data)` - tworzy nową recenzję
- `updateReview(reviewId, data)` - aktualizuje recenzję
- `deleteReview(reviewId)` - usuwa recenzję

#### Zależności

**Plik: `frontend/package.json`**
- Dodano `date-fns: ^2.30.0` - do formatowania dat w recenzjach

## Instalacja i Uruchomienie

### Backend

Nie wymaga dodatkowych kroków - model i API już istniały.

### Frontend

1. Zainstaluj nowe zależności:
```bash
cd frontend
npm install
```

2. Uruchom aplikację:
```bash
npm start
```

## Użycie Systemu

### Dla Pasażerów:
1. Po zakończonym przejeździe przejdź do **Historia**
2. Przy opłaconej/zaakceptowanej rezerwacji pojawi się przycisk **"Oceń kierowcę"**
3. Kliknij przycisk, wybierz ocenę (1-5 gwiazdek) i opcjonalnie dodaj komentarz
4. Zobacz swoje recenzje w sekcji **Recenzje** w dashboardzie

### Dla Kierowców:
1. Po zakończonym przejeździe przejdź do **Historia**
2. Przy każdym pasażerze pojawi się przycisk **"Oceń [username]"**
3. Kliknij przycisk, wybierz ocenę i opcjonalnie dodaj komentarz
4. Zobacz swoje recenzje w sekcji **Recenzje** w dashboardzie

### Przeglądanie Recenzji:
1. W dashboardzie kliknij na kafelek **"Recenzje"** (żółta ikona gwiazdki)
2. Zobacz zakładkę **"Otrzymane"** ze średnią oceną
3. Zobacz zakładkę **"Wystawione"** z listą wystawionych przez Ciebie recenzji

## Walidacja i Zabezpieczenia

- ✅ Użytkownik może wystawić tylko jedną recenzję danemu użytkownikowi za konkretny przejazd
- ✅ Ocena musi być w zakresie 1-5
- ✅ Komentarz może mieć maksymalnie 500 znaków
- ✅ Tylko zalogowani użytkownicy mogą wystawiać recenzje
- ✅ Walidacja duplikatów obsługiwana przez backend (unique_together)
- ✅ Przyjazne komunikaty błędów dla użytkownika

## Charakterystyka UX/UI

- 🎨 Spójny design z resztą aplikacji (Material-UI)
- ⭐ Intuicyjny system gwiazdek do oceny
- 📊 Wyświetlanie średniej oceny w czytelnej formie
- 📱 Responsywny design (mobile-friendly)
- 🔔 Powiadomienia o sukcesie/błędzie (snackbar)
- 🎯 Kontekstowe informacje o przejeździe przy każdej recenzji

## Pliki Zmodyfikowane/Utworzone

### Backend
- ✏️ `backend/api/serializers.py` - dodano `id` do driver_profile

### Frontend
- ✨ `frontend/src/components/Reviews.tsx` - NOWY
- ✨ `frontend/src/components/AddReviewDialog.tsx` - NOWY
- ✏️ `frontend/src/components/History.tsx`
- ✏️ `frontend/src/components/DriverDashboard.tsx`
- ✏️ `frontend/src/components/PassengerDashboard.tsx`
- ✏️ `frontend/src/App.tsx`
- ✏️ `frontend/src/services/api.ts`
- ✏️ `frontend/package.json`

## Testowanie

### Scenariusze testowe:

1. **Wystawienie recenzji jako pasażer**
   - Zakończ przejazd jako pasażer
   - Przejdź do historii
   - Kliknij "Oceń kierowcę"
   - Wybierz ocenę i dodaj komentarz
   - Sprawdź czy recenzja pojawiła się w zakładce "Wystawione"

2. **Wystawienie recenzji jako kierowca**
   - Zakończ przejazd jako kierowca
   - Przejdź do historii
   - Kliknij "Oceń [pasażer]"
   - Wybierz ocenę i dodaj komentarz
   - Sprawdź czy recenzja pojawiła się w zakładce "Wystawione"

3. **Przeglądanie otrzymanych recenzji**
   - Przejdź do sekcji "Recenzje"
   - Sprawdź zakładkę "Otrzymane"
   - Zweryfikuj średnią ocenę
   - Sprawdź szczegóły każdej recenzji

4. **Walidacja duplikatów**
   - Spróbuj wystawić drugą recenzję dla tego samego użytkownika za ten sam przejazd
   - Sprawdź czy system wyświetla odpowiedni błąd

## Możliwe Rozszerzenia (Future Enhancements)

- [ ] Możliwość odpowiadania na recenzje
- [ ] System zgłaszania niewłaściwych recenzji
- [ ] Edycja własnych recenzji w określonym czasie
- [ ] Filtrowanie recenzji (najnowsze, najstarsze, najwyższe oceny)
- [ ] Wyświetlanie średniej oceny w profilu użytkownika widocznym dla innych
- [ ] Wyświetlanie średniej oceny kierowcy przy szczegółach przejazdu
- [ ] Statystyki recenzji (rozkład ocen 1-5)
- [ ] Przypomnienia o wystawieniu recenzji po przejeździe

## Status

✅ **UKOŃCZONE** - System ocen i recenzji w pełni funkcjonalny i zintegrowany z aplikacją.
