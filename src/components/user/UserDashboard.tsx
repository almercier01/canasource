import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Mail, Clock, CheckCircle, XCircle, Send, Inbox } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Listing } from './Listing';
import { ConnectionFeed } from './ConnectionFeed';

interface UserDashboardProps {
  language: Language;
  onClose: () => void;
}

interface ConnectionRequest {
  id: string;
  status: string;
  message: string;
  created_at: string;
  business_id: string;
  business_name: string;
  business_city: string;
  province_en: string;
  province_fr: string;
  requester_email: string;
  requester_id: string;
}

export function UserDashboard({ language, onClose }: UserDashboardProps) {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasListings, setHasListings] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('sent'); // Start with 'sent', will be updated after checkListings


  const navigate = useNavigate();

  useEffect(() => {
    checkListings();

    const handleOpenRequests = (e: CustomEvent) => {
      if (e.detail?.tab === 'requests') {
        setActiveTab('received');
      }
    };

    window.addEventListener('openUserDashboard' as any, handleOpenRequests);
    return () => {
      window.removeEventListener('openUserDashboard' as any, handleOpenRequests);
    };
  }, []);

  useEffect(() => {
    console.log('🔄 Active tab changed to:', activeTab);
    if (activeTab === 'received') {
      fetchReceivedRequests();
    } else {
      fetchSentRequests();
    }
  }, [activeTab]);

  const checkListings = async () => {
    console.log('🏢 Checking if user has business listings...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🏢 User ID for business check:', user.id);

      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id);

      console.log('🏢 Business query result:', { data, error });

      if (error || !data || data.length === 0) {
        console.log('🏢 User has NO business listings');
        setHasListings(false);
        setBusinessId(null);
        return;
      }

      console.log('🏢 User HAS business listings:', data);
      setHasListings(true);
      setBusinessId(data[0].id);
    } catch (err) {
      console.error('Error checking listings:', err);
      setHasListings(false);
      setBusinessId(null);
    }
  };

  useEffect(() => {
    console.log('👤 hasListings changed:', hasListings);
    if (hasListings) {
      // User has business listings, show received requests by default
      setActiveTab('received');
    } else if (!hasListings && activeTab === 'received') {
      // User doesn't have listings but is on received tab, switch to sent
      setActiveTab('sent');
    }
  }, [hasListings]);


  const fetchReceivedRequests = async () => {
    console.log('📥 Fetching received requests...');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(language === 'en' ? 'Please sign in' : 'Veuillez vous connecter');

      console.log('📥 User ID for received requests:', user.id);

      const { data: requests, error } = await supabase
        .from('connection_requests_with_details')
        .select('*')
        .eq('business_owner_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📥 Received requests query result:', { requests, error });

      if (error) throw error;

      console.log('📥 Setting received requests:', requests);
      setReceivedRequests(requests || []);
    } catch (err) {
      console.error('Error fetching received requests:', err);
      setReceivedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    console.log('📤 Fetching sent requests...');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(language === 'en' ? 'Please sign in' : 'Veuillez vous connecter');

      console.log('📤 User ID for sent requests:', user.id);

      const { data: requests, error } = await supabase
        .from('connection_requests_with_details')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📤 Sent requests query result:', { requests, error });

      if (error) throw error;

      console.log('📤 Setting sent requests:', requests);
      setSentRequests(requests || []);
    } catch (err) {
      console.error('Error fetching sent requests:', err);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: request, error: fetchError } = await supabase
        .from('connection_requests_with_details')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();

      if (fetchError || !request) throw fetchError || new Error('Request not found');

      await supabase.from('connection_requests').update({ status }).eq('id', requestId);

      if (status === 'accepted') {
        // Create entry in accepted_connections_feed for the Connection Feed
        await supabase.from('accepted_connections_feed_old').insert({
          business_id: request.business_id,
          user_id: request.business_owner_id,
          connected_user_id: request.requester_id
        });

        // Check if chat room already exists
        const { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('business_id', request.business_id)
          .or(`and(user_1.eq.${request.requester_id},user_2.eq.${request.business_owner_id}),and(user_1.eq.${request.business_owner_id},user_2.eq.${request.requester_id})`)
          .maybeSingle();

        let roomId = existingRoom?.id;

        // Create chat room if it doesn't exist
        if (!existingRoom) {
          const { data: newRoom, error: roomError } = await supabase
            .from('chat_rooms')
            .insert({
              business_id: request.business_id,
              user_1: request.business_owner_id,  // business owner
              user_2: request.requester_id        // requester
            })
            .select('id')
            .single();

          if (roomError) {
            console.error('Error creating chat room:', roomError);
          } else {
            roomId = newRoom.id;
          }
        }

        // Send notification to requester about chat room creation
        await supabase.from('notifications').insert({
          user_id: request.requester_id,
          type: 'chat_room_created',
          title: 'Chat Room Created',
          message: `Your connection with ${request.business_name} is ready! You can now start a conversation.`,
          data: {
            business_id: request.business_id,
            business_name: request.business_name,
            room_id: roomId,
            request_id: requestId
          },
          read: false,
          emailed: true,
          created_at: new Date().toISOString()
        });

        // Send notification to business owner about chat room creation
        await supabase.from('notifications').insert({
          user_id: request.business_owner_id,
          type: 'chat_room_created',
          title: 'New Connection Established',
          message: `A new connection has been established with ${request.requester_email}. You can now start a conversation.`,
          data: {
            business_id: request.business_id,
            business_name: request.business_name,
            room_id: roomId,
            requester_email: request.requester_email,
            request_id: requestId
          },
          read: false,
          emailed: true,
          created_at: new Date().toISOString()
        });
      }

      if (status === 'rejected') {
        await supabase.from('notifications').insert({
          user_id: request.requester_id,
          type: 'connection_request_declined',
          title: 'Request Declined',
          message: 'Your request was declined.',
          data: {
            business_id: request.business_id,
            business_name: request.business_name,
            request_id: requestId
          },
          read: false,
          emailed: true,
          created_at: new Date().toISOString()
        });

        await supabase.from('connection_requests').delete().eq('id', requestId);
      }

      fetchReceivedRequests();
    } catch (err) {
      console.error('Error updating request:', err);
    }
  };

  const viewBusinessListing = () => {
    if (businessId) {
      onClose();
      navigate(`/business/${businessId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="flex items-center text-gray-600 hover:text-red-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {language === 'en' ? 'Back' : 'Retour'}
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'en' ? 'My Dashboard' : 'Mon tableau de bord'}
          </h1>
        </div>

        {/* Connection feed shows accepted/active connections */}
        <ConnectionFeed language={language} />

        {hasListings && businessId && <Listing language={language} businessId={businessId} />}
        {hasListings && (
          <div className="mb-4">
            <button onClick={viewBusinessListing} className="text-blue-600 hover:text-blue-800">
              {language === 'en' ? 'View My Business Listing' : 'Voir mon annonce'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {hasListings && (
                <button
                  onClick={() => setActiveTab('received')}
                  className={`${activeTab === 'received'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  <Inbox className="h-5 w-5 mr-2" />
                  {language === 'en' ? 'Received Requests' : 'Demandes reçues'}
                </button>
              )}

              <button
                onClick={() => setActiveTab('sent')}
                className={`${activeTab === 'sent'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                <Send className="h-5 w-5 mr-2" />
                {language === 'en' ? 'Sent Requests' : 'Demandes envoyées'}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'received'
              ? /* Render received requests list */
              /* ... same UI logic as your existing version for received ... */
              renderRequests(receivedRequests, 'received')
              : /* Render sent requests list */
              renderRequests(sentRequests, 'sent')}
          </div>
        </div>
      </div>
    </div>
  );

  function renderRequests(requests: ConnectionRequest[], type: 'received' | 'sent') {
    const isReceived = type === 'received';
    const title = isReceived
      ? language === 'en' ? 'Received Requests' : 'Demandes reçues'
      : language === 'en' ? 'Sent Requests' : 'Demandes envoyées';

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-500">
            {language === 'en'
              ? isReceived
                ? "You haven't received any connection requests yet."
                : "You haven't sent any connection requests yet."
              : isReceived
                ? "Vous n'avez pas encore reçu de demandes de connexion."
                : "Vous n'avez pas encore envoyé de demandes de connexion."}
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{request.business_name}</h3>
                    {isReceived && (
                      <p className="text-sm text-gray-500">
                        {language === 'en' ? 'From:' : 'De:'} {request.requester_email}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      📍 {request.business_city}, {language === 'en' ? request.province_en : request.province_fr}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.message && <p className="mt-2 text-gray-700">{request.message}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    {isReceived && request.status === 'pending' ? (
                      <>
                        <button onClick={() => handleRequestAction(request.id, 'rejected')} className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          <XCircle className="h-4 w-4 mr-1" />
                          {language === 'en' ? 'Decline' : 'Refuser'}
                        </button>
                        <button onClick={() => handleRequestAction(request.id, 'accepted')} className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {language === 'en' ? 'Accept' : 'Accepter'}
                        </button>
                      </>
                    ) : (
                      <span className={`px-2 py-1 text-sm rounded-full ${request.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                        {request.status === 'accepted'
                          ? (language === 'en' ? 'Accepted' : 'Acceptée')
                          : (language === 'en' ? 'Declined' : 'Refusée')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
