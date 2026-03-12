import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || searchParams.get('code') || '';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.newPassword) newErrors.newPassword = 'Le nouveau mot de passe est obligatoire';
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Minimum 6 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmez le mot de passe';
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!token) newErrors.general = 'Token de reinitialisation manquant. Veuillez utiliser le lien recu par email.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      await authService.resetPassword(token, formData.newPassword);
      setSuccess(true);
      toast.success('Mot de passe reinitialise avec succes !');
      setTimeout(() => navigate('/'), 3000);
    } catch {
      setErrors({ general: 'Impossible de reinitialiser le mot de passe. Le lien a peut-etre expire.' });
      toast.error('Erreur lors de la reinitialisation');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) => `w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
    errors[field] ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-[#2ecc71]'
  }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="reset-password-page">
      <Header />
      <main className="flex-1 pt-16 flex items-center justify-center px-4">
        <div className="bg-[#1a2332] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
          {success ? (
            <div className="text-center py-6" data-testid="reset-success">
              <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#2ecc71]" />
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">Mot de passe reinitialise !</h2>
              <p className="text-sm text-gray-400 mb-4">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <p className="text-xs text-gray-500">Redirection automatique...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-[#2ecc71]" />
                </div>
                <h2 className="text-white text-xl font-semibold mb-2">Nouveau mot de passe</h2>
                <p className="text-sm text-gray-400">Choisissez un nouveau mot de passe pour votre compte.</p>
              </div>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2" data-testid="error-general">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{errors.general}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="reset-password-form">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Nouveau mot de passe *</label>
                  <input type="password" value={formData.newPassword}
                    onChange={(e) => { setFormData({ ...formData, newPassword: e.target.value }); if (errors.newPassword) setErrors({ ...errors, newPassword: null }); }}
                    placeholder="Minimum 6 caracteres" className={inputCls('newPassword')} data-testid="reset-new-password" />
                  {errors.newPassword && (
                    <div className="flex items-center gap-1 mt-1" data-testid="error-newPassword">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{errors.newPassword}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Confirmer *</label>
                  <input type="password" value={formData.confirmPassword}
                    onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null }); }}
                    placeholder="Confirmer le nouveau mot de passe" className={inputCls('confirmPassword')} data-testid="reset-confirm-password" />
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 mt-1" data-testid="error-confirmPassword">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{errors.confirmPassword}</p>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} data-testid="reset-submit"
                  className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Reinitialisation...</> : 'Reinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
