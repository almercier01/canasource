import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../boutique/ProductForm';

interface ListingProps {
    language: Language;
    businessId: string;
}

export function Listing({ language, businessId }: ListingProps) {
    const [business, setBusiness] = useState<any>(null);
    const [boutique, setBoutique] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showProductForm, setShowProductForm] = useState(false);
    const navigate = useNavigate();
    const [isOwner, setIsOwner] = useState(false); // New state


    useEffect(() => {
        fetchListingData();
    }, []);

    const fetchListingData = async () => {
        try {
            console.log("Fetching listing data...");

            // Fetch authenticated user
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error('Error fetching user:', authError);
                return;
            }
            console.log("User ID:", user.id);

            // Fetch business details using businessId
            const { data: businessData, error: businessError } = await supabase
                .from('businesses')
                .select('*')
                .eq('id', businessId)
                .single();

            if (businessError) throw businessError;
            console.log("Fetched business:", businessData);
            setBusiness(businessData);

            // Fetch boutique details using owner_id
            const { data: boutiqueData, error: boutiqueError } = await supabase
                .from('boutiques')
                .select('*')
                .eq('owner_id', user.id) // ✅ Fetching boutique using owner_id
                .maybeSingle(); // Avoids errors when no boutique is found

            if (boutiqueError && boutiqueError.code !== 'PGRST116') throw boutiqueError;

            console.log("Fetched boutique:", boutiqueData);

            setBoutique(boutiqueData);

            // ✅ Check Ownership
            if (boutiqueData && boutiqueData.owner_id === user.id) {
                console.log("User is the owner.");
                setIsOwner(true);
            } else {
                console.log("User is NOT the owner.");
                setIsOwner(false);
            }

        } catch (err) {
            console.error('Error fetching listing data:', err);
        } finally {
            setLoading(false);
        }
    };





    const activateBoutique = async () => {
        try {
            if (!boutique) return;

            const { error } = await supabase
                .from('boutiques')
                .update({ status: 'active' })
                .eq('id', boutique.id);

            if (error) throw error;

            alert(language === 'en' ? 'Boutique activated! You can now add products.' : 'Boutique activée ! Vous pouvez maintenant ajouter des produits.');
            fetchListingData(); // Refresh boutique data
        } catch (err) {
            console.error('Error activating boutique:', err);
        }
    };


    const createBoutique = async () => {
        try {
            // Check if user is authenticated
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.error('Error fetching user:', authError);
                alert(language === 'en'
                    ? 'You must be logged in to create a boutique.'
                    : 'Vous devez être connecté pour créer une boutique.');
                return;
            }

            // ✅ Check if the user already has a boutique
            const { data: existingBoutique, error: fetchError } = await supabase
                .from('boutiques')
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle(); // Ensures we don't throw an error if there's no boutique

            if (fetchError) throw fetchError;
            if (existingBoutique) {
                alert(language === 'en'
                    ? 'You already have a boutique. Please manage your existing boutique.'
                    : 'Vous avez déjà une boutique. Veuillez gérer votre boutique existante.');
                return;
            }

            // ✅ Create the boutique
            const { data, error } = await supabase
                .from('boutiques')
                .insert({
                    owner_id: user.id,
                    name: language === 'en' ? 'My Boutique' : 'Ma Boutique',
                    description: language === 'en'
                        ? 'A new boutique ready to be customized'
                        : 'Une nouvelle boutique prête à être personnalisée',
                    status: 'pending',
                    avg_rating: 0,
                    review_count: 0,
                    favorite_count: 0
                })
                .select()
                .single();

            if (error) throw error;

            // ✅ Success - Notify & Refresh
            alert(language === 'en'
                ? 'Boutique created successfully! You can now customize it.'
                : 'Boutique créée avec succès ! Vous pouvez maintenant la personnaliser.');

            if (typeof fetchListingData === 'function') {
                fetchListingData();
            }

            return data;
        } catch (err) {
            console.error('Error creating boutique:', err);
            alert(err instanceof Error ? err.message : language === 'en'
                ? 'An error occurred while creating the boutique.'
                : 'Une erreur est survenue lors de la création de la boutique.');
        }
    };




    if (loading) return <p>{language === 'en' ? 'Loading...' : 'Chargement...'}</p>;

    console.log('Rendering Listing:', { boutique, isOwner });

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">{business?.name}</h2>

            {boutique ? (
                boutique.status === 'active' ? (
                    <>
                        <p className="text-green-600">{language === 'en' ? 'Boutique is Active' : 'La boutique est active'}</p>
                        <button
                            onClick={() => setShowProductForm(true)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                            {language === 'en' ? 'Add Products' : 'Ajouter des produits'}
                        </button>

                        {showProductForm && (
                            <ProductForm
                                language={language}
                                businessId={businessId}
                                boutiqueId={boutique?.id} // <-- Pass the boutique id here!
                                onProductAdded={() => {
                                    setShowProductForm(false);
                                    fetchListingData();
                                }}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-orange-600">{language === 'en' ? 'Boutique is inactive' : 'La boutique est inactive'}</p>
                        {isOwner && (
                            <button
                                onClick={activateBoutique}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
                            >
                                {language === 'en' ? 'Activate Boutique' : 'Activer la boutique'}
                            </button>
                        )}
                    </>
                )
            ) : (
                <>
                    {isOwner ? (
                        <>
                            <p className="text-gray-600">{language === 'en' ? 'No boutique found' : 'Aucune boutique trouvée'}</p>
                            <button
                                onClick={createBoutique}
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
                            >
                                {language === 'en' ? 'Create Boutique' : 'Créer une boutique'}
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-500 italic">
                            {language === 'en'
                                ? 'This business has no boutique yet.'
                                : 'Cette entreprise n’a pas encore de boutique.'}
                        </p>
                    )}
                </>
            )}
        </div>
    );


}
