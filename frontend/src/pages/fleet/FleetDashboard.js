import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { Users, Car, TrendingUp, CheckCircle, Building2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const FleetDashboard = () => {
  const { company, authFetch } = useFleetAuth();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/api/fleet/drivers').then(r => r.ok ? r.json() : []),
      authFetch('/api/fleet/vehicles').then(r => r.ok ? r.json() : []),
    ]).then(([d, v]) => { setDrivers(d); setVehicles(v); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const activeDrivers = drivers.filter(d => d.isActivated && d.isAdminActivated);
  const activeVehicles = vehicles.filter(v => v.isActivated && v.isAdminActivated);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="space-y-6" data-testid="fleet-dashboard">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company?.companyName || 'Ma Societe'}</h1>
          <p className="text-gray-500 text-sm">{company?.address || ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm" data-testid="stat-total-drivers">
          <Users className="w-5 h-5 text-blue-600 mb-3" />
          <p className="text-3xl font-bold text-gray-900">{drivers.length}</p>
          <p className="text-gray-500 text-sm mt-1">Chauffeurs</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm" data-testid="stat-active-drivers">
          <CheckCircle className="w-5 h-5 text-emerald-600 mb-3" />
          <p className="text-3xl font-bold text-emerald-600">{activeDrivers.length}</p>
          <p className="text-gray-500 text-sm mt-1">Chauffeurs actifs</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm" data-testid="stat-total-vehicles">
          <Car className="w-5 h-5 text-amber-600 mb-3" />
          <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
          <p className="text-gray-500 text-sm mt-1">Vehicules</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm" data-testid="stat-active-vehicles">
          <TrendingUp className="w-5 h-5 text-emerald-600 mb-3" />
          <p className="text-3xl font-bold text-emerald-600">{activeVehicles.length}</p>
          <p className="text-gray-500 text-sm mt-1">Vehicules actifs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link to="/fleet/drivers" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-emerald-200 transition group" data-testid="link-drivers">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-semibold text-lg">Chauffeurs</h3>
              <p className="text-gray-500 text-sm mt-1">{drivers.length} chauffeur{drivers.length > 1 ? 's' : ''} enregistre{drivers.length > 1 ? 's' : ''}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition" />
          </div>
        </Link>
        <Link to="/fleet/vehicles" className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-emerald-200 transition group" data-testid="link-vehicles">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-semibold text-lg">Vehicules</h3>
              <p className="text-gray-500 text-sm mt-1">{vehicles.length} vehicule{vehicles.length > 1 ? 's' : ''} enregistre{vehicles.length > 1 ? 's' : ''}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default FleetDashboard;
