import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import TripAdvisorWidget from '@/components/TripAdvisorWidget';
import PlacesAutocomplete, { loadGoogleMaps } from '@/components/PlacesAutocomplete';
import { transferService } from '@/services/api';
import { CheckCircle, MapPin, Clock, Shield, Star, CreditCard, Plane, Users, ChevronRight, ArrowRight } from 'lucide-react';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=800&q=70&auto=format',
  sedan: 'https://images.unsplash.com/photo-1764090317623-06968349ad23?w=400&q=70&auto=format',
  interior: 'https://images.unsplash.com/photo-1661220715153-95724e5f3500?w=400&q=70&auto=format',
  airport: 'https://images.unsplash.com/photo-1689772640958-7c186dbdfe26?w=400&q=70&auto=format',
  cdgDriver: '/images/driver-paris.webp',
};

const homeContent = {
  en: {
    heroTitle: 'Premium Airport Transfer',
    heroAccent: 'Across Europe',
    heroSub: 'Professional private drivers in 120+ cities. Fixed prices, flight tracking, meet & greet.',
    bookingTitle: 'Book Your Transfer',
    pickup: 'Pick up address', dropoff: 'Drop off address', date: 'Date', time: 'Time',
    pickupPh: 'Airport, hotel, address...', dropoffPh: 'Hotel, city center, address...',
    bookNow: 'SEARCH TRANSFER', searching: 'SEARCHING...',
    fixedPrices: 'Fixed Prices', securePay: 'Secure Payment',
    stats: { trips: '50K+', tripsLabel: 'Completed Trips', cities: '120+', citiesLabel: 'Cities', available: '24/7', availableLabel: 'Service', rating: '4.5/5', ratingLabel: 'Rating' },
    trustTitle: 'Why Travelers Trust Zont',
    f1Title: 'Meet & Greet', f1Desc: 'Your driver waits at arrivals with a personalized name sign. 60 min free waiting for flight delays.',
    f2Title: 'Flight Tracking', f2Desc: 'Real-time monitoring of your flight. No extra charge if delayed.',
    f3Title: 'Premium Vehicles', f3Desc: 'Mercedes, BMW. Clean, air-conditioned, less than 3 years old.',
    f4Title: 'Fixed Prices', f4Desc: 'Price confirmed at booking. No hidden fees, tolls included.',
    popularTitle: 'Popular Destinations',
    reviewsTitle: 'What Travelers Say',
    ctaTitle: 'Ready to Book Your Transfer?', ctaBtn: 'Book Now',
    howTitle: 'How It Works',
    s1: 'Book Online', s1d: 'Enter your flight details and destination. Instant price confirmation.',
    s2: 'Meet Your Driver', s2d: 'Driver waits at arrivals with your name sign. Help with luggage included.',
    s3: 'Enjoy the Ride', s3d: 'Comfortable direct transfer in a premium vehicle to your destination.',
    seoTitle: 'Zont - Premium Airport Transfer Service in Europe',
    seoDesc: 'Professional private driver in 120+ European cities. Fixed prices, flight tracking, meet and greet. Book your airport transfer online.',
  },
  fr: {
    heroTitle: 'Transfert Aeroport Premium',
    heroAccent: 'Partout en Europe',
    heroSub: 'Chauffeurs prives professionnels dans 120+ villes. Prix fixes, suivi de vol, accueil personnalise.',
    bookingTitle: 'Reservez Votre Transfert',
    pickup: 'Adresse de depart', dropoff: 'Adresse d\'arrivee', date: 'Date', time: 'Heure',
    pickupPh: 'Aeroport, hotel, adresse...', dropoffPh: 'Hotel, centre-ville, adresse...',
    bookNow: 'RECHERCHER UN TRANSFERT', searching: 'RECHERCHE...',
    fixedPrices: 'Prix Fixes', securePay: 'Paiement Securise',
    stats: { trips: '50K+', tripsLabel: 'Courses Effectuees', cities: '120+', citiesLabel: 'Villes', available: '24/7', availableLabel: 'Service', rating: '4.5/5', ratingLabel: 'Note' },
    trustTitle: 'Pourquoi les Voyageurs Font Confiance a Zont',
    f1Title: 'Accueil Personnalise', f1Desc: 'Votre chauffeur vous attend aux arrivees avec une pancarte a votre nom. 60 min d\'attente gratuites.',
    f2Title: 'Suivi des Vols', f2Desc: 'Surveillance en temps reel de votre vol. Aucun supplement en cas de retard.',
    f3Title: 'Vehicules Premium', f3Desc: 'Mercedes, BMW. Propres, climatises, moins de 3 ans.',
    f4Title: 'Prix Fixes Garantis', f4Desc: 'Prix confirme a la reservation. Pas de frais caches, peages inclus.',
    popularTitle: 'Destinations Populaires',
    reviewsTitle: 'Ce Que Disent Nos Clients',
    ctaTitle: 'Pret a Reserver Votre Transfert ?', ctaBtn: 'Reserver Maintenant',
    howTitle: 'Comment Ca Marche',
    s1: 'Reservez en Ligne', s1d: 'Entrez les details de votre vol et destination. Confirmation du prix immediate.',
    s2: 'Rencontrez Votre Chauffeur', s2d: 'Chauffeur aux arrivees avec pancarte a votre nom. Aide aux bagages.',
    s3: 'Profitez du Trajet', s3d: 'Transfert direct confortable dans un vehicule premium.',
    seoTitle: 'Zont - Transfert Aeroport Premium en Europe | Chauffeur Prive',
    seoDesc: 'Service de chauffeur prive premium dans 120+ villes europeennes. Prix fixes, suivi de vol. Reservez en ligne.',
  },
  ru: {
    heroTitle: 'Премиум Трансфер из Аэропорта',
    heroAccent: 'По Всей Европе',
    heroSub: 'Профессиональные частные водители в 120+ городах. Фиксированные цены, отслеживание рейсов.',
    bookingTitle: 'Забронируйте Трансфер',
    pickup: 'Адрес отправления', dropoff: 'Адрес назначения', date: 'Дата', time: 'Время',
    pickupPh: 'Аэропорт, отель, адрес...', dropoffPh: 'Отель, центр города...',
    bookNow: 'НАЙТИ ТРАНСФЕР', searching: 'ПОИСК...',
    fixedPrices: 'Фиксированные Цены', securePay: 'Безопасная Оплата',
    stats: { trips: '50K+', tripsLabel: 'Поездок', cities: '120+', citiesLabel: 'Городов', available: '24/7', availableLabel: 'Сервис', rating: '4.5/5', ratingLabel: 'Рейтинг' },
    trustTitle: 'Почему Путешественники Доверяют Zont',
    f1Title: 'Встреча с Табличкой', f1Desc: 'Водитель ждет с именной табличкой. 60 минут бесплатного ожидания.',
    f2Title: 'Отслеживание Рейсов', f2Desc: 'Мониторинг вашего рейса в реальном времени. Без доплаты за задержку.',
    f3Title: 'Премиум Автомобили', f3Desc: 'Mercedes, BMW. Чистые, с кондиционером, не старше 3 лет.',
    f4Title: 'Фиксированные Цены', f4Desc: 'Цена подтверждена при бронировании. Без скрытых платежей.',
    popularTitle: 'Популярные Направления',
    reviewsTitle: 'Отзывы Клиентов',
    ctaTitle: 'Готовы Забронировать Трансфер?', ctaBtn: 'Забронировать',
    howTitle: 'Как Это Работает',
    s1: 'Бронируйте Онлайн', s1d: 'Введите данные рейса и адрес назначения.',
    s2: 'Встретьте Водителя', s2d: 'Водитель ждет в зале прилета с табличкой.',
    s3: 'Наслаждайтесь', s3d: 'Комфортная поездка в премиум автомобиле.',
    seoTitle: 'Zont - Премиум Трансфер из Аэропорта в Европе',
    seoDesc: 'Профессиональный сервис в 120+ городах Европы. Фиксированные цены.',
  },
  hy: {
    heroTitle: 'Պրեմիում Օդանավակայանի Տրանսֆեր',
    heroAccent: 'Ամբողջ Եվրոպայում',
    heroSub: 'Պրոֆեսիոնալ անձնական վարորդներ 120+ քաղաքներում: Հաստատ գներ, թռիչքի հետևելում, անհատական դիմավորում:',
    bookingTitle: 'Ամրագրեք Ձեր Տրանսֆերը',
    pickup: 'Վերցնելու հասցե', dropoff: 'Իջնելու հասցե', date: 'Ամսաթիվ', time: 'Ժամ',
    pickupPh: 'Օդանավակայան, հյուրանոց, հասցե...', dropoffPh: 'Հյուրանոց, կենտրոն, հասցե...',
    bookNow: 'ՈՌՈՆԵԼ ՏՌԱՆՍՖԵՌ', searching: 'ՈՌՈՆՈՒՄ...',
    fixedPrices: 'Հաստատ Գներ', securePay: 'Ապահով Վճարում',
    stats: { trips: '50K+', tripsLabel: 'Կատարված Ուղևորություններ', cities: '120+', citiesLabel: 'Քաղաքներ', available: '24/7', availableLabel: 'Սպասարկում', rating: '4.5/5', ratingLabel: 'Վարկանիշ' },
    trustTitle: 'Ինչու Ճամորդները Վստահում Են Zont-ին',
    f1Title: 'Դիմավորում', f1Desc: 'Վարորդը սպասում է ժամանման վայրում անվանական ցուցանակով: 60 րոպե անվճար սպասում:',
    f2Title: 'Թռիչքի Հետևելում', f2Desc: 'Ձեր թռիչքի հետևելում իրական ժամանակում: Հավելյալ վճար ուշացման դեպքում:',
    f3Title: 'Պրեմիում Մեքենաներ', f3Desc: 'Mercedes, BMW: Մաքուր, օդարակություն, 3 տարիից փոքր:',
    f4Title: 'Հաստատ Գներ', f4Desc: 'Գինը հաստատվում է ամրագրման ժամանակ: Թաքնված վճարներ չկան:',
    popularTitle: 'Հանրահայտ Ուղղություններ',
    reviewsTitle: 'Ինչ Ասում Են Ճամորդները',
    ctaTitle: 'Պատրաստ՞ Եք Ամրագրել Տրանսֆերը:', ctaBtn: 'Ամրագրել Հիմա',
    howTitle: 'Ինչպես Է Աշխատում',
    s1: 'Ամրագրեք Առցանց', s1d: 'Մուտքագրեք ձեր թռիչքի տվյալները և ուղղությունը: Գնի ակնթարտ հաստատում:',
    s2: 'Հանդիպեք Վարորդին', s2d: 'Վարորդը սպասում է ժամանման վայրում ձեր անվանական ցուցանակով:',
    s3: 'Վայելեք Ուղևորությունից', s3d: 'Հարմարավետ ուղիղ տրանսֆեր պրեմիում մեքենայով:',
    seoTitle: 'Zont - Պրեմիում Օդանավակայանի Տրանսֆեր Եվրոպայում',
    seoDesc: 'Պրոֆեսիոնալ անձնական վարորդ 120+ եվրոպական քաղաքներում: Հաստատ գներ, թռիչքի հետևելում:',
  },
};

