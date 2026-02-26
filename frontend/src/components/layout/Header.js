import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#1a2332] shadow-lg z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-white tracking-wider">ZONT</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
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
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="px-6 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                >
                  Sign in
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1a2332] border-t border-gray-700">
            <div className="px-4 py-3 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="text-gray-300 py-2">Hello, {user?.name || 'User'}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="w-full px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Sign in
                </button>
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
