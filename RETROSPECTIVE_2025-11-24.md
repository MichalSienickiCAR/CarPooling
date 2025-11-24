# Retrospekcja - 2025-11-24

## Co zrobiliśmy dobrze? ✅

### Setup i Architektura (PT2025NFCP-38, PT2025NFCP-39)

1. **Utworzenie repozytorium Git i README projektu (PT2025NFCP-38)** — profesjonalne repozytorium z dokumentacją, instrukcjami instalacji i workflow.

2. **Przygotowanie architektury aplikacji Django (PT2025NFCP-39)** — pełna konfiguracja Django REST Framework z:
   - Modele danych (Trip, Booking, UserProfile)
   - Serializery z walidacją
   - Views z odpowiednimi permissions
   - Routing i API endpoints
   - Konfiguracja CORS dla komunikacji frontend-backend
   - System logowania (pliki + konsola)

3. **Konfiguracja środowiska deweloperskiego** — PostgreSQL jako domyślna baza danych (z możliwością przełączenia na SQLite przez zmienną środowiskową), zmienne środowiskowe w `.env`, dokumentacja setupu dla całego zespołu.

4. **Frontend React z TypeScript** — nowoczesna aplikacja z Material-UI, routing, formularze z walidacją (Formik + Yup).

### System Autentykacji

5. **Rejestracja i logowanie użytkowników** — pełny system autentykacji z JWT:
   - Rejestracja z walidacją
   - Logowanie z tokenami JWT
   - Refresh tokenów
   - Bezpieczne przechowywanie tokenów

6. **System ról użytkowników** — `UserProfile` z `preferred_role` (driver/passenger/both):
   - Automatyczne tworzenie profilu przy rejestracji
   - Migracja dla istniejących kont (domyślnie "both")
   - Endpoint do pobierania/aktualizacji profilu
   - Przekierowanie na odpowiedni dashboard po logowaniu

### Funkcjonalności Biznesowe

7. **Dodawanie przejazdów (PT2025NFCP-5)** — kompletny formularz z:
   - Punkt początkowy i docelowy
   - Punkty pośrednie (opcjonalne)
   - Data i godzina
   - Liczba dostępnych miejsc
   - Sugerowana cena
   - Walidacja wszystkich pól

8. **Wyszukiwanie przejazdów (PT2025NFCP-9)** — elastyczne wyszukiwanie z:
   - Filtrowanie po lokalizacji (case-insensitive, częściowe dopasowanie)
   - Filtrowanie po dacie
   - Wykluczanie własnych przejazdów kierowcy
   - Szczegółowe logowanie dla debugowania

9. **Lista pasujących przejazdów (PT2025NFCP-10)** — czytelna lista z:
   - Trasą (z punktami pośrednimi)
   - Godziną i datą
   - Ceną za miejsce
   - Liczbą wolnych miejsc
   - Informacjami o kierowcy

10. **Widok "Moje Przejazdy" (PT2025NFCP-6)** — pełne zarządzanie przejazdami:
    - Lista wszystkich przejazdów kierowcy
    - Edycja przejazdów (wszystkie pola)
    - Anulowanie przejazdów
    - Lista pasażerów dla każdego przejazdu

### UX i Architektura Frontendu

11. **Rozdzielenie widoków kierowcy i pasażera** — osobne panele:
    - `DriverDashboard` — tylko funkcje kierowcy
    - `PassengerDashboard` — tylko funkcje pasażera
    - `Dashboard` — wybór dla użytkowników z rolą "both"
    - Czysta separacja funkcjonalności

12. **Nowoczesny UI z Material-UI** — spójny design:
    - Responsywny layout
    - Formularze z walidacją
    - Notyfikacje (Snackbar)
    - Intuicyjna nawigacja

### Dokumentacja i Procesy

13. **Stworzenie mockupów UI (PT2025NFCP-40)** — przygotowanie 3–4 widoków UI jako fundament dla implementacji frontendu.

