# Funkcje Zaawansowane (PT2025NFCP-55)

## Status Implementacji

### ✅ Ukończone (Backend - Modele i Logika)

#### PT2025NFCP-89: Cykliczne Przejazdy
- ✅ Model `RecurringTrip` z polami:
  - Podstawowe (start/end location, time, seats, price)
  - Cykliczność (frequency, weekdays, start_date, end_date)
  - Zarządzanie (active, last_generated)
- ✅ Serializer `RecurringTripSerializer` z walidacją
- ✅ Migracja bazy danych

#### PT2025NFCP-90: Lista Oczekujących
- ✅ Model `Waitlist` z polami:
  - trip, passenger, seats_requested
  - notified, created_at
  - unique_together (trip, passenger)
- ✅ Signal `notify_waitlist_on_cancellation` - automatyczne powiadomienia
- ✅ Serializer `WaitlistSerializer` z walidacją
- ✅ Migracja bazy danych

#### PT2025NFCP-91: Auto-akceptacja Zaufanych
- ✅ Pole `auto_accept` w modelu `TrustedUser`
- ✅ Logika auto-akceptacji w signalu `create_notifications_for_bookings`
- ✅ Migracja bazy danych

### 🚧 Do Dokończenia

#### Backend - Views i URLs

**Plik: `backend/api/views.py`**
Dodać ViewSets:

```python
class RecurringTripViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringTripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return RecurringTrip.objects.filter(driver=user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(driver=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        recurring_trip = self.get_object()
        recurring_trip.active = not recurring_trip.active
        recurring_trip.save()
        return Response({'active': recurring_trip.active})
    
    @action(detail=True, methods=['post'])
    def generate_trips(self, request, pk=None):
        """Generuj przejazdy na następne N dni"""
        recurring_trip = self.get_object()
        days = int(request.data.get('days', 30))
        
        # Logika generowania przejazdów
        from datetime import datetime, timedelta
        from .models import Trip
        
        generated_trips = []
        current_date = max(
            recurring_trip.start_date,
            recurring_trip.last_generated + timedelta(days=1) if recurring_trip.last_generated else recurring_trip.start_date
        )
        end_date = current_date + timedelta(days=days)
        
        if recurring_trip.end_date and end_date > recurring_trip.end_date:
            end_date = recurring_trip.end_date
        
        while current_date <= end_date:
            should_create = False
            
            if recurring_trip.frequency == 'daily':
                should_create = True
            elif recurring_trip.frequency == 'weekly':
                if current_date.weekday() in recurring_trip.weekdays:
                    should_create = True
            elif recurring_trip.frequency == 'biweekly':
                weeks_diff = (current_date - recurring_trip.start_date).days // 7
                if weeks_diff % 2 == 0 and current_date.weekday() in recurring_trip.weekdays:
                    should_create = True
            elif recurring_trip.frequency == 'monthly':
                if current_date.day == recurring_trip.start_date.day:
                    should_create = True
            
            if should_create:
                trip = Trip.objects.create(
                    driver=recurring_trip.driver,
                    start_location=recurring_trip.start_location,
                    end_location=recurring_trip.end_location,
                    intermediate_stops=recurring_trip.intermediate_stops,
                    date=current_date,
                    time=recurring_trip.time,
                    available_seats=recurring_trip.available_seats,
                    price_per_seat=recurring_trip.price_per_seat
                )
                generated_trips.append(trip.id)
            
            current_date += timedelta(days=1)
        
        recurring_trip.last_generated = end_date
        recurring_trip.save()
        
        return Response({
            'generated': len(generated_trips),
            'trip_ids': generated_trips
        })


class WaitlistViewSet(viewsets.ModelViewSet):
    serializer_class = WaitlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Waitlist.objects.filter(passenger=user).order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(passenger=self.request.user)
    
    @action(detail=False, methods=['get'])
    def for_trip(self, request):
        """Lista oczekujących dla konkretnego przejazdu (tylko kierowca)"""
        trip_id = request.query_params.get('trip_id')
        if not trip_id:
            return Response({'error': 'trip_id jest wymagane'}, status=400)
        
        from .models import Trip
        try:
            trip = Trip.objects.get(id=trip_id)
            if trip.driver != request.user:
                return Response({'error': 'Nie jesteś kierowcą tego przejazdu'}, status=403)
            
            waitlist = Waitlist.objects.filter(trip=trip).order_by('created_at')
            serializer = self.get_serializer(waitlist, many=True)
            return Response(serializer.data)
        except Trip.DoesNotExist:
            return Response({'error': 'Przejazd nie istnieje'}, status=404)
```

**Plik: `backend/api/urls.py`**
Dodać do routera:

