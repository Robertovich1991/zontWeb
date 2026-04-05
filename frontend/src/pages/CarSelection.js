import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { transferService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Users, Briefcase, Car, ChevronRight, ArrowRight, MapPin, Clock, Shield, Plane, CheckCircle, Loader2 } from 'lucide-react';
import { PromoPopup, PromoBanner } from '@/components/PromoPopup';

const labels = {
  en: {
    seoTitle: 'Select Your Vehicle - Zont Airport Transfer',
    title: 'Select your vehicle',
    subtitle: 'All prices are fixed and include VAT, tolls and meet & greet',
    step1: 'Vehicle', step2: 'Details', step3: 'Payment',
    pax: 'Max', bags: 'Bags', select: 'Select',
    noData: 'No search data found', goBack: 'Start a New Search',
    from: 'Pick-up', to: 'Drop-off',
    estTime: 'Est. travel time', estDist: 'Distance',
    recommended: 'Recommended',
    trustItems: ['Free cancellation 24h', 'Fixed price guaranteed', 'Meet & greet included', 'Flight tracking'],
    loading: 'Searching available vehicles...',
    error: 'Unable to fetch vehicles. Please try again.',
    retry: 'Retry', fixedPrice: 'Fixed price',
    mins: 'min', km: 'km', orSimilar: 'or similar',
  },
  fr: {
    seoTitle: 'Choisir Votre Vehicule - Zont Transfert Aeroport',
    title: 'Selectionnez votre vehicule',
    subtitle: 'Tous les prix sont fixes et incluent TVA, peages et accueil personnalise',
    step1: 'Vehicule', step2: 'Details', step3: 'Paiement',
    pax: 'Max', bags: 'Bagages', select: 'Selectionner',
    noData: 'Aucune recherche trouvee', goBack: 'Nouvelle Recherche',
    from: 'Depart', to: 'Arrivee',
    estTime: 'Temps estime', estDist: 'Distance',
    recommended: 'Recommande',
    trustItems: ['Annulation gratuite 24h', 'Prix fixe garanti', 'Accueil personnalise', 'Suivi de vol'],
    loading: 'Recherche des vehicules disponibles...',
    error: 'Impossible de charger les vehicules. Veuillez reessayer.',
    retry: 'Reessayer', fixedPrice: 'Prix fixe',
    mins: 'min', km: 'km', orSimilar: 'ou similaire',
  },
  ru: {
    seoTitle: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0410\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c - Zont \u0422\u0440\u0430\u043d\u0441\u0444\u0435\u0440',
    title: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c',
    subtitle: '\u0412\u0441\u0435 \u0446\u0435\u043d\u044b \u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435, \u0432\u043a\u043b\u044e\u0447\u0430\u044e\u0442 \u041d\u0414\u0421, \u0434\u043e\u0440\u043e\u0436\u043d\u044b\u0435 \u0441\u0431\u043e\u0440\u044b \u0438 \u0432\u0441\u0442\u0440\u0435\u0447\u0443',
    step1: '\u0410\u0432\u0442\u043e', step2: '\u0414\u0435\u0442\u0430\u043b\u0438', step3: '\u041e\u043f\u043b\u0430\u0442\u0430',
    pax: '\u041c\u0430\u043a\u0441', bags: '\u0411\u0430\u0433\u0430\u0436', select: '\u0412\u044b\u0431\u0440\u0430\u0442\u044c',
    noData: '\u0414\u0430\u043d\u043d\u044b\u0435 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b', goBack: '\u041d\u043e\u0432\u044b\u0439 \u041f\u043e\u0438\u0441\u043a',
    from: '\u041e\u0442\u043a\u0443\u0434\u0430', to: '\u041a\u0443\u0434\u0430',
    estTime: '\u0412\u0440\u0435\u043c\u044f \u0432 \u043f\u0443\u0442\u0438', estDist: '\u0420\u0430\u0441\u0441\u0442\u043e\u044f\u043d\u0438\u0435',
    recommended: '\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c',
    trustItems: ['\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0430\u044f \u043e\u0442\u043c\u0435\u043d\u0430 24\u0447', '\u0424\u0438\u043a\u0441. \u0446\u0435\u043d\u0430', '\u0412\u0441\u0442\u0440\u0435\u0447\u0430 \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0430', '\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 \u0440\u0435\u0439\u0441\u0430'],
    loading: '\u041f\u043e\u0438\u0441\u043a \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u0435\u0439...',
    error: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
    retry: '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c', fixedPrice: '\u0424\u0438\u043a\u0441. \u0446\u0435\u043d\u0430',
    mins: '\u043c\u0438\u043d', km: '\u043a\u043c', orSimilar: '\u0438\u043b\u0438 \u0430\u043d\u0430\u043b\u043e\u0433',
  },
  hy: {
    seoTitle: '\u0538\u0576\u057f\u0580\u0565\u0584 \u0544\u0565\u0584\u0565\u0576\u0561 - Zont \u054f\u0580\u0561\u0576\u057d\u0586\u0565\u0580',
    title: '\u0538\u0576\u057f\u0580\u0565\u0584 \u0571\u0565\u0580 \u0574\u0565\u0584\u0565\u0576\u0561\u0576',
    subtitle: '\u0532\u0578\u056c\u0578\u0580 \u0563\u0576\u0565\u0580\u0568 \u0570\u0561\u057d\u057f\u0561\u057f \u0565\u0576 \u0587 \u0576\u0565\u0580\u0561\u057c\u0578\u0582\u0574 \u0565\u0576 \u0531\u0531\u054f, \u0573\u0561\u0576\u0561\u057a\u0561\u0580\u0570\u0561\u0575\u056b\u0576 \u057e\u0573\u0561\u0580\u0576\u0565\u0580 \u0587 \u0564\u056b\u0574\u0561\u057e\u0578\u0580\u0578\u0582\u0574',
    step1: '\u0544\u0565\u0584\u0565\u0576\u0561', step2: '\u054f\u057e\u0575\u0561\u056c\u0576\u0565\u0580', step3: '\u054e\u0573\u0561\u0580\u0578\u0582\u0574',
    pax: '\u0531\u057c\u0561\u057e', bags: '\u054a\u0561\u0575\u0578\u0582\u057d\u0561\u056f', select: '\u0538\u0576\u057f\u0580\u0565\u056c',
    noData: '\u0548\u0580\u0578\u0576\u0574\u0561\u0576 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580 \u0579\u0565\u0576 \u0563\u057f\u0576\u057e\u0565\u056c', goBack: '\u0546\u0578\u0580 \u0578\u0580\u0578\u0576\u0578\u0582\u0574',
    from: '\u054f\u0565\u0572\u056b\u0581', to: '\u0534\u0565\u057a\u056b',
    estTime: '\u0544\u0578\u057f. \u056a\u0561\u0574\u0561\u0576\u0561\u056f', estDist: '\u0540\u0565\u057c\u0561\u057e\u0578\u0580\u0578\u0582\u0569',
    recommended: '\u0540\u0561\u0576\u0580\u0561\u056f\u057e\u0561\u056e',
    trustItems: ['\u0531\u0576\u057e\u0573\u0561\u0580 \u0579\u0565\u0572\u0561\u0580\u056f\u0578\u0582\u0574 24\u056a', '\u0540\u0561\u057d\u057f\u0561\u057f \u0563\u056b\u0576', '\u0534\u056b\u0574\u0561\u057e\u0578\u0580\u0578\u0582\u0574 \u0576\u0565\u0580\u0561\u057c\u057e\u0561\u056e', '\u0539\u057c\u056b\u0579\u0584\u056b \u0570\u0565\u057f\u0587\u0578\u0582\u0574'],
    loading: '\u0540\u0561\u057d\u0561\u0576\u0565\u056c\u056b \u0574\u0565\u0584\u0565\u0576\u0561\u0576\u0565\u0580\u056b \u0578\u0580\u0578\u0576\u0578\u0582\u0574...',
    error: '\u0540\u0576\u0561\u0580\u0561\u057e\u0578\u0580 \u0579\u0567 \u0563\u057f\u0576\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576\u0565\u0580. \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576.',
    retry: '\u053f\u0580\u056f\u0576\u0565\u056c', fixedPrice: '\u0540\u0561\u057d\u057f\u0561\u057f \u0563\u056b\u0576',
    mins: '\u0580\u0578\u057a', km: '\u056f\u0574', orSimilar: '\u056f\u0561\u0574 \u0576\u0574\u0561\u0576',
  },
};

