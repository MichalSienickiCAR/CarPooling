import psycopg2
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

def check_tables():
    db_name = os.getenv('DB_NAME', 'carpooling')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')

    print(f"Sprawdzanie tabel w bazie {db_name}...")

    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        cur = conn.cursor()
        
        # Zapytanie o tabele w schemacie public
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cur.fetchall()
        print("\nZnalezione tabele:")
        found_booking = False
        found_trip = False
        
        for table in tables:
            print(f" - {table[0]}")
            if table[0] == 'api_booking':
                found_booking = True
            if table[0] == 'api_trip':
                found_trip = True
                
        print("-" * 30)
        if not found_booking:
            print("❌ UWAGA: Tabela 'api_booking' NIE ISTNIEJE!")
        else:
            print("✅ Tabela 'api_booking' istnieje.")
            
        if not found_trip:
            print("❌ UWAGA: Tabela 'api_trip' NIE ISTNIEJE!")
        else:
             print("✅ Tabela 'api_trip' istnieje.")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Blad: {e}")

if __name__ == "__main__":
    check_tables()
