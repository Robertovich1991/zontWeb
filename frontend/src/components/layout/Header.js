import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('France');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setLangDropdownOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#1a2332] shadow-lg z-50 border-b border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Icon */}
            <Link to="/" className="flex-shrink-0" aria-label="Zont - Accueil">
              <div className="flex items-center space-x-3">
                <div className="text-white" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6L5 3H19L21 6V18L19 21H5L3 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="text-xl font-bold text-white tracking-wider">ZONT</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6" aria-label="Main navigation">
              <Link
                to="/become-client"
                className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
              >
                {t('nav.becomeClient')}
              </Link>
              <Link
                to="/countries"
                className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
              >
                {t('nav.countries')}
              </Link>
              <Link
                to="/help"
                className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
              >
                {t('nav.help')}
              </Link>
              <Link
                to="/partners"
                className="text-[#2ecc71] hover:text-[#27ae60] transition-colors text-sm font-semibold"
                data-testid="nav-partners"
              >
                B2B
              </Link>

              {/* Country Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors text-sm font-medium"
                >
                  <span>{selectedCountry}</span>
                  <ChevronDown size={16} />
                </button>
                {countryDropdownOpen && (
                  <div className="absolute top-full mt-2 bg-[#1a2332] border border-gray-700 rounded shadow-lg py-2 min-w-[150px]">
                    <button
                      onClick={() => handleCountrySelect('France')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors text-sm"
                    >
                      France
                    </button>
                    <button
                      onClick={() => handleCountrySelect('Armenia')}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors text-sm"
                    >
                      Armenia
                    </button>
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors text-sm font-medium bg-gray-700 px-3 py-2 rounded"
                >
                  <Globe size={16} />
                  <span>{currentLanguage.flag}</span>
                  <ChevronDown size={14} />
                </button>
                {langDropdownOpen && (
                  <div className="absolute top-full mt-2 bg-[#1a2332] border border-gray-700 rounded shadow-lg py-2 min-w-[150px] right-0">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors text-sm flex items-center space-x-2 ${
                          language === lang.code ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">{t('nav.hello')}, {user?.firstName || user?.name || 'Client'}</span>
                  <a href="/my-bookings" className="px-4 py-2 text-sm font-medium text-[#c8a951] hover:text-[#d4b85c] transition-colors" data-testid="my-bookings-link">
                    {t('nav.myBookings')}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    {t('nav.signout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    {t('nav.signin')}
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-6 py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors uppercase tracking-wider"
                  >
                    {t('nav.signup')}
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1a2332] border-t border-gray-700">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/become-client"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:text-gray-300 py-2 text-sm font-medium"
              >
                {t('nav.becomeClient')}
              </Link>
              <Link
                to="/countries"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:text-gray-300 py-2 text-sm font-medium"
              >
                {t('nav.countries')}
              </Link>
              <Link
                to="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:text-gray-300 py-2 text-sm font-medium"
              >
                {t('nav.help')}
              </Link>
              <Link
                to="/partners"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#2ecc71] hover:text-[#27ae60] py-2 text-sm font-semibold"
                data-testid="nav-partners-mobile"
              >
                B2B Partners
              </Link>

              <div className="py-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                >
                  <option value="France">France</option>
                  <option value="Armenia">Armenia</option>
                </select>
              </div>

              <div className="py-2">
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {isAuthenticated ? (
                <>
                  <div className="text-gray-300 py-2 text-sm">{t('nav.hello')}, {user?.firstName || user?.name || 'Client'}</div>
                  <a href="/my-bookings" className="block w-full px-4 py-2 text-sm font-medium text-[#c8a951] border border-[#c8a951]/30 rounded hover:bg-[#c8a951]/10 text-center" data-testid="my-bookings-link-mobile">
                    {t('nav.myBookings')}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    {t('nav.signout')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="w-full px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded hover:bg-gray-700"
                  >
                    {t('nav.signin')}
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 uppercase"
                  >
                    {t('nav.signup')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={(newMode) => setAuthMode(newMode)}
      />
    </>
  );
};

export default Header;
