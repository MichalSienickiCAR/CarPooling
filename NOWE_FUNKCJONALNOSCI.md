# Nowe Funkcjonalności - System Społecznościowy

## 📋 Przegląd

Zaimplementowano pełny system społecznościowy w aplikacji carpooling, który obejmuje:

1. **System Znajomych** - Dodawanie, zarządzanie i wyszukiwanie znajomych
2. **Zaufani Użytkownicy** - Oznaczanie użytkowników jako zaufanych po pozytywnych przejazdach
3. **System Zgłoszeń** - Zgłaszanie niewłaściwego zachowania użytkowników
4. **Wbudowany Czat** - Komunikacja między kierowcą a pasażerem (już istniejący, rozszerzony)

## 🎯 Funkcjonalności

### 1. System Znajomych (`/friends`)

**Funkcje:**
- Wyszukiwanie użytkowników po nazwie użytkownika, imieniu lub nazwisku
- Wysyłanie zaproszeń do znajomych
- Akceptacja/odrzucanie zaproszeń
- Lista znajomych
- Usuwanie znajomych
- Statusy znajomości: oczekujące, zaakceptowane, odrzucone, zablokowane

**Backend API:**
- `GET /api/friendships/` - Lista wszystkich znajomości
- `GET /api/friendships/my_friends/` - Lista zaakceptowanych znajomych
- `GET /api/friendships/pending_requests/` - Oczekujące zaproszenia
- `GET /api/friendships/sent_requests/` - Wysłane zaproszenia
- `POST /api/friendships/` - Wysłanie zaproszenia
- `POST /api/friendships/{id}/accept/` - Akceptacja zaproszenia
- `POST /api/friendships/{id}/reject/` - Odrzucenie zaproszenia
- `POST /api/friendships/{id}/block/` - Zablokowanie użytkownika
- `DELETE /api/friendships/{id}/` - Usunięcie znajomości
- `POST /api/friendships/search_users/` - Wyszukiwanie użytkowników

**Frontend:**
- Komponent: `Friends.tsx`
- Style: `Friends.css`
- Route: `/friends`

### 2. Zaufani Użytkownicy (`/trusted-users`)

**Funkcje:**
- Dodawanie użytkowników do listy zaufanych (po wspólnym przejeździe)
- Przeglądanie listy zaufanych użytkowników
- Dodawanie notatek do zaufanych użytkowników
- Usuwanie z listy zaufanych
- Widoczność przejazdu, po którym dodano użytkownika

**Backend API:**
- `GET /api/trusted-users/` - Lista zaufanych użytkowników
- `GET /api/trusted-users/my_trusted/` - Moja lista zaufanych
- `POST /api/trusted-users/` - Dodanie użytkownika do zaufanych
- `PATCH /api/trusted-users/{id}/` - Aktualizacja notatki
- `DELETE /api/trusted-users/{id}/` - Usunięcie z zaufanych
- `POST /api/trusted-users/check_trusted/` - Sprawdzenie czy użytkownik jest zaufany

**Frontend:**
- Komponent: `TrustedUsers.tsx`
- Style: `TrustedUsers.css`
- Route: `/trusted-users`

**Integracja:**
- Przyciski w `TripDetails.tsx` do dodawania kierowcy jako zaufanego
- Ikonka serca (pusta/wypełniona) pokazuje status zaufanego użytkownika

### 3. System Zgłoszeń

**Funkcje:**
- Zgłaszanie niewłaściwego zachowania użytkowników
- Kategorie zgłoszeń:
  - Niewłaściwe zachowanie
  - Nękanie
  - Nie pojawienie się
  - Niebezpieczna jazda
  - Oszustwo
  - Inne
- Szczegółowy opis zgłoszenia (min. 10 znaków)
- Powiązanie z konkretnym przejazdem
- Statusy zgłoszeń: oczekujące, w trakcie weryfikacji, rozwiązane, odrzucone

**Backend API:**
- `GET /api/reports/` - Lista zgłoszeń użytkownika
- `GET /api/reports/my_reports/` - Moje zgłoszenia
- `POST /api/reports/` - Utworzenie zgłoszenia
- `GET /api/reports/{id}/` - Szczegóły zgłoszenia
- `GET /api/reports/statistics/` - Statystyki zgłoszeń

**Frontend:**
- Komponent: `ReportUser.tsx` (Modal)
- Style: `ReportUser.css`
- Przycisk "Zgłoś" w `TripDetails.tsx`

### 4. System Czatu (rozszerzony)

**Funkcje istniejące:**
- Czat między kierowcą a pasażerem w kontekście rezerwacji
- Wiadomości powiązane z konkretną rezerwacją
- Status przeczytania wiadomości
- Licznik nieprzeczytanych wiadomości

