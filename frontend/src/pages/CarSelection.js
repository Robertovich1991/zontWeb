import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Users, Briefcase, Car, ChevronRight, ArrowRight, MapPin } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const labels = {
  en: {
    seoTitle: 'Select Your Vehicle - Zont Airport Transfer',
    title: 'Choose Your Vehicle',
    step1: 'Vehicle', step2: 'Details', step3: 'Confirmation',
    passengers: '', luggage: '',
    minFare: 'Min fare',
    preorder: 'Pre-order',
    noData: 'No search data found',
    goBack: 'Start a New Search',
    from: 'From', to: 'To',
  },
  fr: {
    seoTitle: 'Choisir Votre Vehicule - Zont Transfert',
    title: 'Choisissez Votre Vehicule',
    step1: 'Vehicule', step2: 'Details', step3: 'Confirmation',
    passengers: '', luggage: '',
    minFare: 'Prix min',
    preorder: 'Pre-order',
    noData: 'Aucune recherche trouvee',
    goBack: 'Nouvelle Recherche',
    from: 'De', to: 'Vers',
  },
  ru: {
    seoTitle: 'Выберите Автомобиль - Zont Трансфер',
    title: 'Выберите Автомобиль',
    step1: 'Авто', step2: 'Детали', step3: 'Подтверждение',
    passengers: '', luggage: '',
    minFare: 'Мин. цена',
    preorder: 'Пре-ордер',
    noData: 'Данные не найдены',
    goBack: 'Новый Поиск',
    from: 'Откуда', to: 'Куда',
  },
  hy: {
    seoTitle: 'Delays delays - Zont delays',
    title: 'Delays delays delays',
    step1: 'Delays', step2: 'Delays', step3: 'Delays',
    passengers: '', luggage: '',
    minFare: 'Delays delays',
    preorder: 'Pre-order',
    noData: 'Delays delays',
    goBack: 'Delays delays',
    from: 'Delays', to: 'Delays',
  },
};

const VEHICLE_IMAGES = {
  premium: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/bb1a1b7fe2c71db2d7a306a5f75eb9ac1f7c5a5d1cdde133b752f19cb03438ab.png',
  luxury: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/f2261d5fd73800ca13948b063ce7a48b4d552493be6c554517974f6216740623.png',
  sedan: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/f4c843b8a5604ed350353dc428dd7bd4e326faab679f483dc4bb4ecb59392fcc.png',
  minibus: 'https://static.prod-images.emergentagent.com/jobs/afb2332d-193f-433b-a93c-c37f4820b183/images/0c55d93337b26fdf7b01e5ac5a7dae05358b3b35731ead00951340e996af34ae.png',
};

const carClasses = [
  { id: 1, key: 'premium', nameEn: 'Premium', nameFr: 'Premium', nameRu: 'Премиум', sub: 'Premium', passengers: 4, luggage: 4, price: 65, image: VEHICLE_IMAGES.premium },
  { id: 2, key: 'luxury', nameEn: 'Luxury Sedan', nameFr: 'Berline de Luxe', nameRu: 'Люкс Седан', sub: 'Luxury Sedan', passengers: 3, luggage: 3, price: 95, image: VEHICLE_IMAGES.luxury },
  { id: 3, key: 'sedan', nameEn: 'Business Van', nameFr: 'Van Business', nameRu: 'Бизнес Вэн', sub: 'Business Van', passengers: 6, luggage: 6, price: 120, image: VEHICLE_IMAGES.sedan },
  { id: 4, key: 'minibus', nameEn: 'Minibus', nameFr: 'Minibus', nameRu: 'Минибус', sub: 'Minibus', passengers: 8, luggage: 10, price: 160, image: VEHICLE_IMAGES.minibus },
];

const CarSelection = () => {
  const navigate = useNavigate();
  const { searchData, selectCar } = useBooking();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const c = labels[language] || labels.en;

  const getCarName = (car) => {
    if (language === 'fr') return car.nameFr;
    if (language === 'ru') return car.nameRu;
    return car.nameEn;
  };

  const handleSelectCar = (car) => {
    selectCar({ ...car, name: getCarName(car) });
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
        {/* Progress Steps - Dark bar */}
        <div className="bg-[#0f1419] border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                  <div className={`flex items-center gap-2 ${i === 0 ? 'text-[#2ecc71]' : 'text-gray-500'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-[#2ecc71] text-white' : 'bg-white/10 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{step}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Route Summary */}
        <div className="bg-[#0f1419]/50 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[#2ecc71] flex-shrink-0" />
              <span className="text-gray-400">{c.from}:</span>
              <span className="text-white font-medium truncate">{searchData.pickup}</span>
              <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-gray-400">{c.to}:</span>
              <span className="text-white font-medium truncate">{searchData.dropoff}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Cards - WHITE STYLE */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            {carClasses.map((car, idx) => (
              <div
                key={car.id}
                onClick={() => handleSelectCar(car)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-200' : ''}`}
                data-testid={`car-card-${car.id}`}
              >
                <div className="p-4 sm:p-5">
                  {/* Top row: Name + Pre-order | Passengers + Luggage */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{getCarName(car)}</h3>
                      <span className="text-[#2ecc71] text-sm font-semibold">{c.preorder}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-sm flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{car.passengers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium">{car.luggage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="text-gray-400 text-sm mb-2">{car.sub}</p>

                  {/* Image + Price row */}
                  <div className="flex items-end justify-between">
                    <div className="w-[55%] sm:w-[50%]">
                      <img
                        src={car.image}
                        alt={getCarName(car)}
                        className="w-full h-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-right pb-2">
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {car.price} <span className="text-xl">&euro;</span>
                      </div>
                      <p className="text-gray-400 text-sm">{c.minFare}</p>
                    </div>
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
