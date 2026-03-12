import React, { useState } from 'react';
import { X, Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { authService } from '@/services/api';

// Map C# API error keys to French messages
const errorTranslations = {
  DuplicateUserName: 'Cet email est deja utilise',
  DuplicateEmail: 'Cet email est deja utilise',
  PhoneNumber: 'Numero de telephone invalide (ex: +33612345678)',
  PasswordTooShort: 'Le mot de passe doit contenir au moins 6 caracteres',
  PasswordRequiresDigit: 'Le mot de passe doit contenir un chiffre',
  PasswordRequiresUpper: 'Le mot de passe doit contenir une majuscule',
  PasswordRequiresLower: 'Le mot de passe doit contenir une minuscule',
  PasswordRequiresNonAlphanumeric: 'Le mot de passe doit contenir un caractere special',
  FirstName: 'Le prenom est obligatoire',
  LastName: 'Le nom est obligatoire',
  Password: 'Le mot de passe est obligatoire',
  Email: 'L\'email est invalide',
  InvalidEmail: 'L\'email est invalide',
};

const parseApiErrors = (error) => {
  const detail = error?.response?.data?.detail || error?.response?.data;
  const errors = {};
  if (typeof detail === 'object' && detail !== null) {
    for (const [key, val] of Object.entries(detail)) {
      const msg = Array.isArray(val) ? val[0] : val;
      // Map error key to field name
      if (key.includes('UserName') || key.includes('Email') || key.includes('email')) {
        errors.email = errorTranslations[key] || msg;
      } else if (key.includes('Phone')) {
        errors.phone = errorTranslations[key] || msg;
      } else if (key.includes('Password') || key.includes('password')) {
        errors.password = errorTranslations[key] || msg;
      } else if (key.includes('FirstName') || key.includes('firstName')) {
        errors.firstName = errorTranslations[key] || msg;
      } else if (key.includes('LastName') || key.includes('lastName')) {
        errors.lastName = errorTranslations[key] || msg;
      } else {
        errors.general = errorTranslations[key] || msg;
      }
    }
  } else if (typeof detail === 'string') {
    errors.general = detail;
  }
  return errors;
};

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
    phone: '', confirmPassword: '', agreeTerms: false,
  });

  const resetForm = () => {
    setStep('form');
    setErrors({});
    setRegisteredEmail('');
    setVerifyCode('');
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: '', agreeTerms: false });
  };

  const handleClose = () => { resetForm(); onClose(); };
  const handleSwitchMode = (newMode) => { resetForm(); onSwitchMode(newMode); };

  const formatPhone = (p) => {
    const cleaned = p.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0')) return '+33' + cleaned.slice(1);
    return '+33' + cleaned;
  };

  // Client-side validation
  const validateSignUp = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prenom est obligatoire';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est obligatoire';
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'L\'email est invalide';
    if (!formData.phone.trim()) newErrors.phone = 'Le telephone est obligatoire';
    else {
      const formatted = formatPhone(formData.phone);
      if (formatted.length < 10) newErrors.phone = 'Numero de telephone invalide (ex: +33612345678)';
    }
    if (!formData.password) newErrors.password = 'Le mot de passe est obligatoire';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmez le mot de passe';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Veuillez accepter les conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateSignUp()) return;
    setLoading(true);
    setErrors({});
    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formatPhone(formData.phone),
        password: formData.password,
        gender: 'male',
      });
      try { await authService.sendVerificationEmail(formData.email); } catch {}
      setRegisteredEmail(formData.email);
      try { await login({ email: formData.email, password: formData.password }); } catch {}
      toast.success('Inscription reussie ! Verifiez votre email.');
      setStep('verify');
    } catch (error) {
      const apiErrors = parseApiErrors(error);
      setErrors(apiErrors);
      if (apiErrors.general) {
        toast.error(apiErrors.general);
      } else {
        const firstError = Object.values(apiErrors)[0];
        if (firstError) toast.error(firstError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify email code
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      setErrors({ code: 'Entrez le code recu par email' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const result = await authService.verifyCode(verifyCode);
      if (result.accessToken) {
        localStorage.setItem('auth_token', result.accessToken);
        localStorage.setItem('user', JSON.stringify({ token: result.accessToken }));
      }
      setStep('verified');
      toast.success('Email verifie ! Votre compte est actif.');
      setTimeout(handleClose, 2000);
    } catch {
      setErrors({ code: 'Code invalide. Verifiez votre email et reessayez.' });
      toast.error('Code de verification invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.sendVerificationEmail(registeredEmail);
      toast.success('Email de verification renvoye !');
    } catch {
      toast.error('Impossible de renvoyer l\'email');
    } finally {
      setLoading(false);
    }
  };

  // Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
    if (!formData.password) newErrors.password = 'Le mot de passe est obligatoire';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    setErrors({});
    try {
      await login({ email: formData.email, password: formData.password });
      toast.success('Connexion reussie !');
      handleClose();
    } catch (error) {
      const apiErrors = parseApiErrors(error);
      if (Object.keys(apiErrors).length > 0) {
        setErrors({ general: Object.values(apiErrors)[0] || 'Identifiants incorrects' });
      } else {
        setErrors({ general: 'Identifiants incorrects' });
      }
      toast.error('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  if (!isOpen) return null;

  const inputCls = (field) => `w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
    errors[field] ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-[#2ecc71]'
  }`;

  const FieldError = ({ field }) => errors[field] ? (
    <div className="flex items-center gap-1 mt-1" data-testid={`error-${field}`}>
      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
      <p className="text-xs text-red-400">{errors[field]}</p>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[#1a2332] rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a2332] border-b border-gray-700/50 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          {step === 'form' ? (
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
          ) : (
            <h3 className="text-lg font-medium text-white">Verification email</h3>
          )}
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" data-testid="close-auth-modal">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* General error banner */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2" data-testid="error-general">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{errors.general}</p>
            </div>
          )}

          {/* ===== SIGN IN ===== */}
          {mode === 'signin' && step === 'form' && (
            <form onSubmit={handleSignIn} className="space-y-4" data-testid="signin-form">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email *</label>
                <input type="text" name="email" value={formData.email} onChange={handleChange}
                  placeholder="email@exemple.com" className={inputCls('email')} data-testid="signin-email" />
                <FieldError field="email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mot de passe *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  placeholder="Votre mot de passe" className={inputCls('password')} data-testid="signin-password" />
                <FieldError field="password" />
              </div>
              <button type="submit" disabled={loading} data-testid="signin-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter'}
              </button>
            </form>
          )}

          {/* ===== SIGN UP ===== */}
          {mode === 'signup' && step === 'form' && (
            <form onSubmit={handleSignUp} className="space-y-3" data-testid="signup-form">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Prenom *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    placeholder="Prenom" className={inputCls('firstName')} data-testid="signup-firstname" />
                  <FieldError field="firstName" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Nom *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    placeholder="Nom" className={inputCls('lastName')} data-testid="signup-lastname" />
                  <FieldError field="lastName" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="email@exemple.com" className={inputCls('email')} data-testid="signup-email" />
                <FieldError field="email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Telephone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="+33 6 12 34 56 78" className={inputCls('phone')} data-testid="signup-phone" />
                <FieldError field="phone" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Mot de passe *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  placeholder="Minimum 6 caracteres" className={inputCls('password')} data-testid="signup-password" />
                <FieldError field="password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Confirmer *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Confirmer le mot de passe" className={inputCls('confirmPassword')} data-testid="signup-confirm-password" />
                <FieldError field="confirmPassword" />
              </div>
              <div>
                <div className="flex items-start gap-2.5 pt-1">
                  <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-[#2ecc71] bg-gray-700 border-gray-600 rounded" data-testid="signup-terms" />
                  <label className="text-xs text-gray-400">J'accepte les <span className="text-[#2ecc71] underline cursor-pointer">Conditions d'utilisation</span> et la <span className="text-[#2ecc71] underline cursor-pointer">Politique de confidentialite</span></label>
                </div>
                <FieldError field="agreeTerms" />
              </div>
              <button type="submit" disabled={loading} data-testid="signup-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Inscription...</> : 'S\'inscrire'}
              </button>
            </form>
          )}

          {/* ===== VERIFY EMAIL ===== */}
          {step === 'verify' && (
            <div data-testid="verify-email-step">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#2ecc71]" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Verifiez votre email</h3>
                <p className="text-sm text-gray-400">
                  Un code de verification a ete envoye a <span className="text-white font-medium">{registeredEmail}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Verifiez aussi votre dossier spam</p>
              </div>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Code de verification</label>
                  <input type="text" value={verifyCode} onChange={(e) => { setVerifyCode(e.target.value); if (errors.code) setErrors({}); }}
                    placeholder="Entrez le code recu par email" className={inputCls('code')} data-testid="verify-code-input" />
                  <FieldError field="code" />
                </div>
                <button type="submit" disabled={loading} data-testid="verify-submit"
                  className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verification...</> : 'Verifier'}
                </button>
              </form>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
                <button onClick={handleResend} disabled={loading} className="text-sm text-gray-400 hover:text-[#2ecc71] transition-colors" data-testid="resend-email-btn">
                  Renvoyer l'email
                </button>
                <button onClick={handleClose} className="text-sm text-gray-400 hover:text-white transition-colors" data-testid="skip-verify-btn">
                  Continuer sans verifier
                </button>
              </div>
            </div>
          )}

          {/* ===== VERIFIED ===== */}
          {step === 'verified' && (
            <div className="text-center py-6" data-testid="verified-step">
              <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#2ecc71]" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Email verifie !</h3>
              <p className="text-sm text-gray-400">Votre compte est maintenant actif.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