**Backend API (istniejące):**
- `GET /api/messages/` - Lista wiadomości
- `POST /api/messages/` - Wysłanie wiadomości
- `GET /api/messages/by_booking/{booking_id}/` - Wiadomości dla rezerwacji
- `POST /api/messages/{id}/mark_as_read/` - Oznaczenie jako przeczytane
- `GET /api/messages/unread_count/` - Liczba nieprzeczytanych

## 🗄️ Modele Bazy Danych

### Friendship
```python
- requester: User (ForeignKey) - Wysyłający zaproszenie
- receiver: User (ForeignKey) - Otrzymujący zaproszenie
- status: CharField - Status (pending/accepted/rejected/blocked)
- created_at: DateTimeField
- updated_at: DateTimeField
```

### TrustedUser
```python
- user: User (ForeignKey) - Użytkownik dodający do zaufanych
- trusted_user: User (ForeignKey) - Zaufany użytkownik
- trip: Trip (ForeignKey, optional) - Przejazd
- note: TextField - Notatka
- created_at: DateTimeField
```

### Report
```python
- reporter: User (ForeignKey) - Zgłaszający
- reported_user: User (ForeignKey) - Zgłaszany użytkownik
- trip: Trip (ForeignKey, optional) - Przejazd
- reason: CharField - Powód zgłoszenia
- description: TextField - Opis
- status: CharField - Status (pending/under_review/resolved/dismissed)
- admin_notes: TextField - Notatki administratora
- created_at: DateTimeField
- resolved_at: DateTimeField (nullable)
```

## 🎨 UI/UX

### Dostęp do funkcjonalności:
1. **Driver Dashboard:** Karty na stronie głównej kierowcy
   - "Znajomi" (fioletowa karta)
   - "Zaufani Użytkownicy" (zielona karta)

2. **Passenger Dashboard:** Karty na stronie głównej pasażera
   - "Znajomi" (fioletowa karta)
   - "Zaufani Użytkownicy" (zielona karta)

3. **Trip Details:** Przyciski pod informacjami o kierowcy
   - "Dodaj do zaufanych" / "Zaufany" (z ikoną serca)
   - "Zgłoś" (z ikoną zgłoszenia)

### Design:
- Spójny design z resztą aplikacji
- Karty z hover effects
- Responsywny layout (mobile-friendly)
- Intuicyjne ikony i kolory
- Material-UI Icons dla spójności

## 📦 Pliki projektu

### Backend:
- `backend/api/models.py` - Nowe modele: Friendship, TrustedUser, Report
- `backend/api/serializers.py` - Serializery dla nowych modeli
- `backend/api/views.py` - ViewSets: FriendshipViewSet, TrustedUserViewSet, ReportViewSet
- `backend/api/urls.py` - Nowe endpointy
- `backend/api/migrations/0003_*.py` - Migracje bazy danych

### Frontend:
- `frontend/src/components/Friends.tsx` - Komponent zarządzania znajomymi
- `frontend/src/components/Friends.css` - Style
- `frontend/src/components/TrustedUsers.tsx` - Komponent zaufanych użytkowników
- `frontend/src/components/TrustedUsers.css` - Style
- `frontend/src/components/ReportUser.tsx` - Modal zgłaszania użytkowników
- `frontend/src/components/ReportUser.css` - Style
- `frontend/src/components/TripDetails.tsx` - Rozszerzony o nowe funkcje
- `frontend/src/components/DriverDashboard.tsx` - Dodane nowe karty
- `frontend/src/components/PassengerDashboard.tsx` - Dodane nowe karty
- `frontend/src/services/api.ts` - Nowe funkcje API
- `frontend/src/App.tsx` - Nowe route'y

## 🚀 Uruchamianie

Migracje zostały już zastosowane. Serwer powinien działać z nowymi funkcjonalnościami.

### Restart serwera (jeśli potrzebny):
```bash
# Backend
cd backend
python3 manage.py runserver

# Frontend (w nowym terminalu)
cd frontend
npm start
```

## ✅ Testowanie

### Scenariusze testowe:

1. **System Znajomych:**
   - Wyszukaj użytkownika
   - Wyślij zaproszenie
   - Zaakceptuj/odrzuć zaproszenie jako drugi użytkownik
   - Usuń znajomego

2. **Zaufani Użytkownicy:**
   - Otwórz szczegóły przejazdu
   - Kliknij "Dodaj do zaufanych"
   - Sprawdź listę zaufanych użytkowników
   - Dodaj notatkę do zaufanego użytkownika

3. **Zgłoszenia:**
   - Otwórz szczegóły przejazdu
   - Kliknij "Zgłoś"
   - Wypełnij formularz zgłoszenia
   - Wyślij zgłoszenie

