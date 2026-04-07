import React, { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, CheckCircle, XCircle, Plus, Globe, Filter, Search, MessageSquare, BarChart3 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const StarRating = ({ rating, editable, onChange }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${editable ? 'cursor-pointer' : ''}`}
        onClick={() => editable && onChange?.(i)}
      />
    ))}
  </div>
);

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [pages, setPages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPage, setFilterPage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [translating, setTranslating] = useState(null);

  // Create form
  const [form, setForm] = useState({ author_name: '', rating: 5, comment: '', language: 'fr', page_id: '' });

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPage) params.append('page_id', filterPage);

      const [revRes, pagesRes, statsRes] = await Promise.all([
        fetch(`${API}/api/reviews/admin/all?${params}`),
        fetch(`${API}/api/reviews/pages`),
        fetch(`${API}/api/reviews/admin/stats`),
      ]);
      setReviews(await revRes.json());
      setPages(await pagesRes.json());
      setStats(await statsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/reviews/admin/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ author_name: '', rating: 5, comment: '', language: 'fr', page_id: '' });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (reviewId, status) => {
    await fetch(`${API}/api/reviews/admin/${reviewId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const updatePage = async (reviewId, pageId) => {
    await fetch(`${API}/api/reviews/admin/${reviewId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_id: pageId }),
    });
    fetchData();
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    await fetch(`${API}/api/reviews/admin/${reviewId}`, { method: 'DELETE' });
    fetchData();
  };

  const translateReview = async (reviewId) => {
    setTranslating(reviewId);
    await fetch(`${API}/api/reviews/admin/${reviewId}/translate`, { method: 'POST' });
    setTranslating(null);
    fetchData();
  };

  const togglePage = (pageId) => {
    setForm(prev => ({ ...prev, page_id: pageId }));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6" data-testid="reviews-manager">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            <p className="text-xs text-gray-500">Approuves</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-500">Rejetes</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <p className="text-2xl font-bold text-gray-900">{stats.average_rating}</p>
            </div>
            <p className="text-xs text-gray-500">Note moyenne</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700"
          data-testid="create-review-btn"
        >
          <Plus className="w-4 h-4" /> Ajouter un avis
        </button>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          data-testid="filter-status"
        >
          <option value="">Tous les statuts</option>
          <option value="approved">Approuves</option>
          <option value="pending">En attente</option>
          <option value="rejected">Rejetes</option>
        </select>

        <select
          value={filterPage}
          onChange={e => setFilterPage(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          data-testid="filter-page"
        >
          <option value="">Toutes les pages</option>
          {pages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={createReview} className="bg-white border rounded-xl p-5 space-y-4" data-testid="create-review-form">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Nouvel avis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom du client</label>
              <input
                type="text" required value={form.author_name}
                onChange={e => setForm({ ...form, author_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Marie D."
                data-testid="review-author-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Langue originale</label>
              <select
                value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="ru">Russian</option>
                <option value="hy">Armenian</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
            <StarRating rating={form.rating} editable onChange={r => setForm({ ...form, rating: r })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Commentaire</label>
            <textarea
              required value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3} placeholder="Service excellent..."
              data-testid="review-comment-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Page assignee</label>
            <select
              value={form.page_id}
              onChange={e => setForm({ ...form, page_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
              data-testid="review-page-select"
            >
              <option value="">-- Choisir une page --</option>
              {pages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700" data-testid="submit-review-btn">
              Creer + Traduire automatiquement
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="border px-4 py-2 rounded-lg text-sm">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3" data-testid="reviews-list">
        {reviews.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucun avis</p>
          </div>
        ) : reviews.map(review => (
          <div key={review.review_id} className={`bg-white border rounded-xl p-4 ${
            review.status === 'rejected' ? 'opacity-50' : ''
          }`} data-testid={`review-${review.review_id}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{review.author_name}</span>
                  <StarRating rating={review.rating} />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.status === 'approved' ? 'Approuve' : review.status === 'pending' ? 'En attente' : 'Rejete'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{review.comment}</p>

                {/* Translations preview */}
                {review.translations && (
                  <div className="flex gap-2 mb-2">
                    {Object.entries(review.translations).map(([lang, text]) => (
                      <span key={lang} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500" title={text}>
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Page assignment */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Page:</span>
                  <select
                    value={review.page_id || ''}
                    onChange={e => updatePage(review.review_id, e.target.value)}
                    className="border rounded px-2 py-0.5 text-xs"
                  >
                    <option value="">-- Aucune --</option>
                    {pages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {review.status !== 'approved' && (
                  <button onClick={() => updateStatus(review.review_id, 'approved')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Approuver">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button onClick={() => updateStatus(review.review_id, 'rejected')} className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100" title="Rejeter">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => translateReview(review.review_id)}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  title="Re-traduire"
                  disabled={translating === review.review_id}
                >
                  <Globe className={`w-4 h-4 ${translating === review.review_id ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => deleteReview(review.review_id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 pt-2 border-t text-xs text-gray-400">
              <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
              {review.trip_id && <span>Trip #{review.trip_id}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsManager;
