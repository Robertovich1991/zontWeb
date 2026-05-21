import B2BPage from '@/components/B2BPage';

// === Hotel B2B Page — "Borne de réservation ZONT" ===
// Content is now built around the in-hotel kiosk product.
// The page keeps its contact form, only the hero + benefits + services were re-themed.

const content = {
  fr: {
    seoTitle: 'Borne de Réservation ZONT pour Hôtels — VTC, Taxi & Chauffeur Privé',
    seoDesc: 'Transformez votre hôtel avec une borne de réservation ZONT. Tablette interactive 24h/24 pour transferts aéroport, chauffeur privé et VTC. Installation gratuite, commission 10-20%.',
    badge: 'Borne ZONT en Hôtel',
    heroTitle: 'Transformez votre hôtel avec une borne de réservation ZONT',
    heroSub: 'Offrez à vos clients un service premium de chauffeur privé directement depuis votre réception. Installation gratuite, autonome 24h/24, multilingue.',
    ctaPartner: 'Devenir partenaire ZONT',
    ctaQuote: 'Demander une installation',

    benefitsTitle: 'Ce que nous proposons',
    benefitsSub: 'Une borne interactive clé en main, 100% prise en charge par nos équipes',
    benefits: [
      { title: 'Installation gratuite', desc: 'Une tablette ou borne interactive installée et configurée gratuitement par notre société.' },
      { title: 'Disponible 24h/24', desc: 'Solution moderne et autonome qui fonctionne en continu, même quand votre réception est fermée.' },
      { title: 'Réservation simple et rapide', desc: 'Vos clients réservent en quelques clics leurs transferts aéroports et chauffeurs privés.' },
      { title: 'Interface multilingue', desc: 'Français, Anglais, Russe, Arménien — adaptée à votre clientèle internationale.' },
      { title: 'Suivi & maintenance', desc: 'Notre équipe assure le suivi du service, la maintenance et les mises à jour à distance.' },
      { title: 'Aucun coût caché', desc: 'Pas d\'abonnement, pas de frais d\'installation. Vous touchez une commission sur chaque réservation.' },
    ],

    servicesTitle: 'Les avantages pour votre hôtel',
    servicesSub: 'Plus de revenus, plus de satisfaction client, zéro contrainte',
    services: [
      { title: 'Plus de revenus chauffeur', desc: 'Augmentation des demandes de transferts et services chauffeurs depuis votre hall.' },
      { title: 'Expérience premium dès l\'arrivée', desc: 'Vos clients vivent un accueil moderne et premium dès qu\'ils franchissent la porte.' },
      { title: 'Complément à votre réception', desc: 'Service moderne et autonome installé à côté de la réception, sans solliciter votre personnel.' },
      { title: 'Commission 10% à 20%', desc: 'Vous touchez une commission de 10% à 20% selon le service réservé par le client.' },
      { title: 'Tarification adaptée', desc: 'Tarification ajustée au standing et à la gamme de votre hôtel — boutique, 4★, 5★, palace.' },
      { title: 'Image de marque renforcée', desc: 'Associez votre hôtel à un service VTC premium reconnu — un vrai différenciant.' },
    ],

    howTitle: 'Services réservables depuis la borne',
    howSteps: [
      { title: 'Transferts aéroports', desc: 'CDG, Orly, Beauvais — Meet & Greet inclus.' },
      { title: 'Disneyland® Paris', desc: 'Aller-retour parc, hôtels Disney et alentours.' },
      { title: 'Chauffeur à disposition', desc: '4h / 8h / 12h — Mercedes S, E, V et Renault Trafic.' },
      { title: 'Familles & groupes', desc: 'Véhicules 7-8 places + suivi des vols en temps réel.' },
    ],

    trustTitle: 'Notre équipe s\'occupe de tout',
    trustSub: 'Installation, configuration, formation de votre personnel et suivi continu — vous n\'avez rien à faire.',
    trustPoints: [
      { value: '0€', label: 'Coût d\'installation' },
      { value: '24/7', label: 'Service autonome' },
      { value: '10-20%', label: 'Commission hôtel' },
      { value: '< 7 jours', label: 'Mise en service' },
    ],

    relatedTitle: 'Solutions pour secteurs liés',
    contactTitle: 'Contactez-nous pour devenir partenaire ZONT',
    contactSub: 'Renseignez les coordonnées de votre hôtel ci-dessous. Un membre de notre équipe vous recontacte sous 24h pour planifier l\'installation gratuite de votre borne.',
    formSubmit: 'Demander mon installation gratuite',
    formName: 'Votre nom',
    formCompany: 'Nom de l\'hôtel',
    formEmail: 'Email',
    formPhone: 'Téléphone',
    formMessage: 'Nombre de chambres, localisation, créneau souhaité pour l\'installation...',
    backToPartners: 'Retour aux solutions professionnelles',
  },

  en: {
    seoTitle: 'ZONT Booking Kiosk for Hotels — Private Driver & Airport Transfer',
    seoDesc: 'Transform your hotel with a ZONT booking kiosk. 24/7 interactive tablet for airport transfers, private chauffeur and VTC. Free install, 10-20% commission for the hotel.',
    badge: 'ZONT Kiosk for Hotels',
    heroTitle: 'Transform your hotel with a ZONT booking kiosk',
    heroSub: 'Offer your guests a premium private chauffeur service directly from your front desk. Free install, autonomous 24/7, multilingual interface.',
    ctaPartner: 'Become a ZONT Partner',
    ctaQuote: 'Request an Installation',

    benefitsTitle: 'What we provide',
    benefitsSub: 'A turnkey interactive kiosk, 100% handled by our team',
    benefits: [
      { title: 'Free installation', desc: 'An interactive tablet or kiosk installed and configured for free by our company.' },
      { title: 'Available 24/7', desc: 'A modern, autonomous solution that runs even when your reception is closed.' },
      { title: 'Simple, fast booking', desc: 'Your guests book airport transfers and private chauffeurs in a few clicks.' },
      { title: 'Multilingual interface', desc: 'French, English, Russian, Armenian — built for international clientele.' },
      { title: 'Monitoring & maintenance', desc: 'Our team handles monitoring, maintenance and remote updates.' },
      { title: 'No hidden cost', desc: 'No subscription, no installation fee. You earn a commission on every booking.' },
    ],

    servicesTitle: 'The advantages for your hotel',
    servicesSub: 'More revenue, more guest satisfaction, zero workload',
    services: [
      { title: 'More chauffeur revenue', desc: 'Increased transfer and chauffeur demand straight from your lobby.' },
      { title: 'Premium guest experience', desc: 'Guests enjoy a modern, premium welcome from the moment they walk in.' },
      { title: 'Front-desk companion', desc: 'A modern, autonomous service installed next to the reception, without involving your staff.' },
      { title: '10% to 20% commission', desc: 'You earn a 10–20% commission depending on the service booked by the guest.' },
      { title: 'Tier-matched pricing', desc: 'Pricing aligned with your hotel category — boutique, 4★, 5★, palace.' },
      { title: 'Stronger brand image', desc: 'Associate your hotel with a recognised premium VTC service — a real differentiator.' },
    ],

    servicesGroupTitle: 'Services available on the kiosk',
    howTitle: 'Services available on the kiosk',
    howSteps: [
      { title: 'Airport transfers', desc: 'CDG, Orly, Beauvais — Meet & Greet included.' },
      { title: 'Disneyland® Paris', desc: 'Round-trip park, Disney hotels and surroundings.' },
      { title: 'Driver at disposal', desc: '4h / 8h / 12h — Mercedes S, E, V and Renault Trafic.' },
      { title: 'Families & groups', desc: '7–8 seat vehicles + real-time flight tracking.' },
    ],

    trustTitle: 'Our team handles everything',
    trustSub: 'Installation, configuration, staff training and ongoing monitoring — nothing for you to do.',
    trustPoints: [
      { value: '€0', label: 'Install cost' },
      { value: '24/7', label: 'Autonomous service' },
      { value: '10–20%', label: 'Hotel commission' },
      { value: '< 7 days', label: 'Go-live time' },
    ],

    relatedTitle: 'Solutions for related hospitality sectors',
    contactTitle: 'Contact us to become a ZONT partner',
    contactSub: 'Share your hotel\'s details below. A team member will contact you within 24 hours to schedule the free kiosk installation.',
    formSubmit: 'Request my free installation',
    formName: 'Your name',
    formCompany: 'Hotel name',
    formEmail: 'Email',
    formPhone: 'Phone',
    formMessage: 'Number of rooms, location, preferred install timing...',
    backToPartners: 'Back to all professional solutions',
  },

  ru: {
    seoTitle: 'Терминал бронирования ZONT для отелей — VTC, Такси, Частный водитель',
    seoDesc: 'Преобразите ваш отель с терминалом бронирования ZONT. Интерактивный планшет 24/7 для трансферов и частных водителей. Бесплатная установка, комиссия 10–20%.',
    badge: 'Терминал ZONT для отелей',
    heroTitle: 'Преобразите ваш отель с терминалом бронирования ZONT',
    heroSub: 'Предложите гостям премиальный сервис частного водителя прямо у стойки регистрации. Бесплатная установка, автономный режим 24/7, многоязычный интерфейс.',
    ctaPartner: 'Стать партнёром ZONT',
    ctaQuote: 'Запросить установку',

    benefitsTitle: 'Что мы предлагаем',
    benefitsSub: 'Готовое интерактивное решение «под ключ», полностью обслуживаемое нами',
    benefits: [
      { title: 'Бесплатная установка', desc: 'Планшет или терминал устанавливается и настраивается нашей компанией бесплатно.' },
      { title: 'Работа 24/7', desc: 'Современное автономное решение — работает даже когда ресепшн закрыт.' },
      { title: 'Простое бронирование', desc: 'Гости бронируют трансфер и водителя в несколько кликов.' },
      { title: 'Многоязычный интерфейс', desc: 'Французский, английский, русский, армянский — для международных гостей.' },
      { title: 'Мониторинг и поддержка', desc: 'Наша команда обеспечивает удалённую поддержку и обновления.' },
      { title: 'Без скрытых расходов', desc: 'Без подписки, без платы за установку. Вы получаете комиссию с каждой брони.' },
    ],

    servicesTitle: 'Преимущества для вашего отеля',
    servicesSub: 'Больше дохода, больше довольных гостей, ноль нагрузки',
    services: [
      { title: 'Больше дохода с трансферов', desc: 'Рост заказов на трансферы и водителя прямо из вашего холла.' },
      { title: 'Премиум-впечатление', desc: 'Гости получают современный премиальный приём с первой минуты.' },
      { title: 'Дополнение к ресепшн', desc: 'Современный автономный сервис рядом со стойкой — без нагрузки на персонал.' },
      { title: 'Комиссия 10–20%', desc: 'Вы получаете 10–20% комиссии в зависимости от заказанной услуги.' },
      { title: 'Тариф под уровень отеля', desc: 'Цены адаптируются под класс отеля — бутик, 4★, 5★, palace.' },
      { title: 'Усиление бренда', desc: 'Ассоциация с признанным премиум VTC-сервисом — реальное преимущество.' },
    ],

    howTitle: 'Услуги, доступные через терминал',
    howSteps: [
      { title: 'Трансферы в аэропорт', desc: 'CDG, Orly, Beauvais — Meet & Greet включён.' },
      { title: 'Disneyland® Париж', desc: 'Туда-обратно парк и отели Disney.' },
      { title: 'Водитель в распоряжение', desc: '4ч / 8ч / 12ч — Mercedes S, E, V и Renault Trafic.' },
      { title: 'Семьи и группы', desc: 'Авто на 7–8 мест + отслеживание рейсов в реальном времени.' },
    ],

    trustTitle: 'Наша команда делает всё',
    trustSub: 'Установка, настройка, обучение персонала и постоянная поддержка — вам ничего делать не нужно.',
    trustPoints: [
      { value: '0€', label: 'Стоимость установки' },
      { value: '24/7', label: 'Автономный режим' },
      { value: '10–20%', label: 'Комиссия отеля' },
      { value: '< 7 дней', label: 'Запуск сервиса' },
    ],

    relatedTitle: 'Решения для смежных секторов',
    contactTitle: 'Свяжитесь с нами, чтобы стать партнёром ZONT',
    contactSub: 'Укажите данные вашего отеля ниже. Наш сотрудник свяжется с вами в течение 24 часов для согласования бесплатной установки.',
    formSubmit: 'Заказать бесплатную установку',
    formName: 'Ваше имя',
    formCompany: 'Название отеля',
    formEmail: 'Email',
    formPhone: 'Телефон',
    formMessage: 'Количество номеров, расположение, желаемое время установки...',
    backToPartners: 'Назад ко всем профессиональным решениям',
  },

  hy: {
    seoTitle: 'ZONT Ամրագրման Կրպակ Հյուրանոցների Համար',
    seoDesc: 'Փոխակերպեք ձեր հյուրանոցը ZONT ամրագրման կրպակով՝ պրեմիում VTC ծառայություն, անվճար տեղադրում, 10–20% միջնորդավճար։',
    badge: 'ZONT Կրպակ Հյուրանոցների Համար',
    heroTitle: 'Փոխակերպեք ձեր հյուրանոցը ZONT ամրագրման կրպակով',
    heroSub: 'Առաջարկեք ձեր հյուրերին պրեմիում մասնավոր վարորդի ծառայություն ուղղակիորեն ընդունարանից։ Անվճար տեղադրում, ինքնավար 24/7։',
    ctaPartner: 'Դառնալ ZONT գործընկեր',
    ctaQuote: 'Հարցում տեղադրման համար',

    benefitsTitle: 'Ինչ ենք առաջարկում',
    benefitsSub: 'Ինտերակտիվ կրպակ՝ ամբողջությամբ սպասարկվում է մեր թիմի կողմից',
    benefits: [
      { title: 'Անվճար տեղադրում', desc: 'Պլանշետ կամ կրպակ՝ տեղադրված և կարգավորված անվճար։' },
      { title: '24/7 հասանելի', desc: 'Ինքնավար ժամանակակից լուծում, որն աշխատում է անկախ ընդունարանից։' },
      { title: 'Պարզ ամրագրում', desc: 'Հյուրերը մի քանի կտտոցով ամրագրում են տրանսֆեր և վարորդ։' },
      { title: 'Բազմալեզու', desc: 'Ֆրանսերեն, անգլերեն, ռուսերեն, հայերեն։' },
      { title: 'Հետևում և սպասարկում', desc: 'Մեր թիմը կատարում է հեռակառավարման թարմացումները։' },
      { title: 'Թաքնված ծախսեր չկան', desc: 'Առանց բաժանորդագրության։ Միջնորդավճար յուրաքանչյուր ամրագրումից։' },
    ],

    servicesTitle: 'Առավելությունները ձեր հյուրանոցի համար',
    servicesSub: 'Ավելի շատ եկամուտ, ավելի շատ բավարարված հյուրեր',
    services: [
      { title: 'Ավելի շատ եկամուտ', desc: 'Տրանսֆերի և վարորդի հարցումների աճ ուղղակիորեն ձեր սրահից։' },
      { title: 'Պրեմիում փորձ', desc: 'Հյուրերն ապրում են ժամանակակից ընդունելություն առաջին վայրկյանից։' },
      { title: 'Ընդունարանի համալրում', desc: 'Ինքնավար ծառայություն՝ առանց անձնակազմի ներգրավման։' },
      { title: '10–20% միջնորդավճար', desc: 'Դուք ստանում եք 10–20% միջնորդավճար յուրաքանչյուր ամրագրումից։' },
      { title: 'Հարմարեցված գին', desc: 'Գները հարմարեցված են ձեր հյուրանոցի մակարդակին։' },
      { title: 'Բրենդի ուժեղացում', desc: 'Ձեր հյուրանոցը կկապեք պրեմիում VTC ծառայության հետ։' },
    ],

    howTitle: 'Կրպակից հասանելի ծառայություններ',
    howSteps: [
      { title: 'Օդանավակայանի տրանսֆեր', desc: 'CDG, Orly, Beauvais — Meet & Greet ներառված։' },
      { title: 'Disneyland® Փարիզ', desc: 'Գնալ-գալ պարկ ու Disney հյուրանոցներ։' },
      { title: 'Վարորդ տրամադրությամբ', desc: '4ժ / 8ժ / 12ժ — Mercedes S, E, V, Renault Trafic։' },
      { title: 'Ընտանիքներ և խմբեր', desc: '7–8 տեղանոց մեքենաներ + թռիչքների իրական ժամանակում հետևում։' },
    ],

    trustTitle: 'Մեր թիմը զբաղվում է ամեն ինչով',
    trustSub: 'Տեղադրում, կազմակերպում, պարբերական մոնիթորինգ։',
    trustPoints: [
      { value: '0€', label: 'Տեղադրման արժեք' },
      { value: '24/7', label: 'Ինքնավար ծառայություն' },
      { value: '10–20%', label: 'Միջնորդավճար' },
      { value: '< 7 օր', label: 'Մեկնարկ' },
    ],

    relatedTitle: 'Մյուս լուծումները',
    contactTitle: 'Կապվեք ZONT գործընկեր դառնալու համար',
    contactSub: 'Լրացրեք ձեր հյուրանոցի տվյալները ստորև։ Մեր թիմը կկապվի 24 ժամվա ընթացքում։',
    formSubmit: 'Հարցել անվճար տեղադրման',
    formName: 'Ձեր անունը',
    formCompany: 'Հյուրանոցի անունը',
    formEmail: 'Email',
    formPhone: 'Հեռախոս',
    formMessage: 'Սենյակների քանակ, տեղակայում, ցանկալի ժամ...',
    backToPartners: 'Վերադառնալ բոլոր լուծումներին',
  },
};

const seoUrls = {
  en: '/hotel-booking-kiosk',
  fr: '/borne-reservation-hotel',
  ru: '/terminal-bronirovaniya-otel',
  hy: '/hyuranots-kropak',
};

const relatedPages = [
  { path: '/concierge-services', name: 'Concierge Services', tagline: 'VIP chauffeur solutions' },
  { path: '/tourism-agencies', name: 'Tourism Agencies', tagline: 'Private transport solutions' },
  { path: '/event-agencies', name: 'Event Agencies', tagline: 'Event transportation' },
];

const Hotels = () => (
  <B2BPage
    content={content}
    seoUrls={seoUrls}
    relatedPages={relatedPages}
    heroImage="/images/borne-reservation-vtc-taxi-hotel-paris.webp"
    heroImageAlt="Borne de réservation ZONT — VTC, Taxi, Chauffeur privé installée à la réception d'un hôtel à Paris"
  />
);

export default Hotels;
