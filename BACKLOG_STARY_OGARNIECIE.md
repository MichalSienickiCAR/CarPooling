# Ogarnięcie starego backlogu

## 1. Do wywalenia (usunąć z backlogu – niepotrzebne / sprzeczne)

| ID | Powód |
|----|--------|
| **PT2025NFCP-1** | Rejestracja e-mail+hasło – **nie używamy**, logowanie tylko przez Google. |
| **PT2025NFCP-2** | Logowanie e-mail+hasło – **nie używamy**, logowanie tylko przez Google. |
| **PT2025NFCP-106** | **Duplikat PT2025NFCP-4** (ten sam opis profilu). Zostaw jeden (np. 4), drugi skasuj. |
| **PT2025NFCP-27** | Płatności (opcjonalnie) – **usunąć**; zostaw tylko **PT2025NFCP-28** (Płatności i Rozliczenia) i tam dopisać user story + subtaski poniżej. |

**Uwaga:** Wszystkie z **niebieskim ptaszkiem (Done)** – jeśli w Jirze już są zamknięte, **nie usuwać**, tylko nie przenosić do nowych sprintów. Do fizycznego usunięcia: tylko 1, 2, 106 i 27 (zostaje 28).

---

## 2. Do przerobienia na User Story + Subtaski (epiki / taski bez formy user story)

Poniżej: **obecny tytuł** → **propozycja User Story** + **Subtaski**. Możesz to wkleić do Jiry (jako nowy opis / podtaski).

---

### PT2025NFCP-28 – Płatności i Rozliczenia (środki testowe + system płatności)

**User story:**  
Jako właściciel platformy, chcę móc dodać przykładowe środki do portfela i z nich korzystać, aby przetestować i dopracować system płatności (wpłata, płatność za rezerwację, zwrot, wypłata dla kierowcy) przed wdrożeniem na żywo.

**Subtaski:**
- Backend: endpoint lub mechanizm „dodaj środki testowe” (np. tylko dla superusera / flaga TEST_MODE lub osobny endpoint admina).
- Backend: walidacja – w trybie testowym można dodawać np. do 500 zł; w produkcji wyłączyć lub ograniczyć.
- Frontend: w Portfelu – przycisk „Dodaj środki testowe” (widoczny tylko dla admina / lub w dev) z wyborem kwoty (np. 50, 100, 200 zł).
- Testy: dodanie środków → rezerwacja → płatność → zakończenie przejazdu → wypłata kierowcy; sprawdzenie sald i transakcji.
- Dokumentacja: krótki opis w README lub instrukcji testowej – jak włączyć środki testowe i przetestować flow płatności.

---

### PT2025NFCP-53 – Ulubione i Powiadomienia

**User story:**  
Jako użytkownik, chcę zapisywać ulubione trasy i dostawać powiadomienia o nowych przejazdach na tych trasach, aby nie przegapić dopasowanej oferty.

**Subtaski:**
- Backend: endpointy ulubionych tras (już są – zweryfikować).
- Backend: powiadomienia przy nowym przejeździe na ulubionej trasie (już jest signal – zweryfikować).
- Frontend: dodawanie/usuwanie ulubionej trasy w wyszukiwaniu lub profilu.
- Frontend: lista ulubionych tras w profilu/ustawieniach.
- Frontend: ustawienie „chcę powiadomienia o nowych przejazdach na ulubionej trasie” (jeśli brak).
- Testy: dodanie ulubionej → nowy przejazd na trasie → powiadomienie.

---

### PT2025NFCP-51 – Historia i Raporty

**User story:**  
Jako kierowca, chcę widzieć historię przejazdów i proste raporty (np. zarobki w miesiącu), aby mieć podsumowanie aktywności. Jako pasażer, chcę widzieć historię swoich rezerwacji, aby mieć dokumentację przejazdów.

