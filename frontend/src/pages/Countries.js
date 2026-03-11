import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { MapPin, Plane, ArrowRight, Star, Search, Shield, Clock, CreditCard } from 'lucide-react';
import { citiesData, countriesList } from '@/data/cities';

const cityImages = {
  paris: 'https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?w=600&q=75&auto=format',
  cdg: 'https://images.unsplash.com/photo-1689772640958-7c186dbdfe26?w=600&q=75&auto=format',
  orly: 'https://images.unsplash.com/photo-1689772640958-7c186dbdfe26?w=600&q=75&auto=format',
  beauvais: 'https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?w=600&q=75&auto=format',
  paristrainstation: 'https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?w=600&q=75&auto=format',
  nice: 'https://images.unsplash.com/photo-1584464743211-134b56a08510?w=600&q=75&auto=format',
  cannes: 'https://images.unsplash.com/photo-1594041966249-ebee737fb001?w=600&q=75&auto=format',
  cotedazur: 'https://images.unsplash.com/photo-1584464743211-134b56a08510?w=600&q=75&auto=format',
  monaco: 'https://images.unsplash.com/photo-1658988856200-056dfdb42025?w=600&q=75&auto=format',
  berlin: 'https://images.unsplash.com/photo-1659413084271-ca1345764e15?w=600&q=75&auto=format',
  munich: 'https://images.unsplash.com/photo-1659413084271-ca1345764e15?w=600&q=75&auto=format',
  rome: 'https://images.unsplash.com/photo-1668882565110-317edcfa0ee0?w=600&q=75&auto=format',
  milan: 'https://images.unsplash.com/photo-1668882565110-317edcfa0ee0?w=600&q=75&auto=format',
  alicante: 'https://images.unsplash.com/photo-1660855562147-2f2eab48c0c7?w=600&q=75&auto=format',
  barcelona: 'https://images.unsplash.com/photo-1660855562147-2f2eab48c0c7?w=600&q=75&auto=format',
  yerevan: 'https://images.unsplash.com/photo-1771444617885-cf21bd096091?w=600&q=75&auto=format',
};

const defaultImg = 'https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=600&q=75&auto=format';

