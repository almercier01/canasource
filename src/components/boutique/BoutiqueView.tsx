import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { ProductCard } from '../boutique/ProductCard';
import { CartDrawer } from '../boutique/CartDrawer';
import { CheckoutModal } from '../boutique/CheckoutModal';

interface BoutiqueViewProps {
  boutiqueId: string;
  language: Language;
  onClose: () => void;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    stock: number;
    images: string[];
    status: string;
    image_url: string;
  }

export function BoutiqueView({ boutiqueId, language, onClose }: BoutiqueViewProps) {
  const [boutique, setBoutique] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetchBoutiqueDetails();
    fetchProducts();
  }, [boutiqueId]);

  const fetchBoutiqueDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('boutiques')
        .select('*')
        .eq('id', boutiqueId)
        .single();

      if (error) throw error;
      setBoutique(data);
    } catch (err) {
      console.error('Error fetching boutique:', err);
      setError(language === 'en' ? 'Error loading boutique' : 'Erreur lors du chargement de la boutique');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('boutique_products')
        .select('*')
        .eq('boutique_id', boutiqueId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data.map(product => ({
        ...product,
        image_url: product.image_url || "",
      })));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(language === 'en' ? 'Error loading products' : 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
    <div className="bg-white max-w-4xl w-full p-6 rounded-lg shadow-lg relative overflow-auto z-[99999]">
  
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{boutique?.name}</h1>

        {/* Boutique Description */}
        {boutique?.description && (
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <p className="text-gray-600">{boutique.description}</p>
          </div>
        )}

        {/* Products Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto"></div>
            </div>
          ) : error ? (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'en' ? 'No products available yet' : 'Aucun produit disponible pour le moment'}
              </p>
            </div>
          ) : (
            products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
                onAddToCart={() => setIsCartOpen(true)}
              />
            ))
          )}
        </div>

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={[]} // Pass cart state here
          onUpdateQuantity={() => {}} // Pass function here
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          language={language}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={[]} // Pass cart state here
          boutiqueId={boutique?.id}
          language={language}
        />
      </div>
    </div>
  );
}