**Co już jest zrobione:**
- **Historia przejazdów (kierowca):** Backend `GET /api/trips/history/` – lista zakończonych przejazdów (`completed=True`), sortowanie po `completed_at`. Frontend: `History.tsx`, route `/history`, kafelek „Historia” w DriverDashboard. Kierowca widzi zakończone przejazdy z trasą, datą, ceną, pasażerami, przyciskami „Oceń” i „Dodaj do zaufanych”.
- **Historia rezerwacji (pasażer):** Backend `GET /api/bookings/history/` – rezerwacje w zakończonych przejazdach (opcjonalny filtr `?status=paid`). Frontend: ten sam `History.tsx` – dla roli pasażer ładuje `getBookingHistory()`, lista rezerwacji z trasą, datą, kierowcą, statusem, recenzjami. Dokumentacja: `HISTORIA_PRZEJAZDOW.md`.

**Czego nie ma (do zrobienia):**
- **Raporty dla kierowcy:** Brak endpointu typu „raport” (np. suma zarobków w miesiącu/roku, liczba przejazdów w okresie). Są tylko `GET /api/transactions/` (lista transakcji) i historia tripów – brak agregacji „zarobki w marcu 2026”.
- **Widok Raporty w UI:** Brak strony `/reports` ani sekcji w History z podsumowaniem miesięcznym/rocznym dla kierowcy.
- **Eksport (CSV/PDF):** Brak – można dodać jako osobny subtask na później.

**Subtaski (do wpisania w Jirę / do zrobienia):**
1. **Weryfikacja historii** – Przetestować: kierowca wchodzi w Historia → widzi zakończone przejazdy; pasażer w Historia → widzi zakończone rezerwacje. Ewentualne drobne poprawki (np. brakujące pola w serializerze). Nie wymaga nowego endpointu – tylko test + ewent. poprawki.
2. **Backend: endpoint raportu dla kierowcy** – Nowy endpoint, np. `GET /api/driver-report/?month=2026-03` lub `?from=...&to=...`. Zwracać: suma zarobków (wypłaty z zakończonych przejazdów w okresie), liczba zakończonych przejazdów, ewent. liczba pasażerów. Bazować na `Transaction` (typ wypłaty) i/lub `Trip` (completed, completed_at).
3. **Frontend: widok Raporty (dla kierowcy)** – Strona lub sekcja (np. w History lub osobna `/reports`): wybór okresu (miesiąc/rok lub zakres dat), wyświetlenie „Zarobki w okresie”, „Liczba przejazdów”. Wywołanie nowego API. Widoczna tylko dla kierowcy.
4. **Testy raportu** – Poprawność wyliczeń (np. ręcznie sprawdzić 2–3 przejazdy i porównać z sumą w raporcie). Walidacja okresu (puste dane, przyszły miesiąc).
5. **Eksport historii (opcjonalnie)** – Przycisk „Pobierz CSV” w History (lista przejazdów/rezerwacji) – backend endpoint zwracający CSV lub frontend generuje z już pobranych danych. Niski priorytet.

**Kryteria ukończenia:** Historia (kierowca + pasażer) zweryfikowana i działa; kierowca ma endpoint raportu + widok z podsumowaniem zarobków w wybranym okresie; wyliczenia przetestowane.

---

### PT2025NFCP-25 – Wyszukiwanie i Rezerwacja Przejazdów (Pasażer)

**Status w projekcie:** **Już jest.** Backend: `TripSearchView` (start, koniec, data), `create_booking`, `MyBookingsView`. Frontend: `SearchTrips`, `SearchPage`, `MyBookings`, rezerwacja z API. Nie przerabiać od zera.

**User story (do opisu w Jirze, żeby było w formie user story):**  
Jako pasażer, chcę wyszukać przejazdy po trasie i dacie, zarezerwować miejsca i widzieć status rezerwacji, aby dojechać tam gdzie potrzebuję.

**Subtaski – tylko to, czego brakuje (dopracowanie):**
- Backend: wyszukiwanie z filtrami (min_price, max_price) i sortowaniem (data, cena) – **jeśli jeszcze nie ma**, dodać do `TripSearchView`.
- Frontend: w formularzu wyszukiwania – pola/selecty filtra ceny i sortowania (jeśli backend już to obsługuje).
- Weryfikacja: przejście flow wyszukiwanie → rezerwacja → status w „Moje rezerwacje” (jeśli nie testowane – dopisać do instrukcji testowej).

