import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
  const [language, setLanguage] = useState<Language>('en');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [adminState, setAdminState] = useState<AdminState>({ isAuthenticated: false });
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser?.email === 'admin@test.com') {
        setAdminState({ isAuthenticated: true, user: currentUser });
      } else {
        setAdminState({ isAuthenticated: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.title = translations.siteTitle[language];
  }, [language]);

  const checkSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user?.email === 'admin@test.com') {
      setAdminState({
        isAuthenticated: true,
        user,
      });
    }
  };

  // Called when the user completes the site setup
  const handleSetupComplete = (newConfig: SiteConfig) => {
    if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      newConfig.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    }
    setConfig(newConfig);
    localStorage.setItem('siteConfig', JSON.stringify(newConfig));
  };

  // Admin login
  const handleAdminLogin = async (email: string, password: string) => {
    if (email === 'admin@test.com' && password === 'admin123') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;
      setAdminState({ isAuthenticated: true, user: data.user });
      return true;
    }
    return false;
  };

  // Admin logout
  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setAdminState({ isAuthenticated: false });
    setUser(null);
  };

  // If user is logged in, go straight to register. If not, show AuthModal.
  const handleRegisterClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Already logged in -> navigate to /register
      window.location.href = '/register';
    } else {
      // Show login form
      setShowAuthModal(true);
    }
  };

  // Let the user explore with or without a search term
  const handleExploreClick = (initialSearchTerm?: string) => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
    // navigate to /search (we’ll pass the searchTerm as state or param)
    window.location.href = '/search';
  };

  // A helper for non-auth pages, e.g. nav to about, contact, etc.
  const handleNavigate = (page: 'home' | 'about' | 'contact' | 'create-boutique') => {
    switch (page) {
      case 'home':
        window.location.href = '/';
        break;
      case 'about':
        window.location.href = '/about';
        break;
      case 'contact':
        window.location.href = '/contact';
        break;
      case 'create-boutique':
      default:
        window.location.href = '/register';
        break;
    }
  };

  // If the site is not set up, show the Setup component
  if (!config?.initialized) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  return (
    <Router>
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
          onAdminDashboardClick={() => (window.location.href = '/admin-dashboard')}
          onSearch={handleExploreClick}
          onNavigate={handleNavigate}
        />

        {/* Define all your routes */}
        <Routes>
          {/* Home / Hero */}
          <Route
            path="/"
            element={
              <Hero
                language={language}
                onExploreClick={handleExploreClick}
                onRegisterClick={handleRegisterClick}
              />
            }
          />

          {/* Register Form */}
          <Route
            path="/register"
            element={
              <RegisterForm
                language={language}
                onCancel={() => window.location.href = '/'}
                handleNavigate={handleNavigate}
              />
            }
          />

          {/* Search */}
          <Route
            path="/search"
            element={
              <BusinessSearch
                language={language}
                initialSearchTerm={searchTerm}
                onClose={() => handleNavigate('home')}
              />
            }
          />

          {/* About */}
          <Route
            path="/about"
            element={<About language={language} onClose={() => handleNavigate('home')} />}
          />

          {/* Contact */}
          <Route
            path="/contact"
            element={<Contact language={language} onClose={() => handleNavigate('home')} />}
          />

          {/* Business Listing */}
          <Route path="/business/:id" element={<BusinessListing language={language} />} />

          {/* User Dashboard */}
          <Route
            path="/user-dashboard"
            element={
              <UserDashboard
                language={language}
                onClose={() => window.location.href = '/'}
              />
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={<Dashboard language={language} />}
          />

          {/* Admin Setup */}
          <Route
            path="/admin/setup"
            element={<Setup onComplete={handleSetupComplete} />}
          />
        </Routes>

        {/* Auth Modal for admin or user login */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            // once the user logs in successfully, go to the register page
            window.location.href = '/register';
          }}
          language={language}
        />
      </div>
    </Router>
  );
}
