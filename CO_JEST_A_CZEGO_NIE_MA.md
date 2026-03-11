# Co jest, a czego nie ma w projekcie – przegląd

Sprawdzone na podstawie kodu (backend + frontend). Data: marzec 2025.

---

## ✅ CO JEST (zaimplementowane)

### Autentykacja i użytkownicy
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Rejestracja e-mail+hasło | `POST /api/user/register/`, UserCreateView | Register.tsx, authService.register |
| Logowanie e-mail+hasło | `POST /api/token/`, JWT | Login.tsx, authService.login |
| Logowanie Google | `GET /api/auth/google/`, `POST /api/auth/google/callback/` | GoogleLoginButton, GoogleCallback |
| Wylogowanie | – | authService.logout |
| Profil użytkownika (edycja: imię, email, telefon, avatar, rola, powiadomienia) | `GET/PATCH /api/user/profile/`, UserProfileView | UserProfile.tsx |
| Szczegóły użytkownika (dla innych: statystyki, oceny, recenzje) | `GET /api/user/<id>/details/`, UserDetailsView (avg rating, trips count, recent reviews) | – (używane przy profilu kierowcy / recenzjach) |

### Przejazdy
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Lista przejazdów | `GET /api/trips/` | SearchTrips (lista wyników) |
| Wyszukiwanie (start, koniec, data) | `GET /api/trips/search/?start_location=...&end_location=...&date=...` | SearchTrips, tripService.searchTrips |
| Szczegóły przejazdu | `GET /api/trips/<id>/` | TripDetails.tsx |
| Dodawanie przejazdu | `POST /api/trips/` | AddTrip.tsx |
| Edycja / anulowanie przejazdu | `PATCH /api/trips/<id>/`, `POST /api/trips/<id>/cancel/` | MyTrips (edycja, anulowanie) |
| Moje przejazdy (kierowca) | `GET /api/trips/my_trips/` | MyTrips.tsx |
| Historia przejazdów (kierowca, zakończone) | `GET /api/trips/history/` | History.tsx |
| Pogoda dla przejazdu | `GET /api/trips/<id>/weather/` | WeatherForecast.tsx w TripDetails |
| Mapa trasy (komponent) | – | RouteMap.tsx w TripDetails (wykorzystywany) |

### Rezerwacje
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Utworzenie rezerwacji | `POST /api/trips/<id>/create_booking/` | TripDetails – przycisk Rezerwuj |
| Akceptacja / odrzucenie (kierowca) | `POST accept_booking/`, `reject_booking/` | MyTrips (lista pasażerów, akcje) |
| Anulowanie (pasażer) | `POST cancel_booking/` | MyBookings |
| Płatność za rezerwację | `POST pay_booking/` | MyBookings (przycisk Opłać) |
| Moje rezerwacje | `GET /api/bookings/my/` | MyBookings.tsx |
| Historia rezerwacji | `GET /api/bookings/history/` | – (API jest) |
| Lista pasażerów do przejazdu | `GET /api/trips/<id>/passengers/` | MyTrips |

### Portfel i transakcje
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Saldo, wpłata | `GET/POST /api/wallet/` (deposit = symulacja BLIK) | Wallet.tsx, walletService.deposit |
| Historia transakcji | `GET /api/transactions/` | Wallet (lista) |
| Zakończenie przejazdu (wypłata kierowcy, prowizja 5%) | `POST /api/trips/<id>/complete_trip/` | MyTrips |

### Powiadomienia i wiadomości
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Lista powiadomień, odczyt, liczba nieprzeczytanych | NotificationViewSet (get, mark_as_read, mark_all_as_read, unread_count) | Notifications.tsx (tylko w PassengerDashboard) |
| Powiadomienie do pasażerów (kierowca) | `POST /api/trips/<id>/notify_passengers/` | MyTrips – „Wyślij powiadomienie” |
| Wiadomości (czat w kontekście rezerwacji) | MessageViewSet | – (API jest, brak dedykowanego UI czatu) |
| Sygnały: nowy przejazd na ulubionej trasie, rezerwacja, akceptacja, waitlist | modele + signals w models.py | – (działają w tle) |

### Ulubione trasy
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| CRUD ulubionych tras | FavoriteRouteViewSet | SearchTrips – zapisz/usuwaj ulubioną, lista ulubionych, „Użyj trasy” |

