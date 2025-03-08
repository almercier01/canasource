import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Business } from '../types';
import { MapPin } from 'lucide-react';

interface MapProps {
  business: Business;
  fullAddress: string;
}

export function Map({ business, fullAddress }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geocoding', 'marker']
    });

    loader.load().then(async () => {
      if (mapRef.current) {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;

            const map = new google.maps.Map(mapRef.current!, {
              center: location,
              zoom: 15,
              styles: [
                {
                  featureType: 'all',
                  elementType: 'labels.text.fill',
                  stylers: [{ color: '#4a5568' }]
                },
                {
                  featureType: 'water',
                  elementType: 'geometry',
                  stylers: [{ color: '#edf2f7' }]
                }
              ]
            });

            // Use AdvancedMarkerElement
            const marker = new google.maps.marker.AdvancedMarkerElement({
              map,
              position: location,
              title: business.name,
              content: createMarkerElement(business.name),
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h3 class="font-semibold">${business.name}</h3>
                  <p class="text-sm mt-1">${fullAddress}</p>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open({ anchor: marker, map });
            });
          } else {
            setError('Could not find location on map');
          }
        });
      }
    }).catch(error => {
      if (error.message.includes('This API project is not authorized')) {
        setError('Maps Geocoding service needs to be enabled for this project');
      } else {
        setError('Error loading Google Maps');
      }
      console.error('Error loading Google Maps:', error);
    });
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

  return (
    <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden shadow-md" />
  );
}

// Helper function to create a custom marker element
function createMarkerElement(title: string): HTMLElement {
  const markerEl = document.createElement('div');
  markerEl.innerHTML = `
    <div style="
      background-color: #E53E3E;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    " title="${title}">
    </div>`;
  return markerEl;
}
