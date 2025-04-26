import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { RequestOfferForm } from './RequestOfferForm';
import { TariffedTicker } from './TariffedTicker';
import { useParams } from 'react-router-dom';


interface RequestOffer {
  id: string;
  title_en: string | null;
  title_fr: string | null;
  description_en: string | null;
  description_fr: string | null;
  status: string;
  created_at: string;
  is_sample: boolean;
  business_id?: string | null;
}

interface RequestsPageProps {
  language: Language;
  user?: any;
  userBusinessId?: string;
  onRequireLogin?: () => void;
}

export function RequestsPage({ language, user, userBusinessId, onRequireLogin }: RequestsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [offers, setOffers] = useState<RequestOffer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const showForm = searchParams.get('showForm') === 'true';
  const [showFormPanel, setShowFormPanel] = useState(showForm);

  const { id: highlightId } = useParams<{ id: string }>();


  useEffect(() => {
    fetchOffers();
  }, [searchTerm, page]);

  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`offer-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [offers, highlightId]);
  

  async function fetchOffers() {
    setLoading(true);

    try {
      let query = supabase
        .from('requested_offers')
        .select('id, title_en, title_fr, description_en, description_fr, status, created_at, is_sample, business_id', {
          count: 'exact',
        })
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (highlightId) {
        // If user clicked a specific offer → find only that
        query = query.eq('id', highlightId);
      } else {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

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

  const getDisplayedTitle = (offer: RequestOffer) =>
    language === 'fr' ? offer.title_fr || offer.title_en || '' : offer.title_en || offer.title_fr || '';

  const getDisplayedDescription = (offer: RequestOffer) =>
    language === 'fr' ? offer.description_fr || offer.description_en || '' : offer.description_en || offer.description_fr || '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          {language === 'fr' ? 'Exemples de produits importés tarrifés' : 'Tariffed imported products example'}
        </h1>

        <TariffedTicker language={language} />

        <p className="text-sm text-gray-600 mt-2">
          {language === 'fr'
            ? 'Voici ce que recherchent d’autres Canadiens. Soumettez votre propre demande ou explorez les besoins actuels.'
            : 'See what others are looking for. Submit your request or explore current needs.'}
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={language === 'fr' ? 'Rechercher une offre en demande...' : 'Search for a requested offer...'}
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
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
            <div className="grid gap-4">
              {offers.map((offer) => {
                const title = getDisplayedTitle(offer);
                const description = getDisplayedDescription(offer);

                return (
                  <div
                    key={offer.id}
                    id={`offer-${offer.id}`}
                    className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition ${offer.id === highlightId ? 'border-2 border-red-500 shadow-lg' : 'border-gray-200'
                      }`}
                  >

                    <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-1">{title}</h3>
                    <p className="text-sm text-gray-700">{description}</p>

                    {offer.is_sample && (
                      <p className="mt-2 text-xs text-yellow-600">
                        {language === 'fr' ? 'Exemple de demande (non réelle)' : 'Sample request (not real)'}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      {offer.business_id ? (
                        <Link
                          to={`/business/${offer.business_id}`}
                          className="text-gray-600 hover:text-blue-700"
                        >
                          {language === 'fr' ? 'Demande comblée — Voir la fiche' : 'Request Fulfilled — See Listing'}
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (!user) {
                              const url = new URL(window.location.href);
                              url.searchParams.set('code', title);
                              window.history.pushState({}, '', url);
                              return onRequireLogin?.();
                            }

                            if (userBusinessId) {
                              navigate(`/edit-business?addProduct=${encodeURIComponent(title)}`);
                            } else {
                              navigate(`/register?code=${encodeURIComponent(title)}`);
                            }
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          {language === 'fr' ? 'Proposer une solution' : 'Respond to This Offer'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalCount > pageSize && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => canPrev && setPage(page - 1)}
                disabled={!canPrev}
                className={`px-4 py-2 rounded border ${canPrev ? 'bg-gray-100 hover:bg-gray-200' : 'text-gray-400 bg-gray-50'}`}
              >
                {language === 'fr' ? 'Précédent' : 'Previous'}
              </button>

              <span className="text-sm text-gray-600">
                {language === 'fr' ? `Page ${page} sur ${maxPage}` : `Page ${page} of ${maxPage}`}
              </span>

              <button
                onClick={() => canNext && setPage(page + 1)}
                disabled={!canNext}
                className={`px-4 py-2 rounded border ${canNext ? 'bg-gray-100 hover:bg-gray-200' : 'text-gray-400 bg-gray-50'}`}
              >
                {language === 'fr' ? 'Suivant' : 'Next'}
              </button>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-base sm:text-lg text-gray-700 font-medium mb-2">
              {language === 'fr' ? "Vous ne trouvez pas ce que vous cherchez ?" : "Can't find what you're looking for?"}
            </p>
            <button
              onClick={() => setShowFormPanel((prev) => !prev)}
              className="inline-block text-sm font-semibold text-white bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition"
            >
              {showFormPanel
                ? language === 'fr' ? 'Masquer le formulaire' : 'Hide the Form'
                : language === 'fr' ? 'Soumettre une demande' : 'Submit a Request'}
            </button>
          </div>

          {showFormPanel && (
            <div className="mt-6 bg-gray-50 border border-gray-200 p-6 rounded shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-center">
                {language === 'fr' ? 'Soumettre une demande pour évaluation' : 'Submit a Request for evaluation'}
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
