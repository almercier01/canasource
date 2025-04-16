import React, { useEffect, useState } from 'react';
import tariffedProductsEn from '../data/tarriffedProductsEn.json';
import tariffedProductsFr from '../data/tarriffedProductsFr.json';
import { Language } from '../types';
import { useNavigate } from 'react-router-dom';

export function TariffedTicker({ language }: { language: Language }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  
  const items = language === 'fr' ? tariffedProductsFr : tariffedProductsEn;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items]);

  const item = items[index];

  return (
    <div
      onClick={() => navigate('/find-sourcing?showAll=true')}
      className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-2 rounded mb-6 shadow-sm cursor-pointer hover:bg-blue-100 transition"
      title={language === 'fr' ? 'Voir tous les produits sous tarif' : 'See all tariffed products'}
    >
      <strong>{language === 'fr' ? 'Produit sous tarif' : 'Tariffed Product'}:</strong>{' '}
      {item.productType} ({item.productNumber})
    </div>
  );
}