```python
from .views import ..., RecurringTripViewSet, WaitlistViewSet

router.register(r'recurring-trips', RecurringTripViewSet, basename='recurring-trip')
router.register(r'waitlist', WaitlistViewSet, basename='waitlist')
```

Dodać w views.py import do TripViewSet:

```python
@action(detail=True, methods=['get'])
def waitlist_count(self, request, pk=None):
    """Liczba osób na liście oczekujących"""
    trip = self.get_object()
    count = Waitlist.objects.filter(trip=trip).count()
    return Response({'count': count})
```

Zaktualizować TrustedUserSerializer aby zawierał pole `auto_accept`.

#### Management Command - Generowanie Przejazdów

**Plik: `backend/api/management/commands/generate_recurring_trips.py`**

```python
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import RecurringTrip, Trip

class Command(BaseCommand):
    help = 'Generuje przejazdy z aktywnych cyklicznych szablonów'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Liczba dni do wygenerowania (domyślnie 7)'
        )
    
    def handle(self, *args, **options):
        days = options['days']
        active_recurring = RecurringTrip.objects.filter(active=True)
        
        total_generated = 0
        for recurring_trip in active_recurring:
            # Użyj logiki z generate_trips action
            # ...
            pass
        
        self.stdout.write(
            self.style.SUCCESS(f'Wygenerowano {total_generated} przejazdów')
        )
```

Dodać do crontab lub Django celery:
```bash
# Codziennie o 2:00 generuj przejazdy na następne 7 dni
0 2 * * * cd /path/to/project && python manage.py generate_recurring_trips --days=7
```

#### Frontend - Nowe Komponenty

##### 1. RecurringTrips.tsx
```typescript
// Lista cyklicznych przejazdów z możliwością dodawania/edycji/usuwania
// Przyciski: Dodaj nowy, Edytuj, Usuń, Włącz/Wyłącz, Generuj przejazdy
```

##### 2. AddRecurringTrip.tsx
```typescript
// Formularz do tworzenia cyklicznego przejazdu
// Pola:
// - Podstawowe (trasa, godzina, miejsca, cena)
// - Częstotliwość (daily/weekly/biweekly/monthly)
// - Dni tygodnia (dla weekly/biweekly)
// - Daty (start_date, end_date opcjonalnie)
```

##### 3. WaitlistDialog.tsx
```typescript
// Dialog do zapisywania się na listę oczekujących
// Wyświetlany gdy przejazd jest pełny
// Pole: liczba miejsc
```

##### 4. TripWaitlist.tsx (dla kierowcy)
```typescript
// Lista osób czekających na przejazd
// Wyświetlana w szczegółach przejazdu dla kierowcy
// Przycisk: Powiadom wszystkich
```

##### 5. Integracja w istniejących komponentach

**TripDetails.tsx:**
- Dodać przycisk "Zapisz się na listę oczekujących" gdy brak miejsc
- Wyświetlać liczbę osób oczekujących
- Dla kierowcy: przycisk "Zobacz listę oczekujących"

**MyTrips.tsx / TripDetails.tsx (dla kierowcy):**
- Wyświetlać listę oczekujących
- Przycisk do powiadamiania

**TrustedUsers.tsx:**
- Checkbox "Automatyczna akceptacja" przy każdym zaufanym użytkowniku
- Toggle do włączania/wyłączania auto-accept

**DriverDashboard.tsx:**
- Nowy kafelek "Cykliczne przejazdy"
- Link do `/recurring-trips`

#### PT2025NFCP-92: Prognoza Pogody

##### Backend - Weather Service

**Plik: `backend/api/weather_service.py`**

```python
import requests
from django.conf import settings

class WeatherService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    def get_forecast(self, city, date):
        """
        Pobierz prognozę pogody dla miasta i daty
        """
        try:
            # Użyj OpenWeather One Call API lub Weather API
            url = f"{self.base_url}/forecast"
            params = {
                'q': city,
                'appid': self.api_key,
                'units': 'metric',
                'lang': 'pl'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Filtruj do odpowiedniej daty
            # Zwróć: temp, description, icon, humidity, wind_speed
            return {
                'temperature': data['main']['temp'],
                'description': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon'],
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind']['speed']
            }
        except Exception as e:
            return None

weather_service = WeatherService()
```

**Endpoint w views.py:**

```python
@action(detail=True, methods=['get'])
def weather(self, request, pk=None):
    """Pobierz prognozę pogody dla przejazdu"""
    trip = self.get_object()
    from .weather_service import weather_service
    
    # Wyciągnij miasto z start_location
    city = trip.start_location.split(',')[0]
    forecast = weather_service.get_forecast(city, trip.date)
    
    if forecast:
        return Response(forecast)
    return Response({'error': 'Nie udało się pobrać prognozy'}, status=500)
```