const popularDest = [
  { nameEn: 'Paris CDG', nameFr: 'Paris CDG', nameRu: 'Париж CDG', nameHy: 'Փարիզ CDG', price: 65, url: '/transfert-aeroport-paris' },
  { nameEn: 'Nice', nameFr: 'Nice', nameRu: 'Ницца', nameHy: 'Նիցա', price: 35, url: '/transfert-aeroport-nice' },
  { nameEn: 'Barcelona', nameFr: 'Barcelone', nameRu: 'Барселона', nameHy: 'Բարսելոնա', price: 39, url: '/transfert-aeroport-barcelone' },
  { nameEn: 'Rome', nameFr: 'Rome', nameRu: 'Рим', nameHy: 'Հռոմ', price: 40, url: '/transfert-aeroport-rome' },
  { nameEn: 'Berlin', nameFr: 'Berlin', nameRu: 'Берлин', nameHy: 'Բեռլին', price: 45, url: '/transfert-aeroport-berlin' },
  { nameEn: 'Monaco', nameFr: 'Monaco', nameRu: 'Монако', nameHy: 'Մոնակո', price: 65, url: '/transfert-aeroport-monaco' },
];

const homeSeoUrls = { en: '/', fr: '/fr', ru: '/ru', hy: '/hy' };

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startBooking, setVehicleResults } = useBooking();
  const { t, language, changeLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const bookingRef = useRef(null);
  const [pickup, setPickup] = useState({ address: '', latitude: null, longitude: null });
  const [dropoff, setDropoff] = useState({ address: '', latitude: null, longitude: null });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cmsTrustBlocks, setCmsTrustBlocks] = useState(null);
  const [cmsHomepage, setCmsHomepage] = useState(null);
  const langSyncRef = useRef(false);

  const API = process.env.REACT_APP_BACKEND_URL;

  // Auto-detect language from home URL
  useEffect(() => {
    const currentPath = location.pathname;
    for (const [lang, url] of Object.entries(homeSeoUrls)) {
      if (currentPath === url) {
        if (lang !== language) {
          langSyncRef.current = true;
          changeLanguage(lang);
        }
        break;
      }
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to correct URL when language changes
  useEffect(() => {
    if (langSyncRef.current) {
      langSyncRef.current = false;
      return;
    }
    const targetUrl = homeSeoUrls[language];
    if (targetUrl && targetUrl !== location.pathname) {
      navigate(targetUrl, { replace: true });
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch(`${API}/api/public/trust-blocks`).then(r => r.json()).then(setCmsTrustBlocks).catch(() => {});
    fetch(`${API}/api/public/homepage`).then(r => r.json()).then(setCmsHomepage).catch(() => {});
  }, [API]);

  const c = homeContent[language] || homeContent.en;

  const geocodeAddress = async (address) => {
    await loadGoogleMaps();
    return new Promise((resolve, reject) => {
      if (!window.google?.maps?.Geocoder) return reject('No geocoder');
      const geocoder = new window.google.maps.Geocoder();
      const tryGeocode = (addr) => {
        return new Promise((res, rej) => {
          geocoder.geocode({ address: addr }, (results, status) => {
            if (status === 'OK' && results[0]?.geometry) {
              res({
                latitude: results[0].geometry.location.lat(),
                longitude: results[0].geometry.location.lng(),
              });
            } else {
              rej(status);
            }
          });
        });
      };
      // Strategy: try original → strip parentheses → extract place name only
      tryGeocode(address)
        .then(resolve)
        .catch(() => {
          const noParens = address.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
          tryGeocode(noParens)
            .then(resolve)
            .catch(() => {
              // Last resort: just the first part before the comma
              const firstPart = address.split(',')[0].replace(/\([^)]*\)/g, '').trim();
              if (firstPart && firstPart !== noParens) {
                tryGeocode(firstPart).then(resolve).catch(reject);
              } else {
                reject('ZERO_RESULTS');
              }
            });
        });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let pickupCoords = pickup.latitude ? { latitude: pickup.latitude, longitude: pickup.longitude } : null;
    let dropoffCoords = dropoff.latitude ? { latitude: dropoff.latitude, longitude: dropoff.longitude } : null;
    const pickupAddr = pickup.address || document.getElementById('h-pickup')?.value || '';
    const dropoffAddr = dropoff.address || document.getElementById('h-dropoff')?.value || '';

    if (!pickupAddr || !dropoffAddr) {
      toast.error(language === 'fr' ? 'Veuillez remplir les adresses' : 'Please fill in both addresses');
      setLoading(false);
      return;
    }

    try {
      if (!pickupCoords) pickupCoords = await geocodeAddress(pickupAddr);
      if (!dropoffCoords) dropoffCoords = await geocodeAddress(dropoffAddr);
    } catch {
      toast.error(language === 'fr' ? 'Adresse introuvable. Veuillez reessayer.' : 'Address not found. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const vehicles = await transferService.calculatePreorderPrice(pickupCoords, dropoffCoords);
      setVehicleResults(vehicles);
      startBooking({
        pickup: pickupAddr,
        dropoff: dropoffAddr,
        pickupCoords,
        dropoffCoords,
        date,
        time,
      });
      navigate('/car-selection');
    } catch (error) {
      toast.error(language === 'fr' ? 'Impossible de calculer le prix. Reessayez.' : 'Could not calculate price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickupChange = (data) => setPickup(data);
  const handleDropoffChange = (data) => setDropoff(data);

  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior: 'smooth' });

  const getName = (d) => language === 'fr' ? d.nameFr : language === 'ru' ? d.nameRu : language === 'hy' ? (d.nameHy || d.nameEn) : d.nameEn;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="home-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical="https://www.zont.cab"
        ogImage="https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format"
        hreflang={[
          { lang: 'fr', href: 'https://www.zont.cab/' },
          { lang: 'en', href: 'https://www.zont.cab/' },
          { lang: 'ru', href: 'https://www.zont.cab/' },
          { lang: 'hy', href: 'https://www.zont.cab/' },
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Zont",
            "url": "https://www.zont.cab",
            "logo": "https://www.zont.cab/logo.png",
            "description": c.seoDesc,
            "contactPoint": { "@type": "ContactPoint", "telephone": "+33-1-23-45-67-89", "contactType": "customer service", "availableLanguage": ["French", "English", "Russian", "Armenian"] },
            "sameAs": ["https://apps.apple.com/am/app/zont-cab/id1468482270", "https://play.google.com/store/apps/details?id=com.zont.rider"]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Zont",
            "url": "https://www.zont.cab",
            "potentialAction": { "@type": "SearchAction", "target": "https://www.zont.cab/countries?q={search_term_string}", "query-input": "required name=search_term_string" }
          }
        ]}
      />
      <Header />

      <main className="flex-1 pt-16">
        {/* HERO + BOOKING */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <img src={IMAGES.hero} alt="Premium airport transfer Mercedes" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/90 via-[#1a2332]/80 to-[#1a2332]"></div>
          </div>
          <div className="relative z-10 px-4 pt-8 pb-12 md:pt-16 md:pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left */}
                <div className="text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-4">
                    <div className="bg-[#2ecc71]/20 text-[#2ecc71] px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center" data-testid="home-trust-badge">
                      <Star className="w-4 h-4 fill-current mr-1.5" aria-hidden="true" />4.5/5 Tripadvisor - 29 {language === 'fr' ? 'avis' : language === 'ru' ? 'отзывов' : language === 'hy' ? 'կարծիք' : 'reviews'}
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight" data-testid="home-hero-title">
                    {(cmsHomepage?.title?.[language]) || c.heroTitle}
                  </h1>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2ecc71] mb-4">{c.heroAccent}</h2>
                  <p className="text-base md:text-lg text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0">{(cmsHomepage?.subtitle?.[language]) || c.heroSub}</p>

                  {/* Trust Stats - Dynamic from CMS */}
                  <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto lg:mx-0">
                    {(cmsHomepage?.stats && cmsHomepage.stats.length > 0 ? cmsHomepage.stats.map((s, i) => ({
                      val: s.value, lbl: (s.label?.[language]) || s.label?.fr || ''
                    })) : [
                      { val: c.stats.trips, lbl: c.stats.tripsLabel },
                      { val: c.stats.cities, lbl: c.stats.citiesLabel },
                      { val: c.stats.available, lbl: c.stats.availableLabel },
                      { val: c.stats.rating, lbl: c.stats.ratingLabel },
                    ]).map((s, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
                        <div className="text-lg font-bold text-[#2ecc71]">{s.val}</div>
                        <div className="text-[10px] text-gray-400">{s.lbl}</div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop trust */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 mt-6">
                    {[
                      { icon: <CreditCard className="w-7 h-7 text-[#2ecc71]" aria-hidden="true" />, t: c.securePay, d: 'Visa, Mastercard, PayPal' },
                      { icon: <Shield className="w-7 h-7 text-[#2ecc71]" aria-hidden="true" />, t: c.f1Title, d: c.f1Desc.substring(0, 50) + '...' },
                      { icon: <Plane className="w-7 h-7 text-[#2ecc71]" aria-hidden="true" />, t: c.f2Title, d: c.f2Desc.substring(0, 50) + '...' },
                      { icon: <Clock className="w-7 h-7 text-[#2ecc71]" aria-hidden="true" />, t: c.fixedPrices, d: c.f4Desc.substring(0, 50) + '...' },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                        {b.icon}
                        <div><p className="text-white font-semibold text-sm">{b.t}</p><p className="text-gray-400 text-xs">{b.d}</p></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Booking Form */}
                <div ref={bookingRef} className="w-full max-w-md mx-auto lg:mx-0">
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-2xl" data-testid="home-booking-card">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1 text-center">{c.bookingTitle}</h2>
                    <p className="text-xs text-gray-500 text-center mb-4">{c.fixedPrices} - {c.securePay}</p>
                    <form onSubmit={handleSubmit} className="space-y-3" data-testid="home-booking-form" role="form" aria-label={c.bookingTitle}>
                      <div>
                        <label htmlFor="h-pickup" className="block text-gray-700 font-medium text-sm mb-1">{c.pickup}</label>
                        <PlacesAutocomplete
                          id="h-pickup"
                          value={pickup}
                          onChange={handlePickupChange}
                          placeholder={c.pickupPh}
                          icon={<MapPin className="w-4 h-4 text-[#2ecc71]" aria-hidden="true" />}
                          className="w-full pl-9 pr-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm"
                          data-testid="home-pickup-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="h-dropoff" className="block text-gray-700 font-medium text-sm mb-1">{c.dropoff}</label>
                        <PlacesAutocomplete
                          id="h-dropoff"
                          value={dropoff}
                          onChange={handleDropoffChange}
                          placeholder={c.dropoffPh}
                          icon={<MapPin className="w-4 h-4 text-red-500" aria-hidden="true" />}
                          className="w-full pl-9 pr-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm"
                          data-testid="home-dropoff-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="h-date" className="block text-gray-700 font-medium text-sm mb-1">{c.date}</label>
                          <input type="date" id="h-date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required
                            className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="home-date-input" />
                        </div>
                        <div>
                          <label htmlFor="h-time" className="block text-gray-700 font-medium text-sm mb-1">{c.time}</label>
                          <input type="time" id="h-time" name="time" value={time} onChange={(e) => setTime(e.target.value)} required
                            className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="home-time-input" />
                        </div>
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-bold text-base hover:bg-[#27ae60] transition-colors uppercase tracking-wide shadow-lg shadow-[#2ecc71]/30"
                        data-testid="home-submit-btn">
                        {loading ? c.searching : c.bookNow}
                      </button>
                    </form>
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

        {/* Mobile Trust Badges */}
        <section className="lg:hidden py-6 px-4 bg-[#0f1419]">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {[
              { icon: <CreditCard className="w-6 h-6 text-[#2ecc71]" aria-hidden="true" />, t: c.securePay, d: 'Visa, MC, PayPal' },
              { icon: <Shield className="w-6 h-6 text-[#2ecc71]" aria-hidden="true" />, t: c.f1Title, d: language === 'fr' ? 'Chauffeurs agrees' : language === 'hy' ? 'Ստուգված վարորդներ' : 'Verified drivers' },
              { icon: <Plane className="w-6 h-6 text-[#2ecc71]" aria-hidden="true" />, t: c.f2Title, d: language === 'fr' ? 'Temps reel' : language === 'hy' ? 'Իրական ժամանակ' : 'Real-time' },
              { icon: <Clock className="w-6 h-6 text-[#2ecc71]" aria-hidden="true" />, t: c.fixedPrices, d: language === 'fr' ? 'Sans surprises' : language === 'hy' ? 'Անակնկալներ չկան' : 'No surprises' },
            ].map((b, i) => (
              <div key={i} className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
                {b.icon}
                <div><p className="text-white font-semibold text-xs">{b.t}</p><p className="text-gray-500 text-[10px]">{b.d}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.popularTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {popularDest.map((d, i) => (
                <Link key={i} to={d.url} className="group bg-[#0f1419] rounded-xl overflow-hidden border border-gray-700 hover:border-[#2ecc71] transition-all" data-testid={`popular-dest-${i}`}>
                  <div className="h-24 md:h-32 overflow-hidden">
                    <img src={i === 0 ? IMAGES.cdgDriver : i % 2 === 0 ? IMAGES.sedan : IMAGES.airport} alt={getName(d)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-white font-bold text-sm md:text-base group-hover:text-[#2ecc71] transition-colors">{getName(d)}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[#2ecc71] font-semibold text-sm">{language === 'fr' ? 'Des' : language === 'ru' ? 'От' : language === 'hy' ? 'Սկսած' : 'From'} {d.price}&euro;</span>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#2ecc71]" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/countries" className="inline-flex items-center bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors" data-testid="view-all-destinations">
                {language === 'fr' ? 'Voir les 120+ destinations' : language === 'ru' ? 'Все 120+ направлений' : language === 'hy' ? 'Տեսնել բոլոր 120+ ուղղությունները' : 'View all 120+ destinations'} <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Trust - Dynamic from CMS */}
        <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{c.trustTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {(cmsTrustBlocks && cmsTrustBlocks.length > 0 ? cmsTrustBlocks.slice(0, 4).map((block, i) => ({
                icon: block.icon === 'plane' ? <Plane className="w-10 h-10 text-[#2ecc71]" /> :
                      block.icon === 'clock' ? <Clock className="w-10 h-10 text-[#2ecc71]" /> :
                      block.icon === 'star' ? <Shield className="w-10 h-10 text-[#2ecc71]" /> :
                      block.icon === 'shield' ? <CreditCard className="w-10 h-10 text-[#2ecc71]" /> :
                      block.icon === 'credit-card' ? <CreditCard className="w-10 h-10 text-[#2ecc71]" /> :
                      <CheckCircle className="w-10 h-10 text-[#2ecc71]" />,
                t: (block.title && block.title[language]) || block.title?.fr || '',
                d: (block.text && block.text[language]) || block.text?.fr || '',
              })) : [
                { icon: <CheckCircle className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f1Title, d: c.f1Desc },
                { icon: <Plane className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f2Title, d: c.f2Desc },
                { icon: <Shield className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f3Title, d: c.f3Desc },
                { icon: <CreditCard className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f4Title, d: c.f4Desc },
              ]).map((f, i) => (
                <div key={i} className="bg-[#1a2332] rounded-xl p-5 border border-gray-700">
                  <div className="mb-3">{f.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.t}</h3>
                  <p className="text-gray-400 text-sm">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Photos */}
        <section className="py-10 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: IMAGES.hero, alt: 'Mercedes sedan premium transfer' },
              { src: IMAGES.interior, alt: 'Luxury car interior' },
              { src: IMAGES.airport, alt: 'Modern airport terminal' },
              { src: IMAGES.sedan, alt: 'Black luxury sedan' },
            ].map((p, i) => (
              <div key={i} className="rounded-xl overflow-hidden h-28 md:h-44">
                <img src={p.src} alt={p.alt} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{c.howTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[{ t: c.s1, d: c.s1d }, { t: c.s2, d: c.s2d }, { t: c.s3, d: c.s3d }].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4" aria-hidden="true">{i + 1}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.t}</h3>
                  <p className="text-gray-400 text-sm">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews - TripAdvisor */}
        <section className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.reviewsTitle}</h2>
            <div className="flex justify-center">
              <TripAdvisorWidget />
            </div>
          </div>
        </section>

        {/* CTA - Dynamic from CMS */}
        <section className="py-16 px-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {(cmsHomepage?.cta_title && cmsHomepage.cta_title[language]) || c.ctaTitle}
            </h2>
            <button onClick={scrollToBooking} className="bg-white text-[#2ecc71] px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl" data-testid="cta-book-btn">
              {(cmsHomepage?.cta_button && cmsHomepage.cta_button[language]) || c.ctaBtn} <ChevronRight className="w-5 h-5 ml-1 inline" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a2332] border-t border-gray-700 p-3 z-40" data-testid="home-mobile-sticky-cta">
        <button onClick={scrollToBooking}
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

export default Home;