---

### PT2025NFCP-24 – Zarządzanie Przejazdami (Kierowca)

**User story:**  
Jako kierowca, chcę dodawać, edytować i anulować przejazdy oraz widzieć rezerwacje w jednym miejscu, aby zarządzać swoimi przejazdami.

**Subtaski:**
- Backend: CRUD przejazdów (już jest – zweryfikować edycję/anulowanie).
- Backend: lista rezerwacji do przejazdu + akceptacja/odrzucenie (już jest – zweryfikować).
- Frontend: „Moje przejazdy” z akcjami (edytuj, anuluj, zakończ).
- Frontend: widok rezerwacji do przejazdu (akceptuj/odrzuć).
- Testy: dodanie → edycja → anulowanie; akceptacja/odrzucenie rezerwacji.6

---

### PT2025NFCP-46 – Ulepszenia Wyszukiwania i Filtrowania

**User story:**  
Jako pasażer, chcę filtrować przejazdy po cenie i dacie oraz sortować (np. po dacie, cenie), aby szybko znaleźć najlepszą ofertę.

**Subtaski:**
- Backend: parametry wyszukiwania (min_price, max_price, sort=date|price).
- Frontend: UI filtrów i sortowania na stronie wyszukiwania.
- Testy: różne kombinacje filtrów i sortowania.

---

### PT2025NFCP-47 – Zarządzanie Przejazdami – Ulepszenia dla Kierowcy

**User story:**  
Jako kierowca, chcę korzystać z szablonów przejazdów i przejazdów cyklicznych oraz szybko generować przejazdy z szablonu, aby oszczędzać czas.

**Subtaski:**
- Backend: szablony przejazdów i cykliczne (już są – zweryfikować).
- Frontend: lista szablonów, „Utwórz przejazd z szablonu” (data).
- Frontend: lista przejazdów cyklicznych, włącz/wyłącz, generuj na N dni.
- Testy: szablon → przejazd; cykliczny → generowanie.

---

### PT2025NFCP-48 – Zarządzanie Rezerwacjami – Ulepszenia

**User story:**  
Jako kierowca, chcę widzieć wszystkie rezerwacje do mojego przejazdu w jednym widoku i akceptować/odrzucać (pojedynczo lub zbiorczo), aby sprawnie zarządzać miejscami.

**Subtaski:**
- Backend: endpoint rezerwacji dla przejazdu (już jest passengers / bookings – zweryfikować).
- Frontend: jeden ekran „Rezerwacje do tego przejazdu” z listą i przyciskami Akceptuj/Odrzuć.
- Frontend: opcjonalnie „Zaakceptuj wszystkie” / „Odrzuć zaznaczone”.
- Testy: akceptacja/odrzucenie pojedyncze i zbiorcze.

---

### PT2025NFCP-49 – Profil i Zaufanie

**User story:**  
Jako użytkownik, chcę edytować profil (zdjęcie, opis, telefon) oraz dodawać zaufanych użytkowników (z opcją auto-akceptacji), aby budować zaufanie i ułatwiać rezerwacje.

**Subtaski:**
- Backend: pole „opis” w profilu (jeśli brak) + API zaufanych (już jest – zweryfikować).
- Frontend: edycja profilu (zdjęcie, opis, telefon).
- Frontend: lista zaufanych + checkbox auto-akceptacja.
- Testy: dodanie zaufanego → auto-akceptacja rezerwacji.

---

### PT2025NFCP-52 – Bezpieczeństwo i Moderacja

**User story:**  
Jako administrator, chcę widzieć zgłoszenia użytkowników i móc je rozpatrywać (status, notatka, ewentualnie blokada konta), aby utrzymać bezpieczeństwo platformy.

**Subtaski:**
- Backend: rola admin + endpoint listy wszystkich zgłoszeń (nie tylko „moje”).
- Backend: zmiana statusu zgłoszenia, notatka admina.
- Frontend: panel „Moderacja” / „Zgłoszenia” (tylko dla admina).
- Testy: user zgłasza → admin widzi i zmienia status.

---

### PT2025NFCP-56 – Integracje i API

