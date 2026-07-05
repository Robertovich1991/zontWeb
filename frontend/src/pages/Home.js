import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { trackSearch } from '@/utils/fbPixel';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import TripAdvisorReviews from '@/components/TripAdvisorReviews';
import LastMinuteWarning from '@/components/LastMinuteWarning';
import { useLanguage } from '@/context/LanguageContext';
import PlacesAutocomplete, { loadGoogleMaps } from '@/components/PlacesAutocomplete';
import { transferService } from '@/services/api';
import { CheckCircle, MapPin, Clock, Shield, Star, CreditCard, Plane, Users, ChevronRight, ArrowRight, Sparkles, Loader2, Mic, MicOff } from 'lucide-react';

const IMAGES = {
  hero: '/images/hero.webp',
  sedan: '/images/sedan.webp',
  interior: '/images/interior.webp',
  airport: '/images/airport.webp',
  cdgDriver: '/images/driver-paris.webp',
};

const homeContent = {
  en: {
    heroTitle: 'Premium Airport Transfer',
    heroAccent: 'Across Europe',
    heroSub: 'Professional private drivers in 16 cities. Fixed prices, flight tracking, meet & greet.',
    bookingTitle: 'Book Your Transfer',
    tabTransfer: 'Transfer', tabDisposal: 'Driver at disposal', hoursLabel: 'How many hours?',
    pickup: 'Pick up address', dropoff: 'Drop off address', date: 'Date', time: 'Time',
    pickupPh: 'Airport, hotel, address...', dropoffPh: 'Hotel, city center, address...',
    bookNow: 'SEARCH TRANSFER', searching: 'SEARCHING...',
    fixedPrices: 'Fixed Prices', securePay: 'Secure Payment',
    stats: { trips: '50K+', tripsLabel: 'Completed Trips', cities: '16', citiesLabel: 'Cities', available: '24/7', availableLabel: 'Service', rating: '4.5/5', ratingLabel: 'Rating' },
    trustTitle: 'Why Travelers Trust Zont',
    f1Title: 'Meet & Greet', f1Desc: 'Your driver waits at arrivals with a personalized name sign. 60 min free waiting for flight delays.',
    f2Title: 'Flight Tracking', f2Desc: 'Real-time monitoring of your flight. No extra charge if delayed.',
    f3Title: 'Premium Vehicles', f3Desc: 'Mercedes, BMW. Clean, air-conditioned, less than 3 years old.',
    f4Title: 'Fixed Prices', f4Desc: 'Price confirmed at booking. No hidden fees, tolls included.',
    popularTitle: 'Popular Destinations',
    reviewsTitle: 'What Travelers Say',
    ctaTitle: 'Ready to Book Your Transfer?', ctaBtn: 'Book Now', appTitle: 'Track Your Booking in Real Time', appSubtitle: 'Download the Zont app and follow your driver live, receive instant notifications, and manage your reservations on the go.', appFeature1: 'Live driver tracking', appFeature2: 'Instant booking confirmations', appFeature3: 'Manage reservations anywhere',
    howTitle: 'How It Works',
    recentTitle: 'Recent Searches', recentEmpty: 'No recent searches',
    aiTitle: 'Book in 10 seconds with AI', aiPlaceholder: 'Ex: CDG tomorrow 2pm to Hilton Opera 2 passengers', aiBtn: 'AUTO', aiLoading: 'Analyzing your trip...', aiLow: 'Could not understand fully. Please check the fields.',
    guidedPickup: 'Where are you departing from?', guidedDropoff: 'Where are you going?', guidedDate: 'What date?', guidedTime: 'What time?',
    guidedSuggestions: { pickup: ['Paris CDG', 'Paris Orly', 'Nice Airport', 'Lyon Airport'], dropoff: ['Paris Center', 'Disneyland', 'Tour Eiffel', 'Hotel'], date: ['Today', 'Tomorrow'], time: ['Morning (9h)', 'Afternoon (14h)', 'Evening (19h)'] },
    s1: 'Book Online', s1d: 'Enter your flight details and destination. Instant price confirmation.',
    s2: 'Meet Your Driver', s2d: 'Driver waits at arrivals with your name sign. Help with luggage included.',
    s3: 'Enjoy the Ride', s3d: 'Comfortable direct transfer in a premium vehicle to your destination.',
    seoTitle: 'Zont - Premium Airport Transfer Service in Europe',
    seoDesc: 'Professional private driver in 16 European cities. Fixed prices, flight tracking, meet and greet. Book your airport transfer online.',
  },
  fr: {
    heroTitle: 'Transfert Aeroport Premium',
    heroAccent: 'Partout en Europe',
    heroSub: 'Chauffeurs privés professionnels dans 16 villes. Prix fixes, suivi de vol, accueil personnalisé.',
    bookingTitle: 'Réservez Votre Transfert',
    tabTransfer: 'Transfert', tabDisposal: 'Chauffeur à disposition', hoursLabel: 'Combien d\'heures ?',
    pickup: 'Adresse de départ', dropoff: 'Adresse d\'arrivée', date: 'Date', time: 'Heure',
    pickupPh: 'Aéroport, hôtel, adresse...', dropoffPh: 'Hôtel, centre-ville, adresse...',
    bookNow: 'RECHERCHER UN TRANSFERT', searching: 'RECHERCHE...',
    fixedPrices: 'Prix Fixes', securePay: 'Paiement Sécurisé',
    stats: { trips: '50K+', tripsLabel: 'Courses Effectuées', cities: '16', citiesLabel: 'Villes', available: '24/7', availableLabel: 'Service', rating: '4.5/5', ratingLabel: 'Note' },
    trustTitle: 'Pourquoi les Voyageurs Font Confiance à Zont',
    f1Title: 'Accueil Personnalisé', f1Desc: 'Votre chauffeur vous attend aux arrivées avec une pancarte à votre nom. 60 min d\'attente gratuites.',
    f2Title: 'Suivi des Vols', f2Desc: 'Surveillance en temps réel de votre vol. Aucun supplément en cas de retard.',
    f3Title: 'Véhicules Premium', f3Desc: 'Mercedes, BMW. Propres, climatisés, moins de 3 ans.',
    f4Title: 'Prix Fixes Garantis', f4Desc: 'Prix confirmé à la réservation. Pas de frais cachés, péages inclus.',
    popularTitle: 'Destinations Populaires',
    reviewsTitle: 'Ce Que Disent Nos Clients',
    ctaTitle: 'Prêt à Réserver Votre Transfert ?', ctaBtn: 'Réserver Maintenant', appTitle: 'Suivez Votre Reservation en Temps Reel', appSubtitle: 'Telechargez l\'appli Zont et suivez votre chauffeur en direct, recevez des notifications instantanees et gerez vos reservations ou que vous soyez.', appFeature1: 'Suivi du chauffeur en direct', appFeature2: 'Confirmations de reservation instantanees', appFeature3: 'Gerez vos reservations partout',
    howTitle: 'Comment Ça Marche',
    recentTitle: 'Recherches Récentes', recentEmpty: 'Aucune recherche récente',
    aiTitle: 'Réservez en 10 secondes avec IA', aiPlaceholder: 'Ex: CDG demain 14h vers Hilton Opéra 2 personnes', aiBtn: 'AUTO', aiLoading: 'Analyse de votre trajet...', aiLow: 'Pas assez d\'informations. Vérifiez les champs.',
    guidedPickup: 'D\'où partez-vous ?', guidedDropoff: 'Où allez-vous ?', guidedDate: 'Quelle date ?', guidedTime: 'À quelle heure ?',
    guidedSuggestions: { pickup: ['Paris CDG', 'Paris Orly', 'Nice Aéroport', 'Lyon Aéroport'], dropoff: ['Paris Centre', 'Disneyland', 'Tour Eiffel', 'Hôtel'], date: ['Aujourd\'hui', 'Demain'], time: ['Matin (9h)', 'Après-midi (14h)', 'Soir (19h)'] },
    s1: 'Réservez en Ligne', s1d: 'Entrez les détails de votre vol et destination. Confirmation du prix immédiate.',
    s2: 'Rencontrez Votre Chauffeur', s2d: 'Chauffeur aux arrivées avec pancarte à votre nom. Aide aux bagages.',
    s3: 'Profitez du Trajet', s3d: 'Transfert direct confortable dans un véhicule premium.',
    seoTitle: 'Zont - Transfert Aéroport Premium en Europe | Chauffeur Privé',
    seoDesc: 'Transfert privé premium en 120+ villes d\'Europe. Prix fixes garantis, suivi des vols en temps réel et accueil personnalisé. Réservez en ligne maintenant.',
  },
  ru: {
    heroTitle: 'Премиум Трансфер из Аэропорта',
    heroAccent: 'По Всей Европе',
    heroSub: 'Профессиональные частные водители в 16 городах. Фиксированные цены, отслеживание рейсов.',
    bookingTitle: 'Забронируйте Трансфер',
    tabTransfer: 'Трансфер', tabDisposal: 'Водитель в распоряжение', hoursLabel: 'Сколько часов?',
    pickup: 'Адрес отправления', dropoff: 'Адрес назначения', date: 'Дата', time: 'Время',
    pickupPh: 'Аэропорт, отель, адрес...', dropoffPh: 'Отель, центр города...',
    bookNow: 'НАЙТИ ТРАНСФЕР', searching: 'ПОИСК...',
    fixedPrices: 'Фиксированные Цены', securePay: 'Безопасная Оплата',
    stats: { trips: '50K+', tripsLabel: 'Поездок', cities: '16', citiesLabel: 'Городов', available: '24/7', availableLabel: 'Сервис', rating: '4.5/5', ratingLabel: 'Рейтинг' },
    trustTitle: 'Почему Путешественники Доверяют Zont',
    f1Title: 'Встреча с Табличкой', f1Desc: 'Водитель ждет с именной табличкой. 60 минут бесплатного ожидания.',
    f2Title: 'Отслеживание Рейсов', f2Desc: 'Мониторинг вашего рейса в реальном времени. Без доплаты за задержку.',
    f3Title: 'Премиум Автомобили', f3Desc: 'Mercedes, BMW. Чистые, с кондиционером, не старше 3 лет.',
    f4Title: 'Фиксированные Цены', f4Desc: 'Цена подтверждена при бронировании. Без скрытых платежей.',
    popularTitle: 'Популярные Направления',
    reviewsTitle: 'Отзывы Клиентов',
    ctaTitle: 'Готовы Забронировать Трансфер?', ctaBtn: 'Забронировать', appTitle: 'Отслеживайте Бронирование в Реальном Времени', appSubtitle: 'Скачайте приложение Zont и следите за водителем онлайн.', appFeature1: 'Отслеживание водителя', appFeature2: 'Мгновенные подтверждения', appFeature3: 'Управление бронированиями',
    howTitle: 'Как Это Работает',
    recentTitle: 'Недавние Поиски', recentEmpty: 'Нет недавних поисков',
    aiTitle: 'Бронируйте за 10 секунд с ИИ', aiPlaceholder: 'Пр: CDG завтра 14:00 в Hilton Opera 2 чел', aiBtn: 'АВТО', aiLoading: 'Анализ маршрута...', aiLow: 'Недостаточно данных. Проверьте поля.',
    guidedPickup: 'Откуда вы едете?', guidedDropoff: 'Куда вы едете?', guidedDate: 'Какая дата?', guidedTime: 'Во сколько?',
    guidedSuggestions: { pickup: ['Paris CDG', 'Paris Orly', 'Nice Airport', 'Lyon Airport'], dropoff: ['Paris Centre', 'Disneyland', 'Tour Eiffel', 'Hotel'], date: ['Сегодня', 'Завтра'], time: ['Утро (9ч)', 'День (14ч)', 'Вечер (19ч)'] },
    s1: 'Бронируйте Онлайн', s1d: 'Введите данные рейса и адрес назначения.',
    s2: 'Встретьте Водителя', s2d: 'Водитель ждет в зале прилета с табличкой.',
    s3: 'Наслаждайтесь', s3d: 'Комфортная поездка в премиум автомобиле.',
    seoTitle: 'Zont - Премиум Трансфер из Аэропорта в Европе',
    seoDesc: 'Трансферы из аэропортов Парижа (CDG/ORY/BVA) и 120+ городов Европы у лицензированных водителей: фиксированная цена и отслеживание рейса.',
  },
  hy: {
    heroTitle: 'Պրեմիում Օդանավակայանի Տրանսֆեր',
    heroAccent: 'Ամբողջ Եվրոպայում',
    heroSub: 'Պրոֆեսիոնալ անձնական վարորդներ 16 քաղաքներում: Հաստատ գներ, թռիչքի հետևելում, անհատական դիմավորում:',
    bookingTitle: 'Ամրագրեք Ձեր Տրանսֆերը',
    tabTransfer: 'Տրանսֆեր', tabDisposal: 'Վարորդ տրամադրության տակ', hoursLabel: 'Քանի՞ ժամ',
    pickup: 'Վերցնելու հասցե', dropoff: 'Իջնելու հասցե', date: 'Ամսաթիվ', time: 'Ժամ',
    pickupPh: 'Օդանավակայան, հյուրանոց, հասցե...', dropoffPh: 'Հյուրանոց, կենտրոն, հասցե...',
    bookNow: 'ՈՌՈՆԵԼ ՏՌԱՆՍՖԵՌ', searching: 'ՈՌՈՆՈՒՄ...',
    fixedPrices: 'Հաստատ Գներ', securePay: 'Ապահով Վճարում',
    stats: { trips: '50K+', tripsLabel: 'Կատարված Ուղևորություններ', cities: '16', citiesLabel: 'Քաղաքներ', available: '24/7', availableLabel: 'Սպասարկում', rating: '4.5/5', ratingLabel: 'Վարկանիշ' },
    trustTitle: 'Ինչու Ճամորդները Վստահում Են Zont-ին',
    f1Title: 'Դիմավորում', f1Desc: 'Վարորդը սպասում է ժամանման վայրում անվանական ցուցանակով: 60 րոպե անվճար սպասում:',
    f2Title: 'Թռիչքի Հետևելում', f2Desc: 'Ձեր թռիչքի հետևելում իրական ժամանակում: Հավելյալ վճար ուշացման դեպքում:',
    f3Title: 'Պրեմիում Մեքենաներ', f3Desc: 'Mercedes, BMW: Մաքուր, օդարակություն, 3 տարիից փոքր:',
    f4Title: 'Հաստատ Գներ', f4Desc: 'Գինը հաստատվում է ամրագրման ժամանակ: Թաքնված վճարներ չկան:',
    popularTitle: 'Հանրահայտ Ուղղություններ',
    reviewsTitle: 'Ինչ Ասում Են Ճամորդները',
    ctaTitle: 'Պատրաստ՞ Եք Ամրագրել Տրանսֆերը:', ctaBtn: 'Ամրագրել Հիմա',
    howTitle: 'Ինչպես Է Աշխատում',
    recentTitle: 'Վերջին Որոնումներ', recentEmpty: 'Վերջին որոնումներ չկան',
    s1: 'Ամրագրեք Առցանց', s1d: 'Մուտքագրեք ձեր թռիչքի տվյալները և ուղղությունը: Գնի ակնթարտ հաստատում:',
    s2: 'Հանդիպեք Վարորդին', s2d: 'Վարորդը սպասում է ժամանման վայրում ձեր անվանական ցուցանակով:',
    s3: 'Վայելեք Ուղևորությունից', s3d: 'Հարմարավետ ուղիղ տրանսֆեր պրեմիում մեքենայով:',
    seoTitle: 'Zont - Պրեմիում Օդանավակայանի Տրանսֆեր Եվրոպայում',
    seoDesc: 'Պրոֆեսիոնալ անձնական վարորդ 16 եվրոպական քաղաքներում: Հաստատ գներ, թռիչքի հետևելում:',
  },
  es: {
    heroTitle: 'Traslado Aeropuerto Premium',
    heroAccent: 'En Toda Europa',
    heroSub: 'Chóferes privados profesionales en 16 ciudades. Precios fijos, seguimiento de vuelo, recepción personalizada.',
    bookingTitle: 'Reserva Tu Traslado',
    tabTransfer: 'Traslado', tabDisposal: 'Chófer a disposición', hoursLabel: '¿Cuántas horas?',
    pickup: 'Dirección de recogida', dropoff: 'Dirección de destino', date: 'Fecha', time: 'Hora',
    pickupPh: 'Aeropuerto, hotel, dirección...', dropoffPh: 'Hotel, centro, dirección...',
    bookNow: 'BUSCAR TRASLADO', searching: 'BUSCANDO...',
    fixedPrices: 'Precios Fijos', securePay: 'Pago Seguro',
    stats: { trips: '50K+', tripsLabel: 'Viajes Realizados', cities: '16', citiesLabel: 'Ciudades', available: '24/7', availableLabel: 'Servicio', rating: '4.5/5', ratingLabel: 'Valoración' },
    trustTitle: '¿Por qué los Viajeros Confían en Zont?',
    f1Title: 'Recepción Personalizada', f1Desc: 'Tu chófer te espera en llegadas con un cartel con tu nombre. 60 min de espera gratis en caso de retraso.',
    f2Title: 'Seguimiento de Vuelos', f2Desc: 'Monitorización en tiempo real de tu vuelo. Sin recargo si hay retraso.',
    f3Title: 'Vehículos Premium', f3Desc: 'Mercedes, BMW. Limpios, con aire acondicionado, menos de 3 años.',
    f4Title: 'Precios Fijos', f4Desc: 'Precio confirmado al reservar. Sin gastos ocultos, peajes incluidos.',
    popularTitle: 'Destinos Populares',
    reviewsTitle: 'Lo Que Dicen Nuestros Clientes',
    ctaTitle: '¿Listo para Reservar Tu Traslado?', ctaBtn: 'Reservar Ahora',
    appTitle: 'Sigue Tu Reserva en Tiempo Real', appSubtitle: 'Descarga la app Zont y sigue a tu chófer en directo, recibe notificaciones instantáneas y gestiona tus reservas desde cualquier lugar.',
    appFeature1: 'Seguimiento del chófer en directo', appFeature2: 'Confirmaciones de reserva instantáneas', appFeature3: 'Gestiona tus reservas en cualquier lugar',
    howTitle: 'Cómo Funciona',
    recentTitle: 'Búsquedas Recientes', recentEmpty: 'Sin búsquedas recientes',
    aiTitle: 'Reserva en 10 segundos con IA', aiPlaceholder: 'Ej: CDG mañana 14h a Hilton Ópera 2 pasajeros', aiBtn: 'AUTO', aiLoading: 'Analizando tu viaje...', aiLow: 'Datos insuficientes. Verifica los campos.',
    guidedPickup: '¿Desde dónde sales?', guidedDropoff: '¿A dónde vas?', guidedDate: '¿Qué fecha?', guidedTime: '¿A qué hora?',
    guidedSuggestions: { pickup: ['Paris CDG', 'Paris Orly', 'Nice Aeropuerto', 'Lyon Aeropuerto'], dropoff: ['Centro de París', 'Disneyland', 'Torre Eiffel', 'Hotel'], date: ['Hoy', 'Mañana'], time: ['Mañana (9h)', 'Tarde (14h)', 'Noche (19h)'] },
    s1: 'Reserva Online', s1d: 'Introduce los datos de tu vuelo y destino. Confirmación de precio instantánea.',
    s2: 'Encuentra a Tu Chófer', s2d: 'El chófer te espera en llegadas con cartel con tu nombre. Ayuda con equipaje incluida.',
    s3: 'Disfruta del Viaje', s3d: 'Traslado directo y cómodo en un vehículo premium hasta tu destino.',
    seoTitle: 'Zont - Traslado Aeropuerto Premium en Europa | Chófer Privado',
    seoDesc: 'Traslado privado premium en 16+ ciudades de Europa. Precios fijos garantizados, seguimiento de vuelos y recepción personalizada. Reserva online ahora.',
  },
};