### Szablony i przejazdy cykliczne
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Szablony przejazdów | TripTemplateViewSet, create_trip z szablonu | – (API jest; w DriverDashboard nie ma kafelka „Szablony”) |
| Przejazdy cykliczne | RecurringTripViewSet, toggle_active, generate_trips | RecurringTrips.tsx, AddRecurringTrip.tsx, recurringTrips.ts |

### Lista oczekujących (waitlist)
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Zapis na waitlist, moja lista, for_trip (kierowca) | WaitlistViewSet | WaitlistDialog.tsx (zapis przy pełnym przejeździe), waitlist.ts |

### Znajomi, zaufani, zgłoszenia, recenzje
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Znajomi (zaproszenia, akceptacja, odrzucenie, blokowanie, wyszukiwanie) | FriendshipViewSet | Friends.tsx |
| Zaufani użytkownicy (dodaj, usuń, auto_accept) | TrustedUserViewSet, PATCH z auto_accept | TrustedUsers.tsx |
| Zgłoszenia (tworzenie, moje, statystyki) | ReportViewSet (user widzi tylko swoje) | ReportUser.tsx |
| Recenzje (dodawanie, lista po trip/user, my_reviews, received_reviews) | ReviewViewSet | Reviews.tsx, AddReviewDialog.tsx |
| Średnia ocena i liczba recenzji u usera | UserDetailsView (statistics) | – (API zwraca; w UI w TripDetails/Reviews można to pokazywać) |

### Inne
| Funkcja | Backend | Frontend |
|--------|---------|----------|
| Role (kierowca / pasażer), RoleProtectedRoute | profile.preferred_role | Dashboard → /driver lub /passenger, RoleProtectedRoute |
| Ochrona tras (tylko zalogowani) | IsAuthenticated | ProtectedRoute, przekierowanie na /login |

---

## ❌ CZEGO NIE MA LUB JEST CZĘŚCIOWO

### Backend

| Czego brakuje | Gdzie / co dodać |
|---------------|------------------|
| **Filtry wyszukiwania: cena, sortowanie** | W `TripSearchView` nie ma parametrów `min_price`, `max_price`, `sort` (np. date, price). Tylko start_location, end_location, date. |
| **Wyszukiwanie z punktem pośrednim (via)** | Brak `via_location` / filtrowania po intermediate_stops w TripSearchView. |
| **Cechy przejazdu (muzyka, zwierzęta, palenie, rozmowa)** | W modelu `Trip` nie ma pól np. music_ok, pets_ok, smoking_ok, chat_ok. |
| **Pole „opis” / bio w profilu** | W `UserProfile` jest: phone_number, avatar, notifications_enabled. **Brak** pola typu `bio` / `description`. |
| **Weryfikacja konta (email/telefon)** | Brak pól `email_verified`, `phone_verified` w UserProfile i brak flow weryfikacji. |
| **Eksport historii (PDF/CSV)** | Brak endpointu typu `GET /api/bookings/export/` lub `GET /api/trips/export/` zwracającego plik. |
| **Raporty dla kierowcy (np. zarobki w okresie)** | Brak dedykowanego endpointu typu „raport miesięczny” (suma wypłat, liczba przejazdów). Jest tylko historia tripów i transakcje. |
| **Panel admina: lista wszystkich zgłoszeń** | `ReportViewSet.get_queryset()` filtruje po `reporter=request.user`. Brak widoku „wszystkie zgłoszenia” dla is_staff / superuser. |
| **Środki testowe (dodaj X zł dla właściciela/testów)** | Wallet: jest zwykła wpłata POST /wallet/ (dla każdego). Brak osobnego endpointu „dodaj środki testowe” (np. tylko dla superuser) z limitem. |
| **Rate limiting** | Brak throttle’ów na endpointach (np. throttle w DRF lub nginx). |

### Frontend

