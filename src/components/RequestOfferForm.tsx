import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { translations } from '../i18n/translations';
import { Language } from '../types';
import { useNavigate } from 'react-router-dom';

interface RequestOfferFormProps {
  language: Language; // 'en' | 'fr'
  onCancel: () => void;
  onSuccess?: () => void;
}

export function RequestOfferForm({
  language,
  onCancel,
  onSuccess,
}: RequestOfferFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    description_en: '',
    description_fr: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Ensure the user is logged in
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setError(translations.auth.signInRequired[language]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error(translations.auth.signInRequired[language]);
      }

      // Insert partial or full bilingual data
      const { error: insertError } = await supabase
        .from('requested_offers')
        .insert([
          {
            user_id: user.id,
            status: 'pending',
            title_en: formData.title_en || null,
            title_fr: formData.title_fr || null,
            description_en: formData.description_en || null,
            description_fr: formData.description_fr || null,
          },
        ]);

      if (insertError) throw insertError;

      if (onSuccess) onSuccess();
      onCancel(); // or navigate to /requests, etc.
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(translations.errors.generic[language]);
    } finally {
      setLoading(false);
    }
  };

  // For convenience, define some label text:
  const labelTitleEn = language === 'en' ? 'Title (English)' : 'Titre (Anglais)';
  const labelTitleFr = language === 'en' ? 'Title (French)' : 'Titre (Français)';
  const labelDescEn = language === 'en' ? 'Description (English)' : 'Description (Anglais)';
  const labelDescFr = language === 'en' ? 'Description (French)' : 'Description (Français)';
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {language === 'en' ? 'Request an Offer' : 'Demandez une Offre'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title (English) - required only if site is in 'en' */}
          <div>
            <label htmlFor="title_en" className="block text-sm font-medium text-gray-700">
              {labelTitleEn}{language === 'en' ? ' *' : ''}
            </label>
            <input
              type="text"
              id="title_en"
              required={language === 'en'}
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Title (French) - required only if site is in 'fr' */}
          <div>
            <label htmlFor="title_fr" className="block text-sm font-medium text-gray-700">
              {labelTitleFr}{language === 'fr' ? ' *' : ''}
            </label>
            <input
              type="text"
              id="title_fr"
              required={language === 'fr'}
              value={formData.title_fr}
              onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Description (English) - required only if site is in 'en' */}
          <div>
            <label htmlFor="description_en" className="block text-sm font-medium text-gray-700">
              {labelDescEn}{language === 'en' ? ' *' : ''}
            </label>
            <textarea
              id="description_en"
              required={language === 'en'}
              rows={3}
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Description (French) - required only if site is in 'fr' */}
          <div>
            <label htmlFor="description_fr" className="block text-sm font-medium text-gray-700">
              {labelDescFr}{language === 'fr' ? ' *' : ''}
            </label>
            <textarea
              id="description_fr"
              required={language === 'fr'}
              rows={3}
              value={formData.description_fr}
              onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {translations.common.cancel[language]}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              {loading
                ? translations.common.processing[language]
                : language === 'en' ? 'Submit' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
