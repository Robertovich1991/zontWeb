import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Users, Briefcase, Shield, Clock, CheckCircle, Star } from 'lucide-react';

const ParisAirportTransfer = () => {
  const navigate = useNavigate();
  const { startBooking } = useBooking();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [tripType, setTripType] = useState('oneway');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const bookingFormRef = useRef(null);
  const [formData, setFormData] = useState({
    pickup: language === 'fr' ? 'Aéroport CDG Paris' : language === 'ru' ? 'Аэропорт CDG Париж' : 'Paris CDG Airport',
    dropoff: '',
    date: '',
    time: '',
  });
  const [loading, setLoading] = useState(false);

  const content = {
    en: {
      title: 'Paris Airport Transfer - CDG, Orly & Beauvais',
      subtitle: 'Professional private driver service from Paris airports to city center and hotels',
      description: 'Book your reliable Paris airport transfer with professional English-speaking drivers. We provide premium transportation service from Charles de Gaulle (CDG), Orly and Beauvais airports to anywhere in Paris and surrounding areas. Fixed prices, flight monitoring, meet & greet service with name sign.',
      whyChoose: 'Why Choose Our Paris Airport Transfer?',
      feature1Title: 'Meet & Greet Service',
      feature1Desc: 'Driver waits for you at arrivals with personalized name sign. Free 60 minutes waiting time.',
      feature2Title: 'Flight Monitoring',
      feature2Desc: 'We track your flight in real-time. No extra charge for flight delays.',
      feature3Title: 'Clean Premium Vehicles',
      feature3Desc: 'All vehicles are regularly cleaned, air-conditioned, and less than 3 years old.',
      feature4Title: 'Fixed Prices',
      feature4Desc: 'Price confirmed at booking. No hidden fees, tolls included.',
      vehiclesTitle: 'Choose Your Vehicle',
      sedan: 'Premium Sedan',
      sedanDesc: 'Perfect for 1-3 passengers',
      luxury: 'Luxury Sedan',
      luxuryDesc: 'Mercedes E-Class or similar',
      minivan: 'Minivan',
      minivanDesc: 'For groups up to 6 passengers',
      minibus: 'Minibus',
      minibusDesc: 'For groups up to 8 passengers',
      passengers: 'Passengers',
      luggage: 'Luggage',
      bookNow: 'BOOK NOW',
      howItWorks: 'How It Works',
      step1: '1. Book Online',
      step1Desc: 'Enter your flight details and destination. Get instant price confirmation.',
      step2: '2. Meet Your Driver',
      step2Desc: 'Driver waits at arrivals hall with personalized sign with your name.',
      step3: '3. Relax & Enjoy',
      step3Desc: 'Sit back in clean, air-conditioned vehicle. Direct transfer to your destination.',
      popularRoutes: 'Popular Paris Airport Transfer Routes',
      route1: 'CDG Airport → Paris City Center',
      route2: 'CDG Airport → Disneyland Paris',
      route3: 'Orly Airport → Paris City Center',
      route4: 'Beauvais Airport → Paris City Center',
      bookingForm: 'Book Your Paris Airport Transfer',
    },
    fr: {
      title: 'Transfert Aéroport Paris - CDG, Orly & Beauvais',
      subtitle: 'Service de chauffeur privé professionnel depuis les aéroports parisiens',
      description: 'Réservez votre transfert aéroport Paris fiable avec des chauffeurs professionnels francophones. Nous proposons un service de transport premium depuis Charles de Gaulle (CDG), Orly et Beauvais vers Paris centre et tous les hôtels. Prix fixes, suivi des vols, service d\'accueil avec pancarte nominative.',
      whyChoose: 'Pourquoi Choisir Notre Transfert Aéroport Paris ?',
      feature1Title: 'Service d\'Accueil Personnalisé',
      feature1Desc: 'Le chauffeur vous attend aux arrivées avec une pancarte à votre nom. 60 minutes d\'attente gratuites.',
      feature2Title: 'Suivi des Vols en Temps Réel',
      feature2Desc: 'Nous suivons votre vol en temps réel. Aucun supplément en cas de retard.',
      feature3Title: 'Véhicules Premium Propres',
      feature3Desc: 'Tous les véhicules sont régulièrement nettoyés, climatisés et de moins de 3 ans.',
      feature4Title: 'Prix Fixes Garantis',
      feature4Desc: 'Prix confirmé à la réservation. Pas de frais cachés, péages inclus.',
      vehiclesTitle: 'Choisissez Votre Véhicule',
      sedan: 'Berline Premium',
      sedanDesc: 'Parfait pour 1-3 passagers',
      luxury: 'Berline de Luxe',
      luxuryDesc: 'Mercedes Classe E ou similaire',
      minivan: 'Monospace',
      minivanDesc: 'Pour groupes jusqu\'à 6 passagers',
      minibus: 'Minibus',
      minibusDesc: 'Pour groupes jusqu\'à 8 passagers',
      passengers: 'Passagers',
      luggage: 'Bagages',
      bookNow: 'RÉSERVER',
      howItWorks: 'Comment Ça Marche',
      step1: '1. Réservez en Ligne',
      step1Desc: 'Entrez les détails de votre vol et destination. Confirmation du prix immédiate.',
      step2: '2. Rencontrez Votre Chauffeur',
      step2Desc: 'Le chauffeur vous attend au hall des arrivées avec pancarte à votre nom.',
      step3: '3. Détendez-vous',
      step3Desc: 'Installez-vous dans un véhicule propre et climatisé. Transfert direct vers votre destination.',
      popularRoutes: 'Trajets Populaires Transfert Aéroport Paris',
      route1: 'Aéroport CDG → Centre de Paris',
      route2: 'Aéroport CDG → Disneyland Paris',
      route3: 'Aéroport Orly → Centre de Paris',
      route4: 'Aéroport Beauvais → Centre de Paris',
      bookingForm: 'Réservez Votre Transfert Aéroport Paris',
    },
    ru: {
      title: 'Трансфер из Аэропорта Парижа - CDG, Орли и Бове',
      subtitle: 'Профессиональный сервис частного водителя из парижских аэропортов',
      description: 'Забронируйте надежный трансфер из аэропорта Парижа с профессиональными русскоговорящими водителями. Мы предоставляем премиум транспортный сервис из аэропортов Шарль-де-Голль (CDG), Орли и Бове в любую точку Парижа и окрестностей. Фиксированные цены, отслеживание рейсов, встреча с именной табличкой.',
      whyChoose: 'Почему Выбрать Наш Трансфер из Аэропорта Парижа?',
      feature1Title: 'Персональная Встреча',
      feature1Desc: 'Водитель ждет вас в зале прилета с табличкой с вашим именем. 60 минут ожидания бесплатно.',
      feature2Title: 'Отслеживание Рейсов',
      feature2Desc: 'Мы отслеживаем ваш рейс в реальном времени. Без доплаты за задержку рейса.',
      feature3Title: 'Чистые Премиум Автомобили',
      feature3Desc: 'Все автомобили регулярно моются, оснащены кондиционером, возраст до 3 лет.',
      feature4Title: 'Фиксированные Цены',
      feature4Desc: 'Цена подтверждается при бронировании. Без скрытых платежей, дороги включены.',
      vehiclesTitle: 'Выберите Автомобиль',
      sedan: 'Премиум Седан',
      sedanDesc: 'Идеально для 1-3 пассажиров',
      luxury: 'Люкс Седан',
      luxuryDesc: 'Mercedes E-Class или аналогичный',
      minivan: 'Минивэн',
      minivanDesc: 'Для групп до 6 пассажиров',
      minibus: 'Микроавтобус',
      minibusDesc: 'Для групп до 8 пассажиров',
      passengers: 'Пассажиры',
      luggage: 'Багаж',
      bookNow: 'ЗАБРОНИРОВАТЬ',
      howItWorks: 'Как Это Работает',
      step1: '1. Бронируйте Онлайн',
      step1Desc: 'Введите данные вашего рейса и пункт назначения. Мгновенное подтверждение цены.',
      step2: '2. Встретьте Водителя',
      step2Desc: 'Водитель ждет вас в зале прилета с табличкой с вашим именем.',
      step3: '3. Расслабьтесь',
      step3Desc: 'Устройтесь в чистом автомобиле с кондиционером. Прямой трансфер к месту назначения.',
      popularRoutes: 'Популярные Маршруты Трансфера из Аэропорта Парижа',
      route1: 'Аэропорт CDG → Центр Парижа',
      route2: 'Аэропорт CDG → Диснейленд Париж',
      route3: 'Аэропорт Орли → Центр Парижа',
      route4: 'Аэропорт Бове → Центр Парижа',
      bookingForm: 'Забронируйте Трансфер из Аэропорта Парижа',
    },
  };

  const c = content[language] || content.en;

  const vehicles = [
    { 
      id: 1, 
      name: c.sedan, 
      desc: c.sedanDesc, 
      passengers: 3, 
      luggage: 3, 
      price: 65,
      image: '🚗'
    },
    { 
      id: 2, 
      name: c.luxury, 
      desc: c.luxuryDesc, 
      passengers: 3, 
      luggage: 3, 
      price: 95,
      image: '🚙'
    },
    { 
      id: 3, 
      name: c.minivan, 
      desc: c.minivanDesc, 
      passengers: 6, 
      luggage: 6, 
      price: 120,
      image: '🚐'
    },
    { 
      id: 4, 
      name: c.minibus, 
      desc: c.minibusDesc, 
      passengers: 8, 
      luggage: 8, 
      price: 180,
      image: '🚌'
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const searchData = { ...formData, tripType, selectedVehicle };
      startBooking(searchData);
      navigate('/car-selection');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]">
      <SEO
        title={c.title}
        description={c.description}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": c.title,
          "description": c.description,
          "provider": { "@type": "Organization", "name": "Zont", "url": "https://zont.cab" },
          "areaServed": "Paris",
          "serviceType": "Airport Transfer"
        }}
      />
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#1a2332] to-[#1f2937]">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {c.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              {c.subtitle}
            </p>
            <div className="flex justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-2 text-[#2ecc71]">
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <span className="text-white ml-2">4.9/5 (2,450+ reviews)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Description SEO */}
        <section className="py-12 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 leading-relaxed">
              {c.description}
            </p>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">{c.whyChoose}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-[#1f2937] rounded-xl p-6">
                <Shield className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature1Title}</h3>
                <p className="text-gray-400">{c.feature1Desc}</p>
              </div>
              <div className="bg-[#1f2937] rounded-xl p-6">
                <Clock className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature2Title}</h3>
                <p className="text-gray-400">{c.feature2Desc}</p>
              </div>
              <div className="bg-[#1f2937] rounded-xl p-6">
                <CheckCircle className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature3Title}</h3>
                <p className="text-gray-400">{c.feature3Desc}</p>
              </div>
              <div className="bg-[#1f2937] rounded-xl p-6">
                <Star className="w-12 h-12 text-[#2ecc71] mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{c.feature4Title}</h3>
                <p className="text-gray-400">{c.feature4Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicles Section */}
        <section className="py-20 px-4 bg-[#0f1419]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">{c.vehiclesTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-xl p-8 hover:shadow-2xl transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="text-6xl mb-4">{vehicle.image}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                      <p className="text-gray-600 mb-4">{vehicle.desc}</p>
                      <div className="flex items-center space-x-6 text-gray-700 mb-4">
                        <div className="flex items-center space-x-2">
                          <Users size={20} />
                          <span>{vehicle.passengers} {c.passengers}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase size={20} />
                          <span>{vehicle.luggage} {c.luggage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-4xl font-bold text-gray-900 mb-2">{vehicle.price} €</div>
                      <p className="text-sm text-gray-500 mb-4">All inclusive</p>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#2ecc71] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors w-full"
                      >
                        {c.bookNow}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">{c.howItWorks}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">1</div>
                <h3 className="text-2xl font-bold text-white mb-4">{c.step1}</h3>
                <p className="text-gray-400">{c.step1Desc}</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">2</div>
                <h3 className="text-2xl font-bold text-white mb-4">{c.step2}</h3>
                <p className="text-gray-400">{c.step2Desc}</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">3</div>
                <h3 className="text-2xl font-bold text-white mb-4">{c.step3}</h3>
                <p className="text-gray-400">{c.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Routes */}
        <section className="py-20 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">{c.popularRoutes}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1a2332] rounded-lg p-6 border-l-4 border-[#2ecc71]">
                <p className="text-xl text-white font-semibold">{c.route1}</p>
                <p className="text-[#2ecc71] text-2xl font-bold mt-2">From 65 €</p>
              </div>
              <div className="bg-[#1a2332] rounded-lg p-6 border-l-4 border-[#2ecc71]">
                <p className="text-xl text-white font-semibold">{c.route2}</p>
                <p className="text-[#2ecc71] text-2xl font-bold mt-2">From 95 €</p>
              </div>
              <div className="bg-[#1a2332] rounded-lg p-6 border-l-4 border-[#2ecc71]">
                <p className="text-xl text-white font-semibold">{c.route3}</p>
                <p className="text-[#2ecc71] text-2xl font-bold mt-2">From 55 €</p>
              </div>
              <div className="bg-[#1a2332] rounded-lg p-6 border-l-4 border-[#2ecc71]">
                <p className="text-xl text-white font-semibold">{c.route4}</p>
                <p className="text-[#2ecc71] text-2xl font-bold mt-2">From 120 €</p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-20 px-4 bg-[#1a2332]" ref={bookingFormRef}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-8">{c.bookingForm}</h2>
            {selectedVehicle && (
              <div className="bg-[#2ecc71]/10 border border-[#2ecc71] rounded-xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{selectedVehicle.image}</span>
                  <div>
                    <p className="text-white font-bold text-lg">{selectedVehicle.name}</p>
                    <p className="text-gray-400 text-sm">{selectedVehicle.passengers} {c.passengers} / {selectedVehicle.luggage} {c.luggage}</p>
                  </div>
                </div>
                <div className="text-[#2ecc71] text-2xl font-bold">{selectedVehicle.price} &euro;</div>
              </div>
            )}
            <div className="bg-[#0f1419] rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-3">
                    {language === 'fr' ? 'Départ' : language === 'ru' ? 'Откуда' : 'Pick up'}
                  </label>
                  <input
                    type="text"
                    name="pickup"
                    value={formData.pickup}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-white text-gray-900 rounded"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-3">
                    {language === 'fr' ? 'Destination' : language === 'ru' ? 'Куда' : 'Drop off'}
                  </label>
                  <input
                    type="text"
                    name="dropoff"
                    value={formData.dropoff}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-white text-gray-900 rounded"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-3">
                      {language === 'fr' ? 'Date' : language === 'ru' ? 'Дата' : 'Date'}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-white text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-3">
                      {language === 'fr' ? 'Heure' : language === 'ru' ? 'Время' : 'Time'}
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-white text-gray-900 rounded"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2ecc71] text-white py-5 rounded font-semibold text-lg hover:bg-[#27ae60] transition-colors uppercase"
                >
                  {loading ? '...' : c.bookNow}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ParisAirportTransfer;
