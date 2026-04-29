import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, User, Car, Search, Building2, CreditCard, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  New: { label: 'Nouveau', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle },
  ApprovedByAdmin: { label: 'Approuve', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  Took: { label: 'Pris', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Car },
  Confirmed: { label: 'Confirme', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  Started: { label: 'En cours', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Car },
  Completed: { label: 'Termine', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: CheckCircle },
  CancelledByClient: { label: 'Annule (client)', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
  CancelledByDriver: { label: 'Annule (chauffeur)', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
  Cancelled: { label: 'Annule', color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
  DontApprovedByDriver: { label: 'Refuse chauffeur', color: 'bg-orange-50 text-orange-600 border-orange-200', icon: XCircle },
};

export default function ReservationsManager() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/reservations`);
        const data = await res.json();
        setReservations(data.reservations || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = reservations.filter(r => {
    if (filter === 'active') return ['New', 'ApprovedByAdmin', 'Took', 'Confirmed', 'Started'].includes(r.status);
    if (filter === 'completed') return r.status === 'Completed';
    if (filter === 'cancelled') return r.status?.includes('Cancel') || r.status === 'DontApprovedByDriver';
    if (search) {
      const s = search.toLowerCase();
      return (r.client?.firstName || '').toLowerCase().includes(s)
        || (r.client?.lastName || '').toLowerCase().includes(s)
        || (r.client?.email || '').toLowerCase().includes(s)
        || (r.client?.phone || '').includes(s)
        || String(r.id).includes(s)
        || (r.startAddress || '').toLowerCase().includes(s);
    }
    return true;
  });

  const counts = {
    all: reservations.length,
    active: reservations.filter(r => ['New', 'ApprovedByAdmin', 'Took', 'Confirmed', 'Started'].includes(r.status)).length,
    completed: reservations.filter(r => r.status === 'Completed').length,
    cancelled: reservations.filter(r => r.status?.includes('Cancel') || r.status === 'DontApprovedByDriver').length,
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="reservations-manager">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Reservations C#</h1>
            <p className="text-xs text-gray-500">{reservations.length} reservations (app + web)</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { key: 'all', label: 'Total', count: counts.all, color: 'text-gray-900' },
            { key: 'active', label: 'Actives', count: counts.active, color: 'text-blue-600' },
            { key: 'completed', label: 'Terminees', count: counts.completed, color: 'text-emerald-600' },
            { key: 'cancelled', label: 'Annulees', count: counts.cancelled, color: 'text-red-500' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`px-4 py-3 rounded-xl border text-left transition-all ${filter === s.key ? 'border-gray-900 shadow-sm bg-white' : 'border-gray-200 bg-white'}`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input data-testid="reservations-search" type="text" placeholder="Rechercher par nom, email, telephone, adresse, ID..."
            value={search} onChange={e => { setSearch(e.target.value); setFilter('all'); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* List + Detail */}
        <div className="flex gap-4">
          <div className={`${selected ? 'hidden sm:block sm:w-1/2 lg:w-2/5' : 'w-full'} space-y-2`}>
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Aucune reservation trouvee</div>
            ) : (
              filtered.map(r => <ReservationCard key={r.id} r={r} selected={selected?.id === r.id} onClick={() => setSelected(r)} />)
            )}
          </div>

          {selected && <DetailPanel r={selected} onClose={() => setSelected(null)} />}
        </div>
      </div>
    </div>
  );
}

function ReservationCard({ r, selected, onClick }) {
  const sc = STATUS_CONFIG[r.status] || { label: r.status, color: 'bg-gray-50 text-gray-500 border-gray-200' };
  return (
    <div data-testid={`reservation-card-${r.id}`} onClick={onClick}
      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${selected ? 'border-blue-400 shadow-sm' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">#{r.id}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
        </div>
        <span className="text-emerald-600 font-bold text-sm">{r.totalAmount?.toFixed(2)} EUR</span>
      </div>
      <p className="text-sm font-medium text-gray-900">{r.client?.firstName} {r.client?.lastName}</p>
      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
        {r.client?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.client.phone}</span>}
        {r.client?.email && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{r.client.email}</span>}
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
        <Calendar className="w-3 h-3" /><span>{r.date}</span>
        <Clock className="w-3 h-3 ml-1" /><span>{r.time}</span>
        <MapPin className="w-3 h-3 ml-2" /><span className="truncate">{r.startAddress?.substring(0, 35)}</span>
      </div>
    </div>
  );
}

function DetailPanel({ r, onClose }) {
  const sc = STATUS_CONFIG[r.status] || { label: r.status, color: 'bg-gray-50 text-gray-500 border-gray-200' };
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 sticky top-6 h-fit" data-testid="reservation-detail">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">#{r.id}</span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sc.color}`}>{sc.label}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs sm:hidden">Fermer</button>
      </div>

      {/* Client Info */}
      <div className="mb-5 pb-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Client</h3>
        <div className="space-y-2.5">
          <Row icon={User} label="Nom" value={`${r.client?.firstName || ''} ${r.client?.lastName || ''}`.trim()} />
          <Row icon={Phone} label="Telephone" value={r.client?.phone || '-'} link={r.client?.phone ? `tel:${r.client.phone}` : null} />
          <Row icon={Mail} label="Email" value={r.client?.email || '-'} link={r.client?.email ? `mailto:${r.client.email}` : null} />
        </div>
      </div>

      {/* Trip Info */}
      <div className="mb-5 pb-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trajet</h3>
        <div className="space-y-2.5">
          <Row icon={Calendar} label="Date" value={`${r.date} a ${r.time}`} />
          <div className="space-y-1.5 pl-6">
            <div className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-sm text-gray-700">{r.startAddress || '-'}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <p className="text-sm text-gray-700">{r.endAddress || '-'}</p>
            </div>
          </div>
          <Row icon={Car} label="Vehicule" value={r.carType || '-'} />
          {r.distance > 0 && <Row icon={MapPin} label="Distance" value={`${r.distance} km`} />}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-5 pb-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tarification</h3>
        <div className="space-y-2.5">
          <Row icon={CreditCard} label="Montant client" value={`${(r.totalAmount || 0).toFixed(2)} EUR`} highlight />
          <Row icon={CreditCard} label="Prix societe" value={`${(r.currentPrice || 0).toFixed(2)} EUR`} />
          <Row icon={CheckCircle} label="Paiement" value={r.paymentSuccessful ? 'Reussi' : 'En attente'} />
          <Row icon={CreditCard} label="Prix fixe" value={r.isFixedPrice ? 'Oui' : 'Non'} />
        </div>
      </div>

      {/* Driver & Company */}
      <div className="mb-5 pb-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Affectation</h3>
        <div className="space-y-2.5">
          <Row icon={User} label="Chauffeur" value={r.driver ? `${r.driver.firstName} ${r.driver.lastName}` : 'Non affecte'} />
          <Row icon={Building2} label="Societe" value={r.company?.name || 'Non affecte'} />
        </div>
      </div>

      {/* Comments */}
      {r.additionalComments && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Commentaires</h3>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{r.additionalComments}</p>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value, link, highlight }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        {link ? (
          <a href={link} className="text-sm text-blue-600 hover:underline">{value}</a>
        ) : (
          <p className={`text-sm ${highlight ? 'text-emerald-600 font-bold' : 'text-gray-900'}`}>{value}</p>
        )}
      </div>
    </div>
  );
}
