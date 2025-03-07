import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Phone, Globe, Tag, ArrowLeft, Mail } from 'lucide-react';
import { PROVINCES, CATEGORIES, ProvinceCode, Category, Language, Business } from '../types';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabaseClient';
import { Loader } from '@googlemaps/js-api-loader';
import { CityAutocomplete } from './CityAutocomplete';

interface EditBusinessFormProps {
  business: Business;
  onCancel: () => void;
  onSave: () => void;
  language: Language;
}

export function EditBusinessForm({ business, onCancel, onSave, language }: EditBusinessFormProps) {
  const [formData, setFormData] = useState({
    name: business.name,
    description_en: business.description_en,
    description_fr: business.description_fr,
    category: business.category as Category,
    province: business.province as ProvinceCode,
    city: business.city,
    address: business.address || '',
    products: business.products.join(', '),
    services: business.services.join(', '),
    website: business.website || '',
    phone: business.phone || '',
    email: business.email || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityValid, setCityValid] = useState(true);

  const validateWebsite = (url: string): string | null => {
    if (!url) return null;
    url = url.trim();
    if (!/^https?:\/\//.test(url)) {
      url = `https://${url}`;
    }
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error('Invalid website URL format');
    }
  };

  const getCoordinates = async (address: string, city: string, province: ProvinceCode) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('Google Maps API key missing');

    const loader = new Loader({ apiKey, version: 'weekly', libraries: ['geocoding'] });
    const google = await loader.load();
    const geocoder = new google.maps.Geocoder();

    const provinceName = PROVINCES[province].en;
    const fullAddress = `${address}, ${city}, ${provinceName}, Canada`;

    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          reject(new Error(translations.errors.coordinatesNotFound[language]));
        }
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(translations.auth.signInRequired[language]);

      const website = formData.website ? validateWebsite(formData.website) : null;
      const coordinates = await getCoordinates(formData.address, formData.city, formData.province);

      const updatedData = {
        name: formData.name,
        description_en: formData.description_en,
        description_fr: formData.description_fr,
        category: formData.category,
        province: formData.province,
        city: formData.city,
        address: formData.address,
        products: formData.products.split(',').map(p => p.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
        website,
        phone: formData.phone || null,
        email: formData.email || null,
        lat: coordinates.lat,
        lng: coordinates.lng,
      };

      const { error } = await supabase
        .from('businesses')
        .update(updatedData)
        .eq('id', business.id)
        .eq('owner_id', user.id);

      if (error) throw error;

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.errors.generic[language]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={onCancel} className="flex items-center text-gray-600 hover:text-red-600">
          <ArrowLeft className="h-5 w-5 mr-2" />
          {translations.nav.backToHome[language]}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {error && <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>}

        {/* Name */}
        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={translations.register.businessName[language]} required />

        {/* Description */}
        <textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} placeholder="Description (EN)" required />
        <textarea value={formData.description_fr} onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })} placeholder="Description (FR)" required />

        {/* Category */}
        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}>
          <option value="">{translations.register.selectCategory[language]}</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{translations.categories[cat][language]}</option>)}
        </select>

        {/* Province */}
        <select value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value as ProvinceCode })}>
          <option value="">{translations.register.selectProvince[language]}</option>
          {Object.entries(PROVINCES).map(([code, names]) => (
            <option key={code} value={code}>{names[language]}</option>
          ))}
        </select>

        {/* City */}
        <CityAutocomplete province={formData.province} value={formData.city} onChange={(city) => setFormData({ ...formData, city })} language={language} onValidityChange={setCityValid} />

        {/* Address */}
        <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder={translations.register.addressPlaceholder[language]} required />

        {/* Products & Services */}
        <input value={formData.products} onChange={(e) => setFormData({ ...formData, products: e.target.value })} placeholder={translations.register.productsPlaceholder[language]} />
        <input value={formData.services} onChange={(e) => setFormData({ ...formData, services: e.target.value })} placeholder={translations.register.servicesPlaceholder[language]} />

        {/* Website & Phone */}
        <input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder={translations.register.websitePlaceholder[language]} />
        <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder={translations.register.phonePlaceholder[language]} />

        {/* Submit */}
        <div className="flex justify-end">
          <button onClick={onCancel} className="mr-2 px-4 py-2 bg-gray-300 rounded">{translations.common.cancel[language]}</button>
          <button type="submit" disabled={loading || !cityValid} className="px-4 py-2 bg-red-600 text-white rounded">
            {loading ? translations.common.processing[language] : translations.common.save[language]}
          </button>
        </div>
      </form>
    </div>
  );
}
