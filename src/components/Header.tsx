import React, { useState, useEffect } from 'react';
import { MapPin, Menu, Search, Globe2, Settings, LogIn, LogOut, LayoutDashboard, User, Bell, X, Store } from 'lucide-react';
import { Language, SiteConfig, AdminState } from '../types';
import { translations } from '../i18n/translations';
import { Setup } from './admin/Setup';
import { AuthModal } from './auth/AuthModal';
import { supabase } from '../lib/supabaseClient';
import { NotificationCenter } from './notifications/NotificationCenter';
import { UserDashboard } from './user/UserDashboard';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  language: Language;
  setLanguage: (language: Language) => void;
  config: SiteConfig | null;
  onUpdateConfig: (config: SiteConfig) => void;
  adminState: AdminState;
  onAdminLogin: (email: string, password: string) => Promise<boolean>;  // ✅ Update here
  onAdminLogout: () => void;
  onRegisterClick: () => void;
  onAdminDashboardClick: () => void;
  onSearch: (term?: string) => void;
  onNavigate: (page: 'home' | 'about' | 'contact' | 'create-boutique' | 'boutique') => void;
}

export function Header({
  language,
  setLanguage,
  config,
  onUpdateConfig,
  adminState,
  onAdminLogin,
  onAdminLogout,
  onRegisterClick,
  onAdminDashboardClick,
  onSearch,
  onNavigate
}: HeaderProps) {
  console.log('Header adminState:', adminState); // <--- Add this line

  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleAuthSuccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setShowAuthModal(false); // ✅ Ensures modal closes here too
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    onAdminLogout();
    setUserMenuOpen(false);
    setShowUserDashboard(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    if (typeof searchTerm !== 'string') {
      console.error("🚨 Invalid searchTerm:", searchTerm);
      return;
    }

    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());  // ✅ Pass only a string
      setSearchTerm('');
    }
  };




  const handleMobileNavigation = (page: 'home' | 'about' | 'contact') => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  // Temporary function to handle boutique navigation
  const handleBoutiqueClick = () => {
    onNavigate('boutique');
  };


  return (
    <>
      <header className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => handleMobileNavigation('home')}
                className="flex items-center"
              >
                <img
                  src="/favicon/android-chrome-192x192.png"
                  alt="CanaSource Icon"
                  className="h-8 w-8"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">CanaSource</span>

              </button>

              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => onNavigate('about')}
                  className="text-gray-700 hover:text-red-600"
                >
                  {translations.nav.about[language]}
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-gray-700 hover:text-red-600"
                >
                  {translations.nav.contact[language]}
                </button>
                {/* Temporary Boutique Link */}
                {/* <button
                  onClick={handleBoutiqueClick}
                  className="flex items-center text-gray-700 hover:text-red-600"
                >
                  <Store className="h-5 w-5 mr-1" />
                  <span>{language === 'en' ? 'Boutique' : 'Boutique'}</span>
                </button> */}
              </nav>
            </div>

            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      console.log("Search term input change:", e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={translations.nav.search[language]}
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newLang = language === 'en' ? 'fr' : 'en';
                  setLanguage(newLang);
                  localStorage.setItem('preferredLanguage', newLang);
                }}
                className="flex items-center text-gray-700 hover:text-red-600"
              >
                <Globe2 className="h-5 w-5 mr-1" />
                <div className="flex items-center space-x-1">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: language === 'en' ? '#dc2626' : '#3b82f6' }} />
                  <span className="uppercase">{language === 'en' ? 'FR' : 'EN'}</span>
                </div>
              </button>


              {user ? (
                <div className="relative flex items-center space-x-4">
                  <NotificationCenter language={language} />

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-sm hidden md:block">
                        {user.email?.split('@')[0]}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        {/* Show both dashboards for admin */}
                        {adminState.isAuthenticated && (
                          <>
                            <button
                              onClick={() => {
                                onAdminDashboardClick();
                                setUserMenuOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <LayoutDashboard className="h-4 w-4 inline-block mr-2" />
                              {language === 'en' ? 'Admin Dashboard' : 'Tableau de bord admin'}
                            </button>
                            <button
                              onClick={() => {
                                setShowUserDashboard(true);
                                setUserMenuOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <User className="h-4 w-4 inline-block mr-2" />
                              {language === 'en' ? 'My Dashboard' : 'Mon tableau de bord'}
                            </button>
                          </>
                        )}
                        {/* Show only user dashboard for regular users */}
                        {!adminState.isAuthenticated && (
                          <button
                            onClick={() => {
                              setShowUserDashboard(true);
                              setUserMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <User className="h-4 w-4 inline-block mr-2" />
                            {language === 'en' ? 'My Dashboard' : 'Mon tableau de bord'}
                          </button>
                        )}
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 inline-block mr-2" />
                          {language === 'en' ? 'Sign Out' : 'Déconnexion'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center text-gray-700 hover:text-red-600"
                  aria-label="Sign In"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="ml-2 hidden md:block">
                    {language === 'en' ? 'Sign In' : 'Connexion'}
                  </span>
                </button>
              )}

              <button
                onClick={onRegisterClick}
                className="hidden md:block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                {translations.register[language]}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-gray-700 hover:text-red-600"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`
          fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity duration-300 md:hidden
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div className={`
            fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-red-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-6 space-y-6">
              <div className="space-y-4">
                <form onSubmit={handleSearchSubmit} className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={translations.nav.search[language]}
                    />
                  </div>
                </form>

                <button
                  onClick={() => handleMobileNavigation('about')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
                >
                  {translations.nav.about[language]}
                </button>
                <button
                  onClick={() => handleMobileNavigation('contact')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg"
                >
                  {translations.nav.contact[language]}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        language={language}
        onAdminLogin={onAdminLogin} // Pass the prop down
      />

      {showUserDashboard && (
        <UserDashboard
          language={language}
          onClose={() => setShowUserDashboard(false)}
        />
      )}
    </>
  );
}