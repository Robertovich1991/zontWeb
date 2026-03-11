import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { Users, Briefcase, Shield, Clock, Star, MapPin, Plane, CreditCard, Phone, CheckCircle, ChevronRight } from 'lucide-react';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format',
  sedan: 'https://images.unsplash.com/photo-1764090317623-06968349ad23?w=600&q=75&auto=format',
  interior: 'https://images.unsplash.com/photo-1661220715153-95724e5f3500?w=600&q=75&auto=format',
  airport: 'https://images.unsplash.com/photo-1689772640958-7c186dbdfe26?w=600&q=75&auto=format',
};

const trustLabels = {
  en: { trips: 'Completed Trips', available: 'Available', fixed: 'Fixed Prices', rating: 'Rating', reviews: 'reviews', trustTitle: 'Trusted by thousands of travelers', paySecure: 'Secure Payment', payDesc: 'All major cards accepted', verifiedDriver: 'Verified Drivers', verifiedDesc: 'Licensed professionals', flightTrack: 'Flight Tracking', flightDesc: 'Real-time monitoring', freeCancel: 'Free Cancellation', cancelDesc: 'Up to 24h before' },
  fr: { trips: 'Courses Effectuees', available: 'Disponible', fixed: 'Prix Fixes', rating: 'Note', reviews: 'avis', trustTitle: 'La confiance de milliers de voyageurs', paySecure: 'Paiement Securise', payDesc: 'Toutes cartes acceptees', verifiedDriver: 'Chauffeurs Verifies', verifiedDesc: 'Professionnels agrees', flightTrack: 'Suivi de Vol', flightDesc: 'Surveillance en temps reel', freeCancel: 'Annulation Gratuite', cancelDesc: 'Jusqu\'a 24h avant' },
  ru: { trips: 'Выполненных Поездок', available: 'Доступно', fixed: 'Фиксированные Цены', rating: 'Рейтинг', reviews: 'отзывов', trustTitle: 'Доверие тысяч путешественников', paySecure: 'Безопасная Оплата', payDesc: 'Все карты принимаются', verifiedDriver: 'Проверенные Водители', verifiedDesc: 'Лицензированные профессионалы', flightTrack: 'Отслеживание Рейса', flightDesc: 'Мониторинг в реальном времени', freeCancel: 'Бесплатная Отмена', cancelDesc: 'До 24 часов' },
};

const reviewsData = {
  en: [
    { name: 'Sarah M.', city: 'London', text: 'Excellent service! Driver was waiting with a sign, very professional. Car was spotless. Will use again.', stars: 5 },
    { name: 'Jean-Pierre D.', city: 'Paris', text: 'Perfect transfer from the airport. Fixed price, no surprises. The driver helped with all our luggage.', stars: 5 },
    { name: 'Marco R.', city: 'Milan', text: 'Best airport transfer I\'ve ever had. On time, clean car, polite driver. Highly recommended!', stars: 5 },
  ],
  fr: [
    { name: 'Sarah M.', city: 'Londres', text: 'Excellent service ! Le chauffeur attendait avec une pancarte, tres professionnel. Voiture impeccable.', stars: 5 },
    { name: 'Jean-Pierre D.', city: 'Paris', text: 'Transfert parfait depuis l\'aeroport. Prix fixe, pas de surprises. Le chauffeur nous a aide avec tous nos bagages.', stars: 5 },
    { name: 'Marco R.', city: 'Milan', text: 'Meilleur transfert aeroport que j\'ai eu. Ponctuel, voiture propre, chauffeur poli. Je recommande vivement !', stars: 5 },
  ],
  ru: [
    { name: 'Сара М.', city: 'Лондон', text: 'Отличный сервис! Водитель ждал с табличкой, очень профессионально. Машина идеально чистая.', stars: 5 },
    { name: 'Жан-Пьер Д.', city: 'Париж', text: 'Идеальный трансфер из аэропорта. Фиксированная цена, никаких сюрпризов. Водитель помог с багажом.', stars: 5 },
    { name: 'Марко Р.', city: 'Милан', text: 'Лучший трансфер из аэропорта. Вовремя, чистая машина, вежливый водитель. Рекомендую!', stars: 5 },
  ],
};

