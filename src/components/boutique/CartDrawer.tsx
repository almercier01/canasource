import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Language } from '../../types';

interface CartItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  images: string[];
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
  language: Language;
}

export function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity,
  onCheckout,
  language 
}: CartDrawerProps) {
  if (!isOpen) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-CA' : 'fr-CA', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {language === 'en' ? 'Shopping Cart' : 'Panier'}
                </h2>
                <button
                  onClick={onClose}
                  className="ml-3 h-7 w-7 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-8">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {language === 'en' 
                        ? 'Your cart is empty' 
                        : 'Votre panier est vide'}
                    </p>
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <li key={item.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                            <img
                              src={item.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">
                                  {formatPrice(item.price * item.quantity, item.currency)}
                                </p>
                              </div>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Minus className="h-4 w-4 text-gray-500" />
                                </button>
                                <span className="font-medium text-gray-700">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Plus className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 0)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                {language === 'en' ? 'Remove' : 'Retirer'}
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>{language === 'en' ? 'Subtotal' : 'Sous-total'}</p>
                  <p>{formatPrice(subtotal, cart[0].currency)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {language === 'en' 
                    ? 'Shipping and taxes calculated at checkout.' 
                    : 'Frais de livraison et taxes calculés lors du paiement.'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={onCheckout}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    {language === 'en' ? 'Checkout' : 'Paiement'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}