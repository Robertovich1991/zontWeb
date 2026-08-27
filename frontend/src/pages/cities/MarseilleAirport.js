import React from 'react';
import { Link } from 'react-router-dom';
import CityTransferPage from '@/components/CityTransferPage';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  en: {
    title: 'Marseille Airport Transfer (MRS) & Private Chauffeur | ZONT',
    h1: 'Marseille Airport Transfer (MRS) & Private Chauffeur',
    subtitle: 'Pre-booked private transfers from and to Marseille Provence Airport — fixed price, flight tracking, 24/7',
    description: 'Book your private transfer from or to Marseille Provence Airport (MRS) with ZONT. Avoid the uncertainty of finding transportation after landing: your private chauffeur provides a pre-booked transfer directly between Marseille Provence Airport and your destination. Travel comfortably to your hotel, private address, business meeting, cruise terminal or another destination in Marseille and Provence.',
    description2: 'Need a private transfer from Marseille Provence Airport to Marseille? Book your chauffeur in advance and travel directly from the airport to your hotel, residence, business address or other destination in the city. The service is suitable for individual travelers, families, business passengers and groups arriving at MRS.',
    description3: 'ZONT also provides pre-booked private transfers from Marseille to Marseille Provence Airport. Choose your pickup location in Marseille and schedule your transfer according to your flight departure — including early-morning departures. Families and groups can book a private minivan transfer from Marseille Airport with space for passengers and luggage.',
    whyChoose: 'Airport Pickup with a Private Chauffeur',
    feature1Title: 'Flight Tracking', feature1Desc: 'We monitor your flight arriving at Marseille Provence Airport and adjust the pickup time to delays.',
    feature2Title: 'Airport Pickup', feature2Desc: 'Your private chauffeur meets you at Marseille Airport and assists you with your luggage.',
    feature3Title: 'Private Vehicle', feature3Desc: 'A private car or minivan for you only — options for families and groups.',
    feature4Title: 'Price Confirmed Before the Journey', feature4Desc: 'Your Marseille Airport transfer price is confirmed at booking. 24/7 availability.',
    sedan: 'Standard Car', sedanDesc: '1-3 passengers, ideal for airport transfers', luxury: 'Luxury Sedan', luxuryDesc: 'Premium sedan for business travel',
    minivan: 'Luxury Van', minivanDesc: 'Up to 6 passengers with luggage', minibus: 'Minivan 8 pers.', minibusDesc: 'Up to 8 passengers, groups & families',
    passengers: 'Passengers', luggage: 'Luggage', bookNow: 'BOOK NOW', allInclusive: 'All inclusive',
    vehiclesTitle: 'Marseille Airport Minivan & Vehicle Options',
    howItWorks: 'How It Works', step1: 'Book Online', step1Desc: 'Enter your flight details and destination. Instant confirmation with a fixed price.',
    step2: 'Airport Pickup', step2Desc: 'Your chauffeur meets you at Marseille Provence Airport arrivals.',
    step3: 'Direct Transfer', step3Desc: 'Travel directly to your hotel, cruise terminal or address in Marseille and Provence.',
    popularRoutesTitle: 'Popular Transfers from Marseille Airport', fromLabel: 'From',
    routes: [
      { name: 'Marseille Airport → Marseille' },
      { name: 'Marseille Airport → Aix-en-Provence' },
      { name: 'Marseille Airport → Cassis' },
      { name: 'Marseille Airport → Marseille Cruise Port' },
      { name: 'Marseille Airport → Marseille Saint-Charles Station' },
      { name: 'Marseille Airport → Toulon' },
      { name: 'Marseille Airport → Avignon' },
      { name: 'Marseille Airport → Saint-Tropez' },
      { name: 'Marseille Airport → Cannes' },
      { name: 'Marseille Airport → Nice' },
    ],
    bookingForm: 'Book Your Marseille Airport Transfer',
    pickupLabel: 'Pick up', dropoffLabel: 'Drop off', dateLabel: 'Date', timeLabel: 'Time',
    defaultPickup: 'Marseille Provence Airport (MRS)',
    otherCitiesTitle: 'We also serve other cities', otherCitiesBtn: 'View All Destinations',
    rating: '4.5/5 Tripadvisor',
  },
  fr: {
    title: 'Transfert Aéroport Marseille Provence (MRS) | ZONT',
    h1: 'Transfert Aéroport Marseille Provence (MRS)',
    subtitle: 'Transferts privés réservés à l\'avance depuis et vers l\'aéroport Marseille Provence — prix fixe, suivi du vol, 24h/24',
    description: 'Réservez à l\'avance votre transfert privé depuis ou vers l\'Aéroport Marseille Provence (MRS) avec ZONT. Votre chauffeur assure votre prise en charge pour vous conduire directement à votre hôtel, domicile, entreprise, port de croisière ou vers une autre destination à Marseille et en Provence — sans chercher un moyen de transport à l\'atterrissage.',
    description2: 'Besoin d\'un transfert privé entre l\'Aéroport Marseille Provence et Marseille ? Réservez votre chauffeur à l\'avance et voyagez directement de l\'aéroport vers votre hôtel, domicile ou toute autre adresse à Marseille. Le service convient aux voyageurs individuels, aux familles, aux passagers d\'affaires et aux groupes.',
    description3: 'ZONT assure également les transferts privés réservés à l\'avance depuis Marseille vers l\'Aéroport Marseille Provence. Indiquez votre adresse de prise en charge et planifiez votre transfert selon l\'horaire de votre vol — y compris tôt le matin. Les familles et les groupes peuvent réserver un minivan privé depuis l\'aéroport de Marseille, avec de la place pour les passagers et les bagages.',
    whyChoose: 'Prise en Charge avec Chauffeur Privé',
    feature1Title: 'Suivi du Vol', feature1Desc: 'Nous suivons votre vol à destination de l\'aéroport Marseille Provence et adaptons la prise en charge aux retards.',
    feature2Title: 'Prise en Charge à l\'Aéroport', feature2Desc: 'Votre chauffeur privé vous accueille à l\'aéroport de Marseille et vous aide avec vos bagages.',
    feature3Title: 'Véhicule Privé', feature3Desc: 'Une voiture ou un minivan privé rien que pour vous — options familles et groupes.',
    feature4Title: 'Tarif Confirmé Avant le Trajet', feature4Desc: 'Le prix de votre transfert aéroport Marseille est confirmé à la réservation. Réservation 24h/24.',
    sedan: 'Berline Standard', sedanDesc: '1-3 passagers, idéal transfert aéroport', luxury: 'Berline de Luxe', luxuryDesc: 'Berline premium pour vos déplacements professionnels',
    minivan: 'Van de Luxe', minivanDesc: 'Jusqu\'à 6 passagers avec bagages', minibus: 'Minivan 8 pers.', minibusDesc: 'Jusqu\'à 8 passagers, groupes et familles',
    passengers: 'Passagers', luggage: 'Bagages', bookNow: 'RÉSERVER', allInclusive: 'Tout compris',
    vehiclesTitle: 'Minivan et Véhicules — Aéroport Marseille',
    howItWorks: 'Comment Ça Marche', step1: 'Réservez en Ligne', step1Desc: 'Entrez les détails de votre vol et votre destination. Confirmation instantanée à prix fixe.',
    step2: 'Prise en Charge', step2Desc: 'Votre chauffeur vous accueille aux arrivées de l\'aéroport Marseille Provence.',
    step3: 'Transfert Direct', step3Desc: 'Rejoignez directement votre hôtel, le port de croisière ou votre adresse à Marseille et en Provence.',
    popularRoutesTitle: 'Destinations Populaires depuis l\'Aéroport Marseille', fromLabel: 'À partir de',
    routes: [
      { name: 'Aéroport Marseille → Marseille' },
      { name: 'Aéroport Marseille → Aix-en-Provence' },
      { name: 'Aéroport Marseille → Cassis' },
      { name: 'Aéroport Marseille → Port de Marseille' },
      { name: 'Aéroport Marseille → Gare Saint-Charles' },
      { name: 'Aéroport Marseille → Toulon' },
      { name: 'Aéroport Marseille → Avignon' },
      { name: 'Aéroport Marseille → Saint-Tropez' },
      { name: 'Aéroport Marseille → Cannes' },
      { name: 'Aéroport Marseille → Nice' },
    ],
    bookingForm: 'Réserver mon Transfert Aéroport Marseille',
    pickupLabel: 'Départ', dropoffLabel: 'Destination', dateLabel: 'Date', timeLabel: 'Heure',
    defaultPickup: 'Aéroport Marseille Provence (MRS)',
    otherCitiesTitle: 'Nous desservons aussi d\'autres villes', otherCitiesBtn: 'Voir Toutes les Destinations',
    rating: '4.5/5 Tripadvisor',
  },
  ru: {
    title: 'Трансфер из аэропорта Марселя (MRS) | ZONT',
    h1: 'Трансфер из аэропорта Марсель-Прованс (MRS)',
    subtitle: 'Заранее забронированные частные трансферы из аэропорта и в аэропорт — фиксированная цена, отслеживание рейса, 24/7',
    description: 'Закажите индивидуальный трансфер из аэропорта Марсель-Прованс (MRS) заранее. После посадки вам не придётся искать транспорт: частный водитель отвезёт вас напрямую в отель, к частному адресу, на деловую встречу, в круизный порт или к любому другому месту назначения в Марселе и Провансе.',
    description2: 'Прилетаете в Марсель? Забронируйте водителя заранее и поезжайте из аэропорта прямо в отель, апартаменты или по рабочему адресу. Сервис подходит для индивидуальных путешественников, семей, деловых пассажиров и групп. По запросу возможен русскоязычный водитель.',
    description3: 'ZONT также выполняет заранее забронированные трансферы из Марселя в аэропорт Марсель-Прованс. Укажите адрес подачи и запланируйте поездку под время вылета — в том числе рано утром. Для семей и групп доступны минивэны с местом для пассажиров и багажа.',
    whyChoose: 'Встреча с водителем в аэропорту Марселя',
    feature1Title: 'Отслеживание рейса', feature1Desc: 'Мы следим за вашим рейсом в аэропорт Марсель-Прованс и подстраиваем встречу под задержки.',
    feature2Title: 'Встреча в аэропорту', feature2Desc: 'Частный водитель встречает вас в аэропорту Марселя и помогает с багажом.',
    feature3Title: 'Частный автомобиль', feature3Desc: 'Автомобиль или минивэн только для вас — варианты для семей и групп.',
    feature4Title: 'Цена подтверждена заранее', feature4Desc: 'Стоимость трансфера подтверждается при бронировании. Бронирование 24/7.',
    sedan: 'Стандартный седан', sedanDesc: '1-3 пассажира, идеально для аэропорта', luxury: 'Люкс седан', luxuryDesc: 'Премиальный седан для деловых поездок',
    minivan: 'Люкс минивэн', minivanDesc: 'До 6 пассажиров с багажом', minibus: 'Минивэн 8 мест', minibusDesc: 'До 8 пассажиров, группы и семьи',
    passengers: 'Пассажиры', luggage: 'Багаж', bookNow: 'ЗАБРОНИРОВАТЬ', allInclusive: 'Всё включено',
    vehiclesTitle: 'Минивэны и автомобили — аэропорт Марселя',
    howItWorks: 'Как это работает', step1: 'Бронируйте онлайн', step1Desc: 'Укажите данные рейса и адрес назначения. Мгновенное подтверждение с фиксированной ценой.',
    step2: 'Встреча в аэропорту', step2Desc: 'Водитель встречает вас в зале прилёта аэропорта Марсель-Прованс.',
    step3: 'Прямой трансфер', step3Desc: 'Поездка напрямую в отель, круизный порт или по адресу в Марселе и Провансе.',
    popularRoutesTitle: 'Популярные направления из аэропорта Марселя', fromLabel: 'От',
    routes: [
      { name: 'Аэропорт Марселя → Марсель' },
      { name: 'Аэропорт Марселя → Экс-ан-Прованс' },
      { name: 'Аэропорт Марселя → Кассис' },
      { name: 'Аэропорт Марселя → Круизный порт Марселя' },
      { name: 'Аэропорт Марселя → Вокзал Saint-Charles' },
      { name: 'Аэропорт Марселя → Тулон' },
      { name: 'Аэропорт Марселя → Авиньон' },
      { name: 'Аэропорт Марселя → Сен-Тропе' },
      { name: 'Аэропорт Марселя → Канны' },
      { name: 'Аэропорт Марселя → Ницца' },
    ],
    bookingForm: 'Заказать трансфер из аэропорта Марселя',
    pickupLabel: 'Откуда', dropoffLabel: 'Куда', dateLabel: 'Дата', timeLabel: 'Время',
    defaultPickup: 'Аэропорт Марсель-Прованс (MRS)',
    otherCitiesTitle: 'Другие города', otherCitiesBtn: 'Все направления',
    rating: '4.5/5 Tripadvisor',
  },
  es: {
    title: 'Traslado Aeropuerto Marsella (MRS) | Chófer Privado ZONT',
    h1: 'Traslado Aeropuerto Marsella-Provenza (MRS)',
    subtitle: 'Traslados privados reservados con antelación desde y hacia el aeropuerto de Marsella — precio fijo, seguimiento del vuelo, 24/7',
    description: 'Reserva con antelación tu traslado privado desde o hacia el Aeropuerto de Marsella-Provenza (MRS) con ZONT. Al aterrizar no tendrás que buscar transporte: tu chófer privado te lleva directamente a tu hotel, domicilio, empresa, puerto de cruceros u otro destino en Marsella y la Provenza.',
    description2: '¿Necesitas un traslado privado del Aeropuerto de Marsella a la ciudad? Reserva tu chófer con antelación y viaja directamente del aeropuerto a tu hotel, residencia o dirección de trabajo. El servicio es adecuado para viajeros individuales, familias, pasajeros de negocios y grupos.',
    description3: 'ZONT también ofrece traslados privados reservados con antelación desde Marsella hacia el Aeropuerto Marsella-Provenza. Elige tu punto de recogida y programa el traslado según la salida de tu vuelo — incluso de madrugada. Familias y grupos pueden reservar un minivan privado desde el aeropuerto, con espacio para pasajeros y equipaje.',
    whyChoose: 'Recogida en el Aeropuerto con Chófer Privado',
    feature1Title: 'Seguimiento del Vuelo', feature1Desc: 'Monitorizamos tu vuelo al aeropuerto Marsella-Provenza y adaptamos la recogida a los retrasos.',
    feature2Title: 'Recogida en el Aeropuerto', feature2Desc: 'Tu chófer privado te recibe en el aeropuerto de Marsella y te ayuda con el equipaje.',
    feature3Title: 'Vehículo Privado', feature3Desc: 'Un coche o minivan privado solo para ti — opciones para familias y grupos.',
    feature4Title: 'Precio Confirmado Antes del Viaje', feature4Desc: 'El precio de tu traslado se confirma al reservar. Reservas 24/7.',
    sedan: 'Berlina Estándar', sedanDesc: '1-3 pasajeros, ideal para el aeropuerto', luxury: 'Berlina de Lujo', luxuryDesc: 'Berlina premium para viajes de negocios',
    minivan: 'Van de Lujo', minivanDesc: 'Hasta 6 pasajeros con equipaje', minibus: 'Minivan 8 plazas', minibusDesc: 'Hasta 8 pasajeros, grupos y familias',
    passengers: 'Pasajeros', luggage: 'Equipaje', bookNow: 'RESERVAR', allInclusive: 'Todo incluido',
    vehiclesTitle: 'Minivan y Vehículos — Aeropuerto Marsella',
    howItWorks: 'Cómo Funciona', step1: 'Reserva Online', step1Desc: 'Introduce los datos de tu vuelo y tu destino. Confirmación instantánea con precio fijo.',
    step2: 'Recogida en el Aeropuerto', step2Desc: 'Tu chófer te recibe en llegadas del aeropuerto Marsella-Provenza.',
    step3: 'Traslado Directo', step3Desc: 'Viaja directamente a tu hotel, puerto de cruceros o dirección en Marsella y la Provenza.',
    popularRoutesTitle: 'Destinos Populares desde el Aeropuerto de Marsella', fromLabel: 'Desde',
    routes: [
      { name: 'Aeropuerto Marsella → Marsella' },
      { name: 'Aeropuerto Marsella → Aix-en-Provence' },
      { name: 'Aeropuerto Marsella → Cassis' },
      { name: 'Aeropuerto Marsella → Puerto de Marsella' },
      { name: 'Aeropuerto Marsella → Estación Saint-Charles' },
      { name: 'Aeropuerto Marsella → Toulon' },
      { name: 'Aeropuerto Marsella → Aviñón' },
      { name: 'Aeropuerto Marsella → Saint-Tropez' },
      { name: 'Aeropuerto Marsella → Cannes' },
      { name: 'Aeropuerto Marsella → Niza' },
    ],
    bookingForm: 'Reservar Traslado Aeropuerto Marsella',
    pickupLabel: 'Recogida', dropoffLabel: 'Destino', dateLabel: 'Fecha', timeLabel: 'Hora',
    defaultPickup: 'Aeropuerto Marsella-Provenza (MRS)',
    otherCitiesTitle: 'También servimos otras ciudades', otherCitiesBtn: 'Ver Todos los Destinos',
    rating: '4.5/5 Tripadvisor',
  },
};
content.hy = content.en;

