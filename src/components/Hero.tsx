import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  language: Language;
  onExploreClick: () => void;
  onRegisterClick: () => void;
  onRequestOffersClick: () => void; // ✅ Add this new prop
}

export function Hero({ language, onExploreClick, onRegisterClick, onRequestOffersClick }: HeroProps) {

  const navigate = useNavigate();

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block text-red-600">
                  {translations.hero.title1[language]}
                </span>
                <span className="block">
                  {translations.hero.title2[language]}
                </span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                {translations.mission[language]}
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <div className="mt-5 max-w-xl mx-auto sm:flex sm:justify-center md:mt-8 gap-3 flex-col sm:flex-row">
                    <div className="rounded-md shadow">
                      <button
                       onClick={() => onExploreClick()}

                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
                      >
                        {translations.hero.exploreButton[language]}
                      </button>
                    </div>
                    <div className="rounded-md shadow">
                      <button
                        onClick={onRequestOffersClick}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        {language === 'fr'
                          ? 'Découvrez les Offres en demande !'
                          : 'Discover in-demand Offers'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}