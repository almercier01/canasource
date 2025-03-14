import React, { useState, useEffect } from 'react';
import { BarChart3, Flag, Image, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  language: Language;

}

interface Report {
  id: string;
  type: string;
  details: string;
  status: string;
  created_at: string;
  business_name: string;
  business_id: string;
  reporter_email: string;
}

interface PendingBusiness {
  id: string;
  name: string;
  image_url: string;
  image_status: string; // "pending", "approved", or "rejected"
  created_at: string;
}

interface ProvinceCount {
  province: string | null;
  cnt: number;
}

interface CategoryCount {
  category: string | null;
  cnt: number;
}

interface OverviewData {
  totalBusinesses: number;
  totalUsers: number;
  byProvince: ProvinceCount[];
  byCategory: CategoryCount[];
}

const TAB_KEYS = ['overview', 'reports', 'images', 'settings'] as const;
type DashboardTab = (typeof TAB_KEYS)[number];

export function Dashboard({ language }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // For the “reports” tab
  const [reports, setReports] = useState<Report[]>([]);

  // For the “images” tab
  const [pendingItems, setPendingItems] = useState<PendingBusiness[]>([]);

  // For the “overview” tab (expanded data)
  const [overview, setOverview] = useState<OverviewData>({
    totalBusinesses: 0,
    totalUsers: 0,
    byProvince: [],
    byCategory: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If you want, you can check if user is still admin. If not, call onClose().
    checkIfAdmin();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewDetails();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'images') {
      fetchPendingBusinesses();
    }
    // if (activeTab === 'settings') do nothing
  }, [activeTab]);

  const checkIfAdmin = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Error fetching user:', authError);
        navigate('/');
        return;
      }
  
      // Fetch the admin ID dynamically
      const { data: admin, error: adminError } = await supabase
        .from('users') // Ensure this matches your table where admin users are stored
        .select('id')
        .eq('email', 'admin@test.com') // ✅ Fetch dynamically instead of hardcoding
        .single();
  
      if (adminError || !admin) {
        console.error('Error fetching admin ID:', adminError);
        navigate('/');
        return;
      }
  
      // Check if current user is the admin
      if (user.id !== admin.id) {
        console.warn('User is not an admin');
        navigate('/');
      }
    } catch (err) {
      console.error('Error checking admin:', err);
      navigate('/');
    }
  };
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // When user logs out, navigate them home
    navigate('/');
  };

  // --------------------------------------------------------------------------------
  // 1) EXPANDED Overview: total businesses, total users, businesses by province/category
  // --------------------------------------------------------------------------------
  const fetchOverviewDetails = async () => {
    setLoading(true);
    try {
      // Fetch multiple queries in parallel
      const [
        bizCountRes,
        userCountRes,
        provinceStatsRes,
        categoryStatsRes
      ] = await Promise.all([
        // 1) total businesses
        supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true }),
  
        // 2) total users
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true }),
  
        // 3) business stats by province
        supabase
          .from('business_stats_by_province')
          .select('*'),
  
        // 4) business stats by category
        supabase
          .from('business_stats_by_category')
          .select('*'),
      ]);
  
      console.log("Province Stats Raw Data:", provinceStatsRes.data);
      console.log("Category Stats Raw Data:", categoryStatsRes.data);
  
      // 1) Parse total businesses
      const totalBusinesses = bizCountRes.count ?? 0;
  
      // 2) Parse total users
      const totalUsers = userCountRes.count ?? 0;
  
      // 3) Format provinces correctly (use `province` instead of `province_en`)
      const byProvince: ProvinceCount[] = (provinceStatsRes.data ?? []).map((p) => ({
        province: p.province?.trim() !== "" ? p.province : "Unknown Province", 
        cnt: p.cnt ?? 0,
      }));
  
      // 4) Format categories correctly (use `category_en`)
      const byCategory: CategoryCount[] = (categoryStatsRes.data ?? []).map((c) => ({
        category: c.category_en?.trim() !== "" ? c.category_en : "Unknown Category", 
        cnt: c.cnt ?? 0,
      }));
  
      // Set overview state
      setOverview({
        totalBusinesses,
        totalUsers,
        byProvince,
        byCategory,
      });
  
    } catch (err) {
      console.error('Error fetching overview details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  

  // --------------------------------------------------------------------------------
  // 2) REPORTS TAB
  // --------------------------------------------------------------------------------
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------------
  // 3) IMAGES TAB (pending)
  // --------------------------------------------------------------------------------
  const fetchPendingBusinesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, image_url, image_status, created_at')
        .eq('image_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((biz) => ({
        id: biz.id,
        name: biz.name,
        image_url: biz.image_url || '',
        image_status: biz.image_status || 'pending',
        created_at: biz.created_at,
      })) as PendingBusiness[];

      setPendingItems(formatted);
    } catch (error) {
      console.error('Error fetching pending businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Updating status on the “images” tab
  const handleImageAction = async (businessId: string, status: 'approved' | 'rejected') => {
    setLoading(true);

    try {
        // ✅ First, check if the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("User is not authenticated:", authError);
            alert("You must be logged in to perform this action.");
            return;
        }

        console.log("Attempting to approve/reject image as user:", user.id);

        // ✅ Now call the function
        console.log("Calling Supabase RPC with:", { business_id: businessId, new_status: status });
        const { data, error } = await supabase.rpc('admin_update_business_image', {
            business_id: businessId,
            new_status: status
        });

        if (error) {
            console.error(`Error updating business image to '${status}':`, error);
            return;
        }

        console.log(`Image ${status} successfully for business:`, businessId);
        await fetchPendingBusinesses(); // Refresh the list
    } catch (err) {
        console.error('Error in handleImageAction:', err);
    } finally {
        setLoading(false);
    }
};


  
  // --------------------------------------------------------------------------------
  // RENDER FUNCTIONS
  // --------------------------------------------------------------------------------

  // Renders the new Overview
  const renderOverview = () => {
    if (loading) {
      return <p>{translations.common.loading[language]}</p>;
    }

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-lg font-bold mb-2">
            Dashboard Overview
          </h3>
          <ul className="list-disc list-inside">
            <li>Total Businesses: {overview.totalBusinesses}</li>
            <li>Total Users: {overview.totalUsers}</li>
          </ul>
        </div>

        {/* Businesses by Province (from the view) */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h4 className="font-semibold mb-2">Businesses by Province</h4>
          {overview.byProvince.length === 0 ? (
            <p>No businesses found</p>
          ) : (
            <ul>
              {overview.byProvince.map((p) => (
                <li key={p.province ?? 'none'}>
                  Province: {p.province ? translations.provinces[p.province][language] : 'N/A'} – Count: {p.cnt}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Businesses by Category (from the view) */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h4 className="font-semibold mb-2">Businesses by Category</h4>
          {overview.byCategory.length === 0 ? (
            <p>No businesses found</p>
          ) : (
            <ul>
              {overview.byCategory.map((c) => (
                <li key={c.category ?? 'none'}>
                  Category: {c.category ? translations.categories[c.category][language] : 'N/A'} – Count: {c.cnt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  // Renders your existing Reports tab
  const renderReportsTab = () => {
    if (loading) {
      return <p>{translations.common.loading[language]}</p>;
    }
    if (reports.length === 0) {
      return <p>{translations.dashboard.noReports[language]}</p>;
    }
    return (
      <ul className="mt-4 space-y-2">
        {reports.map((report) => (
          <li key={report.id} className="border p-2 rounded">
            <strong>{report.business_id}</strong> - {report.type} ({report.status})
          </li>
        ))}
      </ul>
    );
  };

  // Renders your existing Images tab
  const renderImagesTab = () => {
    if (loading) {
      return <p>{translations.common.loading[language]}</p>;
    }
    if (pendingItems.length === 0) {
      return <p>{translations.dashboard.noPendingItems[language]}</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h4 className="font-medium text-gray-900 mt-2">
              {item.name || translations.dashboard.unknownBusiness[language]}
            </h4>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleImageAction(item.id, 'approved')}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                {translations.dashboard.approve[language]}
              </button>
              <button
                onClick={() => handleImageAction(item.id, 'rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                {translations.dashboard.reject[language]}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --------------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Top Nav for Tabs */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Log out
            </button>
          </div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {TAB_KEYS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${activeTab === tab
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } flex items-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  {tab === 'overview' && <BarChart3 className="h-5 w-5 mr-2" />}
                  {tab === 'reports' && <Flag className="h-5 w-5 mr-2" />}
                  {tab === 'images' && <Image className="h-5 w-5 mr-2" />}
                  {tab === 'settings' && <Settings className="h-5 w-5 mr-2" />}
                  {translations.dashboard.tabs[tab][language]}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'reports' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {translations.dashboard.reports[language]}
                </h3>
                {renderReportsTab()}
              </div>
            )}
            {activeTab === 'images' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {translations.dashboard.images[language]}
                </h3>
                {renderImagesTab()}
              </div>
            )}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {translations.dashboard.settings[language]}
                </h3>
                <p>{translations.dashboard.settingsDescription[language]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
