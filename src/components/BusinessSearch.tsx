import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PROVINCES, ProvinceCode, Category, Language, CATEGORIES } from '../types';
import { translations } from '../i18n/translations';
import { BusinessListing } from './BusinessListing';
import { useLocation } from 'react-router-dom';

interface BusinessSearchProps {
  language: Language;
  onClose: () => void;
  initialSearchTerm?: string;
  resetSearchTerm: () => void; // Add resetSearchTerm as a prop
}

interface BusinessResult {
  id: string;
  name: string;
  description_en: string;
  description_fr: string;

  // ✅ Store both English & French category names
  category_en: string;
  category_fr: string;

  // ✅ Store both English & French province names
  province_en: string;
  province_fr: string;

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
  languages: string[]; // ✅ Fix TypeScript error
}


export function BusinessSearch({ language, initialSearchTerm, onClose, resetSearchTerm }: BusinessSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm || '');
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const location = useLocation(); // Get the current location (URL)

  useEffect(() => {
    // Get the search term from the URL query parameter
    const params = new URLSearchParams(location.search);
    const termFromUrl = params.get('term') || ''; // Default to empty string if no 'term' param

    if (termFromUrl) {
      setSearchTerm(termFromUrl); // Set the search term from the URL
      handleSearch(); // Automatically trigger the search with the term from the URL
    }
  }, [location.search]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
  
    if (!searchTerm.trim()) return;
  
    setLoading(true);
    setError(null);
    setHasSearched(true);
  
    try {
      const { data, error: rpcError } = await supabase.rpc('search_businesses', {
        term: searchTerm.trim()
      });
  
      if (rpcError) throw rpcError;
  
      setBusinesses((data || []) as BusinessResult[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.errors.generic[language]);
    } finally {
      setLoading(false);
      resetSearchTerm();
    }
  };
  



  const isValidSearch = () => {
    return (
      searchTerm.trim().length >= 2
    );
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
            <p className="text-sm text-gray-500 mt-2">
              {language === 'fr'
                ? 'Vous pouvez chercher par nom d’entreprise, région, catégorie, produits ou services. Exemples : "bois Québec", "textile Montréal", "fournitures médicales Ontario".'
                : 'You can search by business name, region, category, products or services. Examples: "wood Québec", "textile Montréal", "medical supplies Ontario".'}
            </p>

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

                    // ✅ Directly use category_en and category_fr
                    category_en: business.category_en,
                    category_fr: business.category_fr,

                    // ✅ Directly use province_en and province_fr
                    province_en: business.province_en,
                    province_fr: business.province_fr,

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
