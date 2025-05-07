import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PROVINCES, ProvinceCode, Category, Language, CATEGORIES } from '../types';
import { translations } from '../i18n/translations';
import { BusinessListing } from './BusinessListing';
import { SourcingChatSearch } from './SourcingChatSearch';
import { useLocation } from 'react-router-dom';

interface BusinessSearchProps {
  language: Language;
  onClose: () => void;
  initialSearchTerm?: string;
  resetSearchTerm: () => void;
}

interface BusinessResult {
  id: string;
  name: string;
  description_en: string;
  description_fr: string;
  category_en: string;
  category_fr: string;
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
  languages: string[];
}

export function BusinessSearch({ language, initialSearchTerm, onClose, resetSearchTerm }: BusinessSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm || '');
  const [submittedTerm, setSubmittedTerm] = useState<string>('');
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentBusinesses, setRecentBusinesses] = useState<BusinessResult[]>([]);
  const [triggerChatSearch, setTriggerChatSearch] = useState(false);
  const [manufacturerOnly, setManufacturerOnly] = useState(false);
  const [showWebSearchModal, setShowWebSearchModal] = useState(false);


  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const termFromUrl = params.get('term') || '';
    if (termFromUrl) {
      setSearchTerm(termFromUrl);
      handleSearch();
    }
  }, [location.search]);

  useEffect(() => {
    if (!searchTerm.trim()) fetchRecentBusinesses();
  }, [searchTerm]);

  const fetchRecentBusinesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      setRecentBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching recent businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildQuery = (term: string): string => {
    const base = term.trim();

    if (!manufacturerOnly) return base;

    const manufacturerTerms =
      language === 'fr'
        ? 'fabricant OR assembleur OR usine site:.ca'
        : 'manufacturer OR assembler OR factory site:.ca';

    const words = base.split(/\s+/).filter(Boolean);

    return words
      .map((word) => `${word} ${manufacturerTerms}`)
      .join(' OR ');
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim().length < 3) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setTriggerChatSearch(false);

    try {
      // 🔸 Supabase query uses raw search term only
      const { data, error: rpcError } = await supabase.rpc('search_businesses', {
        term: searchTerm.trim(),
      });

      if (rpcError) throw rpcError;
      setBusinesses((data || []) as BusinessResult[]);

      if (!data || data.length === 0) {
        // Prepare enriched term, but don't trigger yet
        const enrichedTerm = manufacturerOnly
          ? `${searchTerm.trim()} ${language === 'fr'
            ? 'fabricant OR assembleur OR usine site:.ca'
            : 'manufacturer OR assembler OR factory site:.ca'}`
          : searchTerm.trim();

        setSubmittedTerm(enrichedTerm);
        setShowWebSearchModal(true); // show confirmation modal
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : translations.errors.generic[language]);
    } finally {
      setLoading(false);
      resetSearchTerm();
    }
  };



  const isValidSearch = () => searchTerm.trim().length >= 3;

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manufacturerOnly"
                  checked={manufacturerOnly}
                  onChange={() => setManufacturerOnly(!manufacturerOnly)}
                  className="h-4 w-4 text-red-600 border-gray-300 rounded"
                />
                <label htmlFor="manufacturerOnly" className="text-sm text-gray-700">
                  {language === 'fr' ? 'Limiter aux fabricants / assembleurs' : 'Limit to manufacturers / assemblers'}
                </label>
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🌐 CanaSource Sourcing Assistant
            </h3>
            {triggerChatSearch ? (
              <SourcingChatSearch
                searchTerm={submittedTerm}
                language={language}
                triggerSearch={triggerChatSearch}
              />
            ) : (
              <p className="text-sm text-gray-600 italic">
                {language === 'fr'
                  ? "L'assistant de recherche affichera des résultats Web si aucune entreprise n'est trouvée."
                  : 'The assistant will show web results if no businesses are found.'}
              </p>
            )}

            {/* 👇 Add manual trigger button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  const enrichedTerm = manufacturerOnly
                    ? `${searchTerm.trim()} ${language === 'fr'
                      ? 'fabricant OR assembleur OR usine site:.ca'
                      : 'manufacturer OR assembler OR factory site:.ca'}`
                    : searchTerm.trim();

                  setSubmittedTerm(enrichedTerm);
                  setTriggerChatSearch(true);
                }}
                className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                {language === 'fr' ? 'Rechercher sur le Web' : 'Search the Web'}
              </button>
            </div>
          </div>

        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {hasSearched && businesses.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            {translations.search.noResults[language]}
          </div>
        )}

        {hasSearched && !loading && businesses.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-red-600 mb-6">
              {language === 'fr' ? 'Résultats de recherche' : 'Search Results'}
            </h3>
            {businesses.map((business) => (
              <BusinessListing
                key={business.id}
                business={{
                  ...business,
                  reviewCount: business.review_count || 0,
                }}
                language={language}
              />
            ))}
          </div>
        )}

        {!hasSearched && recentBusinesses.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-red-600 mb-6">
              {language === 'fr' ? 'Nouvelles inscriptions' : 'Newest Listings'}
            </h3>
            {recentBusinesses.map((business) => (
              <BusinessListing
                key={business.id}
                business={{
                  ...business,
                  reviewCount: business.review_count || 0,
                }}
                language={language}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
          </div>
        )}
      </div>
      {showWebSearchModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-lg font-bold mb-4">
              {language === 'fr'
                ? 'Aucune entreprise trouvée'
                : 'No businesses found'}
            </h2>
            <p className="mb-6">
              {language === 'fr'
                ? 'Souhaitez-vous que notre assistant vous aide à trouver des fournisseurs en ligne?'
                : 'Would you like our assistant to help find suppliers online?'}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setTriggerChatSearch(true);
                  setShowWebSearchModal(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {language === 'fr' ? 'Oui, merci' : 'Yes, please'}
              </button>
              <button
                onClick={() => setShowWebSearchModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
