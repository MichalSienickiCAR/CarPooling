"""Sprawdzenie użytkowników w bazie danych"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

print("=" * 60)
print("Uzytkownicy w bazie danych:")
print("=" * 60)

users = User.objects.all()
print(f"Liczba uzytkownikow: {users.count()}")

if users.count() > 0:
    print("\nLista uzytkownikow:")
    for user in users:
        try:
            profile = user.profile
            role = profile.preferred_role
        except:
            role = "brak profilu"
        print(f"  - {user.username} ({user.email}) - rola: {role}")
else:
    print("\nBrak uzytkownikow w bazie danych!")
    print("Musisz utworzyc nowe konto przez rejestracje.")

print("=" * 60)

