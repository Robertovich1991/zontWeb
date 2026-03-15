import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Building2, Plus, Search, MapPin, Users, TrendingUp, Wifi, WifiOff, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import HotelForm from './HotelForm';
import HotelDetail from './HotelDetail';

const HotelsManager = () => {
  const { authFetch } = useAdminAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [viewingHotel, setViewingHotel] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  const fetchHotels = async () => {
    try {
      const res = await authFetch('/api/admin/hotels');
      if (res.ok) setHotels(await res.json());
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet hotel ?')) return;
    const res = await authFetch(`/api/admin/hotels/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Hotel supprime'); fetchHotels(); }
    else toast.error('Erreur');
    setActionMenu(null);
  };

  const handleToggleStatus = async (hotel) => {
    const newStatus = hotel.status === 'active' ? 'inactive' : 'active';
    const res = await authFetch(`/api/admin/hotels/${hotel.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    if (res.ok) { toast.success(`Hotel ${newStatus === 'active' ? 'active' : 'desactive'}`); fetchHotels(); }
    setActionMenu(null);
  };

  const handleSaved = () => { setShowForm(false); setEditingHotel(null); fetchHotels(); };

  const filtered = hotels.filter(h =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase()) ||
    h.hotel_group?.toLowerCase().includes(search.toLowerCase())
  );

  if (viewingHotel) return <HotelDetail hotelId={viewingHotel} onBack={() => { setViewingHotel(null); fetchHotels(); }} />;
  if (showForm || editingHotel) return <HotelForm hotel={editingHotel} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditingHotel(null); }} />;

  return (
    <div className="space-y-6" data-testid="hotels-manager">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white" data-testid="hotels-title">Hotels Partenaires</h1>
          <p className="text-slate-400 text-sm mt-1">{hotels.length} hotel{hotels.length > 1 ? 's' : ''} enregistre{hotels.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} data-testid="create-hotel-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-400 transition">
          <Plus className="w-4 h-4" /> Creer un hotel
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Rechercher par nom, ville, groupe..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          data-testid="hotel-search-input" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucun hotel trouve</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm" data-testid="hotels-table">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Hotel</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Ville</th>
                <th className="text-center px-4 py-3">Reservations</th>
                <th className="text-right px-4 py-3 hidden lg:table-cell">CA Total</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">Commission</th>
                <th className="text-right px-4 py-3 hidden lg:table-cell">Rev. Zont</th>
                <th className="text-center px-4 py-3">Statut</th>
                <th className="text-center px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(h => (
                <tr key={h.id} className="hover:bg-slate-900/30 transition" data-testid={`hotel-row-${h.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{h.name}</p>
                        {h.hotel_group && <p className="text-slate-500 text-xs truncate">{h.hotel_group}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-500" />{h.city}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-white font-medium">{h.total_bookings}</td>
                  <td className="px-4 py-3 text-right text-white font-medium hidden lg:table-cell">{h.total_revenue?.toLocaleString()} EUR</td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="text-amber-400 font-medium">{h.commission_rate}%</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-emerald-400 font-medium">{h.zont_commission_rate}%</span>
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-medium hidden lg:table-cell">{h.zont_commission_total?.toLocaleString()} EUR</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${h.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {h.status === 'active' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {h.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <button onClick={() => setActionMenu(actionMenu === h.id ? null : h.id)} className="text-slate-500 hover:text-white p-1 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {actionMenu === h.id && (
                      <div className="absolute right-4 top-full z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 w-44" data-testid={`hotel-actions-${h.id}`}>
                        <button onClick={() => { setViewingHotel(h.id); setActionMenu(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"><Eye className="w-3.5 h-3.5" /> Voir details</button>
                        <button onClick={() => { setEditingHotel(h); setActionMenu(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"><Pencil className="w-3.5 h-3.5" /> Modifier</button>
                        <button onClick={() => handleToggleStatus(h)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700">
                          {h.status === 'active' ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                          {h.status === 'active' ? 'Desactiver' : 'Activer'}
                        </button>
                        <hr className="border-slate-700 my-1" />
                        <button onClick={() => handleDelete(h.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HotelsManager;