const popularDest = [
  { nameEn: 'Paris Airport Transfer', nameFr: 'Paris CDG', nameRu: 'Париж CDG', nameHy: 'Փարիզ CDG', nameEs: 'Traslado Aeropuerto París', price: 59, urlEn: '/paris-airport-transfer', urlFr: '/transfert-aeroport-paris', urlRu: '/transfer-aeroport-parizh', urlHy: '/pariz-odanavakayan-transfer', urlEs: '/es/traslado-aeropuerto-paris' },
  { nameEn: 'Disneyland Paris Transfer', nameFr: 'Disneyland', nameRu: 'Диснейленд', nameHy: 'Disneyland', nameEs: 'Disneyland París', price: 49, urlEn: '/disneyland-paris-transfer', urlFr: '/transfert-disneyland-paris', urlRu: '/transfer-disneylend-parizh', urlHy: '/disneylend-pariz-transfer', urlEs: '/es/traslado-disneyland-paris' },
  { nameEn: 'Nice Airport Transfer', nameFr: 'Nice', nameRu: 'Ницца', nameHy: 'Նიցա', price: 35, urlEn: '/nice-airport-transfer', urlFr: '/transfert-aeroport-nice', urlRu: '/transfer-aeroport-nitstsa', urlHy: '/nits-odanavakayan-transfer', urlEs: '/nice-airport-transfer', nameEs: 'Niza' },
  { nameEn: 'Barcelona', nameFr: 'Barcelone', nameRu: 'Барселона', nameHy: 'Բարսելոնա', price: 39, urlEn: '/barcelona-airport-transfer', urlFr: '/transfert-aeroport-barcelone', urlRu: '/transfer-aeroport-barselona', urlHy: '/barselona-odanavakayan-transfer', urlEs: '/barcelona-airport-transfer', nameEs: 'Barcelona' },
  { nameEn: 'Rome Airport Transfer', nameFr: 'Rome', nameRu: 'Рим', nameHy: 'Հռոմ', price: 40, urlEn: '/rome-airport-transfer', urlFr: '/transfert-aeroport-rome', urlRu: '/transfer-aeroport-rim', urlHy: '/hrom-odanavakayan-transfer', urlEs: '/rome-airport-transfer', nameEs: 'Roma' },
  { nameEn: 'Berlin Airport Transfer', nameFr: 'Berlin', nameRu: 'Берлин', nameHy: 'Բեռլին', price: 45, urlEn: '/berlin-airport-transfer', urlFr: '/transfert-aeroport-berlin', urlRu: '/transfer-aeroport-berlin', urlHy: '/berlin-odanavakayan-transfer', urlEs: '/berlin-airport-transfer', nameEs: 'Berlín' },
  { nameEn: 'Monaco Limo Service', nameFr: 'Monaco', nameRu: 'Монако', nameHy: 'Մոնակո', price: 65, urlEn: '/monaco-airport-transfer', urlFr: '/transfert-aeroport-monaco', urlRu: '/transfer-aeroport-monako', urlHy: '/monako-odanavakayan-transfer', urlEs: '/monaco-airport-transfer', nameEs: 'Mónaco' },
];

