import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { VEHICLES, VEHICLE_SLUGS, DISPOSAL_BASE_PATH, UI, DURATIONS } from './disposalData';
import { matchPathToLanguage } from '@/utils/pageUrlMaps';
import { Clock, Users, Briefcase, Check, ChevronRight, Award, Sparkles } from 'lucide-react';

const SITE = 'https://zont.cab';

const VehicleCard = ({ vehicle, lang, ui }) => {
  const slug = VEHICLE_SLUGS[vehicle.id][lang];
  const base = DISPOSAL_BASE_PATH[lang];
  const url = `${base}/${slug}`;
  const tierBadge = vehicle.badge[lang];

  return (
    <Link
      to={url}
      data-testid={`disposal-vehicle-card-${vehicle.id}`}
      className="group block overflow-hidden rounded-2xl bg-[#11161f] border border-white/5 hover:border-[#c8a951]/60 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <img
          src={vehicle.image}
          alt={`${vehicle.name[lang]} — chauffeur prive Paris`}
          loading="lazy"
          width="800"
          height="500"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
          <Sparkles size={14} className="text-[#c8a951]" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#c8a951] font-semibold">{tierBadge}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-light tracking-tight text-white">{vehicle.name[lang]}</h3>
          <p className="text-sm text-gray-400 mt-1">{vehicle.tagline[lang]}</p>
        </div>

        <div className="flex items-center gap-5 text-sm text-gray-300">
          <span className="flex items-center gap-1.5"><Users size={15} className="text-[#c8a951]" />{vehicle.pax} {ui.passengers}</span>
          <span className="flex items-center gap-1.5"><Briefcase size={15} className="text-[#c8a951]" />{vehicle.luggage} {ui.luggage}</span>
        </div>

        {/* Durations grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
          {DURATIONS.map((d) => (
            <div key={d} className="text-center py-2 rounded bg-white/5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{d}</div>
              <div className="text-sm text-white font-medium mt-0.5">
                {vehicle.pricing[d] != null ? `${ui.pricingFrom} ${vehicle.pricing[d]}€` : ui.pricingTBD}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[#c8a951] text-sm font-medium uppercase tracking-wider">{ui.discoverVehicle}</span>
          <ChevronRight className="text-[#c8a951] group-hover:translate-x-1 transition-transform" size={20} />
        </div>
      </div>
    </Link>
  );
};

const DriverAtDisposal = () => {
  const { language: ctxLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Force language to match the URL the visitor opened (SEO-correct)
  const urlMatch = matchPathToLanguage(location.pathname);
  const lang = urlMatch?.language || (['en', 'fr', 'ru', 'hy'].includes(ctxLanguage) ? ctxLanguage : 'en');

  useEffect(() => {
    if (urlMatch?.language && urlMatch.language !== ctxLanguage) {
      changeLanguage(urlMatch.language);
    }
  }, [urlMatch?.language, ctxLanguage, changeLanguage]);

  const ui = UI[lang];

  const canonical = `${SITE}${DISPOSAL_BASE_PATH[lang]}`;
  const hreflang = Object.entries(DISPOSAL_BASE_PATH).map(([l, p]) => ({ lang: l, href: `${SITE}${p}` }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: ui.pageTitle,
    description: ui.pageSubtitle,
    provider: { '@type': 'Organization', name: 'Zont', url: SITE, telephone: '+33783777027' },
    areaServed: { '@type': 'City', name: 'Paris' },
    serviceType: 'Chauffeur service',
    offers: VEHICLES.map((v) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: `${v.name[lang]} — ${ui.pageTitle}` },
      availability: 'https://schema.org/InStock',
      priceCurrency: 'EUR',
    })),
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white">
      <SEO
        title={ui.pageTitle}
        description={ui.pageSubtitle}
        canonical={canonical}
        hreflang={hreflang}
        ogType="website"
        ogImage={`${SITE}/images/mercedes-classe-s-chauffeur-prive-paris.webp`}
        jsonLd={jsonLd}
      />

      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0a0e14]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('/images/mercedes-classe-s-chauffeur-prive-paris.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14]/85 via-[#0a0e14]/25 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Clock size={16} className="text-[#c8a951]" />
                <span className="text-xs uppercase tracking-[0.3em] text-[#c8a951] font-medium">
                  4h / 8h / 12h
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-6 tracking-tight drop-shadow-lg">
                {ui.pageTitle.split('—')[0].trim()}
                <span className="block text-[#c8a951] font-normal mt-2">
                  {ui.pageTitle.split('—')[1]?.trim()}
                </span>
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed max-w-2xl mb-8 drop-shadow">
                {ui.pageSubtitle}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#fleet"
                  data-testid="hero-discover-fleet-btn"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#c8a951] hover:bg-[#d4b85c] text-[#0a0e14] font-semibold uppercase tracking-wider text-sm transition-all"
                >
                  {ui.fleetTitle}
                  <ChevronRight size={18} />
                </a>
                <button
                  onClick={() => navigate('/')}
                  data-testid="hero-book-now-btn"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/50 hover:border-white bg-black/30 backdrop-blur-sm text-white font-medium uppercase tracking-wider text-sm transition-all"
                >
                  {ui.bookNow}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Included strip */}
        <section className="border-y border-white/5 bg-[#11161f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#c8a951] font-medium mb-6">
              {ui.whatsIncluded}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[ui.inc1, ui.inc2, ui.inc3, ui.inc4, ui.inc5, ui.inc6].map((inc, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-[#c8a951] flex-shrink-0 mt-0.5" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fleet */}
        <section id="fleet" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-[#c8a951]" />
                <span className="text-xs uppercase tracking-[0.3em] text-[#c8a951]">4 vehicles</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light leading-tight tracking-tight mb-4">
                {ui.fleetTitle}
              </h2>
              <p className="text-gray-400">{ui.fleetSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {VEHICLES.map((v) => (
                <VehicleCard key={v.id} vehicle={v} lang={lang} ui={ui} />
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="border-t border-white/5 bg-[#0d1219] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-12 max-w-2xl">
              {ui.useCasesTitle}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ui.useCases.map((c, i) => (
                <div key={i} className="p-6 bg-[#11161f] border border-white/5 rounded-lg hover:border-[#c8a951]/30 transition-colors">
                  <div className="text-[#c8a951] text-2xl font-light mb-3">0{i + 1}</div>
                  <h3 className="text-lg font-medium mb-2">{c.t}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 lg:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-10">{ui.faqTitle}</h2>
            <div className="space-y-4">
              {ui.faqs.map((f, i) => (
                <details
                  key={i}
                  data-testid={`disposal-faq-${i}`}
                  className="group bg-[#11161f] border border-white/5 rounded-lg p-6 cursor-pointer hover:border-[#c8a951]/30 transition-colors"
                >
                  <summary className="flex items-center justify-between gap-4 list-none text-base font-medium">
                    {f.q}
                    <ChevronRight className="text-[#c8a951] group-open:rotate-90 transition-transform flex-shrink-0" size={20} />
                  </summary>
                  <p className="mt-4 text-sm text-gray-400 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DriverAtDisposal;
