// src/components/EditBusinessForm.tsx
import React, { useState, useEffect } from 'react';
import { PROVINCES, ProvinceCode, Language, Business } from '../types';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';

interface EditBusinessFormProps {
  business: Business;
  onCancel: () => void;
  onSave: () => void;
  language: Language;
}

export function EditBusinessForm({ business, onCancel, onSave, language }: EditBusinessFormProps) {

  const [searchParams] = useSearchParams();
const newProduct = searchParams.get('code') || '';

  const [formData, setFormData] = useState({
    name: business.name || '',
    description_en: business.description_en || '',
    description_fr: business.description_fr || '',
    category_en: business.category_en || '',
    category_fr: business.category_fr || '',
    province_en: business.province_en || '',
    province_fr: business.province_fr || '',
    city: business.city || '',
    address: business.address || '',
    products: business.products ? business.products.join(', ') : '',
    services: business.services ? business.services.join(', ') : '',
    website: business.website || '',
    phone: business.phone || '',
    email: business.email || '',
    image_url: business.image_url || ''
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    checkOwnership();
  }, []);

  useEffect(() => {
    if (newProduct && !formData.products.includes(newProduct)) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products ? `${prev.products}, ${newProduct}` : newProduct,
      }));
    }
  }, [newProduct]);
  

  const checkOwnership = async () => {

    const { data: { user }, error } = await supabase.auth.getUser();
console.log("Current User ID:", user?.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsOwner(false);
        return;
      }

      // Check if user is owner
      const { data, error } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', business.id)
        .single();

      if (error) throw error;
      setIsOwner(data.owner_id === user.id);
    } catch (err) {
      console.error('Error checking ownership:', err);
      setIsOwner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setError(language === 'en' 
        ? 'You do not have permission to edit this business' 
        : 'Vous n\'avez pas la permission de modifier cette entreprise'
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // First, check if we need to upload a new image
      let finalImageUrl = formData.image_url;
      const imageInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (imageInput?.files?.length) {
        const file = imageInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${business.id}_${Date.now()}.${fileExt}`;
        const filePath = `business_images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('business-images')
          .getPublicUrl(filePath);

        finalImageUrl = data.publicUrl;
      }

      // Prepare update data
      const updatedData = {
        name: formData.name,
        description_en: formData.description_en,
        description_fr: formData.description_fr,
        category_en: formData.category_en,
        category_fr: formData.category_fr,
        province_en: formData.province_en,
        province_fr: formData.province_fr,
        city: formData.city,
        address: formData.address,
        products: formData.products.split(',').map(p => p.trim()).filter(p => p.length > 0),
        services: formData.services.split(',').map(s => s.trim()).filter(s => s.length > 0),
        website: formData.website || null,
        phone: formData.phone || null,
        email: formData.email || null,
        image_url: finalImageUrl || null
      };

      // Update the business
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updatedData)
        .eq('id', business.id)
        .select()
        .single();

      if (updateError) throw updateError;

      onSave();
    } catch (err) {
      console.error('Error updating business:', err);
      setError(err instanceof Error ? err.message : translations.errors.generic[language]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // **1️⃣ Show the new image preview before uploading**
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image_url: previewUrl }));
  
    try {
      // **2️⃣ Upload to Supabase**
      const fileExt = file.name.split('.').pop();
      const fileName = `${business.id}_${Date.now()}.${fileExt}`;
      const filePath = `business_images/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      // **3️⃣ Retrieve the public URL from Supabase**
      const { data } = supabase.storage.from('business-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
  
      if (!publicUrl) throw new Error('Failed to retrieve image URL.');
  
      // **4️⃣ Update formData with the real public URL**
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
  
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(language === 'en' 
        ? 'Error uploading image. Please try again.' 
        : "Erreur lors du téléchargement de l'image. Veuillez réessayer."
      );
    }
  };
  

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const foundCode = Object.entries(PROVINCES).find(
      ([, names]) => names[language] === selectedName
    )?.[0] as ProvinceCode | undefined;

    if (foundCode) {
      setFormData(prev => ({
        ...prev,
        province_en: PROVINCES[foundCode].en,
        province_fr: PROVINCES[foundCode].fr
      }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value as keyof typeof translations.categories;
    setFormData(prev => ({
      ...prev,
      category_en: translations.categories[selectedCategory].en,
      category_fr: translations.categories[selectedCategory].fr
    }));
  };

  if (isOwner === null) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">
            {language === 'en'
              ? 'You do not have permission to edit this business'
              : 'Vous n\'avez pas la permission de modifier cette entreprise'}
          </p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {translations.common.back[language]}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {translations.editBusiness.title[language]}
      </h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.businessName[language]} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.descriptionEn[language]}
          </label>
          <textarea
            value={formData.description_en}
            onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.descriptionFr[language]}
          </label>
          <textarea
            value={formData.description_fr}
            onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.category[language]} *
          </label>
          <select
            value={language === 'en' ? formData.category_en : formData.category_fr}
            onChange={handleCategoryChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          >
            <option value="">{translations.register.selectCategory[language]}</option>
            {Object.keys(translations.categories).map(category => (
              <option key={category} value={category}>
                {translations.categories[category as keyof typeof translations.categories][language]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.province[language]} *
          </label>
          <select
            value={language === 'en' ? formData.province_en : formData.province_fr}
            onChange={handleProvinceChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
          >
            {Object.entries(PROVINCES).map(([code, names]) => (
              <option key={code} value={names[language]}>
                {names[language]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.city[language]} *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.address[language]} *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.products[language]}
          </label>
          <input
            type="text"
            value={formData.products}
            onChange={(e) => setFormData(prev => ({ ...prev, products: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            placeholder={translations.register.productsPlaceholder[language]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.services[language]}
          </label>
          <input
            type="text"
            value={formData.services}
            onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            placeholder={translations.register.servicesPlaceholder[language]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.website[language]}
          </label>
          <input
            type="text"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            placeholder={translations.register.websitePlaceholder[language]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.phone[language]}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            placeholder={translations.register.phonePlaceholder[language]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {translations.register.email[language]}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            placeholder={translations.contact.emailPlaceholder[language]}
          />
        </div>

        <div>
  <label className="block text-sm font-medium text-gray-700">
    {language === 'en' ? 'Business Image' : "Image de l'entreprise"}
  </label>
  
  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
  />
  
  {formData.image_url && (
    <img 
      src={formData.image_url} 
      alt="Business" 
      className="mt-2 h-32 w-32 object-cover rounded-lg"
    />
  )}
</div>


        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {translations.common.cancel[language]}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? translations.common.processing[language] : translations.common.save[language]}
          </button>
        </div>
      </form>
    </div>
  );
}