| Czego brakuje | Gdzie / co dodać |
|---------------|------------------|
| **Filtry i sortowanie w wyszukiwaniu** | W SearchTrips nie ma pól min/max cena ani selectu sortowania (bo backend ich nie obsługuje). |
| **Powiadomienia w panelu kierowcy** | Komponent `Notifications` jest tylko w **PassengerDashboard**. W **DriverDashboard** brak dostępu do powiadomień (np. ikonka dzwonka). |
| **Widok „Raportów” (np. miesięczne podsumowanie)** | Brak strony typu /reports lub sekcji w History. |
| **Eksport (przycisk Pobierz CSV/PDF)** | Brak przycisku i wywołania API eksportu w History / MyBookings. |
| **Strona / trasa z mapą wyszukiwania** | W wyszukiwaniu jest lista wyników; brak widoku „mapa z markerami przejazdów”. RouteMap jest tylko w TripDetails. |
| **Wybór trasy z mapy w AddTrip** | AddTrip używa pól tekstowych (start/koniec); brak wyboru punktów na mapie (np. wybór z zewnętrznego API map). |
| **Profil: pole „Opis o sobie”** | UserProfile.tsx nie ma pola bio/opis (backend też go nie ma). |
| **Badge „Zweryfikowany email/telefon”** | Brak wyświetlania (backend nie ma weryfikacji). |
| **Preferencje powiadomień per typ** | Jest jedno „notifications_enabled” w profilu. Brak przełączników np. „rezerwacje tak, ulubione trasy nie”. |
| **Blokowanie użytkownika (osobne od znajomych)** | Jest block w Friendship. Brak osobnego modelu BlockedUser i ukrywania przejazdów/rezerwacji z zablokowanymi. |
| **Strona Kontakt / FAQ** | Brak. |
| **Banner cookies + linki Regulamin / Polityka** | Brak. |
| **Tryb ciemny** | Brak (jedna stała theme w App). |
| **Dostęp do Notifications z poziomu nawigacji dla kierowcy** | Kierowca ma tylko DriverDashboard – nie ma tam komponentu Notifications (tylko pasażer w PassengerDashboard). |

### Inne

| Czego brakuje | Uwagi |
|---------------|--------|
| **Dokumentacja API (OpenAPI/Swagger)** | Brak udostępnionej dokumentacji endpointów. |
| **Logowanie tylko Google** | Obecnie są oba: e-mail+hasło oraz Google. Decyzja: zostawić tylko Google i usunąć Login/Register (zgodnie z BACKLOG_NOWE_TASKI). |
| **CI (lint/test przy push)** | Brak (np. GitHub Actions / Bitbucket Pipelines). |

---

## Podsumowanie

- **Jest:** pełny flow przejazdów (wyszukiwanie po trasie i dacie, rezerwacje, akceptacja, płatność, portfel, zakończenie przejazdu), profil, powiadomienia in-app (dla pasażera), wiadomość kierowcy do pasażerów, ulubione trasy, przejazdy cykliczne, waitlist, znajomi, zaufani (z auto_accept), zgłoszenia, recenzje, pogoda, mapa w TripDetails, logowanie Google i e-mail+hasło.
- **Brakuje:** filtrów ceny i sortowania w wyszukiwaniu, cech przejazdu (muzyka/zwierzęta itd.), opisu w profilu, weryfikacji konta, eksportu historii, raportów, panelu admina dla zgłoszeń, środków testowych (osobny flow), rate limitingu; na froncie: powiadomienia dla kierowcy, filtry/sort w UI, mapa w wyszukiwaniu, wybór trasy z mapy w AddTrip, preferencje powiadomień per typ, blokowanie użytkownika, kontakt/cookies/dark mode, dokumentacja API, opcjonalnie tylko logowanie Google.

Możesz to wykorzystać do aktualizacji BACKLOG_STARY_OGARNIECIE.md (oznaczyć, co naprawdę „już jest”, a co „do dopracowania”) i do planowania sprintów.

---

## Co wywalić z backlogu (po ID i nazwie)

Na podstawie powyższego: **usuń z backlogu** poniższe (są zrobione albo nieużywane).

### Do wywalenia – lista po ID