const translations = {
  en: {
    seoTitle: 'Airport Transfers in Europe - All Destinations | Zont',
    seoDesc: 'Premium private airport transfer in 120+ European cities. Fixed prices, flight tracking. Book online.',
    heroTitle: 'Airport Transfers', heroAccent: 'Across Europe',
    heroSub: 'Premium private driver service in 120+ cities. Book your airport transfer with fixed prices and professional drivers.',
    searchPh: 'Search a city or airport...',
    stats: [{ v: '120+', l: 'Cities' }, { v: '40+', l: 'Countries' }, { v: '24/7', l: 'Service' }, { v: '4.9/5', l: 'Rating' }],
    browseTitle: 'Choose Your Destination',
    viewCity: 'Book Transfer', from: 'From', airports: 'Airports',
    noResults: 'No destinations found for',
    trustTitle: 'Why Choose Zont?',
    t1: 'Fixed Prices', t1d: 'No hidden fees, price confirmed at booking',
    t2: 'Flight Tracking', t2d: 'Real-time monitoring, free waiting',
    t3: 'Premium Cars', t3d: 'Mercedes, BMW, less than 3 years old',
    t4: 'Secure Payment', t4d: 'Visa, Mastercard, PayPal, Apple Pay',
    ctaTitle: 'Ready to Book?', ctaText: 'Choose your city above or contact us for a custom quote.',
    downloadIos: 'Download for iOS', downloadAndroid: 'Download for Android',
  },
  fr: {
    seoTitle: 'Transferts Aeroport en Europe - Toutes les Destinations | Zont',
    seoDesc: 'Transfert aeroport prive premium dans 120+ villes europeennes. Prix fixes, suivi de vol. Reservez en ligne.',
    heroTitle: 'Transferts Aeroport', heroAccent: 'Partout en Europe',
    heroSub: 'Service de chauffeur prive premium dans plus de 120 villes. Reservez votre transfert aeroport a prix fixes.',
    searchPh: 'Rechercher une ville ou un aeroport...',
    stats: [{ v: '120+', l: 'Villes' }, { v: '40+', l: 'Pays' }, { v: '24/7', l: 'Service' }, { v: '4.9/5', l: 'Note' }],
    browseTitle: 'Choisissez Votre Destination',
    viewCity: 'Reserver un Transfert', from: 'A partir de', airports: 'Aeroports',
    noResults: 'Aucune destination trouvee pour',
    trustTitle: 'Pourquoi Choisir Zont ?',
    t1: 'Prix Fixes', t1d: 'Pas de frais caches, prix confirme a la reservation',
    t2: 'Suivi des Vols', t2d: 'Surveillance en temps reel, attente gratuite',
    t3: 'Vehicules Premium', t3d: 'Mercedes, BMW, moins de 3 ans',
    t4: 'Paiement Securise', t4d: 'Visa, Mastercard, PayPal, Apple Pay',
    ctaTitle: 'Pret a Reserver ?', ctaText: 'Choisissez votre ville ci-dessus ou contactez-nous.',
    downloadIos: 'Telecharger pour iOS', downloadAndroid: 'Telecharger pour Android',
  },
  ru: {
    seoTitle: 'Трансферы из Аэропортов Европы - Все Направления | Zont',
    seoDesc: 'Премиум трансфер из аэропорта в 120+ городах Европы. Фиксированные цены.',
    heroTitle: 'Трансферы из Аэропортов', heroAccent: 'По Всей Европе',
    heroSub: 'Премиум-сервис частного водителя в 120+ городах. Забронируйте трансфер по фиксированным ценам.',
    searchPh: 'Поиск города или аэропорта...',
    stats: [{ v: '120+', l: 'Городов' }, { v: '40+', l: 'Стран' }, { v: '24/7', l: 'Сервис' }, { v: '4.9/5', l: 'Рейтинг' }],
    browseTitle: 'Выберите Направление',
    viewCity: 'Забронировать', from: 'От', airports: 'Аэропорты',
    noResults: 'Направлений не найдено для',
    trustTitle: 'Почему Выбирают Zont?',
    t1: 'Фиксированные Цены', t1d: 'Без скрытых платежей',
    t2: 'Отслеживание Рейсов', t2d: 'Мониторинг в реальном времени',
    t3: 'Премиум Авто', t3d: 'Mercedes, BMW, не старше 3 лет',
    t4: 'Безопасная Оплата', t4d: 'Visa, Mastercard, PayPal, Apple Pay',
    ctaTitle: 'Готовы Забронировать?', ctaText: 'Выберите город или свяжитесь с нами.',
    downloadIos: 'Скачать для iOS', downloadAndroid: 'Скачать для Android',
  },
};

const startingPrices = {
  paris: 65, cdg: 65, orly: 45, beauvais: 120, paristrainstation: 25,
  nice: 35, monaco: 65, cannes: 70, cotedazur: 45,
  berlin: 45, munich: 55, rome: 40, milan: 35, alicante: 30, barcelona: 39, yerevan: 15,
};

const countryFlags = { France: '\ud83c\uddeb\ud83c\uddf7', Monaco: '\ud83c\uddf2\ud83c\udde8', Germany: '\ud83c\udde9\ud83c\uddea', Italy: '\ud83c\uddee\ud83c\uddf9', Spain: '\ud83c\uddea\ud83c\uddf8', Armenia: '\ud83c\udde6\ud83c\uddf2' };

