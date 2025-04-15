import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { useNavigate } from 'react-router-dom';
import { RealtimeChannel } from '@supabase/supabase-js';
import _ from 'lodash'; // npm install lodash if not prese


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
  first_name: string;
  last_name: string;
  sender_full_name: string;
  sender_email: string;
  user_id: string;
  business_name: string;


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

  useEffect(() => {
    console.log("Notifications:", notifications);
  }, [notifications]);


  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev =>
        prev - (notifications.find(n => n.id === id)?.read ? 0 : 1)
      );
    } else {
      console.error('Error deleting notification:', error.message);
    }
  };


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
        .from('notifications_with_users')
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

  // Grouping logic (e.g., just above your JSX return)
  const grouped = _(notifications)
    .filter(n => n.type === 'chat_message') // only group chat messages
    .groupBy(n => `${n.user_id}-${n.data?.room_id}`) // group by sender + room
    .map((group, key) => {
      const latest = _.maxBy(group, 'created_at');
      const unreadCount = group.filter(n => !n.read).length;

      return {
        key,
        sender_full_name: latest?.sender_full_name,
        sender_email: latest?.sender_email,
        business_name: latest?.business_name,


        room_id: latest?.data?.room_id,
        created_at: latest?.created_at,
        unreadCount,
      };
    })
    .orderBy('created_at', 'desc')
    .value();


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
                {/* Grouped chat notifications */}
                {grouped.map(item => {
                  const groupNotifications = notifications.filter(n =>
                    n.type === 'chat_message' &&
                    n.data?.room_id === item.room_id &&
                    n.sender_email === item.sender_email
                  );

                  return (
                    <div
                      key={item.key}
                      className="p-4 bg-white border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/chat/${item.room_id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {language === 'fr' ? 'Message de' : 'Message from'}{' '}
                            <span className="text-gray-900">{item.sender_email}</span>
                          </p>
                          {item.business_name && (
                            <p className="text-sm italic text-gray-600">{item.business_name}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                          </p>
                          {item.unreadCount > 0 && (
                            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                              {item.unreadCount} {language === 'fr' ? 'non lus' : 'unread'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <button
                            className="text-red-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              groupNotifications.forEach(n => deleteNotification(n.id));
                            }}
                            title={language === 'fr' ? 'Supprimer tout' : 'Delete all'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}


                {/* Non-chat notifications */}
                {notifications
                  .filter(n => n.type !== 'chat_message')
                  .map(n => (
                    <div
                      key={n.id}
                      className={`p-4 cursor-pointer ${n.read ? 'bg-white' : 'bg-blue-50'}`}
                      onClick={() => {
                        switch (n.type) {
                          case 'listing_approved':
                          case 'listing_rejected':
                          case 'image_approved':
                          case 'image_rejected':
                          case 'offer_response':
                            navigate('/user-dashboard');
                            break;
                            case 'comment_received':
                              if (n.data?.business_id && n.data?.comment_id) {
                                navigate(`/business/${n.data.business_id}?highlight=${n.data.comment_id}`);
                              }
                              break;
                          default:
                            break;
                        }

                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">{getNotificationIcon(n.type)}</div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{n.title}</p>
                            <p className="text-sm text-gray-500">{n.message}</p>
                            <p className="text-xs text-gray-400">
                              {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            n.read ? markAsUnread(n.id) : markAsRead(n.id);
                          }}
                        >
                          {n.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          title={language === 'fr' ? 'Supprimer' : 'Delete'}
                        >
                          <Trash2 className="h-4 w-4" />
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
