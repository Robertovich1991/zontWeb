import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { Smartphone, Search, MapPin, CheckCircle } from 'lucide-react';

const content = {
  en: {
    seoTitle: 'How It Works - Book Airport Transfer | Zont',
    seoDesc: 'Learn how to book your airport transfer with Zont in 4 simple steps. Download the app, enter destination, meet your driver and enjoy premium ride.',
    heroTitle: 'How It Works',
    heroSub: 'Book your premium airport transfer in 4 simple steps',
    steps: [
      { icon: 'smartphone', title: 'Download the App', desc: 'Get the Zont app for free on iOS or Android. Create your account in seconds.' },
      { icon: 'search', title: 'Enter Your Destination', desc: 'Type your pickup and drop-off locations. See the price instantly. No hidden fees.' },
      { icon: 'mappin', title: 'Meet Your Driver', desc: 'Your professional driver arrives on time. Track in real-time on the map.' },
      { icon: 'check', title: 'Enjoy Your Ride', desc: 'Sit back and relax. Rate your experience after each trip.' },
    ],
    whyTitle: 'Why Thousands Choose Zont',
    whyPoints: [
      { title: 'Fixed Prices', desc: 'Know the exact price before booking. No surge pricing, no surprises.' },
      { title: 'Professional Drivers', desc: 'All drivers are vetted, licensed and highly rated by our community.' },
      { title: 'Flight Tracking', desc: 'We monitor your flight. If delayed, your driver adjusts automatically.' },
      { title: '24/7 Support', desc: 'Our team is available around the clock to help with any question.' },
    ],
    ctaTitle: 'Ready to Get Started?',
    ctaSub: 'Download the app and book your first ride today.',
    ctaBtn: 'Get the App',
  },
  fr: {
    seoTitle: 'Comment Ca Marche - Reserver un Transfert Aeroport | Zont',
    seoDesc: 'Decouvrez comment reserver votre transfert aeroport avec Zont en 4 etapes simples. Telechargez l\'appli, entrez votre destination, rencontrez votre chauffeur.',
    heroTitle: 'Comment Ca Marche',
    heroSub: 'Reservez votre transfert aeroport premium en 4 etapes simples',
    steps: [
      { icon: 'smartphone', title: 'Telechargez l\'Application', desc: 'Obtenez l\'appli Zont gratuitement sur iOS ou Android. Creez votre compte en quelques secondes.' },
      { icon: 'search', title: 'Entrez Votre Destination', desc: 'Saisissez vos lieux de depart et d\'arrivee. Voyez le prix instantanement. Aucun frais cache.' },
      { icon: 'mappin', title: 'Rencontrez Votre Chauffeur', desc: 'Votre chauffeur professionnel arrive a l\'heure. Suivez-le en temps reel sur la carte.' },
      { icon: 'check', title: 'Profitez du Trajet', desc: 'Installez-vous et detendez-vous. Notez votre experience apres chaque course.' },
    ],
    whyTitle: 'Pourquoi Des Milliers Choisissent Zont',
    whyPoints: [
      { title: 'Prix Fixes', desc: 'Connaissez le prix exact avant de reserver. Pas de majoration, pas de surprises.' },
      { title: 'Chauffeurs Professionnels', desc: 'Tous les chauffeurs sont verifies, licencies et bien notes par notre communaute.' },
      { title: 'Suivi de Vol', desc: 'Nous surveillons votre vol. En cas de retard, votre chauffeur s\'adapte automatiquement.' },
      { title: 'Support 24/7', desc: 'Notre equipe est disponible 24h/24 pour toute question.' },
    ],
    ctaTitle: 'Pret a Commencer ?',
    ctaSub: 'Telechargez l\'application et reservez votre premier trajet.',
    ctaBtn: 'Obtenir l\'Appli',
  },
  ru: {
    seoTitle: 'Как Это Работает - Забронировать Трансфер | Zont',
    seoDesc: 'Узнайте, как забронировать трансфер из аэропорта с Zont за 4 простых шага. Скачайте приложение, введите направление, встретьте водителя.',
    heroTitle: 'Как Это Работает',
    heroSub: 'Забронируйте премиальный трансфер за 4 простых шага',
    steps: [
      { icon: 'smartphone', title: 'Скачайте Приложение', desc: 'Получите приложение Zont бесплатно на iOS или Android. Создайте аккаунт за секунды.' },
      { icon: 'search', title: 'Введите Направление', desc: 'Укажите место отправления и прибытия. Увидьте цену мгновенно. Без скрытых платежей.' },
      { icon: 'mappin', title: 'Встретьте Водителя', desc: 'Ваш профессиональный водитель прибывает вовремя. Отслеживайте на карте в реальном времени.' },
      { icon: 'check', title: 'Наслаждайтесь Поездкой', desc: 'Расслабьтесь и наслаждайтесь. Оцените опыт после каждой поездки.' },
    ],
    whyTitle: 'Почему Тысячи Выбирают Zont',
    whyPoints: [
      { title: 'Фиксированные Цены', desc: 'Знайте точную цену до бронирования. Без наценок и сюрпризов.' },
      { title: 'Профессиональные Водители', desc: 'Все водители проверены, лицензированы и высоко оценены сообществом.' },
      { title: 'Отслеживание Рейса', desc: 'Мы мониторим ваш рейс. При задержке водитель корректирует автоматически.' },
      { title: 'Поддержка 24/7', desc: 'Наша команда доступна круглосуточно для любых вопросов.' },
    ],
    ctaTitle: 'Готовы Начать?',
    ctaSub: 'Скачайте приложение и забронируйте первую поездку сегодня.',
    ctaBtn: 'Скачать Приложение',
  },
};

const iconMap = {
  smartphone: <Smartphone className="w-8 h-8 text-[#2ecc71]" />,
  search: <Search className="w-8 h-8 text-[#2ecc71]" />,
  mappin: <MapPin className="w-8 h-8 text-[#2ecc71]" />,
  check: <CheckCircle className="w-8 h-8 text-[#2ecc71]" />,
};

const BecomeClient = () => {
  const { language } = useLanguage();
  const c = content[language] || content.en;

  return (
    <div className="min-h-screen flex flex-col" data-testid="become-client-page">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://zont.cab/become-client" />
      <Header />

      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="client-h1">{c.heroTitle}</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">{c.heroSub}</p>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {c.steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#2ecc71]/10 flex items-center justify-center mx-auto mb-4">
                  {iconMap[step.icon]}
                </div>
                <div className="text-2xl font-bold text-[#2ecc71] mb-2">{i + 1}</div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h2>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{c.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {c.whyPoints.map((p, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
                <CheckCircle className="w-6 h-6 text-[#2ecc71] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-gray-600 text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{c.ctaTitle}</h2>
          <p className="text-lg mb-8">{c.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://apps.apple.com/am/app/zont-cab/id1468482270" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white text-[#2ecc71] font-bold rounded-lg hover:bg-gray-100 transition-colors" data-testid="cta-app">
              {c.ctaBtn}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeClient;
