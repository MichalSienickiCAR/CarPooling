import psycopg2
import sys

# Konfiguracja z pliku fix_postgres_password.ps1
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "carpooling"
# Uzytkownik administracyjny
ADMIN_USER = "postgres"
# Haslo z Twojego skryptu .ps1 - zakladam ze to jest aktualne haslo admina
ADMIN_PASS = "Kp9mN2xQvR7wF4jL8hT3bY6cZ1a" 
# Uzytkownik aplikacji ktoremu chcemy nadac uprawnienia
APP_USER = "carpool"

def fix_permissions():
    print(f"Proba polaczenia jako {ADMIN_USER} w celu naprawy uprawnien dla {APP_USER}...")
    
    try:
        # Laczymy sie do bazy carpooling jako admin
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=ADMIN_USER,
            password=ADMIN_PASS
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        print(f"Polaczono! Nadawanie uprawnien...")
        
        commands = [
            f"GRANT USAGE ON SCHEMA public TO {APP_USER};",
            f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {APP_USER};",
            f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {APP_USER};",
            f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {APP_USER};",
            f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {APP_USER};"
        ]
        
        for cmd in commands:
            print(f"Wykonywanie: {cmd}")
            cur.execute(cmd)
            
        print("-" * 50)
        print("SUKCES: Uprawnienia zostaly nadane!")
        print(f"Uzytkownik '{APP_USER}' powinien miec teraz pelny dostep do bazy '{DB_NAME}'.")
        
        cur.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f"BLAD POLACZENIA: Nie mozna zalogowac sie jako {ADMIN_USER}.")
        print(f"Szczegoly: {e}")
        print("Czy haslo admina PostgreSQL jest poprawne?")
    except Exception as e:
        print(f"inny BLAD: {e}")

if __name__ == "__main__":
    fix_permissions()
