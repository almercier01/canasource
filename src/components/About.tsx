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
          </div>
        </div>
      </div>
    </div>
  );
}