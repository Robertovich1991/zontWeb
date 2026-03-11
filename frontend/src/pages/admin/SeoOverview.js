import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Search, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { StatusBadge, TypeBadge } from './components/FormFields';

const SeoOverview = () => {
  const { authFetch } = useAdminAuth();
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/admin/cms/seo-overview').then(r => r.json()).then(p => { setPages(p); setLoading(false); });
  }, []);

  const filtered = pages.filter(p => !search || p.internal_name?.toLowerCase().includes(search.toLowerCase()));

  const getSeoScore = (page) => {
    let score = 0;
    const seo = page.seo || {};
    if (seo.title?.fr) score++;
    if (seo.meta_description?.fr) score++;
    if (seo.h1?.fr) score++;
    if (page.slug?.fr) score++;
    return score;
  };

  return (
    <div className="space-y-4" data-testid="seo-overview">
      <div>
        <h1 className="text-xl font-bold text-white">SEO Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Vue d'ensemble des metatags et SEO de toutes les pages</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrer les pages..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500" />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead><tr className="border-b border-slate-800 text-left">
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Page</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Type</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Title SEO (FR)</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Meta Desc (FR)</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Slug (FR)</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Score</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Statut</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucune page</td></tr>
              : filtered.map(p => {
                const score = getSeoScore(p);
                return (
                  <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 text-white text-sm">{p.internal_name}</td>
                    <td className="px-4 py-3"><TypeBadge type={p.page_type} /></td>
                    <td className="px-4 py-3 text-sm max-w-[200px]">
                      {p.seo?.title?.fr ? <span className="text-slate-300 truncate block">{p.seo.title.fr}</span> : <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Manquant</span>}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-[200px]">
                      {p.seo?.meta_description?.fr ? <span className="text-slate-300 truncate block">{p.seo.meta_description.fr.slice(0, 50)}...</span> : <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Manquant</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{p.slug?.fr || <span className="text-red-400">-</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${score >= 4 ? 'bg-green-500' : score >= 2 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(score / 4) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{score}/4</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SeoOverview;
