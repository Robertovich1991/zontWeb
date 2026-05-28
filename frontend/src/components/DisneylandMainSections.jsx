import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Plane, ChevronDown, ChevronRight, ArrowRight, CreditCard, Car, Baby, Users, Shield, CheckCircle2 } from 'lucide-react';
import { disneyHotels, disneyRoutes, disneyPricesTable, disneyMainContent } from '@/data/disneylandData';

/**
 * SEO-rich content sections injected below the main CityTransferPage hero on /disneyland-paris-transfer
 * Contains: Popular routes, Prices table, Hotels grid (Official + Partner), Why book, FAQ
 */
const DisneylandMainSections = () => {
  const { language } = useLanguage();
  const t = disneyMainContent[language] || disneyMainContent.en;
  const [openFaq, setOpenFaq] = useState(null);

  const officialHotels = Object.values(disneyHotels).filter(h => h.category === 'official');
  const partnerHotels = Object.values(disneyHotels).filter(h => h.category === 'partner');
  const routes = Object.values(disneyRoutes);

  // Inject FAQ Schema for main page
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      {/* Inject FAQ schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── SEO INTRO TEXT ── */}
      <section className="py-12 sm:py-16 px-4 bg-[#1a2332]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t.seoTextH2}</h2>
          <div className="space-y-4 text-gray-300 text-base sm:text-lg leading-relaxed">
            <p>{t.seoText1}</p>
            <p>{t.seoText2}</p>
            <p>{t.seoText3}</p>
            <p>{t.seoText4}</p>
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ── */}
      <section className="py-12 sm:py-16 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">{t.popularRoutesH2}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map(r => (
              <Link
                key={r.slug}
                to={`/${r.slug}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ecc71]/40 rounded-xl p-5 transition-all"
                data-testid={`disney-route-${r.slug}`}
              >
                <div className="flex items-start mb-3">
                  <Plane className="w-5 h-5 text-[#2ecc71] mr-3 mt-1 flex-shrink-0" />
                  <h3 className="text-white font-semibold text-base">{r.h1.replace(' Transfer', '')}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{r.short}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#2ecc71] font-bold">From €{r.priceFrom}</span>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#2ecc71] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICES TABLE ── */}
      <section className="py-12 sm:py-16 px-4 bg-[#1a2332]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.pricesH2}</h2>
          <p className="text-gray-300 mb-8 text-base leading-relaxed">{t.pricesIntro}</p>

          <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
            <table className="w-full" data-testid="disney-prices-table">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-[#2ecc71] font-semibold py-4 px-5 text-sm uppercase tracking-wider">Route</th>
                  <th className="text-right text-[#2ecc71] font-semibold py-4 px-5 text-sm uppercase tracking-wider">Sedan</th>
                  <th className="text-right text-[#2ecc71] font-semibold py-4 px-5 text-sm uppercase tracking-wider">Van / Minivan</th>
                </tr>
              </thead>
              <tbody>
                {disneyPricesTable.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-5 text-white text-sm sm:text-base">{row.route}</td>
                    <td className="py-3 px-5 text-right text-gray-200 font-medium">from €{row.sedan}</td>
                    <td className="py-3 px-5 text-right text-gray-200 font-medium">from €{row.van}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-gray-400 text-sm leading-relaxed">{t.pricesNote}</p>
        </div>
      </section>

      {/* ── HOTELS GRID ── */}
      <section className="py-12 sm:py-16 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.hotelsH2}</h2>
          <p className="text-gray-300 mb-10 max-w-3xl text-base leading-relaxed">{t.hotelsIntro}</p>

          {/* Official Disney Hotels */}
          <h3 className="text-xl sm:text-2xl font-bold text-[#2ecc71] mb-5">{t.hotelsOfficial}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {officialHotels.map(h => (
              <Link
                key={h.slug}
                to={`/${h.slug}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ecc71]/40 rounded-xl overflow-hidden transition-all"
                data-testid={`disney-hotel-${h.slug}`}
              >
                <div className="aspect-video bg-gray-800 overflow-hidden">
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </div>
                <div className="p-5">
                  <h4 className="text-white font-semibold mb-2">{h.name}</h4>
                  <p className="text-gray-400 text-xs mb-2 flex items-start">
                    <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" /> {h.address}
                  </p>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{h.short}</p>
                  <span className="text-[#2ecc71] text-sm font-medium inline-flex items-center">
                    {t.viewTransferPage} <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Partner Hotels */}
          <h3 className="text-xl sm:text-2xl font-bold text-[#2ecc71] mb-5">{t.hotelsPartner}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerHotels.map(h => (
              <Link
                key={h.slug}
                to={`/${h.slug}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ecc71]/40 rounded-xl overflow-hidden transition-all"
                data-testid={`disney-hotel-${h.slug}`}
              >
                <div className="aspect-video bg-gray-800 overflow-hidden">
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                </div>
                <div className="p-5">
                  <h4 className="text-white font-semibold mb-2">{h.name}</h4>
                  <p className="text-gray-400 text-xs mb-2 flex items-start">
                    <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" /> {h.address}
                  </p>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{h.short}</p>
                  <span className="text-[#2ecc71] text-sm font-medium inline-flex items-center">
                    {t.viewTransferPage} <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BOOK ZONT.CAB ── */}
      <section className="py-12 sm:py-16 px-4 bg-[#1a2332]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">{t.whyBookH2}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.whyBookList.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start">
                <CheckCircle2 className="w-5 h-5 text-[#2ecc71] mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-200 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 sm:py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">{t.faqH2}</h2>
          <div className="space-y-3">
            {t.faq.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left text-white hover:bg-white/[0.03] transition-colors"
                  data-testid={`disney-faq-toggle-${i}`}
                >
                  <span className="font-medium pr-4">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default DisneylandMainSections;
