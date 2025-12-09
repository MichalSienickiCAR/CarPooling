import psycopg2
import sys

# Konfiguracja jak w fix_permissions_python.py
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "carpooling"
ADMIN_USER = "postgres"
ADMIN_PASS = "Kp9mN2xQvR7wF4jL8hT3bY6cZ1a" 
APP_USER = "carpool"

def fix_owner():
    print(f"Zmiana wlasciciela tabel na {APP_USER}...")
    
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=ADMIN_USER,
            password=ADMIN_PASS
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # Pobierz listę wszystkich tabel w public
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
        """)
        tables = cur.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"Zmieniam wlasciciela dla: {table_name}")
            try:
                cur.execute(f"ALTER TABLE public.{table_name} OWNER TO {APP_USER};")
            except Exception as e:
                print(f" - Blad przy {table_name}: {e}")

        # Pobierz sekwencje
        cur.execute("""
            SELECT sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema = 'public';
        """)
        seqs = cur.fetchall()
        
        for seq in seqs:
            seq_name = seq[0]
            print(f"Zmieniam wlasciciela dla sekwencji: {seq_name}")
            try:
                cur.execute(f"ALTER SEQUENCE public.{seq_name} OWNER TO {APP_USER};")
            except Exception as e:
                print(f" - Blad przy {seq_name}: {e}")

            
        print("-" * 50)
        print("Gotowe. Teraz carpool powinien moc zarzadzac tabelami.")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"BLAD GLOWNY: {e}")

if __name__ == "__main__":
    fix_owner()
