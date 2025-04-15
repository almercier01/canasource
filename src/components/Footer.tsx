import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  language: 'en' | 'fr';
  onRegisterClick: () => void;
  onOpenTerms: () => void;
}

export function Footer({ language, onRegisterClick, onOpenTerms }: FooterProps) {
  return (
    <footer className="bg-gray-100 text-gray-700 text-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Logo + Tagline */}
        <div>
          <h3 className="text-lg font-bold text-red-600">CanaSource</h3>
          <p className="mt-2">
            {language === 'fr'
              ? 'Favoriser l’autonomie locale, un fournisseur à la fois.'
              : 'Empowering local sourcing, one supplier at a time.'}
          </p>
          <p className="mt-4 text-xs text-gray-500">© 2025 CanaSource</p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-semibold mb-2">
            {language === 'fr' ? 'Navigation' : 'Navigation'}
          </h4>
          <ul className="space-y-1">
            <li>
              <Link to="/about" className="hover:underline">
                {language === 'fr' ? 'À propos' : 'About'}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                {language === 'fr' ? 'Contact' : 'Contact'}
              </Link>
            </li>
            <li>
              <Link to="/requests" className="hover:underline">
                {language === 'fr' ? 'Offres en demande' : 'Requested Offers'}
              </Link>
            </li>
            <li>
              <button
                onClick={onRegisterClick}
                className="hover:underline text-left"
              >
                {language === 'fr' ? 'S’inscrire' : 'Register'}
              </button>
            </li>
          </ul>
        </div>

        {/* Legal / Locale */}
        <div>
          <h4 className="font-semibold mb-2">{language === 'fr' ? 'Légal' : 'Legal'}</h4>
          <ul className="space-y-1">
  <li>
    <button onClick={onOpenTerms} className="hover:underline text-left">
      {language === 'fr' ? 'Confidentialité' : 'Privacy'}
    </button>
  </li>
  <li>
    <button onClick={onOpenTerms} className="hover:underline text-left">
      {language === 'fr' ? 'Conditions' : 'Terms'}
    </button>
  </li>
  <li className="pt-3 text-xs text-gray-500">
    🇨🇦 {language === 'fr' ? 'Fait au Canada avec ❤️' : 'Made in Canada with ❤️'}
  </li>
</ul>

        </div>
      </div>
    </footer>
  );
}
