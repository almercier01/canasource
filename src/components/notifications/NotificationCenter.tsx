import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { useNavigate } from 'react-router-dom';
import { RealtimeChannel } from '@supabase/supabase-js';


interface NotificationCenterProps {
  language: Language;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export function NotificationCenter({ language }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let subscription: RealtimeChannel | null;
  
    const initSubscription = async () => {
      subscription = await subscribeToNotifications();
    };
  
    fetchNotifications();
    initSubscription();
  
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  

  const subscribeToNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        if (!(payload.new as Notification).read) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAsUnread = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: false })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: false } : n)));
      setUnreadCount(prev => prev + 1);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'listing_approved':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'listing_rejected':
        return <X className="h-5 w-5 text-red-500" />;
      case 'report_cleared':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-red-600"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium text-gray-900">
              {language === 'en' ? 'Notifications' : 'Notifications'}
            </h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                {language === 'en' ? 'Loading...' : 'Chargement...'}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {language === 'en' ? 'No notifications' : 'Aucune notification'}
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                    onClick={() => navigate('/user-dashboard')} // Adjust to your actual user dashboard route
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.read ? markAsUnread(notification.id) : markAsRead(notification.id);
                        }}
                      >
                        {notification.read ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
