import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import {
  Smartphone, Globe, Search, MapPin, CheckCircle, Shield, Clock, Plane,
  CreditCard, Star, Users, Headphones, Calendar, Car, ArrowRight, ChevronRight,
  BadgeCheck, Lock, Zap, Heart
} from 'lucide-react';

const content = {
  en: {
    seoTitle: 'Book Premium Airport Transfer | Private Driver 16 Cities | Zont',
    seoDesc: 'Book your airport transfer online or via our app. Fixed prices, verified drivers, 24/7 support, free cancellation. Available in 16 European cities. Web & mobile booking.',
    heroTitle: 'Your Premium Transfer',
    heroAccent: 'Booked in 2 Minutes',
    heroSub: 'Fixed prices. Verified drivers. 24/7 assistance. Book online or via our app in 16 European cities.',
    heroCta: 'Book Now',
    heroCtaApp: 'Download the App',
    stepsTitle: 'Book Your Transfer in 4 Simple Steps',
    stepsSub: 'From booking to arrival, everything is designed for your comfort',
    steps: [
      { icon: 'globe', num: '01', title: 'Book Online or via App', desc: 'Reserve your transfer on our website or mobile app (iOS/Android). Instant price confirmation with no hidden fees.' },
      { icon: 'calendar', num: '02', title: 'Advance Reservation', desc: 'Book days or weeks in advance. Your transfer is guaranteed with a fixed price locked at booking.' },
      { icon: 'mappin', num: '03', title: 'Meet Your Driver', desc: 'Your verified driver waits at arrivals with a personalized name sign. Free 60-minute wait for flight delays.' },
      { icon: 'car', num: '04', title: 'Enjoy Premium Comfort', desc: 'Travel in a clean, air-conditioned vehicle (Mercedes, BMW). Rate your experience after each trip.' },
    ],
    advantagesTitle: 'Why 50,000+ Travelers Trust Zont',
    advantages: [
      { icon: 'shield', title: 'Verified Drivers', desc: 'Every driver is background-checked, licensed, and rated by our community. Your safety is our top priority.' },
      { icon: 'headphones', title: '24/7 Assistance', desc: 'Our multilingual support team is available around the clock. Before, during and after your trip.' },
      { icon: 'lock', title: 'Fixed Prices Guaranteed', desc: 'The price you see is the price you pay. No surge pricing, no hidden fees, tolls included.' },
      { icon: 'plane', title: 'Real-Time Flight Tracking', desc: 'We monitor your flight live. If delayed, your driver adjusts automatically at no extra cost.' },
      { icon: 'zap', title: 'Free Cancellation', desc: 'Plans changed? Cancel for free up to 24 hours before your transfer. Full flexibility guaranteed.' },
      { icon: 'creditcard', title: 'Secure Payment', desc: 'Pay online securely with Visa, Mastercard or Apple Pay. Your data is encrypted and protected.' },
    ],
    platformTitle: 'Book Anywhere, Anytime',
    platformSub: 'Available on Web, iOS and Android',
    platformPoints: [
      'Book instantly on zont.cab from any browser',
      'Download the free app on App Store or Google Play',
      'Manage bookings, track your driver in real-time',
      'Save favorite addresses for faster booking',
      'Receive notifications and booking confirmations',
    ],
    statsTitle: 'Zont in Numbers',
    stats: [
      { val: '50,000+', label: 'Completed Trips' },
      { val: '16', label: 'European Cities' },
      { val: '4.5/5', label: 'Average Rating' },
      { val: '24/7', label: 'Customer Support' },
    ],
    reviewsTitle: 'What Our Clients Say',
    reviews: [],
    ctaTitle: 'Ready to Experience Premium Transfer?',
    ctaSub: 'Join 50,000+ satisfied travelers. Book your first transfer today.',
    ctaWeb: 'Book Online Now',
    ctaApp: 'Get the App',
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      { q: 'How far in advance can I book?', a: 'You can book your transfer days, weeks or even months in advance. The earlier you book, the more availability you have.' },
      { q: 'What happens if my flight is delayed?', a: 'We track all flights in real-time. If your flight is delayed, your driver automatically adjusts their arrival time at no extra cost.' },
      { q: 'How are drivers verified?', a: 'All drivers undergo thorough background checks, have valid professional licenses, and are continuously rated by our passengers.' },
      { q: 'Can I cancel my booking?', a: 'Yes, you can cancel for free up to 24 hours before your scheduled transfer. After that, cancellation fees may apply.' },
    ],
  },
  fr: {
    seoTitle: 'Réserver Transfert Aéroport Premium | Chauffeur Privé 16 Villes | Zont',
    seoDesc: 'Réservez votre transfert aéroport en ligne ou via notre appli. Prix fixes, chauffeurs vérifiés, assistance 24h/24, annulation gratuite. 16 villes européennes. Réservation web et mobile.',
    heroTitle: 'Votre Transfert Premium',
    heroAccent: 'Réservé en 2 Minutes',
    heroSub: 'Prix fixes garantis. Chauffeurs vérifiés. Assistance 24h/24. Réservez en ligne ou via notre appli dans 16 villes européennes.',
    heroCta: 'Réserver Maintenant',
    heroCtaApp: 'Télécharger l\'Appli',
    stepsTitle: 'Réservez Votre Transfert en 4 Étapes Simples',
    stepsSub: 'De la réservation à l\'arrivée, tout est conçu pour votre confort',
    steps: [
      { icon: 'globe', num: '01', title: 'Réservez en Ligne ou via l\'Appli', desc: 'Réservez sur notre site web ou notre application mobile (iOS/Android). Confirmation du prix instantanée, sans frais cachés.' },
      { icon: 'calendar', num: '02', title: 'Réservation à l\'Avance', desc: 'Réservez des jours ou semaines à l\'avance. Votre transfert est garanti avec un prix fixe verrouillé à la réservation.' },
      { icon: 'mappin', num: '03', title: 'Rencontrez Votre Chauffeur', desc: 'Votre chauffeur vérifié vous attend aux arrivées avec une pancarte à votre nom. 60 min d\'attente gratuite pour retard de vol.' },
      { icon: 'car', num: '04', title: 'Profitez du Confort Premium', desc: 'Voyagez dans un véhicule propre et climatisé (Mercedes, BMW). Notez votre expérience après chaque trajet.' },
    ],
    advantagesTitle: 'Pourquoi 50 000+ Voyageurs Font Confiance à Zont',
    advantages: [
      { icon: 'shield', title: 'Chauffeurs Vérifiés et Certifiés', desc: 'Chaque chauffeur est vérifié, licencié et noté par notre communauté. Votre sécurité est notre priorité absolue.' },
      { icon: 'headphones', title: 'Assistance 24h/24, 7j/7', desc: 'Notre équipe multilingue est disponible jour et nuit. Avant, pendant et après votre trajet.' },
      { icon: 'lock', title: 'Prix Fixes Garantis', desc: 'Le prix affiché est le prix final. Pas de majoration, pas de frais cachés, péages inclus.' },
      { icon: 'plane', title: 'Suivi de Vol en Temps Réel', desc: 'Nous suivons votre vol en direct. En cas de retard, votre chauffeur s\'adapte automatiquement sans supplément.' },
      { icon: 'zap', title: 'Annulation Gratuite', desc: 'Vos plans changent ? Annulez gratuitement jusqu\'à 24h avant votre transfert. Flexibilité totale garantie.' },
      { icon: 'creditcard', title: 'Paiement 100% Sécurisé', desc: 'Payez en ligne par Visa, Mastercard ou Apple Pay. Vos données sont chiffrées et protégées.' },
    ],
    platformTitle: 'Réservez Partout, à Tout Moment',
    platformSub: 'Disponible sur Web, iOS et Android',
    platformPoints: [
      'Réservez instantanément sur zont.cab depuis n\'importe quel navigateur',
      'Téléchargez l\'appli gratuite sur App Store ou Google Play',
      'Gérez vos réservations et suivez votre chauffeur en temps réel',
      'Enregistrez vos adresses favorites pour réserver plus vite',
      'Recevez des notifications et confirmations de réservation',
    ],
    statsTitle: 'Zont en Chiffres',
    stats: [
      { val: '50 000+', label: 'Courses Effectuées' },
      { val: '16', label: 'Villes Européennes' },
      { val: '4.5/5', label: 'Note Moyenne' },
      { val: '24/7', label: 'Support Client' },
    ],
    reviewsTitle: 'Ce Que Disent Nos Clients',
    reviews: [],
    ctaTitle: 'Prêt à Découvrir le Transfert Premium ?',
    ctaSub: 'Rejoignez 50 000+ voyageurs satisfaits. Réservez votre premier transfert aujourd\'hui.',
    ctaWeb: 'Réserver en Ligne',
    ctaApp: 'Télécharger l\'Appli',
    faqTitle: 'Questions Frequentes',
    faqs: [
      { q: 'Combien de temps a l\'avance puis-je reserver ?', a: 'Vous pouvez reserver votre transfert des jours, semaines ou meme des mois a l\'avance. Plus vous reservez tot, plus la disponibilite est grande.' },
      { q: 'Que se passe-t-il si mon vol est en retard ?', a: 'Nous suivons tous les vols en temps reel. Si votre vol est retarde, votre chauffeur ajuste automatiquement son heure d\'arrivee sans frais supplementaires.' },
      { q: 'Comment sont verifies les chauffeurs ?', a: 'Tous les chauffeurs passent des verifications approfondies, possedent des licences professionnelles valides et sont notes en continu par nos passagers.' },
      { q: 'Puis-je annuler ma reservation ?', a: 'Oui, vous pouvez annuler gratuitement jusqu\'a 24 heures avant votre transfert prevu. Apres ce delai, des frais d\'annulation peuvent s\'appliquer.' },
    ],
  },
  ru: {
    seoTitle: 'Забронировать Трансфер из Аэропорта | Частный Водитель 16 Городов | Zont',
    seoDesc: 'Забронируйте трансфер из аэропорта онлайн или через приложение. Фиксированные цены, проверенные водители, поддержка 24/7. 16 городов Европы.',
    heroTitle: 'Ваш Премиум Трансфер',
    heroAccent: 'За 2 Минуты',
    heroSub: 'Фиксированные цены. Проверенные водители. Поддержка 24/7. Бронируйте онлайн или через приложение в 16 городах Европы.',
    heroCta: 'Забронировать',
    heroCtaApp: 'Скачать Приложение',
    stepsTitle: 'Забронируйте за 4 Простых Шага',
    stepsSub: 'От бронирования до прибытия — все для вашего комфорта',
    steps: [
      { icon: 'globe', num: '01', title: 'Бронируйте Онлайн или в Приложении', desc: 'Забронируйте на сайте или в мобильном приложении (iOS/Android). Мгновенное подтверждение цены без скрытых платежей.' },
      { icon: 'calendar', num: '02', title: 'Предварительное Бронирование', desc: 'Бронируйте за дни или недели. Трансфер гарантирован с фиксированной ценой.' },
      { icon: 'mappin', num: '03', title: 'Встретьте Водителя', desc: 'Проверенный водитель ждет в зале прилета с табличкой. 60 минут бесплатного ожидания при задержке рейса.' },
      { icon: 'car', num: '04', title: 'Наслаждайтесь Комфортом', desc: 'Путешествуйте в чистом авто с кондиционером (Mercedes, BMW). Оцените поездку после каждого рейса.' },
    ],
    advantagesTitle: 'Почему 50 000+ Путешественников Доверяют Zont',
    advantages: [
      { icon: 'shield', title: 'Проверенные Водители', desc: 'Каждый водитель проверен, лицензирован и оценен сообществом. Ваша безопасность — наш приоритет.' },
      { icon: 'headphones', title: 'Поддержка 24/7', desc: 'Наша многоязычная команда доступна круглосуточно. До, во время и после поездки.' },
      { icon: 'lock', title: 'Фиксированные Цены', desc: 'Цена, которую вы видите — окончательная. Без наценок, без скрытых платежей.' },
      { icon: 'plane', title: 'Отслеживание Рейсов', desc: 'Мы отслеживаем рейс в реальном времени. При задержке водитель адаптируется автоматически.' },
      { icon: 'zap', title: 'Бесплатная Отмена', desc: 'Планы изменились? Отмените бесплатно за 24 часа до трансфера.' },
      { icon: 'creditcard', title: 'Безопасная Оплата', desc: 'Оплата онлайн через Visa, Mastercard или Apple Pay. Данные зашифрованы.' },
    ],
    platformTitle: 'Бронируйте Где Угодно',
    platformSub: 'Доступно на Web, iOS и Android',
    platformPoints: [
      'Бронируйте на zont.cab из любого браузера',
      'Скачайте бесплатное приложение из App Store или Google Play',
      'Управляйте бронированиями и отслеживайте водителя',
      'Сохраняйте адреса для быстрого бронирования',
      'Получайте уведомления и подтверждения',
    ],
    statsTitle: 'Zont в Цифрах',
    stats: [
      { val: '50 000+', label: 'Поездок' },
      { val: '16', label: 'Городов Европы' },
      { val: '4.5/5', label: 'Средний Рейтинг' },
      { val: '24/7', label: 'Поддержка' },
    ],
    reviewsTitle: 'Отзывы Клиентов',
    reviews: [],
    ctaTitle: 'Готовы к Премиум Трансферу?',
    ctaSub: 'Присоединяйтесь к 50 000+ довольных путешественников.',
    ctaWeb: 'Забронировать Онлайн',
    ctaApp: 'Скачать Приложение',
    faqTitle: 'Частые Вопросы',
    faqs: [
      { q: 'За сколько можно забронировать?', a: 'Вы можете забронировать за дни, недели или даже месяцы. Чем раньше, тем больше доступность.' },
      { q: 'Что если рейс задерживается?', a: 'Мы отслеживаем все рейсы. При задержке водитель автоматически корректирует время без доплаты.' },
      { q: 'Как проверяются водители?', a: 'Все водители проходят проверку, имеют лицензии и постоянно оцениваются пассажирами.' },
      { q: 'Можно ли отменить бронирование?', a: 'Да, бесплатная отмена за 24 часа до трансфера.' },
    ],
  },
  hy: {
    seoTitle: ' Delays Odunavakayan Transfer Amragrel | Andznayin Varorд 16 Qaghaqnerum | Zont',
    seoDesc: 'Amragreq dzez odunavakayani transfery online kam havelvatsov. Hastat gner, stugvats varorдner, 24/7 ajaktsut yun.',
    heroTitle: 'Dzez Premium Transfery',
    heroAccent: '2 Ropeum',
    heroSub: 'Hastat gner. Stugvats varorдner. 24/7 ajaktsut yun. Amragreq online kam havelvatsov 16 evropakan qaghaqnerum.',
    heroCta: 'Amragrel Hima',
    heroCtaApp: 'Nerbernal Havelvatsy',
    stepsTitle: 'Amragreq 4 Parz Qaylov',
    stepsSub: 'Amragreluts minchev zhamanun, ameny nakhatesvats e dzez harmaravet yan hamar',
    steps: [
      { icon: 'globe', num: '01', title: 'Amragreq Online kam Havelvatsov', desc: 'Amragreq mer kayqum kam mobil havelvatsov (iOS/Android). Gni akntart hastatun.' },
      { icon: 'calendar', num: '02', title: 'Nakhapatesvats Amragrum', desc: 'Amragreq orery kam shabatnery arach. Dzez transfery erashtkhavorvats e hastat gnov.' },
      { icon: 'mappin', num: '03', title: 'Handipeq Varorдin', desc: 'Stugvats varorдy spasun e zhamman vayruma anvayin tsutcanakov. 60 rope anvchar spasun.' },
      { icon: 'car', num: '04', title: 'Vayeleq Premium Harmaravety', desc: 'Chaporduneq maqur, odaparakutyunamb mequenayov (Mercedes, BMW).' },
    ],
    advantagesTitle: 'Inchu 50 000+ Chamorдnery Vstahum En Zont-in',
    advantages: [
      { icon: 'shield', title: 'Stugvats Varorдner', desc: 'Yuranqanchyur varorд stugvats e, litsenziavorvats ev gnaatvats mer hamayнqov.' },
      { icon: 'headphones', title: 'Ajaktsut yun 24/7', desc: 'Mer bazmalezvu tiy hасanel e shurjorayin.' },
      { icon: 'lock', title: 'Hastat Gner', desc: 'Giny vory tesnum eq, ayn vory vchaharum eq. Anakнkalner chkan.' },
      { icon: 'plane', title: 'Trchqin Hetevum', desc: 'Menq hetevm enq dzez trchqy. Ushats man depqum varordy harmarvun e avtomatikorun.' },
      { icon: 'zap', title: 'Anvchar Chegarkum', desc: 'Plannery pokhvets in? Chegarkec anvchar minchev 24 zham arach.' },
      { icon: 'creditcard', title: 'Apahov Vcharum', desc: 'Vcharec online Visa, Mastercard kam Apple Pay-ov.' },
    ],
    platformTitle: 'Amragreq Amenyur',
    platformSub: 'Hasaneli Web, iOS ev Android-um',
    platformPoints: [
      'Amragreq zont.cab-um chankatsats brauzerov',
      'Nerbernec anvchar havelvatsy App Store kam Google Play-ic',
      'Karavareq amragrumnery ev heteveq varorдin',
      'Pahpaneq sirac hascenery',
      'Statseq tsanucumner ev hastatumner',
    ],
    statsTitle: 'Zont Tverov',
    stats: [
      { val: '50 000+', label: 'Katarvats Ughevorut yunner' },
      { val: '16', label: 'Evropakan Qaghaqner' },
      { val: '4.5/5', label: 'Mijin Varkanish' },
      { val: '24/7', label: 'Ajaktsut yun' },
    ],
    reviewsTitle: 'Inch Asum En Mer Hashakhordnery',
    reviews: [],
    ctaTitle: 'Patras eq Premium Transferi Hamar?',
    ctaSub: 'Miaceq 50 000+ goh chamorдnerun.',
    ctaWeb: 'Amragrel Online',
    ctaApp: 'Nerbernal Havelvatsy',
    faqTitle: 'Hachakh Trvats Harcser',
    faqs: [
      { q: 'Qani zham arach karol em amragrel?', a: 'Karoq eq amragrel orery, shabatnery kam amisнery arach.' },
      { q: 'Inch klini yete trchqs ushanum e?', a: 'Menq hetevm enq boloр trchqnery. Varordy avtomatikoran harmonvum e.' },
      { q: 'Inchpes en stugvum varorдnery?', a: 'Boloр varorднery stugvats en, litsenziavorvats ev gnaatvats en ughevorнerov.' },
      { q: 'Karol em chegel amrагrumy?', a: 'Ayo, anvchar 24 zham arach.' },
    ],
  },
  es: {
    seoTitle: 'Hazte cliente ZONT | Traslados privados con conductor en Paris',
    seoDesc: 'Hazte cliente ZONT y reserva tu traslado privado en Paris en 2 minutos. Precio fijo, conductor profesional, app movil iOS/Android, soporte 24/7. \u00a1Unete a mas de 50 000 viajeros!',
    heroTitle: 'Tu traslado premium',
    heroAccent: 'Reservado en 2 minutos',
    heroSub: 'Precios fijos. Conductores verificados. Asistencia 24/7. Reserva online o en la app en 16 ciudades europeas.',
    heroCta: 'Reservar ahora',
    heroCtaApp: 'Descargar la app',
    stepsTitle: 'Reserva tu traslado en 4 pasos simples',
    stepsSub: 'Desde la reserva hasta la llegada, todo esta pensado para tu comodidad',
    steps: [
      { icon: 'globe', num: '01', title: 'Reserva online o en la app', desc: 'Reserva en nuestra web o en la app movil (iOS/Android). Confirmacion instantanea de precio sin sorpresas.' },
      { icon: 'calendar', num: '02', title: 'Reserva anticipada', desc: 'Reserva con dias o semanas de antelacion. Tu traslado queda garantizado a precio fijo desde el primer momento.' },
      { icon: 'mappin', num: '03', title: 'Encuentra a tu conductor', desc: 'Tu conductor verificado te espera en llegadas con un cartel personalizado. 60 minutos de espera gratis si tu vuelo se retrasa.' },
      { icon: 'car', num: '04', title: 'Disfruta del confort premium', desc: 'Viaja en un vehiculo limpio y climatizado (Mercedes, BMW). Valora tu experiencia despues de cada trayecto.' },
    ],
    advantagesTitle: 'Por que mas de 50 000 viajeros confian en ZONT',
    advantages: [
      { icon: 'shield', title: 'Conductores verificados', desc: 'Cada conductor pasa un control de antecedentes, tiene licencia VTC y es valorado por nuestra comunidad. Tu seguridad es nuestra prioridad.' },
      { icon: 'headphones', title: 'Asistencia 24/7', desc: 'Nuestro equipo multilingue de soporte esta disponible las 24 horas. Antes, durante y despues de tu viaje.' },
      { icon: 'lock', title: 'Precios fijos garantizados', desc: 'El precio que ves es el precio que pagas. Sin recargos por hora punta, sin gastos ocultos. Peajes incluidos.' },
      { icon: 'plane', title: 'Seguimiento de vuelos en tiempo real', desc: 'Monitoramos tu vuelo en directo. Si hay retraso, tu conductor se adapta automaticamente sin coste adicional.' },
      { icon: 'zap', title: 'Cancelacion gratis', desc: '\u00bfCambio de planes? Cancela gratis hasta 24 horas antes de tu traslado. Flexibilidad total garantizada.' },
      { icon: 'creditcard', title: 'Pago seguro', desc: 'Paga online de forma segura con Visa, Mastercard o Apple Pay. Tus datos estan cifrados y protegidos.' },
    ],
    platformTitle: 'Reserva donde quieras, cuando quieras',
    platformSub: 'Disponible en Web, iOS y Android',
    platformPoints: [
      'Reserva al instante en zont.cab desde cualquier navegador',
      'Descarga la app gratis en App Store o Google Play',
      'Gestiona tus reservas y sigue a tu conductor en tiempo real',
      'Guarda tus direcciones favoritas para reservar mas rapido',
      'Recibe notificaciones y confirmaciones de reserva al instante',
    ],
    statsTitle: 'ZONT en cifras',
    stats: [
      { val: '50 000+', label: 'Viajes realizados' },
      { val: '16', label: 'Ciudades europeas' },
      { val: '4.5/5', label: 'Valoracion media' },
      { val: '24/7', label: 'Asistencia disponible' },
    ],
    reviewsTitle: 'Lo que dicen nuestros clientes',
    reviews: [],
    ctaTitle: '\u00bfListo para descubrir el traslado premium?',
    ctaSub: 'Unete a mas de 50 000 viajeros satisfechos. Reserva tu primer traslado hoy mismo.',
    ctaWeb: 'Reservar online',
    ctaApp: 'Descargar la app',
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      { q: '\u00bfCon cuanta antelacion puedo reservar?', a: 'Puedes reservar tu traslado con dias, semanas e incluso meses de antelacion. Cuanto antes reserves, mayor sera la disponibilidad y mas garantia de obtener el vehiculo que prefieras.' },
      { q: '\u00bfQue pasa si mi vuelo se retrasa?', a: 'Hacemos seguimiento de todos los vuelos en tiempo real. Si tu vuelo se retrasa, tu conductor ajusta automaticamente su hora de llegada sin coste adicional. Disfrutas de 60 minutos de espera gratis.' },
      { q: '\u00bfComo se verifican los conductores?', a: 'Todos los conductores pasan un control de antecedentes, poseen licencias profesionales VTC validas y son valorados continuamente por nuestros pasajeros. Solo los mejores siguen activos en la plataforma.' },
      { q: '\u00bfPuedo cancelar mi reserva?', a: 'Si, puedes cancelar gratis hasta 24 horas antes de tu traslado. Pasado ese plazo se pueden aplicar gastos de cancelacion segun el caso.' },
      { q: '\u00bfHay que pagar deposito al reservar?', a: 'No exigimos deposito. Puedes pagar el total al reservar o eligir pago al conductor en algunos casos. Aceptamos Visa, Mastercard, AMEX y Apple Pay.' },
      { q: '\u00bfEl conductor habla espanol?', a: 'Tenemos conductores que hablan espanol, ingles y frances. Si deseas un conductor hispanohablante, indicalo al reservar y haremos lo posible por asignarte uno.' },
    ],
  },
};

