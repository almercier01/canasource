import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Globe,
  Phone,
  Tag,
  Package,
  PenTool as Tool,
  Flag,
  Edit2,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Business, Language } from '../types';
import { Map } from './Map';
import { translations } from '../i18n/translations';
import { ReportModal } from './ReportModal';
import { EditBusinessForm } from './EditBusinessForm';
import { CommentSection } from './CommentSection';
import { supabase } from '../lib/supabaseClient';
import { AuthModal } from './auth/AuthModal';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { BoutiqueView } from '../components/boutique/BoutiqueView';


interface BusinessListingProps {
  // If a parent has already fetched a business object, it can be passed in.
  // Otherwise, we will fetch using the URL :id.
  business?: Business;
  language: Language;
  onUpdate?: () => void;
}

export function BusinessListing({
  business,
  language,
  onUpdate,
}: BusinessListingProps) {
  const { id } = useParams(); // e.g. /business/:id
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
const shouldRefetch = searchParams.get('refetched') === 'true';

  // Local state for fetched business if none was passed in
  const [businessDetails, setBusinessDetails] = useState<Business | null>(null);

  // If we have a prop business, use that; otherwise use the fetched one
  const effectiveBusiness = business ?? businessDetails;
  const [boutique, setBoutique] = useState<any>(null); // Store boutique details

  // UI states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [approvedImage, setApprovedImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [showConnectionSuccess, setShowConnectionSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBoutique, setShowBoutique] = useState(false);
  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);



  const defaultImage = 'public/images/default_listing_Temp_image2.png';


  // 1. If no `business` prop, fetch from Supabase using `id`
  useEffect(() => {
    if (!business && id) {
      fetchBusiness(id);
    }
  }, [id, business, shouldRefetch]);

  useEffect(() => {
    if (effectiveBusiness) {
      fetchBoutique(effectiveBusiness.id);
    }
  }, [effectiveBusiness]);

  // 2. Once we have an effectiveBusiness, run checks (ownership, image, etc.)
  useEffect(() => {
    if (!effectiveBusiness) return;

    checkUser();
    checkOwnership(effectiveBusiness.id);
    fetchCommentCount(effectiveBusiness.id);
    fetchApprovedImage(effectiveBusiness.id);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
      checkOwnership(effectiveBusiness.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [effectiveBusiness]);

  // Fetch business by ID from Supabase
  const fetchBusiness = async (businessId: string) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
  
      if (error || !data) {
        console.error('Error fetching business:', error);
        return;
      }
  
      setBusinessDetails(data as Business); // ✅ Update state with new business data
    } catch (err) {
      console.error('Error fetching business:', err);
    }
  };
  

  const handleUpdate = () => {
    if (business) {
      fetchBusiness(business.id); // ✅ Fetch latest business details
    }
  };

  // Check the currently logged-in user
  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };
  const fetchBoutique = async (businessId: string) => {
    try {
      // Fetch owner_id from businesses table
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', businessId)
        .maybeSingle();
  
      if (businessError || !businessData) {
        console.error('Error fetching business owner:', businessError);
        setBoutique(null);
        return;
      }
  
      const ownerId = businessData.owner_id;
  
      // Fetch boutique for the owner (use maybeSingle instead of single)
      const { data: boutiqueData, error: boutiqueError } = await supabase
        .from('boutiques')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();
  
      if (boutiqueError) {
        console.error('Error fetching boutique:', boutiqueError);
        setBoutique(null);
        return;
      }
  
      // Set boutique state (will be null if no boutique found)
      setBoutique(boutiqueData || null);
    } catch (err) {
      console.error('Error fetching boutique:', err);
      setBoutique(null);
    }
  };
  
  


  // Determine if the current user is the owner of the business
  const checkOwnership = async (businessId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsOwner(false);
      return;
    }

    // Compare user.id to the business.owner_id
    const { data, error } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', businessId)
      .single();

    if (!error && data?.owner_id === user.id) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  };

  // Fetch how many comments are active for this business
  const fetchCommentCount = async (businessId: string) => {
    const { count } = await supabase
      .from('business_comments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'active');

    setCommentCount(count || 0);
  };

  if (!effectiveBusiness) {
    return <div>Loading...</div>;
  }
  // If we have an approved image from business_images, use it.
  // If the business is marked as "pending", force the fallback.
  // Otherwise, show whatever is in business.image_url or fallback.
  const displayedImage = approvedImage
    ? approvedImage
    : effectiveBusiness.image_status === 'pending'
      ? defaultImage
      : effectiveBusiness.image_url || defaultImage;

  // Fetch the most recently approved image from business_images
  const fetchApprovedImage = async (businessId: string) => {
    try {
      const { data } = await supabase
        .from('business_images')
        .select('url')
        .eq('business_id', businessId)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.url) {
        setApprovedImage(data.url);
      }
    } catch (err) {
      console.error('Error fetching approved image:', err);
    }
  };

  // Called when a viewer wants to connect with the business
  const handleConnect = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // If the current user is the owner, disallow connect requests
    if (isOwner && effectiveBusiness) {
      setError(
        language === 'en'
          ? 'You cannot connect to your own business listing'
          : 'Vous ne pouvez pas vous connecter à votre propre entreprise',
      );
      return;
    }

    try {
      if (!effectiveBusiness) return;

      setConnecting(true);
      const { error } = await supabase.rpc('request_connection', {
        p_business_id: effectiveBusiness.id,
        p_message: `Interested in connecting regarding ${effectiveBusiness.name}`,
      });

      if (error) {
        // This is a special check for a custom error message from your DB
        if (error.message.includes('Cannot request connection to your own business')) {
          throw new Error(
            language === 'en'
              ? 'You cannot connect to your own business listing'
              : 'Vous ne pouvez pas vous connecter à votre propre entreprise',
          );
        }
        throw error;
      }

      setConnectionSuccess(true);
      setShowConnectionSuccess(true);
      setTimeout(() => {
        setShowConnectionSuccess(false);
      }, 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error requesting connection',
      );
    } finally {
      setConnecting(false);
    }
  };

  // Button for “View Requests” - triggers your custom event or route
  const viewRequests = () => {
    const event = new CustomEvent('openUserDashboard', {
      detail: { tab: 'requests' },
    });
    window.dispatchEvent(event);
  };

  // If no business data yet, show a loading state
  if (!effectiveBusiness) {
    return <div className="p-6">Loading...</div>;
  }

  // Decide which language column to display for the description
  const displayedDescription =
    language === 'en'
      ? effectiveBusiness.description_en
      : effectiveBusiness.description_fr;

  // Build a display-friendly address
  const displayedProvince = language === 'en' ? effectiveBusiness.province_en : effectiveBusiness.province_fr;

  const fullAddress = effectiveBusiness.address
    ? `${effectiveBusiness.address}, ${effectiveBusiness.city}, ${displayedProvince}, Canada`
    : `${effectiveBusiness.city}, ${displayedProvince}, Canada`;
  

  // If user clicked “Edit,” show the EditBusinessForm
  if (showEditForm) {
    return (
      <EditBusinessForm
        business={effectiveBusiness}
        onCancel={() => setShowEditForm(false)}
        onSave={() => {
          setShowEditForm(false);
          navigate(`/business/${effectiveBusiness.id}?refetched=true`);
          handleUpdate(); // ✅ Ensure latest data is fetched
          if (onUpdate) onUpdate();
        }}
        language={language}
      />
    );
  }

  // Otherwise, show the normal listing display
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">

      {/* Top image bar */}
      
      <div className="relative bg-white flex items-center justify-center h-48 p-4">
      {effectiveBusiness.issample && (
    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
      {language === 'en' ? 'Sample Listing' : 'Annonce Démo'}
    </div>
  )}
        
  <img
    src={displayedImage}
    alt={effectiveBusiness.name}
    className="max-h-full max-w-full object-contain"
  />

        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
          
          {language === 'en' ? effectiveBusiness.province_en : effectiveBusiness.province_fr}
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {isOwner && (
            <button
              onClick={() => setShowEditForm(true)}
              className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-blue-600 shadow-sm hover:bg-opacity-100 flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Edit' : 'Modifier'}
            </button>
          )}
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-red-600 shadow-sm hover:bg-opacity-100 flex items-center"
          >
            <Flag className="h-4 w-4 mr-1" />
            {translations.report.button[language]}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {/* Header row: name, category, rating */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {effectiveBusiness.name}
            </h2>
            <div className="mt-1 flex items-center">
              <Tag className="h-4 w-4 text-red-600" />
              <span className="ml-2 text-sm text-gray-600">
  {language === 'en' ? effectiveBusiness.category_en : effectiveBusiness.category_fr}
</span>

            </div>
          </div>

          {/* Rating + Connect button */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-600">
                {effectiveBusiness.rating}
              </span>
              <span className="ml-1 text-gray-400">
                ({effectiveBusiness.reviewCount})
              </span>
            </div>

            {/* “Connect” button (disabled if isOwner) */}
            {!isOwner && (
              <button
                onClick={handleConnect}
                disabled={connecting || connectionSuccess}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-colors ${connectionSuccess
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
              >
                <Mail className="h-4 w-4 mr-1" />
                {connectionSuccess
                  ? language === 'en'
                    ? 'Request Sent!'
                    : 'Demande envoyée !'
                  : language === 'en'
                    ? 'Connect'
                    : 'Connecter'}
              </button>
            )}
          </div>
        </div>

               {/* New About Section */}
               <p className="mt-4 text-gray-600">
          {language === 'en' ? effectiveBusiness.about_en : effectiveBusiness.about_fr}
        </p>

        {/* Languages of Service */}
        {effectiveBusiness.languages?.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            <strong>{language === 'en' ? 'Languages of Service:' : 'Langues de service :'}</strong>{' '}
            {effectiveBusiness.languages.join(', ')}
          </div>
        )}

        {/* Address & website & phone */}
        <div className="mt-4 flex items-center text-gray-500">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="ml-2">{fullAddress}</span>
        </div>

        {effectiveBusiness.website && (
  <div className="mt-2 flex items-center text-gray-500">
    <Globe className="h-4 w-4 flex-shrink-0" />
    {effectiveBusiness.issample ? (
      <span className="ml-2 text-gray-700">{effectiveBusiness.website}</span>
    ) : (
      <a
        href={
          effectiveBusiness.website.startsWith('http')
            ? effectiveBusiness.website
            : `https://${effectiveBusiness.website}`
        }
        className="ml-2 text-red-600 hover:text-red-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        {effectiveBusiness.website}
      </a>
    )}
  </div>
)}


        {effectiveBusiness.phone && (
          <div className="mt-2 flex items-center text-gray-500">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="ml-2">{effectiveBusiness.phone}</span>
          </div>
        )}

        {/* Error messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Connection success popup */}
        {showConnectionSuccess && (
          <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-lg border border-green-200 p-4 z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-green-500" />
                <p className="ml-3 text-sm text-gray-700">
                  {language === 'en'
                    ? 'Connection request sent successfully!'
                    : 'Demande de connexion envoyée avec succès !'}
                </p>
              </div>
              <button
                onClick={viewRequests}
                className="ml-4 flex items-center text-sm text-green-600 hover:text-green-700"
              >
                {language === 'en' ? 'View Requests' : 'Voir les demandes'}
                <ExternalLink className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Products & Services */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products */}
          {!!effectiveBusiness.products?.length && (
            <div className="space-y-3">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-red-600" />
                <h3 className="ml-2 font-semibold text-gray-900">
                  {translations.register.products[language]}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {effectiveBusiness.products.map((product, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {!!effectiveBusiness.services?.length && (
            <div className="space-y-3">
              <div className="flex items-center">
                <Tool className="h-5 w-5 text-red-600" />
                <h3 className="ml-2 font-semibold text-gray-900">
                  {translations.register.services[language]}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {effectiveBusiness.services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        {boutique && boutique.id && boutique.status === 'active' && (
  <div className="mt-4">
    <button
      onClick={() => setShowBoutique(true)}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      {language === 'en' ? 'View Boutique' : 'Voir la boutique'}
    </button>

    {/* BoutiqueView Component */}
    {showBoutique && (
      <BoutiqueView
        boutiqueId={boutique.id}
        language={language}
        onClose={() => setShowBoutique(false)}  // ✅ Close modal
      />
    )}
  </div>
)}




        {/* Map */}
        {!showBoutiqueModal && (
          <div className="mt-6">
            <Map business={effectiveBusiness} fullAddress={fullAddress} />
          </div>
        )}

        {/* Comments */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Comments' : 'Commentaires'} ({commentCount})
          </h3>
          <CommentSection
            businessId={effectiveBusiness.id}
            language={language}
            onCommentAdded={() => {
              if (effectiveBusiness) {
                fetchCommentCount(effectiveBusiness.id);
              }
            }}
          />
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        businessId={effectiveBusiness.id}
        language={language}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleConnect();
        }}
        language={language}
      />
    </div>
  );
}
