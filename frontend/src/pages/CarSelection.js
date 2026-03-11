import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Users, Briefcase, Car, Shield, Clock, Plane, ChevronRight, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

const labels = {
  en: {
    seoTitle: 'Select Your Vehicle - Zont Airport Transfer',
    seoDesc: 'Choose your vehicle for your airport transfer.',
    title: 'Choose Your Vehicle',
    subtitle: 'Select the vehicle that best suits your needs',
    step1: 'Vehicle', step2: 'Login', step3: 'Checkout',
    passengers: 'passengers', luggage: 'luggage',
    vat: 'All prices include VAT and tolls',
    choose: 'Choose',
    noData: 'No search data found',
    goBack: 'Start a New Search',
    routeFrom: 'From', routeTo: 'To',
    features: ['Meet & Greet', 'Flight Tracking', 'Free Cancellation 24h', 'Fixed Price'],
    premium: 'Premium Sedan', premiumDesc: 'Mercedes E-Class or similar. Comfortable sedan for up to 4 passengers.',
    luxury: 'Luxury Sedan', luxuryDesc: 'Mercedes S-Class or similar. Premium luxury experience.',
    van: 'Business Van', vanDesc: 'Mercedes V-Class or similar. Spacious van for groups.',
    minibus: 'Minibus', minibusDesc: 'Comfortable minibus for larger groups up to 8 passengers.',
    popular: 'Most Popular',
  },
  fr: {
    seoTitle: 'Choisir Votre Vehicule - Zont Transfert Aeroport',
    seoDesc: 'Choisissez votre vehicule pour votre transfert aeroport.',
    title: 'Choisissez Votre Vehicule',
    subtitle: 'Selectionnez le vehicule qui correspond le mieux a vos besoins',
    step1: 'Vehicule', step2: 'Connexion', step3: 'Paiement',
    passengers: 'passagers', luggage: 'bagages',
    vat: 'Tous les prix incluent la TVA et les peages',
    choose: 'Choisir',
    noData: 'Aucune recherche trouvee',
    goBack: 'Nouvelle Recherche',
    routeFrom: 'De', routeTo: 'Vers',
    features: ['Accueil Personnalise', 'Suivi de Vol', 'Annulation Gratuite 24h', 'Prix Fixe'],
    premium: 'Berline Premium', premiumDesc: 'Mercedes Classe E ou similaire. Berline confortable pour 4 passagers.',
    luxury: 'Berline de Luxe', luxuryDesc: 'Mercedes Classe S ou similaire. Experience luxe premium.',
    van: 'Van Business', vanDesc: 'Mercedes Classe V ou similaire. Van spacieux pour les groupes.',
    minibus: 'Minibus', minibusDesc: 'Minibus confortable pour les grands groupes jusqu\'a 8 passagers.',
    popular: 'Le Plus Populaire',
  },
  ru: {
    seoTitle: 'Выберите Автомобиль - Zont Трансфер',
    seoDesc: 'Выберите автомобиль для трансфера из аэропорта.',
    title: 'Выберите Автомобиль',
    subtitle: 'Выберите автомобиль, подходящий вашим потребностям',
    step1: 'Автомобиль', step2: 'Вход', step3: 'Оплата',
    passengers: 'пассажиров', luggage: 'багаж',
    vat: 'Все цены включают НДС и дорожные сборы',
    choose: 'Выбрать',
    noData: 'Данные поиска не найдены',
    goBack: 'Новый Поиск',
    routeFrom: 'Откуда', routeTo: 'Куда',
    features: ['Встреча в аэропорту', 'Отслеживание рейса', 'Бесплатная отмена 24ч', 'Фикс. цена'],
    premium: 'Премиум Седан', premiumDesc: 'Mercedes E-Class или аналог. Комфортный седан на 4 пассажира.',
    luxury: 'Люкс Седан', luxuryDesc: 'Mercedes S-Class или аналог. Премиум люкс опыт.',
    van: 'Бизнес Вэн', vanDesc: 'Mercedes V-Class или аналог. Просторный вэн для групп.',
    minibus: 'Минибус', minibusDesc: 'Комфортный минибус для больших групп до 8 пассажиров.',
    popular: 'Самый Популярный',
  },
  hy: {
    seoTitle: 'Delays delays - Zont delays',
    seoDesc: 'Delays delays delays delays.',
    title: 'Delays delays delays delays',
    subtitle: 'Delays delays delays delays delays delays',
    step1: 'Delays', step2: 'Delays', step3: 'Delays',
    passengers: 'delays', luggage: 'delays',
    vat: 'Delays delays delays delays delays',
    choose: 'Delays',
    noData: 'Delays delays delays delays',
    goBack: 'Delays delays delays',
    routeFrom: 'Delays', routeTo: 'Delays',
    features: ['Delays delays', 'Delays delays', 'Delays delays 24delays', 'Delays delays'],
    premium: 'Delays Delays', premiumDesc: 'Mercedes E-Class delays delays. Delays delays delays delays 4 delays.',
    luxury: 'Delays Delays', luxuryDesc: 'Mercedes S-Class delays delays. Delays delays delays.',
    van: 'Delays Delays', vanDesc: 'Mercedes V-Class delays delays. Delays delays delays delays.',
    minibus: 'Delays', minibusDesc: 'Delays delays delays delays delays 8 delays.',
    popular: 'Delays Delays Delays',
  },
};

