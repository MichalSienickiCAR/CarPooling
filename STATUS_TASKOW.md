# Status 17 tasków - Analiza co jest zrobione

## ✅ ZROBIONE (już w projekcie):

### 1. PT2025NFCP-50, PT2025NFCP-74 - System komunikacji/czatu
- ✅ Model `Message` w `models.py`
- ✅ Komponenty: prawdopodobnie w komponencie czatu
- Status: **ZROBIONE**

### 2. PT2025NFCP-54 - System ocen i recenzji
- ✅ Model `Review` w `models.py` (rating 1-5, comment)
- ✅ Komponenty: `Reviews.tsx`, `AddReviewDialog.tsx`
- Status: **ZROBIONE**

### 3. PT2025NFCP-72 - Oznaczanie użytkownika jako zaufany
- ✅ Model `TrustedUser` w `models.py`
- ✅ Komponenty: `TrustedUsers.tsx`
- Status: **ZROBIONE**

### 4. PT2025NFCP-00 - Zgłaszanie niewłaściwego zachowania
- ✅ Model `Report` w `models.py` (z różnymi powodami)
- ✅ Komponenty: `ReportUser.tsx`
- Status: **ZROBIONE**

### 5. PT2025NFCP-77 - Wspólna historia przejazdów
- ✅ Komponent: `History.tsx`
- Status: **ZROBIONE**

### 6. Przejazdy cykliczne
- ✅ Model `RecurringTrip` w `models.py`
- ✅ Komponenty: `RecurringTrips.tsx`, `AddRecurringTrip.tsx`
- Status: **ZROBIONE**

### 7. Lista oczekujących (Waitlist)
- ✅ Model `Waitlist` w `models.py`
- ✅ Komponent: `WaitlistDialog.tsx`
- Status: **ZROBIONE**

### 8. Znajomi (Friendship)
- ✅ Model `Friendship` w `models.py`
- ✅ Komponenty: `Friends.tsx`
- Status: **ZROBIONE**

---

## ❌ NIE ZROBIONE (do zaimplementowania):

### 1. PT2025NFCP-58 - Filtrowanie przejazdów po cenie (min/max)
- ❌ Brak w `views.py` (nie ma `min_price`, `max_price`)
- Status: **DO ZROBIENIA**

### 2. PT2025NFCP-59 - Sortowanie przejazdów (data, cena, ocena)
- ❌ Brak sortowania w `TripSearchView`
- Status: **DO ZROBIENIA**

### 3. PT2025NFCP-60 - Wyszukiwanie z punktami pośrednimi
- ❌ Brak `via_location` w `TripSearchView`
- Status: **DO ZROBIENIA**

### 4. PT2025NFCP-136 - Ustawianie trasy przejazdu używając Google Maps (kierowca)
- ❌ Brak integracji Google Maps w `AddTrip.tsx`
- ✅ Klucz API dodany do `.env.local`
- Status: **DO ZROBIENIA**

### 5. PT2025NFCP-130 - Przeglądanie trasy przejazdu używając Google Maps (pasażer)
- ❌ Brak integracji Google Maps w szczegółach przejazdu
- Status: **DO ZROBIENIA**

### 6. PT2025NFCP-61 - Wyświetlanie dostępnych przejazdów na mapie
- ❌ Brak komponentu mapy z markerami przejazdów
- Status: **DO ZROBIENIA**

### 7. PT2025NFCP-135 - Określanie cech przejazdu (muzyka, zwierzęta, palenie, rozmowa)
- ❌ Brak pól w modelu `Trip` dla cech przejazdu
- Status: **DO ZROBIENIA**

### 8. PT2025NFCP-75 - Wysyłanie powiadomienia do wszystkich pasażerów o zmianie (kierowca)
- ⚠️ Sprawdzić czy jest endpoint `notify_passengers` w `views.py`
- Status: **DO SPRAWDZENIA**

### 9. PT2025NFCP-78 - Eksport historii przejazdów do PDF/CSV
- ❌ Brak funkcjonalności eksportu
- Status: **DO ZROBIENIA**

### 10. PT2025NFCP-79 - Raporty zarobków (miesięczne, roczne) dla kierowców
- ❌ Brak endpointów raportów zarobków
- Status: **DO ZROBIENIA**

### 11. PT2025NFCP-51 - Historia i raporty (uzupełnienie)
- ⚠️ Jest `History.tsx` ale może brakować szczegółów
- Status: **DO SPRAWDZENIA**

---

## 📝 UWAGI:

- W `feature/mateusz-work` są już zrobione: PT2025NFCP-58, PT2025NFCP-59, PT2025NFCP-60
- Trzeba je pobrać i zintegrować
- Google Maps API key jest już w `.env.local`
- Większość funkcjonalności społecznościowych (oceny, znajomi, zaufani) jest już zrobiona

---

## 🎯 PRIORYTETY:

1. **Pobierz zmiany z `feature/mateusz-work`** (filtrowanie, sortowanie, wyszukiwanie)
2. **Google Maps** - integracja w formularzu i szczegółach
3. **Cechy przejazdu** - dodanie pól do modelu
4. **Eksport i raporty** - funkcjonalności biznesowe
