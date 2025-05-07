import React, { useEffect, useState, useRef } from 'react';
import { searchWithAvesAPI } from '../utils/search';
import { Language } from '../types';
import axios from 'axios';
import { getRemainingSearches } from '../utils/getRemainingSearches';

interface SourcingChatSearchProps {
  searchTerm: string;
  language: Language;
  triggerSearch: boolean;
}

interface WebResult {
  title: string;
  link: string;
  snippet: string;
  email?: string;
}

export function SourcingChatSearch({ searchTerm, language, triggerSearch }: SourcingChatSearchProps) {
  const [results, setResults] = useState<WebResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchesLeft, setSearchesLeft] = useState<number>(getRemainingSearches());

  // --- NEW: Helpers for checking and saving searches ---
  const getCleanSearches = (): string[] => {
    const data = localStorage.getItem('canasourceWebSearches');
    const now = new Date();
    let searches: string[] = data ? JSON.parse(data) : [];

    // Filter only recent (within last 7 days)
    return searches.filter((timestamp) => {
      const date = new Date(timestamp);
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays < 7;
    });
  };

  const canRunWebSearch = (): boolean => {
    const clean = getCleanSearches();
    return clean.length < 3;
  };

  const saveWebSearch = () => {
    const clean = getCleanSearches();
    clean.push(new Date().toISOString());
    localStorage.setItem('canasourceWebSearches', JSON.stringify(clean));
    setSearchesLeft(3 - clean.length);
  };

  const looksFrench = (text: string) => {
    const commonFrenchWords = ['le', 'la', 'les', 'des', 'nous', 'vous', 'pour', 'avec', 'contactez', 'accueil', 'entreprise'];
    const lower = text.toLowerCase();
    return commonFrenchWords.some(word => lower.includes(word));
  };

  const emailBody = (term: string) =>
    encodeURIComponent(
      language === 'fr'
        ? `Bonjour,\n\nUn utilisateur de canasource.ca cherche une alternative locale pour : "${term}".\n\nSi votre entreprise peut fournir ce produit ou service, merci de le contacter.\n\nAjoutez votre entreprise gratuitement : https://canasource.ca\n\nCordialement,\nL’équipe CanaSource`
        : `Hello,\n\nOne of our users at canasource.ca is looking for a local sourcing alternative for: "${term}".\n\nIf your company provides this product or service, please reach out!\n\nAlso, consider listing your company on CanaSource — it's free: https://canasource.ca\n\nBest regards,\nThe CanaSource Team`
    );

  const extractDomain = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!triggerSearch || !searchTerm.trim()) return;

    if (hasRunRef.current) return; // 🚫 already ran
    hasRunRef.current = true;

    const runSearch = async () => {
      if (!canRunWebSearch()) {
        alert(language === 'fr'
          ? "Limite atteinte : Vous avez déjà effectué 3 recherches cette semaine."
          : "Limit reached: You’ve already made 3 searches this week.");
        return;
      }

      saveWebSearch();

      setLoading(true);
      try {
        const rawResults = await searchWithAvesAPI(searchTerm, language);
        const filtered = language === 'fr'
          ? rawResults.filter(r => looksFrench(r.snippet) || looksFrench(r.title))
          : rawResults;

        const withEmails = await Promise.all(
          filtered.map(async (r) => {
            try {
              const { data } = await axios.get(`/.netlify/functions/extractEmail?url=${encodeURIComponent(r.link)}`);
              return { ...r, email: data.email || '' };
            } catch {
              return { ...r, email: '' };
            }
          })
        );

        setResults(withEmails);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [triggerSearch, searchTerm]);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h4 className="text-sm font-semibold mb-4 text-gray-800">
        {language === 'fr' ? 'Résultats Web trouvés' : 'Web Results Found'}
      </h4>

      <div className="mb-2 text-sm text-gray-700">
        {language === 'fr'
          ? `Recherches restantes cette semaine : ${searchesLeft} / 3`
          : `Searches left this week: ${searchesLeft} / 3`}
      </div>

      {loading && (
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
          <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>
            {language === 'fr' ? 'Recherche de fournisseurs sur le Web en cours...' : 'Searching the Web for suppliers...'}
          </span>
        </div>
      )}

      {!loading && results.length === 0 && (
        <p className="text-sm text-gray-500">
          {language === 'fr' ? 'Aucun résultat trouvé sur le Web.' : 'No results found on the web.'}
        </p>
      )}

      <ul className="space-y-4">
        {results.map((r, i) => (
          <li key={i} className="border p-3 rounded text-sm">
            <div className="mb-1">
              <a
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm font-medium"
              >
                {r.title || extractDomain(r.link)}
              </a>
              <p className="text-xs text-gray-400">{extractDomain(r.link)}</p>
            </div>

            {r.email ? (
              <a
                href={`mailto:${r.email}?subject=CanaSource inquiry&body=${emailBody(searchTerm)}`}
                className="inline-flex items-center gap-2 mt-2 text-white bg-green-600 hover:bg-green-700 px-4 py-1 rounded"
              >
                📧 {language === 'fr' ? 'Contacter le fournisseur' : 'Contact Supplier'}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 mt-2 text-white bg-gray-400 px-4 py-1 rounded cursor-not-allowed">
                📧 {language === 'fr' ? 'Courriel non disponible' : 'Email not available'}
              </span>
            )}

            {r.snippet && <p className="text-gray-600 text-sm mt-1">{r.snippet}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
