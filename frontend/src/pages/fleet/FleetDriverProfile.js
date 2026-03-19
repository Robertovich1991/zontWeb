import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MapPin, Clock, User, Phone, Mail, CheckCircle, XCircle, Plane, Timer, Mountain, Calendar, Save, ChevronLeft, ChevronRight } from 'lucide-react';

const TYPE_CONFIG = {
  transfer: { label: 'Transfer', cls: 'bg-blue-50 text-blue-700', icon: Plane },
  Transfer: { label: 'Transfer', cls: 'bg-blue-50 text-blue-700', icon: Plane },
  dispo: { label: 'Dispo', cls: 'bg-emerald-50 text-emerald-700', icon: Timer },
  Dispo: { label: 'Dispo', cls: 'bg-emerald-50 text-emerald-700', icon: Timer },
  excursion: { label: 'Excursion', cls: 'bg-amber-50 text-amber-700', icon: Mountain },
  Excursion: { label: 'Excursion', cls: 'bg-amber-50 text-amber-700', icon: Mountain },
};

const STATUS_MAP = {
  new: 'Nouvelle', assigned: 'Affectee', sent_to_zont: 'Envoyee Zont',
  in_progress: 'En cours', completed: 'Terminee', cancelled: 'Annulee',
};

const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

const getType = (t) => TYPE_CONFIG[t] || { label: t, cls: 'bg-gray-100 text-gray-600', icon: Plane };

