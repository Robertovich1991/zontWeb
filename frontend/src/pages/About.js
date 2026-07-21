import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowRight, Shield, Plane, Clock, Heart, Globe, Star,
  Users, BadgeCheck, MapPin, Car, Headphones
} from 'lucide-react';

const content = {
  en: {
    seoTitle: 'About Zont | Premium Airport Transfer & Private Chauffeur in Europe',
    seoDesc: 'Discover Zont — premium airport transfers with verified private chauffeurs across Europe. Fixed prices, flight tracking, and 24/7 support since day one.',
    badge: 'Our Story',
    heroTitle: 'About',
    heroBrand: 'Zont',
    heroSub: 'Premium airport transfers and private chauffeurs across Europe — designed for travelers who value punctuality, comfort, and a price they can trust.',
    storyTitle: 'Who We Are',
    storyP1: 'Zont was built for one simple idea: arriving should feel effortless. Whether you land at CDG after a long-haul flight, leave a Paris hotel for a business meeting, or need a discreet chauffeur for the evening — we make every journey calm, clear, and on time.',
    storyP2: 'We connect travelers with verified professional drivers in major European cities. No surge pricing. No guessing. Just a fixed fare, a clean premium vehicle, and a chauffeur who is ready when you are.',
    missionTitle: 'Our Mission',
    missionText: 'To give every traveler a private transfer experience that feels personal, premium, and predictable — from the first tap on zont.cab to the moment you reach your door.',
    valuesTitle: 'What Guides Us',
    values: [
      { icon: 'shield', title: 'Trust First', desc: 'Licensed chauffeurs, background checks, and continuous passenger ratings. Safety is never optional.' },
      { icon: 'clock', title: 'On Your Time', desc: 'Real-time flight tracking and free waiting when your plane is delayed. We adapt so you don’t have to rush.' },
      { icon: 'heart', title: 'Human Care', desc: 'Meet & greet with a name sign, multilingual support, and a team that answers — day or night.' },
      { icon: 'star', title: 'Premium Standard', desc: 'Recent Mercedes and BMW vehicles, fixed all-inclusive prices, and a booking flow that takes minutes.' },
    ],
    howTitle: 'How Zont Works',
    howSteps: [
      { num: '01', title: 'Book in minutes', desc: 'Choose pickup, drop-off, and vehicle class. See your fixed price instantly.' },
      { num: '02', title: 'We track your flight', desc: 'Delays are monitored live. Your chauffeur adjusts automatically at no extra cost.' },
      { num: '03', title: 'Meet & ride', desc: 'Your driver waits at arrivals with a name sign — then takes you door to door.' },
    ],
    stats: [
      { val: '50,000+', label: 'Trips completed' },
      { val: '16+', label: 'Cities in Europe' },
      { val: '4.5/5', label: 'Average rating' },
      { val: '24/7', label: 'Live support' },
    ],
    promiseTitle: 'The Zont Promise',
    promiseItems: [
      'Fixed prices — no hidden fees, tolls included',
      'Verified professional chauffeurs only',
      'Free cancellation up to 24 hours before pickup',
      'Secure payment with Visa, Mastercard & Apple Pay',
      'Available on web, iOS and Android',
    ],
    ctaTitle: 'Ready for your next transfer?',
    ctaSub: 'Book a premium airport ride in a few taps — or join our network of professional partners.',
    ctaBook: 'Book a Transfer',
    ctaHelp: 'Contact Support',
  },
  fr: {
    seoTitle: 'À propos de Zont | Transfert Aéroport Premium & Chauffeur Privé en Europe',
    seoDesc: 'Découvrez Zont — transferts aéroport premium avec chauffeurs privés vérifiés en Europe. Prix fixes, suivi des vols et assistance 24h/24.',
    badge: 'Notre Histoire',
    heroTitle: 'À propos de',
    heroBrand: 'Zont',
    heroSub: 'Transferts aéroport premium et chauffeurs privés en Europe — pour les voyageurs qui veulent ponctualité, confort et un prix clair.',
    storyTitle: 'Qui Sommes-Nous',
    storyP1: 'Zont est né d’une idée simple : arriver doit être simple. Que vous atterrissiez à CDG après un long vol, quittiez un hôtel parisien pour un rendez-vous, ou ayez besoin d’un chauffeur discret pour la soirée — chaque trajet doit être calme, clair et à l’heure.',
    storyP2: 'Nous mettons les voyageurs en relation avec des chauffeurs professionnels vérifiés dans les grandes villes européennes. Pas de majoration. Pas d’imprévu. Un tarif fixe, un véhicule premium propre, et un chauffeur prêt quand vous l’êtes.',
    missionTitle: 'Notre Mission',
    missionText: 'Offrir à chaque voyageur un transfert privé personnel, premium et prévisible — du premier clic sur zont.cab jusqu’à votre destination.',
    valuesTitle: 'Ce Qui Nous Guide',
    values: [
      { icon: 'shield', title: 'La Confiance', desc: 'Chauffeurs licenciés, contrôles et notes passagers. La sécurité n’est jamais optionnelle.' },
      { icon: 'clock', title: 'Votre Temps', desc: 'Suivi des vols en temps réel et attente gratuite en cas de retard. Nous nous adaptons.' },
      { icon: 'heart', title: 'L’Attention', desc: 'Accueil avec pancarte nominative, support multilingue, équipe disponible jour et nuit.' },
      { icon: 'star', title: 'Le Standard Premium', desc: 'Véhicules Mercedes et BMW récents, prix fixes tout compris, réservation en quelques minutes.' },
    ],
    howTitle: 'Comment Fonctionne Zont',
    howSteps: [
      { num: '01', title: 'Réservez en minutes', desc: 'Choisissez départ, arrivée et catégorie. Prix fixe affiché immédiatement.' },
      { num: '02', title: 'Nous suivons votre vol', desc: 'Les retards sont surveillés. Votre chauffeur s’adapte sans frais supplémentaires.' },
      { num: '03', title: 'Rencontre & trajet', desc: 'Votre chauffeur vous attend aux arrivées avec une pancarte — puis vous conduit porte à porte.' },
    ],
    stats: [
      { val: '50 000+', label: 'Trajets réalisés' },
      { val: '16+', label: 'Villes en Europe' },
      { val: '4,5/5', label: 'Note moyenne' },
      { val: '24h/24', label: 'Assistance' },
    ],
    promiseTitle: 'La Promesse Zont',
    promiseItems: [
      'Prix fixes — pas de frais cachés, péages inclus',
      'Chauffeurs professionnels vérifiés uniquement',
      'Annulation gratuite jusqu’à 24 h avant le départ',
      'Paiement sécurisé Visa, Mastercard & Apple Pay',
      'Disponible sur web, iOS et Android',
    ],
    ctaTitle: 'Prêt pour votre prochain transfert ?',
    ctaSub: 'Réservez un trajet aéroport premium en quelques clics — ou rejoignez notre réseau de partenaires.',
    ctaBook: 'Réserver un Transfert',
    ctaHelp: 'Contacter le Support',
  },
  ru: {
    seoTitle: 'О Zont | Премиум трансфер из аэропорта и частный водитель в Европе',
    seoDesc: 'Узнайте о Zont — премиум трансферы с проверенными частными водителями по Европе. Фиксированные цены, отслеживание рейсов и поддержка 24/7.',
    badge: 'Наша История',
    heroTitle: 'О компании',
    heroBrand: 'Zont',
    heroSub: 'Премиум трансферы из аэропорта и частные водители в Европе — для тех, кто ценит пунктуальность, комфорт и честную цену.',
    storyTitle: 'Кто Мы',
    storyP1: 'Zont создан вокруг простой идеи: приезд должен быть лёгким. После дальнего рейса в CDG, из отеля на деловую встречу или для вечерней поездки — каждый маршрут спокойный, понятный и вовремя.',
    storyP2: 'Мы связываем путешественников с проверенными профессиональными водителями в крупных городах Европы. Без наценок. Без сюрпризов. Фиксированный тариф, чистый премиум-автомобиль и водитель, готовый когда вы готовы.',
    missionTitle: 'Наша Миссия',
    missionText: 'Дать каждому путешественнику личный, премиальный и предсказуемый трансфер — от первого клика на zont.cab до вашей двери.',
    valuesTitle: 'Наши Принципы',
    values: [
      { icon: 'shield', title: 'Доверие', desc: 'Лицензированные водители, проверки и оценки пассажиров. Безопасность обязательна.' },
      { icon: 'clock', title: 'Ваше Время', desc: 'Отслеживание рейсов и бесплатное ожидание при задержке. Мы подстраиваемся под вас.' },
      { icon: 'heart', title: 'Забота', desc: 'Встреча с табличкой, многоязычная поддержка и команда днём и ночью.' },
      { icon: 'star', title: 'Премиум', desc: 'Mercedes и BMW, фиксированные цены «всё включено», бронирование за минуты.' },
    ],
    howTitle: 'Как Работает Zont',
    howSteps: [
      { num: '01', title: 'Бронь за минуты', desc: 'Выберите точки и класс авто. Фиксированная цена сразу.' },
      { num: '02', title: 'Следим за рейсом', desc: 'Задержки отслеживаются. Водитель подстраивается без доплаты.' },
      { num: '03', title: 'Встреча и поездка', desc: 'Водитель ждёт у выхода с табличкой — и везёт вас дверь к двери.' },
    ],
    stats: [
      { val: '50 000+', label: 'Поездок' },
      { val: '16+', label: 'Городов Европы' },
      { val: '4.5/5', label: 'Рейтинг' },
      { val: '24/7', label: 'Поддержка' },
    ],
    promiseTitle: 'Обещание Zont',
    promiseItems: [
      'Фиксированные цены — без скрытых платежей',
      'Только проверенные профессиональные водители',
      'Бесплатная отмена за 24 часа до поездки',
      'Безопасная оплата Visa, Mastercard и Apple Pay',
      'Доступно на сайте, iOS и Android',
    ],
    ctaTitle: 'Готовы к следующему трансферу?',
    ctaSub: 'Забронируйте премиум поездку за несколько нажатий — или станьте нашим партнёром.',
    ctaBook: 'Забронировать',
    ctaHelp: 'Связаться с поддержкой',
  },
  hy: {
    seoTitle: 'Zont-ի մասին | Պրեմիում օդանավակայանի տրանսֆեր Եվրոպայում',
    seoDesc: 'Ծանոթացեք Zont-ին — պրեմիում տրանսֆերներ ստուգված վարորդներով Եվրոպայում։ Հաստատ գներ, թռիչքի հետևում և 24/7 աջակցություն։',
    badge: 'Մեր Պատմությունը',
    heroTitle: 'Մեր մասին',
    heroBrand: 'Zont',
    heroSub: 'Պրեմիում օդանավակայանի տրանսֆերներ և մասնավոր վարորդներ Եվրոպայում — ճշտության, հարմարավետության և վստահելի գնի համար։',
    storyTitle: 'Ով ենք մենք',
    storyP1: 'Zont-ը ստեղծվել է պարզ գաղափարով՝ ժամանումը պետք է լինի հեշտ։ Երկար թռիչքից հետո, հյուրանոցից հանդիպման, կամ երեկոյան ուղևորության համար — ամեն ճանապարհ հանգիստ է և ժամանակին։',
    storyP2: 'Մենք կապում ենք ուղևորներին ստուգված պրոֆեսիոնալ վարորդների հետ Եվրոպայի խոշոր քաղաքներում։ Առանց հավելավճարների։ Հաստատ գին, մաքուր պրեմիում մեքենա և վարորդ, որը պատրաստ է ձեզ։',
    missionTitle: 'Մեր Առաքելությունը',
    missionText: 'Յուրաքանչյուր ուղևորին տալ անձնական, պրեմիում և կանխատեսելի տրանսֆեր — zont.cab-ից մինչև ձեր դուռը։',
    valuesTitle: 'Մեր Արժեքները',
    values: [
      { icon: 'shield', title: 'Վստահություն', desc: 'Լիցենզավորված վարորդներ և անվտանգություն առաջին հերթին։' },
      { icon: 'clock', title: 'Ձեր Ժամանակը', desc: 'Թռիչքի հետևում և անվճար սպասում ուշացման դեպքում։' },
      { icon: 'heart', title: 'Խնամք', desc: 'Անվանական ցուցանակով դիմավորում և բազմալեզու աջակցություն։' },
      { icon: 'star', title: 'Պրեմիում', desc: 'Mercedes և BMW, հաստատ գներ, արագ ամրագրում։' },
    ],
    howTitle: 'Ինչպես է աշխատում Zont-ը',
    howSteps: [
      { num: '01', title: 'Ամրագրեք րոպեներում', desc: 'Ընտրեք կետերը և մեքենայի դասը։ Հաստատ գին անմիջապես։' },
      { num: '02', title: 'Հետևում ենք թռիչքին', desc: 'Ուշացումները վերահսկվում են։ Վարորդը հարմարվում է առանց հավելավճարի։' },
      { num: '03', title: 'Հանդիպում և ուղևորություն', desc: 'Վարորդը սպասում է ցուցանակով և տանում է ձեզ դուռից դուռ։' },
    ],
    stats: [
      { val: '50,000+', label: 'Ուղևորություններ' },
      { val: '16+', label: 'Քաղաքներ' },
      { val: '4.5/5', label: 'Գնահատական' },
      { val: '24/7', label: 'Աջակցություն' },
    ],
    promiseTitle: 'Zont-ի Խոստումը',
    promiseItems: [
      'Հաստատ գներ — առանց թաքնված վճարների',
      'Միայն ստուգված պրոֆեսիոնալ վարորդներ',
      'Անվճար չեղարկում մինչև 24 ժամ առաջ',
      'Ապահով վճարում Visa, Mastercard և Apple Pay',
      'Հասանելի վեբում, iOS և Android-ում',
    ],
    ctaTitle: 'Պատրա՞ստ եք հաջորդ տրանսֆերին',
    ctaSub: 'Ամրագրեք պրեմիում ուղևորություն մի քանի սեղմումով։',
    ctaBook: 'Ամրագրել',
    ctaHelp: 'Կապ աջակցության հետ',
  },
  es: {
    seoTitle: 'Sobre Zont | Traslado Aeropuerto Premium y Chófer Privado en Europa',
    seoDesc: 'Conoce Zont — traslados aeropuerto premium con chóferes privados verificados en Europa. Precios fijos, seguimiento de vuelos y soporte 24/7.',
    badge: 'Nuestra Historia',
    heroTitle: 'Sobre',
    heroBrand: 'Zont',
    heroSub: 'Traslados aeropuerto premium y chóferes privados en Europa — para viajeros que valoran puntualidad, confort y un precio claro.',
    storyTitle: 'Quiénes Somos',
    storyP1: 'Zont nació de una idea simple: llegar debe ser fácil. Tras un vuelo largo a CDG, desde un hotel en París a una reunión, o para una noche discreta — cada trayecto es tranquilo, claro y puntual.',
    storyP2: 'Conectamos viajeros con conductores profesionales verificados en las grandes ciudades europeas. Sin recargos. Sin sorpresas. Tarifa fija, vehículo premium limpio y un chófer listo cuando tú lo estás.',
    missionTitle: 'Nuestra Misión',
    missionText: 'Ofrecer a cada viajero un traslado privado personal, premium y predecible — desde el primer clic en zont.cab hasta tu destino.',
    valuesTitle: 'Lo Que Nos Guía',
    values: [
      { icon: 'shield', title: 'Confianza', desc: 'Chóferes con licencia, verificaciones y valoraciones. La seguridad no es opcional.' },
      { icon: 'clock', title: 'Tu Tiempo', desc: 'Seguimiento de vuelos y espera gratuita si hay retraso. Nos adaptamos a ti.' },
      { icon: 'heart', title: 'Cuidado', desc: 'Recepción con cartel nominativo, soporte multilingüe y equipo día y noche.' },
      { icon: 'star', title: 'Estándar Premium', desc: 'Mercedes y BMW recientes, precios fijos todo incluido, reserva en minutos.' },
    ],
    howTitle: 'Cómo Funciona Zont',
    howSteps: [
      { num: '01', title: 'Reserva en minutos', desc: 'Elige origen, destino y vehículo. Precio fijo al instante.' },
      { num: '02', title: 'Seguimos tu vuelo', desc: 'Los retrasos se monitorizan. Tu chófer se adapta sin coste extra.' },
      { num: '03', title: 'Encuentro y viaje', desc: 'Tu conductor te espera en llegadas con cartel — y te lleva puerta a puerta.' },
    ],
    stats: [
      { val: '50.000+', label: 'Viajes completados' },
      { val: '16+', label: 'Ciudades en Europa' },
      { val: '4,5/5', label: 'Valoración media' },
      { val: '24/7', label: 'Soporte' },
    ],
    promiseTitle: 'La Promesa Zont',
    promiseItems: [
      'Precios fijos — sin gastos ocultos, peajes incluidos',
      'Solo chóferes profesionales verificados',
      'Cancelación gratis hasta 24 h antes',
      'Pago seguro con Visa, Mastercard y Apple Pay',
      'Disponible en web, iOS y Android',
    ],
    ctaTitle: '¿Listo para tu próximo traslado?',
    ctaSub: 'Reserva un viaje aeropuerto premium en unos toques — o únete a nuestra red de partners.',
    ctaBook: 'Reservar Traslado',
    ctaHelp: 'Contactar Soporte',
  },
};

