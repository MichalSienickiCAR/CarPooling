# Definition of Done (DoD)

## Przegląd

Definition of Done (DoD) definiuje minimalne kryteria, które muszą być spełnione, aby uznać zadanie za zakończone.

## Podstawowe Kryteria

### Funkcjonalność
- [ ] Funkcjonalność działa zgodnie z wymaganiami
- [ ] Funkcjonalność została przetestowana manualnie
- [ ] Podstawowe przypadki brzegowe są obsłużone

### Kod
- [ ] Kod jest czytelny i zrozumiały
- [ ] Kod nie zawiera hardcoded wartości wrażliwych (używa .env)
- [ ] Kod kompiluje się bez błędów
- [ ] Nie ma oczywistych błędów w kodzie

### Integracja
- [ ] Kod integruje się z istniejącym kodem
- [ ] Nie ma konfliktów z najnowszym branchiem
- [ ] Migracje działają poprawnie (jeśli dotyczy)

## Kryteria dla Backend (Django)

### Django Backend
- [ ] Modele działają poprawnie
- [ ] Serializery mają podstawową walidację
- [ ] Views mają odpowiednie permissions
- [ ] URLs są poprawnie skonfigurowane
- [ ] Migracje są utworzone i działają (jeśli dotyczy)

### API
- [ ] API endpoints zwracają poprawne status codes
- [ ] API endpoints działają (przetestowane manualnie)
- [ ] Podstawowa obsługa błędów jest zaimplementowana

## Kryteria dla Git

### Git
- [ ] Commit messages są opisowe
- [ ] Branch name zawiera numer taska (np. feature/PT2025NFCP-XX)
- [ ] Kod został zmergowany z najnowszym branchiem
- [ ] Nie ma konfliktów

### Pull Request
- [ ] PR ma opisowy tytuł zawierający numer taska (np. `PT2025NFCP-9: Wyszukiwanie przejazdów`)
- [ ] PR ma krótki opis zmian
- [ ] PR ma link do taska w Jira (np. `Closes PT2025NFCP-9` lub `Link: https://jira...`)
- [ ] PR zawiera listę zmian (co zostało dodane/zmienione)

## Checklist przed PR

- [ ] Funkcjonalność działa (przetestowana manualnie)
- [ ] Kod kompiluje się bez błędów
- [ ] Nie ma konfliktów z najnowszym branchiem
- [ ] Commit messages są opisowe (zawierają numer taska jeśli dotyczy)
- [ ] PR ma tytuł z numerem taska i opis z linkiem do Jira
- [ ] Podstawowe przypadki brzegowe są obsłużone
- [ ] Obsługa błędów jest zaimplementowana

## Przykładowe Commit Messages

Dobre (z numerem taska):
- `feat: PT2025NFCP-9 - dodanie wyszukiwania przejazdów`
- `fix: PT2025NFCP-10 - naprawa błędu w wyświetlaniu listy przejazdów`
- `docs: PT2025NFCP-45 - aktualizacja README`
- `feat: PT2025NFCP-5 - dodanie formularza tworzenia przejazdu`

Dobre (bez numeru taska - dla małych zmian):
- `fix: poprawa walidacji daty`
- `refactor: uproszczenie logiki wyszukiwania`
- `docs: aktualizacja komentarzy`

Złe:
- `fix`
- `update`
- `zmiany`
- `dodano funkcję` (bez numeru taska i szczegółów)

## Konwencja Branchy

- `feature/PT2025NFCP-XX-opis` - nowa funkcjonalność
- `fix/PT2025NFCP-XX-opis` - naprawa błędu

## Prosty Workflow

1. Pobierz najnowsze zmiany: `git pull origin feature/najnowszy-branch`
2. Utwórz branch: `git checkout -b feature/PT2025NFCP-XX-opis`
3. Pracuj i commituj: `git commit -m "opis zmian"`
4. Push: `git push origin feature/PT2025NFCP-XX-opis`
5. Utwórz PR z opisem i linkiem do Jira

---


