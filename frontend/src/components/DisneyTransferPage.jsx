import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { MapPin, Clock, Car, Users, Baby, Plane, Shield, CreditCard, CheckCircle2, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getHotelBySlug, getRouteBySlug, disneyHotels } from '@/data/disneylandData';

/**
 * Reusable SEO page for Disneyland Paris route & hotel transfers.
 * Pass either `hotelSlug` or `routeSlug` to render the right content.
 */
const DisneyTransferPage = ({ hotelSlug = null, routeSlug = null }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  const entity = useMemo(() => {
    if (hotelSlug) return { kind: 'hotel', ...getHotelBySlug(hotelSlug) };
    if (routeSlug) return { kind: 'route', ...getRouteBySlug(routeSlug) };
    return null;
  }, [hotelSlug, routeSlug]);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!entity || !entity.slug) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]">
        <Header />
        <main className="flex-1 pt-24 px-4 max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Page not found</h1>
          <Link to="/disneyland-paris-transfer" className="text-[#2ecc71] hover:underline">← Back to Disneyland Paris Transfer</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isHotel = entity.kind === 'hotel';
  const displayName = isHotel ? entity.name : entity.h1;
  const heroTitle = isHotel ? `Private Transfer to ${entity.name}` : entity.h1;
  const heroSubtitle = isHotel
    ? `Book a private transfer from Paris airports, train stations or your hotel to ${entity.name} near Disneyland Paris. Fixed price, professional driver and comfortable vehicles.`
    : entity.subtitle;

  // Pre-fill booking destination
  const goToBooking = () => {
    const params = new URLSearchParams();
    if (isHotel) {
      params.set('dropoff', entity.name);
    } else {
      // Route page → use the human label pieces
      params.set('pickup', entity.pickupHint || '');
      params.set('dropoff', entity.dropoffHint || 'Disneyland Paris');
    }
    navigate(`/?${params.toString()}#booking`);
  };

  // FAQ per hotel (generic but mentions the hotel name)
  const hotelFaq = isHotel ? [
    { q: `How much is a transfer to ${entity.name}?`, a: `The price depends on the pickup location, vehicle category, number of passengers and luggage. The final fixed price is shown before booking.` },
    { q: `Can I book a transfer from CDG Airport to ${entity.name}?`, a: `Yes, ZONT.CAB provides private transfers from Charles de Gaulle Airport to ${entity.name}.` },
    { q: `Can I book a transfer from Orly Airport to ${entity.name}?`, a: `Yes, you can book a private ride from Orly Airport directly to ${entity.name}.` },
    { q: 'Do you provide child seats?', a: 'Child seats are available on request. Please add the request during booking.' },
    { q: 'Can the driver meet us at the airport terminal?', a: 'Yes, the driver can meet you at the airport terminal with clear pickup instructions.' },
    { q: 'Can we travel with strollers and luggage?', a: 'Yes, our vehicles can accommodate luggage and strollers depending on the selected vehicle category.' },
    { q: `Can we book a return transfer from ${entity.name} to the airport?`, a: 'Yes, you can book both arrival and return transfers.' },
  ] : [
    { q: `How much is the transfer ${entity.pickupHint} → ${entity.dropoffHint}?`, a: `Fixed price starts from €${entity.priceFrom}. Final price depends on the vehicle category, passengers and luggage. Always shown before booking.` },
    { q: 'How long is the journey?', a: `The journey usually takes around ${entity.duration} depending on traffic.` },
    { q: 'Is flight tracking included?', a: 'Yes, we monitor your flight in real-time and adjust pickup automatically in case of delay.' },
    { q: 'Do you provide child seats?', a: 'Yes, child seats are available on request. Please mention this during booking.' },
    { q: 'Can I pay with my card?', a: 'Yes, secure online payment with Visa, Mastercard, Apple Pay or Google Pay.' },
  ];

  // Airport transfer cards (shown on hotel pages)
  const airportLinks = isHotel ? [
    { label: `CDG Airport to ${entity.name}`, to: '/cdg-to-disneyland-paris-transfer' },
    { label: `Orly Airport to ${entity.name}`, to: '/orly-to-disneyland-paris-transfer' },
    { label: `Beauvais Airport to ${entity.name}`, to: '/beauvais-to-disneyland-paris-transfer' },
    { label: `Paris to ${entity.name}`, to: '/paris-to-disneyland-paris-transfer' },
    { label: `${entity.name} to CDG Airport`, to: '/disneyland-paris-to-cdg-airport-transfer' },
    { label: `${entity.name} to Orly Airport`, to: '/disneyland-paris-to-orly-airport-transfer' },
  ] : [];

  // Related hotels (3 random other hotels) on route pages
  const relatedHotels = !isHotel
    ? Object.values(disneyHotels).slice(0, 6)
    : Object.values(disneyHotels).filter(h => h.slug !== entity.slug).slice(0, 4);

  // Schema.org structured data
  const schemaService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: isHotel ? `Private Transfer to ${entity.name}` : entity.h1,
    provider: { '@type': 'TaxiService', name: 'ZONT.CAB', url: 'https://www.zont.cab' },
    areaServed: { '@type': 'Place', name: 'Disneyland Paris' },
    description: entity.intro || entity.description,
    ...(entity.priceFrom ? { offers: { '@type': 'Offer', priceCurrency: 'EUR', price: entity.priceFrom, availability: 'https://schema.org/InStock' } } : {}),
  };

  const schemaFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hotelFaq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const canonicalUrl = `https://www.zont.cab/${entity.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid={`disney-transfer-page-${entity.slug}`}>
      <SEO
        title={entity.metaTitle}
        description={entity.metaDesc}
        canonical={canonicalUrl}
        jsonLd={[schemaService, schemaFaq]}
      />
      <Header />

      <main className="flex-1 pt-16">
        {/* ── HERO ── */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <img
              src={isHotel ? entity.image : '/images/disneyland.webp'}
              alt={heroTitle}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/90 via-[#1a2332]/85 to-[#1a2332]"></div>
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 sm:py-28">
            <Link to="/disneyland-paris-transfer" className="inline-flex items-center text-[#2ecc71] hover:text-[#27ae60] text-sm mb-6">
              <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Disneyland Paris Transfer
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">{heroTitle}</h1>
            <p className="text-base sm:text-lg text-gray-200 max-w-3xl mb-8">{heroSubtitle}</p>

            {/* Route info pill (only on route pages) */}
            {!isHotel && (
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="inline-flex items-center bg-white/10 backdrop-blur px-4 py-2 rounded-full text-white text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-[#2ecc71]" /> {entity.distance}
                </div>
                <div className="inline-flex items-center bg-white/10 backdrop-blur px-4 py-2 rounded-full text-white text-sm">
                  <Clock className="w-4 h-4 mr-2 text-[#2ecc71]" /> {entity.duration}
                </div>
                <div className="inline-flex items-center bg-[#2ecc71] px-4 py-2 rounded-full text-white text-sm font-semibold">
                  From €{entity.priceFrom}
                </div>
              </div>
            )}

            <button
              onClick={goToBooking}
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg transition-all hover:scale-105"
              data-testid="hero-book-btn"
            >
              Book your transfer →
            </button>
          </div>
        </section>

        {/* ── ABOUT SECTION ── */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              {isHotel ? `About ${entity.name}` : 'About this Transfer'}
            </h2>
            <div className="space-y-4 text-gray-300 text-base sm:text-lg leading-relaxed">
              <p>{entity.intro || entity.description}</p>
              {entity.description2 && <p>{entity.description2}</p>}
            </div>

            {/* Address card (hotels only) */}
            {isHotel && (
              <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-[#2ecc71] uppercase tracking-wider mb-2">Hotel address</h3>
                    <p className="text-white text-lg flex items-start">
                      <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-[#2ecc71]" />
                      <span>{entity.address}</span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#2ecc71] uppercase tracking-wider mb-2">Destination</h3>
                    <p className="text-white text-lg">Disneyland Paris / Val d'Europe / Marne-la-Vallée area</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── HOW TO GET THERE (hotels only) ── */}
        {isHotel && entity.howToGet && (
          <section className="py-12 px-4 bg-white/[0.02]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                How to get from {entity.name} to Disneyland Paris
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{entity.howToGet}</p>
            </div>
          </section>
        )}

        {/* ── AIRPORT TRANSFERS (hotels only) ── */}
        {isHotel && (
          <section className="py-12 sm:py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Airport transfers to {entity.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {airportLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ecc71]/40 rounded-xl p-5 transition-all"
                    data-testid={`airport-link-${link.to}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Plane className="w-5 h-5 text-[#2ecc71] mr-3 flex-shrink-0" />
                        <span className="text-white font-medium text-sm sm:text-base">{link.label}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-[#2ecc71] transition-colors flex-shrink-0 ml-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── RELATED HOTELS (route pages) ── */}
        {!isHotel && (
          <section className="py-12 sm:py-16 px-4 bg-white/[0.02]">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Popular Disneyland Paris Hotels</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedHotels.map(h => (
                  <Link
                    key={h.slug}
                    to={`/${h.slug}`}
                    className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2ecc71]/40 rounded-xl overflow-hidden transition-all"
                  >
                    <div className="aspect-video bg-gray-800 overflow-hidden">
                      <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-1">{h.name}</h3>
                      <p className="text-gray-400 text-xs mb-2 flex items-start">
                        <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" /> {h.address}
                      </p>
                      <span className="text-[#2ecc71] text-sm font-medium inline-flex items-center">
                        View transfer page <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── WHY BOOK ── */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">Why Book with ZONT.CAB</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: CreditCard, title: 'Fixed price', desc: 'Confirmed before booking, no hidden fees' },
                { icon: Car, title: 'Professional driver', desc: 'Vetted, experienced, English-speaking' },
                { icon: Baby, title: 'Child seats', desc: 'Available on request — free' },
                { icon: Plane, title: 'Flight tracking', desc: 'Automatic adjustment for delays' },
                { icon: Users, title: 'Family vehicles', desc: 'Space for luggage and strollers' },
                { icon: MapPin, title: 'Meet & greet', desc: 'Driver waits with a name sign' },
                { icon: Shield, title: 'Secure payment', desc: 'Visa, Mastercard, Apple Pay' },
                { icon: CheckCircle2, title: 'Door-to-door', desc: 'No shared rides, no detours' },
              ].map((b, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#2ecc71]/30 transition-colors">
                  <b.icon className="w-7 h-7 text-[#2ecc71] mb-3" />
                  <h3 className="text-white font-semibold mb-1">{b.title}</h3>
                  <p className="text-gray-400 text-sm">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 sm:py-16 px-4 bg-white/[0.02]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">FAQ</h2>
            <div className="space-y-3">
              {hotelFaq.map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left text-white hover:bg-white/[0.03] transition-colors"
                    data-testid={`faq-toggle-${i}`}
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

        {/* ── FINAL CTA ── */}
        <section className="py-16 px-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to book your transfer?</h2>
            <p className="text-white/90 mb-6 text-base sm:text-lg">
              {isHotel ? `Get an instant fixed price for your transfer to ${entity.name}.` : `Get an instant fixed price for ${entity.h1.toLowerCase()}.`}
            </p>
            <button
              onClick={goToBooking}
              className="bg-white text-[#1a2332] font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:bg-gray-100 transition-all hover:scale-105"
              data-testid="final-book-btn"
            >
              Book now →
            </button>
          </div>
        </section>
      </main>

      {/* Sticky mobile book button */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={goToBooking}
          className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-4 rounded-xl shadow-2xl text-base"
          data-testid="sticky-book-btn"
        >
          Book Now
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default DisneyTransferPage;
