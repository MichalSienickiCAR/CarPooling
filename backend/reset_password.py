import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

try:
    u = User.objects.get(username='test')
    u.set_password('test1234')
    u.save()
    print("SUKCES: Hasło dla użytkownika 'test' zostało zmienione na 'test1234'")
except User.DoesNotExist:
    print("BŁĄD: Użytkownik 'test' nie istnieje.")
