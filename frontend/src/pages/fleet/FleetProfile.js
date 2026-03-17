import React, { useState, useEffect } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { Building2, Loader2, Mail, Phone, MapPin, Hash, Shield, Star } from 'lucide-react';

const FleetProfile = () => {
  const { authFetch } = useFleetAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/fleet/company/profile').then(r => r.ok ? r.json() : null)
      .then(setProfile)
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Profil indisponible</div>;

  return (
    <div className="space-y-6 max-w-3xl" data-testid="fleet-profile">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.companyName}</h2>
            <p className="text-gray-500">{profile.firstName} {profile.lastName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-900 text-sm font-medium">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Telephone</p>
                <p className="text-gray-900 text-sm font-medium">{profile.phone || 'Non renseigne'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Adresse</p>
                <p className="text-gray-900 text-sm font-medium">{profile.address || 'Non renseigne'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Code parrainage</p>
                <p className="text-gray-900 text-sm font-medium">{profile.referalCode || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Statut</p>
                <p className={`text-sm font-medium ${profile.isActivated && profile.isAdminActivated ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {profile.isActivated && profile.isAdminActivated ? 'Active' : 'En attente'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Star className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Note</p>
                <p className="text-gray-900 text-sm font-medium">{profile.rank}/5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{profile.numberOfDrivers}</p>
            <p className="text-xs text-gray-500">Chauffeurs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{profile.vehicleCount}</p>
            <p className="text-xs text-gray-500">Vehicules</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{profile.tripsCount}</p>
            <p className="text-xs text-gray-500">Courses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetProfile;
