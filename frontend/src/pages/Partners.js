import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircle, ArrowRight, Mail, Building2, Briefcase, Hotel, Star, Users,
  Plane, ChevronRight, Shield, Clock, Globe, Headphones, TrendingUp, Lock, Percent,
} from 'lucide-react';
import { trackLead } from '@/utils/fbPixel';
import { matchPathToLanguage, MULTI_LANG_URLS } from '@/utils/pageUrlMaps';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SITE = 'https://www.zont.cab';

const content = {
  en: {
    seoTitle: 'B2B Airport Transfers Paris — Agency Partner Program | ZONT',
    seoDesc: 'B2B airport transfers for travel agencies, hotels, concierges and tour operators in Paris and Europe. 12-20% commission on Premium & Vans, wholesale rates never shown to your client, resell at any price.',
    badge: 'B2B Airport Transfers',
    heroTitle: 'B2B Airport Transfers for Travel Professionals',
    heroSub: 'Partner with ZONT to offer reliable airport transfers and private chauffeur services to your clients in Paris, France, Monaco and across Europe — with 12-20% commission on Premium and Van vehicles, and confidential wholesale rates.',
    ctaPartner: 'Become a Partner',
    ctaQuote: 'Request Wholesale Rates',

    // NEW — Commission & resale block
    commissionTitle: 'Earn More on Every Booking',
    commissionSub: 'A wholesale model designed for travel professionals — keep full margin control.',
    commissionPoints: [
      {
        icon: 'percent',
        title: '12% to 20% commission',
        desc: 'Earn 12% to 20% commission on every booking, with the highest rates on our Premium fleet and Vans (Mercedes S-Class, V-Class, Renault Trafic).',
      },
      {
        icon: 'lock',
        title: 'Wholesale rates never exposed',
        desc: 'Our partner pricing is private and never displayed to your client. They only see the price you choose to charge.',
      },
      {
        icon: 'trending-up',
        title: 'Sell at your own price',
        desc: 'Resell our transfers at any markup you want. Add your own margin on top of our wholesale rates with full pricing freedom.',
      },
    ],

    whoTitle: 'Who We Work With',
    whoSub: 'Tailored B2B transport solutions for every professional channel',
    servicesTitle: 'B2B Transport Services',
    servicesSub: 'A comprehensive catalogue you can resell to your clients under your own brand pricing',
    services: [
      { title: 'Airport Transfers', desc: 'Reliable pickups and drop-offs at CDG, Orly, Beauvais and all European hubs. Flight tracking, meet & greet, free waiting time.' },
      { title: 'Train Station Transfers', desc: 'Professional transfers from Gare du Nord, Lyon, Montparnasse and all major TGV stations. Punctual, branded service.' },
      { title: 'Chauffeur at Disposal', desc: 'Dedicated driver by the hour (4h / 8h / 12h). Ideal for VIP roadshows, site visits and luxury day-trips.' },
      { title: 'City-to-City Transfers', desc: 'Long-distance comfort transfers between European cities and resort towns. Bypass airline schedules.' },
      { title: 'Group Transportation', desc: 'Vans and minibuses for groups of 7 to 16 passengers. Perfect for delegations, families and small tour groups.' },
      { title: 'VIP & Luxury Service', desc: 'Mercedes S-Class flagship vehicles, multilingual senior chauffeurs, total discretion for HNW and diplomatic guests.' },
    ],

    whyTitle: 'Why Travel Professionals Choose ZONT',
    whySub: 'A partnership built on margin, reliability and brand discretion',
    whyPoints: [
      { icon: 'shield', title: 'Confidential Wholesale Pricing', desc: 'B2B rates locked behind partner login. Your client never sees our cost.' },
      { icon: 'percent', title: '12-20% Commission on Premium & Vans', desc: 'The highest commission tier is reserved for high-margin vehicle categories.' },
      { icon: 'trending-up', title: 'Resell at Your Markup', desc: 'No price floor enforced — invoice your client at any rate you choose.' },
      { icon: 'users', title: 'Vetted Professional Chauffeurs', desc: 'Licensed VTC drivers, English/French/Russian/Arabic on request.' },
      { icon: 'plane', title: 'Real-Time Flight Monitoring', desc: 'Automatic tracking of every arrival. Delay-proof, no rebooking fees.' },
      { icon: 'star', title: 'Meet & Greet Included', desc: 'Driver waits with a personalised sign — luggage assistance, hotel handover.' },
      { icon: 'clock', title: '24/7 Operations', desc: 'Book transfers day or night via our portal, API or dedicated WhatsApp line.' },
      { icon: 'headphones', title: 'Dedicated Account Manager', desc: 'A single point of contact for quotes, escalations and billing.' },
    ],

    howTitle: 'How the B2B Partnership Works',
    howSteps: [
      { title: 'Send Your Request', desc: 'Tell us about your business, expected volume and main routes.' },
      { title: 'Receive Wholesale Rates', desc: 'We respond within 24h with confidential B2B pricing tailored to you.' },
      { title: 'Resell at Your Price', desc: 'Add your margin and charge your client through your own brand.' },
      { title: 'We Operate the Transport', desc: 'Your client enjoys premium service. You collect the difference.' },
    ],

    trustTitle: 'Trusted by Travel Professionals Across Europe',
    trustSub: '',
    trustPoints: [
      { value: '50,000+', label: 'Transfers Delivered' },
      { value: '16+', label: 'Cities Covered' },
      { value: '12-20%', label: 'Commission on Premium & Vans' },
      { value: '24/7', label: 'Partner Support' },
    ],

    seoLongTitle: 'Why agencies choose ZONT for their airport transfers in Paris',
    seoLongP1: 'ZONT is the dedicated B2B airport transfer and private chauffeur partner for travel agencies, hotels, concierges, event planners and tour operators operating in Paris and across Europe. Built around the needs of resellers, our model gives you confidential wholesale rates that are never displayed to your end-client, generous 12% to 20% commission on Premium and Van categories (Mercedes S-Class, V-Class and Renault Trafic), and total freedom to resell at any price that fits your customer profile.',
    seoLongP2: 'Whether your client is a luxury traveller landing at Charles de Gaulle and heading to Plaza Athénée, a corporate delegation transferring from Le Bourget to a strategy day at La Défense, or a family of seven moving between Paris, Disneyland® Paris and Versailles, our fleet covers every category — VTC sedans, executive Mercedes E-Class, V-Class luxury vans and 8-seater Renault Trafic minibuses. Each booking includes flight tracking, free meet & greet with named sign, professional VTC-licensed chauffeurs, bottled water, Wi-Fi and a 60-minute free waiting time at no extra cost.',
    seoLongP3: 'Joining the ZONT B2B program is straightforward. We open a partner account, send you our private wholesale grid, and you start booking via our partner portal, dedicated email or direct WhatsApp line. Bookings are confirmed within minutes, your client receives a confirmation under your own brand if you wish, and invoicing is consolidated monthly. There is no minimum volume, no setup fee, and no exclusivity clause — you keep all your other suppliers and integrate ZONT only on the trips where our network and commission structure work best for you.',

    contactTitle: 'Start Your B2B Partnership',
    contactSub: 'Tell us about your business. We will send you our confidential wholesale grid and partner contract within 24 hours.',
    formName: 'Your Name',
    formCompany: 'Company Name',
    formEmail: 'Professional Email',
    formPhone: 'Phone',
    formMessage: 'Describe your business, expected volume per month and main routes (e.g. CDG → Paris hotels, Disneyland transfers, day-trips)...',
    formSubmit: 'Send Partnership Request',
  },

  fr: {
    seoTitle: 'B2B Transferts Aéroport Paris — Programme Partenaire Agence | ZONT',
    seoDesc: 'Transferts aéroport B2B pour agences de voyage, hôtels, conciergeries et tour-opérateurs à Paris et en Europe. Commission 12-20% sur Premium & Vans, tarifs grossiste jamais visibles au client, revendez au prix que vous voulez.',
    badge: 'B2B Transferts Aéroport',
    heroTitle: 'B2B Transferts Aéroport pour Professionnels du Tourisme',
    heroSub: 'Devenez partenaire ZONT pour proposer des transferts aéroport et services chauffeur privé à vos clients à Paris, en France, Monaco et en Europe — avec 12-20% de commission sur les véhicules Premium et Vans, et des tarifs grossistes confidentiels.',
    ctaPartner: 'Devenir Partenaire',
    ctaQuote: 'Demander les Tarifs Grossiste',

    commissionTitle: 'Gagnez plus sur chaque réservation',
    commissionSub: 'Un modèle grossiste conçu pour les professionnels du tourisme — gardez le contrôle total de votre marge.',
    commissionPoints: [
      {
        icon: 'percent',
        title: 'Commission 12% à 20%',
        desc: 'Touchez 12% à 20% de commission sur chaque réservation, avec les taux les plus élevés sur notre gamme Premium et nos Vans (Mercedes Classe S, Classe V, Renault Trafic).',
      },
      {
        icon: 'lock',
        title: 'Tarifs grossiste confidentiels',
        desc: 'Nos tarifs partenaires sont privés et ne sont jamais affichés à votre client final. Il ne voit que le prix que vous choisissez de facturer.',
      },
      {
        icon: 'trending-up',
        title: 'Revendez au prix que vous voulez',
        desc: 'Revendez nos transferts au prix de votre choix. Ajoutez votre marge sur nos tarifs grossiste en toute liberté tarifaire.',
      },
    ],

    whoTitle: 'Nos Partenaires',
    whoSub: 'Des solutions de transport B2B adaptées à chaque canal professionnel',
    servicesTitle: 'Services Transport B2B',
    servicesSub: 'Un catalogue complet que vous revendez à vos clients à votre propre prix',
    services: [
      { title: 'Transferts Aéroport', desc: 'Prises en charge fiables CDG, Orly, Beauvais et tous les hubs européens. Suivi de vol, accueil personnalisé, attente gratuite.' },
      { title: 'Transferts Gare', desc: 'Transferts professionnels Gare du Nord, Lyon, Montparnasse et toutes gares TGV. Service ponctuel et discret.' },
      { title: 'Chauffeur à Disposition', desc: 'Chauffeur dédié à l\'heure (4h / 8h / 12h). Idéal pour roadshow VIP, visites et journées luxe.' },
      { title: 'Transferts Interurbains', desc: 'Trajets longue distance entre villes européennes et stations balnéaires. Évitez les contraintes aériennes.' },
      { title: 'Transport de Groupes', desc: 'Vans et minibus pour groupes de 7 à 16 passagers. Parfait pour délégations, familles et tours.' },
      { title: 'Service VIP & Luxe', desc: 'Mercedes Classe S vaisseau amiral, chauffeurs seniors multilingues, discrétion totale pour HNW et diplomates.' },
    ],

    whyTitle: 'Pourquoi les Professionnels Choisissent ZONT',
    whySub: 'Un partenariat fondé sur la marge, la fiabilité et la confidentialité de marque',
    whyPoints: [
      { icon: 'shield', title: 'Tarifs Grossiste Confidentiels', desc: 'Tarifs B2B verrouillés derrière un compte partenaire. Votre client ne voit jamais notre coût.' },
      { icon: 'percent', title: '12-20% sur Premium & Vans', desc: 'Le taux de commission le plus élevé est réservé aux véhicules à forte marge.' },
      { icon: 'trending-up', title: 'Revente Libre', desc: 'Aucun prix plancher imposé — facturez votre client au tarif que vous souhaitez.' },
      { icon: 'users', title: 'Chauffeurs VTC Agréés', desc: 'Chauffeurs licenciés, français/anglais/russe/arabe sur demande.' },
      { icon: 'plane', title: 'Suivi des Vols Temps Réel', desc: 'Suivi automatique de chaque arrivée. Aucun frais en cas de retard.' },
      { icon: 'star', title: 'Meet & Greet Inclus', desc: 'Le chauffeur attend avec panneau nominatif — aide bagages, remise à l\'hôtel.' },
      { icon: 'clock', title: 'Opérations 24/7', desc: 'Réservez jour et nuit via portail, API ou ligne WhatsApp dédiée.' },
      { icon: 'headphones', title: 'Gestionnaire de Compte Dédié', desc: 'Un interlocuteur unique pour devis, urgences et facturation.' },
    ],

    howTitle: 'Comment Fonctionne le Partenariat B2B',
    howSteps: [
      { title: 'Envoyez Votre Demande', desc: 'Parlez-nous de votre activité, volume prévu et trajets principaux.' },
      { title: 'Recevez les Tarifs Grossiste', desc: 'Nous répondons sous 24h avec une grille B2B confidentielle personnalisée.' },
      { title: 'Revendez à Votre Prix', desc: 'Ajoutez votre marge et facturez votre client sous votre marque.' },
      { title: 'Nous Opérons le Transport', desc: 'Votre client profite d\'un service premium. Vous encaissez la différence.' },
    ],

    trustTitle: 'La Confiance des Professionnels du Tourisme en Europe',
    trustSub: '',
    trustPoints: [
      { value: '50 000+', label: 'Transferts Réalisés' },
      { value: '16+', label: 'Villes Couvertes' },
      { value: '12-20%', label: 'Commission sur Premium & Vans' },
      { value: '24/7', label: 'Support Partenaire' },
    ],

    seoLongTitle: 'Pourquoi les agences choisissent ZONT pour leurs transferts aéroport à Paris',
    seoLongP1: 'ZONT est le partenaire B2B dédié des agences de voyage, hôtels, conciergeries, agences événementielles et tour-opérateurs opérant à Paris et en Europe pour les transferts aéroport et services chauffeur privé. Conçu autour des besoins des revendeurs, notre modèle vous donne accès à des tarifs grossiste confidentiels qui ne sont jamais affichés à votre client final, une commission généreuse de 12% à 20% sur les catégories Premium et Vans (Mercedes Classe S, Classe V et Renault Trafic), et une totale liberté de revente au prix qui convient à votre client.',
    seoLongP2: 'Que votre client soit un voyageur luxe atterrissant à Roissy-Charles de Gaulle pour le Plaza Athénée, une délégation entreprise transférant du Bourget vers une journée stratégique à La Défense, ou une famille de sept personnes circulant entre Paris, Disneyland® Paris et Versailles, notre flotte couvre toutes les catégories — berlines VTC, Mercedes Classe E business, vans luxe Classe V et minibus Renault Trafic 8 places. Chaque réservation inclut le suivi des vols, l\'accueil personnalisé avec panneau nominatif gratuit, des chauffeurs VTC professionnels, eau minérale, Wi-Fi et 60 minutes d\'attente gratuite, sans frais supplémentaires.',
    seoLongP3: 'Rejoindre le programme B2B de ZONT est simple. Nous ouvrons un compte partenaire, vous envoyons notre grille tarifaire grossiste privée, et vous commencez à réserver via notre portail partenaire, email dédié ou ligne WhatsApp directe. Les réservations sont confirmées en quelques minutes, votre client reçoit une confirmation sous votre marque si vous le souhaitez, et la facturation est consolidée mensuellement. Aucun volume minimum, aucun frais de mise en place, aucune clause d\'exclusivité — vous gardez tous vos autres fournisseurs et intégrez ZONT uniquement sur les trajets où notre réseau et notre structure de commission fonctionnent le mieux pour vous.',

    contactTitle: 'Démarrez votre partenariat B2B',
    contactSub: 'Parlez-nous de votre entreprise. Nous vous envoyons notre grille tarifaire confidentielle et le contrat partenaire sous 24h.',
    formName: 'Votre Nom',
    formCompany: 'Nom de l\'Entreprise',
    formEmail: 'Email Professionnel',
    formPhone: 'Téléphone',
    formMessage: 'Décrivez votre activité, volume mensuel prévu et trajets principaux (ex : CDG → hôtels Paris, transferts Disneyland, excursions journée)...',
    formSubmit: 'Envoyer la demande',
  },

  ru: {
    seoTitle: 'B2B Трансферы из аэропорта Париж — Партнёрская программа для агентств | ZONT',
    seoDesc: 'B2B трансферы из аэропорта для турагентств, отелей, консьерж-служб и туроператоров в Париже и Европе. Комиссия 12-20% на Premium и Vans, оптовые цены никогда не показываются клиенту.',
    badge: 'B2B Трансферы из Аэропорта',
    heroTitle: 'B2B Трансферы из Аэропорта для Профессионалов Туризма',
    heroSub: 'Станьте партнёром ZONT и предлагайте надёжные трансферы из аэропорта и услуги частного водителя своим клиентам в Париже, Франции, Монако и Европе — с комиссией 12-20% на Premium и Vans, и конфиденциальными оптовыми ценами.',
    ctaPartner: 'Стать партнёром',
    ctaQuote: 'Запросить оптовые цены',

    commissionTitle: 'Зарабатывайте больше с каждой брони',
    commissionSub: 'Оптовая модель, созданная для профессионалов туризма — полный контроль маржи в ваших руках.',
    commissionPoints: [
      { icon: 'percent', title: 'Комиссия 12% – 20%', desc: 'Получайте 12-20% комиссии с каждой брони, максимальные ставки — на Premium и Vans (Mercedes S, V-Class, Renault Trafic).' },
      { icon: 'lock', title: 'Оптовые цены конфиденциальны', desc: 'Наши партнёрские цены остаются скрытыми. Ваш клиент видит только ту сумму, которую назначаете вы.' },
      { icon: 'trending-up', title: 'Перепродавайте по любой цене', desc: 'Никаких минимальных ценовых порогов. Добавляйте свою наценку к нашей оптовой стоимости.' },
    ],

    whoTitle: 'С кем мы работаем',
    whoSub: 'Индивидуальные B2B решения для каждого канала',
    servicesTitle: 'B2B Транспортные Услуги',
    servicesSub: 'Полный каталог услуг для перепродажи под вашим брендом',
    services: [
      { title: 'Трансферы из Аэропорта', desc: 'Надёжные встречи в CDG, Orly, Beauvais и всех хабах Европы. Отслеживание рейсов, встреча с табличкой.' },
      { title: 'Трансферы с Вокзалов', desc: 'Профессиональные трансферы Gare du Nord, Lyon и всех TGV-вокзалов.' },
      { title: 'Водитель в Распоряжении', desc: 'Личный водитель почасово (4ч / 8ч / 12ч). VIP road-show, обзорные дни.' },
      { title: 'Междугородние Трансферы', desc: 'Комфортные дальние поездки между городами Европы.' },
      { title: 'Групповой Транспорт', desc: 'Вэны и микроавтобусы для групп от 7 до 16 человек.' },
      { title: 'VIP & Люкс', desc: 'Mercedes S-Class, мультиязычные старшие водители, полная конфиденциальность.' },
    ],

    whyTitle: 'Почему агентства выбирают ZONT',
    whySub: 'Партнёрство на марже, надёжности и конфиденциальности бренда',
    whyPoints: [
      { icon: 'shield', title: 'Конфиденциальные оптовые цены', desc: 'B2B-тарифы доступны только в кабинете партнёра.' },
      { icon: 'percent', title: '12-20% на Premium и Vans', desc: 'Высшая комиссия — на самые маржинальные категории.' },
      { icon: 'trending-up', title: 'Свободная перепродажа', desc: 'Нет минимальной цены. Назначайте любую наценку.' },
      { icon: 'users', title: 'Сертифицированные VTC-водители', desc: 'Лицензированные, многоязычные.' },
      { icon: 'plane', title: 'Отслеживание рейсов', desc: 'Автоматическая корректировка времени без доплат.' },
      { icon: 'star', title: 'Встреча с табличкой', desc: 'Помощь с багажом, передача в отель.' },
      { icon: 'clock', title: '24/7 операции', desc: 'Через портал, API или WhatsApp.' },
      { icon: 'headphones', title: 'Персональный менеджер', desc: 'Единый контакт для котировок и выставления счетов.' },
    ],

    howTitle: 'Как работает B2B-партнёрство',
    howSteps: [
      { title: 'Отправьте запрос', desc: 'Расскажите о бизнесе, объёмах и маршрутах.' },
      { title: 'Получите оптовые цены', desc: 'Ответ в течение 24 часов с персональной сеткой.' },
      { title: 'Перепродавайте по своей цене', desc: 'Добавьте маржу и выставляйте счёт под своим брендом.' },
      { title: 'Мы выполняем трансфер', desc: 'Клиент в восторге, вы — с прибылью.' },
    ],

    trustTitle: 'Доверие профессионалов туризма в Европе',
    trustSub: '',
    trustPoints: [
      { value: '50 000+', label: 'Трансферов выполнено' },
      { value: '16+', label: 'Городов' },
      { value: '12-20%', label: 'Комиссия Premium & Vans' },
      { value: '24/7', label: 'Поддержка партнёров' },
    ],

    seoLongTitle: 'Почему агентства выбирают ZONT для трансферов в Париже',
    seoLongP1: 'ZONT — это B2B-партнёр для турагентств, отелей, консьерж-служб и туроператоров, работающих в Париже и по Европе. Конфиденциальные оптовые цены никогда не показываются клиенту, щедрая комиссия 12-20% на Premium и Vans (Mercedes S, V-Class, Renault Trafic), и полная свобода перепродажи по любой цене.',
    seoLongP2: 'Luxury-путешественник в Plaza Athénée, корпоративная делегация La Défense, семья из семи человек Париж — Disneyland® — Версаль: у нас есть автомобиль на любой случай. В каждом трансфере — отслеживание рейса, встреча с табличкой, профессиональный VTC-водитель, вода, Wi-Fi и 60 минут бесплатного ожидания.',
    seoLongP3: 'Подключение к программе простое: открываем партнёрский аккаунт, передаём оптовую сетку, бронируете через портал, email или WhatsApp. Без минимального объёма, без платы за подключение, без эксклюзивности.',

    contactTitle: 'Начните B2B-партнёрство',
    contactSub: 'Расскажите о своём бизнесе. Мы вышлем оптовую сетку и партнёрский договор в течение 24 часов.',
    formName: 'Ваше имя',
    formCompany: 'Название компании',
    formEmail: 'Рабочий email',
    formPhone: 'Телефон',
    formMessage: 'Опишите бизнес, ожидаемый объём в месяц и основные маршруты...',
    formSubmit: 'Отправить заявку',
  },

  hy: {
    seoTitle: 'B2B Օդանավակայանի Տրանսֆեր Փարիզ — Գործակալության Գործընկեր Ծրագիր | ZONT',
    seoDesc: 'B2B օդանավակայանի տրանսֆերներ տուրիստական գործակալությունների համար Փարիզում: Միջնորդավճար 12-20% Premium և Vans մեքենաների վրա: Մեծածախ գները երբեք չեն ցուցադրվում հաճախորդին:',
    badge: 'B2B Օդանավակայանի Տրանսֆեր',
    heroTitle: 'B2B Օդանավակայանի Տրանսֆեր Տուրիզմի Մասնագետների Համար',
    heroSub: 'Դառեք ZONT գործընկեր և առաջարկեք օդանավակայանի տրանսֆերներ ձեր հաճախորդներին Փարիզում, Ֆրանսիայում, Մոնակոյում և Եվրոպայում՝ 12-20% միջնորդավճարով Premium և Vans մեքենաների վրա:',
    ctaPartner: 'Դառնալ Գործընկեր',
    ctaQuote: 'Հարցում Մեծածախ Գների',

    commissionTitle: 'Ավելի շատ եկամուտ ամեն ամրագրումից',
    commissionSub: 'Մեծածախ մոդել՝ տուրիզմի մասնագետների համար։ Մարժայի ամբողջական վերահսկողություն։',
    commissionPoints: [
      { icon: 'percent', title: '12-20% միջնորդավճար', desc: 'Ստացեք 12-20% միջնորդավճար Premium և Vans մեքենաների համար։' },
      { icon: 'lock', title: 'Գաղտնի մեծածախ գներ', desc: 'Մեր գները երբեք չեն ցուցադրվում ձեր հաճախորդին։' },
      { icon: 'trending-up', title: 'Վերավաճառեք ցանկացած գնով', desc: 'Ձեր մարժան՝ ձեր ընտրությունն է։' },
    ],

    whoTitle: 'Ում Հետ Ենք Աշխատում',
    whoSub: 'B2B լուծումներ ամեն պրոֆեսիոնալ ալիքի համար',
    servicesTitle: 'B2B Տրանսպորտային Ծառայություններ',
    servicesSub: 'Ամբողջական ցանկ՝ վերավաճառքի համար',
    services: [
      { title: 'Օդանավակայանի Տրանսֆերներ', desc: 'CDG, Orly, Beauvais և բոլոր եվրոպական հանգույցները։' },
      { title: 'Կայարանի Տրանսֆերներ', desc: 'Բոլոր TGV-կայարանները։' },
      { title: 'Վարորդ Տրամադրությամբ', desc: '4ժ / 8ժ / 12ժ։' },
      { title: 'Քաղաք-Քաղաք', desc: 'Հարմարավետ դասավորություն։' },
      { title: 'Խմբային Տրանսպորտ', desc: '7-16 ուղևորների համար։' },
      { title: 'VIP & Շքեղ', desc: 'Mercedes S-Class, ավագ վարորդներ։' },
    ],

    whyTitle: 'Ինչու Ընտրել ZONT',
    whySub: 'Գործընկերություն՝ մարժայի և վստահության վրա',
    whyPoints: [
      { icon: 'shield', title: 'Գաղտնի մեծածախ գներ', desc: 'B2B-տարիֆներ՝ միայն գործընկերային հաշվում։' },
      { icon: 'percent', title: '12-20% Premium և Vans', desc: 'Բարձր միջնորդավճար բարձր մարժայով մեքենաների վրա։' },
      { icon: 'trending-up', title: 'Ազատ վերավաճառք', desc: 'Ձեր մարժայի վերահսկողությունը։' },
      { icon: 'users', title: 'VTC վարորդներ', desc: 'Լիցենզավորված, բազմալեզու։' },
      { icon: 'plane', title: 'Թռիչքների հետևում', desc: 'Ավտոմատ։' },
      { icon: 'star', title: 'Դիմավորում ցուցանակով', desc: 'Ուղեբեռի օգնություն։' },
      { icon: 'clock', title: '24/7 գործառնություն', desc: 'Պորտալ, API, WhatsApp։' },
      { icon: 'headphones', title: 'Հաշվի մենեջեր', desc: 'Մեկ կոնտակտ։' },
    ],

    howTitle: 'Ինչպես է գործում B2B-գործընկերությունը',
    howSteps: [
      { title: 'Ուղարկեք հարցում', desc: 'Պատմեք ձեր բիզնեսի մասին։' },
      { title: 'Ստացեք մեծածախ գներ', desc: '24 ժամվա ընթացքում։' },
      { title: 'Վերավաճառեք', desc: 'Ձեր մարժա, ձեր ապրանքանիշ։' },
      { title: 'Մենք իրականացնում ենք', desc: 'Ձեր հաճախորդը գոհ է։' },
    ],

    trustTitle: 'Վստահելի մասնագետների կողմից',
    trustSub: '',
    trustPoints: [
      { value: '50 000+', label: 'Կատարված տրանսֆերներ' },
      { value: '16+', label: 'Քաղաքներ' },
      { value: '12-20%', label: 'Միջնորդավճար' },
      { value: '24/7', label: 'Աջակցություն' },
    ],

    seoLongTitle: 'Ինչու են գործակալությունները ընտրում ZONT-ը',
    seoLongP1: 'ZONT-ը նվիրված B2B գործընկեր է Փարիզում և Եվրոպայում աշխատող տուրիստական գործակալությունների համար։ Գաղտնի մեծածախ գներ, 12-20% միջնորդավճար Premium և Vans, ազատ վերավաճառք։',
    seoLongP2: 'Մեր ավտոպարկը ընդգրկում է բոլոր կատեգորիաները՝ VTC սեդաններ, Mercedes E, V դասի վեններ, Renault Trafic մինիբուսներ։ Թռիչքների հետևում, դիմավորում, 60 ր անվճար սպասում։',
    seoLongP3: 'Միանալը պարզ է. գործընկերային հաշիվ, մեծածախ գների ցուցակ, ամրագրումներ պորտալով, email կամ WhatsApp։ Առանց նվազագույն ծավալի կամ բացառիկության։',

    contactTitle: 'Սկսեք ձեր B2B գործընկերությունը',
    contactSub: 'Պատմեք ձեր բիզնեսի մասին։ Մենք կուղարկենք գները 24 ժամվա ընթացքում։',
    formName: 'Ձեր անունը',
    formCompany: 'Ընկերության անունը',
    formEmail: 'Գործնական email',
    formPhone: 'Հեռախոս',
    formMessage: 'Նկարագրեք ձեր բիզնեսը...',
    formSubmit: 'Ուղարկել հարցումը',
  },
};

