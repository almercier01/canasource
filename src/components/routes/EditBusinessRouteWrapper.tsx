// src/routes/EditBusinessRouteWrapper.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { EditBusinessForm } from '../EditBusinessForm';
import { Language } from '../../types';

interface WrapperProps {
  language: Language;
  onCancel: () => void;
  onSave: () => void;
}

export function EditBusinessRouteWrapper({ language, onCancel, onSave }: WrapperProps) {
  const [searchParams] = useSearchParams();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const businessId = searchParams.get('id');

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!businessId) return;

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error || !data) {
        console.error('Business not found:', error);
        navigate('/');
        return;
      }

      setBusiness(data);
      setLoading(false);
    };

    fetchBusiness();
  }, [businessId]);

  if (loading || !business) {
    return <div className="text-center p-8 text-gray-500">Loading business data...</div>;
  }

  return (
    <EditBusinessForm
      business={business}
      language={language}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}
