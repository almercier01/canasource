import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Phone, Globe, Tag, ArrowLeft, Mail } from 'lucide-react';
import { PROVINCES, ProvinceCode, Category, Language, CATEGORIES } from '../types';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabaseClient';
import { Loader } from '@googlemaps/js-api-loader';
import { CityAutocomplete } from './CityAutocomplete';
import { ImageUpload } from './ImageUpload';
import { Boutique } from './boutique/Boutique';

interface RegisterFormProps {
  onCancel: () => void;
  language: Language;
  handleNavigate: (page: 'home' | 'about' | 'contact' | 'create-boutique') => void;
}

export function RegisterForm({ onCancel, language, handleNavigate }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    // We'll let the user fill only one of these,
    // depending on their UI language. The other is hidden in the form.
    description_en: '',
    description_fr: '',
    category: '' as Category,
    province: '' as ProvinceCode, // ✅ use ProvinceCode instead of Province
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
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geocoding'],
    });

    const google = await loader.load();
    const geocoder = new google.maps.Geocoder();

    // Use the English province name for consistent geocoding requests
    const provinceName = PROVINCES[provinceCode].en;
    const fullAddress = `${address}, ${city}, ${provinceName}, Canada`;

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const provinceComponent = results[0].address_components.find((component) =>
            component.types.includes('administrative_area_level_1')
          );

          if (
            provinceComponent &&
            provinceComponent.long_name.toLowerCase().includes(provinceName.toLowerCase())
          ) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            });
          } else {
            // Retry with stricter component restrictions
            geocoder.geocode(
              {
                address: `${address}, ${city}`,
                componentRestrictions: {
                  country: 'CA',
                  administrativeArea: provinceName, // ✅ Use English province name here
                },
              },
              (restrictedResults, restrictedStatus) => {
                if (
                  restrictedStatus === 'OK' &&
                  restrictedResults &&
                  restrictedResults[0]
                ) {
                  resolve({
                    lat: restrictedResults[0].geometry.location.lat(),
                    lng: restrictedResults[0].geometry.location.lng(),
                  });
                } else {
                  reject(
                    new Error(
                      language === 'en'
                        ? 'Could not find coordinates for the provided location'
                        : "Impossible de trouver les coordonnées pour l'emplacement fourni"
                    )
                  );
                }
              }
            );
          }
        } else {
          reject(
            new Error(
              language === 'en'
                ? 'Could not find coordinates for the provided location'
                : "Impossible de trouver les coordonnées pour l'emplacement fourni"
            )
          );
        }
      });
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check auth again
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(translations.auth.signInRequired[language]);
      }

      if (!formData.address.trim()) {
        throw new Error(translations.errors.addressRequired[language]);
      }

      // Validate website if provided
      let validatedWebsite = '';
      if (formData.website) {
        validatedWebsite = validateWebsite(formData.website);
      }

      // Get lat/lng
      const coordinates = await getCoordinates(formData.address, formData.city, formData.province);
      if (!coordinates.lat || !coordinates.lng) {
        throw new Error('Location coordinates could not be determined.');
      }

      // Because we only show one description field
      // (based on the user's UI language),
      // we copy the user-provided text into *both* columns for now.
      let finalDescriptionEn = '';
      let finalDescriptionFr = '';
      if (language === 'en') {
        finalDescriptionEn = formData.description_en;
        finalDescriptionFr = formData.description_en; // Duplicate for French
      } else {
        finalDescriptionFr = formData.description_fr;
        finalDescriptionEn = formData.description_fr; // Duplicate for English
      }

      // Check if the user actually uploaded a custom image
      const hasCustomImage = !!formData.image_url;

      // Build the data for the new business
      // If no custom image was uploaded, we do *not* set image_status, 
      // so the listing uses the fallback in your front-end.
      const businessData: any = {
        name: formData.name,
        description_en: finalDescriptionEn,
        description_fr: finalDescriptionFr,
        category: formData.category,
        province: PROVINCES[formData.province].en, // ✅ store English province name in DB
        city: formData.city,
        address: formData.address,
        products: formData.products
          ? JSON.stringify(formData.products.split(',').map((p) => p.trim()))
          : '{}',
        services: formData.services
          ? JSON.stringify(formData.services.split(',').map((s) => s.trim()))
          : '{}',
        website: validatedWebsite || null,
        phone: formData.phone,
        email: formData.email || user.email,
        lat: coordinates.lat,
        lng: coordinates.lng,
        owner_id: user.id,
      };

      if (hasCustomImage) {
        // If user uploaded a custom image, store it + set status = pending
        businessData.image_url = formData.image_url;
        businessData.image_status = 'pending';
      } else {
        // No custom image -> fallback in front-end
        businessData.image_url =
          'https://images.unsplash.com/photo-1516216628859-9bccecab13ca?auto=format&fit=crop&q=80&w=800';
      }

      console.log('Business Data Being Sent:', businessData);

      const { error: insertError } = await supabase
        .from('businesses')
        .insert([businessData]);

      if (insertError) throw insertError;

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        description_en: '',
        description_fr: '',
        category: '' as Category,
        province: '' as ProvinceCode, // ✅ use ProvinceCode instead of Province
        city: '',
        address: '',
        products: '',
        services: '',
        website: '',
        phone: '',
        email: userEmail || '',
        image_url: '',
      });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : translations.errors.generic[language]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{translations.auth.signInRequired[language]}</p>
          <button
            onClick={onCancel}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            {translations.nav.backToHome[language]}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {showBoutique ? (
        <Boutique
          language={language}
          onClose={() => setShowBoutique(false)}
          handleNavigate={handleNavigate}
        />
      ) : (
        <div>
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-green-700">
                {translations.register.success[language]}
              </p>
              <button
                onClick={() => setShowBoutique(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                {language === 'en'
                  ? 'Create Your Boutique Now'
                  : 'Créer votre boutique maintenant'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* The main form fields go here */}
            </form>
          )}
        </div>
      )}

      {/* Back to Home button */}
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-red-600"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {translations.nav.backToHome[language]}
        </button>
      </div>

      {/* Actual Form UI */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {translations.register.title[language]}
        </h2>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-700">
              {translations.register.success[language]}
            </p>
            <button
              onClick={onCancel}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              {translations.nav.backToHome[language]}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display errors if any */}
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
              <div className="mt-1 relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={translations.register.businessNamePlaceholder[language]}
                />
              </div>
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

            {/* Description fields */}
            {language === 'en' && (
              <div>
                <label htmlFor="description_en" className="block text-sm font-medium text-gray-700">
                  {translations.register.descriptionEn[language]} *
                </label>
                <textarea
                  id="description_en"
                  required
                  value={formData.description_en}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description_en: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={translations.register.descriptionPlaceholder[language]}
                />
              </div>
            )}

            {language === 'fr' && (
              <div>
                <label htmlFor="description_fr" className="block text-sm font-medium text-gray-700">
                  {translations.register.descriptionFr[language]} *
                </label>
                <textarea
                  id="description_fr"
                  required
                  value={formData.description_fr}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description_fr: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={translations.register.descriptionPlaceholder[language]}
                />
              </div>
            )}

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                {translations.register.category[language]} *
              </label>
              <div className="mt-1 relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value as Category }))
                  }
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">{translations.register.selectCategory[language]}</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {/* Show the category name in the current UI language */}
                      {translations.categories[category][language]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Province & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                {translations.register.address[language]} *
              </label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={translations.register.addressPlaceholder[language]}
                />
              </div>
            </div>

            {/* Products & Services */}
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

            {/* Website & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  {translations.register.website[language]}
                </label>
                <div className="mt-1 relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder={translations.register.websitePlaceholder[language]}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {translations.register.phone[language]}
                </label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder={translations.register.phonePlaceholder[language]}
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {language === 'en' ? 'Business Image' : "Image de l'entreprise"}
              </label>
              <p className="text-sm text-gray-500 mb-2">
                {language === 'en'
                  ? 'Upload a high-quality image that represents your business. The image will be reviewed before being displayed.'
                  : "Téléchargez une image de haute qualité qui représente votre entreprise. L'image sera examinée avant d'être affichée."}
              </p>

              <ImageUpload
                language={language}
                onImageSelect={async (file) => {
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                    const filePath = `business_images/${fileName}`;

                    // Upload to Supabase Storage
                    const { error: uploadError } = await supabase.storage
                      .from('business-images')
                      .upload(filePath, file);
                    if (uploadError) throw uploadError;

                    // Get the public URL
                    const {
                      data: { publicUrl },
                    } = supabase.storage.from('business-images').getPublicUrl(filePath);

                    // Mark as pending in the form data
                    setFormData((prev) => ({
                      ...prev,
                      image_url: publicUrl,
                    }));

                    // Send notification to Admin only if we found a userId
                    if (!userId) {
                      console.error('❌ Error: User ID not found, cannot send admin notification');
                      return;
                    }

                    // await supabase.from('notifications').insert([
                    //   {
                    //     user_id: "f31ed8f3-d475-46ed-ba8f-c4661f98f79f", // or however you track the admin
                    //     title: 'Image Review Required',
                    //     message: `New image uploaded for business "${formData.name}". Please review.`,
                    //   },
                    // ]);


                    await supabase.from('notifications').insert([
                      {
                        title: 'Image Review Required',
                        type: 'image_review',
                        message: `New image uploaded for business "${formData.name}". Please review.`,
                        image_url: publicUrl,
                        status: 'pending',
                        user_id: "f31ed8f3-d475-46ed-ba8f-c4661f98f79f",
                        created_at: new Date().toISOString(),
                      },
                    ]);
                  } catch (err) {
                    console.error('Error uploading image:', err);
                    setError(
                      language === 'en'
                        ? 'Error uploading image. Please try again.'
                        : "Erreur lors du téléchargement de l'image. Veuillez réessayer.",
                    );
                  }
                }}
              />
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {translations.common.cancel[language]}
              </button>
              <button
                type="submit"
                disabled={loading || !cityValid}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading
                  ? translations.common.processing[language]
                  : translations.register.submit[language]}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
