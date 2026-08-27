import React from 'react';
import { Link } from 'react-router-dom';
import CityTransferPage from '@/components/CityTransferPage';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  en: {
    title: 'Marseille Airport Transfer & Private Chauffeur | ZONT',
    h1: 'Marseille Airport Transfer & Private Chauffeur Service',
    subtitle: 'Fixed prices, flight tracking and 24/7 private transfers across Marseille and Provence',
    description: 'Book a reliable private transfer in Marseille with ZONT. Our professional chauffeur service is available for airport arrivals and departures, train stations, cruise terminals, hotels, business trips and private journeys throughout Marseille and Provence. Every transfer includes a fixed price confirmed at booking, a professional driver and a vehicle adapted to the number of passengers and luggage.',
    description2: 'Travel between Marseille Provence Airport (MRS) and Marseille with a professional private chauffeur. Our Marseille airport transfer service includes flight monitoring, personalized airport pickup, assistance with luggage and 24/7 availability. Book your transfer in advance and know your price before your journey — no meters, no surprises, whether you arrive at Terminal 1 or Terminal 2 of Marseille Provence Airport.',
    description3: 'Arriving at or departing from the Marseille cruise terminals? ZONT provides private transfers between the cruise port, Marseille Provence Airport, hotels, Saint-Charles train station and destinations throughout Provence. You can also hire a private chauffeur in Marseille for several hours or a full day — ideal for business travel, meetings, events, shopping, tourism, private excursions and long-distance journeys to Aix-en-Provence, Cassis, Saint-Tropez or Nice.',
    whyChoose: 'Why Choose Our Marseille Airport Transfer?',
    feature1Title: 'Meet & Greet', feature1Desc: 'Personalized pickup at Marseille Provence Airport arrivals with a name sign and luggage assistance.',
    feature2Title: 'Flight Tracking', feature2Desc: 'We monitor your flight in real time. Your chauffeur adapts to delays at no extra charge.',
    feature3Title: 'Professional Chauffeurs', feature3Desc: 'Experienced private drivers covering Marseille, the cruise port, Saint-Charles station and all Provence.',
    feature4Title: 'Fixed Prices', feature4Desc: 'Your price is confirmed at booking. No meters, no surprises.',
    sedan: 'Standard Car', sedanDesc: '1-3 passengers, ideal for airport transfers', luxury: 'Luxury Sedan', luxuryDesc: 'Premium sedan for business travel',
    minivan: 'Luxury Van', minivanDesc: 'Up to 6 passengers with luggage', minibus: 'Minivan 8 pers.', minibusDesc: 'Up to 8 passengers, groups & families',
    passengers: 'Passengers', luggage: 'Luggage', bookNow: 'BOOK NOW', allInclusive: 'All inclusive',
    vehiclesTitle: 'Choose Your Vehicle',
    howItWorks: 'How It Works', step1: 'Book Online', step1Desc: 'Enter your flight details and Marseille address. Instant confirmation.',
    step2: 'Meet Your Chauffeur', step2Desc: 'Your driver greets you at Marseille Provence Airport arrivals, the cruise port or Saint-Charles station.',
    step3: 'Enjoy the Ride', step3Desc: 'Comfortable private transfer to your destination in Marseille or Provence.',
    popularRoutesTitle: 'Popular Transfers from Marseille', fromLabel: 'From',
    routes: [
      { name: 'Marseille Airport (MRS) → Marseille' },
      { name: 'Marseille → Marseille Airport (MRS)' },
      { name: 'Marseille Airport → Aix-en-Provence' },
      { name: 'Marseille Airport → Cassis' },
      { name: 'Marseille → Aix-en-Provence' },
      { name: 'Marseille → Cassis' },
      { name: 'Marseille → Saint-Tropez' },
      { name: 'Marseille → Nice' },
      { name: 'Marseille Cruise Port → Airport' },
      { name: 'Marseille Cruise Port → Hotel' },
      { name: 'Marseille Saint-Charles → Airport' },
    ],
    bookingForm: 'Book Your Marseille Transfer',
    pickupLabel: 'Pick up', dropoffLabel: 'Drop off', dateLabel: 'Date', timeLabel: 'Time',
    defaultPickup: 'Marseille Provence Airport (MRS)',
    otherCitiesTitle: 'We also serve other cities', otherCitiesBtn: 'View All Destinations',
    rating: '4.5/5 Tripadvisor',
  },
  fr: {
    title: 'Transfert Aéroport Marseille & Chauffeur Privé | ZONT',
    h1: 'Transfert Aéroport Marseille & Chauffeur Privé',
    subtitle: 'Prix fixes, suivi des vols et transferts privés 24h/24 à Marseille et en Provence',
    description: 'Réservez un transfert privé fiable à Marseille avec ZONT. Notre service de chauffeur privé est disponible pour vos arrivées et départs à l\'aéroport, les gares, les terminaux de croisière, les hôtels, les déplacements professionnels et les trajets privés dans tout Marseille et la Provence. Chaque transfert inclut un prix fixe confirmé à la réservation, un chauffeur professionnel et un véhicule adapté au nombre de passagers et de bagages.',
    description2: 'Réservez votre transfert privé depuis ou vers l\'aéroport Marseille Provence (MRS). Votre chauffeur suit votre vol en temps réel et organise votre prise en charge à votre arrivée, avec assistance bagages et disponibilité 24h/24. Réservez à l\'avance et connaissez votre prix avant le trajet — sans compteur, sans surprise, que vous arriviez au Terminal 1 ou au Terminal 2.',
    description3: 'Vous arrivez ou partez du port de croisière de Marseille ? ZONT assure vos transferts privés entre le port de croisière, l\'aéroport Marseille Provence, votre hôtel et la gare Marseille Saint-Charles. Vous pouvez aussi réserver un chauffeur privé à Marseille pour plusieurs heures ou à la journée — idéal pour vos déplacements professionnels, réunions, événements, shopping, tourisme, excursions privées et trajets longue distance vers Aix-en-Provence, Cassis, La Ciotat, Avignon, Toulon, Saint-Tropez, Cannes ou Nice.',
    whyChoose: 'Pourquoi Choisir Notre Transfert Aéroport Marseille ?',
    feature1Title: 'Accueil Personnalisé', feature1Desc: 'Prise en charge personnalisée aux arrivées de l\'aéroport Marseille Provence avec pancarte et aide aux bagages.',
    feature2Title: 'Suivi des Vols', feature2Desc: 'Nous suivons votre vol en temps réel. Votre chauffeur s\'adapte aux retards sans supplément.',
    feature3Title: 'Chauffeurs Professionnels', feature3Desc: 'VTC expérimentés couvrant Marseille, le port de croisière, la gare Saint-Charles et toute la Provence.',
    feature4Title: 'Prix Fixes', feature4Desc: 'Votre prix est confirmé à la réservation. Sans compteur, sans surprise.',
    sedan: 'Berline Standard', sedanDesc: '1-3 passagers, idéal transfert aéroport', luxury: 'Berline de Luxe', luxuryDesc: 'Berline premium pour vos déplacements professionnels',
    minivan: 'Van de Luxe', minivanDesc: 'Jusqu\'à 6 passagers avec bagages', minibus: 'Minivan 8 pers.', minibusDesc: 'Jusqu\'à 8 passagers, groupes et familles',
    passengers: 'Passagers', luggage: 'Bagages', bookNow: 'RÉSERVER', allInclusive: 'Tout compris',
    vehiclesTitle: 'Choisissez Votre Véhicule',
    howItWorks: 'Comment Ça Marche', step1: 'Réservez en Ligne', step1Desc: 'Entrez les détails de votre vol et votre adresse à Marseille. Confirmation instantanée.',
    step2: 'Rencontrez Votre Chauffeur', step2Desc: 'Votre chauffeur vous accueille aux arrivées de l\'aéroport Marseille Provence, au port de croisière ou à la gare Saint-Charles.',
    step3: 'Profitez du Trajet', step3Desc: 'Transfert privé confortable vers votre destination à Marseille ou en Provence.',
    popularRoutesTitle: 'Transferts Populaires depuis Marseille', fromLabel: 'À partir de',
    routes: [
      { name: 'Aéroport Marseille (MRS) → Marseille' },
      { name: 'Marseille → Aéroport Marseille (MRS)' },
      { name: 'Aéroport Marseille → Aix-en-Provence' },
      { name: 'Aéroport Marseille → Cassis' },
      { name: 'Marseille → Aix-en-Provence' },
      { name: 'Marseille → Cassis' },
      { name: 'Marseille → Saint-Tropez' },
      { name: 'Marseille → Nice' },
      { name: 'Port de Croisière Marseille → Aéroport' },
      { name: 'Port de Croisière Marseille → Hôtel' },
      { name: 'Gare Saint-Charles → Aéroport' },
    ],
    bookingForm: 'Réservez Votre Transfert Marseille',
    pickupLabel: 'Départ', dropoffLabel: 'Destination', dateLabel: 'Date', timeLabel: 'Heure',
    defaultPickup: 'Aéroport Marseille Provence (MRS)',
    otherCitiesTitle: 'Nous desservons aussi d\'autres villes', otherCitiesBtn: 'Voir Toutes les Destinations',
    rating: '4.5/5 Tripadvisor',
  },
  ru: {
    title: 'Трансфер в Марселе и аэропорт Марсель | ZONT',
    h1: 'Трансфер в Марселе и из аэропорта Марсель-Прованс',
    subtitle: 'Фиксированные цены, отслеживание рейсов и частные трансферы 24/7 по Марселю и Провансу',
    description: 'Закажите надёжный трансфер в Марселе с частным водителем ZONT. Мы встречаем в аэропорту, на вокзале и в круизном порту, обслуживаем отели, деловые поездки и частные маршруты по Марселю и всему Провансу. Каждая поездка — по фиксированной цене, подтверждённой при бронировании, с профессиональным водителем и автомобилем, подобранным под число пассажиров и багаж.',
    description2: 'Трансфер между аэропортом Марсель-Прованс (MRS) и городом — с личным водителем. Мы отслеживаем ваш рейс в реальном времени, встречаем в зале прилёта с табличкой, помогаем с багажом и работаем круглосуточно. Бронируйте заранее и знайте цену до поездки — без счётчика и доплат, независимо от терминала прилёта.',
    description3: 'Прибываете в круизный порт Марселя или отправляетесь из него? ZONT организует частные трансферы между круизным терминалом, аэропортом Марсель-Прованс, отелем и вокзалом Marseille Saint-Charles. Также можно заказать водителя на несколько часов или на целый день — для деловых встреч, мероприятий, шопинга, экскурсий и дальних поездок в Экс-ан-Прованс, Кассис, Сен-Тропе, Канны или Ниццу. Возможен русскоязычный водитель по запросу.',
    whyChoose: 'Почему выбирают наш трансфер в Марселе?',
    feature1Title: 'Встреча в аэропорту', feature1Desc: 'Личная встреча в зале прилёта аэропорта Марсель-Прованс с табличкой и помощью с багажом.',
    feature2Title: 'Отслеживание рейса', feature2Desc: 'Следим за вашим рейсом в реальном времени. При задержке водитель ждёт без доплаты.',
    feature3Title: 'Профессиональные водители', feature3Desc: 'Опытные частные водители по Марселю, круизному порту, вокзалу Saint-Charles и всему Провансу.',
    feature4Title: 'Фиксированные цены', feature4Desc: 'Цена подтверждается при бронировании. Без счётчика и скрытых доплат.',
    sedan: 'Стандартный седан', sedanDesc: '1-3 пассажира, идеально для аэропорта', luxury: 'Люкс седан', luxuryDesc: 'Премиальный седан для деловых поездок',
    minivan: 'Люкс минивэн', minivanDesc: 'До 6 пассажиров с багажом', minibus: 'Минивэн 8 мест', minibusDesc: 'До 8 пассажиров, группы и семьи',
    passengers: 'Пассажиры', luggage: 'Багаж', bookNow: 'ЗАБРОНИРОВАТЬ', allInclusive: 'Всё включено',
    vehiclesTitle: 'Выберите автомобиль',
    howItWorks: 'Как это работает', step1: 'Бронируйте онлайн', step1Desc: 'Укажите данные рейса и адрес в Марселе. Мгновенное подтверждение.',
    step2: 'Встреча с водителем', step2Desc: 'Водитель встречает вас в аэропорту Марсель-Прованс, круизном порту или на вокзале Saint-Charles.',
    step3: 'Комфортная поездка', step3Desc: 'Частный трансфер до вашего адреса в Марселе или по Провансу.',
    popularRoutesTitle: 'Популярные маршруты из Марселя', fromLabel: 'От',
    routes: [
      { name: 'Аэропорт Марсель (MRS) → Марсель' },
      { name: 'Марсель → Аэропорт Марсель (MRS)' },
      { name: 'Аэропорт Марсель → Экс-ан-Прованс' },
      { name: 'Аэропорт Марсель → Кассис' },
      { name: 'Марсель → Экс-ан-Прованс' },
      { name: 'Марсель → Кассис' },
      { name: 'Марсель → Сен-Тропе' },
      { name: 'Марсель → Ницца' },
      { name: 'Круизный порт Марселя → Аэропорт' },
      { name: 'Круизный порт Марселя → Отель' },
      { name: 'Вокзал Saint-Charles → Аэропорт' },
    ],
    bookingForm: 'Забронируйте трансфер в Марселе',
    pickupLabel: 'Откуда', dropoffLabel: 'Куда', dateLabel: 'Дата', timeLabel: 'Время',
    defaultPickup: 'Аэропорт Марсель-Прованс (MRS)',
    otherCitiesTitle: 'Другие города', otherCitiesBtn: 'Все направления',
    rating: '4.5/5 Tripadvisor',
  },
  es: {
    title: 'Traslado Aeropuerto Marsella y Chófer Privado | ZONT',
    h1: 'Traslado Aeropuerto Marsella y Servicio de Chófer Privado',
    subtitle: 'Precios fijos, seguimiento de vuelos y traslados privados 24/7 en Marsella y Provenza',
    description: 'Reserva un traslado privado fiable en Marsella con ZONT. Nuestro servicio de chófer profesional está disponible para llegadas y salidas del aeropuerto, estaciones de tren, terminales de crucero, hoteles, viajes de negocios y trayectos privados por toda Marsella y la Provenza. Cada traslado incluye precio fijo confirmado al reservar, conductor profesional y un vehículo adaptado al número de pasajeros y equipaje.',
    description2: 'Viaja entre el aeropuerto Marsella-Provenza (MRS) y Marsella con un chófer privado profesional. Nuestro servicio incluye seguimiento del vuelo, recogida personalizada en el aeropuerto, ayuda con el equipaje y disponibilidad 24/7. Reserva con antelación y conoce tu precio antes del viaje — sin taxímetro ni sorpresas.',
    description3: '¿Llegas o sales de las terminales de crucero de Marsella? ZONT ofrece traslados privados entre el puerto de cruceros, el aeropuerto Marsella-Provenza, hoteles y la estación Marseille Saint-Charles. También puedes contratar un chófer privado en Marsella por horas o para el día completo — ideal para negocios, reuniones, eventos, compras, turismo, excursiones privadas y trayectos de larga distancia a Aix-en-Provence, Cassis, Saint-Tropez o Niza.',
    whyChoose: '¿Por qué elegir nuestro traslado en Marsella?',
    feature1Title: 'Recepción Personalizada', feature1Desc: 'Recogida personalizada en llegadas del aeropuerto Marsella-Provenza con cartel y ayuda con el equipaje.',
    feature2Title: 'Seguimiento de Vuelo', feature2Desc: 'Monitorizamos tu vuelo en tiempo real. El chófer se adapta a los retrasos sin coste extra.',
    feature3Title: 'Chóferes Profesionales', feature3Desc: 'Conductores privados con experiencia en Marsella, el puerto de cruceros, Saint-Charles y toda la Provenza.',
    feature4Title: 'Precios Fijos', feature4Desc: 'Tu precio se confirma al reservar. Sin taxímetro ni sorpresas.',
    sedan: 'Berlina Estándar', sedanDesc: '1-3 pasajeros, ideal para el aeropuerto', luxury: 'Berlina de Lujo', luxuryDesc: 'Berlina premium para viajes de negocios',
    minivan: 'Van de Lujo', minivanDesc: 'Hasta 6 pasajeros con equipaje', minibus: 'Minivan 8 plazas', minibusDesc: 'Hasta 8 pasajeros, grupos y familias',
    passengers: 'Pasajeros', luggage: 'Equipaje', bookNow: 'RESERVAR', allInclusive: 'Todo incluido',
    vehiclesTitle: 'Elige tu Vehículo',
    howItWorks: 'Cómo Funciona', step1: 'Reserva Online', step1Desc: 'Introduce los datos de tu vuelo y tu dirección en Marsella. Confirmación instantánea.',
    step2: 'Encuentra a tu Chófer', step2Desc: 'Tu conductor te recibe en llegadas del aeropuerto Marsella-Provenza, el puerto de cruceros o la estación Saint-Charles.',
    step3: 'Disfruta del Viaje', step3Desc: 'Traslado privado y cómodo hasta tu destino en Marsella o la Provenza.',
    popularRoutesTitle: 'Traslados Populares desde Marsella', fromLabel: 'Desde',
    routes: [
      { name: 'Aeropuerto Marsella (MRS) → Marsella' },
      { name: 'Marsella → Aeropuerto Marsella (MRS)' },
      { name: 'Aeropuerto Marsella → Aix-en-Provence' },
      { name: 'Aeropuerto Marsella → Cassis' },
      { name: 'Marsella → Aix-en-Provence' },
      { name: 'Marsella → Cassis' },
      { name: 'Marsella → Saint-Tropez' },
      { name: 'Marsella → Niza' },
      { name: 'Puerto de Cruceros Marsella → Aeropuerto' },
      { name: 'Puerto de Cruceros Marsella → Hotel' },
      { name: 'Estación Saint-Charles → Aeropuerto' },
    ],
    bookingForm: 'Reserva tu Traslado en Marsella',
    pickupLabel: 'Recogida', dropoffLabel: 'Destino', dateLabel: 'Fecha', timeLabel: 'Hora',
    defaultPickup: 'Aeropuerto Marsella-Provenza (MRS)',
    otherCitiesTitle: 'También servimos otras ciudades', otherCitiesBtn: 'Ver Todos los Destinos',
    rating: '4.5/5 Tripadvisor',
  },
};
content.hy = content.en;

