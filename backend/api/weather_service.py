import requests
from datetime import datetime, timedelta
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class WeatherService:
    """Service for fetching weather forecasts from OpenWeatherMap API"""
    
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    def __init__(self):
        self.api_key = getattr(settings, 'OPENWEATHER_API_KEY', None)
        if not self.api_key:
            logger.warning("OPENWEATHER_API_KEY not configured in settings")
    
    def get_weather_forecast(self, location: str, date: str) -> dict:
        """
        Get weather forecast for a specific location and date.
        
        Args:
            location: City name (e.g., "Warszawa,PL")
            date: Date string in format YYYY-MM-DD
        
        Returns:
            dict with weather data or error message
        """
        if not self.api_key:
            # Tryb demo - zwróć przykładowe dane pogodowe
            return {
                'temperature': 18.5,
                'feels_like': 17.2,
                'temp_min': 15.0,
                'temp_max': 22.0,
                'humidity': 65,
                'pressure': 1013,
                'description': 'Częściowe zachmurzenie',
                'icon': '02d',
                'icon_url': 'https://openweathermap.org/img/wn/02d@2x.png',
                'wind_speed': 12.5,
                'clouds': 40,
                'rain': None,
                'snow': None,
                'demo_mode': True,
                'message': 'Przykładowe dane pogodowe (brak klucza API)'
            }
        
        try:
            # Parse date
            target_date = datetime.strptime(date, '%Y-%m-%d').date()
            today = datetime.now().date()
            days_diff = (target_date - today).days
            
            # OpenWeather free API only provides 5-day forecast
            if days_diff < 0:
                return {
                    'error': 'Past date',
                    'message': 'Cannot get weather forecast for past dates'
                }
            elif days_diff > 5:
                return {
                    'error': 'Date too far',
                    'message': 'Weather forecast available only for next 5 days'
                }
            
            # Get coordinates for location
            geo_url = f"{self.BASE_URL}/weather"
            geo_params = {
                'q': location,
                'appid': self.api_key,
                'units': 'metric',
                'lang': 'pl'
            }
            
            geo_response = requests.get(geo_url, params=geo_params, timeout=5)
            
            if geo_response.status_code == 401:
                return {
                    'error': 'Invalid API key',
                    'message': 'Weather API key is invalid'
                }
            elif geo_response.status_code == 404:
                return {
                    'error': 'Location not found',
                    'message': f'Location "{location}" not found'
                }
            elif geo_response.status_code != 200:
                return {
                    'error': 'API error',
                    'message': f'Weather API returned status {geo_response.status_code}'
                }
            
            geo_data = geo_response.json()
            lat = geo_data['coord']['lat']
            lon = geo_data['coord']['lon']
            
            # Get forecast
            forecast_url = f"{self.BASE_URL}/forecast"
            forecast_params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric',
                'lang': 'pl'
            }
            
            forecast_response = requests.get(forecast_url, params=forecast_params, timeout=5)
            
            if forecast_response.status_code != 200:
                return {
                    'error': 'Forecast error',
                    'message': 'Could not fetch weather forecast'
                }
            
            forecast_data = forecast_response.json()
            
            # Find forecast for target date (around noon)
            target_datetime = datetime.combine(target_date, datetime.min.time()).replace(hour=12)
            closest_forecast = None
            min_time_diff = timedelta(days=999)
            
            for item in forecast_data['list']:
                forecast_time = datetime.fromtimestamp(item['dt'])
                time_diff = abs(forecast_time - target_datetime)
                
                if time_diff < min_time_diff:
                    min_time_diff = time_diff
                    closest_forecast = item
            
            if not closest_forecast:
                return {
                    'error': 'No forecast data',
                    'message': 'No forecast available for this date'
                }
            
            # Format response
            weather = closest_forecast['weather'][0]
            main = closest_forecast['main']
            
            return {
                'location': location,
                'date': date,
                'temperature': round(main['temp']),
                'feels_like': round(main['feels_like']),
                'temp_min': round(main['temp_min']),
                'temp_max': round(main['temp_max']),
                'humidity': main['humidity'],
                'pressure': main['pressure'],
                'description': weather['description'].capitalize(),
                'icon': weather['icon'],
                'icon_url': f"https://openweathermap.org/img/wn/{weather['icon']}@2x.png",
                'wind_speed': round(closest_forecast['wind']['speed'] * 3.6, 1),  # m/s to km/h
                'clouds': closest_forecast['clouds']['all'],
                'rain': closest_forecast.get('rain', {}).get('3h', 0),
                'snow': closest_forecast.get('snow', {}).get('3h', 0),
            }
            
        except requests.exceptions.Timeout:
            logger.error("Weather API timeout")
            return {
                'error': 'Timeout',
                'message': 'Weather service is not responding'
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Weather API request error: {e}")
            return {
                'error': 'Network error',
                'message': 'Could not connect to weather service'
            }
        except Exception as e:
            logger.error(f"Weather service error: {e}")
            return {
                'error': 'Internal error',
                'message': str(e)
            }

# Singleton instance
weather_service = WeatherService()
