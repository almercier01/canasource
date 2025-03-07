import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PROVINCES, ProvinceCode, Category, Language, CATEGORIES } from '../types';

import { translations } from '../i18n/translations';
import { BusinessListing } from './BusinessListing';

interface BusinessSearchProps {
  language: Language;
  onClose: () => void;
  initialSearchTerm?: string;  // This will handle the initial value from the parent component.
}


interface BusinessResult {
  id: string;
  name: string;
  description_en: string;
  description_fr: string;
  category: Category;
  province: ProvinceCode;
  city: string;
  address: string;
  products: string[];
  services: string[];
  website?: string;
  phone?: string;
  rating: number;
  review_count: number;
  lat: number;
  lng: number;
}

export function BusinessSearch({ language, onClose, initialSearchTerm = '' }: BusinessSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialSearchTerm) {
      handleSearch();
    }
  }, []);

  const isValidSearch = () => {
    return (searchTerm.trim().length >= 2 || selectedProvince || selectedCategory);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!isValidSearch()) {
      setError(translations.search.criteriaRequired[language]);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let query = supabase
        .from('businesses')
        .select('*');

        if (selectedProvince) {
          const provinceName = PROVINCES[selectedProvince].en;
          query = query.eq('province', provinceName);
        }
        

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm.trim()) {
        query = query.or(
          `name.ilike.%${searchTerm}%,` +
          `description_en.ilike.%${searchTerm}%,` +
          `description_fr.ilike.%${searchTerm}%,` +
          `products.cs.{${searchTerm}},` +
          `services.cs.{${searchTerm}}`
        );
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setBusinesses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.errors.generic[language]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <div className="sticky top-0 bg-gray-50 z-50 p-2">
            <button
              onClick={onClose}
              className="flex items-center text-gray-600 hover:text-red-600"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {translations.nav.backToHome[language]}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {translations.search.title[language]}
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                {translations.search.whatLookingFor[language]}
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={translations.search.searchPlaceholder[language]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.search.province[language]}
                </label>
                <select
                  id="province"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value as ProvinceCode | '')}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">{translations.search.selectProvince[language]}</option>
                  {Object.entries(PROVINCES).map(([code, names]) => (
                    <option key={code} value={code}>
                      {names[language]}
                    </option>
                  ))}
                </select>

              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.search.category[language]}
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">{translations.search.selectCategory[language]}</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {translations.categories[category][language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !isValidSearch()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? translations.common.processing[language] : translations.search.searchButton[language]}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {hasSearched && !loading && (
          <div className="space-y-8">
            {businesses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {translations.search.noResults[language]}
              </div>
            ) : (
              businesses.map((business) => (
                <BusinessListing
                  key={business.id}
                  business={{
                    ...business,

                    description_en: business.description_en,
                    description_fr: business.description_fr,


                    lat: business.lat,
                    lng: business.lng,

                    rating: business.rating || 0,
                    reviewCount: business.review_count || 0,
                    products: business.products || [],
                    services: business.services || []
                  }}
                  language={language}
                />
              ))
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
}