**User story:**  
Jako developer, chcę mieć dostęp do dokumentacji API (np. OpenAPI/Swagger), aby integrować aplikację z innymi systemami lub budować klienta.

**Subtaski:**
- Backend: wygenerowanie i udostępnienie dokumentacji API (drf-spectacular lub ręcznie).
- Dokumentacja: opis autoryzacji (JWT/Google) i przykładowe requesty.
- Testy: sprawdzenie, że dokumentacja jest aktualna i czytelna.

---

### PT2025NFCP-32 – Zadania Techniczne i Utrzymaniowe

**User story:**  
Jako zespół, chcę mieć jasno opisane zadania techniczne (np. aktualizacja zależności, refaktor, testy, CI), aby utrzymywać jakość kodu i stabilność aplikacji.

**Subtaski:**
- Ustalenie listy zadań (np. aktualizacja Django/React, .gitignore, CI, monitoring).
- Każde zadanie jako osobny subtask lub osobny ticket w backlogu (np. „Aktualizacja zależności”, „CI: lint + testy”).
- Opcjonalnie: powiązanie z PT2025NFCP-14 (Git) z BACKLOG_NOWE_TASKI.

---

### PT2025NFCP-57 – Aplikacja mobilna (obowiązkowa) – EPIC

**User story (epic):**  
Jako użytkownik, chcę korzystać z aplikacji na telefonie (iOS/Android lub PWA), aby wyszukiwać przejazdy, rezerwować miejsca i dostawać powiadomienia w podróży, bez konieczności używania komputera.

**Cel:** Aplikacja ma działać **pod adresem (przeglądarka)** oraz być dostępna **do pobrania** w trzech formach: **PWA** (instalacja z przeglądarki), **Android** (apk/aab / Google Play), **iOS** (ipa / App Store). Każda forma to osobny task.

Epic rozbity na **taski** (każdy z user story + subtaskami). Do przypisania ok. 3 osobom – każda osoba bierze 1–2 taski.

---

#### Task 57.0 – PWA (aplikacja instalowalna z przeglądarki)

**User story:**  
Jako użytkownik, chcę móc zainstalować aplikację na telefonie przez przeglądarkę („Zainstaluj aplikację” / „Dodaj do ekranu głównego”), aby mieć ikonę na ekranie i korzystać jak z normalnej appki, bez pobierania z sklepu.

**Subtaski:**
- [Osoba 1] Konfiguracja `manifest.json` – nazwa aplikacji, krótka nazwa, ikony (np. 192x192, 512x512), `theme_color`, `background_color`, `start_url`, `display: standalone` (lub `minimal-ui`).
- [Osoba 1] Service worker – rejestracja (np. workbox / CRA PWA), cache strategia dla assetów i API (np. network-first dla API). Aplikacja musi działać pod HTTPS.
- [Osoba 1] Działanie pod adresem – upewnić się, że ta sama aplikacja poprawnie działa gdy użytkownik wchodzi tylko pod adresem (bez instalacji). Czyli **na adres też**.
- [Osoba 2] Test na Androidzie: Chrome – „Zainstaluj aplikację” / „Dodaj do ekranu głównego”; po instalacji uruchomienie z ikony, logowanie, podstawowy flow.
- [Osoba 2] Test na iOS: Safari – „Dodaj do ekranu początkowego”; uruchomienie z ikony, sprawdzenie działania (Safari ma inne ograniczenia PWA).
- [Osoba 3] Dokumentacja: instrukcja „Jak zainstalować aplikację (PWA)” w README lub pomocy – krok po kroku dla użytkownika (Android + iOS).

**Kryteria ukończenia:** Przeglądarka na telefonie oferuje instalację PWA; po instalacji aplikacja otwiera się z ikony i działa (logowanie, kluczowe ekrany). Działanie pod samym adresem (bez instalacji) potwierdzone.

---

#### Task 57.0a – Aplikacja do pobrania – Android

**User story:**  
Jako użytkownik z Androidem, chcę móc **pobrać** aplikację (APK/AAB lub z Google Play), aby zainstalować ją jak zwykłą aplikację i korzystać z pełnej funkcjonalności.

