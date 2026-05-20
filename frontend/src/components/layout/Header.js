import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, X, ChevronDown, Globe, Phone } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

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

            {/* Phone number — always visible */}
            <a
              href="tel:+33783777027"
              className="flex items-center gap-1.5 text-[#25D366] hover:text-[#20bd5a] transition-colors lg:hidden"
              data-testid="header-phone-mobile"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span className="text-xs font-semibold">+33 7 83 77 70 27</span>
            </a>

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
              {/* Services Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors text-sm font-medium"
                  data-testid="nav-services-dropdown"
                >
                  <span>Services</span>
                  <ChevronDown size={16} />
                </button>
                {servicesDropdownOpen && (
                  <div className="absolute top-full mt-2 bg-[#1a2332] border border-gray-700 rounded shadow-lg py-2 min-w-[240px]">
                    <Link
                      to={language === 'en' ? '/driver-at-disposal' : language === 'ru' ? '/voditel-s-avtomobilem' : language === 'hy' ? '/varorde-tramadrutyamb' : '/chauffeur-mis-a-disposition'}
                      onClick={() => setServicesDropdownOpen(false)}
                      className="block px-4 py-2 text-[#c8a951] hover:bg-gray-700 transition-colors text-sm font-medium"
                      data-testid="nav-driver-at-disposal"
                    >
                      {language === 'en' ? 'Driver at Disposal' : language === 'ru' ? 'Водитель в распоряжение' : language === 'hy' ? 'Վարորդ տրամադրությամբ' : 'Chauffeur mis à disposition'}
                    </Link>
                    <div className="border-t border-gray-700 my-1" />
                    <Link
                      to={language === 'en' ? '/vtc-7-seats' : language === 'ru' ? '/vtc-7-mest' : language === 'hy' ? '/vtc-7-tegh' : '/vtc-7-places'}
                      onClick={() => setServicesDropdownOpen(false)}
                      className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm"
                      data-testid="nav-vtc-7-places"
                    >
                      {language === 'en' ? 'Minivan 7 Seats' : language === 'ru' ? 'Минивэн 7 Мест' : language === 'hy' ? 'VTC 7 Տեղ' : 'VTC 7 Places'}
                    </Link>
                    <Link
                      to={language === 'en' ? '/vtc-8-seats' : language === 'ru' ? '/vtc-8-mest' : language === 'hy' ? '/vtc-8-tegh' : '/vtc-8-places'}
                      onClick={() => setServicesDropdownOpen(false)}
                      className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm"
                      data-testid="nav-vtc-8-places"
                    >
                      {language === 'en' ? 'Minibus 8 Seats' : language === 'ru' ? 'Минибус 8 Мест' : language === 'hy' ? 'VTC 8 Տեղ' : 'VTC 8 Places'}
                    </Link>
                  </div>
                )}
              </div>
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

              {/* Phone — Desktop */}
              <a
                href="tel:+33783777027"
                className="flex items-center gap-1.5 text-[#25D366] hover:text-[#20bd5a] transition-colors"
                data-testid="header-phone-desktop"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="text-xs font-semibold">+33 7 83 77 70 27</span>
              </a>



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
                  <a href="/my-account" className="px-4 py-2 text-sm font-medium text-[#c8a951] hover:text-[#d4b85c] transition-colors" data-testid="my-account-link">
                    {t('nav.myAccount')}
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
              <div className="py-1 pl-2 border-l-2 border-gray-600 space-y-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Services</p>
                <Link to={language === 'en' ? '/driver-at-disposal' : language === 'ru' ? '/voditel-s-avtomobilem' : language === 'hy' ? '/varorde-tramadrutyamb' : '/chauffeur-mis-a-disposition'} onClick={() => setMobileMenuOpen(false)} className="block text-[#c8a951] hover:text-[#d4b85c] py-1 text-sm font-medium" data-testid="nav-driver-at-disposal-mobile">{language === 'en' ? 'Driver at Disposal' : language === 'ru' ? 'Водитель в распоряжение' : language === 'hy' ? 'Վարորդ տրամադրությամբ' : 'Chauffeur mis à disposition'}</Link>
                <Link to={language === 'en' ? '/vtc-7-seats' : language === 'ru' ? '/vtc-7-mest' : language === 'hy' ? '/vtc-7-tegh' : '/vtc-7-places'} onClick={() => setMobileMenuOpen(false)} className="block text-white hover:text-gray-300 py-1 text-sm" data-testid="nav-vtc-7-mobile">{language === 'en' ? 'Minivan 7 Seats' : language === 'ru' ? 'Минивэн 7 Мест' : language === 'hy' ? 'VTC 7 Տեղ' : 'VTC 7 Places'}</Link>
                <Link to={language === 'en' ? '/vtc-8-seats' : language === 'ru' ? '/vtc-8-mest' : language === 'hy' ? '/vtc-8-tegh' : '/vtc-8-places'} onClick={() => setMobileMenuOpen(false)} className="block text-white hover:text-gray-300 py-1 text-sm" data-testid="nav-vtc-8-mobile">{language === 'en' ? 'Minibus 8 Seats' : language === 'ru' ? 'Минибус 8 Мест' : language === 'hy' ? 'VTC 8 Տեղ' : 'VTC 8 Places'}</Link>
              </div>
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
                  <a href="/my-account" className="block w-full px-4 py-2 text-sm font-medium text-[#c8a951] border border-[#c8a951]/30 rounded hover:bg-[#c8a951]/10 text-center" data-testid="my-account-link-mobile">
                    {t('nav.myAccount')}
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
