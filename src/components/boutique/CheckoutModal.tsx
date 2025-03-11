import React, { useState } from 'react';
import { X, CreditCard, Truck, AlertCircle } from 'lucide-react';
import { Language } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  boutiqueId: string;
  language: Language;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  cart, 
  boutiqueId,
  language 
}: CheckoutModalProps) {
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
    phone: ''
  });

  if (!isOpen) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-CA' : 'fr-CA', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingCost = 15; // Example fixed shipping cost
  const total = subtotal + shippingCost;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error(language === 'en' ? 'Please sign in to complete your purchase' : 'Veuillez vous connecter pour finaliser votre achat');
      }

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('boutique_orders')
        .insert([
          {
            boutique_id: boutiqueId,
            customer_id: user.id,
            total_amount: total,
            shipping_address: shippingAddress
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from('boutique_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Initialize Stripe
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error('Stripe failed to initialize');

      // Create payment session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          items: cart,
          shipping: shippingAddress
        }),
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg max-w-3xl w-full mx-auto shadow-xl">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {language === 'en' ? 'Checkout' : 'Paiement'}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div>
                {step === 'shipping' ? (
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'en' ? 'First Name' : 'Prénom'}
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'en' ? 'Last Name' : 'Nom'}
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {language === 'en' ? 'Address' : 'Adresse'}
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'en' ? 'City' : 'Ville'}
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'en' ? 'Province' : 'Province'}
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.province}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, province: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'en' ? 'Postal Code' : 'Code Postal'}
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {language === 'en' ? 'Phone' : 'Téléphone'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {language === 'en' ? 'Cancel' : 'Annuler'}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                      >
                        {language === 'en' ? 'Continue to Payment' : 'Continuer vers le paiement'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Truck className="h-5 w-5" />
                      <h3 className="font-medium">
                        {language === 'en' ? 'Shipping Address' : 'Adresse de livraison'}
                      </h3>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.address}</p>
                      <p>{shippingAddress.city}, {shippingAddress.province}</p>
                      <p>{shippingAddress.postalCode}</p>
                      <p>{shippingAddress.phone}</p>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {loading
                        ? (language === 'en' ? 'Processing...' : 'Traitement...')
                        : (language === 'en' ? 'Pay Now' : 'Payer maintenant')}
                    </button>

                    <button
                      onClick={() => setStep('shipping')}
                      className="w-full text-sm text-gray-600 hover:text-gray-900"
                    >
                      {language === 'en' ? '← Back to shipping' : '← Retour à la livraison'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === 'en' ? 'Order Summary' : 'Résumé de la commande'}
                </h3>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {language === 'en' ? 'Quantity' : 'Quantité'}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between">
                      <p>{language === 'en' ? 'Subtotal' : 'Sous-total'}</p>
                      <p>{formatPrice(subtotal, cart[0].currency)}</p>
                    </div>
                    <div className="flex justify-between mt-2">
                      <p>{language === 'en' ? 'Shipping' : 'Livraison'}</p>
                      <p>{formatPrice(shippingCost, cart[0].currency)}</p>
                    </div>
                    <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                      <p>{language === 'en' ? 'Total' : 'Total'}</p>
                      <p>{formatPrice(total, cart[0].currency)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}