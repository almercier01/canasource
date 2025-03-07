import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { SiteConfig } from '../../types';

interface SetupProps {
  onComplete: (config: SiteConfig) => void;
  initialConfig?: SiteConfig;
  isModal?: boolean;
}

const SUPPORTED_COUNTRIES = [
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'US', name: 'United States', currency: 'USD' },
];

export function Setup({ onComplete, initialConfig, isModal = false }: SetupProps) {
  const [country, setCountry] = useState(initialConfig?.country || SUPPORTED_COUNTRIES[0].code);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!googleMapsApiKey) {
      setError('Google Maps API key is required');
      return;
    }

    const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === country)!;
    
    const config: SiteConfig = {
      country: selectedCountry.code,
      currency: selectedCountry.currency,
      googleMapsApiKey,
      initialized: true
    };

    onComplete(config);
  };

  if (isModal) {
    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
          >
            {SUPPORTED_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            Google Maps API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={googleMapsApiKey}
            onChange={(e) => setGoogleMapsApiKey(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder="Enter your API key"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Settings className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Initial Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Configure your CanaSource instance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {handleSubmit && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                >
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  Google Maps API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={googleMapsApiKey}
                  onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter your API key"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Configuration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}