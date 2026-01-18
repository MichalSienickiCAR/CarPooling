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

Aplikacja została rozszerzona o kompletny system społecznościowy, który pozwala użytkownikom:
- Budować sieć zaufanych współpodróżnych
- Łatwo znaleźć i dodać znajomych
- Zgłaszać problemy administracji
- Komunikować się przez wbudowany czat

Wszystkie funkcjonalności zostały w pełni zaimplementowane i przetestowane!
