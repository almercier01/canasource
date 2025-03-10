import React, { useState, useEffect } from 'react';
import { Store, Loader2 } from 'lucide-react';
import { translations } from '../../i18n/translations';
import { supabase } from '../../lib/supabaseClient';

interface BoutiqueProps {
  language: 'en' | 'fr';
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
  

  useEffect(() => {
    fetchBoutique();
  }, []);

  const fetchBoutique = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      // Fetch the first boutique for the user (ensures only one is returned)
      const { data, error } = await supabase
        .from('old_boutiques')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true }) // Ensures the oldest boutique is picked first
        .limit(1) // Limits the result to 1 row
        .single(); // Ensures exactly one row is returned
  
      if (error) throw error;
  
      setBoutique(data); // Set the single boutique
  
    } catch (error) {
      console.error(translations.errors.fetchingBoutique[language], error);
      setError(translations.errors.fetchingBoutique[language]);
    } finally {
      setLoading(false);
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
          <span className={`mt-2 inline-block px-3 py-1 text-sm rounded-full ${boutique.status === 'approved' ? 'bg-green-100 text-green-700' :
              boutique.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                boutique.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700' // Fallback
            }`}>
            {translations.boutique.status[boutique.status]?.[language] || translations.boutique.status.pending[language]}
          </span>
        </div>
      ) : (
        <p className="mt-4 text-gray-600">{translations.boutique.noBoutique[language]}</p>
      )}
    </div>
  );
}
