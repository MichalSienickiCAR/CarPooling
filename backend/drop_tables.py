import psycopg2
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

def drop_tables():
    db_name = os.getenv('DB_NAME', 'carpooling')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')

    print(f"Usuwanie tabel api_* w bazie {db_name}...")

    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # Usuwamy tabele w kolejności (zależności kluczy obcych)
        tables_to_drop = ['api_trip', 'api_userprofile', 'api_booking'] # booking dodany na wypadek gdyby sie pojawil
        
        for table in tables_to_drop:
            print(f"Usuwanie tabeli: {table}")
            try:
                cur.execute(f"DROP TABLE IF EXISTS public.{table} CASCADE;")
                print(" - OK")
            except Exception as e:
                print(f" - Blad: {e}")

        print("-" * 30)
        print("Tabele usuniete.")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Blad polaczenia: {e}")

if __name__ == "__main__":
    drop_tables()
