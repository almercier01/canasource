import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';

interface UserProductsProps {
  language: Language;
  businessId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  status: string;
}

export function UserProducts({ language, businessId }: UserProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [businessId]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('boutique_products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(language === 'en' ? 'Error loading products' : 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {language === 'en' ? 'My Boutique Products' : 'Mes Produits de Boutique'}
      </h1>

      {loading ? (
        <p>{language === 'en' ? 'Loading...' : 'Chargement...'}</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">{language === 'en' ? 'No products added yet.' : 'Aucun produit ajouté pour le moment.'}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
              <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <p className="text-gray-900 font-bold mt-2">${product.price.toFixed(2)}</p>
              <p className="text-gray-500 text-sm">{language === 'en' ? 'Stock:' : 'Stock :'} {product.stock}</p>
              <p className={`text-sm font-medium ${product.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {language === 'en' ? (product.status === 'active' ? 'Active' : 'Inactive') : (product.status === 'active' ? 'Actif' : 'Inactif')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