const homeSeoUrls = { en: '/', fr: '/fr', ru: '/ru', hy: '/hy', es: '/es' };

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
  const [mode, setMode] = useState('transfer'); // 'transfer' | 'disposal' (hourly)
  const [hours, setHours] = useState(2);
  const [cmsTrustBlocks, setCmsTrustBlocks] = useState(null);
  const [cmsHomepage, setCmsHomepage] = useState(null);
  const langSyncRef = useRef(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [guidedStep, setGuidedStep] = useState(null); // null | 'pickup' | 'dropoff' | 'date' | 'time'
  const [guidedInput, setGuidedInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [pickupOptions, setPickupOptions] = useState([]);
  const [dropoffOptions, setDropoffOptions] = useState([]);
  const [homeReviews, setHomeReviews] = useState([]);

  // IMMUNE REFS: Coordinates stored here can NEVER be cleared by mobile browser onChange events.
  // Only handlePlaceSelect (autocomplete selection) writes to these refs.
  const pickupSafeRef = useRef({ latitude: null, longitude: null, placeId: null, address: '' });
  const dropoffSafeRef = useRef({ latitude: null, longitude: null, placeId: null, address: '' });

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
    fetch(`${API}/api/reviews/public/home?lang=${language}`).then(r => r.json()).then(setHomeReviews).catch(() => {});
  }, [API, language]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch { /* ignore corrupted data */ }
  }, []);

  const c = homeContent[language] || homeContent.en;

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

      // Strategy 1: placeId is most reliable (set by autocomplete selection)
      const byPlaceId = placeId
        ? tryGeo({ placeId }).catch(() => null)
        : Promise.resolve(null);

      byPlaceId.then(result => {
        if (result) return resolve(result);
        // Strategy 2: original text
        return tryGeo({ address })
          .then(resolve)
          .catch(() => {
            // Strategy 3: strip unclosed parens at end + complete parens
            const cleaned = address
              .replace(/\s*\([^)]*$/, '')   // unclosed "(CD" at end
              .replace(/\([^)]*\)/g, '')     // complete "(CDG)"
              .replace(/\s+/g, ' ').trim();
            return tryGeo({ address: cleaned })
              .then(resolve)
              .catch(() => {
                // Strategy 4: first part before comma
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
    setLoading(true);

    const pickupAddr = pickup.address || document.getElementById('h-pickup')?.value || '';
    const dropoffAddr = dropoff.address || document.getElementById('h-dropoff')?.value || '';

    // ─── Driver at disposal (hourly) mode ───
    if (mode === 'disposal') {
      if (!pickupAddr) {
        toast.error(language === 'fr' ? 'Veuillez indiquer l\'adresse de prise en charge' : 'Please enter a pickup address');
        setLoading(false);
        return;
      }
      if (!date || !time) {
        toast.error(language === 'fr' ? 'Veuillez sélectionner la date et l\'heure' : 'Please select date and time');
        setLoading(false);
        return;
      }
      let pickupCoords = null;
      if (pickupSafeRef.current.latitude != null) pickupCoords = { latitude: pickupSafeRef.current.latitude, longitude: pickupSafeRef.current.longitude };
      else if (pickup.latitude != null) pickupCoords = { latitude: pickup.latitude, longitude: pickup.longitude };
      try {
        if (!pickupCoords) pickupCoords = await geocodeAddress(pickupAddr, pickupSafeRef.current.placeId || pickup.placeId);
      } catch {
        toast.error(language === 'fr' ? 'Adresse introuvable. Veuillez réessayer.' : 'Address not found. Please try again.');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({
        pickup: pickupAddr,
        lat: String(pickupCoords.latitude),
        lng: String(pickupCoords.longitude),
        date,
        time,
        hours: String(hours),
      });
      setLoading(false);
      navigate(`/hourly-booking?${params.toString()}`);
      return;
    }

    if (!pickupAddr || !dropoffAddr) {
      toast.error(language === 'fr' ? 'Veuillez remplir les adresses' : 'Please fill in both addresses');
      setLoading(false);
      return;
    }

    if (!date || !time) {
      toast.error(language === 'fr' ? 'Veuillez sélectionner la date et l\'heure' : 'Please select date and time');
      setLoading(false);
      return;
    }

    // Priority: safeRef coords > state coords > geocode
    // SafeRef can NEVER be cleared by mobile browser onChange events
    const getCoords = (safeRef, stateObj, addr) => {
      // 1) Try safeRef (immune to race conditions)
      if (safeRef.current.latitude != null) {
        const refP = safeRef.current.address.substring(0, 12).toLowerCase();
        const addrP = addr.substring(0, 12).toLowerCase();
        if (refP === addrP) {
          return { latitude: safeRef.current.latitude, longitude: safeRef.current.longitude };
        }
      }
      // 2) Try React state
      if (stateObj.latitude != null) {
        return { latitude: stateObj.latitude, longitude: stateObj.longitude };
      }
      return null;
    };

    let pickupCoords = getCoords(pickupSafeRef, pickup, pickupAddr);
    let dropoffCoords = getCoords(dropoffSafeRef, dropoff, dropoffAddr);

    try {
      if (!pickupCoords) pickupCoords = await geocodeAddress(pickupAddr, pickupSafeRef.current.placeId || pickup.placeId);
      if (!dropoffCoords) dropoffCoords = await geocodeAddress(dropoffAddr, dropoffSafeRef.current.placeId || dropoff.placeId);
    } catch {
      toast.error(language === 'fr' ? 'Adresse introuvable. Veuillez réessayer.' : 'Address not found. Please try again.');
      setLoading(false);
      return;
    }

    // Save to recent searches immediately (before API call)
    try {
      const entry = { pickup: pickupAddr, dropoff: dropoffAddr, pickupCoords, dropoffCoords, date, time };
      const prev = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const filtered = prev.filter(s => !(s.pickup === pickupAddr && s.dropoff === dropoffAddr));
      const updated = [entry, ...filtered].slice(0, 3);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch { /* localStorage full or unavailable */ }

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
      trackSearch({ pickup: pickup.address, dropoff: dropoff.address, date });
    } catch (error) {
      toast.error(language === 'fr' ? 'Impossible de calculer le prix. Réessayez.' : 'Could not calculate price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers: write to safe refs when autocomplete provides coords
  const handlePickupChange = (data) => {
    if (data.latitude != null) {
      pickupSafeRef.current = { latitude: data.latitude, longitude: data.longitude, placeId: data.placeId, address: data.address };
    } else if (data.placeId) {
      pickupSafeRef.current = { ...pickupSafeRef.current, placeId: data.placeId, address: data.address };
    }
    setPickup(data);
  };
  const handleDropoffChange = (data) => {
    if (data.latitude != null) {
      dropoffSafeRef.current = { latitude: data.latitude, longitude: data.longitude, placeId: data.placeId, address: data.address };
    } else if (data.placeId) {
      dropoffSafeRef.current = { ...dropoffSafeRef.current, placeId: data.placeId, address: data.address };
    }
    setDropoff(data);
  };

  // Notification sound - short chime when AI response or new question
  const playNotifSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch { /* audio not available */ }
  };

  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Known vague terms (just city names, no street/landmark)
  const isVagueAddress = (text) => {
    const vague = ['paris', 'lyon', 'nice', 'marseille', 'bordeaux', 'lille', 'toulouse', 'nantes', 'strasbourg', 'rome', 'milan', 'barcelona', 'london', 'berlin', 'moscow', 'yerevan'];
    const lower = text.trim().toLowerCase();
    return vague.includes(lower) || lower.length < 5;
  };

  // Resolve an AI-filled address via Google Places AutocompleteService
  const resolveAIAddress = async (text, field) => {
    if (!text || text.length < 2) return;

    // If address is too vague (just a city name), ask for exact street
    if (isVagueAddress(text)) {
      const question = field === 'pickup' ? 'pickup_exact' : 'dropoff_exact';
      setGuidedStep(question);
      playNotifSound();
      return;
    }

    try {
      await loadGoogleMaps();
      const service = new window.google.maps.places.AutocompleteService();
      const predictions = await new Promise((resolve) => {
        service.getPlacePredictions({ input: text, types: ['establishment', 'geocode'] }, (results) => resolve(results || []));
      });
      if (predictions.length === 0) {
        // No results — ask for more details
        const question = field === 'pickup' ? 'pickup_exact' : 'dropoff_exact';
        setGuidedStep(question);
        playNotifSound();
        return;
      }
      if (predictions.length === 1 || predictions[0].description.toLowerCase().includes(text.toLowerCase().split(' ')[0])) {
        selectGoogleSuggestion(predictions[0], field);
        playNotifSound();
      } else {
        const opts = predictions.slice(0, 4).map(p => ({ placeId: p.place_id, description: p.description }));
        if (field === 'pickup') setPickupOptions(opts);
        else setDropoffOptions(opts);
        playNotifSound();
      }
    } catch { /* Google not loaded or API issue - fallback to geocode on submit */ }
  };

  const selectGoogleSuggestion = (prediction, field) => {
    const placeId = prediction.placeId || prediction.place_id;
    const desc = prediction.description;
    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({ placeId, fields: ['geometry', 'formatted_address'] }, (place) => {
        if (place?.geometry?.location) {
          const coords = { address: desc, latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng(), placeId };
          if (field === 'pickup') {
            setPickup(coords);
            pickupSafeRef.current = coords;
            setPickupOptions([]);
          } else {
            setDropoff(coords);
            dropoffSafeRef.current = coords;
            setDropoffOptions([]);
          }
        }
      });
    } catch { /* fallback to geocode on submit */ }
  };

  const applyAIFields = (d) => {
    setPickupOptions([]);
    setDropoffOptions([]);
    if (d.pickup) {
      setPickup({ address: d.pickup, latitude: null, longitude: null });
      resolveAIAddress(d.pickup, 'pickup');
    }
    if (d.dropoff) {
      setDropoff({ address: d.dropoff, latitude: null, longitude: null });
      resolveAIAddress(d.dropoff, 'dropoff');
    }
    if (d.date) setDate(d.date);
    if (d.time) setTime(d.time);
  };

  const handleAIParse = async (textOverride) => {
    const text = textOverride || aiText;
    if (!text.trim() || aiLoading) return;
    setAiLoading(true);
    setGuidedStep(null);
    try {
      const resp = await fetch(`${API}/api/booking/ai-parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale: language }),
      });
      const result = await resp.json();
      if (result.success) {
        applyAIFields(result.data);
        // Check vague addresses FIRST (higher priority than missing date/time)
        const d = result.data;
        const pickupVague = d.pickup && isVagueAddress(d.pickup);
        const dropoffVague = d.dropoff && isVagueAddress(d.dropoff);
        if (pickupVague) {
          setGuidedStep('pickup_exact');
          toast.info(language === 'fr' ? 'Précisez l\'adresse de départ' : 'Please specify the pickup address');
          playNotifSound();
        } else if (dropoffVague) {
          setGuidedStep('dropoff_exact');
          toast.info(language === 'fr' ? 'Précisez l\'adresse d\'arrivée' : 'Please specify the drop-off address');
          playNotifSound();
        } else if (result.confidence >= 0.8 && result.missing_fields.length === 0) {
          toast.success(language === 'fr' ? 'Formulaire rempli par l\'IA !' : 'Form filled by AI!');
          playNotifSound();
        } else {
          const steps = ['pickup', 'dropoff', 'date', 'time'];
          const missing = steps.find(s => result.missing_fields.includes(s));
          if (missing) {
            setGuidedStep(missing);
            toast.info(language === 'fr' ? 'Quelques infos manquantes...' : 'A few details needed...');
            playNotifSound();
          } else {
            toast.success(language === 'fr' ? 'Formulaire rempli !' : 'Form filled!');
            playNotifSound();
          }
        }
      } else {
        setGuidedStep('pickup');
        toast.info(language === 'fr' ? 'Decrivez votre trajet etape par etape' : 'Describe your trip step by step');
        playNotifSound();
      }
    } catch {
      toast.error(language === 'fr' ? 'Erreur de connexion IA.' : 'AI connection error.');
    } finally {
      setAiLoading(false);
    }
  };

  const guidedQuestions = {
    pickup: c.guidedPickup, dropoff: c.guidedDropoff, date: c.guidedDate, time: c.guidedTime,
    pickup_exact: language === 'fr' ? 'Précisez l\'adresse exacte (rue + numéro) :' : 'Enter the exact address (street + number):',
    dropoff_exact: language === 'fr' ? 'Précisez l\'adresse exacte (rue + numéro) :' : 'Enter the exact address (street + number):',
  };
  const guidedSuggestions = c.guidedSuggestions || {};

  const handleGuidedAnswer = (value) => {
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const fmt = (d) => d.toISOString().split('T')[0];

    playNotifSound();

    if (guidedStep === 'pickup' || guidedStep === 'pickup_exact') {
      setPickup({ address: value, latitude: null, longitude: null });
      resolveAIAddress(value, 'pickup');
      // Check if dropoff is also vague
      if (dropoff.address && isVagueAddress(dropoff.address)) setGuidedStep('dropoff_exact');
      else if (!dropoff.address) setGuidedStep('dropoff');
      else if (!date) setGuidedStep('date');
      else if (!time) setGuidedStep('time');
      else setGuidedStep(null);
    } else if (guidedStep === 'dropoff' || guidedStep === 'dropoff_exact') {
      setDropoff({ address: value, latitude: null, longitude: null });
      resolveAIAddress(value, 'dropoff');
      if (!date) setGuidedStep('date');
      else if (!time) setGuidedStep('time');
      else setGuidedStep(null);
    } else if (guidedStep === 'date') {
      const lower = value.toLowerCase();
      if (lower.includes('today') || lower.includes("aujourd")) setDate(fmt(now));
      else if (lower.includes('tomorrow') || lower.includes('demain') || lower.includes('завтра')) setDate(fmt(tomorrow));
      else setDate(value);
      setGuidedStep('time');
    } else if (guidedStep === 'time') {
      const lower = value.toLowerCase();
      if (lower.includes('9') || lower.includes('matin') || lower.includes('morning')) setTime('09:00');
      else if (lower.includes('14') || lower.includes('apr') || lower.includes('after')) setTime('14:00');
      else if (lower.includes('19') || lower.includes('soir') || lower.includes('even')) setTime('19:00');
      else setTime(value);
      setGuidedStep(null);
      toast.success(language === 'fr' ? 'Formulaire complet !' : 'Form complete!');
      playNotifSound();
    }
    setGuidedInput('');
  };

  const handleGuidedSubmit = () => {
    if (guidedInput.trim()) handleGuidedAnswer(guidedInput.trim());
  };

  // Voice for guided mode
  const startGuidedListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = language === 'fr' ? 'fr-FR' : language === 'ru' ? 'ru-RU' : 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setGuidedInput(transcript);
      setIsListening(false);
      // Auto-submit after voice
      setTimeout(() => handleGuidedAnswer(transcript), 200);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Web Speech API - Voice input
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported in this browser'); return; }
    const recognition = new SR();
    recognition.lang = language === 'fr' ? 'fr-FR' : language === 'ru' ? 'ru-RU' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setAiText(transcript);
      setIsListening(false);
      // Auto-trigger parse after voice
      setTimeout(() => handleAIParse(transcript), 100);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const handleRecentClick = async (search) => {
    if (!search.pickupCoords?.latitude || !search.dropoffCoords?.latitude) return;
    setLoading(true);
    try {
      const vehicles = await transferService.calculatePreorderPrice(search.pickupCoords, search.dropoffCoords);
      setVehicleResults(vehicles);
      startBooking({
        pickup: search.pickup,
        dropoff: search.dropoff,
        pickupCoords: search.pickupCoords,
        dropoffCoords: search.dropoffCoords,
        date: search.date || '',
        time: search.time || '',
      });
      navigate('/car-selection');
    } catch {
      toast.error(language === 'fr' ? 'Impossible de calculer le prix. Reessayez.' : 'Could not calculate price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getName = (d) => language === 'fr' ? d.nameFr : language === 'ru' ? d.nameRu : language === 'hy' ? (d.nameHy || d.nameEn) : language === 'es' ? (d.nameEs || d.nameEn) : d.nameEn;
  const getUrl = (d) => language === 'fr' ? d.urlFr : language === 'ru' ? d.urlRu : language === 'hy' ? (d.urlHy || d.urlEn) : language === 'es' ? (d.urlEs || d.urlEn) : d.urlEn;

  // Localized URL & description for JSON-LD (per language).
  // English uses the root domain (no /en prefix). French/Russian/Armenian/Spanish use /fr, /ru, /hy, /es respectively.
  const langPath = language === 'en' ? '' : `/${language}`;
  const pageUrl = `https://www.zont.cab${langPath}`;
  const searchUrl = `https://www.zont.cab${langPath}/search?q={search_term_string}`;
  const serviceTypeLocalized = (
    language === 'ru' ? 'Премиум трансфер из аэропорта с частным водителем' :
    language === 'fr' ? 'Transfert aeroport premium avec chauffeur prive' :
    language === 'hy' ? 'Պրեմիում օդանավակայանի տրանսֆեր մասնավոր վարորդով' :
    language === 'es' ? 'Traslado aeropuerto premium con chófer privado' :
    'Premium airport transfer with private chauffeur'
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="home-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical={`https://www.zont.cab${homeSeoUrls[language] || homeSeoUrls.en}`}
        ogImage="https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format"
        hreflang={[
          { lang: 'fr', href: 'https://www.zont.cab/' },
          { lang: 'en', href: 'https://www.zont.cab/' },
          { lang: 'ru', href: 'https://www.zont.cab/' },
          { lang: 'hy', href: 'https://www.zont.cab/' },
          { lang: 'es', href: 'https://www.zont.cab/es' },
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Zont",
            "url": pageUrl,
            "logo": "https://www.zont.cab/logo.png",
            "description": c.seoDesc,
            "contactPoint": { "@type": "ContactPoint", "telephone": "+33783777027", "contactType": "customer service", "availableLanguage": ["French", "English", "Russian", "Armenian", "Spanish"] },
            "sameAs": ["https://apps.apple.com/am/app/zont-cab/id1468482270", "https://play.google.com/store/apps/details?id=com.zont.rider"]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Zont",
            "url": pageUrl,
            "inLanguage": language,
            "potentialAction": { "@type": "SearchAction", "target": searchUrl, "query-input": "required name=search_term_string" }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": c.seoTitle,
            "url": pageUrl,
            "inLanguage": language,
            "description": c.seoDesc
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": serviceTypeLocalized,
            "description": c.seoDesc,
            "provider": { "@type": "Organization", "name": "Zont", "url": pageUrl },
            "areaServed": { "@type": "Country", "name": "Europe" }
          },
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Zont",
            "url": pageUrl,
            "description": c.seoDesc,
            "areaServed": "Europe",
            "priceRange": "€€"
          }
        ]}
      />
      <Header />

      <main className="flex-1 pt-16">
        {/* HERO + BOOKING */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <img src={IMAGES.hero} alt="Premium airport transfer Mercedes" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/60 via-[#1a2332]/40 to-[#1a2332]/90"></div>
          </div>
          <div className="relative z-10 px-4 pt-8 pb-12 md:pt-16 md:pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left */}
                <div className="text-center lg:text-left bg-[#1a2332]/70 backdrop-blur-sm rounded-2xl p-6 lg:p-8">
                  <div className="flex justify-center lg:justify-start mb-4">
                    <button onClick={() => document.getElementById('tripadvisor-reviews')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#2ecc71]/20 text-[#2ecc71] px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center cursor-pointer hover:bg-[#2ecc71]/30 transition-colors" data-testid="home-trust-badge">
                      <Star className="w-4 h-4 fill-current mr-1.5" aria-hidden="true" />4.5/5 Tripadvisor - 29 {language === 'fr' ? 'avis' : language === 'ru' ? 'отзывов' : language === 'hy' ? 'կարծիք' : language === 'es' ? 'opiniones' : 'reviews'}
                    </button>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight" data-testid="home-hero-title">
                    {(cmsHomepage?.title?.[language]) || c.heroTitle}
                  </h1>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2ecc71] mb-4">{c.heroAccent}</h2>
                  <p className="text-base md:text-lg text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0">{(cmsHomepage?.subtitle?.[language]) || c.heroSub}</p>

                  {/* Trust Stats - Dynamic from CMS */}
                  <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto lg:mx-0">
                    {(() => {
                      const fallbackStats = [
                        { val: c.stats.trips, lbl: c.stats.tripsLabel },
                        { val: c.stats.cities, lbl: c.stats.citiesLabel },
                        { val: c.stats.available, lbl: c.stats.availableLabel },
                        { val: c.stats.rating, lbl: c.stats.ratingLabel },
                      ];
                      const hasCmsForCurrentLang =
                        cmsHomepage?.stats?.length > 0 &&
                        cmsHomepage.stats.every(s => s.label?.[language]);
                      const items = hasCmsForCurrentLang
                        ? cmsHomepage.stats.map(s => ({ val: s.value, lbl: s.label[language] }))
                        : fallbackStats;
                      return items.map((s, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
                          <div className="text-lg font-bold text-[#2ecc71]">{s.val}</div>
                          <div className="text-[10px] text-gray-400">{s.lbl}</div>
                        </div>
                      ));
                    })()}
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
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 text-center">{c.bookingTitle}</h2>
                    {/* Mode switch: Transfer vs Driver at disposal */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg mb-3" role="tablist" aria-label="Booking mode">
                      <button
                        type="button"
                        onClick={() => setMode('transfer')}
                        className={`py-2 rounded-md text-xs md:text-sm font-semibold transition-all ${mode === 'transfer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        role="tab"
                        aria-selected={mode === 'transfer'}
                        data-testid="mode-transfer-tab"
                      >
                        {c.tabTransfer}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('disposal')}
                        className={`py-2 rounded-md text-xs md:text-sm font-semibold transition-all ${mode === 'disposal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        role="tab"
                        aria-selected={mode === 'disposal'}
                        data-testid="mode-disposal-tab"
                      >
                        {c.tabDisposal}
                      </button>
                    </div>
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
                        {pickupOptions.length > 0 && (
                          <div className="mt-1 bg-white rounded-lg border border-[#2ecc71]/30 shadow-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]" data-testid="pickup-suggestions">
                            <p className="px-3 py-1.5 text-[10px] font-semibold text-[#2ecc71] uppercase tracking-wide bg-[#2ecc71]/5">{language === 'fr' ? 'Choisissez l\'adresse exacte' : 'Choose exact address'}</p>
                            {pickupOptions.map((opt, i) => (
                              <button key={i} type="button" onClick={() => selectGoogleSuggestion(opt, 'pickup')}
                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#2ecc71]/10 border-t border-gray-50 flex items-center gap-2 transition-colors"
                                data-testid={`pickup-opt-${i}`}>
                                <MapPin className="w-3 h-3 text-[#2ecc71] shrink-0" /><span className="truncate">{opt.description}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={mode === 'disposal' ? 'hidden' : ''}>
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
                        {dropoffOptions.length > 0 && (
                          <div className="mt-1 bg-white rounded-lg border border-[#2ecc71]/30 shadow-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]" data-testid="dropoff-suggestions">
                            <p className="px-3 py-1.5 text-[10px] font-semibold text-[#2ecc71] uppercase tracking-wide bg-[#2ecc71]/5">{language === 'fr' ? 'Choisissez l\'adresse exacte' : 'Choose exact address'}</p>
                            {dropoffOptions.map((opt, i) => (
                              <button key={i} type="button" onClick={() => selectGoogleSuggestion(opt, 'dropoff')}
                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#2ecc71]/10 border-t border-gray-50 flex items-center gap-2 transition-colors"
                                data-testid={`dropoff-opt-${i}`}>
                                <MapPin className="w-3 h-3 text-red-400 shrink-0" /><span className="truncate">{opt.description}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {mode === 'disposal' && (
                        <div data-testid="home-hours-block">
                          <label className="block text-gray-700 font-medium text-sm mb-1">{c.hoursLabel}</label>
                          <div className="grid grid-cols-5 gap-2">
                            {[2, 3, 4, 5, 6].map(h => (
                              <button
                                key={h}
                                type="button"
                                onClick={() => setHours(h)}
                                className={`py-3 rounded-lg border-2 font-bold text-sm transition ${hours === h ? 'border-[#2ecc71] bg-green-50 text-[#2ecc71]' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                                data-testid={`home-hours-${h}`}
                              >
                                {h}h
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
                      <LastMinuteWarning date={date} time={time} />
                      <button type="submit" disabled={loading}
                        className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-bold text-base hover:bg-[#27ae60] transition-colors uppercase tracking-wide shadow-lg shadow-[#2ecc71]/30"
                        data-testid="home-submit-btn">
                        {loading ? c.searching : (mode === 'disposal' ? c.tabDisposal : c.bookNow)}
                      </button>
                    </form>
                    <div className="flex items-center justify-center space-x-3 mt-3 pt-3 border-t border-gray-100">
                      <Shield className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span className="text-xs text-gray-400">Visa</span>
                      <span className="text-xs text-gray-400">Mastercard</span>
                      <span className="text-xs text-gray-400">PayPal</span>
                      <span className="text-xs text-gray-400">Apple Pay</span>
                    </div>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100" data-testid="recent-searches-section">
                        <p className="text-xs font-bold text-[#2ecc71] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />{c.recentTitle}
                        </p>
                        <div className="space-y-2">
                          {recentSearches.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleRecentClick(s)}
                              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#2ecc71]/5 hover:bg-[#2ecc71]/15 border border-[#2ecc71]/20 hover:border-[#2ecc71]/50 transition-all text-left group shadow-sm hover:shadow-md"
                              data-testid={`recent-search-${i}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-[#2ecc71]/15 flex items-center justify-center shrink-0 group-hover:bg-[#2ecc71]/25 transition-colors">
                                <MapPin className="w-4 h-4 text-[#2ecc71]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 truncate">{s.pickup}</p>
                                <p className="text-xs text-[#27ae60] truncate flex items-center gap-1 mt-0.5">
                                  <ArrowRight className="w-3 h-3 shrink-0" />{s.dropoff}
                                </p>
                                {(s.date || s.time) && (
                                  <p className="text-[10px] text-gray-400 mt-0.5">{s.date}{s.date && s.time ? ' · ' : ''}{s.time}</p>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#2ecc71]/50 group-hover:text-[#2ecc71] shrink-0 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Booking Block — placed BELOW the white reservation card */}
                  <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15" data-testid="ai-booking-block">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-[#2ecc71]/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-[#2ecc71]" />
                      </div>
                      <p className="text-white font-semibold text-sm">{c.aiTitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0 relative">
                        <input
                          type="text"
                          value={aiText}
                          onChange={(e) => setAiText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAIParse()}
                          placeholder={c.aiPlaceholder}
                          className="w-full px-3 py-2.5 pr-10 bg-white/10 text-white placeholder-gray-400 rounded-lg border border-white/15 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-xs outline-none"
                          data-testid="ai-text-input"
                        />
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'text-gray-400 hover:text-[#2ecc71]'}`}
                          data-testid="ai-mic-btn"
                          title="Voice input"
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAIParse()}
                        disabled={aiLoading || !aiText.trim()}
                        className="px-4 py-2.5 bg-[#2ecc71] text-white rounded-lg font-bold text-xs hover:bg-[#27ae60] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                        data-testid="ai-auto-btn"
                      >
                        {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {aiLoading ? c.aiLoading.split(' ')[0] : c.aiBtn}
                      </button>
                    </div>

                    {/* Guided Mode - ONE question at a time */}
                    {guidedStep && (
                      <div className="mt-3 pt-3 border-t border-white/10 animate-[fadeIn_0.3s_ease-out]" data-testid="guided-mode">
                        <p className="text-white/90 text-xs font-medium mb-2">{guidedQuestions[guidedStep]}</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {(guidedSuggestions[guidedStep] || []).map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleGuidedAnswer(s)}
                              className="px-3 py-1.5 bg-white/10 text-white text-xs rounded-full border border-white/15 hover:bg-[#2ecc71]/20 hover:border-[#2ecc71]/40 transition-all"
                              data-testid={`guided-btn-${i}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 min-w-0 relative">
                            <input
                              type="text"
                              value={guidedInput}
                              onChange={(e) => setGuidedInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleGuidedSubmit()}
                              placeholder={guidedStep?.includes('exact') ? '12 Rue de Rivoli, Paris' : '...'}
                              className="w-full px-3 py-2 pr-9 bg-white/10 text-white placeholder-gray-400 rounded-lg border border-white/15 focus:border-[#2ecc71] text-xs outline-none"
                              data-testid="guided-input"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={isListening ? stopListening : startGuidedListening}
                              className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-all ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'text-gray-400 hover:text-[#2ecc71]'}`}
                              data-testid="guided-mic-btn"
                            >
                              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleGuidedSubmit}
                            disabled={!guidedInput.trim()}
                            className="px-3 py-2 bg-[#2ecc71] text-white rounded-lg text-xs font-bold hover:bg-[#27ae60] disabled:opacity-50 transition-colors"
                            data-testid="guided-submit"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    )}
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

        {/* Download App Section */}
        <section className="py-16 px-4 bg-[#0a0f16]" data-testid="app-download-section">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-[#1a2332] to-[#0f1923] border border-gray-700/50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[#2ecc71]/10 text-[#2ecc71] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#2ecc71]/20 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  GPS TRACKING
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{c.appTitle || 'Track Your Booking in Real Time'}</h2>
                <p className="text-gray-400 text-sm md:text-base mb-6 leading-relaxed">{c.appSubtitle || 'Download the Zont app'}</p>
                <div className="flex flex-col gap-2.5 mb-8">
                  <div className="flex items-center gap-2.5 text-sm text-gray-300 justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 text-[#2ecc71] flex-shrink-0" />
                    {c.appFeature1 || 'Live driver tracking'}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-300 justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 text-[#2ecc71] flex-shrink-0" />
                    {c.appFeature2 || 'Instant booking confirmations'}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-300 justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 text-[#2ecc71] flex-shrink-0" />
                    {c.appFeature3 || 'Manage reservations anywhere'}
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <a href="https://apps.apple.com/am/app/zont-cab/id1468482270" target="_blank" rel="noopener noreferrer" data-testid="app-store-badge">
                    <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="h-11 hover:opacity-80 transition-opacity" />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.zont.rider" target="_blank" rel="noopener noreferrer" data-testid="google-play-badge">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-11 hover:opacity-80 transition-opacity" />
                  </a>
                </div>
              </div>
              <div className="flex-shrink-0 w-48 md:w-56">
                <div className="bg-gradient-to-b from-[#2ecc71]/10 to-transparent rounded-3xl p-4 border border-[#2ecc71]/10">
                  <div className="bg-[#0f1923] rounded-2xl p-4 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-[#2ecc71] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2ecc71]/20">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-white font-bold text-lg">Zont</div>
                    <div className="text-gray-500 text-xs text-center">Transfer & Taxi</div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <div className="text-gray-500 text-xs">4.8 / 5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.popularTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {popularDest.map((d, i) => (
                <Link key={i} to={getUrl(d)} className="group bg-[#0f1419] rounded-xl overflow-hidden border border-gray-700 hover:border-[#2ecc71] transition-all" data-testid={`popular-dest-${i}`}>
                  <div className="h-24 md:h-32 overflow-hidden">
                    <img src={d.urlFr.includes('disneyland') ? '/images/disneyland.webp' : d.urlFr.includes('nice') ? '/images/nice-transfer.webp' : i === 0 ? IMAGES.cdgDriver : i % 2 === 0 ? IMAGES.sedan : IMAGES.airport} alt={getName(d)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
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
                {language === 'fr' ? 'Voir les 16 destinations' : language === 'ru' ? 'Все 16 направлений' : language === 'hy' ? 'Տեսնել բոլոր 16 ուղղությունները' : 'View all 16 destinations'} <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Trust - Dynamic from CMS */}
        <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{c.trustTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {(() => {
                const fallbackBlocks = [
                  { icon: <CheckCircle className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f1Title, d: c.f1Desc },
                  { icon: <Plane className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f2Title, d: c.f2Desc },
                  { icon: <Shield className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f3Title, d: c.f3Desc },
                  { icon: <CreditCard className="w-10 h-10 text-[#2ecc71]" aria-hidden="true" />, t: c.f4Title, d: c.f4Desc },
                ];
                const hasCmsForCurrentLang =
                  cmsTrustBlocks?.length > 0 &&
                  cmsTrustBlocks.slice(0, 4).every(b => b.title?.[language] && b.text?.[language]);
                const blocks = hasCmsForCurrentLang
                  ? cmsTrustBlocks.slice(0, 4).map(block => ({
                      icon: block.icon === 'plane' ? <Plane className="w-10 h-10 text-[#2ecc71]" /> :
                            block.icon === 'clock' ? <Clock className="w-10 h-10 text-[#2ecc71]" /> :
                            block.icon === 'star' ? <Shield className="w-10 h-10 text-[#2ecc71]" /> :
                            block.icon === 'shield' ? <CreditCard className="w-10 h-10 text-[#2ecc71]" /> :
                            block.icon === 'credit-card' ? <CreditCard className="w-10 h-10 text-[#2ecc71]" /> :
                            <CheckCircle className="w-10 h-10 text-[#2ecc71]" />,
                      t: block.title[language],
                      d: block.text[language],
                    }))
                  : fallbackBlocks;
                return blocks.map((f, i) => (
                  <div key={i} className="bg-[#1a2332] rounded-xl p-5 border border-gray-700">
                    <div className="mb-3">{f.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{f.t}</h3>
                    <p className="text-gray-400 text-sm">{f.d}</p>
                  </div>
                ));
              })()}
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

        {/* CLIENT REVIEWS - Real verified reviews */}
        {homeReviews.length > 0 && (
          <section className="py-12 md:py-20 px-4 bg-[#0f1419]" data-testid="home-client-reviews">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{c.reviewsTitle}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homeReviews.slice(0, 6).map((review, i) => (
                  <div key={i} className="bg-[#1a2332] border border-white/10 rounded-xl p-5" data-testid={`home-review-${i}`}>
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

        {/* Reviews - TripAdvisor */}
        <section id="tripadvisor-reviews" className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.reviewsTitle}</h2>
            <TripAdvisorReviews />
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
