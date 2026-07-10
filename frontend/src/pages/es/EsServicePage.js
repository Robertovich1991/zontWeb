import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronRight, CheckCircle, Phone, MessageCircle, MapPin } from 'lucide-react';
import { getRelatedRoutes, RELATED_TITLES, resolvePageIdFromUrl } from '@/data/relatedRoutes';

/**
 * Reusable Spanish service page (minivan, conductor privado, silla infantil, hoteles).
 * Single component keeps SEO consistent across new pages while letting each route
 * pass its own copy + meta + keywords + JSON-LD service name.
 */
const EsServicePage = ({
  url,
  title,
  description,
  keywords,
  h1,
  intro,
  paragraphs = [],
  bullets = [],
  heroImage,
  serviceName,
  faq = [],
  relatedLinks = [],
}) => {
  const { changeLanguage } = useLanguage();

  useEffect(() => {
    // Force Spanish on these /es/* routes so the rest of the UI (Header, Footer) renders in ES.
    changeLanguage('es');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canonical = `https://www.zont.cab${url}`;
  const whatsAppLink = 'https://wa.me/33685432200?text=' + encodeURIComponent('Hola, me gustaria informacion sobre ' + (serviceName || title));

  // JSON-LD Service + FAQPage schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName || h1,
    description,
    provider: { '@type': 'Organization', name: 'ZONT', url: 'https://www.zont.cab' },
    areaServed: { '@type': 'City', name: 'Paris' },
    url: canonical,
  };
  const faqJsonLd = faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(q => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  } : null;

  // hreflang alternates — Spanish-only page so alternates point to the ES URL + canonical x-default to EN home
  const hreflang = [
    { lang: 'es', href: canonical },
    { lang: 'x-default', href: 'https://www.zont.cab/' },
  ];

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        ogImage={heroImage || '/images/hero.webp'}
        hreflang={hreflang}
      />
      {/* Spanish meta keywords kept inline so each new ES page targets its own keywords without bloating the central SEO component */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <Header />

      <main className="bg-white min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0b1120] via-[#1a2540] to-[#0b1120] text-white py-14 md:py-20">
          <div className="max-w-5xl mx-auto px-5">
            <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
              <Link to="/es" className="hover:text-white">Inicio</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{h1}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" data-testid="es-page-h1">{h1}</h1>
            <p className="text-gray-300 text-lg mt-4 max-w-3xl">{intro}</p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link to="/es" className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-7 py-3.5 rounded-xl font-bold inline-flex items-center gap-2" data-testid="es-cta-book">
                Reservar un traslado <ChevronRight className="w-4 h-4" />
              </Link>
              <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white px-7 py-3.5 rounded-xl font-bold inline-flex items-center gap-2 backdrop-blur" data-testid="es-cta-whatsapp">
                <MessageCircle className="w-5 h-5" /> Contactar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Hero image */}
        {heroImage && (
          <div className="max-w-5xl mx-auto px-5 -mt-10 mb-10 relative z-10">
            <img src={heroImage} alt={h1} className="w-full h-72 md:h-96 object-cover rounded-3xl shadow-2xl" />
          </div>
        )}

        {/* Content body */}
        <article className="max-w-3xl mx-auto px-5 py-10">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 text-lg leading-relaxed mb-5">{p}</p>
          ))}

          {bullets.length > 0 && (
            <ul className="my-6 space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#2ecc71] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-base">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* FAQ */}
          {faq.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
              <div className="space-y-4">
                {faq.map((q, i) => (
                  <details key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer text-base list-none flex justify-between items-center">
                      {q.q}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-gray-600 mt-3 leading-relaxed">{q.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Mid-page CTA */}
          <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/30 rounded-3xl p-6 md:p-8 my-10 text-center">
            <p className="text-gray-700 mb-4">\u00bfListo para reservar tu traslado privado en Paris?</p>
            <Link to="/es" className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2">
              Reservar ahora <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related — curated (author-picked) block */}
          {relatedLinks.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tambien te puede interesar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedLinks.map((r, i) => (
                  <Link key={i} to={r.url} className="border border-gray-200 hover:border-[#2ecc71] rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors" data-testid={`es-related-${i}`}>
                    <span className="text-gray-900 font-medium">{r.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#2ecc71]" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related — registry-driven cross-linking (auto-detected pageId, 7 Spanish links) */}
          {(() => {
            const pageId = resolvePageIdFromUrl(url);
            const routes = pageId ? getRelatedRoutes(pageId, 'es', 8) : [];
            if (routes.length === 0) return null;
            return (
              <section className="mt-10" aria-label="Related transfer routes">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{RELATED_TITLES.es}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {routes.map((r) => (
                    <a
                      key={r.pageId}
                      href={r.url}
                      hrefLang="es"
                      className="group flex items-center gap-2 bg-white hover:bg-[#2ecc71]/5 border border-gray-200 hover:border-[#2ecc71]/50 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                      data-testid={`related-route-${r.pageId}`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#2ecc71] shrink-0" aria-hidden="true" />
                      <span className="truncate">{r.label}</span>
                    </a>
                  ))}
                </div>
              </section>
            );
          })()}
        </article>

        {/* Bottom call block */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Reserva tu traslado en pocos segundos</h2>
            <p className="text-gray-600 mb-5">Precio fijo, conductor profesional y servicio 24/7 en Paris y region parisina.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/es" className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-7 py-3.5 rounded-xl font-bold inline-flex items-center gap-2">
                Reservar un traslado
              </Link>
              <a href="tel:+33685432200" className="bg-white border border-gray-300 hover:border-[#2ecc71] text-gray-900 px-7 py-3.5 rounded-xl font-bold inline-flex items-center gap-2">
                <Phone className="w-4 h-4" /> +33 6 85 43 22 00
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default EsServicePage;
