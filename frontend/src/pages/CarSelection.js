import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Users, Briefcase, Car, ChevronRight, ArrowRight, MapPin, Clock, Shield, Plane, CheckCircle, Wifi, Droplets } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const labels = {
  en: {
    seoTitle: 'Select Your Vehicle - Zont Airport Transfer',
    title: 'Select your vehicle',
    subtitle: 'All prices are fixed and include VAT, tolls and meet & greet',
    step1: 'Vehicle', step2: 'Details', step3: 'Payment',
    pax: 'Max', bags: 'Bags',
    select: 'Select',
    noData: 'No search data found',
    goBack: 'Start a New Search',
    from: 'Pick-up', to: 'Drop-off',
    estTime: 'Est. travel time', estDist: 'Distance',
    recommended: 'Recommended',
    trustItems: ['Free cancellation 24h', 'Fixed price guaranteed', 'Meet & greet included', 'Flight tracking'],
    wifi: 'Free WiFi', water: 'Water', leather: 'Leather seats',
  },
  fr: {
    seoTitle: 'Choisir Votre Vehicule - Zont Transfert Aeroport',
    title: 'Selectionnez votre vehicule',
    subtitle: 'Tous les prix sont fixes et incluent TVA, peages et accueil personnalise',
    step1: 'Vehicule', step2: 'Details', step3: 'Paiement',
    pax: 'Max', bags: 'Bagages',
    select: 'Selectionner',
    noData: 'Aucune recherche trouvee',
    goBack: 'Nouvelle Recherche',
    from: 'Depart', to: 'Arrivee',
    estTime: 'Temps estime', estDist: 'Distance',
    recommended: 'Recommande',
    trustItems: ['Annulation gratuite 24h', 'Prix fixe garanti', 'Accueil personnalise', 'Suivi de vol'],
    wifi: 'WiFi gratuit', water: 'Eau', leather: 'Sieges cuir',
  },
  ru: {
    seoTitle: 'Выберите Автомобиль - Zont Трансфер',
    title: 'Выберите автомобиль',
    subtitle: 'Все цены фиксированные, включают НДС, дорожные сборы и встречу',
    step1: 'Авто', step2: 'Детали', step3: 'Оплата',
    pax: 'Макс', bags: 'Багаж',
    select: 'Выбрать',
    noData: 'Данные не найдены',
    goBack: 'Новый Поиск',
    from: 'Откуда', to: 'Куда',
    estTime: 'Время в пути', estDist: 'Расстояние',
    recommended: 'Рекомендуем',
    trustItems: ['Бесплатная отмена 24ч', 'Фикс. цена', 'Встреча включена', 'Отслеживание рейса'],
    wifi: 'WiFi', water: 'Вода', leather: 'Кожа',
  },
  hy: {
    seoTitle: 'Delays - Zont',
    title: 'Delays delays delays',
    subtitle: 'Delays delays delays delays delays delays',
    step1: 'Delays', step2: 'Delays', step3: 'Delays',
    pax: 'Max', bags: 'Delays',
    select: 'Delays',
    noData: 'Delays delays',
    goBack: 'Delays delays',
    from: 'Delays', to: 'Delays',
    estTime: 'Delays delays', estDist: 'Delays',
    recommended: 'Delays',
    trustItems: ['Delays 24h', 'Delays delays', 'Delays delays', 'Delays delays'],
    wifi: 'WiFi', water: 'Delays', leather: 'Delays',
  },
};

const IMAGES = {
  premium: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/f4c843b8a5604ed350353dc428dd7bd4e326faab679f483dc4bb4ecb59392fcc.png',
  luxury: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/f2261d5fd73800ca13948b063ce7a48b4d552493be6c554517974f6216740623.png',
  van: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/bb1a1b7fe2c71db2d7a306a5f75eb9ac1f7c5a5d1cdde133b752f19cb03438ab.png',
  minibus: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/0c55d93337b26fdf7b01e5ac5a7dae05358b3b35731ead00951340e996af34ae.png',
};

