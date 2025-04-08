import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RequestedOffersSection } from './components/RequestedOffersSection';
import { RequestsPage } from './components/RequestsPage';
import { RequestOfferForm } from './components/RequestOfferForm';
import { BusinessSearch } from './components/BusinessSearch';
import { Setup } from './components/admin/Setup';
import { Dashboard } from './components/admin/Dashboard';
import { RegisterForm } from './components/RegisterForm';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { UserDashboard } from './components/user/UserDashboard';
import { BusinessListing } from './components/BusinessListing';
import { AuthModal } from './components/auth/AuthModal';
import { supabase } from './lib/supabaseClient';
import { translations } from './i18n/translations';
import { Language, SiteConfig, AdminState } from './types';
import { BoutiqueView } from './components/boutique/BoutiqueView';
import { ProductForm } from './components/boutique/ProductForm';
import { useParams } from 'react-router-dom';
import { FindSourcing } from './components/FindSourcing';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<Language>('en');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [adminState, setAdminState] = useState<AdminState>({ isAuthenticated: false });
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBoutique, setShowBoutique] = useState(false);
  const [findSourcingResetKey, setFindSourcingResetKey] = useState(0);

  useEffect(() => {
    const savedConfig = localStorage.getItem('siteConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        parsedConfig.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      }
      setConfig(parsedConfig);
    } else if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      setConfig({
        country: 'CA',
        currency: 'CAD',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        initialized: true,
      });
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      setAdminState({ isAuthenticated: currentUser?.email === 'admin@test.com', user: currentUser });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem('preferredLanguage') as Language;
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);
  

  useEffect(() => {
    document.title = translations.siteTitle[language];
  }, [language]);


  const checkSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setAdminState({ isAuthenticated: user?.email === 'admin@test.com', user });
  };

  const handleSetupComplete = (newConfig: SiteConfig) => {
    if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      newConfig.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    }
    setConfig(newConfig);
    localStorage.setItem('siteConfig', JSON.stringify(newConfig));
  };

  const handleAdminLogin = async (email: string, password: string) => {
    if (email === 'admin@test.com' && password === 'admin123') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;
      setAdminState({ isAuthenticated: true, user: data.user });
      return true;
    }
    return false;
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setAdminState({ isAuthenticated: false });
    setUser(null);
  };

  const handleRegisterClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate('/register');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleExploreClick = (initialSearchTerm?: string) => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      navigate(`/search?term=${encodeURIComponent(initialSearchTerm)}`);
    } else {
      navigate('/search');
    }
  };

  const resetSearchTerm = () => {
    setSearchTerm('');
  };

  const handleNavigate = (page: 'home' | 'about' | 'contact' | 'create-boutique' | 'boutique') => {
    navigate(page === 'home' ? '/' : `/${page}`);
    if (page === 'home') {
      setFindSourcingResetKey(prev => prev + 1); // trigger reset
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const initialSearchTerm = searchParams.get('term') || '';

  if (!config?.initialized) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        language={language}
        setLanguage={setLanguage}
        config={config}
        onUpdateConfig={handleSetupComplete}
        adminState={adminState}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
        onRegisterClick={handleRegisterClick}
        onAdminDashboardClick={() => navigate('/admin-dashboard')}
        onSearch={handleExploreClick}
        onNavigate={handleNavigate}
      />

      {/* Define all routes here */}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero
                language={language}
                onExploreClick={handleExploreClick}
                onRegisterClick={handleRegisterClick}
              />
              {/* Show RequestedOffersSection ONLY on / */}
              <FindSourcing language={language} resetKey={findSourcingResetKey} /> {/* New section on homepage */}
              <RequestedOffersSection
                language={language}
                user={user}
              />
            </>
          }
        />

        <Route
          path="/register"
          element={<RegisterForm language={language} onCancel={() => navigate('/')} handleNavigate={handleNavigate} />}
        />

<Route
  path="/find-sourcing"
  element={<FindSourcing language={language} resetKey={findSourcingResetKey} />}
/>

        <Route
          path="/search"
          element={
            <BusinessSearch
              language={language}
              initialSearchTerm={initialSearchTerm}
              onClose={() => navigate('/')}
              resetSearchTerm={resetSearchTerm}
            />
          }
        />

        <Route path="/about" element={<About language={language} onClose={() => navigate('/')} />} />
        <Route path="/contact" element={<Contact language={language} onClose={() => navigate('/')} />} />
        <Route path="/business/:id" element={<BusinessListing language={language} />} />
        <Route
          path="/boutique"
          element={
            <BoutiqueView
              boutiqueId="test-boutique"
              language={language}
              onClose={() => {
                setShowBoutique(false);
                handleNavigate('home');
              }}
            />
          }
        />
        <Route path="/add-products/:businessId" element={<AddProducts language={language} />} />

        <Route
          path="/requests/new"
          element={
            <RequestOfferForm
              language={language}
              onCancel={() => navigate('/')}
              onSuccess={() => navigate('/requests')}
            />
          }
        />

        <Route
          path="/requests"
          element={<RequestsPage language={language} />}
        />

        <Route path="/user-dashboard" element={<UserDashboard language={language} onClose={() => navigate('/')} />} />
        <Route path="/admin-dashboard" element={<Dashboard language={language} />} />
        <Route path="/admin/setup" element={<Setup onComplete={handleSetupComplete} />} />
      </Routes>

      {/* Auth Modal (available globally) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          navigate('/register');
        }}
        language={language}
      />
    </div>
  );
}

// Example for AddProducts (unchanged)
export const AddProducts = ({ language }: { language: Language }) => {
  const { businessId } = useParams<{ businessId: string }>();
  if (!businessId) {
    return <p>Error: Business ID is missing.</p>;
  }
  return (
    <ProductForm
      language={language}
      businessId={businessId}
      onProductAdded={() => { console.log("Product added!"); }}
    />
  );
};