const iconMap = {
  globe: Globe, calendar: Calendar, mappin: MapPin, car: Car,
  shield: Shield, headphones: Headphones, lock: Lock, plane: Plane,
  zap: Zap, creditcard: CreditCard,
};

const BecomeClient = () => {
  const { language, changeLanguage } = useLanguage();
  // Force Spanish when accessed via the /es/hazte-cliente URL so the SEO content & SEO meta line up with the route
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/es') && language !== 'es') {
      changeLanguage('es');
    }
  }, [language, changeLanguage]);
  const c = content[language] || content.en;
  const isEs = typeof window !== 'undefined' && window.location.pathname.startsWith('/es');
  const canonical = isEs ? 'https://www.zont.cab/es/hazte-cliente' : 'https://www.zont.cab/become-client';

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="become-client-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical={canonical}
        hreflang={[
          { lang: 'en', href: 'https://www.zont.cab/become-client' },
          { lang: 'es', href: 'https://www.zont.cab/es/hazte-cliente' },
          { lang: 'x-default', href: 'https://www.zont.cab/become-client' },
        ]}
        jsonLd={[{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Zont Airport Transfer",
          "description": c.seoDesc,
          "url": "https://www.zont.cab",
          "image": "https://www.zont.cab/logo512.png",
          "telephone": "+33600000000",
          "address": { "@type": "PostalAddress", "addressLocality": "Paris", "addressCountry": "FR" },
          "priceRange": "$$",
          "areaServed": { "@type": "Place", "name": "Europe" },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Airport Transfer Services",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sedan Transfer" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Premium Transfer" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Luxury Transfer" } }
            ]
          }
        }]}
      />
      <Header />

      {/* HERO */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#2ecc71]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#2ecc71]/3 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#2ecc71]/10 text-[#2ecc71] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <BadgeCheck className="w-4 h-4" />
            <span>16 {language === 'fr' ? 'villes europeennes' : language === 'ru' ? 'городов Европы' : 'European cities'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight" data-testid="client-h1">
            {c.heroTitle}
          </h1>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2ecc71] mb-6">{c.heroAccent}</p>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-10">{c.heroSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 bg-[#2ecc71] text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/25" data-testid="hero-cta-book">
              {c.heroCta} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="https://apps.apple.com/am/app/zont-cab/id1468482270" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-white/20 transition-all border border-white/10" data-testid="hero-cta-app">
              <Smartphone className="w-5 h-5" /> {c.heroCtaApp}
            </a>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-8 px-4 bg-[#0f1419] border-y border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {c.stats.map((s, i) => (
            <div key={i} className="text-center" data-testid={`stat-${i}`}>
              <div className="text-2xl md:text-3xl font-bold text-[#2ecc71]">{s.val}</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 STEPS */}
      <section className="py-16 md:py-24 px-4 bg-[#1a2332]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{c.stepsTitle}</h2>
            <p className="text-gray-400 text-sm md:text-base">{c.stepsSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {c.steps.map((step, i) => {
              const Icon = iconMap[step.icon] || CheckCircle;
              return (
                <div key={i} className="group relative bg-[#0f1419] rounded-2xl p-6 border border-gray-800 hover:border-[#2ecc71]/40 transition-all" data-testid={`step-${i}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-[#2ecc71]/10 rounded-xl flex items-center justify-center group-hover:bg-[#2ecc71]/20 transition-colors">
                        <Icon className="w-7 h-7 text-[#2ecc71]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#2ecc71]/60 mb-1">{step.num}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ADVANTAGES */}
      <section className="py-16 md:py-24 px-4 bg-[#0f1419]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-14">{c.advantagesTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.advantages.map((adv, i) => {
              const Icon = iconMap[adv.icon] || CheckCircle;
              return (
                <div key={i} className="bg-[#1a2332] rounded-xl p-5 border border-gray-800" data-testid={`advantage-${i}`}>
                  <div className="w-11 h-11 bg-[#2ecc71]/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#2ecc71]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{adv.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{adv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PLATFORM - Web & App */}
      <section className="py-16 md:py-24 px-4 bg-[#1a2332]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#0f1419] to-[#1a2332] rounded-2xl border border-gray-800 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{c.platformTitle}</h2>
                <p className="text-[#2ecc71] font-semibold mb-6">{c.platformSub}</p>
                <ul className="space-y-3">
                  {c.platformPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#2ecc71] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4 items-center">
                <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-700 w-full max-w-xs text-center">
                  <Globe className="w-12 h-12 text-[#2ecc71] mx-auto mb-3" />
                  <p className="text-white font-bold mb-1">zont.cab</p>
                  <p className="text-xs text-gray-400 mb-4">{language === 'fr' ? 'Reservez depuis votre navigateur' : 'Book from your browser'}</p>
                  <Link to="/" className="inline-flex items-center gap-1 text-[#2ecc71] font-semibold text-sm hover:underline">
                    {c.ctaWeb} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="bg-[#1a2332] rounded-2xl p-6 border border-gray-700 w-full max-w-xs text-center">
                  <Smartphone className="w-12 h-12 text-[#2ecc71] mx-auto mb-3" />
                  <p className="text-white font-bold mb-1">iOS & Android</p>
                  <p className="text-xs text-gray-400 mb-4">{language === 'fr' ? 'App gratuite sur les stores' : 'Free app on stores'}</p>
                  <div className="flex gap-2 justify-center">
                    <a href="https://apps.apple.com/am/app/zont-cab/id1468482270" target="_blank" rel="noopener noreferrer" className="text-[#2ecc71] font-semibold text-sm hover:underline">App Store</a>
                    <span className="text-gray-600">|</span>
                    <a href="https://play.google.com/store/apps/details?id=com.zont.rider" target="_blank" rel="noopener noreferrer" className="text-[#2ecc71] font-semibold text-sm hover:underline">Google Play</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-16 md:py-24 px-4 bg-[#0f1419]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{c.reviewsTitle}</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
              <span className="text-gray-300 text-sm ml-2">4.5/5</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {c.reviews.map((r, i) => (
              <div key={i} className="bg-[#1a2332] rounded-xl p-5 border border-gray-800" data-testid={`review-${i}`}>
                <div className="flex gap-1 mb-3">
                  {[...Array(r.stars)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-300 text-sm italic mb-4">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#2ecc71] rounded-full flex items-center justify-center text-white font-bold text-sm">{r.name.charAt(0)}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{r.name}</p>
                    <p className="text-gray-500 text-xs">{r.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 bg-[#1a2332]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{c.faqTitle}</h2>
          <div className="space-y-4">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group bg-[#0f1419] rounded-xl border border-gray-800" data-testid={`faq-${i}`}>
                <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-semibold text-sm list-none">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60]">
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{c.ctaTitle}</h2>
          <p className="text-white/80 mb-8 text-base">{c.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 bg-white text-[#2ecc71] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-xl" data-testid="cta-web">
              <Globe className="w-5 h-5" /> {c.ctaWeb}
            </Link>
            <a href="https://apps.apple.com/am/app/zont-cab/id1468482270" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/30 transition-colors border border-white/30" data-testid="cta-app">
              <Smartphone className="w-5 h-5" /> {c.ctaApp}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeClient;