##### Frontend - Weather Component

**WeatherForecast.tsx:**
```typescript
// Komponent wyświetlający prognozę pogody
// Ikona pogody, temperatura, opis
// Używany w TripDetails.tsx
```

**Integracja w TripDetails.tsx:**
```typescript
const [weather, setWeather] = useState(null);

useEffect(() => {
  // Pobierz prognozę dla przejazdu
  api.get(`/trips/${id}/weather/`)
    .then(res => setWeather(res.data))
    .catch(err => console.error(err));
}, [id]);

// Wyświetl w szczegółach przejazdu
{weather && <WeatherForecast data={weather} />}
```

#### API Services (Frontend)

**Plik: `frontend/src/services/api.ts`**

Dodać interfejsy i serwisy:

```typescript
export interface RecurringTrip {
  id: number;
  driver: number;
  driver_username: string;
  start_location: string;
  end_location: string;
  intermediate_stops: string[];
  time: string;
  available_seats: number;
  price_per_seat: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  frequency_display: string;
  weekdays: number[];
  start_date: string;
  end_date?: string;
  active: boolean;
  last_generated?: string;
  created_at: string;
  updated_at: string;
}

export interface Waitlist {
  id: number;
  trip: number;
  trip_info: TripInfo;
  passenger: number;
  passenger_username: string;
  seats_requested: number;
  notified: boolean;
  created_at: string;
}

export const recurringTripService = {
  async getRecurringTrips(): Promise<RecurringTrip[]> {
    const response = await api.get('/recurring-trips/');
    return response.data;
  },
  
  async createRecurringTrip(data: Partial<RecurringTrip>): Promise<RecurringTrip> {
    const response = await api.post('/recurring-trips/', data);
    return response.data;
  },
  
  async updateRecurringTrip(id: number, data: Partial<RecurringTrip>): Promise<RecurringTrip> {
    const response = await api.patch(`/recurring-trips/${id}/`, data);
    return response.data;
  },
  
  async deleteRecurringTrip(id: number): Promise<void> {
    await api.delete(`/recurring-trips/${id}/`);
  },
  
  async toggleActive(id: number): Promise<RecurringTrip> {
    const response = await api.post(`/recurring-trips/${id}/toggle_active/`);
    return response.data;
  },
  
  async generateTrips(id: number, days: number): Promise<{ generated: number; trip_ids: number[] }> {
    const response = await api.post(`/recurring-trips/${id}/generate_trips/`, { days });
    return response.data;
  },
};

export const waitlistService = {
  async getMyWaitlist(): Promise<Waitlist[]> {
    const response = await api.get('/waitlist/');
    return response.data;
  },
  
  async joinWaitlist(tripId: number, seatsRequested: number): Promise<Waitlist> {
    const response = await api.post('/waitlist/', {
      trip: tripId,
      seats_requested: seatsRequested
    });
    return response.data;
  },
  
  async leaveWaitlist(waitlistId: number): Promise<void> {
    await api.delete(`/waitlist/${waitlistId}/`);
  },
  
  async getWaitlistForTrip(tripId: number): Promise<Waitlist[]> {
    const response = await api.get(`/waitlist/for_trip/?trip_id=${tripId}`);
    return response.data;
  },
};
```

#### Routing (Frontend)

**App.tsx:**
```typescript
import RecurringTrips from './components/RecurringTrips';

// W Route dla kierowcy:
<Route path="/recurring-trips" element={<RecurringTrips />} />
```

### 📋 Kolejność Implementacji

1. ✅ Modele backendowe
2. ✅ Serializery
3. ✅ Migracje
4. 🚧 ViewSets i URLs (w trakcie)
5. ⏳ Management command
6. ⏳ Frontend - komponenty
7. ⏳ Prognoza pogody

### 🔧 Konfiguracja

**Backend `.env`:**
```
OPENWEATHER_API_KEY=your_api_key_here
```

**Backend `settings.py`:**
```python
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
```

### ✅ Testy

Po implementacji przetestować:
- [ ] Tworzenie cyklicznego przejazdu
- [ ] Generowanie przejazdów z szablonu
- [ ] Zapisywanie na listę oczekujących
- [ ] Powiadomienia z listy oczekujących
- [ ] Auto-akceptacja rezerwacji
- [ ] Prognoza pogody

## Podsumowanie

Funkcjonalności backendowe są w dużej mierze gotowe. Do dokończenia pozostają:
1. ViewSets i endpoints API
2. Management command do automatycznego generowania
3. Frontend - wszystkie komponenty UI
4. Integracja prognozy pogody

Implementacja jest solidna i skalowalna, gotowa do rozbudowy.
