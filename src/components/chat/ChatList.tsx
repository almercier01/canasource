import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { ChatWindow } from './ChatWindow';

interface ChatListProps {
  language: Language;
  onClose: () => void;
}

interface ChatRoom {
  id: string;
  business_name: string;
  owner_email: string;
  member_email: string;
  last_message_at: string;
}

export function ChatList({ language, onClose }: ChatListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<string>('');

  useEffect(() => {
    fetchRooms();
    subscribeToRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error(language === 'en' ? 'Please sign in' : 'Veuillez vous connecter');
      }

      const { data, error } = await supabase
        .from('chat_rooms_with_details')
        .select('*')
        .or(`owner_id.eq.${user.id},member_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError(err instanceof Error ? err.message : 'Error fetching chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRooms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subscription = supabase
      .channel('chat_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms',
        filter: `owner_id=eq.${user.id}`
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleRoomClick = (roomId: string, businessName: string) => {
    setActiveRoom(roomId);
    setActiveBusiness(businessName);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'en' ? 'Messages' : 'Messages'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-4">{error}</div>
          ) : rooms.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {language === 'en' 
                ? 'No messages yet. Connect with businesses to start chatting!' 
                : 'Pas encore de messages. Connectez-vous avec des entreprises pour commencer à discuter !'}
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomClick(room.id, room.business_name)}
                  className="w-full text-left p-4 rounded-lg border hover:border-red-500 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{room.business_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === 'en' ? 'Last message:' : 'Dernier message :'}{' '}
                    {new Date(room.last_message_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeRoom && (
        <ChatWindow
          roomId={activeRoom}
          businessName={activeBusiness}
          language={language}
          onClose={() => setActiveRoom(null)}
        />
      )}
    </div>
  );
}