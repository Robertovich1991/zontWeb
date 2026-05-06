import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, ArrowRight, Phone, Mail, Building2, Briefcase, Hotel, Star, Users, Plane, ChevronRight, Shield, Clock, Globe, Headphones } from 'lucide-react';
import { trackLead } from '@/utils/fbPixel';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const content = {
  en: {
    seoTitle: 'Premium Transport Solutions for Professionals | Zont B2B',
    seoDesc: 'Zont supports travel agencies, hotels, concierges, event agencies, tour operators and corporate clients with reliable airport transfers and chauffeur services across Europe.',
    badge: 'B2B Partnership Program',
    heroTitle: 'Premium Transport Solutions for Professionals',
    heroSub: 'ZONT supports travel agencies, hotels, concierges, event agencies, tour operators and corporate clients with reliable airport transfers and chauffeur services in Paris, France, Monaco and key European destinations.',
    ctaPartner: 'Become a Partner',
    ctaQuote: 'Request a Quote',
    whoTitle: 'Who We Work With',
    whoSub: 'Tailored transport solutions for every professional need',
    servicesTitle: 'Services for Professionals',
    servicesSub: 'Comprehensive transport solutions designed for business partners',
    services: [
      { title: 'Airport Transfers', desc: 'Reliable pickups and drop-offs at all major airports. Flight tracking, meet & greet, free waiting time.' },
      { title: 'Train Station Transfers', desc: 'Professional transfers from all major train stations. Prompt, punctual service.' },
      { title: 'Chauffeur at Disposal', desc: 'Dedicated driver available for hours or full days. Ideal for events, site visits and meetings.' },
      { title: 'City-to-City Transfers', desc: 'Long-distance transfers between cities. Comfortable vehicles for intercity travel.' },
      { title: 'Group Transportation', desc: 'Minivans and minibuses for groups of up to 16 passengers. Perfect for delegations and tour groups.' },
      { title: 'VIP & Luxury Service', desc: 'Premium vehicles, discreet drivers. First-class service for your most demanding clients.' },
    ],
    whyTitle: 'Why Partner With ZONT',
    whySub: 'A partnership built on reliability, quality and mutual growth',
    whyPoints: [
      { icon: 'shield', title: 'Fixed & Transparent Rates', desc: 'No hidden fees, no surge pricing. Predictable costs for seamless budget planning.' },
      { icon: 'users', title: 'Professional Chauffeurs', desc: 'Vetted, licensed, multilingual drivers. Trained for VIP and business travel.' },
      { icon: 'plane', title: 'Real-Time Flight Monitoring', desc: 'Automatic tracking of all flights. Schedule adjustments without extra cost.' },
      { icon: 'star', title: 'Meet & Greet Service', desc: 'Driver waits at arrivals with a name sign. Personalized welcome for every guest.' },
      { icon: 'clock', title: '24/7 Availability', desc: 'Book transfers day or night. Dedicated support around the clock.' },
      { icon: 'headphones', title: 'Dedicated Partner Support', desc: 'Priority access to a dedicated account manager for your organization.' },
    ],
    howTitle: 'How Partnership Works',
    howSteps: [
      { title: 'Send Your Request', desc: 'Tell us about your business, volume and needs.' },
      { title: 'Receive a Quote', desc: 'We respond within 24h with tailored rates.' },
      { title: 'We Organize Transport', desc: 'Book seamlessly via portal, email or phone.' },
      { title: 'Premium Experience', desc: 'Your clients enjoy first-class transfers.' },
    ],
    trustTitle: 'Trusted by Professionals Across Europe',
    trustSub: '',
    trustPoints: [
      { value: '50,000+', label: 'Transfers Completed' },
      { value: '16', label: 'Cities Covered' },
      { value: '4.5/5', label: 'Client Rating' },
      { value: '24/7', label: 'Support Available' },
    ],
    contactTitle: 'Start Your B2B Partnership',
    contactSub: 'Tell us about your business. We will prepare a personalized offer for your organization.',
    formName: 'Your Name', formCompany: 'Company Name', formEmail: 'Professional Email', formPhone: 'Phone', formMessage: 'Describe your transport needs, expected volume, and preferred destinations...', formSubmit: 'Send Partnership Request',
  },
  fr: {
    seoTitle: 'Solutions de Transport Premium pour Professionnels | Zont B2B',
    seoDesc: 'Zont accompagne les agences de voyage, hotels, conciergeries, agences evenementielles, tour-operateurs et entreprises avec des transferts aeroport et services de chauffeur fiables en Europe.',
    badge: 'Programme Partenariat B2B',
    heroTitle: 'Solutions de Transport Premium pour Professionnels',
    heroSub: 'ZONT accompagne les agences de voyage, hotels, conciergeries, agences evenementielles, tour-operateurs et entreprises avec des transferts aeroport et services chauffeur a Paris, en France, a Monaco et dans les principales destinations europeennes.',
    ctaPartner: 'Devenir Partenaire',
    ctaQuote: 'Demander un Devis',
    whoTitle: 'Nos Partenaires',
    whoSub: 'Des solutions de transport adaptees a chaque besoin professionnel',
    servicesTitle: 'Services pour Professionnels',
    servicesSub: 'Des solutions de transport complètes conçues pour les partenaires commerciaux',
    services: [
      { title: 'Transferts Aéroport', desc: 'Prises en charge et dépositions fiables dans tous les grands aéroports. Suivi de vol, accueil personnalisé.' },
      { title: 'Transferts Gare', desc: 'Transferts professionnels depuis toutes les grandes gares. Service ponctuel et rapide.' },
      { title: 'Chauffeur à Disposition', desc: 'Chauffeur dédié disponible à l\'heure ou à la journée. Idéal pour évènements et réunions.' },
      { title: 'Transferts Interurbains', desc: 'Transferts longue distance entre villes. Véhicules confortables pour les trajets interurbains.' },
      { title: 'Transport de Groupes', desc: 'Minivans et minibus pour groupes jusqu\'à 16 passagers. Parfait pour délégations et groupes touristiques.' },
      { title: 'Service VIP & Luxe', desc: 'Véhicules premium, chauffeurs discrets. Service de première classe pour vos clients les plus exigeants.' },
    ],
    whyTitle: 'Pourquoi Choisir ZONT',
    whySub: 'Un partenariat fondé sur la fiabilité, la qualité et la croissance mutuelle',
    whyPoints: [
      { icon: 'shield', title: 'Tarifs Fixes & Transparents', desc: 'Pas de frais cachés, pas de surcharge. Des coûts prévisibles.' },
      { icon: 'users', title: 'Chauffeurs Professionnels', desc: 'Chauffeurs vérifiés, licenciés, multilingues. Formés au transport VIP.' },
      { icon: 'plane', title: 'Suivi des Vols en Temps Réel', desc: 'Suivi automatique de tous les vols. Ajustements sans frais supplémentaires.' },
      { icon: 'star', title: 'Service d\'Accueil', desc: 'Le chauffeur attend aux arrivées avec un panneau nominatif.' },
      { icon: 'clock', title: 'Disponibilité 24/7', desc: 'Réservez des transferts jour et nuit. Support dédié en permanence.' },
      { icon: 'headphones', title: 'Support Partenaire Dédié', desc: 'Accès prioritaire à un gestionnaire de compte dédié.' },
    ],
    howTitle: 'Comment Ça Marche',
    howSteps: [
      { title: 'Envoyez Votre Demande', desc: 'Parlez-nous de votre activité, volume et besoins.' },
      { title: 'Recevez un Devis', desc: 'Nous répondons sous 24h avec des tarifs personnalisés.' },
      { title: 'Nous Organisons le Transport', desc: 'Réservez facilement via portail, email ou téléphone.' },
      { title: 'Expérience Premium', desc: 'Vos clients profitent de transferts de première classe.' },
    ],
    trustTitle: 'La Confiance des Professionnels en Europe',
    trustSub: '',
    trustPoints: [
      { value: '50 000+', label: 'Transferts Realises' },
      { value: '16', label: 'Villes Couvertes' },
      { value: '4.5/5', label: 'Note Client' },
      { value: '24/7', label: 'Support Disponible' },
    ],
    contactTitle: 'Demarrez Votre Partenariat B2B',
    contactSub: 'Parlez-nous de votre entreprise. Nous preparerons une offre personnalisee pour votre organisation.',
    formName: 'Votre Nom', formCompany: 'Nom de l\'Entreprise', formEmail: 'Email Professionnel', formPhone: 'Telephone', formMessage: 'Decrivez vos besoins en transport, volume attendu et destinations preferees...', formSubmit: 'Envoyer la Demande de Partenariat',
  },
  ru: {
    seoTitle: 'Премиальные Транспортные Решения для Профессионалов | Zont B2B',
    seoDesc: 'Zont поддерживает туристические агентства, отели, консьерж-службы, ивент-агентства, туроператоров и корпоративных клиентов надежными трансферами и услугами шофера по Европе.',
    badge: 'Партнерская Программа B2B',
    heroTitle: 'Премиальные Транспортные Решения для Профессионалов',
    heroSub: 'ZONT поддерживает туристические агентства, отели, консьерж-службы, ивент-агентства, туроператоров и корпоративных клиентов надежными трансферами из аэропорта и услугами шофера в Париже, Франции, Монако и ключевых европейских направлениях.',
    ctaPartner: 'Стать Партнером',
    ctaQuote: 'Запросить Предложение',
    whoTitle: 'С Кем Мы Работаем',
    whoSub: 'Индивидуальные транспортные решения для каждой профессиональной потребности',
    servicesTitle: 'Услуги для Профессионалов',
    servicesSub: 'Комплексные транспортные решения для бизнес-партнеров',
    services: [
      { title: 'Трансферы из Аэропорта', desc: 'Надежные встречи и проводы во всех крупных аэропортах. Отслеживание рейсов, встреча.' },
      { title: 'Трансферы с Вокзалов', desc: 'Профессиональные трансферы со всех крупных вокзалов. Пунктуальный сервис.' },
      { title: 'Шофер в Распоряжении', desc: 'Выделенный водитель на часы или целый день. Идеально для мероприятий и встреч.' },
      { title: 'Междугородние Трансферы', desc: 'Трансферы на дальние расстояния между городами. Комфортные автомобили.' },
      { title: 'Групповой Транспорт', desc: 'Минивэны и микроавтобусы для групп до 16 пассажиров.' },
      { title: 'VIP & Люкс Сервис', desc: 'Премиальные автомобили, дискретные водители. Первоклассный сервис.' },
    ],
    whyTitle: 'Почему Партнерство с ZONT',
    whySub: 'Партнерство, построенное на надежности, качестве и взаимном росте',
    whyPoints: [
      { icon: 'shield', title: 'Фиксированные Тарифы', desc: 'Без скрытых комиссий. Предсказуемые расходы для бюджетного планирования.' },
      { icon: 'users', title: 'Профессиональные Шоферы', desc: 'Проверенные, лицензированные, многоязычные водители.' },
      { icon: 'plane', title: 'Мониторинг Рейсов', desc: 'Автоматическое отслеживание всех рейсов без дополнительных расходов.' },
      { icon: 'star', title: 'Встреча с Табличкой', desc: 'Водитель ждет у выхода с именной табличкой.' },
      { icon: 'clock', title: 'Доступность 24/7', desc: 'Бронируйте трансферы в любое время. Круглосуточная поддержка.' },
      { icon: 'headphones', title: 'Выделенная Поддержка', desc: 'Приоритетный доступ к выделенному менеджеру для вашей организации.' },
    ],
    howTitle: 'Как Работает Партнерство',
    howSteps: [
      { title: 'Отправьте Запрос', desc: 'Расскажите о вашем бизнесе, объемах и потребностях.' },
      { title: 'Получите Предложение', desc: 'Мы ответим в течение 24 часов с индивидуальными тарифами.' },
      { title: 'Мы Организуем Транспорт', desc: 'Бронируйте через портал, email или телефон.' },
      { title: 'Премиальный Опыт', desc: 'Ваши клиенты наслаждаются первоклассными трансферами.' },
    ],
    trustTitle: 'Доверие Профессионалов по Всей Европе',
    trustSub: '',
    trustPoints: [
      { value: '50 000+', label: 'Трансферов Выполнено' },
      { value: '16', label: 'Городов Охвачено' },
      { value: '4.5/5', label: 'Рейтинг Клиентов' },
      { value: '24/7', label: 'Поддержка Доступна' },
    ],
    contactTitle: 'Начните Партнерство B2B',
    contactSub: 'Расскажите о вашем бизнесе. Мы подготовим персональное предложение.',
    formName: 'Ваше Имя', formCompany: 'Название Компании', formEmail: 'Рабочий Email', formPhone: 'Телефон', formMessage: 'Опишите ваши потребности в транспорте, ожидаемые объемы и предпочтительные направления...', formSubmit: 'Отправить Запрос на Партнерство',
  },
  hy: {
    seoTitle: 'Պրեմիում Տրանսպորտային Լուծումներ Մասնագետների Համար | Zont B2B',
    seoDesc: 'Zont-ը աջակցում է տուրիստական գործակալություններին, հյուրանոցներին, կոնսյերժ ծառայություններին:',
    badge: 'B2B Գործընկերության Ծրագիր',
    heroTitle: 'Պրեմիում Տրանսպորտային Լուծումներ Մասնագետների Համար',
    heroSub: 'ZONT-ը աջակցում է տուրիստական գործակալություններին և հյուրանոցներին Հայաստանում, Եվրոպայում:',
    ctaPartner: 'Դառնալ Գործընկեր',
    ctaQuote: 'Հարցում Առաջարկ',
    whoTitle: 'Ում Ենք Աշխատում',
    whoSub: 'Տրանսպորտային լուծումներ յուրաքանչյուր կարիքի համար',
    servicesTitle: 'Ծառայություններ Մասնագետների Համար',
    servicesSub: 'Լիարժեք տրանսպորտային լուծումներ',
    services: [
      { title: 'Օդանավակայանի Տրանսֆերներ', desc: 'Հուսալի վերցնում և իջնեցում օդանավակայաններում:' },
      { title: 'Կայարանի Տրանսֆերներ', desc: 'Պրոֆեսիոնալ տրանսֆերներ կայարաններից:' },
      { title: 'Վարորդ Տրամադրության', desc: 'Նվիրված վարորդ ժամերով կամ օրերով:' },
      { title: 'Քաղաք-Քաղաք Տրանսֆերներ', desc: 'Երկար հեռավորություն տրանսֆերներ:' },
      { title: 'Խմբային Տրանսպորտ', desc: 'Մինիվեններ 16 ուղևորների համար:' },
      { title: 'VIP և Շքեղ Ծառայություն', desc: 'Պրեմիում մեքենաներ, դիսկրետ վարորդներ:' },
    ],
    whyTitle: 'Ինչու Գործընկերել ZONT-ի Հետ',
    whySub: 'Գործընկերություն կառուցված հուսալիության վրա',
    whyPoints: [
      { icon: 'shield', title: 'Հաստատ և Թաֆանցիկ Տարիֆներ', desc: 'Թաքնված վճարներ չկան:' },
      { icon: 'users', title: 'Պրոֆեսիոնալ Վարորդներ', desc: 'Ստուգված, լիցենզավորված վարորդներ:' },
      { icon: 'plane', title: 'Թռիչքի Հետևում', desc: 'Բոլոր թռիչքների ավտոմատ հետևում:' },
      { icon: 'star', title: 'Դիմավորում Ցուցանակով', desc: 'Վարորդը սպասում է անվանական ցուցանակով:' },
      { icon: 'clock', title: 'Հասանելիություն 24/7', desc: 'Ամրագրեք ցանկացած սպասարկում:' },
      { icon: 'headphones', title: 'Հատուկ Գործընկեր Աջակցություն', desc: 'Նվիրված հաշվի կառավարիչ:' },
    ],
    howTitle: 'Ինչպես Գործում Է Գործընկերությունը',
    howSteps: [
      { title: 'Ուղարկեք Հարցում', desc: 'Պատմեք ձեր բիզնեսի մասին:' },
      { title: 'Ստացեք Առաջարկ', desc: 'Մենք կպատասխանենք 24 ժամվա ընթացքում:' },
      { title: 'Մենք Կազմակերպում Ենք Տրանսպորտը', desc: 'Ամրագրեք պորտալով, email կամ հեռախոսով:' },
      { title: 'Պրեմիում Փորձ', desc: 'Ձեր հաճախորդները վայելում են տրանսֆերներ:' },
    ],
    trustTitle: 'Վստահելի Մասնագետների Կողմից Եվրոպայում',
    trustSub: '',
    trustPoints: [
      { value: '50,000+', label: 'Տրանսֆերներ Կատարված' },
      { value: '16', label: 'Քաղաքներ Ընդգրկված' },
      { value: '4.5/5', label: 'Հաճախորդի Վարկանիշ' },
      { value: '24/7', label: 'Աջակցություն Հասանելի' },
    ],
    contactTitle: 'Սկսեք Ձեր B2B Գործընկերությունը',
    contactSub: 'Պատմեք ձեր բիզնեսի մասին: Մենք կպատրաստենք անհատական առաջարկ:',
    formName: 'Ձեր Անունը', formCompany: 'Ընկերության Անունը', formEmail: 'Գործնական Email', formPhone: 'Հեռախոս', formMessage: 'Նկարագրեք ձեր տրանսպորտային կարիքները...', formSubmit: 'Ուղարկեք Գործընկերության Հարցումը',
  },
};


