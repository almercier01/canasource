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
      libraries: ['places', 'geocoding']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const map = new google.maps.Map(mapRef.current, {
              center: results[0].geometry.location,
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

            const marker = new google.maps.Marker({
              map,
              position: results[0].geometry.location,
              title: business.name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#E53E3E',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }
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
              infoWindow.open(map, marker);
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