import React, { useEffect, useState } from 'react';
import tariffedProductsEn from '../data/tarriffedProductsEn.json';
import tariffedProductsFr from '../data/tarriffedProductsFr.json';

interface TariffedProduct {
  productNumber: string;
  productType: string;
  productDescription: string;
}

interface FindSourcingProps {
  language: 'en' | 'fr';
  resetKey?: number;
}

export function FindSourcing({ language, resetKey }: FindSourcingProps) {
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">
        {language === 'fr' ? 'Produits Soumis à des Tarifs' : 'Tariffed Products In Demand'}
      </h2>
      <p className="text-gray-600 mb-4">
        {language === 'fr'
          ? 'Voici une liste de produits qui subissent des tarifs à l\'importation. Les fabricants ou fournisseurs canadiens sont invités à les offrir localement.'
          : 'These products face import tariffs. Canadian suppliers are encouraged to provide them locally.'}
      </p>

      <div className="mb-4">
        <input
          type="text"
          className="border rounded w-full p-2"
          placeholder={language === 'fr' ? 'Rechercher un produit...' : 'Search for a product...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul className="space-y-4">
        {displayedItems.map((item) => {
          const imageUrl = `/images/tariffed/${item.productNumber}.jpg`;
          const fallbackImage = language === 'fr' ? '/images/default-productFr.jpg' : '/images/default-productEn.jpg';

          return (
            <li key={item.productNumber} className="border p-4 rounded bg-white shadow-sm">
              <img
                src={imageUrl}
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
                alt={item.productType}
                className="w-full h-48 object-contain rounded bg-gray-100 mb-3"
              />
              <h3 className="text-lg font-semibold">
                {item.productType} ({item.productNumber})
              </h3>
              <p className="mt-1 text-sm text-gray-700">{item.productDescription}</p>
              <a
                href={`/register?code=${encodeURIComponent(item.productType)}`}
                className="mt-3 inline-block text-blue-600 hover:underline"
              >
                {language === 'fr' ? 'Proposer ce produit' : 'Provide This Product'}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 text-center">
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showAll
            ? language === 'fr' ? 'Afficher moins' : 'Show Less'
            : language === 'fr' ? 'Voir tous les produits' : 'View All Products'}
        </button>
      </div>
    </div>
  );
}