const targets = [
  { path: '/travel-agencies', name: { en: 'Travel Agencies', fr: 'Agences de Voyage', ru: 'Тур. Агентства', hy: 'Տուրիստական Գործակալություններ' }, tagline: { en: 'Airport transfer partner', fr: 'Partenaire transfert aeroport', ru: 'Партнер по трансферам', hy: 'Օդանավակայանի տրանսֆեր գործընկեր' } },
  { path: '/tourism-agencies', name: { en: 'Tourism Agencies', fr: 'Agences de Tourisme', ru: 'Туристические Агентства', hy: 'Տուրիստական Գործակալություններ' }, tagline: { en: 'Private transport solutions', fr: 'Solutions de transport prive', ru: 'Частный транспорт', hy: 'Օդանավակայանի տրանսֆեր գործընկեր' } },
  { path: '/hotels', name: { en: 'Hotels', fr: 'Hotels', ru: 'Отели', hy: 'Հյուրանոցներ' }, tagline: { en: 'Guest transfer services', fr: 'Transferts pour clients', ru: 'Трансферы для гостей', hy: 'Օդանավակայանի տրանսֆեր գործընկեր' } },
  { path: '/concierge-services', name: { en: 'Concierge Services', fr: 'Conciergeries', ru: 'Консьерж-службы', hy: 'Կոնսյերժ Ծառայություններ' }, tagline: { en: 'VIP chauffeur solutions', fr: 'Solutions chauffeur VIP', ru: 'VIP решения', hy: 'VIP վարորդի լուծումներ' } },
  { path: '/event-agencies', name: { en: 'Event Agencies', fr: 'Agences Evenementielles', ru: 'Ивент-агентства', hy: 'Միջոցառումների Գործակալություններ' }, tagline: { en: 'Event transportation', fr: 'Transport evenementiel', ru: 'Транспорт для мероприятий', hy: 'Օդանավակայանի տրանսֆեր գործընկեր' } },
  { path: '/corporate-clients', name: { en: 'Corporate Clients', fr: 'Entreprises', ru: 'Корпоративные Клиенты', hy: 'Կորպորատիվ Հաճախորդներ' }, tagline: { en: 'Business travel services', fr: 'Services voyage d\'affaires', ru: 'Бизнес-путешествия', hy: 'Օդանավակայանի տրանսֆեր գործընկեր' } },
  { path: '/business-partners', name: { en: 'Business Partners', fr: 'Partenaires Commerciaux', ru: 'Бизнес-партнеры', hy: 'Տուրիստական Գործակալություններ' }, tagline: { en: 'Strategic partnerships', fr: 'Partenariats strategiques', ru: 'Стратегические партнерства', hy: 'Օդանավակայանի տրանսֆեր գործընկեր' } },
  { path: '/tour-operators', name: { en: 'Tour Operators', fr: 'Tour-Operateurs', ru: 'Туроператоры', hy: 'Տուր Օպերատորներ' }, tagline: { en: 'Tour logistics partner', fr: 'Partenaire logistique tours', ru: 'Логистика туров', hy: 'Օդանավակայանի տրանսֆեր գործընկեր' } },
];

