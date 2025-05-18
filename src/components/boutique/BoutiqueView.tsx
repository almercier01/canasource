import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, ArrowLeft } from 'lucide-react';
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

interface CartItem extends Product {
    quantity: number;
    businessName: string; // Add this line
}

export function BoutiqueView({ boutiqueId, language, onClose }: BoutiqueViewProps) {
    const [boutique, setBoutique] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
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

            setProducts(
                data.map((product) => ({
                    ...product,
                    images: product.images || [], // Ensure images is always an array
                    image_url: product.image_url || '', // Ensure image_url exists
                }))
            );
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(language === 'en' ? 'Error loading products' : 'Erreur lors du chargement des produits');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prevCart,
                {
                    ...product,
                    quantity: 1,
                    businessName: boutique?.name || '', // Add business name here
                },
            ];
        });
        setIsCartOpen(true);
    };

    const updateCartItemQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
        } else {
            setCart((prevCart) =>
                prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
<div className="bg-white rounded-lg shadow-lg max-w-5xl w-full h-[90vh] max-h-screen p-6 relative flex flex-col">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
                >
                    ✖
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button
                            onClick={onClose}
                            className="flex items-center text-gray-600 hover:text-red-600 mr-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            {language === 'en' ? 'Back' : 'Retour'}
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">{boutique?.name}</h1>
                    </div>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-6"
                    >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {language === 'en' ? 'Cart' : 'Panier'}
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Description */}
                {boutique?.description && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-gray-600">
                        {boutique.description}
                    </div>
                )}

                {/* Products Grid */}
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">

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
                                <p className="text-gray-500">
                                    {language === 'en'
                                        ? 'No products available yet'
                                        : 'Aucun produit disponible pour le moment'}
                                </p>
                            </div>
                        ) : (
                            products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    language={language}
                                    onAddToCart={() => addToCart(product)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Cart Drawer */}
                <CartDrawer
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cart={cart}
                    onUpdateQuantity={updateCartItemQuantity}
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
                    cart={cart}
                    boutiqueId={boutiqueId}
                    language={language}
                />
            </div>
        </div>
    );
}
