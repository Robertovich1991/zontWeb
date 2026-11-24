import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { KeyRound, Copy, RefreshCw, Eye, EyeOff, Loader2, Building2, Link as LinkIcon, FileText, Check } from 'lucide-react';

const PUBLIC_BASE = `${process.env.REACT_APP_BACKEND_URL}/api/partners/comfort-cars`;

const ComfortCarsApi = () => {
  const { authFetch } = useAdminAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [match, setMatch] = useState('');
  const [savingMatch, setSavingMatch] = useState(false);
  const [copied, setCopied] = useState('');

  const load = () => {
    setLoading(true);
    authFetch('/api/admin/comfort-cars/settings')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setSettings(d); setMatch(d.companyMatch || ''); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
    toast.success('Copie');
  };

  const rotate = async () => {
    if (!window.confirm("Generer une nouvelle cle ? L'ancienne cessera immediatement de fonctionner pour Comfort Cars.")) return;
    setRotating(true);
    try {
      const r = await authFetch('/api/admin/comfort-cars/rotate-key', { method: 'POST' });
      const d = await r.json();
      setSettings(s => ({ ...s, apiKey: d.apiKey }));
      setReveal(true);
      toast.success('Nouvelle cle generee');
    } catch { toast.error('Echec'); }
    finally { setRotating(false); }
  };

  const saveMatch = async () => {
    if (!match.trim()) { toast.error('Le nom ne peut pas etre vide'); return; }
    setSavingMatch(true);
    try {
      const r = await authFetch('/api/admin/comfort-cars/company-match', {
        method: 'PUT', body: JSON.stringify({ companyMatch: match.trim() }),
      });
      const d = await r.json();
      setSettings(s => ({ ...s, companyMatch: d.companyMatch }));
      toast.success('Filtre societe mis a jour');
    } catch { toast.error('Echec'); }
    finally { setSavingMatch(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  if (!settings) return <div className="text-gray-500">Erreur de chargement.</div>;

  const maskedKey = settings.apiKey ? settings.apiKey.slice(0, 6) + '•'.repeat(Math.max(0, settings.apiKey.length - 10)) + settings.apiKey.slice(-4) : '';
  const baseUrl = PUBLIC_BASE;
  const docsUrl = `${PUBLIC_BASE}/docs`;
  const curlExample = `curl -H "X-API-Key: ${reveal ? settings.apiKey : 'VOTRE_CLE'}" \\\n  "${baseUrl}/reservations?status=completed&page=1&page_size=50"`;

  return (
    <div className="min-h-screen bg-gray-50 -m-4 lg:-m-6 p-4 lg:p-6 space-y-6 max-w-4xl" data-testid="comfort-cars-api">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Comfort Cars</h1>
        <p className="text-gray-500 text-sm mt-1">Accès en lecture seule aux réservations Comfort Cars, protégé par clé API.</p>
      </div>

      {/* API Key */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold"><KeyRound className="w-4 h-4 text-emerald-500" /> Clé API</div>
        <p className="text-sm text-gray-500">À transmettre en privé à Comfort Cars. Ils l'enverront dans l'en-tête <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">X-API-Key</code> de chaque appel.</p>
        <div className="flex flex-wrap items-center gap-2">
          <code data-testid="api-key-value" className="flex-1 min-w-[260px] font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 break-all">
            {reveal ? settings.apiKey : maskedKey}
          </code>
          <button onClick={() => setReveal(v => !v)} data-testid="toggle-reveal-key"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {reveal ? 'Masquer' : 'Afficher'}
          </button>
          <button onClick={() => copy(settings.apiKey, 'key')} data-testid="copy-key"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            {copied === 'key' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} Copier
          </button>
          <button onClick={rotate} disabled={rotating} data-testid="rotate-key"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-100 disabled:opacity-50">
            {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Renouveler
          </button>
        </div>
        {settings.rotatedAt && <p className="text-xs text-gray-400">Dernière génération : {new Date(settings.rotatedAt).toLocaleString('fr-FR')}</p>}
      </div>

      {/* Base URL + docs */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-semibold"><LinkIcon className="w-4 h-4 text-emerald-500" /> URL de base</div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 min-w-[260px] font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 break-all" data-testid="base-url">{baseUrl}</code>
          <button onClick={() => copy(baseUrl, 'url')} className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            {copied === 'url' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} Copier
          </button>
        </div>
        <a href={docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:underline" data-testid="docs-link">
          <FileText className="w-4 h-4" /> Voir le document de référence (JSON)
        </a>
      </div>

      {/* Company match */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-gray-900 font-semibold"><Building2 className="w-4 h-4 text-emerald-500" /> Filtre société</div>
        <p className="text-sm text-gray-500">Seules les courses dont le nom de société <strong>contient</strong> ce texte (insensible à la casse) sont renvoyées à Comfort Cars.</p>
        <div className="flex flex-wrap items-center gap-2">
          <input value={match} onChange={e => setMatch(e.target.value)} data-testid="company-match-input"
            className="flex-1 min-w-[260px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-emerald-500 focus:outline-none"
            placeholder="comfort cars" />
          <button onClick={saveMatch} disabled={savingMatch} data-testid="save-company-match"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
            {savingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Quick example */}
      <div className="bg-[#0f1419] border border-gray-800 rounded-xl p-5 shadow-sm space-y-2">
        <p className="text-xs uppercase tracking-wider text-gray-400">Exemple d'appel</p>
        <pre className="text-emerald-300 text-xs font-mono whitespace-pre-wrap break-all" data-testid="curl-example">{curlExample}</pre>
        <p className="text-xs text-gray-500">Statuts disponibles : {settings.normalizedStatuses?.join(', ')}</p>
      </div>
    </div>
  );
};

export default ComfortCarsApi;