| ID | Nazwa / opis | Powód |
|----|----------------|-------|
| **PT2025NFCP-1** | Rejestracja (e-mail, hasło) | Nie używamy – logowanie tylko Google. |
| **PT2025NFCP-2** | Logowanie (e-mail, hasło) | Nie używamy – logowanie tylko Google. |
| **PT2025NFCP-3** | Wylogowanie | Jest w aplikacji. |
| **PT2025NFCP-4** | Profil (edycja danych, zdjęcie, telefon) | Jest: UserProfile, API, avatar. |
| **PT2025NFCP-20** | Przeprowadzenie testów funkcjonalnych | Wywalić jeśli uznane za zamknięte. |
| **PT2025NFCP-25** | Wyszukiwanie i Rezerwacja Przejazdów (Pasażer) | Core jest (wyszukiwanie, rezerwacja, Moje rezerwacje). Dopracowanie (filtry/sort) zostaw pod **PT2025NFCP-46**. |
| **PT2025NFCP-27** | Płatności (opcjonalnie / później) | Duplikat – zostaw **PT2025NFCP-28**. |
| **PT2025NFCP-33** | Konfiguracja środowiska testowego i wdrożenie do testów | Wywalić jeśli uznane za zrobione. |
| **PT2025NFCP-34** | Bieżące poprawki błędów zgłoszonych podczas testów | Wywalić jeśli sprint/testy zamknięte (albo zostaw jako ciągły typ zadania). |
| **PT2025NFCP-35** | Konfiguracja środowiska produkcyjnego i publikacja aplikacji | Wywalić jeśli uznane za zrobione. |
| **PT2025NFCP-36** | Wdrożenie systemu monitoringu i logowania błędów | Wywalić jeśli uznane za zrobione. |
| **PT2025NFCP-37** | Stworzenie mechanizmu do zbierania opinii od użytkowników | Jest: recenzje (Reviews, AddReviewDialog). |
| **PT2025NFCP-53** | Ulubione i Powiadomienia | Jest: ulubione trasy w SearchTrips, powiadomienia (Notifications, signals). |
| **PT2025NFCP-65** | Statystyki przejazdów kierowcy (pasażerowie, zarobki, ocena) | Jest: UserDetailsView (statystyki), API. |
| **PT2025NFCP-66** | Status rezerwacji w czasie rzeczywistym (pasażer) | Jest: MyBookings, statusy. |
| **PT2025NFCP-67** | Powiadomienia (push/email) przy akceptacji/odrzuceniu rezerwacji | Jest: signals, Notifications. |
| **PT2025NFCP-68** | Kierowca: wszystkie rezerwacje w jednym miejscu, akceptacja/odrzucenie | Jest: passengers, MyTrips. |
| **PT2025NFCP-70** | Zdjęcie profilowe i krótki opis | Zdjęcie jest; opis (bio) nie – możesz wywalić i zrobić „opis” osobno w nowych taskach. |
| **PT2025NFCP-71** | Oceny i recenzje przed decyzją o rezerwacji/akceptacji | Jest: Reviews, UserDetails. |
| **PT2025NFCP-75** | Kierowca: powiadomienie do wszystkich pasażerów o zmianie | Jest: notify_passengers, MyTrips. |
| **PT2025NFCP-87** | Średnia ocena użytkownika i liczba recenzji | Jest: UserDetailsView (statistics). |
| **PT2025NFCP-97** | Pasażer: klik w przejazd → szczegóły (kierowca, trasa, recenzje) | Jest: TripDetails. |
| **PT2025NFCP-106** | Profil (edycja danych, zdjęcie, telefon) | Duplikat **PT2025NFCP-4** – wywalić. |

### Jedna lista ID do skopiowania (wywalić)

```
PT2025NFCP-1
PT2025NFCP-2
PT2025NFCP-3
PT2025NFCP-4
PT2025NFCP-20
PT2025NFCP-25
PT2025NFCP-27
PT2025NFCP-33
PT2025NFCP-34
PT2025NFCP-35
PT2025NFCP-36
PT2025NFCP-37
PT2025NFCP-53
PT2025NFCP-65
PT2025NFCP-66
PT2025NFCP-67
PT2025NFCP-68
PT2025NFCP-70
PT2025NFCP-71
PT2025NFCP-75
PT2025NFCP-87
PT2025NFCP-97
PT2025NFCP-106
```

**Nie wywalać** (tego nie ma albo jest częściowo): 24, 32, 46, 47, 48, 49, 51, 52, 56, 57, 76, 78, 81, 93, 94, 95, 96, 143 (cookies – jest w nowych taskach). **PT2025NFCP-28** zostaw (płatności + środki testowe).
