import React, { useState, useEffect } from 'react';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { Router, Building2, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const GpsAdminDashboard = () => {
  const { authFetch } = useGpsAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/gps-admin/stats');
        if (res.ok) setStats(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [authFetch]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>;
  if (!stats) return <p className="text-gray-500 text-center mt-10">Erreur de chargement</p>;

  const cards = [
    { label: 'Appareils', value: stats.totalDevices, icon: Router, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Assignes', value: stats.assigned, icon: CheckCircle, color: 'bg-blue-50 text-blue-600' },
    { label: 'Non assignes', value: stats.unassigned, icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
    { label: 'En ligne', value: stats.online, icon: Wifi, color: 'bg-green-50 text-green-600' },
    { label: 'Hors ligne', value: stats.offline, icon: WifiOff, color: 'bg-gray-50 text-gray-500' },
    { label: 'Societes', value: stats.totalCompanies, icon: Building2, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div data-testid="gps-admin-dashboard">
      <h1 className="text-lg font-bold text-gray-900 mb-6">Dashboard GPS</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GpsAdminDashboard;