**Subtaski:**
- [Osoba 1] Wybór technologii: opakowanie obecnego frontendu (np. **Capacitor** lub React Native). Zalecane Capacitor – jedna codebase React, build do Androida.
- [Osoba 1] Konfiguracja projektu Android: `capacitor init` / dodanie platformy `android`, konfiguracja `capacitor.config` (url production lub bundle lokalny), ikony i splash screen.
- [Osoba 1] Build: generowanie AAB/APK (release), podpis (keystore). Instrukcja w README: jak zbudować wersję do pobrania / do wysłania do Google Play.
- [Osoba 2] Test na urządzeniu/emulatorze Android: instalacja z pliku APK (lub wewnętrzny test track), logowanie, wyszukiwanie, rezerwacja, powiadomienia (jeśli push gotowe).
- [Osoba 2] Opcjonalnie – publikacja w Google Play: konto deweloperskie, utworzenie aplikacji, upload AAB, wypełnienie metadanych (opis, screenshots). Można zostawić na później – task może kończyć się na „build do pobrania”.
- [Osoba 3] Dokumentacja: „Jak pobrać aplikację na Androida” (link do APK / do sklepu) – dla użytkowników.

**Kryteria ukończenia:** Można zbudować instalowalny plik (APK lub AAB) dla Androida; aplikacja po instalacji działa (logowanie, kluczowe flow). Publikacja w sklepie opcjonalna.

---

#### Task 57.0b – Aplikacja do pobrania – iOS

**User story:**  
Jako użytkownik z iPhone’em/iPadem, chcę móc **pobrać** aplikację (z App Store lub link do instalacji), aby zainstalować ją jak zwykłą aplikację i korzystać z pełnej funkcjonalności.

**Subtaski:**
- [Osoba 1] Konfiguracja projektu iOS: dodanie platformy `ios` w Capacitor (lub odpowiednik w wybranej technologii), konfiguracja dla iOS (bundle id, ikony, splash).
- [Osoba 1] Build w Xcode (Mac wymagany): otwarcie projektu `ios/App/App.xcworkspace`, wybór urządzenia/symulatora, archiwum i eksport IPA. Instrukcja w README: jak zbudować wersję iOS do testów / do App Store.
- [Osoba 1] Certyfikaty i provisioning: Apple Developer account, App ID, profil provisioning (development / distribution). TestFlight umożliwia dystrybucję bez od razu publikacji w sklepie.
- [Osoba 2] Test na urządzeniu/symulatorze iOS: instalacja (TestFlight lub development build), logowanie, wyszukiwanie, rezerwacja, powiadomienia (jeśli push gotowe).
- [Osoba 2] Opcjonalnie – publikacja w App Store: utworzenie aplikacji w App Store Connect, upload builda, wypełnienie metadanych, przesłanie do recenzji. Można zostawić na później.
- [Osoba 3] Dokumentacja: „Jak pobrać aplikację na iOS” (TestFlight / App Store) – dla użytkowników.

**Kryteria ukończenia:** Można zbudować instalowalną wersję na iOS (symulator lub urządzenie); aplikacja po instalacji działa (logowanie, kluczowe flow). Publikacja w App Store opcjonalna.

---

#### Task 57.1 – Aplikacja dostępna na telefonie (adres + instalacja)

**User story:**  
Jako użytkownik, chcę otworzyć aplikację na telefonie (przez przeglądarkę **pod adresem** albo po **pobraniu / zainstalowaniu**) i zalogować się, aby mieć dostęp do funkcji bez komputera.

**Uwaga:** Tworzenie wersji mobilnych jest w **57.0 (PWA)**, **57.0a (Android)**, **57.0b (iOS)**. Tu: dopięcie działania pod adresem i po instalacji (dla każdej z tych wersji).

**Subtaski:**
- [Osoba A] Frontend: meta viewport, responsywność layoutu (nawigacja, listy, formularze) – breakpointy mobile first, żeby pod adresem i w PWA wyglądało tak samo.
- [Osoba B] Backend: CORS i nagłówki bezpieczeństwa pod wywołania z mobile (origin, cookies jeśli używane).
- [Osoba B] Dokumentacja: krótka instrukcja „Jak wejść na aplikację (adres)” i „Jak pobrać/zainstalować aplikację” (PWA lub sklep) w README lub pomocy.
- [Osoba C] Testy: wejście pod adresem na telefonie; instalacja PWA (57.0) lub appki Android (57.0a) / iOS (57.0b); logowanie i podstawowy flow w każdym przypadku.