const seoDescriptions = {
  en: 'Book a private Marseille airport transfer with a professional chauffeur. Fixed prices, 24/7 service, flight tracking and private transfers across Marseille and Provence.',
  fr: 'Réservez votre transfert aéroport Marseille avec chauffeur privé. Prix fixe, service 24h/24, suivi des vols et transferts privés à Marseille et en Provence.',
  ru: 'Закажите трансфер из аэропорта Марселя с частным водителем. Фиксированная цена, встреча в аэропорту, отслеживание рейса и сервис 24/7.',
  es: 'Reserva tu traslado privado desde el aeropuerto de Marsella. Chófer profesional, precio fijo, seguimiento de vuelo y servicio 24/7 en Marsella y Provenza.',
};

const faqs = {
  en: [
    { q: 'How do I book a Marseille Airport transfer?', a: 'Use the booking form at the top of this page: enter your pickup point (for example Marseille Provence Airport), your destination, the date and time, then choose your vehicle. You receive instant confirmation with a fixed price.' },
    { q: 'Where will my chauffeur meet me at Marseille Airport?', a: 'Your chauffeur waits for you in the arrivals hall of Marseille Provence Airport with a sign showing your name, and helps you with your luggage to the vehicle.' },
    { q: 'What happens if my flight is delayed?', a: 'We track your flight in real time. If your flight is delayed, your chauffeur adjusts the pickup time automatically — at no extra charge.' },
    { q: 'Can I book a minivan in Marseille?', a: 'Yes. We offer minivans for up to 8 passengers with luggage — ideal for families, groups and cruise passengers.' },
    { q: 'Can I book a Marseille cruise port transfer?', a: 'Yes. We provide private transfers between the Marseille cruise terminals, Marseille Provence Airport, hotels and Saint-Charles train station.' },
    { q: 'Can I book a chauffeur for a full day?', a: 'Yes. You can hire a private chauffeur in Marseille for several hours or a full day, for business, tourism or private excursions across Provence.' },
    { q: 'Can I travel from Marseille to Aix-en-Provence or Cassis?', a: 'Absolutely. We cover all of Provence, including Aix-en-Provence, Cassis, La Ciotat, Avignon, Toulon, Saint-Tropez, Cannes and Nice.' },
  ],
  fr: [
    { q: 'Comment réserver un transfert aéroport Marseille ?', a: 'Utilisez le formulaire de réservation en haut de cette page : indiquez votre point de départ (par exemple l\'aéroport Marseille Provence), votre destination, la date et l\'heure, puis choisissez votre véhicule. Vous recevez une confirmation instantanée avec un prix fixe.' },
    { q: 'Où mon chauffeur m\'attend-il à l\'aéroport de Marseille ?', a: 'Votre chauffeur vous attend dans le hall des arrivées de l\'aéroport Marseille Provence avec une pancarte à votre nom et vous aide avec vos bagages jusqu\'au véhicule.' },
    { q: 'Que se passe-t-il si mon vol est retardé ?', a: 'Nous suivons votre vol en temps réel. En cas de retard, votre chauffeur adapte automatiquement l\'heure de prise en charge — sans supplément.' },
    { q: 'Puis-je réserver un minivan à Marseille ?', a: 'Oui. Nous proposons des minivans jusqu\'à 8 passagers avec bagages — parfaits pour les familles, les groupes et les croisiéristes.' },
    { q: 'Puis-je réserver un transfert port de croisière à Marseille ?', a: 'Oui. Nous assurons des transferts privés entre les terminaux de croisière de Marseille, l\'aéroport Marseille Provence, les hôtels et la gare Saint-Charles.' },
    { q: 'Puis-je réserver un chauffeur à la journée ?', a: 'Oui. Vous pouvez réserver un chauffeur privé à Marseille pour plusieurs heures ou une journée complète : affaires, tourisme ou excursions privées en Provence.' },
    { q: 'Puis-je aller de Marseille à Aix-en-Provence ou Cassis ?', a: 'Bien sûr. Nous couvrons toute la Provence : Aix-en-Provence, Cassis, La Ciotat, Avignon, Toulon, Saint-Tropez, Cannes et Nice.' },
  ],
  ru: [
    { q: 'Как заказать трансфер из аэропорта Марселя?', a: 'Воспользуйтесь формой бронирования вверху страницы: укажите точку подачи (например, аэропорт Марсель-Прованс), адрес назначения, дату и время, затем выберите автомобиль. Вы сразу получите подтверждение с фиксированной ценой.' },
    { q: 'Где меня встретит водитель в аэропорту Марселя?', a: 'Водитель ждёт вас в зале прилёта аэропорта Марсель-Прованс с табличкой, на которой указано ваше имя, и помогает донести багаж до автомобиля.' },
    { q: 'Что будет, если мой рейс задержится?', a: 'Мы отслеживаем рейс в реальном времени. При задержке водитель автоматически скорректирует время встречи — без доплаты.' },
    { q: 'Можно ли заказать минивэн в Марселе?', a: 'Да. У нас есть минивэны до 8 пассажиров с багажом — удобно для семей, групп и пассажиров круизов.' },
    { q: 'Можно ли заказать трансфер из круизного порта Марселя?', a: 'Да. Мы выполняем частные трансферы между круизными терминалами Марселя, аэропортом Марсель-Прованс, отелями и вокзалом Saint-Charles.' },
    { q: 'Можно ли нанять водителя на целый день?', a: 'Да. Водителя в Марселе можно заказать на несколько часов или на весь день — для деловых поездок, туризма и частных экскурсий по Провансу.' },
    { q: 'Можно ли доехать из Марселя в Экс-ан-Прованс или Кассис?', a: 'Конечно. Мы работаем по всему Провансу: Экс-ан-Прованс, Кассис, Ла-Сьота, Авиньон, Тулон, Сен-Тропе, Канны и Ницца.' },
  ],
  es: [
    { q: '¿Cómo reservo un traslado del aeropuerto de Marsella?', a: 'Utiliza el formulario de reserva en la parte superior de esta página: indica tu punto de recogida (por ejemplo el aeropuerto Marsella-Provenza), tu destino, la fecha y la hora, y elige tu vehículo. Recibirás confirmación instantánea con precio fijo.' },
    { q: '¿Dónde me esperará el chófer en el aeropuerto de Marsella?', a: 'Tu chófer te espera en la sala de llegadas del aeropuerto Marsella-Provenza con un cartel con tu nombre y te ayuda con el equipaje hasta el vehículo.' },
    { q: '¿Qué pasa si mi vuelo se retrasa?', a: 'Seguimos tu vuelo en tiempo real. Si se retrasa, el chófer ajusta automáticamente la hora de recogida — sin coste adicional.' },
    { q: '¿Puedo reservar un minivan en Marsella?', a: 'Sí. Ofrecemos minivans de hasta 8 pasajeros con equipaje — ideales para familias, grupos y pasajeros de crucero.' },
    { q: '¿Puedo reservar un traslado al puerto de cruceros de Marsella?', a: 'Sí. Realizamos traslados privados entre las terminales de crucero de Marsella, el aeropuerto Marsella-Provenza, hoteles y la estación Saint-Charles.' },
    { q: '¿Puedo contratar un chófer para todo el día?', a: 'Sí. Puedes contratar un chófer privado en Marsella por horas o para el día completo: negocios, turismo o excursiones privadas por la Provenza.' },
    { q: '¿Puedo viajar de Marsella a Aix-en-Provence o Cassis?', a: 'Por supuesto. Cubrimos toda la Provenza: Aix-en-Provence, Cassis, La Ciotat, Aviñón, Tolón, Saint-Tropez, Cannes y Niza.' },
  ],
};

