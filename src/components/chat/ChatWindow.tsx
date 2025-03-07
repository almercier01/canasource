import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';

interface ChatWindowProps {
  roomId: string;
  businessName: string;
  language: Language;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export function ChatWindow({ roomId, businessName, language, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkUser();
    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      cleanupSubscription();
    };
  }, [roomId]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else if (!isAtBottom && user) {
      // If we're not at the bottom and a new message arrives
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_id !== user.id) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setIsAtBottom(isBottom);
      
      if (isBottom) {
        setUnreadCount(0);
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanupSubscription = async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const setupRealtimeSubscription = async () => {
    await cleanupSubscription();

    const channel = supabase.channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(language === 'en' ? 'Error loading messages' : 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: roomId,
            sender_id: user.id,
            content: messageContent
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Optimistically add the message to the UI
      if (data) {
        setMessages(prev => [...prev, data]);
        setIsAtBottom(true);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(language === 'en' ? 'Error sending message' : 'Erreur lors de l\'envoi du message');
      setNewMessage(messageContent);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl flex flex-col z-50 max-h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
        <h3 className="font-medium text-gray-900 truncate">{businessName}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={language === 'en' ? 'Close chat' : 'Fermer le chat'}
        >
          <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </button>
      </div>

      <div 
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[500px] scroll-smooth"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-4">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            {language === 'en' ? 'No messages yet' : 'Pas encore de messages'}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender_id === user?.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {!isAtBottom && unreadCount > 0 && (
        <button
          onClick={() => {
            scrollToBottom();
            setUnreadCount(0);
            setIsAtBottom(true);
          }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-sm shadow-lg hover:bg-red-700 transition-colors"
        >
          {unreadCount} {language === 'en' ? 'new messages' : 'nouveaux messages'}
        </button>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={language === 'en' ? 'Type a message...' : 'Tapez un message...'}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            aria-label={language === 'en' ? 'Send message' : 'Envoyer le message'}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}