**Kryteria ukończenia:** Użytkownik na telefonie może (1) wejść pod adresem i (2) używać po instalacji; w obu przypadkach logowanie (Google) i dashboard działają.

---

#### Task 57.2 – Nawigacja i UX na małym ekranie

**User story:**  
Jako użytkownik na telefonie, chcę wygodnie klikać w przyciski i formularze oraz przechodzić między ekranami (wyszukiwanie, rezerwacje, profil), aby nie frustrować się małym ekranem.

**Subtaski:**
- [Osoba A] Frontend: menu nawigacji na mobile (hamburger lub dolny pasek) – spójne na wszystkich widokach (Landing, Dashboard, Wyszukiwanie, Profil, Portfel itd.).
- [Osoba A] Frontend: listy (wyniki wyszukiwania, Moje rezerwacje, Moje przejazdy) – karty/ wiersze dostosowane do dotyku (wielkość, odstępy).
- [Osoba B] Frontend: formularze (wyszukiwanie, dodawanie przejazdu, edycja profilu) – pola pełnej szerokości, duże przyciski, unikanie małych checkboxów.
- [Osoba B] Frontend: modale i dialogi (rezerwacja, powiadomienia, waitlist) – na pełny ekran lub większy overlay na mobile.
- [Osoba C] Testy: przejście flow wyszukiwanie → szczegóły → rezerwacja oraz kierowca: dodaj przejazd → moje przejazdy na emulatorze/telefonie.

**Kryteria ukończenia:** Wszystkie główne ekrany są czytelne i wygodne na ekranie ~375px; brak poziomego scrolla i „zbyt małych” elementów.

---

#### Task 57.3 – Powiadomienia push na telefonie

**User story:**  
Jako użytkownik, chcę dostawać powiadomienia push na telefonie (np. nowa rezerwacja, akceptacja, wiadomość od kierowcy), aby być na bieżąco bez wchodzenia w aplikację.

**Subtaski:**
- [Osoba A] Backend: integracja z usługą push (np. Firebase Cloud Messaging lub OneSignal) – zapis tokenu urządzenia użytkownika (endpoint lub pole w profilu).
- [Osoba A] Backend: przy wysyłce powiadomienia in-app (np. po akceptacji rezerwacji) – wywołanie wysyłki push do powiązanego urządzenia (jeśli token jest).
- [Osoba B] Frontend: prośba o zgodę na powiadomienia (po logowaniu lub w ustawieniach), rejestracja tokenu i wysłanie do backendu.
- [Osoba B] Frontend: obsługa kliknięcia w powiadomienie (otwarcie odpowiedniego ekranu, np. szczegóły przejazdu / lista powiadomień).
- [Osoba C] Testy: włączenie powiadomień na telefonie/emulatorze, wywołanie akcji (np. akceptacja rezerwacji) i sprawdzenie, że push przychodzi.

**Kryteria ukończenia:** Użytkownik może włączyć powiadomienia i otrzymuje push przy zdarzeniach (rezerwacja, akceptacja itd.).

---

#### Task 57.4 – Logowanie i sesja na urządzeniu mobilnym

**User story:**  
Jako użytkownik, chcę zalogować się przez Google na telefonie i pozostać zalogowanym (do wylogowania lub wygaśnięcia sesji), aby nie wpisywać hasła przy każdym wejściu.

**Subtaski:**
- [Osoba A] Backend: sprawdzenie, że JWT + refresh działają z requestami z mobile (nagłówki, CORS).
- [Osoba B] Frontend: flow logowania Google na mobile (redirect lub popup – wybór i obsługa); zapis tokenu (localStorage/sessionStorage lub secure storage jeśli PWA).
- [Osoba B] Frontend: automatyczne odświeżanie tokenu przy 401 (interceptor) – żeby sesja nie psuła się na mobile.
- [Osoba C] Testy: logowanie na telefonie/emulatorze, przejście do dashboardu, zamknięcie przeglądarki i ponowne wejście – sesja zachowana lub czytelny komunikat wylogowania.

