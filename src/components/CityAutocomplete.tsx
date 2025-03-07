import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { CANADIAN_CITIES } from '../utils/canadianCities';
import { PROVINCES, ProvinceCode, Language } from '../types';

interface CityAutocompleteProps {
  province: ProvinceCode | '';
  value: string;
  onChange: (value: string) => void;
  language: Language;
  onValidityChange?: (isValid: boolean) => void;
}

export function CityAutocomplete({ 
  province, 
  value, 
  onChange, 
  language,
  onValidityChange 
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!province || !value) {
      setSuggestions([]);
      setIsValid(false);
      if (onValidityChange) onValidityChange(false);
      return;
    }

    const provinceCities = CANADIAN_CITIES[province] || [];

    const filteredCities = provinceCities.filter(city =>
      city.toLowerCase().includes(value.toLowerCase().trim())
    );

    setSuggestions(filteredCities);

    const cityValid = provinceCities.some(city =>
      city.toLowerCase() === value.toLowerCase().trim()
    );

    setIsValid(cityValid);
    if (onValidityChange) {
      onValidityChange(cityValid);
    }
  }, [province, value, onValidityChange]);

  const handleSelect = (city: string) => {
    onChange(city);
    setShowSuggestions(false);
    setIsValid(true);
    if (onValidityChange) {
      onValidityChange(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className={`pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 ${
            !isValid ? 'border-yellow-300 bg-yellow-50' : ''
          }`}
          placeholder={language === 'en' ? 'Enter city name' : 'Entrez le nom de la ville'}
        />
      </div>

      {!isValid && value && (
        <p className="mt-1 text-sm text-yellow-600">
          {language === 'en' 
            ? 'This city is not in our database. Please verify the spelling or continue if correct.' 
            : 'Cette ville n\'est pas dans notre base de données. Veuillez vérifier l\'orthographe ou continuer si correct.'}
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((city) => (
              <li
                key={city}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(city)}
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
