import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { Car, Search, Loader2, CheckCircle, XCircle, ChevronRight, User, Plus } from 'lucide-react';

const FleetVehicles = () => {
  const { authFetch } = useFleetAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    authFetch('/api/fleet/vehicles').then(r => r.ok ? r.json() : [])
      .then(setVehicles)
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || (v.plateNumber || '').toLowerCase().includes(q) || (v.make || '').toLowerCase().includes(q) || (v.model || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || (filter === 'active' && v.isActivated) || (filter === 'inactive' && !v.isActivated);
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="space-y-5" data-testid="fleet-vehicles">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicules</h1>
          <p className="text-gray-500 text-sm mt-1">{vehicles.length} vehicule{vehicles.length > 1 ? 's' : ''} dans votre flotte</p>
        </div>
        <button onClick={() => navigate('/fleet/vehicles/add')} data-testid="add-vehicle-btn"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Ajouter un vehicule
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par immatriculation, marque..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500" data-testid="vehicle-search" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} data-testid="vehicle-filter"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{search ? 'Aucun resultat' : 'Aucun vehicule'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="vehicles-table">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left px-4 py-3">Immatriculation</th>
                  <th className="text-left px-4 py-3">Marque / Modele</th>
                  <th className="text-center px-4 py-3">Annee</th>
                  <th className="text-center px-4 py-3">Categorie</th>
                  <th className="text-left px-4 py-3">Chauffeur affecte</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50" data-testid={`vehicle-row-${v.id}`}>
                    <td className="px-4 py-3">
                      <span className="text-gray-900 font-mono font-medium">{v.plateNumber || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-900 font-medium">{v.make?.trim()} {v.model}</span>
                        {v.color && <span className="text-gray-400 text-xs ml-2">({v.color})</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{v.year || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{v.type || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {v.driver ? (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700 text-sm">{v.driver.firstName} {v.driver.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Non affecte</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${v.isActivated ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {v.isActivated ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {v.isActivated ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedVehicle(selectedVehicle?.id === v.id ? null : v)}
                        className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 transition" data-testid={`view-vehicle-${v.id}`}>
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

      {selectedVehicle && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" data-testid="vehicle-detail">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detail du vehicule</h3>
            <button onClick={() => setSelectedVehicle(null)} className="text-gray-400 hover:text-gray-600 text-sm">Fermer</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
                  <Car className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">{selectedVehicle.make?.trim()} {selectedVehicle.model}</p>
                  <p className="text-gray-500 font-mono">{selectedVehicle.plateNumber}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Annee</span><span className="text-gray-900">{selectedVehicle.year || '-'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Couleur</span><span className="text-gray-900">{selectedVehicle.color || '-'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Categorie</span><span className="text-blue-600 font-medium">{selectedVehicle.type || '-'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">VTC</span><span>{selectedVehicle.isVTC ? 'Oui' : 'Non'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Statut</span><span className={selectedVehicle.isActivated ? 'text-emerald-600 font-medium' : 'text-red-500'}>{selectedVehicle.isActivated ? 'Actif' : 'Inactif'}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Chauffeur</span><span>{selectedVehicle.driver ? `${selectedVehicle.driver.firstName} ${selectedVehicle.driver.lastName}` : 'Non affecte'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetVehicles;
