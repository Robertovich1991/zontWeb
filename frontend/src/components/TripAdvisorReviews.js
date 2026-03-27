import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Star, ExternalLink } from 'lucide-react';

const TRIPADVISOR_URL = {
  fr: 'https://www.tripadvisor.fr/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html',
  en: 'https://www.tripadvisor.com/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html',
  ru: 'https://www.tripadvisor.ru/Attraction_Review-g187147-d17154566-Reviews-ZONT_Cab-Paris_Ile_de_France.html',
};

const REVIEWS = [
  {
    name: 'kgcrouch',
    location: 'Santa Fe, USA',
    date: { fr: 'Fev. 2026', en: 'Feb 2026', ru: 'Фев 2026' },
    rating: 5,
    title: { fr: 'Service parfait !', en: 'Perfect service!', ru: 'Идеальный сервис!' },
    text: {
      fr: 'Notre chauffeur est arrive tot et notre voyage a Orly a ete parfait. Je recommande vivement. Tres belle voiture, beaucoup de place pour 4 adultes plus bagages.',
      en: 'Our driver arrived early and our trip to Orly was perfect. Highly recommend. Very nice car, plenty of room for 4 adults plus luggage.',
      ru: 'Водитель приехал рано, поездка в Орли была идеальной. Очень рекомендую.',
    },
  },
  {
    name: 'Kimberley H',
    location: '',
    date: { fr: 'Nov. 2025', en: 'Nov 2025', ru: 'Ноя 2025' },
    rating: 5,
    title: { fr: 'Impeccable', en: 'Flawless', ru: 'Безупречно' },
    text: {
      fr: "Nous avons eu de belles experiences avec les transferts. Les chauffeurs sont a l'heure, efficaces et connaissent les amenagements de l'aeroport. Ca diminue le stress, ca en vaut la peine.",
      en: 'We had great experiences with the transfers. Drivers are on time, efficient and know the airport layout. It reduces stress, totally worth it.',
      ru: 'Отличные впечатления от трансферов. Водители пунктуальны и знают аэропорт.',
    },
  },
  {
    name: 'Alonz W',
    location: '',
    date: { fr: 'Nov. 2025', en: 'Nov 2025', ru: 'Ноя 2025' },
    rating: 5,
    title: { fr: 'Bon transfert a CDG', en: 'Great CDG transfer', ru: 'Отличный трансфер CDG' },
    text: {
      fr: "Le chauffeur est venu a l'heure a notre hotel, a aide avec les bagages. Super experience. Recommande, arrive a temps et de bonne humeur.",
      en: 'Driver came on time to our hotel, helped with luggage. Great experience. Recommended, arrived on time and in a good mood.',
      ru: 'Водитель приехал вовремя, помог с багажом. Отличный опыт.',
    },
  },
  {
    name: 'WILLIAM H',
    location: '',
    date: { fr: 'Juin 2025', en: 'Jun 2025', ru: 'Июн 2025' },
    rating: 5,
    title: { fr: "Transfert aeroport a Paris", en: 'Airport transfer in Paris', ru: 'Трансфер из аэропорта' },
    text: {
      fr: "Ca ne pouvait pas etre mieux. Notre chauffeur Alex etait genial. Nous allons certainement utiliser ce service a nouveau. Il attendait a notre arrivee et etait un tres bon conducteur.",
      en: "Couldn't have been better. Our driver Alex was great. We will definitely use this service again. He was waiting at our arrival and was an excellent driver.",
      ru: 'Лучше быть не могло. Наш водитель Алекс был великолепен.',
    },
  },
  {
    name: 'BAWN',
    location: 'Hollywood, FL',
    date: { fr: 'Aout 2024', en: 'Aug 2024', ru: 'Авг 2024' },
    rating: 5,
    title: { fr: 'Merci Steve !', en: 'Thank you Steve!', ru: 'Спасибо Стив!' },
    text: {
      fr: "Apprecie la gentillesse et la patience de Steve. La circulation etait terrible mais il permettait de s'asseoir facilement et d'accueillir tout ce que Paris avait a offrir.",
      en: "Appreciated Steve's kindness and patience. Traffic was terrible but he made it easy to sit back and enjoy everything Paris had to offer.",
      ru: 'Оценил доброту и терпение Стива. Пробки были ужасные, но он все сделал комфортно.',
    },
  },
  {
    name: 'Aza Dil',
    location: '',
    date: { fr: 'Dec. 2023', en: 'Dec 2023', ru: 'Дек 2023' },
    rating: 5,
    title: { fr: 'Vehicule de luxe spacieux', en: 'Spacious luxury vehicle', ru: 'Просторный люкс автомобиль' },
    text: {
      fr: "Notre chauffeur nous attendait malgre notre long retard a la douane. La voiture etait si confortable, propre et spacieuse. Recommande vivement pour les familles avec bagages !",
      en: 'Our driver was waiting despite our long delay at customs. The car was so comfortable, clean and spacious. Highly recommended for families with luggage!',
      ru: 'Водитель ждал нас несмотря на задержку на таможне. Машина была очень комфортной.',
    },
  },
];

const Stars = ({ count }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'fill-[#00aa6c] text-[#00aa6c]' : 'text-gray-600'}`} />
    ))}
  </div>
);

const TripAdvisorReviews = () => {
  const { language } = useLanguage();
  const lang = ['fr', 'en', 'ru'].includes(language) ? language : 'en';
  const url = TRIPADVISOR_URL[lang] || TRIPADVISOR_URL.en;

  return (
    <div className="w-full max-w-6xl mx-auto" data-testid="tripadvisor-reviews">
      {/* Header: TripAdvisor branding + rating */}
      <div className="flex flex-col items-center mb-10">
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-3 group">
          <img
            src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg"
            alt="TripAdvisor"
            className="h-8 brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        </a>
        <div className="flex items-center gap-2 mb-1">
          <Stars count={5} />
          <span className="text-white font-bold text-lg">4.5/5</span>
        </div>
        <p className="text-gray-400 text-sm">
          {lang === 'fr' ? 'Base sur 29 avis verifies' : lang === 'ru' ? 'На основе 29 проверенных отзывов' : 'Based on 29 verified reviews'}
        </p>
      </div>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        {REVIEWS.map((r, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors"
            data-testid={`review-card-${i}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm">{r.name}</p>
                {r.location && <p className="text-gray-500 text-xs">{r.location}</p>}
              </div>
              <span className="text-gray-500 text-xs whitespace-nowrap">{r.date[lang] || r.date.en}</span>
            </div>
            <Stars count={r.rating} />
            <p className="text-[#2ecc71] font-semibold text-sm mt-2 mb-1.5">{r.title[lang] || r.title.en}</p>
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{r.text[lang] || r.text.en}</p>
          </div>
        ))}
      </div>

      {/* CTA: Read all reviews */}
      <div className="text-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#2ecc71] hover:text-[#27ae60] font-semibold text-sm transition-colors"
          data-testid="tripadvisor-read-all"
        >
          {lang === 'fr' ? 'Voir les 29 avis sur TripAdvisor' : lang === 'ru' ? 'Все 29 отзывов на TripAdvisor' : 'Read all 29 reviews on TripAdvisor'}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default TripAdvisorReviews;
