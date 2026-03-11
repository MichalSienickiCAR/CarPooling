# Nowe taski do backlogu (których jeszcze nie ma)

Taski do wrzucenia do Jiry – potem osobno ustalicie, co z obecnych jest zrobione.

---

## Task 1: Logowanie wyłącznie przez Google (usunięcie e-mail/hasło)
**User story:** Jako użytkownik, chcę logować się wyłącznie przez Google (bez zakładania hasła), aby wejść do aplikacji szybko i bezpiecznie jednym kliknięciem.

### Subtaski
- Backend: wyłączenie lub usunięcie endpointów rejestracji i logowania JWT po e-mailu/hasłe (zostają tylko endpointy Google OAuth).
- Backend: przy pierwszym logowaniu przez Google – automatyczne zakładanie konta i profilu (preferred_role do wyboru po pierwszym logowaniu).
- Frontend: usunięcie stron/formularzy Logowanie (e-mail/hasło) i Rejestracja; na landingu tylko przycisk „Zaloguj przez Google”.
- Frontend: po pierwszym logowaniu – ekran wyboru roli (kierowca/pasażer) i zapis w profilu.
- Dokumentacja: aktualizacja README (instalacja, jak się zalogować – tylko Google).
- Testy: flow „Zaloguj przez Google” → konto utworzone / zalogowany; brak możliwości logowania bez Google.

---

## Task 2: Zgoda na cookies i polityka prywatności (RODO)
**User story:** Jako użytkownik, chcę zobaczyć banner o cookies i mieć dostęp do polityki prywatności oraz regulaminu, aby wiedzieć, jak są chronione moje dane i na co wyrażam zgodę.

### Subtaski
- Strona / dokument: polityka prywatności (PL).
- Strona / dokument: regulamin (PL).
- Frontend: banner cookies (akceptuj / odrzuć opcjonalne) + zapis preferencji.
- Frontend: linki w stopce: Polityka prywatności, Regulamin.
- Testy: sprawdzenie, że banner się pokazuje i że wybór jest zapisywany.

---

## Task 3: Cechy przejazdu (muzyka, zwierzęta, palenie, rozmowa)
**User story:** Jako kierowca, chcę zaznaczyć cechy przejazdu (muzyka, zwierzęta, palenie, rozmowa), aby pasażer wiedział, czego może się spodziewać. Jako pasażer, chcę widzieć te cechy w szczegółach przejazdu, aby wybrać przejazd dopasowany do siebie.

### Subtaski
- Backend: pola w modelu Trip (np. music_ok, pets_ok, smoking_ok, chat_ok) + migracja.
- Backend: serializer i API (GET/PATCH) uwzględniające te pola.
- Frontend: w formularzu dodawania/edycji przejazdu – checkboxy cech.
- Frontend: w szczegółach przejazdu – wyświetlenie ikon/opisów cech.
- Testy: tworzenie przejazdu z cechami, filtrowanie po cechach (opcjonalnie).

---

## Task 4: Poprawa działania mapy (integracja z zewnętrznym API map)
**User story:** Jako kierowca, chcę ustawiać trasę na mapie (start, koniec, ewentualnie via), aby pasażer widział dokładną trasę. Jako pasażer, chcę widzieć przejazdy na mapie i kliknąć w marker, aby zobaczyć szczegóły, aby łatwiej wybrać przejazd.

### Subtaski
- Backend: przechowanie współrzędnych lub identyfikatorów trasy (jeśli API tego wymaga); ewentualne geokodowanie adresów.
- Frontend: integracja z wybranym API map – komponent mapy (klucz/konfiguracja w .env).
- Frontend: w AddTrip – wybór punktu start/koniec (i ewentualnie via) z mapy.
- Frontend: w TripDetails – podgląd trasy przejazdu na mapie.
- Frontend: w wyszukiwaniu – widok mapy z markerami przejazdów; klik w marker → skrót lub przejście do szczegółów.
- Konfiguracja: klucz API / URL w .env, dokumentacja którą API używacie.
- Testy: mapa się ładuje, trasa i markery są poprawne.

---

## Task 5: Preferencje powiadomień (co chcę dostawać)
**User story:** Jako użytkownik, chcę włączać i wyłączać poszczególne typy powiadomień (rezerwacje, wiadomości kierowcy, ulubione trasy), aby dostawać tylko to, na co mam ochotę.

### Subtaski
- Backend: rozszerzenie profilu o flagi per typ (np. notify_booking, notify_driver_message) lub jeden JSON.
- Backend: przy wysyłce powiadomienia – sprawdzanie preferencji.
- Frontend: w profilu / ustawieniach – sekcja „Powiadomienia” z przełącznikami.
- Testy: wyłączenie typu i sprawdzenie, że nie dostaje tego typu powiadomień.

---

## Task 6: Blokowanie użytkownika
**User story:** Jako użytkownik, chcę zablokować innego użytkownika, aby nie widzieć jego przejazdów ani nie móc z nim wchodzić w interakcje (rezerwacje, wiadomości).

### Subtaski
- Backend: model BlockedUser (kto, kogo) lub rozszerzenie Friendship (status blocked).
- Backend: przy wyszukiwaniu przejazdów / rezerwacjach – ukrywanie lub blokowanie interakcji z zablokowanymi.
- Frontend: przy profilu użytkownika – przycisk „Zablokuj”.
- Frontend: lista zablokowanych w ustawieniach + odblokowanie.
- Testy: zablokowany nie widzi przejazdów blokującego / nie może zarezerwować.

---

## Task 7: Zasady anulowania (deadline, zwrot)
**User story:** Jako użytkownik, chcę wiedzieć, do kiedy mogę anulować rezerwację za darmo i kiedy dostanę zwrot środków, aby planować podróż bez niespodzianek.

