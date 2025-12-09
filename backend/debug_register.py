import requests

URL = "http://localhost:8000/api/user/register/"

data = {
    "username": "nowy_user",
    "email": "test@test.com",
    "password": "Test1234!",
    "preferred_role": "both"
}

print(f"Wysyłanie żądania do {URL}...")
print(f"Dane: {data}")

try:
    response = requests.post(URL, json=data)
    print(f"Status kod: {response.status_code}")
    print(f"Odpowiedź serwera: {response.text}")
except Exception as e:
    print(f"Błąd połączenia: {e}")
