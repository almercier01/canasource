import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LogIn, Mail, Lock, UserPlus, X, User, Globe, MapPin } from 'lucide-react';
import { TermsAndPrivacy } from '../legal/TermsAndPrivacy';
import { Language } from '../../types';
import { PROVINCES, ProvinceCode } from '../../types';
import { CityAutocomplete } from '../CityAutocomplete';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
}

export function AuthModal({ isOpen, onClose, onSuccess, language }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [cityValid, setCityValid] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    business_name: '',
    province: '' as ProvinceCode | '',
    city: '',
    address: '',
    postal_code: '',
    country: 'Canada',
    phone: '',
    languagePref: language,
  });
  
  useEffect(() => {
    if (!isOpen) {
      setLoading(false); // ✅ Reset loading when modal closes
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isLogin) {
      const { email, password } = formData;
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(language === 'en' ? 'Invalid email or password' : 'Email ou mot de passe invalide');
        setLoading(false);
        return;
      }

      resetForm();
      onSuccess();
      onClose();
    } else {
      setShowTerms(true);
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { email, password, firstName, lastName, province, city, languagePref, business_name, address, postal_code, country, phone } = formData;
  
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
  
      if (data?.user) {
        const { error: updateError } = await supabase.from('users')
          .update({
            first_name: firstName,
            last_name: lastName,
            business_name,
            province: province ? PROVINCES[province as ProvinceCode][language] : '',
            city,
            address,
            postal_code,
            country,
            phone,
            language: languagePref,
          })
          .eq('id', data.user.id);
  
        if (updateError) throw updateError;
      }
  
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      business_name: '',
      province: '',
      city: '',
      address: '',
      postal_code: '',
      country: 'Canada',
      phone: '',
      languagePref: language,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              {isLogin ? (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  {language === 'en' ? 'Sign In' : 'Connexion'}
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  {language === 'en' ? 'Sign Up' : 'Inscription'}
                </>
              )}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full border-gray-300 rounded-md shadow-sm"
                    placeholder={language === 'en' ? 'you@example.com' : 'vous@exemple.com'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'en' ? 'Password' : 'Mot de passe'}
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'First Name' : 'Prénom'}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />

                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'Last Name' : 'Nom'}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />

                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'Business Name' : 'Nom de l\'entreprise'}
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />


                  <select
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value as ProvinceCode, city: '' })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">{language === 'en' ? 'Select Province' : 'Choisissez une province'}</option>
                    {Object.entries(PROVINCES).map(([code, names]) => (
                      <option key={code} value={code}>{names[language]}</option>
                    ))}
                  </select>

                  <CityAutocomplete
                    province={formData.province}
                    value={formData.city}
                    language={language}
                    onChange={(city) => setFormData(prev => ({ ...prev, city }))}
                    onValidityChange={setCityValid}
                  />

                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'Address' : 'Adresse'}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />

                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'Postal Code' : 'Code postal'}
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />

                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'Country' : 'Pays'}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />

                  <input
                    type="tel"
                    required
                    placeholder={language === 'en' ? 'Phone' : 'Téléphone'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />

                  <select
                    required
                    value={formData.languagePref}
                    onChange={(e) => setFormData({ ...formData, languagePref: e.target.value as Language })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </>
              )}

              <button
                type="submit"
                disabled={loading || (!cityValid && !isLogin)}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                {loading
                  ? (language === 'en' ? 'Processing...' : 'Traitement...')
                  : isLogin
                    ? (language === 'en' ? 'Sign In' : 'Connexion')
                    : (language === 'en' ? 'Sign Up' : "S'inscrire")}
              </button>

              {/* Toggle Sign-in/Sign-up button added here */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="mt-4 text-sm text-red-600 hover:text-red-500"
                >
                  {isLogin
                    ? (language === 'en' ? 'Need an account? Sign up' : "Besoin d'un compte ? Inscrivez-vous")
                    : (language === 'en' ? 'Already have an account? Sign in' : 'Déjà un compte ? Connectez-vous')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <TermsAndPrivacy
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => { setShowTerms(false); handleSignUp(); }}
        language={language}
      />
    </>
  );

}
