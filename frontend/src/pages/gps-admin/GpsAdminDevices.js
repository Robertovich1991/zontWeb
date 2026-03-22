import React, { useState, useEffect, useCallback } from 'react';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { Plus, Search, Loader2, X, Pencil, Trash2, Link, Unlink, Router, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const GpsAdminDevices = () => {
  const { authFetch } = useGpsAdmin();
  const [devices, setDevices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [assignModal, setAssignModal] = useState(null);

  const load = useCallback(async () => {
    try {
      const [dRes, cRes] = await Promise.all([
        authFetch('/api/gps-admin/devices'),
        authFetch('/api/gps-admin/companies'),
      ]);
      if (dRes.ok) setDevices((await dRes.json()).devices || []);
      if (cRes.ok) setCompanies((await cRes.json()).companies || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { load(); }, [load]);

  const filtered = devices.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (d.imei||'').includes(q) || (d.vehicleName||'').toLowerCase().includes(q)
      || (d.licensePlate||'').toLowerCase().includes(q) || (d.driverName||'').toLowerCase().includes(q)
      || (d.companyName||'').toLowerCase().includes(q);
  });

  const handleDelete = async (imei) => {
    if (!window.confirm(`Supprimer l'appareil ${imei} ?`)) return;
    try {
      const res = await authFetch(`/api/gps-admin/devices/${imei}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success('Appareil supprime');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handleUnassign = async (imei) => {
    try {
      const res = await authFetch(`/api/gps-admin/devices/${imei}/unassign`, { method: 'PUT' });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success('Appareil desassigne');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handleAssign = async (imei, companyId) => {
    try {
      const res = await authFetch(`/api/gps-admin/devices/${imei}/assign`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success('Appareil assigne');
      setAssignModal(null);
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div data-testid="gps-admin-devices">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900">Appareils GPS</h1>
        <button onClick={() => setShowAdd(true)} data-testid="add-device-btn"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par IMEI, vehicule, societe..."
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          data-testid="devices-search" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            {devices.length === 0 ? 'Aucun appareil enregistre' : 'Aucun resultat'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">IMEI</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vehicule</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Plaque</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Chauffeur</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Societe</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(d => {
                  const pos = d.lastPosition;
                  const hasPos = pos && pos.lat;
                  return (
                    <tr key={d.imei} className="hover:bg-gray-50 transition" data-testid={`device-row-${d.imei}`}>
                      <td className="px-4 py-3 font-mono text-gray-900">{d.imei}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{d.vehicleName || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono">{d.licensePlate || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{d.driverName || '-'}</td>
                      <td className="px-4 py-3">
                        {d.companyName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                            {d.companyName}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Non assigne</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {hasPos ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs"><MapPin className="w-3 h-3" />{pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}</span>
                        ) : <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {d.companyId ? (
                            <button onClick={() => handleUnassign(d.imei)} title="Desassigner" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition">
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => setAssignModal(d)} title="Assigner" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition">
                              <Link className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => setEditDevice(d)} title="Modifier" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(d.imei)} title="Supprimer" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAdd || editDevice) && (
        <DeviceFormModal device={editDevice} authFetch={authFetch} companies={companies}
          onClose={() => { setShowAdd(false); setEditDevice(null); }} onSaved={load} />
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-100 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Assigner {assignModal.imei}</h3>
            {companies.filter(c => c.active).length === 0 ? (
              <p className="text-sm text-gray-400">Aucune societe active</p>
            ) : (
              <div className="space-y-2">
                {companies.filter(c => c.active).map(c => (
                  <button key={c.companyId} onClick={() => handleAssign(assignModal.imei, c.companyId)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 border border-gray-100 transition text-sm">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">ID: {c.companyId} - {c.deviceCount || 0}/{c.maxDevices} appareils</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DeviceFormModal = ({ device, authFetch, companies, onClose, onSaved }) => {
  const isEdit = !!device;
  const [imei, setImei] = useState(device?.imei || '');
  const [vehicleName, setVehicleName] = useState(device?.vehicleName || '');
  const [licensePlate, setLicensePlate] = useState(device?.licensePlate || '');
  const [driverName, setDriverName] = useState(device?.driverName || '');
  const [companyId, setCompanyId] = useState(device?.companyId || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/gps-admin/devices/${device.imei}` : '/api/gps-admin/devices';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { vehicleName, licensePlate, driverName, companyId: companyId || null }
        : { imei: imei.trim(), vehicleName, licensePlate, driverName, companyId: companyId || null };
      const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success(isEdit ? 'Modifie' : 'Enregistre');
      onSaved();
      onClose();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{isEdit ? 'Modifier appareil' : 'Nouvel appareil'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">IMEI</label>
              <input value={imei} onChange={e => setImei(e.target.value)} placeholder="350424063817592" className={`${inputCls} font-mono`} required />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Vehicule</label>
            <input value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="Mercedes Classe V" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Plaque</label>
              <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="AB-123-CD" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Chauffeur</label>
              <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Jean Dupont" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Societe</label>
            <select value={companyId} onChange={e => setCompanyId(e.target.value)} className={inputCls}>
              <option value="">Non assigne</option>
              {companies.filter(c => c.active).map(c => (
                <option key={c.companyId} value={c.companyId}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Router className="w-4 h-4" />}
            {isEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GpsAdminDevices;
