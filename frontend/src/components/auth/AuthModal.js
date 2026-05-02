import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Loader2, Mail, CheckCircle, AlertCircle, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { authService } from '@/services/api';
import PhoneInput from '@/components/PhoneInput';

const GOOGLE_CLIENT_ID = '71410638404-lnkcacu3k26efkhd76us4jp1ha1dahtf.apps.googleusercontent.com';

// Map C# API error keys to French messages
const errorTranslations = {
  DuplicateUserName: 'Cet email est déjà utilisé',
  DuplicateEmail: 'Cet email est déjà utilisé',
  PhoneNumber: 'Numéro de téléphone invalide (ex: +33612345678)',
  PasswordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
  PasswordRequiresDigit: 'Le mot de passe doit contenir un chiffre',
  PasswordRequiresUpper: 'Le mot de passe doit contenir une majuscule',
  PasswordRequiresLower: 'Le mot de passe doit contenir une minuscule',
  PasswordRequiresNonAlphanumeric: 'Le mot de passe doit contenir un caractère spécial',
  FirstName: 'Le prénom est obligatoire',
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

// Dynamically load Google Identity Services
let gisPromise = null;
function loadGIS() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return gisPromise;
}

// Google Sign-In button (rendered via GIS library)
const GoogleSignInButton = ({ onSuccess, disabled }) => {
  const btnRef = useRef(null);
  const [gisReady, setGisReady] = useState(false);

  useEffect(() => {
    loadGIS().then(() => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) onSuccess(response.credential);
        },
        auto_select: false,
        ux_mode: 'popup',
      });
      setGisReady(true);
    }).catch(() => {});
  }, [onSuccess]);

  useEffect(() => {
    if (gisReady && btnRef.current) {
      window.google.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: btnRef.current.offsetWidth || 340,
        locale: 'fr',
      });
    }
  }, [gisReady]);

  if (!gisReady) {
    return (
      <button disabled className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-gray-600 bg-gray-700/30 text-gray-400 text-sm font-medium">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement Google...
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={btnRef} data-testid="google-signin-button" className="w-full" style={{ minHeight: 44, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }} />
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login, loginDirect } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
    phone: '', confirmPassword: '', agreeTerms: false,
  });
  const [phoneCountry, setPhoneCountry] = useState('+33');

  const resetForm = () => {
    setStep('form');
    setErrors({});
    setRegisteredEmail('');
    setVerifyCode('');
    setForgotEmail('');
    setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', confirmPassword: '', agreeTerms: false });
    setPhoneCountry('+33');
  };

  const handleClose = () => { resetForm(); onClose(); };
  const handleSwitchMode = (newMode) => { resetForm(); onSwitchMode(newMode); };

  const formatPhone = (p) => {
    const cleaned = p.replace(/[^0-9]/g, '');
    if (!cleaned) return '';
    const num = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    return phoneCountry + num;
  };

  // Google Sign-In handler
  const handleGoogleSuccess = useCallback(async (idToken) => {
    setLoading(true);
    setErrors({});
    try {
      const result = await authService.googleLogin(idToken);
      if (result.user) {
        loginDirect(result.user);
      }
      toast.success('Connexion Google réussie !');
      handleClose();
    } catch (error) {
      const apiErrors = parseApiErrors(error);
      if (Object.keys(apiErrors).length > 0) {
        setErrors({ general: Object.values(apiErrors)[0] || 'Erreur de connexion Google' });
      } else {
        setErrors({ general: 'Erreur de connexion Google. Réessayez.' });
      }
      toast.error('Erreur de connexion Google');
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Client-side validation
  const validateSignUp = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est obligatoire';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est obligatoire';
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'L\'email est invalide';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est obligatoire';
    else {
      const formatted = formatPhone(formData.phone);
      if (formatted.length < 10) newErrors.phone = 'Numéro de téléphone invalide (ex: +33612345678)';
    }
    if (!formData.password) newErrors.password = 'Le mot de passe est obligatoire';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
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
      toast.success('Inscription réussie ! Vérifiez votre email.');
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
      setErrors({ code: 'Entrez le code reçu par email' });
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
      toast.success('Email vérifié ! Votre compte est actif.');
      setTimeout(handleClose, 2000);
    } catch {
      setErrors({ code: 'Code invalide. Vérifiez votre email et réessayez.' });
      toast.error('Code de verification invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authService.sendVerificationEmail(registeredEmail);
      toast.success('Email de vérification renvoyé !');
    } catch {
      toast.error('Impossible de renvoyer l\'email');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - send email
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrors({ forgotEmail: 'L\'email est obligatoire' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors({ forgotEmail: 'L\'email est invalide' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await authService.forgotPassword(forgotEmail);
      toast.success('Email de reinitialisation envoye !');
      setStep('forgot-sent');
    } catch {
      setErrors({ forgotEmail: 'Impossible d\'envoyer l\'email. Vérifiez l\'adresse.' });
      toast.error('Erreur lors de l\'envoi de l\'email');
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
      toast.success('Connexion réussie !');
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

  // AI Auto-fill parser for signup
  const [aiSignupText, setAiSignupText] = useState('');
  const [aiSignupDone, setAiSignupDone] = useState(false);

  const parseUserInfo = (text) => {
    const result = { firstName: '', lastName: '', email: '', phone: '' };
    let remaining = text;

    // Extract email
    const emailMatch = remaining.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) {
      result.email = emailMatch[0];
      remaining = remaining.replace(emailMatch[0], ' ');
    }

    // Extract phone (international formats)
    const phoneMatch = remaining.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}/);
    if (phoneMatch) {
      const cleaned = phoneMatch[0].replace(/[^\d+]/g, '');
      if (cleaned.length >= 8) {
        result.phone = cleaned.startsWith('+') ? cleaned.replace(/^\+\d{1,3}/, '') : (cleaned.startsWith('0') ? cleaned : cleaned);
        remaining = remaining.replace(phoneMatch[0], ' ');
      }
    }

    // Remaining = name (trim and split)
    const nameParts = remaining.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '').trim().split(/\s+/).filter(Boolean);
    if (nameParts.length >= 2) {
      result.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
      result.lastName = nameParts.slice(1).map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');
    } else if (nameParts.length === 1) {
      result.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    }

    // Bonus: extract name from email if missing
    if (!result.firstName && result.email) {
      const local = result.email.split('@')[0];
      const parts = local.split(/[._-]/).filter(Boolean);
      if (parts.length >= 2) {
        result.firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        result.lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      } else if (parts.length === 1) {
        result.firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    }

    return result;
  };

  const handleAISignupFill = () => {
    if (!aiSignupText.trim()) return;
    const parsed = parseUserInfo(aiSignupText);
    setFormData(prev => ({
      ...prev,
      firstName: parsed.firstName || prev.firstName,
      lastName: parsed.lastName || prev.lastName,
      email: parsed.email || prev.email,
      phone: parsed.phone || prev.phone,
    }));
    setAiSignupDone(true);
    setTimeout(() => setAiSignupDone(false), 2000);
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

  const isFormStep = step === 'form' || step === 'forgot' || step === 'forgot-sent';

  // Divider between Google and classic auth
  const OrDivider = () => (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-700" />
      <span className="text-xs text-gray-500 uppercase tracking-wider">ou</span>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );

  if (!isOpen) return null;

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
          ) : step === 'forgot' || step === 'forgot-sent' ? (
            <div className="flex items-center gap-2">
              <button onClick={() => { setStep('form'); setErrors({}); setForgotEmail(''); }} className="text-gray-400 hover:text-white transition-colors" data-testid="back-to-signin">
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-lg font-medium text-white">Mot de passe oublié</h3>
            </div>
          ) : (
            <h3 className="text-lg font-medium text-white">
              {step === 'verify' ? 'Vérification email' : step === 'verified' ? 'Compte activé' : ''}
            </h3>
          )}
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" data-testid="close-auth-modal">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* General error banner */}
          {errors.general && (
            <div className="mb-4 p-3.5 bg-red-500/15 border border-red-500/40 rounded-lg flex items-start gap-2.5 animate-[shake_0.3s_ease-in-out]" data-testid="error-general">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-medium">{errors.general}</p>
            </div>
          )}

          {/* ===== SIGN IN ===== */}
          {mode === 'signin' && step === 'form' && (
            <>
              <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={loading} />
              <OrDivider />
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
                <div className="flex justify-end">
                  <button type="button" onClick={() => { setStep('forgot'); setErrors({}); setForgotEmail(formData.email); }}
                    className="text-sm text-[#2ecc71] hover:text-[#27ae60] transition-colors" data-testid="forgot-password-link">
                    Mot de passe oublie ?
                  </button>
                </div>
                <button type="submit" disabled={loading} data-testid="signin-submit"
                  className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter'}
                </button>
              </form>
            </>
          )}

          {/* ===== SIGN UP ===== */}
          {mode === 'signup' && step === 'form' && (
            <>
              {/* AI Auto-fill Block */}
              <div className="mb-4 bg-[#2ecc71]/5 rounded-xl p-3 border border-[#2ecc71]/20" data-testid="ai-signup-block">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#2ecc71]" />
                  <p className="text-white font-semibold text-xs">Remplissez en 5 secondes avec IA</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiSignupText}
                    onChange={(e) => setAiSignupText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAISignupFill()}
                    placeholder="Ex: Jean Dupont 0612345678 jean@gmail.com"
                    className="flex-1 min-w-0 px-3 py-2 bg-gray-700/50 text-white placeholder-gray-500 rounded-lg border border-gray-600 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-xs outline-none"
                    data-testid="ai-signup-input"
                  />
                  <button
                    type="button"
                    onClick={handleAISignupFill}
                    disabled={!aiSignupText.trim()}
                    className={`px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${aiSignupDone ? 'bg-[#2ecc71] text-white' : 'bg-[#2ecc71] text-white hover:bg-[#27ae60] disabled:opacity-40 disabled:cursor-not-allowed'}`}
                    data-testid="ai-signup-btn"
                  >
                    {aiSignupDone ? <><CheckCircle className="w-3.5 h-3.5" /> OK</> : <><Sparkles className="w-3.5 h-3.5" /> AUTO</>}
                  </button>
                </div>
              </div>

              {/* Google Sign-In */}
              <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={loading} />
              <OrDivider />
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
                  <PhoneInput
                    value={formData.phone}
                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: null }); }}
                    onCountryChange={setPhoneCountry}
                    error={errors.phone}
                    darkMode={true}
                  />
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
            </>
          )}

          {/* ===== FORGOT PASSWORD - Enter email ===== */}
          {step === 'forgot' && (
            <div data-testid="forgot-password-step">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-[#2ecc71]" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Reinitialiser votre mot de passe</h3>
                <p className="text-sm text-gray-400">Entrez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                  <input type="text" value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); if (errors.forgotEmail) setErrors({}); }}
                    placeholder="email@exemple.com" className={inputCls('forgotEmail')} data-testid="forgot-email-input" />
                  <FieldError field="forgotEmail" />
                </div>
                <button type="submit" disabled={loading} data-testid="forgot-submit"
                  className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</> : 'Envoyer le lien'}
                </button>
              </form>
            </div>
          )}

          {/* ===== FORGOT PASSWORD - Email sent confirmation ===== */}
          {step === 'forgot-sent' && (
            <div className="text-center" data-testid="forgot-sent-step">
              <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#2ecc71]" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Email envoye !</h3>
              <p className="text-sm text-gray-400 mb-2">
                Un lien de reinitialisation a ete envoye a <span className="text-white font-medium">{forgotEmail}</span>
              </p>
              <p className="text-xs text-gray-500 mb-6">Verifiez aussi votre dossier spam. Le lien expire apres un certain temps.</p>
              <div className="space-y-3">
                <button onClick={() => { setStep('forgot'); setErrors({}); }} disabled={loading}
                  className="w-full bg-gray-700/50 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-2" data-testid="forgot-resend-btn">
                  Renvoyer l'email
                </button>
                <button onClick={() => { setStep('form'); setErrors({}); }}
                  className="w-full text-sm text-gray-400 hover:text-[#2ecc71] transition-colors py-2" data-testid="forgot-back-signin">
                  Retour a la connexion
                </button>
              </div>
            </div>
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
