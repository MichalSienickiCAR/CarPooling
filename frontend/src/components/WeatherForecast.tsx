import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import {
  WbSunny,
  Cloud,
  Thunderstorm,
  AcUnit,
  Opacity,
  Air,
  Compress,
  WaterDrop,
} from '@mui/icons-material';

interface WeatherData {
  location: string;
  date: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  icon_url: string;
  wind_speed: number;
  clouds: number;
  rain: number;
  snow: number;
  error?: string;
  demo_mode?: boolean;
  message?: string;
}

interface WeatherForecastProps {
  tripId: number;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ tripId }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/trips/${tripId}/weather/`);
        const data = await response.json();

        if (data.error) {
          setError(data.message || data.error);
          setWeather(null);
        } else {
          setWeather(data);
          setError(null);
        }
      } catch (err: any) {
        setError('Nie udało się pobrać prognozy pogody');
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [tripId]);

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <WbSunny sx={{ fontSize: 60, color: '#FFD700' }} />;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04'))
      return <Cloud sx={{ fontSize: 60, color: '#B0C4DE' }} />;
    if (iconCode.includes('09') || iconCode.includes('10'))
      return <Opacity sx={{ fontSize: 60, color: '#4682B4' }} />;
    if (iconCode.includes('11')) return <Thunderstorm sx={{ fontSize: 60, color: '#4B0082' }} />;
    if (iconCode.includes('13')) return <AcUnit sx={{ fontSize: 60, color: '#87CEEB' }} />;
    return <Cloud sx={{ fontSize: 60, color: '#B0C4DE' }} />;
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: '1px solid #e0e0e0',
          bgcolor: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={30} />
        <Typography variant="body2" sx={{ ml: 2 }} color="textSecondary">
          Ładowanie prognozy pogody...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          border: '1px solid #e0e0e0',
          bgcolor: '#fff',
        }}
      >
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          <Typography variant="body2">
            <strong>Prognoza pogody:</strong> {error}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '1px solid #e0e0e0',
        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        ☀️ Prognoza Pogody
        {weather.demo_mode && (
          <Chip label="Demo" size="small" color="info" sx={{ ml: 1 }} />
        )}
      </Typography>

      {weather.message && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
          {weather.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {weather.icon_url ? (
            <img src={weather.icon_url} alt={weather.description} style={{ width: 80, height: 80 }} />
          ) : (
            getWeatherIcon(weather.icon)
          )}
          <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize', mt: 1 }}>
            {weather.description}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h2" fontWeight="bold" sx={{ color: '#00aff5' }}>
            {weather.temperature}°C
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Odczuwalna: {weather.feels_like}°C
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Min: {weather.temp_min}°C | Max: {weather.temp_max}°C
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WaterDrop sx={{ color: '#4682B4', fontSize: 20 }} />
          <Typography variant="body2">
            <strong>Wilgotność:</strong> {weather.humidity}%
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Air sx={{ color: '#708090', fontSize: 20 }} />
          <Typography variant="body2">
            <strong>Wiatr:</strong> {weather.wind_speed} km/h
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Compress sx={{ color: '#8B4513', fontSize: 20 }} />
          <Typography variant="body2">
            <strong>Ciśnienie:</strong> {weather.pressure} hPa
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cloud sx={{ color: '#B0C4DE', fontSize: 20 }} />
          <Typography variant="body2">
            <strong>Zachmurzenie:</strong> {weather.clouds}%
          </Typography>
        </Box>
      </Box>

      {(weather.rain > 0 || weather.snow > 0) && (
        <Box sx={{ mt: 2 }}>
          {weather.rain > 0 && (
            <Chip
              label={`Opady deszczu: ${weather.rain} mm`}
              color="info"
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          {weather.snow > 0 && (
            <Chip label={`Opady śniegu: ${weather.snow} mm`} color="primary" size="small" />
          )}
        </Box>
      )}

      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
        📍 {weather.location} • 📅 {weather.date}
      </Typography>
    </Paper>
  );
};

export default WeatherForecast;
