import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api';

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
    phone: '', confirmPassword: '', agreeTerms: false,
  });

  const handleClose = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: '', agreeTerms: false });
    onClose();
  };

  const handleSwitchMode = (newMode) => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: '', agreeTerms: false });
    onSwitchMode(newMode);
  };

  const formatPhone = (p) => {
    const cleaned = p.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0')) return '+33' + cleaned.slice(1);
    return '+33' + cleaned;
  };

  // Sign Up - direct registration via C# API
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caracteres', variant: 'destructive' });
      return;
    }
    if (!formData.agreeTerms) {
      toast({ title: 'Erreur', description: 'Veuillez accepter les conditions', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formatPhone(formData.phone),
        password: formData.password,
        gender: 'male',
      });
      toast({ title: 'Inscription reussie !', description: 'Un code de verification a ete envoye a ' + formData.email });
      // Auto-login after registration
      try {
        await login({ email: formData.email, password: formData.password });
        handleClose();
      } catch {
        handleSwitchMode('signin');
      }
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.data;
      let msg = 'Erreur lors de l\'inscription. Veuillez reessayer.';
      if (typeof detail === 'object') {
        const vals = Object.values(detail);
        if (vals.length > 0 && Array.isArray(vals[0])) msg = vals[0][0];
        else if (typeof vals[0] === 'string') msg = vals[0];
      } else if (typeof detail === 'string') {
        msg = detail;
      }
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email: formData.email, password: formData.password });
      toast({ title: 'Connexion reussie', description: 'Bienvenue sur Zont !' });
      handleClose();
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.data;
      let msg = 'Identifiants incorrects';
      if (typeof detail === 'object') {
        const vals = Object.values(detail);
        if (vals.length > 0 && Array.isArray(vals[0])) msg = vals[0][0];
      } else if (typeof detail === 'string') {
        msg = detail;
      }
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  if (!isOpen) return null;

  const inputCls = 'w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[#1a2332] rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header Tabs */}
        <div className="sticky top-0 bg-[#1a2332] border-b border-gray-700/50 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <div className="flex space-x-6">
            <button onClick={() => handleSwitchMode('signup')} data-testid="tab-signup"
              className={`text-lg font-medium pb-1 transition-colors ${mode === 'signup' ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]' : 'text-gray-400 hover:text-white'}`}>
              Sign up
            </button>
            <button onClick={() => handleSwitchMode('signin')} data-testid="tab-signin"
              className={`text-lg font-medium pb-1 transition-colors ${mode === 'signin' ? 'text-[#2ecc71] border-b-2 border-[#2ecc71]' : 'text-gray-400 hover:text-white'}`}>
              Sign in
            </button>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" data-testid="close-auth-modal">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ===== SIGN IN ===== */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4" data-testid="signin-form">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email *</label>
                <input type="text" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="email@exemple.com" className={inputCls} data-testid="signin-email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mot de passe *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Votre mot de passe" className={inputCls} data-testid="signin-password" />
              </div>
              <button type="submit" disabled={loading} data-testid="signin-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter'}
              </button>
            </form>
          )}

          {/* ===== SIGN UP ===== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5" data-testid="signup-form">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Prenom *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                    placeholder="Prenom" className={inputCls} data-testid="signup-firstname" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Nom *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                    placeholder="Nom" className={inputCls} data-testid="signup-lastname" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="email@exemple.com" className={inputCls} data-testid="signup-email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Telephone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                  placeholder="+33 6 12 34 56 78" className={inputCls} data-testid="signup-phone" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Mot de passe *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Minimum 6 caracteres" className={inputCls} data-testid="signup-password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Confirmer *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                  placeholder="Confirmer le mot de passe" className={inputCls} data-testid="signup-confirm-password" />
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange}
                  className="mt-0.5 w-4 h-4 accent-[#2ecc71] bg-gray-700 border-gray-600 rounded" data-testid="signup-terms" />
                <label className="text-xs text-gray-400">J'accepte les <span className="text-[#2ecc71] underline cursor-pointer">Conditions d'utilisation</span> et la <span className="text-[#2ecc71] underline cursor-pointer">Politique de confidentialite</span></label>
              </div>
              <button type="submit" disabled={loading} data-testid="signup-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Inscription...</> : 'S\'inscrire'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
