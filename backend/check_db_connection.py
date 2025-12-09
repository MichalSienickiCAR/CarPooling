"""
Skrypt do sprawdzania polaczenia z PostgreSQL
Uruchom: python check_db_connection.py
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

try:
    import psycopg2
    from psycopg2 import sql
    
    # Get database configuration
    db_name = os.getenv('DB_NAME', 'carpooling')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    
    print(f"Proba polaczenia z PostgreSQL...")
    print(f"Host: {db_host}:{db_port}")
    print(f"Database: {db_name}")
    print(f"User: {db_user}")
    print(f"Password length: {len(db_password)}")
    print("-" * 50)
    
    # Try to connect to PostgreSQL server (without specific database)
    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database='postgres'  # Connect to default database first
        )
        print("[OK] Polaczenie z serwerem PostgreSQL: SUKCES")
        
        # Check if database exists
        cur = conn.cursor()
        cur.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        exists = cur.fetchone()
        
        if exists:
            print(f"[OK] Baza danych '{db_name}' istnieje")
            
            # Try to connect to the specific database
            conn.close()
            conn = psycopg2.connect(
                host=db_host,
                port=db_port,
                user=db_user,
                password=db_password,
                database=db_name
            )
            print(f"[OK] Polaczenie z baza '{db_name}': SUKCES")
            conn.close()
            
        else:
            print(f"[BLAD] Baza danych '{db_name}' NIE istnieje")
            print(f"\nAby utworzyc baze, uruchom w psql:")
            print(f"  CREATE DATABASE {db_name};")
            sys.exit(1)
            
    except psycopg2.OperationalError as e:
        print(f"[BLAD] Blad polaczenia: {e}")
        print("\nMozliwe przyczyny:")
        print("1. PostgreSQL nie jest uruchomiony")
        print("2. Nieprawidlowe dane dostepowe (uzytkownik/haslo)")
        print("3. PostgreSQL nie nasluchuje na porcie", db_port)
        sys.exit(1)
    except UnicodeDecodeError as e:
        print(f"[BLAD] Problem z kodowaniem hasla!")
        print(f"Szczegoly: {e}")
        print("\nRozwiazanie:")
        print("1. Zmien haslo w PostgreSQL na proste (tylko litery i cyfry, bez znakow specjalnych)")
        print("2. Zaktualizuj DB_PASSWORD w pliku .env")
        print("3. Upewnij sie, ze plik .env jest zapisany w kodowaniu UTF-8")
        sys.exit(1)
    except Exception as e:
        print(f"[BLAD] Nieoczekiwany blad: {type(e).__name__}: {e}")
        sys.exit(1)
        
except ImportError:
    print("❌ psycopg2 nie jest zainstalowany")
    print("Zainstaluj: pip install psycopg2-binary")
    sys.exit(1)

