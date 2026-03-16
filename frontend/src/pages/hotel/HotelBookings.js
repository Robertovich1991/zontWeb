import React, { useState, useEffect } from 'react';
import { useHotelAuth } from './HotelAuthContext';
import { toast } from 'sonner';
import { Car, Search, Loader2, Calendar, Download, ArrowUpDown, Filter } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const statusConfig = {
  pending: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700' },
  confirmed: { label: 'Confirmee', cls: 'bg-blue-50 text-blue-700' },
  assigned: { label: 'Assignee', cls: 'bg-cyan-50 text-cyan-700' },
  completed: { label: 'Terminee', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600' },
  refunded: { label: 'Remboursee', cls: 'bg-purple-50 text-purple-600' },
};

const HotelBookings = () => {
  const { authFetch } = useHotelAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    authFetch('/api/hotel/bookings').then(r => r.ok ? r.json() : [])
      .then(d => setBookings(d))
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const getDateFilter = () => {
    const now = new Date();
    if (filterPeriod === '7d') return new Date(now - 7 * 86400000);
    if (filterPeriod === '30d') return new Date(now - 30 * 86400000);
    if (filterPeriod === '90d') return new Date(now - 90 * 86400000);
    if (filterPeriod === 'year') return new Date(now - 365 * 86400000);
    return null;
  };

  const filtered = bookings.filter(b => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (search && !b.client_name?.toLowerCase().includes(search.toLowerCase()) && !b.id?.toLowerCase().includes(search.toLowerCase())) return false;
    const dateMin = getDateFilter();
    if (dateMin && new Date(b.created_at) < dateMin) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price') return (b.total_price || 0) - (a.total_price || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const totalRevenue = filtered.reduce((s, b) => s + (b.total_price || 0), 0);
  const totalComm = filtered.reduce((s, b) => s + (b.hotel_commission || 0), 0);

  const handleExport = () => {
    const token = localStorage.getItem('hotel_token');
    window.open(`${API}/api/hotel/bookings/export?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6" data-testid="hotel-bookings">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} reservation{bookings.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleExport} data-testid="export-csv-btn"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition shadow-sm">
          <Download className="w-4 h-4" /> Exporter CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          <p className="text-xs text-gray-500">Reservations</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} EUR</p>
          <p className="text-xs text-gray-500">CA genere</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{totalComm.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} EUR</p>
          <p className="text-xs text-gray-500">Votre commission</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:outline-none" data-testid="hotel-booking-search" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} data-testid="hotel-booking-filter-status"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:border-emerald-500 focus:outline-none">
          <option value="">Tous statuts</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} data-testid="hotel-booking-filter-period"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:border-emerald-500 focus:outline-none">
          <option value="all">Toutes dates</option>
          <option value="7d">7 jours</option>
          <option value="30d">30 jours</option>
          <option value="90d">90 jours</option>
          <option value="year">1 an</option>
        </select>
        <button onClick={() => setSortBy(sortBy === 'date' ? 'price' : 'date')}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-100">
          <ArrowUpDown className="w-3.5 h-3.5" /> {sortBy === 'date' ? 'Par date' : 'Par prix'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune reservation trouvee</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="hotel-bookings-table">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Service</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Trajet</th>
                  <th className="text-right px-4 py-3">Prix</th>
                  <th className="text-right px-4 py-3">Commission</th>
                  <th className="text-center px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => {
                  const sc = statusConfig[b.status] || { label: b.status, cls: 'bg-gray-50 text-gray-600' };
                  return (
                    <tr key={b.id} className="hover:bg-gray-50" data-testid={`hotel-booking-row-${b.id}`}>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 text-sm">{b.ride_date}</p>
                        <p className="text-gray-400 text-xs">{b.ride_time}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{b.id}</td>
                      <td className="px-4 py-3 text-gray-700 hidden md:table-cell">{b.service_type}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-gray-600 text-xs truncate max-w-[160px]">{b.pickup_address}</p>
                        <p className="text-gray-400 text-xs truncate max-w-[160px]">{b.dropoff_address}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">{b.total_price} EUR</td>
                      <td className="px-4 py-3 text-right text-amber-600 font-medium">{b.hotel_commission} EUR</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookings;
