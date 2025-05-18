import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { ImageUpload } from '../ImageUpload';
import { translations } from '../../i18n/translations';

interface ProductFormProps {
    language: Language;
    businessId: string; // Used to fetch boutique_id
    boutiqueId?: string;  // ✅ Make boutiqueId optional, so we can fetch it if missing
    onProductAdded: () => void;
}

export function ProductForm({ language, businessId, onProductAdded }: ProductFormProps) {
    const [boutiqueId, setBoutiqueId] = useState<string | null>(null);
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        currency: 'CAD',  // ✅ Ensure currency is included
        image_url: '',
      });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [resolvedBoutiqueId, setResolvedBoutiqueId] = useState<string | null>(boutiqueId || null);

    useEffect(() => {
        const fetchBoutique = async () => {
            if (!resolvedBoutiqueId) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: boutique, error: boutiqueError } = await supabase
                    .from('boutiques')
                    .select('id')
                    .eq('owner_id', user.id)
                    .maybeSingle();

                if (boutiqueError) {
                    setError(language === 'en' ? 'Error fetching boutique.' : 'Erreur lors de la récupération de la boutique.');
                    return;
                }
                if (boutique) {
                    setResolvedBoutiqueId(boutique.id);
                } else {
                    setError(language === 'en' ? 'No active boutique found.' : 'Aucune boutique active trouvée.');
                }
            }
        };

        fetchBoutique();
    }, [resolvedBoutiqueId]);

    console.log("boutique id before submiting",resolvedBoutiqueId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
      
        if (!resolvedBoutiqueId) {
          setError(language === 'en' ? 'Boutique ID not found.' : "ID de la boutique introuvable.");
          setLoading(false);
          return;
        }
      
        console.log("Submitting product with boutique_id:", resolvedBoutiqueId); // ✅ Debugging
      
        try {
          const { error } = await supabase.from('boutique_products').insert([
            {
              name: productData.name,
              description: productData.description,
              price: parseFloat(productData.price) || 0,  // ✅ Ensure price is a valid number
              stock: parseInt(productData.stock) || 0,  // ✅ Ensure stock is a valid integer
              currency: "CAD",  // ✅ Ensure currency is set
              image_url: productData.image_url || null,  // ✅ Handle missing images
              boutique_id: resolvedBoutiqueId,
              status: 'active',
              created_at: new Date().toISOString(),
            },
          ]);
      
          if (error) throw error;
      
          alert(language === 'en' ? 'Product added successfully!' : 'Produit ajouté avec succès!');
          setProductData({
            name: '',
            description: '',
            price: '',
            stock: '',
            currency: 'CAD',  // ✅ Must be included to match the type definition
            image_url: '',
          });
          onProductAdded();
        } catch (err) {
          console.error("Product insert error:", err);
          let errorMsg = '';
          if (err instanceof Error) {
            errorMsg = err.message;
          } else if (typeof err === 'string') {
            errorMsg = err;
          } else {
            errorMsg = JSON.stringify(err);
          }
          setError(
            language === 'en'
              ? `Error adding product: ${errorMsg}`
              : `Erreur lors de l'ajout du produit: ${errorMsg}`
          );
        } finally {
          setLoading(false);
        }
      };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'Add Products' : 'Ajouter des produits'}
            </h2>

            {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{language === 'en' ? 'Product Name' : 'Nom du produit'} *</label>
                    <input
                        type="text"
                        value={productData.name}
                        onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                        required
                        className="w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">{language === 'en' ? 'Description' : 'Description'} *</label>
                    <textarea
                        value={productData.description}
                        onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                        required
                        className="w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">{language === 'en' ? 'Price' : 'Prix'} *</label>
                    <input
                        type="number"
                        value={productData.price}
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                        required
                        className="w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">{language === 'en' ? 'Stock Quantity' : 'Quantité en stock'} *</label>
                    <input
                        type="number"
                        value={productData.stock}
                        onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                        required
                        className="w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">{language === 'en' ? 'Currency' : 'Devise'} *</label>
                    <select
                        value={productData.currency}
                        onChange={(e) => setProductData({ ...productData, currency: e.target.value })}
                        required
                        className="w-full border rounded-md p-2"
                    >
                        <option value="CAD">CAD (Canadian Dollar)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">{language === 'en' ? 'Product Images' : 'Images du produit'}</label>
                    <ImageUpload
  language={language}
  onImageSelect={async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images') // Use product-images bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // ✅ Get public URL after upload
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);

      setProductData((prev) => ({ ...prev, image_url: publicUrl })); // Save the image URL in form data
    } catch (err) {
      setError(language === 'en' ? 'Error uploading image. Please try again.' : "Erreur lors du téléchargement de l'image.");
    }
  }}
/>



                </div>

                <div className="flex justify-between space-x-4">
    {!successMessage ? (
        <>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                {loading
                    ? (language === 'en' ? 'Adding...' : 'Ajout...')
                    : (language === 'en' ? 'Add' : 'Ajouter')}
            </button>
            <button
                type="button"
                onClick={onProductAdded}
                className="px-4 py-2 bg-gray-600 text-white rounded-md"
            >
                {language === 'en' ? 'Cancel' : 'Annuler'}
            </button>
        </>
    ) : (
        <>
            <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
                {language === 'en' ? 'Add Another' : 'Ajouter un autre'}
            </button>
            <button
                type="button"
                onClick={onProductAdded}
                className="px-4 py-2 bg-gray-600 text-white rounded-md"
            >
                {language === 'en' ? 'Finish' : 'Terminer'}
            </button>
        </>
    )}
</div>

            </form>
        </div>
    );
}
