# Dodanie formularza tworzenia przejazdu przez kierowcę

## Opis zadania
Zaimplementowano funkcjonalność umożliwiającą kierowcom łatwe dodawanie nowych przejazdów poprzez intuicyjny formularz. Kierowca może podać wszystkie niezbędne informacje o przejeździe, w tym punkty pośrednie, datę, godzinę, liczbę dostępnych miejsc oraz sugerowaną cenę.

## User Story
**Jako** Kierowca  
**Chcę** móc łatwo dodać nowy przejazd poprzez formularz, podając punkt początkowy, docelowy (oraz ewentualne punkty pośrednie), datę, godzinę, liczbę dostępnych miejsc oraz sugerowaną cenę (udział w kosztach)  
**Aby** zaoferować podwózkę innym

## Zaimplementowane funkcje

### Backend (Django REST Framework)
- ✅ **Model Trip** - utworzono model przejazdu z następującymi polami:
  - Punkt początkowy i docelowy
  - Punkty pośrednie (JSON, opcjonalne)
  - Data i godzina przejazdu
  - Liczba dostępnych miejsc (min. 1)
  - Cena za miejsce (udział w kosztach)
  - Automatyczne przypisanie kierowcy (zalogowany użytkownik)
  - Timestamps (created_at, updated_at)

- ✅ **API Endpoints**:
  - `POST /api/trips/create/` - tworzenie nowego przejazdu
  - `GET /api/trips/` - lista wszystkich przejazdów
  - Wymagana autentykacja JWT

- ✅ **Serializer TripSerializer** - walidacja danych i automatyczne ustawienie kierowcy

- ✅ **Panel administracyjny** - zarejestrowano model Trip w Django Admin

### Frontend (React + TypeScript + Material-UI)
- ✅ **Komponent AddTrip** - formularz z następującymi funkcjami:
  - Walidacja wszystkich pól (Formik + Yup)
  - Dynamiczne dodawanie/usuwanie punktów pośrednich
  - Responsywny layout (dostosowany do różnych rozmiarów ekranu)
  - Obsługa błędów z wyświetlaniem komunikatów
  - Spójny design z resztą aplikacji

- ✅ **Komponent Dashboard** - panel główny z przyciskiem do dodawania przejazdów

- ✅ **Integracja z routingiem**:
  - `/dashboard` - panel główny
  - `/trips/add` - formularz dodawania przejazdu

- ✅ **Serwis API** - metody `createTrip()` i `getTrips()` w `services/api.ts`

## Pliki zmodyfikowane/dodane

### Backend
- `backend/api/models.py` - dodano model Trip
- `backend/api/serializers.py` - dodano TripSerializer
- `backend/api/views.py` - dodano TripCreateView i TripListView
- `backend/api/admin.py` - zarejestrowano model Trip
- `backend/backend/urls.py` - dodano routing dla API tripów

### Frontend
- `frontend/src/components/AddTrip.tsx` - nowy komponent formularza
- `frontend/src/components/Dashboard.tsx` - nowy komponent panelu głównego
- `frontend/src/services/api.ts` - dodano interfejsy i metody dla tripów
- `frontend/src/App.tsx` - dodano routing dla Dashboard i AddTrip

## Wymagania techniczne
- Django 5.2.7
- Django REST Framework
- React 19.2.0
- Material-UI 7.3.4
- TypeScript 4.9.5
- Formik + Yup (walidacja formularzy)

## Następne kroki (do zrobienia w przyszłych sprintach)
- [ ] Migracje bazy danych (`python manage.py makemigrations` i `python manage.py migrate`)
- [ ] Testy jednostkowe dla modelu Trip
- [ ] Testy API endpoints
- [ ] Testy komponentu AddTrip
- [ ] Filtrowanie przejazdów (po dacie, lokalizacji)
- [ ] Edycja i usuwanie przejazdów przez kierowcę
- [ ] Integracja z mapami (Google Maps/OpenStreetMap) dla wyboru lokalizacji

## Uwagi techniczne
- Formularz używa Box z flexbox zamiast Grid (kompatybilność z Material-UI v7)
- Punkty pośrednie przechowywane jako JSON w bazie danych
- Automatyczne przypisanie kierowcy na podstawie tokenu JWT
- Walidacja po stronie klienta i serwera



