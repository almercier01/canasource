import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { useLocation } from 'react-router-dom';
import { RequestOfferForm } from './RequestOfferForm';

interface RequestOffer {
  id: string;
  title_en: string | null;
  title_fr: string | null;
  description_en: string | null;
  description_fr: string | null;
  status: string;
  created_at: string;
}

interface RequestsPageProps {
  language: Language; // 'en' | 'fr'
}

export function RequestsPage({ language }: RequestsPageProps) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10; // Display 10 offers per page

  const [offers, setOffers] = useState<RequestOffer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showForm = searchParams.get('showForm') === 'true';

  useEffect(() => {
    fetchOffers();
    // Re-fetch whenever searchTerm or page changes
  }, [searchTerm, page]);

  async function fetchOffers() {
    setLoading(true);

    try {
      // We'll do 0-based range indexing. E.g. for page=1, from=0 to=9
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Start building the query
      let query = supabase
        .from('requested_offers')
        // We only want approved offers
        .select('id, title_en, title_fr, description_en, description_fr, status, created_at', {
          count: 'exact', // so we get total count
        })
        .eq('status', 'approved')
        .range(from, to)  // pagination range
        .order('created_at', { ascending: false });

      // If there's a searchTerm, we can do a case-insensitive match
      // We might check both title + description in either language
      // For simplicity, let’s assume the user’s language determines which columns to query:
      query = query.or(
        `title_en.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%,title_fr.ilike.%${searchTerm}%,description_fr.ilike.%${searchTerm}%`
      );
      
      

      const { data, error, count } = await query;
      if (error) throw error;

      setOffers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  }

  // Switch to next/previous page
  const canPrev = page > 1;
  const maxPage = Math.ceil(totalCount / pageSize);
  const canNext = page < maxPage;

  const handlePrevPage = () => {
    if (canPrev) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (canNext) setPage(page + 1);
  };

  // For bilingual display
  function getDisplayedTitle(offer: RequestOffer) {
    const fallbackTitle = offer.title_en ?? offer.title_fr ?? '';
    if (language === 'fr') {
      return offer.title_fr || fallbackTitle;
    } else {
      return offer.title_en || fallbackTitle;
    }
  }

  function getDisplayedDescription(offer: RequestOffer) {
    const fallbackDesc = offer.description_en ?? offer.description_fr ?? '';
    if (language === 'fr') {
      return offer.description_fr || fallbackDesc;
    } else {
      return offer.description_en || fallbackDesc;
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
       <h1 className="text-2xl font-bold mb-2">
        {language === 'fr' ? 'Offres Recherchées' : 'Requested Offers'}
      </h1>

      {showForm && (
        <div className="mb-6">
          <RequestOfferForm
            language={language}
            onCancel={() => window.history.pushState({}, '', '/requests')}
            onSuccess={() => {
              setSearchTerm('');
              setPage(1);
              fetchOffers(); // refresh list
            }}
          />
        </div>
      )}
      <h1 className="text-2xl font-bold mb-2">
        {language === 'fr' ? 'Offres Recherchées' : 'Requested Offers'}
      </h1>
      <p className="text-gray-600 mb-4">
        {language === 'fr'
          ? 'Produits ou services que notre communauté souhaite trouver au Canada.'
          : 'Products or services our community wants to source in Canada.'}
      </p>

      {/* Search Field */}
      <div className="mb-4">
        <input
          type="text"
          className="border rounded w-full p-2"
          placeholder={
            language === 'fr'
              ? 'Rechercher une offre...'
              : 'Search for a request...'
          }
          value={searchTerm}
          onChange={(e) => {
            setPage(1); // Reset to page 1 upon new search
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      {loading ? (
        <p className="text-gray-500">{translations.common.loading[language]}</p>
      ) : (
        <>
          {offers.length === 0 ? (
            <p className="text-gray-500">
              {language === 'fr' ? 'Aucune offre trouvée.' : 'No offers found.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {offers.map((offer) => (
                <li key={offer.id} className="border p-4 rounded bg-white shadow-sm">
                  <h3 className="text-lg font-semibold">
                    {getDisplayedTitle(offer)}
                  </h3>
                  <p className="mt-2">
                    {getDisplayedDescription(offer)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Buttons */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={!canPrev}
              className={`px-4 py-2 border rounded ${canPrev ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'}`}
            >
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </button>
            <span className="text-sm text-gray-500">
              {language === 'fr'
                ? `Page ${page} sur ${maxPage}`
                : `Page ${page} of ${maxPage}`}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!canNext}
              className={`px-4 py-2 border rounded ${canNext ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'}`}
            >
              {language === 'fr' ? 'Suivant' : 'Next'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
