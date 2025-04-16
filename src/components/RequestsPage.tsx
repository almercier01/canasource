import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { useLocation } from 'react-router-dom';
import { RequestOfferForm } from './RequestOfferForm';
import { TariffedTicker } from './TariffedTicker';


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
  language: Language;
}

export function RequestsPage({ language }: RequestsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [offers, setOffers] = useState<RequestOffer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showForm = searchParams.get('showForm') === 'true';
  const [showFormPanel, setShowFormPanel] = useState(false); // allow auto-open from ?showForm=true


  useEffect(() => {
    fetchOffers();
  }, [searchTerm, page]);

  async function fetchOffers() {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase
        .from('requested_offers')
        .select('id, title_en, title_fr, description_en, description_fr, status, created_at', {
          count: 'exact',
        })
        .eq('status', 'approved')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(
          `title_en.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%,title_fr.ilike.%${searchTerm}%,description_fr.ilike.%${searchTerm}%`
        );
      }

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

  const canPrev = page > 1;
  const maxPage = Math.ceil(totalCount / pageSize);
  const canNext = page < maxPage;

  const handlePrevPage = () => canPrev && setPage(page - 1);
  const handleNextPage = () => canNext && setPage(page + 1);

  const getDisplayedTitle = (offer: RequestOffer) =>
    language === 'fr' ? offer.title_fr || offer.title_en || '' : offer.title_en || offer.title_fr || '';

  const getDisplayedDescription = (offer: RequestOffer) =>
    language === 'fr' ? offer.description_fr || offer.description_en || '' : offer.description_en || offer.description_fr || '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          {language === 'fr' ? 'Offres Recherchées' : 'Requested Offers'}
        </h1>

        <TariffedTicker language={language} />


        <p className="text-sm text-gray-600 mt-2">
          {language === 'fr'
            ? 'Voici ce que recherchent d’autres Canadiens. Soumettez votre propre demande ou explorez les besoins actuels.'
            : 'See what others are looking for. Submit your request or explore current needs.'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={
            language === 'fr'
              ? 'Rechercher une offre en demande...'
              : 'Search for a requested offer...'
          }
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
        />
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-gray-500">{translations.common.loading[language]}</p>
      ) : (
        <>
          {offers.length === 0 ? (
            <p className="text-gray-500">
              {language === 'fr' ? 'Aucune offre trouvée.' : 'No offers found.'}
            </p>
          ) : (
            <div className="grid gap-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-1">
                    {getDisplayedTitle(offer)}
                  </h3>
                  <p className="text-sm text-gray-700">{getDisplayedDescription(offer)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={!canPrev}
                className={`px-4 py-2 rounded border ${canPrev ? 'bg-gray-100 hover:bg-gray-200' : 'text-gray-400 bg-gray-50'
                  }`}
              >
                {language === 'fr' ? 'Précédent' : 'Previous'}
              </button>

              <span className="text-sm text-gray-600">
                {language === 'fr' ? `Page ${page} sur ${maxPage}` : `Page ${page} of ${maxPage}`}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!canNext}
                className={`px-4 py-2 rounded border ${canNext ? 'bg-gray-100 hover:bg-gray-200' : 'text-gray-400 bg-gray-50'
                  }`}
              >
                {language === 'fr' ? 'Suivant' : 'Next'}
              </button>
            </div>
          )}

          {/* CTA prompt + toggle */}
          <div className="mt-12 text-center">
            <p className="text-base sm:text-lg text-gray-700 font-medium mb-2">
              {language === 'fr'
                ? "Vous ne trouvez pas ce que vous cherchez ?"
                : "Can't find what you're looking for?"}
            </p>
            <button
              onClick={() => setShowFormPanel((prev) => !prev)}
              className="inline-block text-sm font-semibold text-white bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition"
            >
              {showFormPanel
                ? language === 'fr'
                  ? 'Masquer le formulaire'
                  : 'Hide the Form'
                : language === 'fr'
                  ? 'Soumettre une demande'
                  : 'Submit a Request'}
            </button>
          </div>

          {/* Toggleable Form Panel */}
          {showFormPanel && (
            <div className="mt-6 bg-gray-50 border border-gray-200 p-6 rounded shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-center">
                {language === 'fr' ? 'Soumettre une nouvelle demande' : 'Submit a New Request'}
              </h2>
              <RequestOfferForm
                language={language}
                onCancel={() => setShowFormPanel(false)}
                onSuccess={() => {
                  setSearchTerm('');
                  setPage(1);
                  fetchOffers();
                  setShowFormPanel(false);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );

}
