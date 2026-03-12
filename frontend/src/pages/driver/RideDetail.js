import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { ArrowLeft, Loader2, MapPin, Clock, CheckCircle, XCircle, AlertCircle, User, Phone, Plane, FileText, Car, Navigation, DollarSign, Calendar } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: Clock, desc: 'Votre course est en attente de validation par l\'admin.' },
  accepted: { label: 'Acceptee', color: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle, desc: 'Votre course a ete acceptee ! Un chauffeur sera assigne.' },
  rejected: { label: 'Refusee', color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: XCircle, desc: 'Votre course a ete refusee. Contactez l\'admin pour plus d\'infos.' },
  completed: { label: 'Terminee', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle, desc: 'Course terminee avec succes.' },
  cancelled: { label: 'Annulee', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', icon: AlertCircle, desc: 'Cette course a ete annulee.' },
};

const RideDetail = () => {
  const { id } = useParams();
  const { token } = useDriverAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await fetch(`${API}/api/partner/rides/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRide(data);
          // Calculate route
          if (data.pickup_address && data.dropoff_address) {
            const routeRes = await fetch(`${API}/api/partner/calculate-route`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ origin: data.pickup_address, destination: data.dropoff_address }),
            });
            if (routeRes.ok) {
              const routeData = await routeRes.json();
              if (routeData.status === 'ok') setRouteInfo(routeData);
            }
          }
        }
      } catch {} finally { setLoading(false); }
    };
    fetchRide();
  }, [id, token]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#2ecc71] animate-spin" />
    </div>
  );

  if (!ride) return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col items-center justify-center p-4">
      <p className="text-gray-400">Course introuvable</p>
      <button onClick={() => navigate('/driver')} className="mt-4 text-[#2ecc71] text-sm">Retour</button>
    </div>
  );

  const sc = statusConfig[ride.status] || statusConfig.pending;
  const StatusIcon = sc.icon;

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="ride-detail-page">
      <header className="bg-[#1a2332] border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate('/driver')} className="text-gray-400 hover:text-white transition" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-sm">Detail de la Course</h1>
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 border ${sc.color}`} data-testid="ride-status">
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon className="w-5 h-5" />
            <span className="font-bold text-sm">{sc.label}</span>
          </div>
          <p className="text-xs opacity-80">{sc.desc}</p>
        </div>

        {/* Route */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2ecc71]" /> Itineraire
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <div className="w-0.5 h-8 bg-gray-700 my-1" />
                <div className="w-3 h-3 bg-red-400 rounded-full" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Depart</p>
                  <p className="text-white text-sm">{ride.pickup_address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Arrivee</p>
                  <p className="text-white text-sm">{ride.dropoff_address}</p>
                </div>
              </div>
            </div>

            {routeInfo && (
              <div className="bg-[#0f1419] rounded-lg p-3 flex items-center gap-4" data-testid="route-info">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#2ecc71]" />
                  <span className="text-white font-semibold text-sm">{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2ecc71]" />
                  <span className="text-white font-semibold text-sm">{routeInfo.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle & Price */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-[#2ecc71]" /> Vehicule & Prix
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f1419] rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Categorie</p>
              <p className="text-white font-medium text-sm">{ride.vehicle_category_name}</p>
            </div>
            <div className="bg-[#0f1419] rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Prix propose</p>
              <p className="text-[#2ecc71] font-bold text-lg">{ride.proposed_price} {ride.currency}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        {(ride.passenger_name || ride.passenger_phone || ride.pickup_datetime || ride.flight_number) && (
          <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#2ecc71]" /> Details
            </h3>
            <div className="space-y-2.5">
              {ride.passenger_name && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{ride.passenger_name}</span>
                </div>
              )}
              {ride.passenger_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{ride.passenger_phone}</span>
                </div>
              )}
              {ride.pickup_datetime && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{new Date(ride.pickup_datetime).toLocaleString('fr-FR')}</span>
                </div>
              )}
              {ride.flight_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Plane className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{ride.flight_number}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {ride.notes && (
          <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#2ecc71]" /> Notes
            </h3>
            <p className="text-gray-300 text-sm">{ride.notes}</p>
          </div>
        )}

        {/* Admin Notes */}
        {ride.admin_notes && (
          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
            <h3 className="text-amber-400 font-semibold text-sm mb-2">Note de l'admin</h3>
            <p className="text-gray-300 text-sm">{ride.admin_notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-600">Cree le {new Date(ride.created_at).toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default RideDetail;