### 5. Powiadomienia Kierowcy dla Pasażerów

**Funkcje:**
- Kierowca może wysłać wiadomość/powiadomienie do wszystkich pasażerów z aktywnymi rezerwacjami
- Przydatne do informowania o opóźnieniach, zmianie miejsca spotkania itp.
- Powiadomienia trafiają do centrum powiadomień pasażerów

**Backend API:**
- `POST /api/trips/{id}/notify_passengers/` - Wyślij powiadomienie do wszystkich pasażerów
  - Body: `{ "message": "treść wiadomości" }`
  - Tylko kierowca przejazdu może wysłać powiadomienie
  - Powiadomienia są wysyłane tylko do pasażerów z aktywnymi rezerwacjami (reserved, accepted, paid)
  - Respektuje ustawienia powiadomień użytkowników

**Frontend:**
- Komponent: `MyTrips.tsx` - dodany przycisk "Wyślij powiadomienie"
- Dialog do wprowadzenia wiadomości
- Route: `/my-trips`

**Model Notification:**
- Dodany nowy typ powiadomienia: `driver_message`
- Powiadomienie zawiera informacje o przejeździe i wiadomość od kierowcy

**Jak używać:**
1. Jako kierowca, przejdź do "Moje Przejazdy"
2. Wybierz przejazd, dla którego chcesz wysłać powiadomienie
3. Kliknij przycisk "Wyślij powiadomienie"
4. Wpisz wiadomość (np. "Opóźnienie 15 min", "Zmiana miejsca spotkania na parking przy dworcu")
5. Wyślij - wszyscy pasażerowie z aktywnymi rezerwacjami otrzymają powiadomienie

### 6. Historia Przejazdów

**Funkcje:**
- Przeglądanie zakończonych przejazdów jako kierowca
- Przeglądanie zakończonych rezerwacji jako pasażer
- Szczegółowe informacje o każdym przejeździe (data, cena, pasażerowie)
- Informacje o statusie rezerwacji i płatnościach

**Backend API:**
- `GET /api/trips/history/` - Historia zakończonych przejazdów kierowcy
  - Zwraca tylko przejazdy z `completed=True`
  - Sortowanie według daty zakończenia
- `GET /api/bookings/history/` - Historia zakończonych rezerwacji pasażera
  - Zwraca tylko rezerwacje z zakończonych przejazdów (`trip.completed=True`)
  - Opcjonalny filtr `?status=paid` do filtrowania po statusie
  - Sortowanie według daty zakończenia przejazdu

**Frontend:**
- Komponent: `History.tsx`
- Route: `/history`
- Dostępny z dashboardów kierowcy i pasażera
- Automatyczne wykrywanie roli użytkownika i wyświetlanie odpowiedniej historii

**Modele:**
- Trip: pola `completed` (boolean), `completed_at` (datetime)
- Booking: rozszerzone serializery o informacje o przejeździe

**Jak używać:**
1. Przejdź do panelu głównego (Dashboard)
2. Kliknij kafelek "Historia" (pomarańczowa ikona zegara)
3. Zobacz listę zakończonych przejazdów:
   - Kierowca: widzi swoje zakończone przejazdy z informacją o pasażerach
   - Pasażer: widzi swoje zakończone rezerwacje z informacją o kierowcy i statusie

## 🔐 Bezpieczeństwo

- Użytkownik nie może dodać siebie do znajomych/zaufanych
- Użytkownik nie może zgłosić samego siebie
- Walidacja danych po stronie backendu
- Zabezpieczenie przed duplikatami (unique_together)
- Wymóg autentykacji dla wszystkich endpointów

## 📝 Notatki

- System czatu był już zaimplementowany i działa z istniejącym komponentem Messages
- Wszystkie nowe funkcjonalności są w pełni zintegrowane z istniejącym systemem
- UI jest spójny z resztą aplikacji
- Wszystkie komponenty są responsywne

## 🎉 Podsumowanie

Aplikacja została rozszerzona o kompletny system społecznościowy oraz funkcje komunikacji i śledzenia aktywności, która pozwala użytkownikom:
- Budować sieć zaufanych współpodróżnych
- Łatwo znaleźć i dodać znajomych
- Zgłaszać problemy administracji
- Komunikować się przez wbudowany czat
- **[NOWE] Kierowcy mogą wysyłać grupowe powiadomienia do wszystkich pasażerów o zmianach w przejeździe**
- **[NOWE] Użytkownicy mogą przeglądać historię swoich zakończonych przejazdów jako kierowca lub pasażer**

Wszystkie funkcjonalności zostały w pełni zaimplementowane i przetestowane!