### Subtaski
- Backend: reguły (np. anulowanie do X godzin przed przejazdem = zwrot; później = brak zwrotu).
- Backend: przy anulowaniu rezerwacji – automatyczny zwrot do portfela według reguł.
- Frontend: wyświetlanie „Możesz anulować za darmo do…” w szczegółach rezerwacji.
- Dokumentacja: opis zasad w regulaminie lub w pomocy.

---

## Task 8: Tryb ciemny (dark mode)
**User story:** Jako użytkownik, chcę przełączyć aplikację na tryb ciemny, aby wygodniej korzystać z niej wieczorem lub przy słabym świetle.

### Subtaski
- Frontend: kontekst/motyw (np. MUI theme) z trybem jasnym i ciemnym.
- Frontend: przełącznik w nagłówku lub w ustawieniach.
- Frontend: zapis wyboru (localStorage lub preferencja użytkownika w profilu).
- Testy: przełączenie i sprawdzenie, że kolory się zmieniają.

---

## Task 9: Strona kontakt / wsparcie
**User story:** Jako użytkownik, chcę mieć możliwość skontaktowania się z supportem (formularz lub e-mail) i ewentualnie zobaczyć FAQ, aby uzyskać pomoc przy problemach.

### Subtaski
- Frontend: strona „Kontakt” z formularzem (temat, treść, e-mail nadawcy).
- Backend: endpoint do wysłania wiadomości (zapis w DB lub wysłanie e-maila).
- Frontend: link w stopce / menu: Kontakt (oraz ewentualnie „FAQ”).
- Testy: wysłanie formularza i sprawdzenie, że wiadomość trafia (e-mail lub rekord w DB).

---

## Task 10: Ograniczenie nadużyć (rate limiting)
**User story:** Jako właściciel platformy, chcę ograniczyć liczbę requestów na użytkownika (np. logowanie, wyszukiwanie), aby chronić aplikację przed botami i przeciążeniem.

### Subtaski
- Backend: rate limiting na wybranych endpointach (np. throttle w DRF lub nginx).
- Backend: rozsądne limity (np. 5 prób logowania na 15 min, X wyszukiwań na minutę).
- Obsługa błędu: komunikat „Zbyt wiele prób, spróbuj za chwilę” (frontend + API).
- Testy: przekroczenie limitu i sprawdzenie odpowiedzi 429 / komunikatu.

---

## Task 11: Lepsze komunikaty błędów i puste stany
**User story:** Jako użytkownik, chcę widzieć zrozumiałe komunikaty gdy coś pójdzie nie tak (błąd sieci, brak uprawnień) oraz przy pustych listach (brak przejazdów, rezerwacji), aby wiedzieć, co się dzieje i co mogę zrobić.

### Subtaski
- Frontend: komponenty „pusty stan” (np. brak przejazdów, brak rezerwacji, brak powiadomień).
- Frontend: mapowanie błędów API na komunikaty po polsku (np. 403, 404, 500).
- Frontend: ładowanie (skeleton/spinner) w listach i formularzach.
- Testy: sprawdzenie kilku ekranów przy pustych danych i przy błędzie sieci.

---

## Task 12: Onboarding / pierwsze kroki
**User story:** Jako nowy użytkownik, chcę zobaczyć krótki przewodnik po pierwszym logowaniu (np. gdzie dodać przejazd, jak wyszukać), aby szybko zacząć korzystać z aplikacji.

### Subtaski
- Frontend: wykrycie „pierwszy raz” (np. flaga w profilu lub localStorage).
- Frontend: tooltipy lub jeden ekran „Pierwsze kroki” (slajdy lub modal).
- Frontend: możliwość pominięcia i „nie pokazuj ponownie”.
- Testy: sprawdzenie flow dla nowego użytkownika.

---

## Task 13: Eksport moich danych (RODO)
**User story:** Jako użytkownik, chcę pobrać kopię swoich danych (profil, przejazdy, rezerwacje), aby mieć je dla siebie lub przenieść je gdzie indziej (prawo do przenoszenia danych).

### Subtaski
- Backend: endpoint „eksport moich danych” (JSON lub ZIP z danymi użytkownika).
- Backend: tylko dane zalogowanego użytkownika, bez danych innych.
- Frontend: przycisk w profilu / ustawieniach „Pobierz moje dane”.
- Dokumentacja: wzmianka w polityce prywatności.
- Testy: eksport i sprawdzenie, że zawiera oczekiwane dane.

---

## Task 14: Dobre praktyki Git w zespole
**User story:** Jako członek zespołu, chcę mieć jasne zasady pracy w Git (jak nazywać branche, jak pisać commity, co jest w .gitignore), aby uniknąć chaosu w repozytorium i łatwo łączyć zmiany.

### Subtaski
- Dokumentacja: opis strategii branchy (np. main + feature/PT2025NFCP-XX-opis) w README lub CONTRIBUTING.
- Dokumentacja: konwencja commitów (np. „PT2025NFCP-XX: krótki opis”) w README lub CONTRIBUTING.
- Repozytorium: uzupełnienie .gitignore (venv, .env, node_modules, build, __pycache__, .idea, itd.).
- Opcjonalnie: prosty CI (np. Bitbucket Pipelines) – uruchomienie lintu i testów przy pushu/PR.
- Opcjonalnie: szablon Pull Request / Merge Request (checklist: co zrobione, jak przetestować).
- Weryfikacja: po clone i krokach z README projekt da się uruchomić lokalnie.

---

Możesz te taski skopiować do Jiry jako nowe zgłoszenia; każdy ma już rozbite subtaski (Backend / Frontend / Testy / Dokumentacja tam gdzie potrzeba). Później osobno przejdziecie listę starych tasków i oznaczycie, co jest zrobione.
