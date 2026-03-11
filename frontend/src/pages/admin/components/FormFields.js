import React from 'react';
import { Globe } from 'lucide-react';

const LANGS = ['fr', 'en', 'ru', 'hy'];
const LANG_LABELS = { fr: 'FR', en: 'EN', ru: 'RU', hy: 'HY' };

export const MultiLangInput = ({ label, value = {}, onChange, textarea = false, rows = 3 }) => {
  const [activeLang, setActiveLang] = React.useState('fr');
  const handleChange = (lang, text) => onChange({ ...value, [lang]: text });
  const Tag = textarea ? 'textarea' : 'input';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-slate-300 text-sm">{label}</label>
        <div className="flex gap-1">
          {LANGS.map(l => (
            <button key={l} type="button" onClick={() => setActiveLang(l)}
              className={`px-2 py-0.5 text-xs rounded font-medium transition ${activeLang === l ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>
      <Tag type={textarea ? undefined : "text"} rows={textarea ? rows : undefined} value={value[activeLang] || ''}
        onChange={e => handleChange(activeLang, e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-y" />
      <div className="flex gap-1 mt-1">
        {LANGS.map(l => (
          <span key={l} className={`w-2 h-2 rounded-full ${value[l] ? 'bg-green-500' : 'bg-slate-700'}`} title={`${LANG_LABELS[l]}: ${value[l] ? 'filled' : 'empty'}`} />
        ))}
      </div>
    </div>
  );
};

export const TextInput = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div>
    <label className="block text-slate-300 text-sm mb-1.5">{label}{required && <span className="text-red-400"> *</span>}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition" />
  </div>
);

export const SelectInput = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-slate-300 text-sm mb-1.5">{label}</label>
    <select value={value || ''} onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 transition">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export const ImageUpload = ({ label, value, onChange, uploadFile }) => {
  const API = process.env.REACT_APP_BACKEND_URL;
  const [uploading, setUploading] = React.useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      onChange(result.url);
    } catch { }
    setUploading(false);
  };
  return (
    <div>
      <label className="block text-slate-300 text-sm mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {value && <img src={`${API}${value}`} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-700" />}
        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 transition">
          {uploading ? 'Upload...' : 'Choisir image'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {value && <button type="button" onClick={() => onChange('')} className="text-red-400 text-xs hover:text-red-300">Supprimer</button>}
      </div>
    </div>
  );
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
    status === 'published' || status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-700/50 text-slate-400 border border-slate-600'
  }`}>{status}</span>
);

export const TypeBadge = ({ type }) => {
  const colors = {
    city: 'bg-blue-500/10 text-blue-400', airport: 'bg-purple-500/10 text-purple-400', station: 'bg-orange-500/10 text-orange-400',
    country: 'bg-green-500/10 text-green-400', region: 'bg-teal-500/10 text-teal-400', homepage: 'bg-amber-500/10 text-amber-400',
    help: 'bg-cyan-500/10 text-cyan-400', landing: 'bg-pink-500/10 text-pink-400', faq: 'bg-indigo-500/10 text-indigo-400',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${colors[type] || 'bg-slate-700 text-slate-400'}`}>{type}</span>;
};
