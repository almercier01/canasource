import React, { useState, useEffect } from 'react';
import { PlusCircle, Store, Loader2, Eye, ArrowRight } from 'lucide-react';
import { translations } from '../../i18n/translations';
import { Language } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface BoutiqueProps {
  language: Language;
  onClose: () => void;
  handleNavigate: (page: 'home' | 'about' | 'contact' | 'create-boutique') => void;
}

interface Boutique {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function Boutique({ language, onClose, handleNavigate }: BoutiqueProps) {
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchBoutique();
  }, []);

  const fetchBoutique = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data, error } = await supabase
        .from('boutiques')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();  // ✅ Fix: Avoids error if table is empty
  
      if (error) throw error;
      setBoutique(data ?? null);  // ✅ Handle empty result
  
    } catch (error) {
      console.error(translations.error.fetchingBoutique[language], error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCreateBoutique = async () => {
    setError(null);
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        throw new Error(translations.error.authRequired[language]);
      }

      const userId = userData.user.id;

      const { error } = await supabase.from('boutiques').insert([
        {
          name: translations.boutique.newName[language],
          description: translations.boutique.newDescription[language],
          owner_id: userId,
          status: 'pending',
        }
      ]);

      if (error) throw error;

      fetchBoutique();
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating boutique:', err);
      setError(translations.error.creatingBoutique[language]);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Store className="w-6 h-6 mr-2" />
          {translations.boutique.title[language]}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : error ? (
        <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      ) : boutique ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800">{boutique.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{boutique.description}</p>
          <span className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${
            boutique.status === 'approved' ? 'bg-green-100 text-green-700' :
            boutique.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {translations.boutique.status[boutique.status][language]}
          </span>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-gray-600">{translations.boutique.noBoutique[language]}</p>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {translations.boutique.create[language]}
          </button>
          {showCreateForm && (
            <button 
              onClick={handleCreateBoutique} 
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
            >
              <Eye className="w-5 h-5 mr-2" />
              {translations.boutique.confirmCreate[language]}
            </button>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-gray-600">{translations.boutique.createLater[language]}</p>
        <button 
          onClick={() => handleNavigate('create-boutique')} 
          className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          {translations.boutique.createNow[language]}
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
