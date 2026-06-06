import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import {
  Plane, Building2, Users, Briefcase, MapPin, Phone, MessageCircle, Mail,
  CheckCircle2, Clock, Shield, Award, Crown, Calendar, ArrowRight, Loader2
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const WHATSAPP = 'https://wa.me/33783777027';
const PHONE = '+33783777027';

// ─────────────────────────────────────────────────────────────────────────────
//  CONTENT — EN / FR / RU
// ─────────────────────────────────────────────────────────────────────────────
const content = {
  en: {
    metaTitle: 'MICE Transportation Paris | Chauffeur & Event Transport Services | ZONT',
    metaDesc: 'Professional MICE transportation in Paris. Chauffeur services, airport transfers, conference shuttles, VIP travel and group transportation for events.',
    h1: 'MICE Transportation in Paris',
    subtitle: 'Professional Chauffeur & Event Transport Services',
    heroDesc: 'Premium ground transportation for Meetings, Incentives, Conferences and Exhibitions in Paris and Île-de-France.',
    ctaQuote: 'Request a MICE Quote',
    ctaCall: 'Call us',
    ctaWhatsApp: 'WhatsApp',

    intro1: 'Zont provides professional MICE transportation services in Paris for meetings, incentives, conferences, exhibitions, trade shows, corporate events, and international business travel. We help event organizers, travel agencies, DMCs, hotels, corporate clients, and conference planners manage transportation efficiently across Paris and Île-de-France.',
    intro2: 'Whether you need airport transfers for VIP guests, shuttle services between hotels and event venues, executive chauffeur services, or transportation for large groups, Zont delivers reliable, scalable, and professional mobility solutions tailored to your event requirements.',

    miceTitle: 'What is MICE Transportation?',
    miceText: 'MICE stands for Meetings, Incentives, Conferences, and Exhibitions. Successful events require precise transportation planning, punctual drivers, and seamless coordination between airports, hotels, conference centers, and event venues. Our dedicated operations team ensures that every guest, speaker, executive, and attendee arrives comfortably and on time.',

    airportsTitle: 'Airport Transfers for Conferences and Events',
    airportsDesc: 'Real-time flight tracking, meet-and-greet for VIP guests, executives, speakers and international delegations.',
    airports: [
      { name: 'Paris Charles de Gaulle (CDG)', icon: 'plane' },
      { name: 'Paris Orly Airport (ORY)', icon: 'plane' },
      { name: 'Paris Beauvais Airport (BVA)', icon: 'plane' },
      { name: 'Private aviation & business airports', icon: 'crown' },
    ],

    venuesTitle: 'Event Transportation Across Paris',
    venuesDesc: 'Coordination for major conferences, exhibitions, conventions and corporate events.',
    venues: [
      'Paris Expo Porte de Versailles',
      'Palais des Congrès de Paris',
      'Le Bourget Exhibition Centre',
      'Carrousel du Louvre',
      'Disneyland Paris',
      'La Défense business district',
    ],

    execTitle: 'Executive Chauffeur Services',
    execDesc: 'For senior executives, corporate clients and VIP guests, our experienced professional drivers deliver premium chauffeur-driven transportation.',
    execList: [
      'Executive airport transfers',
      'Business meetings',
      'Roadshows',
      'Corporate hospitality',
      'VIP transportation',
      'Private chauffeur by the hour',
      'Multi-day chauffeur services',
    ],

    groupTitle: 'Group Transportation & Event Logistics',
    groupDesc: 'Managing transportation for groups requires careful planning and operational expertise.',
    groupList: [
      { title: 'Business-class sedans', desc: 'Mercedes E-Class / BMW 5 Series — up to 3 passengers' },
      { title: 'Executive vehicles', desc: 'Mercedes S-Class / BMW 7 Series — for VIPs' },
      { title: 'Premium minivans', desc: 'Mercedes V-Class — up to 7 passengers with luggage' },
      { title: 'Minibuses', desc: '8-seater Renault Trafic or similar' },
      { title: 'Group transportation', desc: 'Coaches up to 50+ passengers' },
      { title: 'Multiple-vehicle coordination', desc: 'Fleet dispatching for large delegations' },
    ],

    partnersTitle: 'Transportation for Hotels & Event Agencies',
    partnersDesc: 'Flexible B2B solutions for partners who need to manage transportation requests at scale.',
    partnersList: [
      'Event organizers',
      'Destination Management Companies (DMCs)',
      'Travel agencies',
      'Tour operators',
      'Hotels',
      'Corporate travel departments',
      'Conference organizers',
    ],

    whyTitle: 'Why Choose Zont for MICE Transportation in Paris?',
    whyList: [
      { title: 'Professional chauffeurs', icon: 'shield' },
      { title: '24/7 operational support', icon: 'clock' },
      { title: 'Real-time coordination', icon: 'calendar' },
      { title: 'Fixed and transparent pricing', icon: 'award' },
      { title: 'Airport meet-and-greet service', icon: 'plane' },
      { title: 'Executive and group transportation', icon: 'users' },
      { title: 'Coverage across Paris and Île-de-France', icon: 'map' },
      { title: 'Dedicated support for event organizers', icon: 'briefcase' },
      { title: 'Reliable for international guests', icon: 'crown' },
    ],

    formTitle: 'Request a MICE Transportation Quote',
    formDesc: 'Planning a conference, exhibition, corporate event, incentive trip, or business meeting in Paris? Our team will respond with a customized proposal within 24 hours.',
    formName: 'Your Name',
    formCompany: 'Company Name',
    formEmail: 'Professional Email',
    formPhone: 'Phone',
    formMessage: 'Describe your event: dates, number of guests, main routes, venues...',
    formSubmit: 'Send Quote Request',
    formSending: 'Sending...',
    formSuccess: 'Thank you! Our team will contact you within 24 hours.',
    formError: 'An error occurred. Please try again or contact us by WhatsApp.',

    closing: 'Zont — Your trusted MICE transportation partner in Paris.',
  },

  fr: {
    metaTitle: 'Transport MICE Paris | Chauffeur d\'Affaires & Événementiel | ZONT',
    metaDesc: 'Transport MICE à Paris pour congrès, séminaires et événements : chauffeurs professionnels, transferts aéroport, navettes VIP et flotte premium.',
    h1: 'Transport MICE à Paris',
    subtitle: 'Services Professionnels Chauffeur & Événementiel',
    heroDesc: 'Transport haut de gamme pour Réunions, Incentives, Congrès et Salons à Paris et en Île-de-France.',
    ctaQuote: 'Demander un devis MICE',
    ctaCall: 'Nous appeler',
    ctaWhatsApp: 'WhatsApp',

    intro1: 'Zont fournit des services de transport MICE professionnels à Paris pour les réunions, incentives, congrès, salons, foires, événements corporate et voyages d\'affaires internationaux. Nous aidons les organisateurs d\'événements, agences de voyage, DMC, hôtels, clients corporate et planificateurs de congrès à gérer efficacement le transport à Paris et en Île-de-France.',
    intro2: 'Que vous ayez besoin de transferts aéroport pour des invités VIP, de navettes entre hôtels et lieux d\'événements, de services chauffeur exécutif ou de transport pour groupes importants, Zont propose des solutions de mobilité fiables, évolutives et professionnelles adaptées à vos exigences événementielles.',

    miceTitle: 'Qu\'est-ce que le Transport MICE ?',
    miceText: 'MICE signifie Meetings, Incentives, Conferences and Exhibitions (Réunions, Incentives, Congrès et Salons). Les événements réussis nécessitent une planification précise du transport, des chauffeurs ponctuels et une coordination parfaite entre aéroports, hôtels, centres de congrès et lieux d\'événements. Notre équipe opérationnelle dédiée garantit que chaque invité, intervenant, dirigeant et participant arrive confortablement et à l\'heure.',

    airportsTitle: 'Transferts Aéroport pour Congrès et Événements',
    airportsDesc: 'Suivi des vols en temps réel, accueil VIP pour invités, dirigeants, intervenants et délégations internationales.',
    airports: [
      { name: 'Paris Charles de Gaulle (CDG)', icon: 'plane' },
      { name: 'Aéroport Paris-Orly (ORY)', icon: 'plane' },
      { name: 'Aéroport Paris-Beauvais (BVA)', icon: 'plane' },
      { name: 'Aviation privée & aéroports d\'affaires', icon: 'crown' },
    ],

    venuesTitle: 'Transport Événementiel à Paris',
    venuesDesc: 'Coordination pour congrès majeurs, salons, conventions et événements corporate.',
    venues: [
      'Paris Expo Porte de Versailles',
      'Palais des Congrès de Paris',
      'Parc des Expositions du Bourget',
      'Carrousel du Louvre',
      'Disneyland Paris',
      'Quartier d\'affaires La Défense',
    ],

    execTitle: 'Service Chauffeur Exécutif',
    execDesc: 'Pour les dirigeants, clients corporate et invités VIP, nos chauffeurs professionnels expérimentés assurent un transport premium avec chauffeur privé.',
    execList: [
      'Transferts aéroport exécutifs',
      'Rendez-vous d\'affaires',
      'Roadshows',
      'Réceptions corporate',
      'Transport VIP',
      'Chauffeur privé à l\'heure',
      'Service chauffeur multi-jours',
    ],

    groupTitle: 'Transport de Groupe & Logistique Événementielle',
    groupDesc: 'La gestion du transport pour les groupes nécessite une planification rigoureuse et une expertise opérationnelle.',
    groupList: [
      { title: 'Berlines business', desc: 'Mercedes Classe E / BMW Série 5 — jusqu\'à 3 passagers' },
      { title: 'Véhicules exécutifs', desc: 'Mercedes Classe S / BMW Série 7 — pour VIP' },
      { title: 'Vans premium', desc: 'Mercedes Classe V — jusqu\'à 7 passagers avec bagages' },
      { title: 'Minibus', desc: 'Renault Trafic 8 places ou similaire' },
      { title: 'Transport de groupe', desc: 'Autocars jusqu\'à 50+ passagers' },
      { title: 'Coordination multi-véhicules', desc: 'Dispatching de flotte pour grandes délégations' },
    ],

    partnersTitle: 'Transport pour Hôtels & Agences Événementielles',
    partnersDesc: 'Solutions B2B flexibles pour partenaires devant gérer des demandes de transport à grande échelle.',
    partnersList: [
      'Organisateurs d\'événements',
      'Destination Management Companies (DMC)',
      'Agences de voyage',
      'Tour-opérateurs',
      'Hôtels',
      'Départements voyage corporate',
      'Organisateurs de congrès',
    ],

    whyTitle: 'Pourquoi Choisir Zont pour le Transport MICE à Paris ?',
    whyList: [
      { title: 'Chauffeurs professionnels', icon: 'shield' },
      { title: 'Support opérationnel 24/7', icon: 'clock' },
      { title: 'Coordination temps réel', icon: 'calendar' },
      { title: 'Tarifs fixes et transparents', icon: 'award' },
      { title: 'Accueil aéroport meet-and-greet', icon: 'plane' },
      { title: 'Transport exécutif et de groupe', icon: 'users' },
      { title: 'Couverture Paris et Île-de-France', icon: 'map' },
      { title: 'Support dédié pour organisateurs', icon: 'briefcase' },
      { title: 'Fiable pour invités internationaux', icon: 'crown' },
    ],

    formTitle: 'Demander un Devis Transport MICE',
    formDesc: 'Vous organisez un congrès, salon, événement corporate, voyage d\'incentive ou réunion d\'affaires à Paris ? Notre équipe vous répondra avec une proposition personnalisée sous 24 heures.',
    formName: 'Votre nom',
    formCompany: 'Nom de la société',
    formEmail: 'Email professionnel',
    formPhone: 'Téléphone',
    formMessage: 'Décrivez votre événement : dates, nombre d\'invités, trajets principaux, lieux...',
    formSubmit: 'Envoyer la demande',
    formSending: 'Envoi en cours...',
    formSuccess: 'Merci ! Notre équipe vous contactera sous 24 heures.',
    formError: 'Une erreur est survenue. Veuillez réessayer ou nous contacter par WhatsApp.',

    closing: 'Zont — Votre partenaire de confiance pour le transport MICE à Paris.',
  },

  ru: {
    metaTitle: 'MICE Транспорт Париж | Услуги Шофёра & Транспорт для Мероприятий | ZONT',
    metaDesc: 'Профессиональный MICE транспорт в Париже. Услуги шофёра, трансферы из аэропорта, шаттлы для конференций, VIP перевозки и групповой транспорт.',
    h1: 'MICE Транспорт в Париже',
    subtitle: 'Профессиональные Услуги Шофёра & Транспорт для Мероприятий',
    heroDesc: 'Премиальный наземный транспорт для встреч, инсентивов, конференций и выставок в Париже и Иль-де-Франс.',
    ctaQuote: 'Запросить расчёт',
    ctaCall: 'Позвонить',
    ctaWhatsApp: 'WhatsApp',

    intro1: 'Zont предоставляет профессиональные MICE транспортные услуги в Париже для встреч, инсентивов, конференций, выставок, торговых шоу, корпоративных мероприятий и международных деловых поездок. Мы помогаем организаторам мероприятий, туристическим агентствам, DMC, отелям, корпоративным клиентам и организаторам конференций эффективно управлять транспортом в Париже и Иль-де-Франс.',
    intro2: 'Будь то трансферы из аэропорта для VIP-гостей, шаттлы между отелями и местами проведения мероприятий, услуги шофёра для руководителей или транспорт для больших групп — Zont предлагает надёжные, масштабируемые и профессиональные решения мобильности, адаптированные под требования вашего мероприятия.',

    miceTitle: 'Что такое MICE Транспорт?',
    miceText: 'MICE расшифровывается как Meetings, Incentives, Conferences and Exhibitions (Встречи, Инсентивы, Конференции и Выставки). Успешные мероприятия требуют точного планирования транспорта, пунктуальных водителей и безупречной координации между аэропортами, отелями, конференц-центрами и площадками. Наша операционная команда обеспечивает комфортное и своевременное прибытие каждого гостя, спикера, руководителя и участника.',

    airportsTitle: 'Трансферы из Аэропорта для Конференций и Мероприятий',
    airportsDesc: 'Отслеживание рейсов в реальном времени, встреча VIP-гостей, руководителей, спикеров и международных делегаций.',
    airports: [
      { name: 'Аэропорт Париж Шарль-де-Голль (CDG)', icon: 'plane' },
      { name: 'Аэропорт Париж-Орли (ORY)', icon: 'plane' },
      { name: 'Аэропорт Париж-Бове (BVA)', icon: 'plane' },
      { name: 'Частная авиация & бизнес-аэропорты', icon: 'crown' },
    ],

    venuesTitle: 'Транспорт для Мероприятий по Парижу',
    venuesDesc: 'Координация крупных конференций, выставок, конвенций и корпоративных мероприятий.',
    venues: [
      'Paris Expo Porte de Versailles',
      'Palais des Congrès de Paris',
      'Выставочный центр Le Bourget',
      'Carrousel du Louvre',
      'Диснейленд Париж',
      'Бизнес-район Ла Дефанс',
    ],

    execTitle: 'Услуги Шофёра для Руководителей',
    execDesc: 'Для топ-менеджеров, корпоративных клиентов и VIP-гостей наши опытные профессиональные водители обеспечивают премиальный транспорт с шофёром.',
    execList: [
      'VIP трансферы из аэропорта',
      'Деловые встречи',
      'Роудшоу',
      'Корпоративный приём',
      'VIP транспорт',
      'Частный шофёр почасово',
      'Многодневное сопровождение',
    ],

    groupTitle: 'Групповой Транспорт & Событийная Логистика',
    groupDesc: 'Управление транспортом для групп требует тщательного планирования и операционного опыта.',
    groupList: [
      { title: 'Бизнес-седаны', desc: 'Mercedes E-Class / BMW 5 Series — до 3 пассажиров' },
      { title: 'Executive автомобили', desc: 'Mercedes S-Class / BMW 7 Series — для VIP' },
      { title: 'Премиальные минивэны', desc: 'Mercedes V-Class — до 7 пассажиров с багажом' },
      { title: 'Микроавтобусы', desc: 'Renault Trafic 8 мест или аналог' },
      { title: 'Групповой транспорт', desc: 'Автобусы до 50+ пассажиров' },
      { title: 'Координация нескольких машин', desc: 'Диспетчеризация флота для делегаций' },
    ],

    partnersTitle: 'Транспорт для Отелей & Событийных Агентств',
    partnersDesc: 'Гибкие B2B решения для партнёров, управляющих транспортными запросами в большом объёме.',
    partnersList: [
      'Организаторы мероприятий',
      'Destination Management Companies (DMC)',
      'Туристические агентства',
      'Туроператоры',
      'Отели',
      'Корпоративные тревел-отделы',
      'Организаторы конференций',
    ],

    whyTitle: 'Почему Выбирают Zont для MICE Транспорта в Париже?',
    whyList: [
      { title: 'Профессиональные водители', icon: 'shield' },
      { title: 'Операционная поддержка 24/7', icon: 'clock' },
      { title: 'Координация в реальном времени', icon: 'calendar' },
      { title: 'Фиксированные прозрачные цены', icon: 'award' },
      { title: 'Встреча в аэропорту', icon: 'plane' },
      { title: 'Executive и групповой транспорт', icon: 'users' },
      { title: 'Покрытие Париж и Иль-де-Франс', icon: 'map' },
      { title: 'Поддержка для организаторов', icon: 'briefcase' },
      { title: 'Надёжность для международных гостей', icon: 'crown' },
    ],

    formTitle: 'Запросить Расчёт MICE Транспорта',
    formDesc: 'Планируете конференцию, выставку, корпоративное мероприятие, инсентив-поездку или деловую встречу в Париже? Наша команда ответит с индивидуальным предложением в течение 24 часов.',
    formName: 'Ваше имя',
    formCompany: 'Название компании',
    formEmail: 'Корпоративный email',
    formPhone: 'Телефон',
    formMessage: 'Опишите ваше мероприятие: даты, число гостей, основные маршруты, площадки...',
    formSubmit: 'Отправить заявку',
    formSending: 'Отправка...',
    formSuccess: 'Спасибо! Наша команда свяжется с вами в течение 24 часов.',
    formError: 'Произошла ошибка. Попробуйте снова или напишите нам в WhatsApp.',

    closing: 'Zont — Ваш надёжный партнёр по MICE транспорту в Париже.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  URL MAP (for language switcher + canonical/hreflang)
// ─────────────────────────────────────────────────────────────────────────────
const URLS = {
  en: '/mice-transportation-paris',
  fr: '/transport-mice-paris',
  ru: '/mice-transport-parij',
};

const iconMap = {
  plane: Plane, crown: Crown, shield: Shield, clock: Clock, calendar: Calendar,
  award: Award, users: Users, map: MapPin, briefcase: Briefcase, building: Building2,
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const MICETransportation = () => {
  const { language } = useLanguage();
  const location = useLocation();
  // Detect language from URL slug (overrides LanguageContext for SEO accuracy)
  const detectedLang = (() => {
    if (location.pathname === URLS.fr) return 'fr';
    if (location.pathname === URLS.ru) return 'ru';
    if (location.pathname === URLS.en) return 'en';
    return language; // fallback
  })();
  const t = content[detectedLang] || content.en;
  const currentPath = URLS[detectedLang] || URLS.en;

  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source_page: location.pathname }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      setForm({ name: '', company: '', email: '', phone: '', message: '' });
    } catch {
      setError(t.formError);
    } finally {
      setSubmitting(false);
    }
  };

  // Schema.org
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: t.h1,
    description: t.heroDesc,
    provider: { '@type': 'TaxiService', name: 'ZONT.CAB', url: 'https://www.zont.cab', telephone: PHONE },
    areaServed: { '@type': 'City', name: 'Paris', containedInPlace: { '@type': 'AdministrativeArea', name: 'Île-de-France' } },
    serviceType: 'MICE Transportation, Corporate Chauffeur, Group Transfer',
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white" data-testid="mice-page">
      <SEO
        title={t.metaTitle}
        description={t.metaDesc}
        canonical={`https://www.zont.cab${currentPath}`}
        jsonLd={[schema]}
      />
      <Header />

      <main className="pt-16">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <picture>
              <source media="(max-width: 800px)" srcSet="/images/mice-transportation-paris-fleet-800.webp" />
              <img
                src="/images/mice-transportation-paris-fleet.webp"
                alt="ZONT.CAB MICE fleet of luxury Mercedes vehicles in front of Disneyland Hotel Paris"
                width="1536"
                height="1024"
                className="w-full h-full object-cover"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/85 via-[#0a0f1c]/75 to-[#0a0f1c]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 mb-5 text-xs font-semibold tracking-wider uppercase text-[#2ecc71] bg-[#2ecc71]/10 border border-[#2ecc71]/30 rounded-full">
                B2B · Corporate · Events
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{t.h1}</h1>
              <p className="text-lg sm:text-xl text-[#2ecc71] font-medium mb-4">{t.subtitle}</p>
              <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">{t.heroDesc}</p>

              <div className="flex flex-wrap gap-3">
                <a href="#mice-quote-form" className="inline-flex items-center gap-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold px-6 py-3.5 rounded-lg shadow-lg transition-all hover:scale-105" data-testid="hero-cta-quote">
                  {t.ctaQuote} <ArrowRight className="w-4 h-4" />
                </a>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-5 py-3.5 rounded-lg transition-colors" data-testid="hero-cta-whatsapp">
                  <MessageCircle className="w-4 h-4" /> {t.ctaWhatsApp}
                </a>
                <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-5 py-3.5 rounded-lg transition-colors" data-testid="hero-cta-call">
                  <Phone className="w-4 h-4" /> {t.ctaCall}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTRO ── */}
        <section className="py-14 sm:py-20 px-4">
          <div className="max-w-4xl mx-auto space-y-5 text-base sm:text-lg text-gray-300 leading-relaxed">
            <p>{t.intro1}</p>
            <p>{t.intro2}</p>
          </div>
        </section>

        {/* ── WHAT IS MICE ── */}
        <section className="py-14 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5">{t.miceTitle}</h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{t.miceText}</p>
          </div>
        </section>

        {/* ── AIRPORTS ── */}
        <section className="py-14 sm:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.airportsTitle}</h2>
            <p className="text-gray-400 mb-10 max-w-2xl">{t.airportsDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.airports.map((a, i) => {
                const Icon = iconMap[a.icon] || Plane;
                return (
                  <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl p-5 hover:border-[#2ecc71]/30 transition-colors">
                    <Icon className="w-6 h-6 text-[#2ecc71] mb-3" />
                    <p className="text-white font-medium text-sm">{a.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── VENUES ── */}
        <section className="py-14 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.venuesTitle}</h2>
            <p className="text-gray-400 mb-10 max-w-2xl">{t.venuesDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {t.venues.map((v, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3">
                  <Building2 className="w-4 h-4 text-[#2ecc71] flex-shrink-0" />
                  <span className="text-white text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXECUTIVE ── */}
        <section className="py-14 sm:py-20 px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <Crown className="w-10 h-10 text-[#2ecc71] mb-5" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.execTitle}</h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{t.execDesc}</p>
            </div>
            <ul className="space-y-2.5">
              {t.execList.map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2ecc71] mt-0.5 flex-shrink-0" />
                  <span className="text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── GROUP TRANSPORTATION ── */}
        <section className="py-14 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.groupTitle}</h2>
            <p className="text-gray-400 mb-10 max-w-3xl">{t.groupDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.groupList.map((g, i) => (
                <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl p-5 hover:border-[#2ecc71]/30 transition-colors">
                  <h3 className="text-white font-semibold mb-1.5">{g.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTNERS ── */}
        <section className="py-14 sm:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.partnersTitle}</h2>
            <p className="text-gray-400 mb-10 max-w-3xl">{t.partnersDesc}</p>
            <div className="flex flex-wrap gap-3">
              {t.partnersList.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-sm text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2ecc71]" />{p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY ZONT ── */}
        <section className="py-14 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 text-center">{t.whyTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.whyList.map((w, i) => {
                const Icon = iconMap[w.icon] || CheckCircle2;
                return (
                  <div key={i} className="flex items-start gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-5 hover:border-[#2ecc71]/30 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#2ecc71]/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-[#2ecc71]" />
                    </div>
                    <p className="text-white font-medium text-sm sm:text-base">{w.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CONTACT FORM ── */}
        <section id="mice-quote-form" className="py-16 sm:py-24 px-4 bg-gradient-to-b from-transparent to-[#2ecc71]/[0.05]">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.formTitle}</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">{t.formDesc}</p>

              {submitted ? (
                <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/30 rounded-xl p-6 text-center" data-testid="mice-form-success">
                  <CheckCircle2 className="w-12 h-12 text-[#2ecc71] mx-auto mb-3" />
                  <p className="text-white text-lg font-semibold">{t.formSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="mice-form">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="text" required placeholder={t.formName} value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]"
                      data-testid="mice-form-name" />
                    <input type="text" required placeholder={t.formCompany} value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]"
                      data-testid="mice-form-company" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="email" required placeholder={t.formEmail} value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]"
                      data-testid="mice-form-email" />
                    <input type="tel" placeholder={t.formPhone} value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]"
                      data-testid="mice-form-phone" />
                  </div>
                  <textarea required rows="5" placeholder={t.formMessage} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] resize-none"
                    data-testid="mice-form-message" />

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button type="submit" disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="mice-form-submit">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    {submitting ? t.formSending : t.formSubmit}
                  </button>

                  <div className="flex flex-wrap gap-3 pt-2 text-xs text-gray-400 justify-center">
                    <a href={`mailto:partners@zont.cab`} className="inline-flex items-center gap-1 hover:text-[#2ecc71] transition-colors">
                      <Mail className="w-3 h-3" /> partners@zont.cab
                    </a>
                    <span>·</span>
                    <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#2ecc71] transition-colors">
                      <MessageCircle className="w-3 h-3" /> {t.ctaWhatsApp}
                    </a>
                    <span>·</span>
                    <a href={`tel:${PHONE}`} className="inline-flex items-center gap-1 hover:text-[#2ecc71] transition-colors">
                      <Phone className="w-3 h-3" /> +33 7 83 77 70 27
                    </a>
                  </div>
                </form>
              )}
            </div>

            <p className="text-center text-gray-400 mt-10 text-base italic">{t.closing}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MICETransportation;
export { URLS as MICE_URLS };