const iconMap = {
  shield: Shield,
  clock: Clock,
  heart: Heart,
  star: Star,
};

const About = () => {
  const { language } = useLanguage();
  const c = content[language] || content.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="about-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical="https://www.zont.cab/about"
        jsonLd={[{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: c.seoTitle,
          description: c.seoDesc,
          url: 'https://www.zont.cab/about',
          mainEntity: {
            '@type': 'Organization',
            name: 'Zont',
            url: 'https://www.zont.cab',
            logo: 'https://www.zont.cab/logo512.png',
            description: c.seoDesc,
            areaServed: 'Europe',
            email: 'support@zont.cab',
          },
        }]}
      />
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#15202b] to-[#0f1419]" />
        <div className="absolute top-16 right-0 w-[28rem] h-[28rem] bg-[#2ecc71]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c8a951]/8 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#2ecc71]/10 text-[#2ecc71] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <BadgeCheck className="w-4 h-4" />
            <span>{c.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3" data-testid="about-h1">
            {c.heroTitle}{' '}
            <span className="text-[#2ecc71]">{c.heroBrand}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {c.heroSub}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 bg-[#0f1419] border-y border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {c.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#2ecc71]">{s.val}</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div>
            <p className="text-[#c8a951] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Zont</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">{c.storyTitle}</h2>
            <p className="text-gray-300 leading-relaxed mb-4">{c.storyP1}</p>
            <p className="text-gray-400 leading-relaxed">{c.storyP2}</p>
          </div>
          <div className="bg-[#0f1419] border border-gray-800 rounded-2xl p-7 md:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2ecc71]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#2ecc71]/15 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#2ecc71]" />
              </div>
              <h3 className="text-lg font-bold text-white">{c.missionTitle}</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-[15px]">{c.missionText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { Icon: Plane, label: 'Airport' },
                { Icon: Car, label: 'Private' },
                { Icon: MapPin, label: 'Door-to-door' },
                { Icon: Headphones, label: '24/7' },
              ].map(({ Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <Icon className="w-3.5 h-3.5 text-[#2ecc71]" /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 px-4 bg-[#0f1419]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{c.valuesTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {c.values.map((v, i) => {
              const Icon = iconMap[v.icon] || Shield;
              return (
                <div
                  key={i}
                  className="bg-[#1a2332] border border-gray-800 hover:border-[#2ecc71]/35 rounded-2xl p-6 transition-colors"
                  data-testid={`about-value-${i}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2ecc71]/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#2ecc71]" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">{c.howTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {c.howSteps.map((step, i) => (
              <div key={i} className="relative bg-[#0f1419] border border-gray-800 rounded-2xl p-6">
                <div className="text-4xl font-bold text-[#2ecc71]/25 mb-3">{step.num}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-16 md:py-20 px-4 bg-[#0f1419]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Users className="w-5 h-5 text-[#c8a951]" />
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center">{c.promiseTitle}</h2>
          </div>
          <ul className="space-y-3">
            {c.promiseItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-[#1a2332] border border-gray-800 rounded-xl px-5 py-4"
              >
                <BadgeCheck className="w-5 h-5 text-[#2ecc71] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm md:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#2ecc71]/10 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">{c.ctaTitle}</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">{c.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-[#2ecc71] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/25"
              data-testid="about-cta-book"
            >
              {c.ctaBook} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/15 border border-white/10 transition-all"
              data-testid="about-cta-help"
            >
              {c.ctaHelp}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