const seoDescriptions = {
  en: 'Book a private Marseille Airport transfer (MRS) with a professional chauffeur. Fixed prices, flight tracking, airport pickup and 24/7 transfer service.',
  fr: 'Réservez votre transfert Aéroport Marseille Provence avec chauffeur privé. Prix fixe, suivi du vol, prise en charge à l\'aéroport et service 24h/24.',
  ru: 'Закажите трансфер из аэропорта Марсель-Прованс (MRS) с частным водителем. Встреча в аэропорту, отслеживание рейса и фиксированная цена.',
  es: 'Reserva tu traslado privado desde el Aeropuerto de Marsella (MRS). Chófer profesional, precio fijo, seguimiento del vuelo y servicio 24/7.',
};

const faqs = {
  en: [
    { q: 'How do I book a Marseille Airport transfer?', a: 'Use the booking form at the top of this page: enter Marseille Provence Airport as pickup (or drop off), your destination, date and time, then choose your vehicle. You receive instant confirmation with a fixed price.' },
    { q: 'Where will my chauffeur meet me at Marseille Airport?', a: 'Your chauffeur meets you in the arrivals area of Marseille Provence Airport with a name sign and helps you with your luggage to the vehicle.' },
    { q: 'What happens if my flight is delayed?', a: 'We track your flight in real time. If it is delayed, your chauffeur adjusts the pickup time automatically at no extra charge.' },
    { q: 'Can I book a minivan from Marseille Airport?', a: 'Yes. Minivans for up to 8 passengers with luggage are available in the booking form — ideal for families and groups.' },
    { q: 'Can I book a transfer from Marseille Airport to my hotel?', a: 'Yes. Enter your hotel name or address as the destination and your chauffeur will take you there directly.' },
    { q: 'Can I travel from Marseille Airport to Aix-en-Provence?', a: 'Yes. Aix-en-Provence is one of the most requested destinations from Marseille Provence Airport and can be booked directly in the form.' },
    { q: 'Can I book Marseille Airport to Cassis?', a: 'Yes. Private transfers between Marseille Provence Airport and Cassis can be booked in advance with a fixed price.' },
    { q: 'Can I book a transfer between Marseille Airport and the cruise port?', a: 'Yes. We connect Marseille Provence Airport with the Marseille cruise terminals in both directions.' },
    { q: 'Is the price confirmed before the journey?', a: 'Yes. Your price is calculated and confirmed at booking — no meters and no surprises on arrival.' },
    { q: 'Can I book an early-morning transfer to Marseille Airport?', a: 'Yes. The booking service is available 24/7, so you can schedule your pickup for any departure time, including early-morning flights.' },
  ],
  fr: [
    { q: 'Comment réserver un transfert aéroport Marseille ?', a: 'Utilisez le formulaire en haut de cette page : indiquez l\'Aéroport Marseille Provence comme point de départ (ou d\'arrivée), votre destination, la date et l\'heure, puis choisissez votre véhicule. Confirmation instantanée à prix fixe.' },
    { q: 'Où mon chauffeur m\'attend-il à l\'aéroport de Marseille ?', a: 'Votre chauffeur vous attend dans la zone des arrivées de l\'aéroport Marseille Provence avec une pancarte à votre nom et vous aide avec vos bagages.' },
    { q: 'Que se passe-t-il si mon vol est retardé ?', a: 'Nous suivons votre vol en temps réel. En cas de retard, votre chauffeur adapte automatiquement l\'heure de prise en charge, sans supplément.' },
    { q: 'Puis-je réserver un minivan depuis l\'aéroport de Marseille ?', a: 'Oui. Des minivans jusqu\'à 8 passagers avec bagages sont disponibles dans le formulaire — parfaits pour les familles et les groupes.' },
    { q: 'Puis-je réserver un transfert de l\'aéroport vers mon hôtel ?', a: 'Oui. Indiquez le nom ou l\'adresse de votre hôtel comme destination et votre chauffeur vous y conduira directement.' },
    { q: 'Puis-je aller de l\'aéroport de Marseille à Aix-en-Provence ?', a: 'Oui. Aix-en-Provence est l\'une des destinations les plus demandées depuis l\'aéroport Marseille Provence et se réserve directement dans le formulaire.' },
    { q: 'Puis-je réserver Aéroport Marseille → Cassis ?', a: 'Oui. Les transferts privés entre l\'aéroport Marseille Provence et Cassis se réservent à l\'avance avec un prix fixe.' },
    { q: 'Puis-je réserver un transfert entre l\'aéroport et le port de croisière ?', a: 'Oui. Nous relions l\'aéroport Marseille Provence aux terminaux de croisière de Marseille dans les deux sens.' },
    { q: 'Le prix est-il confirmé avant le trajet ?', a: 'Oui. Votre prix est calculé et confirmé à la réservation — sans compteur et sans surprise à l\'arrivée.' },
    { q: 'Puis-je réserver un transfert tôt le matin vers l\'aéroport ?', a: 'Oui. La réservation est disponible 24h/24 : planifiez votre prise en charge pour n\'importe quel horaire, y compris les vols matinaux.' },
  ],
  ru: [
    { q: 'Как заказать трансфер из аэропорта Марселя?', a: 'Воспользуйтесь формой вверху страницы: укажите аэропорт Марсель-Прованс как точку подачи (или назначения), адрес, дату и время, затем выберите автомобиль. Подтверждение приходит сразу, цена фиксированная.' },
    { q: 'Где меня встретит водитель в аэропорту Марселя?', a: 'Водитель ждёт вас в зоне прилёта аэропорта Марсель-Прованс с именной табличкой и помогает донести багаж до автомобиля.' },
    { q: 'Что будет, если рейс задержится?', a: 'Мы отслеживаем рейс в реальном времени. При задержке водитель автоматически скорректирует время встречи — без доплаты.' },
    { q: 'Можно ли заказать минивэн из аэропорта Марселя?', a: 'Да. В форме доступны минивэны до 8 пассажиров с багажом — удобно для семей и групп.' },
    { q: 'Можно ли заказать трансфер из аэропорта в отель?', a: 'Да. Укажите название или адрес отеля как место назначения — водитель отвезёт вас прямо туда.' },
    { q: 'Можно ли доехать из аэропорта Марселя в Экс-ан-Прованс?', a: 'Да. Экс-ан-Прованс — одно из самых востребованных направлений из аэропорта Марсель-Прованс, бронируется прямо в форме.' },
    { q: 'Можно ли заказать аэропорт Марселя → Кассис?', a: 'Да. Частные трансферы между аэропортом Марсель-Прованс и Кассисом бронируются заранее по фиксированной цене.' },
    { q: 'Есть ли трансфер между аэропортом и круизным портом?', a: 'Да. Мы возим между аэропортом Марсель-Прованс и круизными терминалами Марселя в обоих направлениях.' },
    { q: 'Цена подтверждается до поездки?', a: 'Да. Стоимость рассчитывается и подтверждается при бронировании — без счётчика и неожиданностей по прибытии.' },
    { q: 'Можно ли заказать ранний утренний трансфер в аэропорт?', a: 'Да. Бронирование работает круглосуточно: назначьте подачу на любое время, включая ранние утренние рейсы.' },
  ],
  es: [
    { q: '¿Cómo reservo un traslado del aeropuerto de Marsella?', a: 'Utiliza el formulario en la parte superior: indica el Aeropuerto Marsella-Provenza como punto de recogida (o destino), tu dirección, la fecha y la hora, y elige tu vehículo. Confirmación instantánea con precio fijo.' },
    { q: '¿Dónde me esperará el chófer en el aeropuerto de Marsella?', a: 'Tu chófer te espera en la zona de llegadas del aeropuerto Marsella-Provenza con un cartel con tu nombre y te ayuda con el equipaje.' },
    { q: '¿Qué pasa si mi vuelo se retrasa?', a: 'Seguimos tu vuelo en tiempo real. Si se retrasa, el chófer ajusta automáticamente la hora de recogida sin coste adicional.' },
    { q: '¿Puedo reservar un minivan desde el aeropuerto de Marsella?', a: 'Sí. En el formulario hay minivans de hasta 8 pasajeros con equipaje — ideales para familias y grupos.' },
    { q: '¿Puedo reservar un traslado del aeropuerto a mi hotel?', a: 'Sí. Indica el nombre o la dirección de tu hotel como destino y tu chófer te llevará directamente.' },
    { q: '¿Puedo viajar del aeropuerto de Marsella a Aix-en-Provence?', a: 'Sí. Aix-en-Provence es uno de los destinos más solicitados desde el aeropuerto Marsella-Provenza y se reserva directamente en el formulario.' },
    { q: '¿Puedo reservar Aeropuerto Marsella → Cassis?', a: 'Sí. Los traslados privados entre el aeropuerto Marsella-Provenza y Cassis se reservan con antelación y precio fijo.' },
    { q: '¿Hay traslado entre el aeropuerto y el puerto de cruceros?', a: 'Sí. Conectamos el aeropuerto Marsella-Provenza con las terminales de crucero de Marsella en ambos sentidos.' },
    { q: '¿El precio se confirma antes del viaje?', a: 'Sí. Tu precio se calcula y se confirma al reservar — sin taxímetro ni sorpresas a la llegada.' },
    { q: '¿Puedo reservar un traslado de madrugada al aeropuerto?', a: 'Sí. Las reservas están disponibles 24/7: programa tu recogida para cualquier hora, incluidos los vuelos de primera hora.' },
  ],
};

