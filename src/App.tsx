import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
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

export default function App() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [adminState, setAdminState] = useState<AdminState>({ isAuthenticated: false });
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const handleNavigate = (page: 'home' | 'about' | 'contact' | 'create-boutique') => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

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

      <Routes>
        <Route path="/" element={<Hero language={language} onExploreClick={handleExploreClick} onRegisterClick={handleRegisterClick} />} />
        <Route path="/register" element={<RegisterForm language={language} onCancel={() => navigate('/')} handleNavigate={handleNavigate} />} />
        <Route path="/search" element={<BusinessSearch language={language} initialSearchTerm={searchTerm} onClose={() => navigate('/')} />} />
        <Route path="/about" element={<About language={language} onClose={() => navigate('/')} />} />
        <Route path="/contact" element={<Contact language={language} onClose={() => navigate('/')} />} />
        <Route path="/business/:id" element={<BusinessListing language={language} />} />
        <Route path="/user-dashboard" element={<UserDashboard language={language} onClose={() => navigate('/')} />} />
        <Route path="/admin-dashboard" element={<Dashboard language={language} />} />
        <Route path="/admin/setup" element={<Setup onComplete={handleSetupComplete} />} />
      </Routes>

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