const vehicles = [
  {
    id: 1, key: 'premium', image: IMAGES.premium,
    name: { en: 'Business Sedan', fr: 'Berline Business', ru: 'Бизнес Седан' },
    model: 'Mercedes E-Class',
    pax: 3, bags: 3, price: 65, recommended: false,
    features: ['leather', 'water'],
  },
  {
    id: 2, key: 'luxury', image: IMAGES.luxury,
    name: { en: 'First Class', fr: 'Premiere Classe', ru: 'Первый Класс' },
    model: 'Mercedes S-Class',
    pax: 3, bags: 3, price: 95, recommended: true,
    features: ['leather', 'water', 'wifi'],
  },
  {
    id: 3, key: 'van', image: IMAGES.van,
    name: { en: 'Business Van', fr: 'Van Business', ru: 'Бизнес Вэн' },
    model: 'Mercedes V-Class',
    pax: 6, bags: 6, price: 120, recommended: false,
    features: ['leather', 'water', 'wifi'],
  },
  {
    id: 4, key: 'minibus', image: IMAGES.minibus,
    name: { en: 'Minibus', fr: 'Minibus', ru: 'Минибус' },
    model: 'Mercedes Sprinter',
    pax: 8, bags: 10, price: 160, recommended: false,
    features: ['water'],
  },
];

const FeatureTag = ({ type, label }) => {
  const icons = {
    wifi: <Wifi className="w-3 h-3" />,
    water: <Droplets className="w-3 h-3" />,
    leather: <CheckCircle className="w-3 h-3" />,
  };
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      {icons[type]}{label}
    </span>
  );
};

const CarSelection = () => {
  const navigate = useNavigate();
  const { searchData, selectCar } = useBooking();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const c = labels[language] || labels.en;
  const featureLabels = { wifi: c.wifi, water: c.water, leather: c.leather };

  const handleSelectCar = (car) => {
    selectCar({ ...car, name: car.name[language] || car.name.en });
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      setAuthMode('signin');
      setAuthModalOpen(true);
    }
  };

  // Empty state
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

        {/* Route Summary Card */}
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
            <div className="flex items-center gap-4 text-xs text-gray-400 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>{c.estTime}: <b className="text-white">~45 min</b></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span>{c.estDist}: <b className="text-white">~35 km</b></span>
              </div>
            </div>
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
        </div>

        {/* Vehicle Cards */}
        <div className="max-w-5xl mx-auto px-4 pb-10">
          <div className="space-y-3">
            {vehicles.map((car) => (
              <div
                key={car.id}
                className={`group relative bg-white rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20 ${
                  car.recommended ? 'ring-2 ring-[#2ecc71]' : 'ring-1 ring-gray-200'
                }`}
                data-testid={`car-card-${car.id}`}
              >
                {/* Recommended badge */}
                {car.recommended && (
                  <div className="bg-[#2ecc71] text-white text-[11px] font-bold tracking-wide uppercase text-center py-1">
                    {c.recommended}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-[220px] md:w-[280px] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 sm:p-4">
                    <img src={car.image} alt={car.name[language] || car.name.en} className="w-full h-auto max-h-[120px] sm:max-h-[110px] object-contain" loading="lazy" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4 sm:py-4 sm:px-5 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-lg font-bold text-gray-900">{car.name[language] || car.name.en}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-2.5">{car.model} or similar</p>

                      {/* Specs */}
                      <div className="flex items-center gap-4 mb-2.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{c.pax} <b>{car.pax}</b></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{c.bags} <b>{car.bags}</b></span>
                        </div>
                      </div>

                      {/* Feature tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {car.features.map((f) => (
                          <FeatureTag key={f} type={f} label={featureLabels[f]} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 px-4 pb-4 sm:p-5 sm:pl-0 sm:w-[170px] flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100">
                    <div className="sm:text-right">
                      <div className="text-3xl font-extrabold text-gray-900">
                        {car.price}<span className="text-base font-normal text-gray-400 ml-0.5">&euro;</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectCar(car)}
                      className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
                        car.recommended
                          ? 'bg-[#2ecc71] text-white hover:bg-[#27ae60] shadow-md shadow-green-500/20'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                      data-testid={`choose-car-${car.id}`}
                    >
                      {c.select}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={(newMode) => setAuthMode(newMode)}
      />
    </div>
  );
};

export default CarSelection;
