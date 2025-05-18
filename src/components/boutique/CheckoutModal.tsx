import React, { useState, useEffect } from 'react';
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
  businessName: string;
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
  const [step, setStep] = useState<'shipping' | 'payment' | 'done'>('shipping');
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAddress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, address, city, province, postal_code, country, phone')
        .eq('id', user.id)
        .single();
      if (data) {
        setShippingAddress({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postalCode: data.postal_code || '',
          country: data.country || 'Canada',
          phone: data.phone || ''
        });
      }
    };
    fetchUserAddress();
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-CA' : 'fr-CA', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch boutique (get owner_id)
      const { data: boutique, error: boutiqueError } = await supabase
        .from('boutiques')
        .select('name, owner_id')
        .eq('id', boutiqueId)
        .single();

      if (boutiqueError || !boutique) throw new Error('Could not find business info.');

      // 2. Fetch owner's email
      const { data: owner, error: ownerError } = await supabase
        .from('users')
        .select('email')
        .eq('id', boutique.owner_id)
        .single();

      if (ownerError || !owner) throw new Error('Could not find business owner email.');

      // 3. Send order email
      const response = await fetch('/.netlify/functions/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessEmail: owner.email,
          businessName: boutique.name,
          cart,
          shippingAddress,
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to send order email.');

      setSuccessMessage(
        language === 'en'
          ? `Thank you for your order! ${boutique.name} will contact you to finalize payment and shipping.`
          : `Merci pour votre commande! ${boutique.name} vous contactera pour finaliser le paiement et la livraison.`
      );
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred sending your order');
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

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                {successMessage}
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
                        : (language === 'en' ? 'Send your order' : 'Envoyer votre commande')}
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
                        <p className="text-xs text-gray-400">
                          {language === 'en' ? 'Seller:' : 'Vendeur:'} {item.businessName}
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
                      <p className="italic text-gray-500">
                        {language === 'en'
                          ? 'Shipping will be determined by the seller'
                          : 'Les frais de livraison seront déterminés par le vendeur'}
                      </p>
                    </div>
                    <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                      <p>{language === 'en' ? 'Total' : 'Total'}</p>
                      <p>{formatPrice(subtotal, cart[0].currency)}</p>
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