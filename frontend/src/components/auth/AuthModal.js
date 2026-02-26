import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login({ email: formData.email, password: formData.password });
        toast({
          title: 'Login successful',
          description: 'Welcome to Zont!',
        });
        onClose();
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Error',
            description: 'Passwords do not match',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        if (!formData.agreeTerms) {
          toast({
            title: 'Error',
            description: 'You must agree to Terms of Services and Privacy Policy',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        await register({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        toast({
          title: 'Registration successful',
          description: 'Your account has been created successfully.',
        });
        onSwitchMode('signin');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1a2332] rounded-lg shadow-2xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a2332] border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <button
              onClick={() => onSwitchMode('signup')}
              className={`text-lg font-medium pb-2 transition-colors relative ${
                mode === 'signup'
                  ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => onSwitchMode('signin')}
              className={`text-lg font-medium pb-2 transition-colors relative ${
                mode === 'signin'
                  ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign in
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  FIRST NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                  placeholder="FIRST NAME"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  LAST NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                  placeholder="LAST NAME"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              EMAIL ADDRESS <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
              placeholder="EMAIL ADDRESS"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                MOBILE PHONE <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                placeholder="01 23 45 67 89"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              {mode === 'signup' ? 'CHOOSE PASSWORD' : 'PASSWORD'} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
              placeholder={mode === 'signup' ? 'CHOOSE PASSWORD' : 'PASSWORD'}
            />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                  placeholder="CONFIRM PASSWORD"
                />
              </div>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-[#2ecc71] bg-gray-700 border-gray-600 rounded focus:ring-[#2ecc71]"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-300">
                  I agree with Terms of Services and Privacy Policy
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2ecc71] text-white py-4 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
