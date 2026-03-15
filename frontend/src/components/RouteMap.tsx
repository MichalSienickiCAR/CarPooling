import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

interface RouteMapProps {
  startLocation: string;
  endLocation: string;
  intermediateStops?: string[];
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '30px',
};

const defaultCenter = {
  lat: 52.2297, // Warszawa
  lng: 21.0122,
};

const libraries: ('places' | 'geometry' | 'drawing')[] = ['places'];

export const RouteMap: React.FC<RouteMapProps> = ({
  startLocation,
  endLocation,
  intermediateStops = [],
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Pobieranie trasy z Google Directions API
  useEffect(() => {
    if (!isLoaded || !apiKey || !startLocation || !endLocation) return;

    const directionsService = new google.maps.DirectionsService();

    const waypoints = intermediateStops.map((stop) => ({
      location: stop,
      stopover: true,
    }));

    directionsService.route(
      {
        origin: startLocation,
        destination: endLocation,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'PL',
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          setError(null);
        } else {
          // Fallback: pokaż komunikat, ale nie wywalaj aplikacji
          // eslint-disable-next-line no-console
          console.error('Directions request failed:', status);
          setError('Nie udało się załadować trasy. Sprawdź nazwy lokalizacji.');
        }
      },
    );
  }, [isLoaded, startLocation, endLocation, intermediateStops, apiKey]);

  if (loadError) {
    return <Alert severity="error">Nie udało się załadować Google Maps.</Alert>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Trasa przejazdu
      </Typography>
      {!isLoaded && (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      )}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={6}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      )}
      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default RouteMap;

