import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { transferService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Users, Briefcase, Car, ChevronRight, ArrowRight, MapPin, Clock, Shield, CheckCircle, Loader2, Star } from 'lucide-react';
import { PromoPopup, PromoBanner } from '@/components/PromoPopup';
import { trackViewContent } from '@/utils/fbPixel';

const labels = {
  en: {
    seoTitle: 'Select Your Vehicle - Zont Airport Transfer',
    title: 'Select your vehicle',
    subtitle: 'All prices are fixed and include VAT, tolls and meet & greet',
    step1: 'Vehicle', step2: 'Details', step3: 'Payment',
    pax: 'Max', bags: 'Bags',
    selectPrefix: 'Book now', allIncluded: 'all included',
    noData: 'No search data found', goBack: 'Start a New Search',
    from: 'Pick-up', to: 'Drop-off',
    estTime: 'Est. travel time', estDist: 'Distance',
    recommended: 'Recommended',
    loading: 'Searching available vehicles...',
    error: 'Unable to fetch vehicles. Please try again.',
    retry: 'Retry', fixedPrice: 'Fixed price',
    mins: 'min', km: 'km', orSimilar: 'or similar',
    androidApp: 'Download our app',
    androidAppSub: 'Book and track your ride in real time',
    reviewsBadge: 'reviews',
    trustDriver: 'Professional driver',
    trustWaiting: '60 min free waiting at airport',
    trustCancel: 'Free cancellation',
    trustNoFees: 'No hidden fees',
    urgency: 'High demand',
    urgencySuffix: 'cars available today',
    reviewsTitle: 'What our clients say',
    bookedToday: 'Booked {n} times today',
    lastBooking: 'Last booking: {n} min ago',
  },
  fr: {
    seoTitle: 'Choisir Votre Véhicule - Zont Transfert Aéroport',
    title: 'Sélectionnez votre véhicule',
    subtitle: 'Tous les prix sont fixes et incluent TVA, péages et accueil personnalisé',
    step1: 'Véhicule', step2: 'Détails', step3: 'Paiement',
    pax: 'Max', bags: 'Bagages',
    selectPrefix: 'Réserver maintenant', allIncluded: 'tout compris',
    noData: 'Aucune recherche trouvée', goBack: 'Nouvelle Recherche',
    from: 'Départ', to: 'Arrivée',
    estTime: 'Temps estimé', estDist: 'Distance',
    recommended: 'Recommandé',
    loading: 'Recherche des véhicules disponibles...',
    error: 'Impossible de charger les véhicules. Veuillez réessayer.',
    retry: 'Réessayer', fixedPrice: 'Prix fixe',
    mins: 'min', km: 'km', orSimilar: 'ou similaire',
    androidApp: 'Télécharger notre application',
    androidAppSub: 'Réservez et suivez votre course en temps réel',
    reviewsBadge: 'avis clients',
    trustDriver: 'Chauffeur professionnel',
    trustWaiting: '60 min d\'attente gratuite à l\'aéroport',
    trustCancel: 'Annulation gratuite',
    trustNoFees: 'Aucun frais caché',
    urgency: 'Très demandé',
    urgencySuffix: 'véhicules disponibles aujourd\'hui',
    reviewsTitle: 'Ce que disent nos clients',
    bookedToday: 'Réservé {n} fois aujourd\'hui',
    lastBooking: 'Dernière réservation : il y a {n} min',
  },
  ru: {
    seoTitle: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0410\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c - Zont \u0422\u0440\u0430\u043d\u0441\u0444\u0435\u0440',
    title: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c',
    subtitle: '\u0412\u0441\u0435 \u0446\u0435\u043d\u044b \u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435, \u0432\u043a\u043b\u044e\u0447\u0430\u044e\u0442 \u041d\u0414\u0421, \u0434\u043e\u0440\u043e\u0436\u043d\u044b\u0435 \u0441\u0431\u043e\u0440\u044b \u0438 \u0432\u0441\u0442\u0440\u0435\u0447\u0443',
    step1: '\u0410\u0432\u0442\u043e', step2: '\u0414\u0435\u0442\u0430\u043b\u0438', step3: '\u041e\u043f\u043b\u0430\u0442\u0430',
    pax: '\u041c\u0430\u043a\u0441', bags: '\u0411\u0430\u0433\u0430\u0436',
    selectPrefix: '\u0417\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c', allIncluded: '\u0432\u0441\u0451 \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u043e',
    noData: '\u0414\u0430\u043d\u043d\u044b\u0435 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b', goBack: '\u041d\u043e\u0432\u044b\u0439 \u041f\u043e\u0438\u0441\u043a',
    from: '\u041e\u0442\u043a\u0443\u0434\u0430', to: '\u041a\u0443\u0434\u0430',
    estTime: '\u0412\u0440\u0435\u043c\u044f \u0432 \u043f\u0443\u0442\u0438', estDist: '\u0420\u0430\u0441\u0441\u0442\u043e\u044f\u043d\u0438\u0435',
    recommended: '\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c',
    loading: '\u041f\u043e\u0438\u0441\u043a \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u0435\u0439...',
    error: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
    retry: '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c', fixedPrice: '\u0424\u0438\u043a\u0441. \u0446\u0435\u043d\u0430',
    mins: '\u043c\u0438\u043d', km: '\u043a\u043c', orSimilar: '\u0438\u043b\u0438 \u0430\u043d\u0430\u043b\u043e\u0433',
    androidApp: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435',
    androidAppSub: '\u0411\u0440\u043e\u043d\u0438\u0440\u0443\u0439\u0442\u0435 \u0438 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u043f\u043e\u0435\u0437\u0434\u043a\u0443',
    reviewsBadge: '\u043e\u0442\u0437\u044b\u0432\u043e\u0432',
    trustDriver: '\u041f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c',
    trustWaiting: '60 \u043c\u0438\u043d \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e\u0435 \u043e\u0436\u0438\u0434\u0430\u043d\u0438\u0435 \u0432 \u0430\u044d\u0440\u043e\u043f\u043e\u0440\u0442\u0443',
    trustCancel: '\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0430\u044f \u043e\u0442\u043c\u0435\u043d\u0430',
    trustNoFees: '\u0411\u0435\u0437 \u0441\u043a\u0440\u044b\u0442\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439',
    urgency: '\u0412\u044b\u0441\u043e\u043a\u0438\u0439 \u0441\u043f\u0440\u043e\u0441',
    urgencySuffix: '\u0430\u0432\u0442\u043e \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e \u0441\u0435\u0433\u043e\u0434\u043d\u044f',
    reviewsTitle: '\u041e\u0442\u0437\u044b\u0432\u044b \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432',
    bookedToday: '\u0417\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u043e {n} \u0440\u0430\u0437 \u0441\u0435\u0433\u043e\u0434\u043d\u044f',
    lastBooking: '\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u0431\u0440\u043e\u043d\u044c: {n} \u043c\u0438\u043d \u043d\u0430\u0437\u0430\u0434',
  },
  hy: {
    seoTitle: '\u0538\u0576\u057f\u0580\u0565\u0584 \u0544\u0565\u0584\u0565\u0576\u0561 - Zont \u054f\u0580\u0561\u0576\u057d\u0586\u0565\u0580',
    title: '\u0538\u0576\u057f\u0580\u0565\u0584 \u0571\u0565\u0580 \u0574\u0565\u0584\u0565\u0576\u0561\u0576',
    subtitle: '\u0532\u0578\u056c\u0578\u0580 \u0563\u0576\u0565\u0580\u0568 \u0570\u0561\u057d\u057f\u0561\u057f \u0565\u0576 \u0587 \u0576\u0565\u0580\u0561\u057c\u0578\u0582\u0574 \u0565\u0576 \u0531\u0531\u054f, \u0573\u0561\u0576\u0561\u057a\u0561\u0580\u0570\u0561\u0575\u056b\u0576 \u057e\u0573\u0561\u0580\u0576\u0565\u0580 \u0587 \u0564\u056b\u0574\u0561\u057e\u0578\u0580\u0578\u0582\u0574',
    step1: '\u0544\u0565\u0584\u0565\u0576\u0561', step2: '\u054f\u057e\u0575\u0561\u056c\u0576\u0565\u0580', step3: '\u054e\u0573\u0561\u0580\u0578\u0582\u0574',
    pax: '\u0531\u057c\u0561\u057e', bags: '\u054a\u0561\u0575\u0578\u0582\u057d\u0561\u056f',
    selectPrefix: '\u0531\u0574\u0580\u0561\u0563\u0580\u0565\u056c \u0570\u056b\u0574\u0561', allIncluded: '\u0561\u0574\u0565\u0576 \u056b\u0576\u0579 \u0576\u0565\u0580\u0561\u057c\u057e\u0561\u056e',
    noData: '\u0548\u0580\u0578\u0576\u0574\u0561\u0576 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580 \u0579\u0565\u0576 \u0563\u057f\u0576\u057e\u0565\u056c', goBack: '\u0546\u0578\u0580 \u0578\u0580\u0578\u0576\u0578\u0582\u0574',
    from: '\u054f\u0565\u0572\u056b\u0581', to: '\u0534\u0565\u057a\u056b',
    estTime: '\u0544\u0578\u057f. \u056a\u0561\u0574\u0561\u0576\u0561\u056f', estDist: '\u0540\u0565\u057c\u0561\u057e\u0578\u0580\u0578\u0582\u0569',
    recommended: '\u0540\u0561\u0576\u0580\u0561\u056f\u057e\u0561\u056e',
    loading: '\u0540\u0561\u057d\u0561\u0576\u0565\u056c\u056b \u0574\u0565\u0584\u0565\u0576\u0561\u0576\u0565\u0580\u056b \u0578\u0580\u0578\u0576\u0578\u0582\u0574...',
    error: '\u0540\u0576\u0561\u0580\u0561\u057e\u0578\u0580 \u0579\u0567 \u0563\u057f\u0576\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576\u0565\u0580. \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576.',
    retry: '\u053f\u0580\u056f\u0576\u0565\u056c', fixedPrice: '\u0540\u0561\u057d\u057f\u0561\u057f \u0563\u056b\u0576',
    mins: '\u0580\u0578\u057a', km: '\u056f\u0574', orSimilar: '\u056f\u0561\u0574 \u0576\u0574\u0561\u0576',
    androidApp: '\u0532\u0565\u057c\u0576\u0565\u056c \u0570\u0561\u057e\u0565\u056c\u057e\u0561\u056e\u0568',
    androidAppSub: '\u0531\u0574\u0580\u0561\u0563\u0580\u0565\u0584 \u0587 \u0570\u0565\u057f\u0587\u0565\u0584 \u0571\u0565\u0580 \u0578\u0582\u0572\u0587\u0578\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568',
    reviewsBadge: '\u056f\u0561\u0580\u056e\u056b\u0584',
    trustDriver: '\u054a\u0580\u0578\u0586\u0565\u057d\u056b\u0578\u0576\u0561\u056c \u057e\u0561\u0580\u0578\u0580\u0564',
    trustWaiting: '60 \u0580\u0578\u057a\u0565 \u0561\u0576\u057e\u0573\u0561\u0580 \u057d\u057a\u0561\u057d\u0565\u056c\u0578\u0582 \u0585\u0564\u0561\u0576\u0561\u057e\u0561\u056f\u0561\u0575\u0561\u0576\u0578\u0582\u0574',
    trustCancel: '\u0531\u0576\u057e\u0573\u0561\u0580 \u0579\u0565\u0572\u0561\u0580\u056f\u0578\u0582\u0574',
    trustNoFees: '\u0531\u057c\u0561\u0576\u0581 \u0569\u0561\u0584\u0576\u057e\u0561\u056e \u057e\u0573\u0561\u0580\u0576\u0565\u0580\u056b',
    urgency: '\u0544\u0565\u056e \u057a\u0561\u0570\u0561\u0576\u056b\u0561\u0580\u056f',
    urgencySuffix: '\u0574\u0565\u0584\u0565\u0576\u0561 \u0570\u0561\u057d\u0561\u0576\u0565\u056c\u056b \u0561\u0575\u057d\u0585\u0580',
    reviewsTitle: '\u053b\u0576\u0579 \u0561\u057d\u0578\u0582\u0574 \u0565\u0576 \u0574\u0565\u0580 \u0570\u0561\u0573\u0561\u056d\u043e\u0580\u0564\u0576\u0565\u0580\u0568',
    bookedToday: '\u0531\u0575\u057d\u0585\u0580 \u0561\u0574\u0580\u0561\u0563\u0580\u057e\u0565\u056c \u0567 {n} \u0561\u0576\u0563\u0561\u0574',
    lastBooking: '\u054e\u0565\u0580\u057b\u056b\u0576 \u0561\u0574\u0580\u0561\u0563\u0580\u0578\u0582\u0574\u0568\u055d {n} \u0580\u0578\u057a\u0565 \u0561\u057c\u0561\u057b',
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

  // Reviews aggregate
  const [reviewData, setReviewData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [urgencyCount] = useState(() => Math.floor(Math.random() * 3) + 2); // 2-4

  const isAndroid = /android/i.test(navigator.userAgent);

  // Social proof: random but stable per session per vehicle index
  const socialProof = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const showBookedToday = (i % 2 === 0);
      return {
        bookedCount: 8 + Math.floor(Math.random() * 28), // 8–35
        lastMinutes: 5 + Math.floor(Math.random() * 41), // 5–45
        showBookedToday,
      };
    });
  }, []);

  const c = labels[language] || labels.en;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Fetch aggregate review data + actual reviews
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reviews/public/schema/home`)
      .then(r => r.json())
      .then(d => {
        if (d.aggregateRating) setReviewData(d.aggregateRating);
        if (d.reviews) setReviews(d.reviews.slice(0, 3));
      })
      .catch(() => {});
  }, []);

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

  // Show promo popup after vehicles load — DISABLED for now
  // useEffect(() => {
  //   if (vehicleResults && vehicleResults.length > 0 && !promoCode && !localStorage.getItem('promo_email')) {
  //     const timer = setTimeout(() => setPromoOpen(true), 11000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [vehicleResults, promoCode]);

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
    trackViewContent({ vehicle: vehicle.name, price: vehicle.price });
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

        {/* Trust Block */}
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3" data-testid="trust-block">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center">
              {/* Rating badge */}
              {reviewData && (
                <div className="flex items-center gap-1.5" data-testid="reviews-badge">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(reviewData.ratingValue) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">{reviewData.ratingValue}/5</span>
                  <span className="text-xs text-gray-400">&ndash; {reviewData.reviewCount}+ {c.reviewsBadge}</span>
                </div>
              )}
              {/* Trust items */}
              {[
                { icon: <Users className="w-3 h-3 text-[#2ecc71]" />, text: c.trustDriver },
                { icon: <Clock className="w-3 h-3 text-[#2ecc71]" />, text: c.trustWaiting },
                { icon: <Shield className="w-3 h-3 text-[#2ecc71]" />, text: c.trustCancel },
                { icon: <CheckCircle className="w-3 h-3 text-[#2ecc71]" />, text: c.trustNoFees },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Urgency banner */}
        {!loading && vehicles.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 pb-2">
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2" data-testid="urgency-banner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <span className="text-xs font-semibold text-orange-300">{c.urgency} &ndash; {urgencyCount} {c.urgencySuffix}</span>
            </div>
          </div>
        )}

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
                      <div className="w-full sm:w-[280px] md:w-[340px] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-0 sm:p-5 h-[150px] sm:min-h-[180px] overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={tripType}
                            className="w-full h-full sm:w-full sm:max-h-none object-contain scale-125 sm:scale-100"
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
                        {/* Social proof */}
                        <div className="flex items-center gap-1.5 text-[11px] text-orange-500/80 mt-1" data-testid={`social-proof-${index}`}>
                          {socialProof[index]?.showBookedToday ? (
                            <>
                              <span className="w-3 h-3 flex items-center justify-center text-[10px]">&#128293;</span>
                              <span>{c.bookedToday.replace('{n}', socialProof[index].bookedCount)}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{c.lastBooking.replace('{n}', socialProof[index].lastMinutes)}</span>
                            </>
                          )}
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
                          className={`px-4 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1 whitespace-nowrap ${
                            isRecommended
                              ? 'bg-[#2ecc71] text-white hover:bg-[#27ae60] shadow-md shadow-green-500/20'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                          data-testid={`choose-car-${index}`}
                        >
                          {c.selectPrefix} &ndash; {applyDiscount(price)}&euro; {c.allIncluded}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          {/* Client Reviews */}
          {reviews.length > 0 && (
            <div className="mt-6 mb-4" data-testid="client-reviews-section">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">{c.reviewsTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reviews.map((rev, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl p-3" data-testid={`review-card-${i}`}>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= (rev.reviewRating?.ratingValue || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">&ldquo;{rev.reviewBody}&rdquo;</p>
                    <p className="text-[10px] text-gray-500 mt-2 font-medium">&mdash; {rev.author?.name || 'Client'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAndroid && (
            <div className="mt-6 mb-4 mx-auto max-w-2xl">
              <a href="https://play.google.com/store/apps/details?id=com.zont.rider&hl=fr" target="_blank" rel="noopener noreferrer" data-testid="android-download-btn" className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid #2ecc7133' }}>
                <div className="w-12 h-12 rounded-xl bg-[#2ecc71]/15 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734c0-.382.218-.72.61-.92z" fill="#4285F4"/><path d="M17.556 8.237l-3.764 3.764 3.764 3.763 4.242-2.393c.478-.27.478-.94 0-1.21l-4.242-2.393-.001.469z" fill="#FBBC04"/><path d="M3.609 1.814L13.792 12l3.764-3.763L6.148.582a1.173 1.173 0 00-1.157.037l-1.382.78v.415z" fill="#34A853"/><path d="M13.792 12L3.609 22.186l1.382.78a1.173 1.173 0 001.157.037l11.408-6.655L13.792 12z" fill="#EA4335"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{c.androidApp}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{c.androidAppSub}</p>
                </div>
                <div className="shrink-0"><div className="px-3 py-1.5 rounded-lg bg-[#2ecc71] text-white text-xs font-bold">Google Play</div></div>
              </a>
            </div>
          )}
          </div>
        )}
      </main>

      <Footer />

      <PromoPopup open={promoOpen} onClose={() => setPromoOpen(false)} onApply={handlePromoApply} />
    </div>
  );
};

export default CarSelection;