const faqTitles = { en: 'Marseille Airport Transfer — Frequently Asked Questions', fr: 'Transfert Aéroport Marseille — Questions Fréquentes', ru: 'Трансфер из аэропорта Марселя — частые вопросы', es: 'Traslado Aeropuerto Marsella — Preguntas Frecuentes' };

const crossLinks = {
  en: { text: 'Looking for a chauffeur in the city for several hours or a full day?', anchor: 'Private chauffeur service in Marseille', to: '/marseille' },
  fr: { text: 'Besoin d\'un chauffeur en ville pour quelques heures ou à la journée ?', anchor: 'Chauffeur privé à Marseille', to: '/fr/marseille' },
  ru: { text: 'Нужен водитель по городу на несколько часов или на весь день?', anchor: 'Частный водитель в Марселе', to: '/ru/marseille' },
  es: { text: '¿Buscas un chófer en la ciudad por horas o para el día completo?', anchor: 'Chófer privado en Marsella', to: '/es/marseille' },
};

const seoUrls = { en: '/marseille-airport-transfer', fr: '/fr/transfert-aeroport-marseille', ru: '/ru/transfer-aeroport-marsel', es: '/es/traslado-aeropuerto-marsella' };

const MarseilleAirportTransfer = () => {
  const { language } = useLanguage();
  const lang = ['en', 'fr', 'ru', 'es'].includes(language) ? language : 'en';
  const faqList = faqs[lang];
  const cross = crossLinks[lang];
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
      { '@type': 'ListItem', position: 2, name: 'Marseille', item: `https://www.zont.cab${cross.to}` },
      { '@type': 'ListItem', position: 3, name: content[lang].h1, item: pageUrl },
    ],
  };

  const extraSections = (
    <>
      <section className="py-10 px-4 bg-[#0f1419]" data-testid="marseille-airport-crosslink">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-400 mb-3">{cross.text}</p>
          <Link to={cross.to} className="text-[#2ecc71] font-semibold hover:underline text-lg" data-testid="link-to-marseille-city">
            {cross.anchor} →
          </Link>
        </div>
      </section>
      <section className="py-12 md:py-20 px-4 bg-[#111827]" data-testid="marseille-airport-faq-section">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{faqTitles[lang]}</h2>
          <div className="space-y-4">
            {faqList.map((f, i) => (
              <details key={i} className="bg-[#1a2332] border border-gray-700 rounded-xl p-5 group" data-testid={`airport-faq-item-${i}`}>
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
      heroImage="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1280&q=75&auto=format"
    />
  );
};

export default MarseilleAirportTransfer;
