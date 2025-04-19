import React, { useEffect, useState } from 'react';
import tariffedProductsEn from '../data/tarriffedProductsEn.json';
import tariffedProductsFr from '../data/tarriffedProductsFr.json';
import { Package } from 'lucide-react';

interface TariffedProduct {
  productNumber: string;
  productType: string;
  productDescription: string;
}

interface FindSourcingProps {
  language: 'en' | 'fr';
  resetKey?: number;
  user?: any; // or use your actual User type
  onRequireLogin?: () => void;
}


export function FindSourcing({ language, resetKey, user, onRequireLogin }: FindSourcingProps) {
  const [items, setItems] = useState<TariffedProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = language === 'fr' ? tariffedProductsFr : tariffedProductsEn;
    setItems(data);
    setCurrentIndex(0);
  }, [language]);

  useEffect(() => {
    setShowAll(false);
    setSearchTerm('');
    setCurrentIndex(0);
  }, [resetKey]);

  useEffect(() => {
    if (!showAll && items.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [items, showAll]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceShowAll = params.get('showAll') === 'true';

    setShowAll(forceShowAll); // ✅ force open if ?showAll=true
    setSearchTerm('');
    setCurrentIndex(0);
  }, [resetKey]);


  const filtered = items.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.productNumber.toLowerCase().includes(search) ||
      item.productType.toLowerCase().includes(search) ||
      item.productDescription.toLowerCase().includes(search)
    );
  });

  const displayedItems = showAll ? filtered : items.length > 0 ? [items[currentIndex]] : [];

  return (
    <div className="bg-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Package className="w-6 h-6 text-red-500" />
          {language === 'fr'
            ? 'Produits visés par des Tarifs — Et si vous pouviez les offrir ?'
            : 'Tariffed Products — Could You Supply These Locally?'}
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          {language === 'fr' ? (
            <>
              Voici une liste de produits qui subissent des tarifs à l'importation selon la{' '}
              <a
                href="https://www.canada.ca/fr/ministere-finances/nouvelles/2025/03/liste-des-produits-en-provenance-des-etats-unis-assujettis-a-des-droits-de-douane-de-25--a-compter-du-13-mars-2025.html"
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                liste officielle du gouvernement
              </a>
              . Les fabricants ou fournisseurs canadiens sont invités à les offrir localement.
            </>
          ) : (
            <>
              These products face import tariffs as outlined in the{' '}
              <a
                href="https://www.canada.ca/en/department-finance/news/2025/03/list-of-products-from-the-united-states-subject-to-25-per-cent-tariffs-effective-march-13-2025.html"
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                official government announcement
              </a>
              . Canadian suppliers are encouraged to provide them locally.
            </>
          )}
        </p>

        {/* Search bar */}
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-4 py-2 mb-6 shadow-sm"
          placeholder={language === 'fr' ? 'Rechercher un produit...' : 'Search for a product...'}
          value={searchTerm}
          onChange={(e) => {
            const term = e.target.value;
            setSearchTerm(term);
            if (!showAll) setShowAll(true);
          }}
        />

        {/* Product list */}
        <ul className="grid gap-4">
          {displayedItems.map((item) => {
            const imageUrl = `/images/tariffed/${item.productNumber}.jpg`;
            const fallbackImage =
              language === 'fr' ? '/images/default-productFr.jpg' : '/images/default-productEn.jpg';

            return (
              <li key={item.productNumber} className="bg-gray-50 border rounded p-4 shadow-sm hover:shadow transition">
                {/* Enable image support if needed */}
                {/* <img
                  src={imageUrl}
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                  alt={item.productType}
                  className="w-full h-48 object-contain rounded bg-white mb-3"
                /> */}
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.productType} ({item.productNumber})
                </h3>
                <p className="text-sm text-gray-700 mt-1">{item.productDescription}</p>
                <button
                  onClick={() => {
                    if (user) {
                      window.location.href = `/register?code=${encodeURIComponent(item.productType)}`;
                    } else {
                      // 👇 Append the product name in the URL so we can redirect later
                      const url = new URL(window.location.href);
                      url.searchParams.set('code', item.productType);
                      window.history.pushState({}, '', url);
                      onRequireLogin?.();
                    }
                  }}
                  className="inline-block text-blue-600 hover:underline mt-2 text-sm"
                >
                  {language === 'fr' ? 'Proposer ce produit' : 'Provide This Product'}
                </button>


              </li>
            );
          })}
        </ul>

        {/* Toggle Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            {showAll
              ? language === 'fr'
                ? 'Afficher moins'
                : 'Show Less'
              : language === 'fr'
                ? 'Voir tous les produits'
                : 'View All Products'}
          </button>
        </div>
      </div>
    </div>
  );
}