const targets = [
  { path: '/travel-agencies', name: { en: 'Travel Agencies', fr: 'Agences de Voyage', ru: 'Тур. Агентства', hy: 'Տուրիստական Գործակալություններ' }, tagline: { en: 'Airport transfer partner', fr: 'Partenaire transfert aeroport', ru: 'Партнер по трансферам', hy: 'Տրանսֆեր գործընկեր' } },
  { path: '/tourism-agencies', name: { en: 'Tourism Agencies', fr: 'Agences de Tourisme', ru: 'Туристические Агентства', hy: 'Տուրիստական Գործակալություններ' }, tagline: { en: 'Private transport solutions', fr: 'Solutions de transport prive', ru: 'Частный транспорт', hy: 'Մասնավոր տրանսպորտ' } },
  { path: '/borne-reservation-hotel', name: { en: 'Hotels', fr: 'Hôtels', ru: 'Отели', hy: 'Հյուրանոցներ' }, tagline: { en: 'In-hotel booking kiosk', fr: 'Borne en réception', ru: 'Терминал в отеле', hy: 'Հյուրանոցային կրպակ' } },
  { path: '/concierge-services', name: { en: 'Concierge Services', fr: 'Conciergeries', ru: 'Консьерж-службы', hy: 'Կոնսյերժ' }, tagline: { en: 'VIP chauffeur solutions', fr: 'Solutions chauffeur VIP', ru: 'VIP решения', hy: 'VIP լուծումներ' } },
  { path: '/event-agencies', name: { en: 'Event Agencies', fr: 'Agences Événementielles', ru: 'Ивент-агентства', hy: 'Միջոցառումներ' }, tagline: { en: 'Event transportation', fr: 'Transport événementiel', ru: 'Транспорт для мероприятий', hy: 'Միջոցառումների տրանսպորտ' } },
  { path: '/corporate-clients', name: { en: 'Corporate Clients', fr: 'Entreprises', ru: 'Корпоративные Клиенты', hy: 'Կորպորատիվ' }, tagline: { en: 'Business travel services', fr: 'Voyage d\'affaires', ru: 'Бизнес-путешествия', hy: 'Բիզնես ուղևորություն' } },
  { path: '/business-partners', name: { en: 'Business Partners', fr: 'Partenaires Commerciaux', ru: 'Бизнес-партнёры', hy: 'Բիզնես գործընկեր' }, tagline: { en: 'Strategic partnerships', fr: 'Partenariats stratégiques', ru: 'Стратегические партнёрства', hy: 'Ռազմավարական' } },
  { path: '/tour-operators', name: { en: 'Tour Operators', fr: 'Tour-Opérateurs', ru: 'Туроператоры', hy: 'Տուր օպերատորներ' }, tagline: { en: 'Tour logistics partner', fr: 'Logistique tours', ru: 'Логистика туров', hy: 'Տուր լոգիստիկա' } },
];

