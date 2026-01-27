# Fix: Wpłacanie pieniędzy do portfela

## Problem
Wpłacanie pieniędzy do portfela zwracało błąd 500: `decimal.InvalidOperation`

## Diagnoza
Problem nie był w kodzie, ale w uszkodzonych danych w bazie:
- Wallet użytkownika "kierowca" (id=1) miał wartość balance = `3e+46` (notacja naukowa)
- Wartość ta reprezentuje 3 × 10^46, czyli liczbę znacznie przekraczającą maksymalny rozmiar `DecimalField(max_digits=10, decimal_places=2)`
- Django/SQLite nie mogły przekonwertować tej wartości na Decimal podczas odczytu z bazy

## Rozwiązanie

### 1. Naprawa bazy danych
```python
import sqlite3
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute('UPDATE api_wallet SET balance = 0 WHERE id = 1')
conn.commit()
conn.close()
```

### 2. Ulepszenia kodu

#### Backend (views.py)
- Dodano bezpieczniejszą konwersję amount przez float: `amount = Decimal(str(float(amount)))`
- Lepsze logowanie błędów z `exc_info=True`
- Walidacja czy amount nie jest None lub pustym stringiem

#### Frontend (Wallet.tsx)  
- Zmieniono `inputProps={{ min: "0.01", step: "0.01" }}` (string dla HTML5)
- Dodano `helperText` z informacją o minimalnej wartości
- Lepszy komunikat błędu: "Podaj prawidłową kwotę (większą niż 0)"
- Formatowanie kwoty w komunikacie sukcesu: `amount.toFixed(2)`

## Testowanie
Po naprawie:
1. Backend uruchamia się bez błędów
2. Django może odczytać wszystkie wpisy z tabeli `api_wallet`
3. Wpłaty działają poprawnie
4. Transakcje są zapisywane w historii

## Zapobieganie w przyszłości
- Dodać walidację na poziomie backendu przed zapisem do bazy
- Monitorować logi Django pod kątem błędów `decimal.InvalidOperation`
- Regularnie sprawdzać integralność danych w tabeli `api_wallet`