14. **Diagram ERD - baza danych (PT2025NFCP-41)** — zaprojektowanie struktury bazy danych przed implementacją modeli.

15. **User Flow – schemat działania użytkownika (PT2025NFCP-42)** — zdefiniowanie przepływu użytkownika przez aplikację, co ułatwiło implementację.

16. **Workflow zespołu (PT2025NFCP-43)** — ustalenie procesów pracy zespołowej, co poprawiło koordynację.

17. **Diagram Wdrożenia / Infrastruktury (PT2025NFCP-44)** — przygotowanie diagramu infrastruktury dla lepszego zrozumienia architektury systemu.

18. **Definition of Done (PT2025NFCP-45)** — uproszczona wersja dostosowana do początku projektu, z jasnymi kryteriami dla backendu, frontendu i Git.

19. **Dokumentacja techniczna** — kompleksowa dokumentacja:
    - `README.md` — instrukcje instalacji i uruchomienia
    - `ARCHITECTURE.md` — architektura backendu
    - `STRUCTURE.md` — struktura projektu
    - `DEFINITION_OF_DONE.md` — kryteria ukończenia tasków

20. **System logowania w backendzie** — szczegółowe logi:
    - Logi do plików (`logs/django.log`, `logs/errors.log`)
    - Logi w konsoli
    - Logowanie akcji użytkowników (rejestracja, tworzenie przejazdów, wyszukiwanie)

### Komunikacja i Organizacja

21. **Ustaliliśmy i rozdzieliliśmy kluczowe user stories (PT2025NFCP-5, -6, -9, -10)** — każdy wie, co ma robić.

22. **Frontend i backend mają jasno zdefiniowane punkty integracji** — wszystkie endpointy działają poprawnie, API jest dobrze udokumentowane.

23. **Komunikacja w zespole była responsywna** — szybkie ustalenia podczas daily pomogły usuwać blokery.

24. **Naprawa problemów technicznych** — szybkie reagowanie na błędy:
    - Naprawa routingu wyszukiwania (404 error)
    - Poprawa filtrowania przejazdów
    - Naprawa wyświetlania "Moje przejazdy"

25. **Przełączenie na PostgreSQL** — kompletna migracja z SQLite na PostgreSQL:
    - Konfiguracja PostgreSQL jako domyślnej bazy danych
    - Utworzenie użytkownika i bazy danych dla projektu
    - Rozwiązanie problemów z kodowaniem hasła
    - Uruchomienie wszystkich migracji na PostgreSQL
    - Przygotowanie dokumentacji i skryptów pomocniczych dla zespołu
    - Aktualizacja README z instrukcjami konfiguracji PostgreSQL

## Co powinniśmy zrobić lepiej? 🔄

1. **Brak przypisanego właściciela dla PT2025NFCP-9 przed startem sprintu** — opóźniło plan pracy nad wyszukiwaniem. **Rozwiązane:** Task został ukończony.

2. **Doprecyzować Definition of Done** (szczególnie: walidacja pól, obsługa błędów, testy) — DoD został uproszczony na początku projektu, ale warto go rozszerzyć w miarę rozwoju.

3. **Większa spójność w komentarzach do commitów i PR** — potrzebujemy wzoru commit message i wymogu linku do issue w PR.

4. **Testowanie przed oznaczeniem jako DONE** — warto dodać manualne testy przed zamknięciem taska.

5. **Dokumentacja zmian** — warto dokumentować większe zmiany (np. rozdzielenie widoków, system ról) w Confluence lub README.

## Action Items 📋

