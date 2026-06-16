import React, { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Languages, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const LANG_FLAGS = { en: 'EN', fr: 'FR', es: 'ES', ru: 'RU', hy: 'HY' };
const LANG_NAMES = { en: 'English', fr: 'French', es: 'Spanish', ru: 'Russian', hy: 'Armenian' };

/**
 * Lightweight admin page to manage the blog: see all articles, delete the wrong ones,
 * trigger auto-translation of every English article into FR/ES/RU/HY.
 * Path: /admin/blog
 */
const BlogAdmin = () => {
  const [counts, setCounts] = useState({});
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [filterLang, setFilterLang] = useState('all');

  const loadAll = async () => {
    setLoading(true);
    try {
      const statusRes = await fetch(`${API}/api/blog-translate-status`);
      const statusData = await statusRes.json();
      setCounts(statusData.counts || {});
      // Fetch articles in every language and merge
      const all = [];
      for (const lang of ['en', 'fr', 'es', 'ru', 'hy']) {
        const r = await fetch(`${API}/api/blog-articles?language=${lang}&limit=200`);
        const d = await r.json();
        (d.articles || []).forEach(a => all.push({ ...a, _lang: lang }));
      }
      all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setArticles(all);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load articles' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleDelete = async (slug) => {
    if (!window.confirm(`Delete article "${slug}"? This cannot be undone.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await fetch(`${API}/api/blog-articles/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const d = await r.json();
      if (r.ok && d.success) {
        setMessage({ type: 'success', text: `Deleted: ${slug}` });
        await loadAll();
      } else {
        setMessage({ type: 'error', text: d.detail || 'Delete failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setBusy(false);
    }
  };

  const handleTranslateAll = async (overwrite = false) => {
    const label = overwrite ? 'RE-translate ALL articles (overwrite existing)' : 'Translate missing articles';
    if (!window.confirm(`${label}? This may take a few minutes in the background.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await fetch(`${API}/api/blog-articles/translate-all${overwrite ? '?overwrite=true' : ''}`, { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        setMessage({
          type: 'success',
          text: `Scheduled ${d.scheduled} article(s) × ${(d.target_languages || []).length} languages. Each takes ~30-60s. Refresh in a few minutes.`,
        });
        setTimeout(loadAll, 4000);
      } else {
        setMessage({ type: 'error', text: 'Scheduling failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setBusy(false);
    }
  };

  const visible = filterLang === 'all' ? articles : articles.filter(a => a._lang === filterLang);
  const totalEn = counts.en || 0;
  const totalAll = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
  const expected = totalEn * 5;
  const progress = expected > 0 ? Math.round((totalAll / expected) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-5" data-testid="blog-admin-page">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="w-7 h-7 text-[#2ecc71]" /> Blog Admin
          </h1>
          <div className="flex gap-2">
            <button
              onClick={loadAll}
              disabled={loading || busy}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              data-testid="refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => handleTranslateAll(false)}
              disabled={busy || totalEn === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold rounded-lg disabled:opacity-50"
              data-testid="translate-missing-btn"
            >
              <Languages className="w-4 h-4" /> Translate missing
            </button>
            <button
              onClick={() => handleTranslateAll(true)}
              disabled={busy || totalEn === 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50"
              data-testid="translate-all-btn"
            >
              <Languages className="w-4 h-4" /> Re-translate ALL
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{totalAll}</div>
            <div className="text-xs text-gray-500 mt-1">/ {expected} expected</div>
          </div>
          {['en', 'fr', 'es', 'ru', 'hy'].map(l => (
            <div key={l} className="bg-white rounded-xl p-4 border border-gray-200" data-testid={`stat-${l}`}>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{LANG_NAMES[l]}</div>
              <div className="text-2xl font-bold text-gray-900">{counts[l] || 0}</div>
              {l !== 'en' && totalEn > 0 && (
                <div className={`text-xs mt-1 ${(counts[l] || 0) >= totalEn ? 'text-green-600' : 'text-orange-500'}`}>
                  {(counts[l] || 0) >= totalEn ? 'Synced' : `${totalEn - (counts[l] || 0)} missing`}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {expected > 0 && (
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Translation completeness</span>
              <span className="text-gray-600">{progress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-[#2ecc71] h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
            data-testid="admin-message"
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterLang('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterLang === 'all' ? 'bg-[#2ecc71] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            data-testid="filter-all"
          >
            All ({articles.length})
          </button>
          {['en', 'fr', 'es', 'ru', 'hy'].map(l => (
            <button
              key={l}
              onClick={() => setFilterLang(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterLang === l ? 'bg-[#2ecc71] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              data-testid={`filter-${l}`}
            >
              {LANG_FLAGS[l]} ({counts[l] || 0})
            </button>
          ))}
        </div>

        {/* Articles table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#2ecc71] mx-auto" /></div>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No articles in this filter</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Lang</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Title</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Slug</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Created</th>
                  <th className="text-right p-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(a => {
                  const prefix = a._lang === 'en' ? '' : `/${a._lang}`;
                  const liveUrl = `https://www.zont.cab${prefix}/blog/${a.slug}`;
                  return (
                    <tr key={`${a._lang}-${a.slug}`} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`row-${a._lang}-${a.slug}`}>
                      <td className="p-3"><span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold">{LANG_FLAGS[a._lang]}</span></td>
                      <td className="p-3 font-medium text-gray-900 max-w-md">{a.title}</td>
                      <td className="p-3 text-xs text-gray-500 font-mono">{a.slug}</td>
                      <td className="p-3 text-xs text-gray-500">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <a href={liveUrl} target="_blank" rel="noreferrer" className="p-1.5 text-gray-600 hover:text-[#2ecc71]" title="Open" data-testid={`open-${a.slug}`}>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(a.slug)}
                            disabled={busy}
                            className="p-1.5 text-gray-600 hover:text-red-600 disabled:opacity-50"
                            title="Delete"
                            data-testid={`delete-${a.slug}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p><strong>Translate missing</strong> : ne traduit que les articles qui n'ont pas encore de version dans une langue donnée. Idempotent.</p>
          <p><strong>Re-translate ALL</strong> : régénère TOUTES les traductions (à utiliser si vous avez amélioré les prompts). Les anciennes versions sont écrasées.</p>
          <p>Les traductions tournent en arrière-plan : ~30-60s par langue par article. Cliquez "Refresh" après quelques minutes pour voir les compteurs.</p>
        </div>
      </div>
    </div>
  );
};

export default BlogAdmin;
