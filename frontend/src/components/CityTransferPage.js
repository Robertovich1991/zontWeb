import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { transferService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import TripAdvisorReviews from '@/components/TripAdvisorReviews';
import PlacesAutocomplete, { loadGoogleMaps } from '@/components/PlacesAutocomplete';
import { trackSearch } from '@/utils/fbPixel';
import { Users, Briefcase, Shield, Clock, Star, MapPin, Plane, CreditCard, Phone, CheckCircle, ChevronRight } from 'lucide-react';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format',
  sedan: '/images/sedan-transfer.webp',
  interior: '/images/luxury-sedan-transfer.webp',
  airport: '/images/minibus-8-seats-transfer.webp',
  minivan: '/images/minivan-7-seats-transfer.webp',
};

const trustLabels = {
  en: { trips: 'Completed Trips', available: 'Available', fixed: 'Fixed Prices', rating: 'Rating', reviews: 'reviews', trustTitle: 'Trusted by thousands of travelers', paySecure: 'Secure Payment', payDesc: 'All major cards accepted', verifiedDriver: 'Verified Drivers', verifiedDesc: 'Licensed professionals', flightTrack: 'Flight Tracking', flightDesc: 'Real-time monitoring', freeCancel: 'Free Cancellation', cancelDesc: 'Up to 24h before' },
  fr: { trips: 'Courses Effectuées', available: 'Disponible', fixed: 'Prix Fixes', rating: 'Note', reviews: 'avis', trustTitle: 'La confiance de milliers de voyageurs', paySecure: 'Paiement Sécurisé', payDesc: 'Toutes cartes acceptées', verifiedDriver: 'Chauffeurs Vérifiés', verifiedDesc: 'Professionnels agréés', flightTrack: 'Suivi de Vol', flightDesc: 'Surveillance en temps réel', freeCancel: 'Annulation Gratuite', cancelDesc: 'Jusqu\'à 24h avant' },
  hy: { trips: 'Կատարված Ուղևորություններ', available: 'Հասանելի', fixed: 'Հաստատ Գներ', rating: 'Վարկանիշ', reviews: 'կարծիք', trustTitle: 'Վստահելի հազարավոր ճամորդների կողմից', paySecure: 'Ապահով Վճարում', payDesc: 'Բոլոր քարտեր ընդունվում են', verifiedDriver: 'Ստուգված Վարորդներ', verifiedDesc: 'Լիցենզավորված մասնագետներ', flightTrack: 'Թռիչքի Հետևելում', flightDesc: 'Իրական ժամանակի մոնիտորինգ', freeCancel: 'Անվճար Չեղարկում', cancelDesc: 'Մինչև 24 ժամ առաջ' },
  ru: { trips: 'Выполненных Поездок', available: 'Доступно', fixed: 'Фиксированные Цены', rating: 'Рейтинг', reviews: 'отзывов', trustTitle: 'Доверие тысяч путешественников', paySecure: 'Безопасная Оплата', payDesc: 'Все карты принимаются', verifiedDriver: 'Проверенные Водители', verifiedDesc: 'Лицензированные профессионалы', flightTrack: 'Отслеживание Рейса', flightDesc: 'Мониторинг в реальном времени', freeCancel: 'Бесплатная Отмена', cancelDesc: 'До 24 часов' },
};

