import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Language } from '../../types';

interface ProductCardProps {
    product: {
        name: string;
        description: string;
        price: number;
        currency: string;
        stock: number;
        images: string[];
        image_url: string;
    };
    language: Language;
    onAddToCart: () => void;
}

export function ProductCard({ product, language, onAddToCart }: ProductCardProps) {
    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat(language === 'en' ? 'en-CA' : 'fr-CA', {
            style: 'currency',
            currency: currency
        }).format(price);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-1 aspect-h-1 w-full">
            <img
  src={(product.images?.[0] || product.image_url) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400"}
  alt={product.name}
  className="w-full h-48 object-cover"
/>




            </div>

            <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price, product.currency)}
                    </span>

                    <button
                        onClick={onAddToCart}
                        disabled={product.stock === 0}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Add to Cart' : 'Ajouter au panier'}
                    </button>
                </div>

                {product.stock === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                        {language === 'en' ? 'Out of stock' : 'Rupture de stock'}
                    </p>
                )}
            </div>
        </div>
    );
}