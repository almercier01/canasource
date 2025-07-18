import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LogIn, Mail, Lock, UserPlus, X } from 'lucide-react';
import { TermsAndPrivacy } from '../legal/TermsAndPrivacy';
import { Language } from '../../types';

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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    languagePref: language,
  });
  
  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
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
    const { email, password, firstName, lastName, languagePref } = formData;
  
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
  
      if (data?.user) {
        // Insert basic user profile in users table
        const { error: upsertError } = await supabase.from('users')
          .upsert({
            id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            preferred_language: languagePref,
          }, {
            onConflict: 'id'
          });
  
        if (upsertError) {
          console.error('User profile creation error:', upsertError);
          throw upsertError;
        }

        // Note: Additional profile information and business registration can be completed later
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'en' ? 'First Name' : 'Prénom'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                      placeholder={language === 'en' ? 'First Name' : 'Prénom'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'en' ? 'Last Name' : 'Nom'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                      placeholder={language === 'en' ? 'Last Name' : 'Nom'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'en' ? 'Preferred Language' : 'Langue préférée'}
                    </label>
                    <select
                      required
                      value={formData.languagePref}
                      onChange={(e) => setFormData({ ...formData, languagePref: e.target.value as Language })}
                      className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md"
              >
                {loading
                  ? (language === 'en' ? 'Processing...' : 'Traitement...')
                  : isLogin
                    ? (language === 'en' ? 'Sign In' : 'Connexion')
                    : (language === 'en' ? 'Sign Up' : "S'inscrire")}
              </button>

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
        language={formData.languagePref}
      />
    </>
  );
}
