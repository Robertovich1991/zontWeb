import React from 'react';
import { useDriverAuth } from './DriverAuthContext';
import { User, Phone, Mail, Building2, Star, Shield, LogOut } from 'lucide-react';

export default function DriverProfile() {
  const { driver, driverType, logout } = useDriverAuth();

  const items = [
    { icon: Mail, label: 'Email', value: driver?.email },
    { icon: Phone, label: 'Telephone', value: driver?.phone },
    { icon: Building2, label: 'Societe', value: driver?.companyName },
    { icon: Star, label: 'Note', value: driver?.rank ? `${driver.rank}/5` : '-' },
    { icon: Shield, label: 'Type', value: driverType === 'csharp' ? 'Chauffeur Zont' : 'Chauffeur Societe' },
  ];

  return (
    <div className="px-4 py-6">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: '#262A36' }}>
          <User className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-white text-lg font-semibold">
          {driver?.firstName} {driver?.lastName}
        </h2>
        <span className={`text-[10px] mt-1 font-semibold uppercase px-2.5 py-0.5 rounded-full ${
          driverType === 'csharp' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {driverType === 'csharp' ? 'Chauffeur Zont' : 'Chauffeur Societe'}
        </span>
      </div>

      {/* Info Cards */}
      <div className="space-y-2 mb-8">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#1A1D29' }}>
            <Icon className="w-4 h-4 text-gray-500 shrink-0" />
            <div className="flex-1">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
              <p className="text-white text-sm">{value || '-'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        data-testid="driver-logout-btn"
        onClick={logout}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        style={{ background: '#1A1D29', border: '1px solid #ef444433' }}
      >
        <LogOut className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm font-medium">Se deconnecter</span>
      </button>
    </div>
  );
}
