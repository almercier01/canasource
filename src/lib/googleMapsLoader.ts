// src/lib/googleMapsLoader.ts
import { Loader } from '@googlemaps/js-api-loader';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!apiKey) throw new Error('Google Maps API key is not configured');

const loader = new Loader({
    apiKey,
    version: 'weekly',
  });

export async function loadGoogleMapsLibrary(lib: 'places' | 'geocoding' | 'marker' | 'maps') {
  switch (lib) {
    case 'maps':
      return (await loader.importLibrary('maps')) as google.maps.MapsLibrary;
    case 'geocoding':
      return (await loader.importLibrary('geocoding')) as google.maps.GeocodingLibrary;
    case 'places':
      return (await loader.importLibrary('places')) as google.maps.PlacesLibrary;
    case 'marker':
      return (await loader.importLibrary('marker')) as google.maps.MarkerLibrary;
    default:
      throw new Error(`Unknown library: ${lib}`);
  }
}

