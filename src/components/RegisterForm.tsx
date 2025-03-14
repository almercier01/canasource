import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Phone, Globe, Tag, ArrowLeft, Mail } from 'lucide-react';
import { PROVINCES, ProvinceCode, Category, Language, CATEGORIES } from '../types';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabaseClient';
import { CityAutocomplete } from './CityAutocomplete';
import { ImageUpload } from './ImageUpload';
import { Boutique } from './boutique/Boutique';
import { loadGoogleMapsLibrary } from '../lib/googleMapsLoader';
import { useNavigate } from 'react-router-dom';


interface RegisterFormProps {
  onCancel: () => void;
  language: Language;
  handleNavigate: (page: 'home' | 'about' | 'contact' | 'create-boutique') => void;
}

export function RegisterForm({ onCancel, language, handleNavigate }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description_en: '',
    description_fr: '',
    category: '' as Category,  // Store the main category value
    category_en: '',           // Add category_en
    category_fr: '',           // Add category_fr
    province: '' as ProvinceCode,
    province_en: '',           // Add province_en
    province_fr: '',           // Add province_fr
    city: '',
    address: '',
    products: '',
    services: '',
    website: '',
    phone: '',
    email: '',
    image_url: '',
  });


  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cityValid, setCityValid] = useState(true);
  const [showBoutique, setShowBoutique] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setIsAuthenticated(false);
        setError(translations.auth.signInRequired[language]);
        return;
      }
      setIsAuthenticated(true);
      const userEmail = data.user.email ?? '';
      setUserEmail(userEmail);
      setUserId(data.user.id);

      // Pre-fill form email with the user’s email
      setFormData((prev) => ({ ...prev, email: userEmail }));
    } catch (err) {
      console.error('Error checking authentication:', err);
      setError(translations.auth.signInRequired[language]);
    }
  };

  const validateWebsite = (url: string): string => {
    if (!url) return url;
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (!url.startsWith('www.')) {
        url = 'www.' + url;
      }
      url = 'https://' + url;
    }
    // Validate
    new URL(url); // throws if invalid
    return url;
  };

  const getCoordinates = async (
    address: string,
    city: string,
    provinceCode: ProvinceCode
  ): Promise<{ lat: number; lng: number }> => {
    const { Geocoder } = (await loadGoogleMapsLibrary('geocoding')) as google.maps.GeocodingLibrary;
    const geocoder = new Geocoder();

    const provinceName = PROVINCES[provinceCode].en;
    const fullAddress = `${address}, ${city}, ${provinceName}, Canada`;

    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { address: fullAddress },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            });
          } else {
            reject(new Error('Could not find coordinates for the provided location.'));
          }
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(translations.auth.signInRequired[language]);
      }
  
      // Check if user already has a business
      const { data: existingBusiness, error: checkError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();
  
      if (checkError) {
        throw checkError;
      }
  
      if (existingBusiness) {
        throw new Error(language === 'en' 
          ? "You already have a business listing." 
          : "Vous avez déjà une annonce d'entreprise."
        );
      }
  
      // Transform products and services from comma-separated strings to arrays
      const products = formData.products
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
  
      const services = formData.services
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
  
      // Prepare the business data
      const businessData = {
        name: formData.name,
        description_en: formData.description_en,
        description_fr: formData.description_fr,
        category_en: translations.categories[formData.category].en,
        category_fr: translations.categories[formData.category].fr,
        province_en: PROVINCES[formData.province].en,
        province_fr: PROVINCES[formData.province].fr,
        city: formData.city,
        address: formData.address,
        website: formData.website || null,
        phone: formData.phone || null,
        email: formData.email || user.email,
        owner_id: user.id,
        products,
        services,
        image_url: formData.image_url || null,
        image_status: formData.image_url ? 'pending' : null
      };
  
      // Insert the business
      const { data: newBusiness, error: insertError } = await supabase
        .from('businesses')
        .insert([businessData])
        .select('id')
        .single();
  
      if (insertError) {
        console.error('Error creating business:', insertError);
        throw insertError;
      }
  
      if (!newBusiness?.id) {
        throw new Error('Failed to create business');
      }
  
      console.log("New business created with ID:", newBusiness.id);
      console.log("Checking businesses for owner:", user.id);
  
      // Verify the business was created
      const { data: verifyBusiness, error: verifyError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();
  
      console.log("Business Query Response:", verifyBusiness);
      console.log("Business Query Error:", verifyError);
  
      if (verifyError) {
        console.error('Error verifying business creation:', verifyError);
      }
  
      setBusinessId(newBusiness.id);
      setSuccess(true);
  
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : translations.errors.generic[language]);
    } finally {
      setLoading(false);
    }
  };
  



  const activateBoutique = async () => {
    if (!businessId || !userId) return;
  
    try {
        // Step 1: Check if a boutique already exists for this owner
        const { data: existingBoutique, error: checkError } = await supabase
            .from('boutiques')
            .select('id')
            .eq('owner_id', userId) // ✅ Fix: Querying with owner_id
            .maybeSingle(); 

        if (checkError) throw checkError;

        if (!existingBoutique) {
            console.log('No existing boutique found, creating one...');

            // Step 2: Fetch the business name to use for the boutique
            const { data: businessData, error: businessError } = await supabase
                .from('businesses')
                .select('name')
                .eq('id', businessId)
                .single();

            if (businessError || !businessData?.name) {
                throw new Error('Failed to retrieve business name.');
            }

            // Step 3: Create a new boutique with a valid name
            const { error: insertError } = await supabase
                .from('boutiques')
                .insert([
                    { 
                        owner_id: userId, 
                        name: businessData.name, // ✅ Provide a valid name
                        status: 'active' 
                    }
                ]);

            if (insertError) throw insertError;

            console.log('New boutique created successfully.');
        }

        // Step 4: Update the boutique status (if needed)
        const { error: updateError } = await supabase
            .from('boutiques')
            .update({ status: 'active' })
            .eq('owner_id', userId);

        if (updateError) throw updateError;

        alert(language === 'en' ? 'Boutique activated! Start adding products.' : 'Boutique activée! Commencez à ajouter des produits.');
        navigate(`/add-products/${businessId}`);
    } catch (error) {
        console.error('Error activating boutique:', error);
    }
};





  if (showBoutique) {
    return <Boutique language={language} onClose={() => setShowBoutique(false)} handleNavigate={handleNavigate} />;
  }

  return success ? (
    // ✅ Success State: Only Show Buttons, Hide Form & Back Button
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
        <p className="text-green-700 text-lg font-semibold">{translations.register.success[language]}</p>
        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 justify-center">
          <button
            onClick={activateBoutique}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {language === 'en' ? 'Activate Boutique' : 'Activer la Boutique'}
          </button>

          <button
            onClick={onCancel}
            className="mt-4 sm:mt-0 px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition"
          >
            {language === 'en' ? 'Create Later' : 'Créer plus tard'}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Actual Form UI */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {translations.register.title[language]}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {translations.register.businessName[language]} *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder={translations.register.businessNamePlaceholder[language]}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {translations.contact.email[language]}
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder={
                  userEmail || translations.contact.emailPlaceholder[language]
                }
              />
              {userEmail && (
                <p className="mt-1 text-sm text-gray-500">
                  {language === 'en'
                    ? 'Leave empty to use your account email'
                    : "Laissez vide pour utiliser l'email de votre compte"}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description_en" className="block text-sm font-medium text-gray-700">
              {translations.register.descriptionEn[language]} *
            </label>
            <textarea
              id="description_en"
              required
              value={formData.description_en}
              onChange={(e) => setFormData((prev) => ({ ...prev, description_en: e.target.value }))}
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder={translations.register.descriptionPlaceholder[language]}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              {translations.register.category[language]} *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value as Category }))
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">{translations.register.selectCategory[language]}</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {translations.categories[category][language]}
                </option>
              ))}
            </select>
          </div>

          {/* Province */}
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
              {translations.register.province[language]} *
            </label>
            <select
              id="province"
              required
              value={formData.province}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, province: e.target.value as ProvinceCode }))
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="">{translations.register.selectProvince[language]}</option>
              {Object.entries(PROVINCES).map(([code, { en, fr }]) => (
                <option key={code} value={code}>
                  {language === 'en' ? en : fr}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              {translations.register.city[language]} *
            </label>
            <CityAutocomplete
              province={formData.province}
              value={formData.city}
              onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
              language={language}
              onValidityChange={setCityValid}
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              {translations.register.address[language]} *
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder={translations.register.addressPlaceholder[language]}
            />
          </div>

          {/* Products */}
          <div>
            <label htmlFor="products" className="block text-sm font-medium text-gray-700">
              {translations.register.products[language]}
            </label>
            <input
              type="text"
              id="products"
              value={formData.products}
              onChange={(e) => setFormData((prev) => ({ ...prev, products: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder={translations.register.productsPlaceholder[language]}
            />
          </div>

          {/* Services */}
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700">
              {translations.register.services[language]}
            </label>
            <input
              type="text"
              id="services"
              value={formData.services}
              onChange={(e) => setFormData((prev) => ({ ...prev, services: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder={translations.register.servicesPlaceholder[language]}
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              {translations.register.website[language]}
            </label>
            <input
              type="text"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder={translations.register.websitePlaceholder[language]}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {translations.register.phone[language]}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder={translations.register.phonePlaceholder[language]}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {language === 'en' ? 'Business Image' : "Image de l'entreprise"}
            </label>
            <ImageUpload
              language={language}
              onImageSelect={async (file) => {
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                  const filePath = `business_images/${fileName}`;

                  const { error: uploadError } = await supabase.storage
                    .from('business-images')
                    .upload(filePath, file);
                  if (uploadError) throw uploadError;

                  const { data: { publicUrl } } = supabase.storage.from('business-images').getPublicUrl(filePath);
                  setFormData((prev) => ({ ...prev, image_url: publicUrl }));
                } catch (err) {
                  setError(language === 'en' ? 'Error uploading image. Please try again.' : "Erreur lors du téléchargement de l'image.");
                }
              }}
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {translations.common.cancel[language]}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              {loading ? translations.common.processing[language] : translations.register.submit[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
