import React, { useState } from 'react';
import { X, Phone, Shield, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api';

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'verify' | 'details'
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
    confirmPassword: '', agreeTerms: false,
  });

  const resetForm = () => {
    setStep('form');
    setPhone('');
    setVerificationCode('');
    setExpectedCode('');
    setFormData({ email: '', password: '', firstName: '', lastName: '', confirmPassword: '', agreeTerms: false });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSwitchMode = (newMode) => {
    resetForm();
    onSwitchMode(newMode);
  };

  const formatPhone = (p) => {
    const cleaned = p.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0')) return '+33' + cleaned.slice(1);
    return '+' + cleaned;
  };

  // Step 1: Send phone verification
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const formatted = formatPhone(phone);
      const result = await authService.registerPhone(formatted);
      setExpectedCode(result.phoneVerificationToken || '');
      setStep('verify');
      toast({ title: 'Code envoye', description: `Un code de verification a ete envoye au ${formatted}` });
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.data;
      toast({ title: 'Erreur', description: typeof detail === 'string' ? detail : 'Impossible d\'envoyer le code', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;
    setLoading(true);
    try {
      const formatted = formatPhone(phone);
      await authService.verifyPhone(formatted, verificationCode);
      setStep('details');
      toast({ title: 'Telephone verifie', description: 'Completez votre inscription' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Code de verification invalide', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
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
        phoneNumber: formatPhone(phone),
        password: formData.password,
        gender: 'male',
      });
      toast({ title: 'Inscription reussie', description: 'Votre compte a ete cree. Connectez-vous.' });
      resetForm();
      onSwitchMode('signin');
    } catch (error) {
      const detail = error?.response?.data?.detail;
      toast({ title: 'Erreur', description: typeof detail === 'string' ? detail : 'Erreur lors de l\'inscription. Veuillez reessayer.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email: formData.email, password: formData.password });
      toast({ title: 'Connexion reussie', description: 'Bienvenue sur Zont!' });
      handleClose();
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const msg = detail?.cannotLogin?.[0] || (typeof detail === 'string' ? detail : 'Identifiants incorrects');
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

  const inputCls = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="fixed inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-[#1a2332] rounded-xl shadow-2xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a2332] border-b border-gray-700/50 px-6 py-4 flex justify-between items-center z-10">
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
          <button onClick={handleClose} className="text-gray-400 hover:text-white" data-testid="close-auth-modal">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ===== SIGN IN ===== */}
          {mode === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4" data-testid="signin-form">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email ou Telephone *</label>
                <input type="text" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="email@exemple.com ou +33..." className={inputCls} data-testid="signin-email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mot de passe *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Votre mot de passe" className={inputCls} data-testid="signin-password" />
              </div>
              <button type="submit" disabled={loading} data-testid="signin-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter'}
              </button>
            </form>
          )}

          {/* ===== SIGN UP - Step 1: Phone ===== */}
          {mode === 'signup' && step === 'form' && (
            <form onSubmit={handleSendCode} className="space-y-4" data-testid="signup-phone-form">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-7 h-7 text-[#2ecc71]" />
                </div>
                <p className="text-sm text-gray-400">Entrez votre numero de telephone pour commencer</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Numero de telephone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                  placeholder="+33 6 12 34 56 78" className={inputCls} data-testid="signup-phone-input" />
              </div>
              <button type="submit" disabled={loading} data-testid="signup-send-code"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</> : 'Envoyer le code'}
              </button>
            </form>
          )}

          {/* ===== SIGN UP - Step 2: Verify Code ===== */}
          {mode === 'signup' && step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4" data-testid="signup-verify-form">
              <button type="button" onClick={() => setStep('form')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-2">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-[#2ecc71]" />
                </div>
                <p className="text-sm text-gray-400">Entrez le code envoye au <span className="text-white font-medium">{formatPhone(phone)}</span></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Code de verification *</label>
                <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required
                  placeholder="1234" className={`${inputCls} text-center text-2xl tracking-[0.5em] font-bold`}
                  maxLength={6} data-testid="signup-code-input" />
              </div>
              <button type="submit" disabled={loading} data-testid="signup-verify-btn"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verification...</> : 'Verifier'}
              </button>
              <button type="button" onClick={handleSendCode} className="w-full text-sm text-gray-400 hover:text-[#2ecc71] transition-colors"
                data-testid="resend-code-btn">
                Renvoyer le code
              </button>
            </form>
          )}

          {/* ===== SIGN UP - Step 3: Details ===== */}
          {mode === 'signup' && step === 'details' && (
            <form onSubmit={handleRegister} className="space-y-3.5" data-testid="signup-details-form">
              <button type="button" onClick={() => setStep('verify')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-2">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="text-center mb-3">
                <div className="w-14 h-14 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-7 h-7 text-[#2ecc71]" />
                </div>
                <p className="text-sm text-gray-400">Completez votre profil</p>
              </div>
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
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="email@exemple.com (optionnel)" className={inputCls} data-testid="signup-email" />
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
                  className="mt-0.5 w-4 h-4 text-[#2ecc71] bg-gray-700 border-gray-600 rounded" data-testid="signup-terms" />
                <label className="text-xs text-gray-400">J'accepte les Conditions d'utilisation et la Politique de confidentialite</label>
              </div>
              <button type="submit" disabled={loading} data-testid="signup-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