const Partners = () => {
  const { language: ctxLanguage, changeLanguage } = useLanguage();
  const location = useLocation();

  // Force language to match URL so SEO is always consistent
  const urlMatch = matchPathToLanguage(location.pathname);
  const language = urlMatch?.language || ctxLanguage;
  useEffect(() => {
    if (urlMatch?.language && urlMatch.language !== ctxLanguage) {
      changeLanguage(urlMatch.language);
    }
  }, [urlMatch?.language, ctxLanguage, changeLanguage]);

  const c = content[language] || content.en;
  const contactRef = useRef(null);
  const [formState, setFormState] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.company) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formState, source_page: location.pathname }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      trackLead({ source: 'Partners' });
      setFormState({ name: '', company: '', email: '', phone: '', message: '' });
    } catch {
      setError(language === 'fr' ? 'Erreur. Veuillez réessayer.' : language === 'ru' ? 'Ошибка. Попробуйте снова.' : language === 'hy' ? 'Սխալ: Խնդրում ենք կրկին փորձեք:' : 'Error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPath = MULTI_LANG_URLS.partners[language] || MULTI_LANG_URLS.partners.en;
  const canonical = `${SITE}${currentPath}`;
  const hreflang = Object.entries(MULTI_LANG_URLS.partners).map(([l, p]) => ({ lang: l, href: `${SITE}${p}` }));

  const iconMap = {
    shield: Shield, users: Users, plane: Plane, star: Star, clock: Clock,
    headphones: Headphones, percent: Percent, lock: Lock, 'trending-up': TrendingUp,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="partners-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical={canonical}
        hreflang={hreflang}
        ogType="website"
        ogImage={`${SITE}/images/borne-reservation-vtc-taxi-hotel-paris.webp`}
        jsonLd={[
          { "@context": "https://schema.org", "@type": "LocalBusiness", "name": c.seoTitle, "description": c.seoDesc, "url": "https://www.zont.cab", "image": "https://www.zont.cab/logo512.png", "telephone": "+33783777027", "address": { "@type": "PostalAddress", "addressLocality": "Paris", "addressCountry": "FR" }, "priceRange": "$$", "serviceType": "B2B Airport Transfer & Chauffeur Service", "areaServed": ["Paris", "France", "Monaco", "Europe"] },
          { "@context": "https://schema.org", "@type": "WebPage", "name": c.seoTitle, "url": canonical, "description": c.seoDesc },
        ]}
      />
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-white to-[#f8fafc]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(46,204,113,0.4) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block mb-5 px-5 py-1.5 bg-[#2ecc71]/10 text-[#2ecc71] text-xs font-semibold tracking-widest uppercase rounded-full border border-[#2ecc71]/20" data-testid="b2b-badge">
            {c.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto" data-testid="partners-h1">
            {c.heroTitle}
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">{c.heroSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={scrollToContact} className="px-10 py-4 bg-[#2ecc71] text-white font-bold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20 text-lg" data-testid="cta-become-partner">{c.ctaPartner}</button>
            <button onClick={scrollToContact} className="px-10 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:border-[#2ecc71] hover:text-[#2ecc71] transition-all text-lg" data-testid="cta-request-quote">{c.ctaQuote}</button>
          </div>
        </div>
      </section>

      {/* Commission & resale (the key new B2B value-prop) */}
      <section className="py-16 bg-gradient-to-br from-[#2ecc71]/5 via-white to-[#2ecc71]/5 border-y border-[#2ecc71]/15" data-testid="commission-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{c.commissionTitle}</h2>
            <p className="text-gray-600">{c.commissionSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.commissionPoints.map((p, i) => {
              const Icon = iconMap[p.icon] || Percent;
              return (
                <div key={i} className="bg-white border-2 border-[#2ecc71]/20 rounded-2xl p-7 hover:border-[#2ecc71]/50 hover:shadow-xl transition-all" data-testid={`commission-card-${i}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#2ecc71] flex items-center justify-center mb-5 shadow-lg shadow-[#2ecc71]/30">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">{c.whoTitle}</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{c.whoSub}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {targets.map((t, i) => (
              <Link key={i} to={t.path} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#2ecc71]/40 hover:shadow-lg transition-all group text-center" data-testid={`target-link-${i}`}>
                <div className="w-12 h-12 rounded-full bg-[#2ecc71]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#2ecc71]/20 transition-colors">
                  {[<Briefcase className="w-5 h-5 text-[#2ecc71]" />, <Globe className="w-5 h-5 text-[#2ecc71]" />, <Hotel className="w-5 h-5 text-[#2ecc71]" />, <Star className="w-5 h-5 text-[#2ecc71]" />, <Users className="w-5 h-5 text-[#2ecc71]" />, <Building2 className="w-5 h-5 text-[#2ecc71]" />, <ArrowRight className="w-5 h-5 text-[#2ecc71]" />, <Plane className="w-5 h-5 text-[#2ecc71]" />][i]}
                </div>
                <div className="text-gray-900 font-semibold group-hover:text-[#2ecc71] transition-colors mb-1">{t.name[language] || t.name.en}</div>
                <div className="text-gray-500 text-xs">{t.tagline[language] || t.tagline.en}</div>
                <ChevronRight className="w-4 h-4 text-gray-400 mx-auto mt-3 group-hover:text-[#2ecc71] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">{c.servicesTitle}</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{c.servicesSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.services.map((s, i) => (
              <div key={i} className="bg-[#f8fafc] border border-gray-200 rounded-xl p-6">
                <h3 className="text-gray-900 font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">{c.whyTitle}</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{c.whySub}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.whyPoints.map((p, i) => {
              const Icon = iconMap[p.icon] || Shield;
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#2ecc71]/30 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#2ecc71]/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#2ecc71]" />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2">{p.title}</h3>
                  <p className="text-gray-600 text-sm">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">{c.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {c.howSteps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#2ecc71] text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#2ecc71]/20">{i + 1}</div>
                {i < 3 && <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#2ecc71]/40 to-transparent" />}
                <h3 className="text-gray-900 font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">{c.trustTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {c.trustPoints.map((tp, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-[#2ecc71] mb-2">{tp.value}</div>
                <div className="text-gray-600 text-sm">{tp.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-form SEO text */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{c.seoLongTitle}</h2>
          <article className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-[17px]">{c.seoLongP1}</p>
          </article>
          <article className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-[17px]">{c.seoLongP2}</p>
          </article>
          <article className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-[17px]">{c.seoLongP3}</p>
          </article>
        </div>
      </section>

      {/* Contact */}
      <section ref={contactRef} className="py-20 bg-white" id="contact" data-testid="b2b-contact-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br bg-[#f8fafc] border border-gray-200 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">{c.contactTitle}</h2>
            <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">{c.contactSub}</p>
            {submitted ? (
              <div className="text-center py-8" data-testid="form-success">
                <CheckCircle className="w-16 h-16 text-[#2ecc71] mx-auto mb-4" />
                <p className="text-xl text-gray-900 font-semibold mb-2">{language === 'fr' ? 'Demande envoyée !' : language === 'ru' ? 'Запрос отправлен!' : language === 'hy' ? 'Հարցումը ուղարկվեց!' : 'Request sent!'}</p>
                <p className="text-gray-400">{language === 'fr' ? 'Nous vous répondrons sous 24h.' : language === 'ru' ? 'Мы ответим в течение 24 часов.' : language === 'hy' ? 'Մենք կպատասխանենք 24 ժամվա ընթացքում:' : 'We will respond within 24 hours.'}</p>
              </div>
            ) : (
              <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit} data-testid="b2b-contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" required placeholder={c.formName} value={formState.name} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-name" />
                  <input type="text" required placeholder={c.formCompany} value={formState.company} onChange={e => setFormState(p => ({ ...p, company: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-company" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="email" required placeholder={c.formEmail} value={formState.email} onChange={e => setFormState(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-email" />
                  <input type="tel" placeholder={c.formPhone} value={formState.phone} onChange={e => setFormState(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-phone" />
                </div>
                <textarea rows="4" placeholder={c.formMessage} value={formState.message} onChange={e => setFormState(p => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] resize-none" data-testid="form-message" />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20 disabled:opacity-50" data-testid="form-submit">
                  {submitting ? '...' : c.formSubmit}
                </button>
              </form>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-sm text-gray-400">
              <a href="mailto:partners@zont.cab" className="flex items-center gap-2 hover:text-[#2ecc71] transition-colors"><Mail className="w-4 h-4" /> partners@zont.cab</a>
              <a href="https://wa.me/33783777027" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#2ecc71] transition-colors" data-testid="partners-whatsapp-link">
                <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.11 1.6 5.92L0 24l6.32-1.65A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 21.82a9.81 9.81 0 01-5-1.36l-.36-.22-3.75.98 1-3.66-.24-.38A9.83 9.83 0 1121.82 12 9.83 9.83 0 0112 21.82zm5.4-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07a8.1 8.1 0 01-2.38-1.47 8.97 8.97 0 01-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37s-1.05 1.02-1.05 2.5 1.07 2.9 1.22 3.1c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.71.64.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" /></svg>
                +33 7 83 77 70 27
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