const faqTitles = { en: 'Marseille Transfer — Frequently Asked Questions', fr: 'Transfert Marseille — Questions Fréquentes', ru: 'Трансфер в Марселе — частые вопросы', es: 'Traslado Marsella — Preguntas Frecuentes' };

const airportLinks = {
  en: { text: 'Arriving or departing by plane?', anchor: 'Marseille Airport transfer (MRS)', to: '/marseille-airport-transfer' },
  fr: { text: 'Vous arrivez ou partez en avion ?', anchor: 'Transfert Aéroport Marseille Provence (MRS)', to: '/fr/transfert-aeroport-marseille' },
  ru: { text: 'Прилетаете или улетаете?', anchor: 'Трансфер из аэропорта Марсель-Прованс (MRS)', to: '/ru/transfer-aeroport-marsel' },
  es: { text: '¿Llegas o sales en avión?', anchor: 'Traslado Aeropuerto Marsella (MRS)', to: '/es/traslado-aeropuerto-marsella' },
};

const seoUrls = { en: '/marseille', fr: '/fr/marseille', ru: '/ru/marseille', es: '/es/marseille' };

const MarseilleTransfer = () => {
  const { language } = useLanguage();
  const lang = ['en', 'fr', 'ru', 'es'].includes(language) ? language : 'en';
  const faqList = faqs[lang];
  const pageUrl = `https://www.zont.cab${seoUrls[lang]}`;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Zont', item: 'https://www.zont.cab/' },
      { '@type': 'ListItem', position: 2, name: lang === 'fr' ? 'Destinations' : lang === 'ru' ? 'Направления' : lang === 'es' ? 'Destinos' : 'Destinations', item: 'https://www.zont.cab/countries' },
      { '@type': 'ListItem', position: 3, name: 'Marseille', item: pageUrl },
    ],
  };

  const extraSections = (
    <>
      <section className="py-10 px-4 bg-[#0f1419]" data-testid="marseille-airportlink-section">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-400 mb-3">{airportLinks[lang].text}</p>
          <Link to={airportLinks[lang].to} className="text-[#2ecc71] font-semibold hover:underline text-lg" data-testid="link-to-marseille-airport">
            {airportLinks[lang].anchor} →
          </Link>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 bg-[#111827]" data-testid="marseille-faq-section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{faqTitles[lang]}</h2>
        <div className="space-y-4">
          {faqList.map((f, i) => (
            <details key={i} className="bg-[#1a2332] border border-gray-700 rounded-xl p-5 group" data-testid={`marseille-faq-${i}`}>
              <summary className="text-white font-semibold cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <span className="text-[#2ecc71] ml-3 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      </section>
    </>
  );

  const c = { ...(content[lang] || content.en) };
  c.seoDesc = seoDescriptions[lang];
  const localizedContent = { ...content, [lang]: c };

  return (
    <CityTransferPage
      content={localizedContent}
      seoUrls={seoUrls}
      hidePrices
      extraSections={extraSections}
      heroImage="https://images.unsplash.com/photo-1566838217578-1903568a76d9?w=1280&q=75&auto=format"
    />
  );
};

export default MarseilleTransfer;