**Kryteria ukończenia:** Logowanie Google na telefonie działa; użytkownik nie jest wylogowywany przy normalnym użytkowaniu (dopóki token jest ważny / refresh działa).

---

#### Task 57.5 – Kluczowe flow na mobile (weryfikacja end-to-end)

**User story:**  
Jako kierowca na telefonie, chcę dodać przejazd, zobaczyć rezerwacje i zaakceptować/odrzucić. Jako pasażer – wyszukać przejazd, zarezerwować i zobaczyć status. Aby cała aplikacja była w pełni użyteczna z telefonu.

**Subtaski:**
- [Osoba A] Przegląd wszystkich ekranów kierowcy na mobile (Dashboard, Dodaj przejazd, Moje przejazdy, Rezerwacje, Portfel, Historia, Znajomi, Zaufani) – lista brakujących poprawek (layout, przyciski, tekst).
- [Osoba B] Przegląd wszystkich ekranów pasażera na mobile (Dashboard, Wyszukiwanie, Szczegóły przejazdu, Rezerwacja, Moje rezerwacje, Powiadomienia, Profil, Portfel) – lista brakujących poprawek.
- [Osoba C] Scenariusze E2E na telefonie/emulatorze: (1) Pasażer: wyszukaj → zarezerwuj → zobacz status. (2) Kierowca: dodaj przejazd → zaakceptuj rezerwację → wyślij powiadomienie. (3) Wspólne: profil, portfel, wylogowanie. Dokumentacja: „Co przetestować na mobile”.
- Wszyscy: naprawa ustaleń z przeglądu (podział jak w backlogu).

**Kryteria ukończenia:** Kierowca i pasażer mogą wykonać pełny, kluczowy flow wyłącznie z telefonu; lista usterek z przeglądu jest zamknięta.

---

#### Podział na osoby (sugestia dla ~3 osób)

| Osoba | Proponowane taski | Główny obszar |
|-------|--------------------|----------------|
| **Osoba 1** | **57.0** (tworzenie appki: PWA / build), 57.1 (adres + instalacja), 57.2 (nawigacja, formularze) | Tworzenie aplikacji mobilnej, PWA, UX mobile |
| **Osoba 2** | 57.3 (push), 57.4 (logowanie/sesja) | Backend push + Frontend auth/push |
| **Osoba 3** | 57.5 (E2E, przegląd, testy), wsparcie przy 57.0/57.1 (testy instalacji) | Testy, weryfikacja, dokumentacja |

W Jirze: **PT2025NFCP-57** = epic; **57.0** = tworzenie aplikacji mobilnej (decyzja PWA vs sklepy + build do pobrania i działanie pod adresem); **57.1–57.5** = child issues jak wyżej. PT2025NFCP-95 i PT2025NFCP-96 można zlinkować do 57.1 (dostęp) i 57.3 (push) albo zamknąć jako zrealizowane w ramach 57.

---

## 3. Co zostawić bez zmian (już user story i sensowne)

- **PT2025NFCP-75** – Kierowca: powiadomienie do pasażerów – rozpisane poniżej (user story + co jest zrobione + subtaski).

---

#### PT2025NFCP-75 – Kierowca: powiadomienie do wszystkich pasażerów o zmianie

**User story:**  
Jako kierowca, chcę móc wysłać powiadomienie wszystkim pasażerom o zmianie (np. opóźnienie, zmiana miejsca spotkania), aby poinformować wszystkich jednocześnie.