const CarSelection = () => {
  const navigate = useNavigate();
  const { searchData, selectCar, vehicleResults, setVehicleResults } = useBooking();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Promo state
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoExpires, setPromoExpires] = useState(null);
  const [promoExpired, setPromoExpired] = useState(false);

  const c = labels[language] || labels.en;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Restore promo from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('promo_code');
    const savedExpires = localStorage.getItem('promo_expires');
    const savedDiscount = localStorage.getItem('promo_discount');
    if (savedCode && savedExpires) {
      const exp = new Date(savedExpires);
      if (exp > new Date()) {
        setPromoCode(savedCode);
        setPromoDiscount(Number(savedDiscount) || 10);
        setPromoExpires(savedExpires);
      } else {
        // Expired — clean up
        localStorage.removeItem('promo_code');
        localStorage.removeItem('promo_expires');
        localStorage.removeItem('promo_discount');
      }
    }
  }, []);

  // Fetch vehicles from C# API if we have search data but no results yet
  useEffect(() => {
    if (searchData?.pickupCoords && searchData?.dropoffCoords && !vehicleResults) {
      fetchVehicles();
    }
  }, [searchData]);

  // Show promo popup after vehicles load (if no active promo and no email given before)
  useEffect(() => {
    if (vehicleResults && vehicleResults.length > 0 && !promoCode && !localStorage.getItem('promo_email')) {
      const timer = setTimeout(() => setPromoOpen(true), 7000);
      return () => clearTimeout(timer);
    }
  }, [vehicleResults, promoCode]);

  const fetchVehicles = async () => {
    if (!searchData?.pickupCoords || !searchData?.dropoffCoords) return;
    setLoading(true);
    setError(null);
    try {
      const results = await transferService.calculatePreorderPrice(
        searchData.pickupCoords,
        searchData.dropoffCoords
      );
      setVehicleResults(results);
    } catch (err) {
      setError(c.error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoApply = useCallback((code, discount, expiresAt) => {
    setPromoCode(code);
    setPromoDiscount(discount);
    setPromoExpires(expiresAt);
    setPromoExpired(false);
  }, []);

  const handlePromoExpired = useCallback(() => {
    setPromoExpired(true);
    setPromoDiscount(0);
    localStorage.removeItem('promo_code');
    localStorage.removeItem('promo_expires');
    localStorage.removeItem('promo_discount');
  }, []);

  const activeDiscount = promoCode && !promoExpired ? promoDiscount : 0;
  const applyDiscount = (price) => activeDiscount > 0 ? Math.round(price * (1 - activeDiscount / 100)) : Math.round(price);

  const handleSelectCar = (vehicle) => {
    const finalPrice = applyDiscount(vehicle.minAmount);
    selectCar({
      tripType: vehicle.tripType,
      price: finalPrice,
      originalPrice: Math.round(vehicle.minAmount),
      maxPrice: activeDiscount > 0 ? applyDiscount(vehicle.maxAmount) : Math.round(vehicle.maxAmount),
      duration: vehicle.duration,
      distance: vehicle.distance,
      passenger: vehicle.passenger,
      luggage: vehicle.luggage,
      description: vehicle.description,
      imagePath: vehicle.imagePath,
      promoCode: promoCode || null,
      promoDiscount: activeDiscount,
    });
    // Mark promo as used
    if (promoCode && activeDiscount > 0) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/promo/mark-used`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      }).catch(() => {});
    }
    // Navigate to trip recap (handles both auth and non-auth users)
    navigate('/trip-recap');
  };

  // Empty state - no search data
  if (!searchData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="car-selection-empty">
        <SEO title={c.seoTitle} noindex={true} />
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-[#2ecc71]" />
            </div>
            <p className="text-white text-xl font-semibold mb-2">{c.noData}</p>
            <button onClick={() => navigate('/')} className="mt-4 bg-[#2ecc71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors inline-flex items-center gap-2" data-testid="go-back-btn">
              {c.goBack} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const vehicles = vehicleResults || [];
  const duration = vehicles.length > 0 ? vehicles[0].duration : null;
  const distance = vehicles.length > 0 ? vehicles[0].distance : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="car-selection-page">
      <SEO title={c.seoTitle} noindex={true} />
      <Header />

      <main className="flex-1 pt-16">
        {/* Steps */}
        <div className="bg-[#0f1419] border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3.5">
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-8 sm:w-12 h-px bg-gray-700" />}
                  <div className={`flex items-center gap-1.5 ${i === 0 ? 'text-[#2ecc71]' : 'text-gray-600'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i === 0 ? 'bg-[#2ecc71] text-white' : 'border border-gray-700 text-gray-600'}`}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">{step}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Route Summary */}
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-2">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2ecc71] flex-shrink-0" />
                  <span className="text-xs text-gray-500 w-10 flex-shrink-0">{c.from}</span>
                  <span className="text-sm text-white font-medium truncate">{searchData.pickup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500 w-10 flex-shrink-0">{c.to}</span>
                  <span className="text-sm text-white font-medium truncate">{searchData.dropoff}</span>
                </div>
              </div>
            </div>
            {(duration || distance) && (
              <div className="flex items-center gap-4 text-xs text-gray-400 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4 flex-shrink-0">
                {duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>{c.estTime}: <b className="text-white">~{duration} {c.mins}</b></span>
                  </div>
                )}
                {distance && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>{c.estDist}: <b className="text-white">~{distance} {c.km}</b></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trust Bar */}
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center">
            {c.trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                {[<Shield className="w-3 h-3 text-[#2ecc71]" />, <CheckCircle className="w-3 h-3 text-[#2ecc71]" />, <Plane className="w-3 h-3 text-[#2ecc71]" />, <Clock className="w-3 h-3 text-[#2ecc71]" />][i]}
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="max-w-5xl mx-auto px-4 pt-2 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white" data-testid="car-selection-title">{c.title}</h1>
          <p className="text-gray-500 text-xs mt-1">{c.subtitle}</p>
          {/* Promo Banner */}
          {promoCode && (
            <div className="mt-3">
              <PromoBanner code={promoCode} expiresAt={promoExpires} discount={promoDiscount} onExpired={handlePromoExpired} />
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#2ecc71] animate-spin mb-4" />
              <p className="text-gray-400 text-sm">{c.loading}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button onClick={fetchVehicles} className="bg-[#2ecc71] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="retry-btn">
                {c.retry}
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Cards - from C# API */}
        {!loading && !error && vehicles.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 pb-10">
            <div className="space-y-3">
              {vehicles.map((vehicle, index) => {
                const isRecommended = index === 0;
                const imageUrl = transferService.getVehicleImageUrl(vehicle.imagePath);
                const price = vehicle.minAmount;
                const tripType = (vehicle.tripType || '').trim();
                // Override passenger counts until C# API is updated
                const passengerOverrides = { 'Regular Zont': 3, 'Shuttle private 8 pers.': 8 };
                const paxCount = passengerOverrides[tripType] || vehicle.passenger;

                return (
                  <div
                    key={index}
                    className={`group relative bg-white rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20 ${
                      isRecommended ? 'ring-2 ring-[#2ecc71]' : 'ring-1 ring-gray-200'
                    }`}
                    data-testid={`car-card-${index}`}
                  >
                    {isRecommended && (
                      <div className="bg-[#2ecc71] text-white text-[11px] font-bold tracking-wide uppercase text-center py-1">
                        {c.recommended}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="w-full sm:w-[280px] md:w-[340px] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-3 sm:p-5 h-[160px] sm:min-h-[180px]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={tripType}
                            className="max-w-[95%] max-h-[140px] sm:w-full sm:max-h-none h-auto object-contain"
                            loading="lazy"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Car className="w-16 h-16 text-gray-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 px-3 py-2 sm:py-4 sm:px-5 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-lg font-bold text-gray-900">{tripType}</h3>
                          </div>
                          <p className="text-xs text-gray-400 mb-1.5 line-clamp-1">{vehicle.description || ''}</p>

                          {/* Specs */}
                          <div className="flex items-center gap-3 mb-1.5">
                            {paxCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                <span>{c.pax} <b>{paxCount}</b></span>
                              </div>
                            )}
                            {vehicle.luggage > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                <span>{c.bags} <b>{vehicle.luggage}</b></span>
                              </div>
                            )}
                            {vehicle.duration > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>~{vehicle.duration} {c.mins}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 px-3 pb-2 sm:p-5 sm:pl-0 sm:w-[170px] flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100">
                        <div className="sm:text-right">
                          {activeDiscount > 0 && (
                            <div className="text-base font-medium text-gray-400 line-through" data-testid={`original-price-${index}`}>
                              {Math.round(price)}&euro;
                            </div>
                          )}
                          <div className={`text-3xl font-extrabold ${activeDiscount > 0 ? 'text-emerald-600' : 'text-gray-900'}`} data-testid={`car-price-${index}`}>
                            {applyDiscount(price)}<span className="text-base font-normal text-gray-400 ml-0.5">&euro;</span>
                          </div>
                          <p className="text-[10px] text-gray-400">{c.fixedPrice}</p>
                        </div>
                        <button
                          onClick={() => handleSelectCar(vehicle)}
                          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-1 ${
                            isRecommended
                              ? 'bg-[#2ecc71] text-white hover:bg-[#27ae60] shadow-md shadow-green-500/20'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                          data-testid={`choose-car-${index}`}
                        >
                          {c.select}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <PromoPopup open={promoOpen} onClose={() => setPromoOpen(false)} onApply={handlePromoApply} />
    </div>
  );
};

export default CarSelection;
