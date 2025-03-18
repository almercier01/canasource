// src/components/RequestedOffersSection.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from './auth/AuthModal';

interface RequestedOffer {
  id: string;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  status: string;
}

interface RequestedOffersSectionProps {
  language: Language;   // 'en' or 'fr'
  user: any;           // Current user object (null if not logged in)
}

export function RequestedOffersSection({
  language,
  user,
}: RequestedOffersSectionProps) {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<RequestedOffer[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Shorthand references for translations
  const txt = translations.requestedOffersSection;

  useEffect(() => {
    fetchApprovedOffers();
  }, []);

  async function fetchApprovedOffers() {
    try {
      const { data, error } = await supabase
        .from('requested_offers')
        .select('id, title_en, title_fr, description_en, description_fr, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching approved offers:', error);
        return;
      }
      if (data) {
        setOffers(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  // If user is logged in, navigate to the form; otherwise show AuthModal
  const handleRequestOfferClick = () => {
    if (user) {
      // Navigate to the new request form
      navigate('/requests/new');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <section className="p-4 mt-8 bg-white shadow-md rounded-md w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {txt.heading[language]}
      </h2>
      <p className="mb-6">
        {txt.description[language]}
      </p>

      {offers.length === 0 ? (
        <p>{txt.noOffers[language]}</p>
      ) : (
        <ul className="space-y-4">
          {offers.map((offer) => {
            const displayedTitle = language === 'fr'
            ? offer.title_fr || offer.title_en
            : offer.title_en || offer.title_fr;
          
          const displayedDescription = language === 'fr'
            ? offer.description_fr || offer.description_en
            : offer.description_en || offer.description_fr;
            
            return (
              <li key={offer.id} className="border rounded p-4">
                <h3 className="text-lg font-semibold">{displayedTitle}</h3>
                <p className="mt-2">{displayedDescription}</p>
              </li>
            );
          })}
        </ul>
      )}

      {/* Auth Modal for non-logged-in users */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // Optionally redirect them directly to /requests/new
          navigate('/requests/new');
        }}
        language={language}
      />

      <div className="mt-6 flex gap-4">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
          onClick={() => navigate('/requests')}
        >
          {txt.viewAll[language]}
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={handleRequestOfferClick}
        >
          {txt.requestButton[language]}
        </button>
      </div>
    </section>
  );
}