**Co już jest zrobione:**
- **Backend:** Endpoint `POST /api/trips/<id>/notify_passengers/` (body: `{ "message": "..." }`). Tworzy powiadomienie typu `driver_message` dla każdego pasażera z aktywną rezerwacją (reserved/accepted/paid). Szanuje `notifications_enabled` w profilu pasażera. Opis w `TEST_POWIADOMIENIA_KIEROWCY.md`.
- **Frontend:** W MyTrips przycisk „Wyślij powiadomienie” (ikona dzwonka), dialog z polem tekstowym, wywołanie `tripService.notifyPassengers(tripId, message)`.
- **Pasażer:** Powiadomienie pojawia się na liście powiadomień (ikona dzwonka w PassengerDashboard); typ wyświetlany jako „Wiadomość od kierowcy” z treścią + trasa + data.

**Subtaski (do wpisania w Jirę / do zrobienia):**
1. **Weryfikacja E2E** – Przetestować pełny flow: kierowca w Moje Przejazdy → „Wyślij powiadomienie” → wpisuje wiadomość (np. „Opóźnienie 15 min”) → wysyła. Zalogować się jako pasażer tego przejazdu i sprawdzić, że powiadomienie widać w panelu (dzwonek). Zgodnie z `TEST_POWIADOMIENIA_KIEROWCY.md`. Zamknąć ticket lub dopisać brakujące kroki do dokumentacji.
2. **Komunikat gdy brak pasażerów** – Sprawdzić, że gdy przejazd nie ma żadnych pasażerów z aktywnymi rezerwacjami, backend zwraca czytelny komunikat (już jest), a frontend go pokazuje (snackbar). Ewentualnie: przycisk „Wyślij powiadomienie” tylko dla przejazdów, które mają pasażerów (opcjonalnie).
3. **Szablony wiadomości (opcjonalnie)** – W dialogu dodać szybkie wybory, np. „Opóźnienie”, „Zmiana miejsca spotkania”, „Inna” + pole na doprecyzowanie, żeby kierowca mógł wybrać szablon i uzupełnić szczegóły.
4. **Push na mobile (na później)** – Gdy będzie wdrożone powiadomienie push (Task 57.3), dodać wysyłkę push do pasażerów przy `driver_message`, żeby dostawali powiadomienie na telefon nawet gdy nie mają otwartej aplikacji. Można osobny subtask lub link do 57.3.

**Kryteria ukończenia:** Flow kierowca → wysłanie wiadomości → pasażer widzi powiadomienie jest zweryfikowany i udokumentowany; ewentualne ulepszenia (szablony, przycisk tylko przy pasażerach) zrobione według decyzji zespołu.

---
- **PT2025NFCP-97** – Pasażer: szczegóły przejazdu (kierowca, trasa, recenzje) – już jest TripDetails; ewentualnie dopisać subtaski: „Wyświetlanie opisu kierowcy”, „Mapa trasy”, „Lista recenzji”.
- **PT2025NFCP-87** – Średnia ocena i liczba recenzji – w kodzie jest w `UserDetailsView`; jeśli w UI wszędzie widać – Done; jeśli nie – subtask „Wyświetlanie średniej i liczby recenzji przy profilu użytkownika”.
- **PT2025NFCP-143** – Cookies + polityka – to samo co Task 2 w BACKLOG_NOWE_TASKI; albo zamknąć 143 i mieć jeden task (nowy), albo zostawić 143 i nie duplikować w nowych.

---

## 4. Szybka ściąga – co zrobić w Jirze

1. **Usunąć / zamknąć:** 1, 2, 106; ewent. zmergować 27 i 28 w jeden.
2. **Dla każdego z sekcji 2:** wejść w ticket → wkleić **User story** do opisu → dodać **Subtaski** z listy (każdy punkt = jeden subtask).
3. **PT2025NFCP-32:** rozbić na konkretne zadania techniczne (subtaski lub osobne tickety).
4. **PT2025NFCP-57:** epic „Aplikacja mobilna (obowiązkowa)” z 5 child taskami (57.1–57.5); PT2025NFCP-95 i PT2025NFCP-96 zlinkować do 57.1 i 57.3 lub zamknąć.
5. **75, 97, 87, 143:** albo oznaczyć Done, albo dopisać 1–2 subtaski (weryfikacja / dopięcie UI) i zamknąć po zrobieniu.

Jak chcesz, mogę z tego zrobić jedną tabelkę „ID | Akcja (usuń / przerób) | User story (skrót)” do wklejenia w Jirę lub Confluence.
