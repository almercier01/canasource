import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { Flame, X } from 'lucide-react';

export function CTABanner({ language }: { language: Language }) {
  const [isSticky, setIsSticky] = useState(true);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('ctaBannerDismissed');
    if (stored === 'true') setVisible(false);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('ctaBannerDismissed', 'true');
  };

useEffect(() => {
  const footer = document.querySelector('footer');

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        setIsSticky(false); // Footer is truly in view
      } else {
        setIsSticky(true);
      }
    },
    {
      root: null,
      threshold: 0.5, // 👈 not 0 anymore
    }
  );

  if (footer) observer.observe(footer);
  return () => observer.disconnect();
}, []);


  if (!visible) return null;

  return (
    <div
      className={`${
        isSticky ? 'fixed bottom-0 left-0 right-0 z-40' : 'static'
      } bg-red-600 text-white py-3 px-4 shadow-md`}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative">
        <div className="flex items-center gap-2 text-center sm:text-left">
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
          {language === 'fr' ? 'Voir les Offres recherchés' : 'View in-demand Offers'}
        </button>

        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:static sm:ml-3 text-white hover:text-yellow-300"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
