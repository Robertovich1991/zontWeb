import React from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import {
  VEHICLES,
  VEHICLE_SLUGS,
  VEHICLE_COPY,
  DISPOSAL_BASE_PATH,
  UI,
  DURATIONS,
} from './disposalData';
import { Clock, Users, Briefcase, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const SITE = 'https://zont.cab';

// Find vehicle by its slug (in any language).
const findVehicleBySlug = (slug) => {
  for (const v of VEHICLES) {
    const slugs = VEHICLE_SLUGS[v.id];
    if (Object.values(slugs).includes(slug)) return v;
  }
  return null;
};

const DisposalVehicle = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const lang = ['en', 'fr', 'ru', 'hy'].includes(language) ? language : 'en';
  const ui = UI[lang];

  const vehicle = findVehicleBySlug(slug);
  if (!vehicle) return <Navigate to={DISPOSAL_BASE_PATH[lang]} replace />;

  const copy = VEHICLE_COPY[vehicle.id][lang] || VEHICLE_COPY[vehicle.id].en;
  const canonical = `${SITE}${DISPOSAL_BASE_PATH[lang]}/${VEHICLE_SLUGS[vehicle.id][lang]}`;
  const hreflang = Object.entries(DISPOSAL_BASE_PATH).map(([l, p]) => ({
    lang: l,
    href: `${SITE}${p}/${VEHICLE_SLUGS[vehicle.id][l]}`,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.name[lang]} — ${ui.pageTitle}`,
    description: copy.hero,
    image: `${SITE}${vehicle.image}`,
    brand: { '@type': 'Brand', name: vehicle.id.startsWith('mercedes') ? 'Mercedes-Benz' : 'Renault' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      offerCount: 3,
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '412' },
  };

  // Related (other 3 vehicles)
  const related = VEHICLES.filter((v) => v.id !== vehicle.id);

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white">
      <SEO
        title={`${copy.h1} | Zont.cab`}
        description={copy.hero}
        canonical={canonical}
        hreflang={hreflang}
        ogType="product"
        ogImage={`${SITE}${vehicle.image}`}
        jsonLd={jsonLd}
      />

      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={vehicle.image}
              alt={vehicle.name[lang]}
              className="w-full h-full object-cover"
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14] via-[#0a0e14]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-transparent to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 min-h-[60vh] flex flex-col justify-end">
            <Link
              to={DISPOSAL_BASE_PATH[lang]}
              data-testid="vehicle-back-link"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#c8a951] mb-6 transition-colors"
            >
              <ChevronLeft size={16} /> {ui.backToMainLink}
            </Link>

            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.3em] text-[#c8a951] font-medium">
                  {vehicle.badge[lang]}
                </span>
                <span className="w-8 h-px bg-[#c8a951]" />
                <span className="text-xs uppercase tracking-wider text-gray-400">{ui.pageTitle.split('—')[0].trim()}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-6">
                {copy.h1}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                {copy.hero}
              </p>
              <div className="flex items-center gap-6 mt-8 text-sm">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Users size={16} className="text-[#c8a951]" />
                  {vehicle.pax} {ui.passengers}
                </span>
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Briefcase size={16} className="text-[#c8a951]" />
                  {vehicle.luggage} {ui.luggage}
                </span>
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Star size={16} className="text-[#c8a951] fill-[#c8a951]" />
                  4.9/5
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing strip */}
        <section className="border-y border-white/5 bg-[#11161f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-1">
                <h2 className="text-xs uppercase tracking-[0.3em] text-[#c8a951] font-medium mb-1">
                  {ui.durations}
                </h2>
                <p className="text-sm text-gray-400">{ui.bookThisVehicle}</p>
              </div>
              {DURATIONS.map((d) => (
                <div
                  key={d}
                  data-testid={`vehicle-pricing-${d}`}
                  className="bg-[#0a0e14] border border-white/5 rounded-lg p-5 text-center hover:border-[#c8a951]/40 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock size={14} className="text-[#c8a951]" />
                    <span className="text-xs uppercase tracking-wider text-gray-400">
                      {d === '4h' ? ui.duration4h : d === '8h' ? ui.duration8h : ui.duration12h}
                    </span>
                  </div>
                  <div className="text-2xl font-light text-white">
                    {vehicle.pricing[d] != null ? `${vehicle.pricing[d]}€` : ui.pricingTBD}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                data-testid="vehicle-cta-book-now"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#c8a951] hover:bg-[#d4b85c] text-[#0a0e14] font-semibold uppercase tracking-wider text-sm transition-all"
              >
                {ui.bookNow}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Long-form SEO copy */}
        <section className="py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <article className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-[17px]">{copy.p1}</p>
            </article>
            <article className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-[17px]">{copy.p2}</p>
            </article>
            <article className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-[17px]">{copy.p3}</p>
            </article>
          </div>
        </section>

        {/* Included */}
        <section className="border-t border-white/5 bg-[#0d1219] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-light mb-10 tracking-tight">
              {ui.whatsIncluded}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {[ui.inc1, ui.inc2, ui.inc3, ui.inc4, ui.inc5, ui.inc6].map((inc, i) => (
                <div key={i} className="flex items-start gap-3 text-base text-gray-300">
                  <Check size={18} className="text-[#c8a951] flex-shrink-0 mt-1" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle-specific FAQ */}
        <section className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-8">FAQ — {vehicle.name[lang]}</h2>
            <div className="space-y-3">
              {copy.faq.map((f, i) => (
                <details
                  key={i}
                  data-testid={`vehicle-faq-${i}`}
                  className="group bg-[#11161f] border border-white/5 rounded-lg p-5 cursor-pointer hover:border-[#c8a951]/30 transition-colors"
                >
                  <summary className="flex items-center justify-between gap-4 list-none text-base font-medium">
                    {f.q}
                    <ChevronRight className="text-[#c8a951] group-open:rotate-90 transition-transform flex-shrink-0" size={18} />
                  </summary>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related vehicles */}
        <section className="border-t border-white/5 bg-[#0d1219] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-10">{ui.backToMainTitle}</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((v) => {
                const url = `${DISPOSAL_BASE_PATH[lang]}/${VEHICLE_SLUGS[v.id][lang]}`;
                return (
                  <Link
                    key={v.id}
                    to={url}
                    data-testid={`related-vehicle-${v.id}`}
                    className="group block bg-[#11161f] border border-white/5 rounded-lg overflow-hidden hover:border-[#c8a951]/40 transition-colors"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={v.image}
                        alt={v.name[lang]}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#c8a951] mb-2">{v.badge[lang]}</div>
                      <h3 className="text-lg font-light tracking-tight">{v.name[lang]}</h3>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        <span>{v.pax} {ui.passengers}</span>
                        <span className="flex items-center gap-1 text-[#c8a951]">{ui.discoverVehicle} <ChevronRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DisposalVehicle;
