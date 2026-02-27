import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ChevronDown } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('France');

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#1a2332] shadow-lg z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Icon */}
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                {/* Logo Icon */}
                <div className="text-white">
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
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                to="/become-driver"
                className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
              >
                Become a Driver
              </Link>
              <Link
                to="/become-client"
                className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
              >
                Become a Client
              </Link>
              <Link
                to="/countries"
                className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
              >
                Countries
              </Link>
              <Link
                to="/help"
                className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
              >
                Help
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

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">Hello, {user?.name || 'User'}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-6 py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors uppercase tracking-wider"
                  >
                    SIGN UP
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
                to="/become-driver"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:text-gray-300 py-2 text-sm font-medium"
              >
                Become a Driver
              </Link>
              <Link
                to="/become-client"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:text-gray-300 py-2 text-sm font-medium"
              >
                Become a Client
              </Link>
              <Link
                to="/countries"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:text-gray-300 py-2 text-sm font-medium"
              >
                Countries
              </Link>
              <Link
                to="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:text-gray-300 py-2 text-sm font-medium"
              >
                Help
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

              {isAuthenticated ? (
                <>
                  <div className="text-gray-300 py-2 text-sm">Hello, {user?.name || 'User'}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="w-full px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded hover:bg-gray-700"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded hover:bg-gray-600 uppercase"
                  >
                    SIGN UP
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
