import React, { useEffect, useRef, useState } from 'react';
import { Business } from '../types';
import { MapPin } from 'lucide-react';
import { loadGoogleMapsLibrary } from '../lib/googleMapsLoader';

interface MapProps {
  business: Business;
  fullAddress: string;
}

export function Map({ business, fullAddress }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      const { Map, InfoWindow } = (await loadGoogleMapsLibrary('maps')) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await loadGoogleMapsLibrary('marker')) as google.maps.MarkerLibrary;
      const { Geocoder } = (await loadGoogleMapsLibrary('geocoding')) as google.maps.GeocodingLibrary;
  
      if (mapRef.current) {
        const geocoder = new Geocoder();
  
        geocoder.geocode({ address: fullAddress }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const location = results[0].geometry.location;
  
            // ✅ Ensure you reference the correct Vite env variable
            const map = new Map(mapRef.current!, {
              center: location,
              zoom: 15,
              mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID, // ✅ Use `import.meta.env` in Vite
            });
  
            const marker = new AdvancedMarkerElement({
              map,
              position: location,
              title: business.name,
            });
  
            const infoWindow = new InfoWindow({
              content: `<div>${business.name}</div>`,
            });
  
            marker.addListener('gmp-click', () => {
              infoWindow.open({ anchor: marker, map });
            });
          }
        });
      }
    };
  
    initializeMap();
  }, [business, fullAddress]);
  
  
  

  if (error) {
    return (
      <div className="w-full h-64 rounded-lg overflow-hidden shadow-md bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">{fullAddress}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden shadow-md" />;
}