const Countries = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [search, setSearch] = useState('');

  const getCityName = (cityId) => {
    const city = citiesData[cityId];
    if (!city) return cityId;
    return language === 'fr' ? city.nameFr : language === 'ru' ? city.nameRu : city.nameEn;
  };

  const getCityUrl = (cityId) => {
    const city = citiesData[cityId];
    if (!city) return '#';
    return language === 'fr' ? city.urlFr : language === 'ru' ? city.urlRu : city.urlEn;
  };

  const filteredCountries = countriesList.map(country => ({
    ...country,
    cities: country.cities.filter(cityId => {
      if (!search) return true;
      const city = citiesData[cityId];
      if (!city) return false;
      const s = search.toLowerCase();
      return city.nameEn.toLowerCase().includes(s) || city.nameFr.toLowerCase().includes(s) ||
        city.nameRu.toLowerCase().includes(s) || city.airports.some(a => a.toLowerCase().includes(s)) ||
        country.name.toLowerCase().includes(s);
    })
  })).filter(c => c.cities.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="countries-page">
      <SEO title={t.seoTitle} description={t.seoDesc} />
      <Header />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1762983166320-8e301ab178f7?w=1200&q=80&auto=format" alt="European cities aerial view" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/90 via-[#1a2332]/80 to-[#1a2332]"></div>
        </div>
        <div className="relative z-10 px-4 pt-10 pb-12 md:pt-16 md:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#2ecc71]/20 text-[#2ecc71] px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center">
                <Star className="w-4 h-4 fill-current mr-1.5" aria-hidden="true" />4.9/5 - 10,000+ {language === 'fr' ? 'avis' : language === 'ru' ? 'отзывов' : 'reviews'}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2" data-testid="countries-hero-title">{t.heroTitle}</h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2ecc71] mb-4">{t.heroAccent}</h2>
            <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">{t.heroSub}</p>

            {/* Search */}
            <div className="max-w-lg mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPh}
                  className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl text-base shadow-xl focus:ring-2 focus:ring-[#2ecc71] border-0" data-testid="city-search-input" aria-label={t.searchPh} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
              {t.stats.map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-[#2ecc71]">{s.v}</div>
                  <div className="text-[10px] text-gray-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities by Country */}
      <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12" data-testid="browse-title">{t.browseTitle}</h2>

          {filteredCountries.length === 0 && (
            <p className="text-gray-400 text-center text-lg py-12">{t.noResults} "{search}"</p>
          )}

          <div className="space-y-14">
            {filteredCountries.map((country) => (
              <div key={country.name} data-testid={`country-section-${country.name.toLowerCase()}`}>
                <div className="flex items-center mb-6">
                  <span className="text-3xl mr-3" aria-hidden="true">{countryFlags[country.name] || ''}</span>
                  <h3 className="text-2xl font-bold text-white">{country.name}</h3>
                  <div className="flex-1 h-px bg-gray-700 ml-4"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {country.cities.map((cityId) => {
                    const city = citiesData[cityId];
                    if (!city) return null;
                    return (
                      <Link key={cityId} to={getCityUrl(cityId)}
                        className="group bg-[#1a2332] rounded-xl overflow-hidden border border-gray-700 hover:border-[#2ecc71] transition-all hover:shadow-lg hover:shadow-[#2ecc71]/10"
                        data-testid={`city-card-${cityId}`}>
                        <div className="h-32 sm:h-36 overflow-hidden relative">
                          <img src={cityImages[cityId] || defaultImg} alt={getCityName(cityId)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] via-transparent to-transparent"></div>
                          {startingPrices[cityId] && (
                            <div className="absolute bottom-2 right-2 bg-[#2ecc71] text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                              {t.from} {startingPrices[cityId]}&euro;
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="text-base font-bold text-white group-hover:text-[#2ecc71] transition-colors mb-1">{getCityName(cityId)}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-400 text-xs">
                              <MapPin className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                              <span>{city.airports.slice(0, 2).join(', ')}{city.airports.length > 2 ? '...' : ''}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#2ecc71] transition-colors" aria-hidden="true" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 md:py-16 px-4 bg-[#1a2332]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{t.trustTitle}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <CreditCard className="w-8 h-8 text-[#2ecc71]" aria-hidden="true" />, t: t.t1, d: t.t1d },
              { icon: <Plane className="w-8 h-8 text-[#2ecc71]" aria-hidden="true" />, t: t.t2, d: t.t2d },
              { icon: <Shield className="w-8 h-8 text-[#2ecc71]" aria-hidden="true" />, t: t.t3, d: t.t3d },
              { icon: <Clock className="w-8 h-8 text-[#2ecc71]" aria-hidden="true" />, t: t.t4, d: t.t4d },
            ].map((b, i) => (
              <div key={i} className="bg-[#0f1419] rounded-xl p-4 md:p-5 border border-gray-700 text-center">
                <div className="flex justify-center mb-3">{b.icon}</div>
                <h3 className="text-white font-bold text-sm md:text-base mb-1">{b.t}</h3>
                <p className="text-gray-400 text-xs">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
          <p className="text-white/80 mb-8">{t.ctaText}</p>
          <div className="flex justify-center space-x-4 flex-wrap gap-y-3">
            <a href="https://apps.apple.com/am/app/zont-cab/id1468482270" target="_blank" rel="noopener noreferrer"
              className="bg-white text-[#2ecc71] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg" data-testid="download-ios-btn">
              {t.downloadIos}
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.zont.rider" target="_blank" rel="noopener noreferrer"
              className="bg-white/20 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors border border-white/30" data-testid="download-android-btn">
              {t.downloadAndroid}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Countries;
