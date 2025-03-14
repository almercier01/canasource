import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { ImageUpload } from '../ImageUpload';
import { translations } from '../../i18n/translations';

interface CreateBoutiqueFormProps {
  language: Language;
  onClose: () => void;
}

export function CreateBoutiqueForm({ language, onClose }: CreateBoutiqueFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserBusiness();
  }, []);

  const fetchUserBusiness = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Error fetching user:', authError);
        return;
      }
      setUserId(user.id); // ✅ Store userId in state
  
      // Fetch business owned by the user
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle(); // Prevents errors if no business is found
  
      if (error) {
        console.error('Error fetching business:', error);
        return;
      }
  
      if (!data) {
        console.log('No business found for this user.');
        return;
      }
  
      console.log('User Business Data:', data);
      setBusinessId(data.id); // ✅ Store businessId in state
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  if (!businessId) {
    setError(translations.errors.businessNotFound[language]);
    setLoading(false);
    return;
  }

  if (!userId) {
    setError(translations.errors.userNotFound[language]);
    setLoading(false);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('boutiques')
      .insert([
        {
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          business_id: businessId, // ✅ Now correctly set
          owner_id: userId, // ✅ Now correctly set
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error) throw error;

    alert(language === 'en' ? 'Boutique created successfully!' : 'Boutique créée avec succès!');
    onClose();
  } catch (err) {
    setError(translations.errors.generic[language]);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {language === 'en' ? 'Create Your Boutique' : 'Créer votre Boutique'}
      </h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'en' ? 'Boutique Name' : 'Nom de la boutique'} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'en' ? 'Description' : 'Description'} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'en' ? 'Boutique Image' : 'Image de la boutique'}
          </label>
          <ImageUpload
            language={language}
            onImageSelect={async (file) => {
              try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `boutique_images/${fileName}`;

                const { error: uploadError } = await supabase.storage
                  .from('boutique-images')
                  .upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('boutique-images').getPublicUrl(filePath);
                setFormData((prev) => ({ ...prev, image_url: publicUrl }));
              } catch (err) {
                setError(language === 'en' ? 'Error uploading image.' : 'Erreur de téléchargement.');
              }
            }}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">
            {language === 'en' ? 'Cancel' : 'Annuler'}
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            {loading ? 'Creating...' : language === 'en' ? 'Create Boutique' : 'Créer Boutique'}
          </button>
        </div>
      </form>
    </div>
  );
}
