import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, ArrowRight } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';

/**
 * Partner booking link landing — /p/:slug
 * Resolves the hotel, stores a signed attribution token + prefilled destination,
 * then sends the client into the normal booking funnel (home search) with the
 * hotel prefilled as the drop-off.
 */
const PartnerLink = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setReferral } = useBooking();
  const [state, setState] = useState('loading'); // loading | ready | disabled | error
  const [hotelName, setHotelName] = useState('');

  useEffect(() => {
    const API = process.env.REACT_APP_BACKEND_URL;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/referral/link/${encodeURIComponent(slug)}`);
        if (!res.ok) { if (!cancelled) setState('error'); return; }
        const data = await res.json();
        if (cancelled) return;
        setHotelName(data.hotelName || '');
        if (!data.enabled || !data.token) { setState('disabled'); return; }
        setReferral({
          slug: data.slug,
          token: data.token,
          hotelName: data.hotelName,
          dropoff: {
            address: data.destination?.address || data.hotelName,
            latitude: data.destination?.latitude ?? null,
            longitude: data.destination?.longitude ?? null,
          },
        });
        setState('ready');
        // Small delay so the client sees the confirmation, then into the funnel.
        setTimeout(() => { if (!cancelled) navigate('/', { replace: true }); }, 1200);
      } catch (e) {
        if (!cancelled) setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b1120] via-[#1a2540] to-[#0b1120] px-5" data-testid="partner-link-page">
      <div className="max-w-md w-full bg-white/[0.04] border border-white/10 rounded-3xl p-8 text-center backdrop-blur">
        {state === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-[#2ecc71] animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Préparation de votre réservation…</p>
          </>
        )}
        {state === 'ready' && (
          <div data-testid="partner-link-ready">
            <div className="w-14 h-14 rounded-2xl bg-[#2ecc71]/15 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-[#2ecc71]" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Réservez votre transfert</h1>
            <p className="text-gray-300">
              vers <span className="font-semibold text-white">{hotelName}</span>
            </p>
            <p className="text-gray-400 text-sm mt-4 inline-flex items-center gap-1.5">
              Redirection vers la réservation <ArrowRight className="w-4 h-4" />
            </p>
          </div>
        )}
        {state === 'disabled' && (
          <div data-testid="partner-link-disabled">
            <h1 className="text-xl font-bold text-white mb-2">Lien indisponible</h1>
            <p className="text-gray-300 mb-5">Ce lien de réservation n'est pas actif pour le moment.</p>
            <button onClick={() => navigate('/')} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-6 py-3 rounded-xl font-semibold" data-testid="partner-link-home-btn">
              Aller sur ZONT
            </button>
          </div>
        )}
        {state === 'error' && (
          <div data-testid="partner-link-error">
            <h1 className="text-xl font-bold text-white mb-2">Lien introuvable</h1>
            <p className="text-gray-300 mb-5">Ce lien de réservation n'existe pas.</p>
            <button onClick={() => navigate('/')} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-6 py-3 rounded-xl font-semibold" data-testid="partner-link-home-btn">
              Aller sur ZONT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerLink;