### W trakcie / Zakończone:
- ✅ **PT2025NFCP-38** — Utworzenie repozytorium Git + README projektu
- ✅ **PT2025NFCP-39** — Przygotowanie architektury aplikacji (Django)
- ✅ **PT2025NFCP-40** — Stworzenie mockupów UI (3–4 widoki)
- ✅ **PT2025NFCP-41** — Diagram ERD (baza danych)
- ✅ **PT2025NFCP-42** — User Flow – schemat działania użytkownika
- ✅ **PT2025NFCP-43** — Workflow zespołu
- ✅ **PT2025NFCP-44** — Diagram Wdrożenia / Infrastruktury
- ✅ **PT2025NFCP-45** — Stworzenie Definition of Done (DoD)
- ✅ **PT2025NFCP-5** — Dodawanie przejazdów przez kierowcę
- ✅ **PT2025NFCP-6** — Widok "Moje Przejazdy" dla kierowcy
- ✅ **PT2025NFCP-9** — Wyszukiwanie przejazdów przez pasażera
- ✅ **PT2025NFCP-10** — Lista pasujących przejazdów dla pasażera
- ✅ **Rozdzielenie widoków kierowcy/pasażera** — zaimplementowane
- ✅ **System ról użytkowników** — zaimplementowany z obsługą istniejących kont
- ✅ **Naprawa wyszukiwania przejazdów** — routing i logika poprawione
- ✅ **Migracja na PostgreSQL** — kompletna konfiguracja i setup dla całego zespołu

### Do zrobienia:

1. **Doprecyzować Definition of Done dla przyszłych tasków** (walidacje + przypadki testowe) 
   - **Owner:** Marcin Gieniusz, Damian Patalan
   - **Deadline:** 25.11.2025
   - **Status:** W trakcie

2. **Ustawić wzór commit message i wymóg linku do issue w PR**
   - **Owner:** Wszyscy
   - **Wdrożyć od:** Następnego sprintu
   - **Wzór commit message:**
     ```
     feat: PT2025NFCP-XX - krótki opis zmian
     fix: PT2025NFCP-XX - naprawa błędu w...
     docs: PT2025NFCP-XX - aktualizacja dokumentacji
     ```
   - **Wymóg PR:** Tytuł musi zawierać numer taska, opis musi zawierać link do Jira

3. **Dodać system ocen kierowcy** — osobny task (nie był częścią PT2025NFCP-10)

4. **Dodać testy manualne do checklist przed PR** — sprawdzenie podstawowych scenariuszy przed oznaczeniem jako DONE

## Metryki Sprintu 📊

- **Ukończone taski:** 12
  - **Setup i Dokumentacja:** PT2025NFCP-38, PT2025NFCP-39, PT2025NFCP-40, PT2025NFCP-41, PT2025NFCP-42, PT2025NFCP-43, PT2025NFCP-44, PT2025NFCP-45
  - **Funkcjonalności:** PT2025NFCP-5, PT2025NFCP-6, PT2025NFCP-9, PT2025NFCP-10
  
- **Nowe funkcjonalności:** 
  - Rozdzielenie widoków kierowcy/pasażera
  - System ról użytkowników
  - Poprawione wyszukiwanie przejazdów
  - Dodawanie przejazdów z punktami pośrednimi
  - Zarządzanie przejazdami (edycja, anulowanie, lista pasażerów)
  - Migracja na PostgreSQL (z SQLite)
  
- **Naprawione błędy:** 
  - Routing wyszukiwania (404 error)
  - Filtrowanie przejazdów
  - Wyświetlanie "Moje przejazdy"
  - Problemy z kodowaniem hasła PostgreSQL
  - Konfiguracja bazy danych dla całego zespołu

## Notatki 📝

- Wszystkie podstawowe funkcjonalności dla kierowcy i pasażera działają
- System jest gotowy do dalszego rozwoju (rezerwacje, oceny, płatności)
- Warto rozważyć dodanie testów automatycznych w przyszłości
- **PostgreSQL skonfigurowany i działający** — projekt używa teraz PostgreSQL zamiast SQLite, co jest zgodne z wymaganiami produkcyjnymi
- **Dokumentacja setupu PostgreSQL** — przygotowana dla całego zespołu (README, skrypty pomocnicze)

---

**Data retrospekcji:** 2025-11-24  
**Zespół:** Car Pooling Team

