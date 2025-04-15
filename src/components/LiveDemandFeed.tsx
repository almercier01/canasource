import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';
import { Clock } from 'lucide-react';

interface RequestedOffer {
  id: string;
  title_en: string | null;
  title_fr: string | null;
  created_at: string;
}

export function LiveDemandFeed({ language }: { language: Language }) {
  const [offers, setOffers] = useState<RequestedOffer[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from('requested_offers')
        .select('id, title_en, title_fr, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) setOffers(data);
    };

    fetchOffers();
  }, []);

  return (
    <div className="bg-blue-50 py-10 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl mb-6">
          {language === 'fr'
            ? 'Ce que les Canadiens recherchent en ce moment'
            : 'What Canadians Are Looking For Right Now'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border rounded-lg p-4 text-left shadow hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                {new Date(offer.created_at).toLocaleDateString()}
              </div>
              <p className="text-gray-800 font-medium">
                {language === 'fr'
                  ? offer.title_fr || 'Demande sans titre'
                  : offer.title_en || 'Untitled request'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
