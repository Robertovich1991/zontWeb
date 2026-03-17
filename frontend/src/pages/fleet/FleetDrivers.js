import React, { useState, useEffect } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { Users, Search, Loader2, CheckCircle, XCircle, ChevronRight, Phone, Mail } from 'lucide-react';

const FleetDrivers = () => {
  const { authFetch } = useFleetAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    authFetch('/api/fleet/drivers').then(r => r.ok ? r.json() : [])
      .then(setDrivers)
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || (d.phone || '').includes(q) || (d.email || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || (filter === 'active' && d.isActivated) || (filter === 'inactive' && !d.isActivated);
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="space-y-5" data-testid="fleet-drivers">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chauffeurs</h1>
          <p className="text-gray-500 text-sm mt-1">{drivers.length} chauffeur{drivers.length > 1 ? 's' : ''} dans votre societe</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, telephone..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500" data-testid="driver-search" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} data-testid="driver-filter"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{search ? 'Aucun resultat' : 'Aucun chauffeur'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="drivers-table">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left px-4 py-3">Chauffeur</th>
                  <th className="text-left px-4 py-3">Telephone</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="text-center px-4 py-3">Verifie</th>
                  <th className="text-center px-4 py-3">Note</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50" data-testid={`driver-row-${d.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {d.firstName?.[0]}{d.lastName?.[0]}
                        </div>
                        <span className="text-gray-900 font-medium">{d.firstName} {d.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{d.email || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${d.isActivated ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {d.isActivated ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {d.isActivated ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${d.isVerified ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {d.isVerified ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{d.rank || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedDriver(selectedDriver?.id === d.id ? null : d)}
                        className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition" data-testid={`view-driver-${d.id}`}>
                        <ChevronRight className="w-3 h-3 inline" /> Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Detail Panel */}
      {selectedDriver && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" data-testid="driver-detail">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detail du chauffeur</h3>
            <button onClick={() => setSelectedDriver(null)} className="text-gray-400 hover:text-gray-600 text-sm">Fermer</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center text-lg font-semibold">
                  {selectedDriver.firstName?.[0]}{selectedDriver.lastName?.[0]}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{selectedDriver.firstName} {selectedDriver.lastName}</p>
                  <p className="text-gray-500 text-sm">ID: {selectedDriver.id.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4 text-gray-400" />{selectedDriver.phone || 'Non renseigne'}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="w-4 h-4 text-gray-400" />{selectedDriver.email || 'Non renseigne'}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Statut</span><span className={selectedDriver.isActivated ? 'text-emerald-600 font-medium' : 'text-red-500'}>{selectedDriver.isActivated ? 'Actif' : 'Inactif'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Admin active</span><span>{selectedDriver.isAdminActivated ? 'Oui' : 'Non'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Societe active</span><span>{selectedDriver.isCompanyActivated ? 'Oui' : 'Non'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Verifie</span><span>{selectedDriver.isVerified ? 'Oui' : 'Non'}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Note</span><span className="font-medium">{selectedDriver.rank}/5</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetDrivers;
