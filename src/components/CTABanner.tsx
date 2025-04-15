import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { Flame } from 'lucide-react';

export function CTABanner({ language }: { language: Language }) {
  const navigate = useNavigate();

  return (
    <div className="bg-red-600 text-white py-3 px-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-yellow-300" />
          <p className="text-sm sm:text-base font-medium">
            {language === 'fr'
              ? 'Nouvelles Offres en demande disponibles — Voyez ce que les Canadiens recherchent !'
              : 'New In-Demand Offers Available — See What Canadians Are Looking For!'}
          </p>
        </div>
        <button
          onClick={() => navigate('/requests?showForm=true')}
          className="bg-white text-red-600 font-semibold rounded px-4 py-1 text-sm hover:bg-yellow-100"
        >
          {language === 'fr' ? 'Voir les Offres' : 'View Offers'}
        </button>
      </div>
    </div>
  );
}
