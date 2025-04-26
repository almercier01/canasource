import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

interface FeedItem {
    id: string;
    type: 'business' | 'request';
    title_en: string | null;
    title_fr: string | null;
    createdAt: string;
    relatedId: string;
}

interface NetworkFeedProps {
    language: 'en' | 'fr';
}

export function NetworkFeed({ language }: NetworkFeedProps) {
    const [businesses, setBusinesses] = useState<FeedItem[]>([]);
    const [requests, setRequests] = useState<FeedItem[]>([]);

    useEffect(() => {
        async function loadFeed() {
            const { data: businessesData } = await supabase
                .from('businesses')
                .select('id, name, created_at')
                .order('created_at', { ascending: false });

            const { data: requestsData } = await supabase
                .from('requested_offers')
                .select('id, title_en, title_fr, created_at')
                .order('created_at', { ascending: false });

            if (businessesData) {
                setBusinesses(
                    businessesData
                        .map(b => ({
                            id: b.id,
                            type: 'business' as const,
                            title_en: b.name,
                            title_fr: null,
                            createdAt: b.created_at,
                            relatedId: b.id,
                        }))
                );
            }

            if (requestsData) {
                setRequests(
                    requestsData
                        .map(r => ({
                            id: r.id,
                            type: 'request' as const,
                            title_en: r.title_en,
                            title_fr: r.title_fr,
                            createdAt: r.created_at,
                            relatedId: r.id,
                        }))
                );
            }
        }

        loadFeed();
    }, []);

    // 🧠 Function to select the correct titles
    function getRequestsForFeed() {
        const preferred = requests.filter((req) =>
          language === 'fr'
            ? req.title_fr && req.title_fr.trim() !== ''
            : req.title_en && req.title_en.trim() !== ''
        );
      
        const fallback = requests.filter((req) =>
          language === 'fr'
            ? (!req.title_fr || req.title_fr.trim() === '') && req.title_en
            : (!req.title_en || req.title_en.trim() === '') && req.title_fr
        );
      
        const combined = [...preferred, ...fallback];
        return combined.slice(0, 6);
      }
      

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Activités Récentes sur CanaSource</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Demandes */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">🔥 Nouvelles Demandes</h3>
                    <div className="space-y-4">
                        {getRequestsForFeed().map((item) => {
                            const title = language === 'fr' ? item.title_fr || item.title_en : item.title_en || item.title_fr;
                            const isFrench = language === 'fr' && item.title_fr !== null;
                            const languageIconColor = isFrench ? 'bg-blue-500' : 'bg-red-500';


                            return (
                                <Link
                                    to={`/requests/${item.relatedId}`}
                                    key={item.id}
                                    className="block p-4 rounded-lg shadow hover:bg-gray-100 transition"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>🔥</span>
                                        <span className={`h-3 w-3 rounded-full ${languageIconColor}`} />

                                        <span className="font-medium">{title}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column - Entreprises */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">🏢 Nouvelles Entreprises</h3>
                    <div className="space-y-4">
                        {businesses.slice(0, 6).map((item) => (
                            <Link
                                to={`/business/${item.relatedId}`}
                                key={item.id}
                                className="block p-4 rounded-lg shadow hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center space-x-2">
                                    <span>🏢</span>
                                    <span className="font-medium">{item.title_en}</span>
                                </div>
                                <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