const CityTransferPage = ({ content, vehicles: vehiclesPrices, seoUrls, meetDriverImage, stationLinks, heroImage, pageId, showDisposalCta, ogImage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startBooking, setVehicleResults } = useBooking();
  const { language, changeLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const bookingFormRef = useRef(null);
  const [pickup, setPickup] = useState({ address: '', latitude: null, longitude: null, placeId: null });
  const [dropoff, setDropoff] = useState({ address: '', latitude: null, longitude: null, placeId: null });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cmsPage, setCmsPage] = useState(null);
  const [cmsTrustBlocks, setCmsTrustBlocks] = useState(null);
  const [pageReviews, setPageReviews] = useState([]);
  const [reviewSchema, setReviewSchema] = useState(null);
  const langSyncRef = useRef(false);
  const pickupInitRef = useRef(false);
  const dropoffInitRef = useRef(false);

  // IMMUNE REFS: only autocomplete selection writes here, mobile onChange can NEVER clear them
  const pickupSafeRef = useRef({ latitude: null, longitude: null, placeId: null, address: '' });
  const dropoffSafeRef = useRef({ latitude: null, longitude: null, placeId: null, address: '' });

  const API = process.env.REACT_APP_BACKEND_URL;

  // Auto-detect language from URL on mount
  useEffect(() => {
    if (!seoUrls) return;
    const currentPath = location.pathname;
    for (const [lang, url] of Object.entries(seoUrls)) {
      if (currentPath === url) {
        if (lang !== language) {
          langSyncRef.current = true;
          changeLanguage(lang);
        }
        break;
      }
    }
  }, [location.pathname, seoUrls]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to correct URL when language changes (user-initiated)
  useEffect(() => {
    if (!seoUrls) return;
    if (langSyncRef.current) {
      langSyncRef.current = false;
      return;
    }
    const targetUrl = seoUrls[language];
    if (targetUrl && targetUrl !== location.pathname) {
      navigate(targetUrl, { replace: true });
    }
  }, [language, seoUrls]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Fetch CMS page data by slug
    const slug = seoUrls?.[language] || seoUrls?.fr || seoUrls?.en;
    if (slug) {
      const cleanSlug = slug.startsWith('/') ? slug.slice(1) : slug;
      fetch(`${API}/api/public/pages/by-slug/${cleanSlug}`).then(r => r.json()).then(d => {
        if (d && d.id) setCmsPage(d);
      }).catch(() => {});
    }
    // Fetch CMS trust blocks
    fetch(`${API}/api/public/trust-blocks`).then(r => r.json()).then(setCmsTrustBlocks).catch(() => {});
    // Fetch page reviews
    if (pageId) {
      fetch(`${API}/api/reviews/public/${pageId}?lang=${language}`).then(r => r.json()).then(setPageReviews).catch(() => {});
      fetch(`${API}/api/reviews/public/schema/${pageId}`).then(r => r.json()).then(setReviewSchema).catch(() => {});
    }
  }, [API, language, seoUrls]);

  const c = content[language] || content.en;
  const tr = trustLabels[language] || trustLabels.en;

  // CMS overrides for SEO fields
  const seoTitle = (cmsPage?.seo?.title?.[language]) || c.title;
  const seoDesc = (cmsPage?.seo?.meta_description?.[language]) || c.description;
  const heroTitle = (cmsPage?.seo?.h1?.[language]) || c.title;
  const heroSubtitle = (cmsPage?.seo?.h2?.[language]) || c.subtitle;
  const introText = (cmsPage?.intro?.[language]) || c.description;
  const mainContent = (cmsPage?.main_content?.[language]) || c.description2;

  if (!pickupInitRef.current && !pickup.address && c.defaultPickup) {
    pickupInitRef.current = true;
    setPickup({ address: c.defaultPickup, latitude: null, longitude: null, placeId: null });
  }
  if (!dropoffInitRef.current && !dropoff.address && c.defaultDropoff) {
    dropoffInitRef.current = true;
    setDropoff({ address: c.defaultDropoff, latitude: null, longitude: null, placeId: null });
  }

  const vehicles = [
    { id: 1, name: c.sedan, desc: c.sedanDesc, passengers: 3, luggage: 3, price: vehiclesPrices?.sedan || 65, img: IMAGES.sedan },
    { id: 2, name: c.luxury, desc: c.luxuryDesc, passengers: 3, luggage: 3, price: vehiclesPrices?.luxury || 95, img: IMAGES.interior },
    { id: 3, name: c.minivan, desc: c.minivanDesc, passengers: 6, luggage: 6, price: vehiclesPrices?.minivan || 120, img: IMAGES.minivan },
    { id: 4, name: c.minibus, desc: c.minibusDesc, passengers: 8, luggage: 8, price: vehiclesPrices?.minibus || 180, img: IMAGES.airport },
  ];

  const routes = c.routes || [];

  const geocodeAddress = async (address, placeId) => {
    await loadGoogleMaps();
    return new Promise((resolve, reject) => {
      if (!window.google?.maps?.Geocoder) return reject('No geocoder');
      const geocoder = new window.google.maps.Geocoder();
      const extract = (results) => ({
        latitude: results[0].geometry.location.lat(),
        longitude: results[0].geometry.location.lng(),
      });
      const tryGeo = (req) => new Promise((res, rej) => {
        geocoder.geocode(req, (results, status) => {
          if (status === 'OK' && results[0]?.geometry) res(extract(results));
          else rej(status);
        });
      });

      // Strategy 1: placeId is most reliable
      const byPlaceId = placeId
        ? tryGeo({ placeId }).catch(() => null)
        : Promise.resolve(null);

      byPlaceId.then(result => {
        if (result) return resolve(result);
        // Strategy 2: original text
        return tryGeo({ address })
          .then(resolve)
          .catch(() => {
            // Strategy 3: strip unclosed + complete parens
            const cleaned = address
              .replace(/\s*\([^)]*$/, '')
              .replace(/\([^)]*\)/g, '')
              .replace(/\s+/g, ' ').trim();
            return tryGeo({ address: cleaned })
              .then(resolve)
              .catch(() => {
                const firstPart = cleaned.split(',')[0].trim();
                if (firstPart && firstPart !== cleaned) {
                  return tryGeo({ address: firstPart }).then(resolve).catch(reject);
                }
                reject('ZERO_RESULTS');
              });
          });
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pickupAddr = pickup.address || '';
    const dropoffAddr = dropoff.address || '';
    if (!pickupAddr || !dropoffAddr) {
      toast.error(language === 'fr' ? 'Veuillez remplir les adresses' : 'Please fill in the addresses');
      return;
    }
    setLoading(true);
    try {
      // Priority: safeRef coords > state coords > geocode
      const getCoords = (safeRef, stateObj, addr) => {
        if (safeRef.current.latitude != null) {
          const refP = safeRef.current.address.substring(0, 12).toLowerCase();
          const addrP = addr.substring(0, 12).toLowerCase();
          if (refP === addrP) {
            return { latitude: safeRef.current.latitude, longitude: safeRef.current.longitude };
          }
        }
        if (stateObj.latitude != null) {
          return { latitude: stateObj.latitude, longitude: stateObj.longitude };
        }
        return null;
      };

      let pickupCoords = getCoords(pickupSafeRef, pickup, pickupAddr);
      let dropoffCoords = getCoords(dropoffSafeRef, dropoff, dropoffAddr);

      if (!pickupCoords) pickupCoords = await geocodeAddress(pickupAddr, pickupSafeRef.current.placeId || pickup.placeId);
      if (!dropoffCoords) dropoffCoords = await geocodeAddress(dropoffAddr, dropoffSafeRef.current.placeId || dropoff.placeId);

      const vehicles = await transferService.calculatePreorderPrice(pickupCoords, dropoffCoords);
      setVehicleResults(vehicles);
      startBooking({
        pickup: pickupAddr,
        dropoff: dropoffAddr,
        pickupCoords,
        dropoffCoords,
        date,
        time,
        selectedVehicle,
      });
      navigate('/car-selection');
      trackSearch({ pickup: pickup.address, dropoff: dropoff.address, date });
    } catch (error) {
      toast.error(language === 'fr' ? 'Impossible de calculer le prix. Reessayez.' : 'Could not calculate price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickupChange = (val) => {
    if (val.latitude != null) {
      pickupSafeRef.current = { latitude: val.latitude, longitude: val.longitude, placeId: val.placeId, address: val.address };
    } else if (val.placeId) {
      pickupSafeRef.current = { ...pickupSafeRef.current, placeId: val.placeId, address: val.address };
    }
    setPickup(val);
  };
  const handleDropoffChange = (val) => {
    if (val.latitude != null) {
      dropoffSafeRef.current = { latitude: val.latitude, longitude: val.longitude, placeId: val.placeId, address: val.address };
    } else if (val.placeId) {
      dropoffSafeRef.current = { ...dropoffSafeRef.current, placeId: val.placeId, address: val.address };
    }
    setDropoff(val);
  };

  const scrollToBooking = (v) => {
    if (v) setSelectedVehicle(v);
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="city-transfer-page">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={seoUrls ? `https://www.zont.cab${seoUrls[language] || seoUrls.en}` : undefined}
        ogImage={ogImage ? (ogImage.startsWith('http') ? ogImage : `https://www.zont.cab${ogImage}`) : (heroImage ? (heroImage.startsWith('http') ? heroImage : `https://www.zont.cab${heroImage}`) : "https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format")}
        hreflang={seoUrls ? [
          { lang: 'en', href: `https://www.zont.cab${seoUrls.en}` },
          { lang: 'fr', href: `https://www.zont.cab${seoUrls.fr}` },
          { lang: 'ru', href: `https://www.zont.cab${seoUrls.ru}` },
          { lang: 'hy', href: `https://www.zont.cab${seoUrls.hy || seoUrls.en}` },
        ] : undefined}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Zont - " + c.title,
            "description": c.description,
            "url": "https://www.zont.cab",
            "image": "https://www.zont.cab/logo512.png",
            "telephone": "+33783777027",
            "address": { "@type": "PostalAddress", "addressLocality": "Paris", "addressCountry": "FR" },
            "priceRange": "$$",
            "serviceType": "Airport Transfer",
            "areaServed": { "@type": "Place", "name": c.title.split(' - ')[0] },
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": c.title,
            "description": c.description,
            "image": "https://www.zont.cab/logo512.png",
            "brand": { "@type": "Brand", "name": "Zont" },
            ...(vehiclesPrices ? { "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "EUR",
              "lowPrice": Math.min(...Object.values(vehiclesPrices)),
              "highPrice": Math.max(...Object.values(vehiclesPrices)),
            }} : {}),
            ...(reviewSchema?.aggregateRating ? { "aggregateRating": reviewSchema.aggregateRating } : {}),
            ...(reviewSchema?.reviews?.length ? { "review": reviewSchema.reviews } : {}),
          }
        ]}
      />
      <Header />
      <main className="flex-1 pt-16">

        {/* HERO + BOOKING FORM - Mobile First */}
        <section className="relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src={heroImage || IMAGES.hero} alt={c.title} className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/90 via-[#1a2332]/80 to-[#1a2332]"></div>
          </div>

          <div className="relative z-10 px-4 pt-8 pb-12 md:pt-16 md:pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                {/* Left: Title + Trust */}
                <div className="text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-4">
                    <div className="bg-[#2ecc71]/20 text-[#2ecc71] px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center" data-testid="trust-badge-top">
                      <Star className="w-4 h-4 fill-current mr-1.5" aria-hidden="true" />
                      {c.rating}
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" data-testid="city-hero-title">
                    {heroTitle}
                  </h1>
                  <p className="text-base md:text-lg text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0">
                    {heroSubtitle}
                  </p>

                  {/* Trust Stats - Mobile */}
                  <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto lg:mx-0">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#2ecc71]">50K+</div>
                      <div className="text-xs text-gray-400">{tr.trips}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#2ecc71]">24/7</div>
                      <div className="text-xs text-gray-400">{tr.available}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#2ecc71]">4.5/5</div>
                      <div className="text-xs text-gray-400">{tr.rating}</div>
                    </div>
                  </div>

                  {/* Trust Badges - Desktop */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 mt-8">
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <CreditCard className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.paySecure}</p><p className="text-gray-400 text-xs">{tr.payDesc}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <Shield className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.verifiedDriver}</p><p className="text-gray-400 text-xs">{tr.verifiedDesc}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <Plane className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.flightTrack}</p><p className="text-gray-400 text-xs">{tr.flightDesc}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <Clock className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.freeCancel}</p><p className="text-gray-400 text-xs">{tr.cancelDesc}</p></div>
                    </div>
                  </div>
                </div>

                {/* Right: Booking Form (above the fold on mobile) */}
                <div ref={bookingFormRef} className="w-full max-w-md mx-auto lg:mx-0">
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-2xl" data-testid="booking-form-card">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1 text-center" data-testid="booking-form-title">{c.bookingForm}</h2>
                    <p className="text-xs text-gray-500 text-center mb-4">{tr.fixed} - {tr.paySecure}</p>

                    {selectedVehicle && (
                      <div className="bg-[#2ecc71]/10 border border-[#2ecc71] rounded-lg p-3 mb-4 flex items-center justify-between" data-testid="selected-vehicle-banner">
                        <div>
                          <p className="text-gray-900 font-bold text-sm">{selectedVehicle.name}</p>
                          <p className="text-gray-500 text-xs">{selectedVehicle.passengers} {c.passengers}</p>
                        </div>
                        <div className="text-[#2ecc71] text-lg font-bold">{selectedVehicle.price}&euro;</div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3" data-testid="booking-form" role="form" aria-label={c.bookingForm}>
                      <div>
                        <label htmlFor="pickup" className="block text-gray-700 font-medium text-sm mb-1">{c.pickupLabel}</label>
                        <PlacesAutocomplete
                          id="pickup"
                          value={pickup}
                          onChange={handlePickupChange}
                          placeholder={c.pickupLabel}
                          icon={<MapPin className="w-4 h-4 text-[#2ecc71]" />}
                          className="w-full pl-9 pr-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm"
                          data-testid="pickup-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="dropoff" className="block text-gray-700 font-medium text-sm mb-1">{c.dropoffLabel}</label>
                        <PlacesAutocomplete
                          id="dropoff"
                          value={dropoff}
                          onChange={handleDropoffChange}
                          placeholder={c.dropoffLabel}
                          icon={<MapPin className="w-4 h-4 text-red-500" />}
                          className="w-full pl-9 pr-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm"
                          data-testid="dropoff-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="date" className="block text-gray-700 font-medium text-sm mb-1">{c.dateLabel}</label>
                          <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} required
                            className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="date-input" aria-label={c.dateLabel} />
                        </div>
                        <div>
                          <label htmlFor="time" className="block text-gray-700 font-medium text-sm mb-1">{c.timeLabel}</label>
                          <input type="time" id="time" name="time" value={time} onChange={e => setTime(e.target.value)} required
                            className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="time-input" aria-label={c.timeLabel} />
                        </div>
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-bold text-base hover:bg-[#27ae60] transition-colors uppercase tracking-wide shadow-lg shadow-[#2ecc71]/30"
                        data-testid="submit-booking-btn">
                        {loading ? '...' : c.bookNow}
                      </button>
                    </form>

                    {/* Payment Icons */}
                    <div className="flex items-center justify-center space-x-3 mt-3 pt-3 border-t border-gray-100">
                      <Shield className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span className="text-xs text-gray-400">Visa</span>
                      <span className="text-xs text-gray-400">Mastercard</span>
                      <span className="text-xs text-gray-400">PayPal</span>
                      <span className="text-xs text-gray-400">Apple Pay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE Trust Badges */}
        <section className="lg:hidden py-6 px-4 bg-[#0f1419]">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <CreditCard className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.paySecure}</p><p className="text-gray-500 text-[10px]">{tr.payDesc}</p></div>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <Shield className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.verifiedDriver}</p><p className="text-gray-500 text-[10px]">{tr.verifiedDesc}</p></div>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <Plane className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.flightTrack}</p><p className="text-gray-500 text-[10px]">{tr.flightDesc}</p></div>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <Clock className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.freeCancel}</p><p className="text-gray-500 text-[10px]">{tr.cancelDesc}</p></div>
            </div>
          </div>
        </section>

        {/* MEET YOUR DRIVER - Photo Section (optional, page-specific) */}
        {c.meetDriverTitle && meetDriverImage && (
          <section className="py-12 md:py-16 px-4 bg-[#1a2332]" data-testid="meet-driver-section">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={meetDriverImage}
                    alt={c.meetDriverTitle}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight" data-testid="meet-driver-title">
                    {c.meetDriverTitle}
                  </h2>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed" data-testid="meet-driver-text">
                    {c.meetDriverText}
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-[#2ecc71]" />
                      <span>{tr.verifiedDriver}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-[#2ecc71]" />
                      <span>{tr.flightTrack}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Station Links Grid (for Paris Train Stations page) */}
        {stationLinks && stationLinks.length > 0 && (
          <section className="py-12 md:py-16 px-4 bg-[#0f1419]" data-testid="station-links-section">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-8">
                {c.stationLinksTitle || (language === 'fr' ? 'Toutes les Gares de Paris' : language === 'ru' ? 'Все Вокзалы Парижа' : 'All Paris Train Stations')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stationLinks.map((station, i) => (
                  <Link
                    key={i}
                    to={station.url[language] || station.url.en}
                    className="group bg-white/[0.04] border border-white/10 hover:border-[#2ecc71]/40 rounded-xl overflow-hidden transition-all hover:bg-[#2ecc71]/5"
                    data-testid={`station-link-${i}`}
                  >
                    {station.image && (
                      <div className="h-36 overflow-hidden">
                        <img src={station.image} alt={station.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-white font-bold text-base group-hover:text-[#2ecc71] transition-colors">{station.name}</h3>
                      <p className="text-gray-500 text-xs mt-1">{station.desc[language] || station.desc.en}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[#2ecc71] font-bold text-lg">{c.fromLabel} {station.price}&euro;</span>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#2ecc71]" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Hourly Driver at Disposal — Cross-sell CTA */}
        {showDisposalCta && (
          <section className="py-10 md:py-14 px-4 bg-[#0f1419]" data-testid="disposal-cta-section">
            <div className="max-w-5xl mx-auto">
              <Link
                to={language === 'en' ? '/driver-at-disposal' : language === 'ru' ? '/voditel-s-avtomobilem' : language === 'hy' ? '/varorde-tramadrutyamb' : '/chauffeur-mis-a-disposition'}
                data-testid="disposal-cta-link"
                className="group block rounded-2xl overflow-hidden border border-[#c8a951]/30 hover:border-[#c8a951] bg-gradient-to-r from-[#11161f] to-[#1a2332] transition-all duration-500"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] items-stretch">
                  <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[240px] overflow-hidden">
                    <img
                      src="/images/chauffeur-prive-paris-tour-eiffel.webp"
                      alt={language === 'fr' ? 'Chauffeur privé à disposition — Paris' : language === 'ru' ? 'Водитель в распоряжение — Париж' : language === 'hy' ? 'Վարորդ տրամադրությամբ — Փարիզ' : 'Hourly Driver at Disposal — Paris'}
                      loading="lazy"
                      width="640"
                      height="480"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#11161f]/40 md:to-[#11161f]/80" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#c8a951] font-semibold">
                        {language === 'fr' ? 'Nouveau service' : language === 'ru' ? 'Новый сервис' : language === 'hy' ? 'Նոր ծառայություն' : 'New service'}
                      </span>
                      <span className="w-6 h-px bg-[#c8a951]" />
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">4h · 8h · 12h</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light tracking-tight text-white mb-2">
                      {language === 'fr' ? 'Chauffeur Privé Mis à Disposition' : language === 'ru' ? 'Водитель в Распоряжении' : language === 'hy' ? 'Վարորդ Տրամադրությամբ' : 'Hourly Driver at Disposal'}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed mb-5 max-w-lg">
                      {language === 'fr'
                        ? 'Réservez un chauffeur privé à l\'heure : Mercedes Classe S, E, V ou Renault Trafic. Tarif fixe, tout inclus, arrêts illimités dans Paris.'
                        : language === 'ru'
                        ? 'Закажите личного водителя почасово: Mercedes S, E, V-Class или Renault Trafic. Фиксированная цена, всё включено.'
                        : language === 'hy'
                        ? 'Ամրագրեք մասնավոր վարորդ ժամային սկզբունքով՝ Mercedes S, E, V դասի կամ Renault Trafic։'
                        : 'Hire a private chauffeur by the hour: Mercedes S, E, V-Class or Renault Trafic. Fixed pricing, all included, unlimited stops within Paris.'}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[#c8a951] font-semibold uppercase tracking-wider text-xs group-hover:translate-x-1 transition-transform">
                      {language === 'fr' ? 'Découvrir nos véhicules' : language === 'ru' ? 'Открыть наш парк' : language === 'hy' ? 'Բացել մեքենաները' : 'Discover our fleet'}
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* SEO Description - Dynamic from CMS */}
        <section className="py-10 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <p className="text-base text-gray-300 leading-relaxed">{introText}</p>
            {mainContent && <p className="text-sm text-gray-400 leading-relaxed mt-4">{mainContent}</p>}
            {c.description3 && <p className="text-sm text-gray-400 leading-relaxed mt-4">{c.description3}</p>}
            {c.description4 && <p className="text-sm text-gray-400 leading-relaxed mt-4">{c.description4}</p>}
          </div>
        </section>

        {/* VEHICLES with Photos */}
        <section className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.vehiclesTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-shadow group" data-testid={`vehicle-card-${v.id}`}>
                  <div className="h-36 md:h-44 overflow-hidden">
                    <img src={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{v.name}</h3>
                        <p className="text-gray-500 text-sm">{v.desc}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{v.price}&euro;</div>
                        <p className="text-xs text-gray-400">{c.allInclusive}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                      <span className="flex items-center"><Users size={14} className="mr-1" aria-hidden="true" />{v.passengers} {c.passengers}</span>
                      <span className="flex items-center"><Briefcase size={14} className="mr-1" aria-hidden="true" />{v.luggage} {c.luggage}</span>
                    </div>
                    <button onClick={() => scrollToBooking(v)}
                      className="w-full bg-[#2ecc71] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#27ae60] transition-colors flex items-center justify-center"
                      data-testid={`book-vehicle-${v.id}`} aria-label={`${c.bookNow} ${v.name}`}>
                      {c.bookNow} <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR ROUTES */}
        {routes.length > 0 && (
          <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.popularRoutesTitle}</h2>
              <div className="space-y-3">
                {routes.map((route, i) => (
                  <button key={i} onClick={() => scrollToBooking(null)} className="w-full bg-[#1a2332] rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-[#2ecc71] transition-colors group text-left" data-testid={`route-${i}`} aria-label={`${route.name} - ${c.fromLabel} ${route.price} euros`}>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-[#2ecc71] mr-3 flex-shrink-0" aria-hidden="true" />
                      <span className="text-white text-sm md:text-base">{route.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#2ecc71] font-bold text-lg">{c.fromLabel} {route.price}&euro;</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#2ecc71]" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CLIENT REVIEWS - Real verified reviews */}
        {pageReviews.length > 0 && (
          <section className="py-12 md:py-20 px-4 bg-[#0f1419]" data-testid="client-reviews-section">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {language === 'fr' ? 'Avis de nos clients' : language === 'ru' ? 'Отзывы клиентов' : 'Customer Reviews'}
                </h2>
                {reviewSchema?.aggregateRating && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-5 h-5 ${i <= Math.round(parseFloat(reviewSchema.aggregateRating.ratingValue)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-white font-semibold">{reviewSchema.aggregateRating.ratingValue}/5</span>
                    <span className="text-gray-400 text-sm">({reviewSchema.aggregateRating.reviewCount} {tr.reviews})</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pageReviews.slice(0, 6).map((review, i) => (
                  <div key={i} className="bg-[#1a2332] border border-white/10 rounded-xl p-5" data-testid={`review-card-${i}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {review.author_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{review.author_name}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{review.comment_translated || review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REVIEWS - TripAdvisor */}
        <section className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{tr.trustTitle}</h2>
            <div className="flex justify-center">
              <TripAdvisorReviews />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{c.howItWorks}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4" aria-hidden="true">{i + 1}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step}</h3>
                  <p className="text-gray-400 text-sm">{[c.step1Desc, c.step2Desc, c.step3Desc][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Photo Section */}
        <section className="py-12 md:py-16 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { src: IMAGES.hero, alt: 'Mercedes premium sedan transfer' },
                { src: IMAGES.interior, alt: 'Luxury car interior leather seats' },
                { src: IMAGES.airport, alt: 'Modern airport terminal' },
                { src: IMAGES.sedan, alt: 'Black luxury sedan parked' },
              ].map((photo, i) => (
                <div key={i} className="rounded-xl overflow-hidden h-32 md:h-48">
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Cities CTA */}
        <section className="py-12 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{c.otherCitiesTitle}</h2>
            <Link to="/countries" className="inline-flex items-center bg-[#2ecc71] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="view-all-cities-btn">
              {c.otherCitiesBtn} <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a2332] border-t border-gray-700 p-3 z-40 safe-area-bottom" data-testid="mobile-sticky-cta">
        <button onClick={() => scrollToBooking(null)}
          className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-bold text-base uppercase tracking-wide shadow-lg shadow-[#2ecc71]/30 flex items-center justify-center"
          aria-label={c.bookNow}>
          {c.bookNow} <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
        </button>
      </div>

      <div className="lg:hidden h-16"></div>
      <Footer />
    </div>
  );
};

export default CityTransferPage;
