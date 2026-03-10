import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MapPin, Plane, ArrowRight } from 'lucide-react';
import { citiesData, countriesList } from '@/data/cities';

const translations = {
  en: {
    heroTitle: 'Airport Transfers Across Europe',
    heroSubtitle: 'Premium private driver service in 120+ cities. Book your airport transfer with fixed prices and professional drivers.',
    stats1: '120+', stats1Label: 'Cities',
    stats2: '40+', stats2Label: 'Countries',
    stats3: '24/7', stats3Label: 'Service',
    browseTitle: 'Choose Your Destination',
    viewCity: 'Book Transfer',
    ctaTitle: 'Ready to Book?',
    ctaText: 'Choose your city above or download the Zont app for instant booking.',
    downloadIos: 'Download for iOS',
    downloadAndroid: 'Download for Android',
    airports: 'Airports',
    fromPrice: 'From',
  },
  fr: {
    heroTitle: 'Transferts Aeroport en Europe',
    heroSubtitle: 'Service de chauffeur prive premium dans plus de 120 villes. Reservez votre transfert aeroport a prix fixes avec des chauffeurs professionnels.',
    stats1: '120+', stats1Label: 'Villes',
    stats2: '40+', stats2Label: 'Pays',
    stats3: '24/7', stats3Label: 'Service',
    browseTitle: 'Choisissez Votre Destination',
    viewCity: 'Reserver un Transfert',
    ctaTitle: 'Pret a Reserver ?',
    ctaText: 'Choisissez votre ville ci-dessus ou telechargez l\'appli Zont pour une reservation instantanee.',
    downloadIos: 'Telecharger pour iOS',
    downloadAndroid: 'Telecharger pour Android',
    airports: 'Aeroports',
    fromPrice: 'A partir de',
  },
  ru: {
    heroTitle: 'Трансферы из Аэропортов по Европе',
    heroSubtitle: 'Премиум-сервис частного водителя в 120+ городах. Забронируйте трансфер по фиксированным ценам.',
    stats1: '120+', stats1Label: 'Городов',
    stats2: '40+', stats2Label: 'Стран',
    stats3: '24/7', stats3Label: 'Сервис',
    browseTitle: 'Выберите Направление',
    viewCity: 'Забронировать Трансфер',
    ctaTitle: 'Готовы Забронировать?',
    ctaText: 'Выберите город выше или скачайте приложение Zont.',
    downloadIos: 'Скачать для iOS',
    downloadAndroid: 'Скачать для Android',
    airports: 'Аэропорты',
    fromPrice: 'От',
  },
};

const countryFlags = {
  France: 'FR', Monaco: 'MC', Germany: 'DE', Italy: 'IT', Spain: 'ES', Armenia: 'AM',
};

const countryColors = {
  France: 'from-blue-600 to-blue-800',
  Monaco: 'from-red-600 to-red-800',
  Germany: 'from-yellow-600 to-yellow-800',
  Italy: 'from-green-600 to-green-800',
  Spain: 'from-orange-600 to-orange-800',
  Armenia: 'from-purple-600 to-purple-800',
};

const startingPrices = {
  paris: 65, cdg: 65, orly: 45, beauvais: 120, paristrainstation: 25,
  nice: 35, monaco: 65, cannes: 70, cotedazur: 45,
  berlin: 45, munich: 55, rome: 40, milan: 35, alicante: 30, barcelona: 39, yerevan: 15,
};

const Countries = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const getCityName = (cityId) => {
    const city = citiesData[cityId];
    if (!city) return cityId;
    if (language === 'fr') return city.nameFr;
    if (language === 'ru') return city.nameRu;
    return city.nameEn;
  };

  const getCityUrl = (cityId) => {
    const city = citiesData[cityId];
    if (!city) return '#';
    if (language === 'fr') return city.urlFr;
    if (language === 'ru') return city.urlRu;
    return city.urlEn;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="countries-page">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#1a2332] to-[#1f2937]">
        <div className="max-w-7xl mx-auto text-center">
          <Plane className="w-16 h-16 text-[#2ecc71] mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="countries-hero-title">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            {t.heroSubtitle}
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div><div className="text-3xl font-bold text-[#2ecc71]">{t.stats1}</div><div className="text-gray-400 text-sm">{t.stats1Label}</div></div>
            <div><div className="text-3xl font-bold text-[#2ecc71]">{t.stats2}</div><div className="text-gray-400 text-sm">{t.stats2Label}</div></div>
            <div><div className="text-3xl font-bold text-[#2ecc71]">{t.stats3}</div><div className="text-gray-400 text-sm">{t.stats3Label}</div></div>
          </div>
        </div>
      </section>

      {/* Cities by Country */}
      <section className="py-20 px-4 bg-[#0f1419]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16" data-testid="browse-title">
            {t.browseTitle}
          </h2>
          <div className="space-y-16">
            {countriesList.map((country) => (
              <div key={country.name} data-testid={`country-section-${country.name.toLowerCase()}`}>
                <div className="flex items-center mb-8">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${countryColors[country.name] || 'from-gray-600 to-gray-800'} flex items-center justify-center text-white font-bold text-sm mr-4`}>
                    {countryFlags[country.name] || ''}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{country.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {country.cities.map((cityId) => {
                    const city = citiesData[cityId];
                    if (!city) return null;
                    return (
                      <Link
                        key={cityId}
                        to={getCityUrl(cityId)}
                        className="group bg-[#1a2332] rounded-xl p-6 border border-gray-700 hover:border-[#2ecc71] transition-all hover:shadow-lg hover:shadow-[#2ecc71]/10"
                        data-testid={`city-card-${cityId}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-white group-hover:text-[#2ecc71] transition-colors">
                              {getCityName(cityId)}
                            </h4>
                            <div className="flex items-center text-gray-400 text-sm mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{city.airports.join(', ')}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#2ecc71] transition-colors mt-1" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{t.airports}: {city.airports.length}</span>
                          {startingPrices[cityId] && (
                            <span className="text-[#2ecc71] font-semibold">{t.fromPrice} {startingPrices[cityId]} &euro;</span>
                          )}
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

      {/* CTA */}
      <section className="py-20 px-4 bg-[#1a2332]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.ctaTitle}</h2>
          <p className="text-lg text-gray-300 mb-8">{t.ctaText}</p>
          <div className="flex justify-center space-x-4 flex-wrap gap-y-4">
            <a href="https://apps.apple.com/am/app/zont-cab/id1468482270" target="_blank" rel="noopener noreferrer"
              className="bg-[#2ecc71] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="download-ios-btn">
              {t.downloadIos}
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.zont.rider" target="_blank" rel="noopener noreferrer"
              className="bg-white text-[#1a2332] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors" data-testid="download-android-btn">
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
