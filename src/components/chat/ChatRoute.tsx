// components/chat/ChatRoute.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Chat } from './Chat';
import { Language } from '../../types';

interface ChatRouteProps {
  language: Language;
}

export function ChatRoute({ language }: ChatRouteProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const [businessName, setBusinessName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Try to get businessName from location.state
    if (location.state && (location.state as any).businessName) {
      setBusinessName((location.state as any).businessName);
      setLoading(false);
      return;
    }

    const fetchBusinessName = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_rooms_with_details')
        .select('business_name')
        .eq('id', roomId)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else {
        setBusinessName(data?.business_name || '');
      }
      setLoading(false);
    };

    fetchBusinessName();
  }, [roomId, location.state]);

  if (!roomId) return null;
  if (loading) return <div className="p-4 text-center">{language === 'en' ? 'Loading chat...' : 'Chargement du chat...'}</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return <Chat roomId={roomId} businessName={businessName} language={language} />;
}