const FleetDriverProfile = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useFleetAuth();

  const [driver, setDriver] = useState(null);
  const [ridesData, setRidesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ridesLoading, setRidesLoading] = useState(false);

  // Month filter
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // Forfait editing
  const [forfaits, setForfaits] = useState({});
  const [savingId, setSavingId] = useState(null);

  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Fetch driver info
  useEffect(() => {
    authFetch('/api/fleet/drivers')
      .then(r => r.ok ? r.json() : [])
      .then(drivers => {
        const d = drivers.find(d => d.id === driverId);
        setDriver(d || null);
      })
      .catch(() => toast.error('Erreur chargement chauffeur'))
      .finally(() => setLoading(false));
  }, [authFetch, driverId]);

  // Fetch rides for selected month
  const fetchRides = useCallback(async () => {
    setRidesLoading(true);
    try {
      const res = await authFetch(`/api/fleet/drivers/${driverId}/rides?month=${monthKey}`);
      if (res.ok) {
        const data = await res.json();
        setRidesData(data);
        const f = {};
        data.rides.forEach(r => { f[r.id] = r.forfait || 0; });
        setForfaits(f);
      } else {
        toast.error('Erreur chargement courses');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setRidesLoading(false); }
  }, [authFetch, driverId, monthKey]);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const handleForfaitChange = (rideId, value) => {
    setForfaits(prev => ({ ...prev, [rideId]: parseFloat(value) || 0 }));
  };

  const handleSaveForfait = async (rideId) => {
    setSavingId(rideId);
    try {
      const res = await authFetch(`/api/fleet/drivers/${driverId}/rides/${encodeURIComponent(rideId)}/forfait?month=${monthKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: forfaits[rideId] || 0 }),
      });
      if (res.ok) {
        toast.success('Forfait enregistre');
        fetchRides();
      } else {
        toast.error('Erreur');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setSavingId(null); }
  };

  const goPrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const totalForfait = Object.values(forfaits).reduce((s, v) => s + v, 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  if (!driver) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Chauffeur introuvable</p>
        <button onClick={() => navigate('/fleet/drivers')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
          Retour aux chauffeurs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="fleet-driver-profile">
      {/* Back button */}
      <button onClick={() => navigate('/fleet/drivers')} data-testid="back-to-drivers"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
        <ArrowLeft className="w-4 h-4" /> Retour aux chauffeurs
      </button>

      {/* Driver Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" data-testid="driver-header">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
            {driver.firstName?.[0]}{driver.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{driver.firstName} {driver.lastName}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {driver.phone || 'Non renseigne'}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {driver.email || 'Non renseigne'}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${driver.isActivated ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {driver.isActivated ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {driver.isActivated ? 'Actif' : 'Inactif'}
              </span>
              {driver.rank > 0 && <span className="text-xs text-gray-400">Note: {driver.rank}/5</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector + Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Historique des courses</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition" data-testid="month-prev">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-700 min-w-[160px] text-center" data-testid="month-label">
              {MONTHS_FR[selectedMonth - 1]} {selectedYear}
            </span>
            <button onClick={goNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition" data-testid="month-next">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4" data-testid="month-summary">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Courses du mois</p>
            <p className="text-2xl font-bold text-gray-900 mt-1" data-testid="total-rides">{ridesData?.totalRides || 0}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 uppercase tracking-wide">Prix total courses</p>
            <p className="text-2xl font-bold text-blue-700 mt-1" data-testid="total-price">{(ridesData?.totalPrice || 0).toFixed(2)} EUR</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <p className="text-xs text-emerald-600 uppercase tracking-wide">Total forfait chauffeur</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1" data-testid="total-forfait">{totalForfait.toFixed(2)} EUR</p>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      {ridesLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
      ) : !ridesData?.rides?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune course pour {MONTHS_FR[selectedMonth - 1]} {selectedYear}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="rides-table">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Trajet</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-right px-4 py-3">Prix course</th>
                  <th className="text-right px-4 py-3">Forfait</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ridesData.rides.map(ride => {
                  const tp = getType(ride.type);
                  const TypeIcon = tp.icon;
                  const currentForfait = forfaits[ride.id] ?? 0;
                  const hasChanged = currentForfait !== ride.forfait;
                  return (
                    <tr key={ride.id} className="hover:bg-gray-50/50" data-testid={`ride-row-${ride.id}`}>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">{ride.date}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ride.time}{ride.endTime ? ` - ${ride.endTime}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tp.cls}`}>
                          <TypeIcon className="w-3 h-3" /> {tp.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${ride.source === 'zont' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                          {ride.source === 'zont' ? 'ZONT' : 'SOCIETE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {ride.pickupAddress && (
                          <div className="flex items-start gap-1 text-xs text-gray-600 truncate">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                            <span className="truncate">{ride.pickupAddress}</span>
                          </div>
                        )}
                        {ride.dropoffAddress && (
                          <div className="flex items-start gap-1 text-xs text-gray-400 truncate">
                            <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                            <span className="truncate">{ride.dropoffAddress}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {ride.clientName && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <User className="w-3 h-3" /> {ride.clientName}
                          </div>
                        )}
                        {ride.passengers > 0 && <div className="text-xs text-gray-400">{ride.passengers} pax</div>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-900 font-medium">{ride.price > 0 ? `${ride.price.toFixed(2)}` : '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={currentForfait || ''}
                            onChange={e => handleForfaitChange(ride.id, e.target.value)}
                            placeholder="0.00"
                            data-testid={`forfait-input-${ride.id}`}
                            className={`w-28 text-right px-3 py-2 border-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasChanged ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-gray-200 bg-white text-gray-900'}`}
                          />
                          <span className="ml-1.5 text-xs text-gray-400">EUR</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleSaveForfait(ride.id)}
                          disabled={savingId === ride.id || !hasChanged}
                          data-testid={`save-forfait-${ride.id}`}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium disabled:opacity-30 transition flex items-center gap-1 mx-auto"
                        >
                          {savingId === ride.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals Footer */}
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td colSpan={5} className="px-4 py-3 text-right text-gray-700 text-sm">
                    Total du mois ({ridesData.rides.length} course{ridesData.rides.length > 1 ? 's' : ''})
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700">{(ridesData.totalPrice || 0).toFixed(2)} EUR</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{totalForfait.toFixed(2)} EUR</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetDriverProfile;