const CarSelection = () => {
  const navigate = useNavigate();
  const { searchData, selectCar } = useBooking();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const c = labels[language] || labels.en;

  const carClasses = [
    { id: 1, name: c.premium, desc: c.premiumDesc, passengers: 4, luggage: 4, price: 88, popular: false },
    { id: 2, name: c.luxury, desc: c.luxuryDesc, passengers: 3, luggage: 3, price: 123, popular: true },
    { id: 3, name: c.van, desc: c.vanDesc, passengers: 6, luggage: 6, price: 156, popular: false },
    { id: 4, name: c.minibus, desc: c.minibusDesc, passengers: 8, luggage: 8, price: 198, popular: false },
  ];

  const handleSelectCar = (car) => {
    selectCar(car);
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      setAuthMode('signin');
      setAuthModalOpen(true);
    }
  };

  const featureIcons = [
    <Plane className="w-4 h-4" />,
    <Clock className="w-4 h-4" />,
    <Shield className="w-4 h-4" />,
    <CheckCircle className="w-4 h-4" />,
  ];

  // Empty state
  if (!searchData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="car-selection-empty">
        <SEO title={c.seoTitle} description={c.seoDesc} noindex={true} />
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-[#2ecc71]" />
            </div>
            <p className="text-white text-xl font-semibold mb-2">{c.noData}</p>
            <p className="text-gray-400 text-sm mb-6">{c.subtitle}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#2ecc71] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors inline-flex items-center gap-2"
              data-testid="go-back-btn"
            >
              {c.goBack}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="car-selection-page">
      <SEO title={c.seoTitle} description={c.seoDesc} noindex={true} />
      <Header />

      <main className="flex-1 pt-16">
        {/* Progress Steps */}
        <div className="bg-[#0f1419] border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                  <div className={`flex items-center gap-2 ${i === 0 ? 'text-[#2ecc71]' : 'text-gray-500'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-[#2ecc71] text-white' : 'bg-white/10 text-gray-500'
                    }`}>
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
        {searchData && (
          <div className="bg-[#0f1419]/50 border-b border-white/5">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-[#2ecc71] flex-shrink-0" />
                <span className="text-gray-400">{c.routeFrom}:</span>
                <span className="text-white font-medium truncate">{searchData.pickup}</span>
                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-gray-400">{c.routeTo}:</span>
                <span className="text-white font-medium truncate">{searchData.dropoff}</span>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" data-testid="car-selection-title">{c.title}</h1>
          <p className="text-gray-400 text-sm">{c.subtitle}</p>
        </div>

        {/* Features Strip */}
        <div className="max-w-4xl mx-auto px-4 pb-6">
          <div className="flex flex-wrap gap-3">
            {c.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">
                <span className="text-[#2ecc71]">{featureIcons[i]}</span>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Car Cards */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="space-y-4">
            {carClasses.map((car) => (
              <div
                key={car.id}
                className={`relative bg-white/5 border rounded-xl overflow-hidden hover:bg-white/[0.07] transition-all ${
                  car.popular ? 'border-[#2ecc71]/50 ring-1 ring-[#2ecc71]/20' : 'border-white/10'
                }`}
                data-testid={`car-card-${car.id}`}
              >
                {/* Popular Badge */}
                {car.popular && (
                  <div className="absolute top-0 right-0 bg-[#2ecc71] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {c.popular}
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Car Icon */}
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Car className="w-7 h-7 text-[#2ecc71]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1">{car.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{car.desc}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{car.passengers} {c.passengers}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span>{car.luggage} {c.luggage}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price + Button */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <div className="sm:text-right">
                        <div className="text-3xl sm:text-4xl font-bold text-white">{car.price}<span className="text-lg text-gray-400 ml-1">&euro;</span></div>
                        <p className="text-xs text-gray-500 hidden sm:block">{c.vat}</p>
                      </div>
                      <button
                        onClick={() => handleSelectCar(car)}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                          car.popular
                            ? 'bg-[#2ecc71] text-white hover:bg-[#27ae60]'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                        }`}
                        data-testid={`choose-car-${car.id}`}
                      >
                        {c.choose}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VAT Note Mobile */}
          <p className="text-xs text-gray-500 text-center mt-4 sm:hidden">{c.vat}</p>
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