const Partners = () => {
  const { language } = useLanguage();
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
        body: JSON.stringify({ ...formState, source_page: '/partners' }),
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

  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="partners-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical="https://www.zont.cab/partners"
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format"
        hreflang={[
          { lang: 'en', href: 'https://www.zont.cab/partners' },
          { lang: 'fr', href: 'https://www.zont.cab/partners' },
          { lang: 'ru', href: 'https://www.zont.cab/partners' },
        ]}
        jsonLd={[
          { "@context": "https://schema.org", "@type": "LocalBusiness", "name": c.seoTitle, "description": c.seoDesc, "url": "https://www.zont.cab", "image": "https://www.zont.cab/logo512.png", "telephone": "+33600000000", "address": { "@type": "PostalAddress", "addressLocality": "Paris", "addressCountry": "FR" }, "priceRange": "$$", "serviceType": "B2B Airport Transfer & Chauffeur Service", "areaServed": ["Paris","France","Monaco","Europe"] },
          { "@context": "https://schema.org", "@type": "WebPage", "name": c.seoTitle, "url": "https://www.zont.cab/partners", "description": c.seoDesc }
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
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {c.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={scrollToContact} className="px-10 py-4 bg-[#2ecc71] text-white font-bold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20 text-lg" data-testid="cta-become-partner">
              {c.ctaPartner}
            </button>
            <button onClick={scrollToContact} className="px-10 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:border-[#2ecc71] hover:text-[#2ecc71] transition-all text-lg" data-testid="cta-request-quote">
              {c.ctaQuote}
            </button>
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
                  {[<Briefcase />, <Globe />, <Hotel />, <Star />, <Users />, <Building2 />, <ArrowRight />, <Plane />][i] && React.cloneElement([<Briefcase className="w-5 h-5 text-[#2ecc71]" />, <Globe className="w-5 h-5 text-[#2ecc71]" />, <Hotel className="w-5 h-5 text-[#2ecc71]" />, <Star className="w-5 h-5 text-[#2ecc71]" />, <Users className="w-5 h-5 text-[#2ecc71]" />, <Building2 className="w-5 h-5 text-[#2ecc71]" />, <ArrowRight className="w-5 h-5 text-[#2ecc71]" />, <Plane className="w-5 h-5 text-[#2ecc71]" />][i])}
                </div>
                <div className="text-gray-900 font-semibold group-hover:text-[#2ecc71] transition-colors mb-1">
                  {t.name[language] || t.name.en}
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.whyPoints.map((p, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#2ecc71]/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#2ecc71]/10 flex items-center justify-center mb-4">
                  {p.icon === 'shield' && <Shield className="w-5 h-5 text-[#2ecc71]" />}
                  {p.icon === 'users' && <Users className="w-5 h-5 text-[#2ecc71]" />}
                  {p.icon === 'plane' && <Plane className="w-5 h-5 text-[#2ecc71]" />}
                  {p.icon === 'star' && <Star className="w-5 h-5 text-[#2ecc71]" />}
                  {p.icon === 'clock' && <Clock className="w-5 h-5 text-[#2ecc71]" />}
                  {p.icon === 'headphones' && <Headphones className="w-5 h-5 text-[#2ecc71]" />}
                </div>
                <h3 className="text-gray-900 font-semibold mb-2">{p.title}</h3>
                <p className="text-gray-600 text-sm">{p.desc}</p>
              </div>
            ))}
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
                <div className="w-14 h-14 rounded-full bg-[#2ecc71] text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#2ecc71]/20">
                  {i + 1}
                </div>
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

      {/* Contact */}
      <section ref={contactRef} className="py-20 bg-white" id="contact" data-testid="b2b-contact-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br bg-[#f8fafc] border border-gray-200 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">{c.contactTitle}</h2>
            <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">{c.contactSub}</p>
            {submitted ? (
              <div className="text-center py-8" data-testid="form-success">
                <CheckCircle className="w-16 h-16 text-[#2ecc71] mx-auto mb-4" />
                <p className="text-xl text-gray-900 font-semibold mb-2">{language === 'fr' ? 'Demande envoyee !' : language === 'ru' ? 'Запрос отправлен!' : language === 'hy' ? 'Հարցումը ուղարկվեց!' : 'Request sent!'}</p>
                <p className="text-gray-400">{language === 'fr' ? 'Nous vous repondrons sous 24h.' : language === 'ru' ? 'Мы ответим в течение 24 часов.' : language === 'hy' ? 'Մենք կպատասխանենք 24 ժամվա ընթացքում:' : 'We will respond within 24 hours.'}</p>
              </div>
            ) : (
            <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit} data-testid="b2b-contact-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder={c.formName} value={formState.name} onChange={e => setFormState(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-name" />
                <input type="text" required placeholder={c.formCompany} value={formState.company} onChange={e => setFormState(p => ({...p, company: e.target.value}))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-company" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="email" required placeholder={c.formEmail} value={formState.email} onChange={e => setFormState(p => ({...p, email: e.target.value}))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-email" />
                <input type="tel" placeholder={c.formPhone} value={formState.phone} onChange={e => setFormState(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71]" data-testid="form-phone" />
              </div>
              <textarea rows="4" placeholder={c.formMessage} value={formState.message} onChange={e => setFormState(p => ({...p, message: e.target.value}))} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] resize-none" data-testid="form-message" />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20 disabled:opacity-50" data-testid="form-submit">
                {submitting ? '...' : c.formSubmit}
              </button>
            </form>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-sm text-gray-400">
              <a href="mailto:partners@zont.cab" className="flex items-center gap-2 hover:text-[#2ecc71] transition-colors"><Mail className="w-4 h-4" /> partners@zont.cab</a>
              <a href="tel:+33123456789" className="flex items-center gap-2 hover:text-[#2ecc71] transition-colors"><Phone className="w-4 h-4" /> +33 1 23 45 67 89</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