const CityTransferPage = ({ content, vehicles: vehiclesPrices, seoUrls }) => {
  const navigate = useNavigate();
  const { startBooking } = useBooking();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const bookingFormRef = useRef(null);
  const [formData, setFormData] = useState({ pickup: '', dropoff: '', date: '', time: '' });

  const c = content[language] || content.en;
  const tr = trustLabels[language] || trustLabels.en;
  const revs = reviewsData[language] || reviewsData.en;

  if (!formData.pickup && c.defaultPickup) {
    setFormData(prev => ({ ...prev, pickup: c.defaultPickup }));
  }

  const vehicles = [
    { id: 1, name: c.sedan, desc: c.sedanDesc, passengers: 3, luggage: 3, price: vehiclesPrices?.sedan || 65, img: IMAGES.sedan },
    { id: 2, name: c.luxury, desc: c.luxuryDesc, passengers: 3, luggage: 3, price: vehiclesPrices?.luxury || 95, img: IMAGES.interior },
    { id: 3, name: c.minivan, desc: c.minivanDesc, passengers: 6, luggage: 6, price: vehiclesPrices?.minivan || 120, img: IMAGES.sedan },
    { id: 4, name: c.minibus, desc: c.minibusDesc, passengers: 8, luggage: 8, price: vehiclesPrices?.minibus || 180, img: IMAGES.airport },
  ];

  const routes = c.routes || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      startBooking({ ...formData, selectedVehicle });
      navigate('/car-selection');
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const scrollToBooking = (v) => {
    if (v) setSelectedVehicle(v);
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="city-transfer-page">
      <SEO
        title={c.title}
        description={c.description}
        canonical={seoUrls ? `https://zont.cab${seoUrls[language] || seoUrls.en}` : undefined}
        ogImage="https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format"
        hreflang={seoUrls ? [
          { lang: 'en', href: `https://zont.cab${seoUrls.en}` },
          { lang: 'fr', href: `https://zont.cab${seoUrls.fr}` },
          { lang: 'ru', href: `https://zont.cab${seoUrls.ru}` },
        ] : undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": c.title,
          "description": c.description,
          "provider": { "@type": "Organization", "name": "Zont", "url": "https://zont.cab" },
          "serviceType": "Airport Transfer",
          "areaServed": { "@type": "Place", "name": c.title.split(' - ')[0] },
          "offers": vehiclesPrices ? {
            "@type": "AggregateOffer",
            "priceCurrency": "EUR",
            "lowPrice": Math.min(...Object.values(vehiclesPrices)),
            "highPrice": Math.max(...Object.values(vehiclesPrices)),
          } : undefined,
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "10000", "bestRating": "5" }
        }}
      />
      <Header />
      <main className="flex-1 pt-16">

        {/* HERO + BOOKING FORM - Mobile First */}
        <section className="relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img src={IMAGES.hero} alt={c.title} className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/90 via-[#1a2332]/80 to-[#1a2332]"></div>
          </div>

          <div className="relative z-10 px-4 pt-8 pb-12 md:pt-16 md:pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                {/* Left: Title + Trust */}
                <div className="text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-4">
                    <div className="bg-[#2ecc71]/20 text-[#2ecc71] px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center" data-testid="trust-badge-top">
                      <Star className="w-4 h-4 fill-current mr-1.5" aria-hidden="true" />
                      {c.rating}
                    </div>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight" data-testid="city-hero-title">
                    {c.title}
                  </h1>
                  <p className="text-base md:text-lg text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0">
                    {c.subtitle}
                  </p>

                  {/* Trust Stats - Mobile */}
                  <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto lg:mx-0">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#2ecc71]">50K+</div>
                      <div className="text-xs text-gray-400">{tr.trips}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#2ecc71]">24/7</div>
                      <div className="text-xs text-gray-400">{tr.available}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#2ecc71]">4.9/5</div>
                      <div className="text-xs text-gray-400">{tr.rating}</div>
                    </div>
                  </div>

                  {/* Trust Badges - Desktop */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 mt-8">
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <CreditCard className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.paySecure}</p><p className="text-gray-400 text-xs">{tr.payDesc}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <Shield className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.verifiedDriver}</p><p className="text-gray-400 text-xs">{tr.verifiedDesc}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <Plane className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.flightTrack}</p><p className="text-gray-400 text-xs">{tr.flightDesc}</p></div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                      <Clock className="w-8 h-8 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
                      <div><p className="text-white font-semibold text-sm">{tr.freeCancel}</p><p className="text-gray-400 text-xs">{tr.cancelDesc}</p></div>
                    </div>
                  </div>
                </div>

                {/* Right: Booking Form (above the fold on mobile) */}
                <div ref={bookingFormRef} className="w-full max-w-md mx-auto lg:mx-0">
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-2xl" data-testid="booking-form-card">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1 text-center" data-testid="booking-form-title">{c.bookingForm}</h2>
                    <p className="text-xs text-gray-500 text-center mb-4">{tr.fixed} - {tr.paySecure}</p>

                    {selectedVehicle && (
                      <div className="bg-[#2ecc71]/10 border border-[#2ecc71] rounded-lg p-3 mb-4 flex items-center justify-between" data-testid="selected-vehicle-banner">
                        <div>
                          <p className="text-gray-900 font-bold text-sm">{selectedVehicle.name}</p>
                          <p className="text-gray-500 text-xs">{selectedVehicle.passengers} {c.passengers}</p>
                        </div>
                        <div className="text-[#2ecc71] text-lg font-bold">{selectedVehicle.price}&euro;</div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3" data-testid="booking-form" role="form" aria-label={c.bookingForm}>
                      <div>
                        <label htmlFor="pickup" className="block text-gray-700 font-medium text-sm mb-1">{c.pickupLabel}</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#2ecc71]" aria-hidden="true" />
                          <input type="text" id="pickup" name="pickup" value={formData.pickup} onChange={handleChange} required
                            className="w-full pl-9 pr-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="pickup-input" aria-label={c.pickupLabel} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="dropoff" className="block text-gray-700 font-medium text-sm mb-1">{c.dropoffLabel}</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-red-500" aria-hidden="true" />
                          <input type="text" id="dropoff" name="dropoff" value={formData.dropoff} onChange={handleChange} required
                            className="w-full pl-9 pr-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="dropoff-input" aria-label={c.dropoffLabel} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="date" className="block text-gray-700 font-medium text-sm mb-1">{c.dateLabel}</label>
                          <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required
                            className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="date-input" aria-label={c.dateLabel} />
                        </div>
                        <div>
                          <label htmlFor="time" className="block text-gray-700 font-medium text-sm mb-1">{c.timeLabel}</label>
                          <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required
                            className="w-full px-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm" data-testid="time-input" aria-label={c.timeLabel} />
                        </div>
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-bold text-base hover:bg-[#27ae60] transition-colors uppercase tracking-wide shadow-lg shadow-[#2ecc71]/30"
                        data-testid="submit-booking-btn">
                        {loading ? '...' : c.bookNow}
                      </button>
                    </form>

                    {/* Payment Icons */}
                    <div className="flex items-center justify-center space-x-3 mt-3 pt-3 border-t border-gray-100">
                      <Shield className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span className="text-xs text-gray-400">Visa</span>
                      <span className="text-xs text-gray-400">Mastercard</span>
                      <span className="text-xs text-gray-400">PayPal</span>
                      <span className="text-xs text-gray-400">Apple Pay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE Trust Badges */}
        <section className="lg:hidden py-6 px-4 bg-[#0f1419]">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <CreditCard className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.paySecure}</p><p className="text-gray-500 text-[10px]">{tr.payDesc}</p></div>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <Shield className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.verifiedDriver}</p><p className="text-gray-500 text-[10px]">{tr.verifiedDesc}</p></div>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <Plane className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.flightTrack}</p><p className="text-gray-500 text-[10px]">{tr.flightDesc}</p></div>
            </div>
            <div className="flex items-center space-x-2 bg-[#1a2332] rounded-lg p-3">
              <Clock className="w-6 h-6 text-[#2ecc71] flex-shrink-0" aria-hidden="true" />
              <div><p className="text-white font-semibold text-xs">{tr.freeCancel}</p><p className="text-gray-500 text-[10px]">{tr.cancelDesc}</p></div>
            </div>
          </div>
        </section>

        {/* SEO Description */}
        <section className="py-10 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <p className="text-base text-gray-300 leading-relaxed">{c.description}</p>
            {c.description2 && <p className="text-sm text-gray-400 leading-relaxed mt-3">{c.description2}</p>}
          </div>
        </section>

        {/* VEHICLES with Photos */}
        <section className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.vehiclesTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-shadow group" data-testid={`vehicle-card-${v.id}`}>
                  <div className="h-36 md:h-44 overflow-hidden">
                    <img src={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{v.name}</h3>
                        <p className="text-gray-500 text-sm">{v.desc}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{v.price}&euro;</div>
                        <p className="text-xs text-gray-400">{c.allInclusive}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                      <span className="flex items-center"><Users size={14} className="mr-1" aria-hidden="true" />{v.passengers} {c.passengers}</span>
                      <span className="flex items-center"><Briefcase size={14} className="mr-1" aria-hidden="true" />{v.luggage} {c.luggage}</span>
                    </div>
                    <button onClick={() => scrollToBooking(v)}
                      className="w-full bg-[#2ecc71] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#27ae60] transition-colors flex items-center justify-center"
                      data-testid={`book-vehicle-${v.id}`} aria-label={`${c.bookNow} ${v.name}`}>
                      {c.bookNow} <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR ROUTES */}
        {routes.length > 0 && (
          <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">{c.popularRoutesTitle}</h2>
              <div className="space-y-3">
                {routes.map((route, i) => (
                  <button key={i} onClick={() => scrollToBooking(null)} className="w-full bg-[#1a2332] rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-[#2ecc71] transition-colors group text-left" data-testid={`route-${i}`} aria-label={`${route.name} - ${c.fromLabel} ${route.price} euros`}>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-[#2ecc71] mr-3 flex-shrink-0" aria-hidden="true" />
                      <span className="text-white text-sm md:text-base">{route.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#2ecc71] font-bold text-lg">{c.fromLabel} {route.price}&euro;</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#2ecc71]" aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REVIEWS / Social Proof */}
        <section className="py-12 md:py-20 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">{tr.trustTitle}</h2>
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />)}
                <span className="text-gray-300 ml-2 text-sm">4.9/5 — 10,000+ {tr.reviews}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {revs.map((rev, i) => (
                <div key={i} className="bg-[#0f1419] rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(rev.stars)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />)}
                  </div>
                  <p className="text-gray-300 text-sm mb-4 italic">"{rev.text}"</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#2ecc71] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3" aria-hidden="true">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{rev.name}</p>
                      <p className="text-gray-500 text-xs">{rev.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-12 md:py-20 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{c.howItWorks}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-[#2ecc71] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4" aria-hidden="true">{i + 1}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step}</h3>
                  <p className="text-gray-400 text-sm">{[c.step1Desc, c.step2Desc, c.step3Desc][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Photo Section */}
        <section className="py-12 md:py-16 px-4 bg-[#1a2332]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { src: IMAGES.hero, alt: 'Mercedes premium sedan transfer' },
                { src: IMAGES.interior, alt: 'Luxury car interior leather seats' },
                { src: IMAGES.airport, alt: 'Modern airport terminal' },
                { src: IMAGES.sedan, alt: 'Black luxury sedan parked' },
              ].map((photo, i) => (
                <div key={i} className="rounded-xl overflow-hidden h-32 md:h-48">
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Cities CTA */}
        <section className="py-12 px-4 bg-[#0f1419]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{c.otherCitiesTitle}</h2>
            <Link to="/countries" className="inline-flex items-center bg-[#2ecc71] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors" data-testid="view-all-cities-btn">
              {c.otherCitiesBtn} <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* STICKY MOBILE CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a2332] border-t border-gray-700 p-3 z-40 safe-area-bottom" data-testid="mobile-sticky-cta">
        <button onClick={() => scrollToBooking(null)}
          className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-bold text-base uppercase tracking-wide shadow-lg shadow-[#2ecc71]/30 flex items-center justify-center"
          aria-label={c.bookNow}>
          {c.bookNow} <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
        </button>
      </div>

      <div className="lg:hidden h-16"></div>
      <Footer />
    </div>
  );
};

export default CityTransferPage;
