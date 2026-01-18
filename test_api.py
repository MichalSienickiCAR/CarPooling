#!/usr/bin/env python3
"""
Skrypt do testowania nowych endpointów API
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoints():
    """Test dostępności nowych endpointów"""
    
    print("🔍 Testowanie nowych endpointów API...\n")
    
    endpoints = [
        ("Friendships", "/friendships/"),
        ("Trusted Users", "/trusted-users/"),
        ("Reports", "/reports/"),
    ]
    
    for name, endpoint in endpoints:
        url = BASE_URL + endpoint
        try:
            response = requests.options(url)
            if response.status_code in [200, 401, 403]:
                print(f"✅ {name}: {endpoint} - OK (Status: {response.status_code})")
            else:
                print(f"❌ {name}: {endpoint} - BŁĄD (Status: {response.status_code})")
        except Exception as e:
            print(f"❌ {name}: {endpoint} - BŁĄD: {str(e)}")
    
    print("\n📝 Uwaga: Status 401/403 jest OK - oznacza, że endpoint istnieje ale wymaga autentykacji")
    print("\n✨ Test zakończony!")

if __name__ == "__main__":
    test_endpoints()
