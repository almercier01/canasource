import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MessageSquare, Users, Loader2 } from 'lucide-react';
import { Language } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ConnectionFeedProps {
  language: Language;
}

interface ConnectionEntry {
  connection_id: string;
  business_id: string;
  business_name: string;
  business_city: string;
  province_en: string;
  province_fr: string;
  requester_id: string;
  requester_email: string;
  business_owner_id: string;
  room_id: string | null;
  created_at: string;
}

export function ConnectionFeed({ language }: ConnectionFeedProps) {
  const [connections, setConnections] = useState<ConnectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('accepted_connections_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setConnections(data || []);
    } else {
      console.error('Error fetching connections:', error);
    }
    setLoading(false);
  };

  const handleClick = (roomId: string | null, businessId: string) => {
    if (roomId) {
      navigate(`/chat/${roomId}`);
    } else {
      navigate(`/business/${businessId}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-red-600" />
        {language === 'en' ? 'Connection Feed' : 'Fil de Connexions'}
      </h2>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      ) : connections.length === 0 ? (
        <p className="text-sm text-gray-500">
          {language === 'en'
            ? 'No active connections yet.'
            : 'Aucune connexion active pour le moment.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {connections.map((conn) => (
            <li
              key={conn.connection_id}
              className="p-4 border rounded hover:shadow cursor-pointer"
              onClick={() => handleClick(conn.room_id, conn.business_id)}
            >
              <div className="text-sm text-gray-700 font-medium">
                {language === 'en'
                  ? `Inquiry about ${conn.business_name}`
                  : `Demande concernant ${conn.business_name}`}
              </div>
              <div className="text-xs text-gray-500">
                📍 {conn.business_city}, {language === 'en' ? conn.province_en : conn.province_fr}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {language === 'en' ? 'From:' : 'De :'} {conn.requester_email}
              </div>
              {conn.room_id ? (
                <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'Chat available' : 'Discussion disponible'}
                </div>
              ) : (
                <div className="mt-2 text-xs text-blue-600 font-medium flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {language === 'en' ? 'Connected' : 'Connecté'}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
