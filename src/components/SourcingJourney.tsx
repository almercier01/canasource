import React from 'react';
import { Language } from '../types';
import { Sparkles, Search, MessageSquare } from 'lucide-react';

export function SourcingJourney({ language }: { language: Language }) {
  const steps = [
    {
      icon: <Sparkles className="w-6 h-6 text-red-500" />,
      title: language === 'fr' ? 'Trouvez une alternative locale' : 'Find a Local Alternative',
      desc: language === 'fr'
        ? 'Besoin d’un parasol, d’un tissu ou d’un produit spécifique? Découvrez ce qui est offert au Canada.'
        : 'Need a parasol, fabric, or specific product? Discover what’s offered in Canada.',
    },
    {
      icon: <Search className="w-6 h-6 text-blue-500" />,
      title: language === 'fr' ? 'Recherchez facilement' : 'Search Easily',
      desc: language === 'fr'
        ? 'Utilisez notre outil pour trouver rapidement des fournisseurs locaux.'
        : 'Use our search tool to quickly find local suppliers.',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      title: language === 'fr' ? 'Soumettez une demande' : 'Submit a Request',
      desc: language === 'fr'
        ? 'Vous ne trouvez pas? Déposez une demande visible par tous les fournisseurs.'
        : 'Can’t find it? Submit a request visible to all suppliers.',
    },
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl mb-6">
          {language === 'fr'
            ? "Votre parcours vers l’approvisionnement local"
            : "Your Local Sourcing Journey"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-gray-600 mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
