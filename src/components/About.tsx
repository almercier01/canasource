import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface AboutProps {
  language: Language;
  onClose: () => void;
}

export function About({ language, onClose }: AboutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 hover:text-red-600"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {translations.nav.backToHome[language]}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
           {/* ✅ Logo at top */}
  <div className="flex justify-center mb-6">
    <img
      src="/canasource_logo.png"
      alt="CanaSource Logo"
      className="h-16 w-auto"
    />
  </div>

  <h1 className="text-3xl font-bold text-gray-900 mb-6">
    {translations.about.title[language]}
  </h1> 

          <div className="prose prose-red max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              {translations.about.description[language]}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {translations.about.mission.title[language]}
            </h2>
            <p className="text-gray-700 mb-6">
              {translations.about.mission.description[language]}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {translations.about.values.title[language]}
            </h2>
            <ul className="list-disc pl-6 space-y-3 text-gray-700">
              {translations.about.values.items.map((item, index) => (
                <li key={index}>{item[language]}</li>
              ))}
            </ul>
             {/* ✅ Press Section */}
    <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-4">
      {language === 'en' ? 'For the Press' : 'Pour les médias'}
    </h2>

    <p className="text-gray-700 mb-4">
      {language === 'en'
        ? 'We welcome press coverage and are happy to provide logos, screenshots, and details about CanaSource.'
        : 'Nous encourageons la couverture médiatique et sommes heureux de fournir des logos, captures d’écran et informations sur CanaSource.'}
    </p>

    <p className="text-gray-700 mb-4">
      {language === 'en'
        ? 'Download our press kit below or contact us directly.'
        : 'Téléchargez notre kit média ci-dessous ou contactez-nous directement.'}
    </p>

    {/* ✅ Buttons/Links */}
    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mt-4">
      <a
        href="/assets/press-kit.zip"
        download
        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
      >
        {language === 'en' ? 'Download Press Kit' : 'Télécharger le kit média'}
      </a>
      <a
        href="mailto:press@canasource.ca"
        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200 transition"
      >
        {language === 'en' ? 'Contact Us' : 'Contactez-nous'}
      </a>
    </div>

    {/* ✅ Optional short quote */}
    <blockquote className="mt-6 text-gray-600 italic border-l-4 border-red-500 pl-4">
      {language === 'en'
        ? '"CanaSource is changing how Canadians connect with local suppliers. We’re proud to help make sourcing more sustainable and local."'
        : '"CanaSource transforme la façon dont les Canadiens se connectent aux fournisseurs locaux. Nous sommes fiers de favoriser un approvisionnement durable et local."'}
    </blockquote>
  </div>
          </div>
        </div>
      </div>

  );
}