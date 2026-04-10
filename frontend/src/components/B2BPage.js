import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, ArrowRight, Phone, Mail, Building2, Clock, Shield, Users, Star, Plane, ChevronRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const B2BPage = ({ content, seoUrls, relatedPages }) => {
  const { language } = useLanguage();
  const c = content[language] || content.en;
  const contactRef = useRef(null);
  const [formState, setFormState] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.company) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formState, source_page: seoUrls?.[language] || window.location.pathname }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      setFormState({ name: '', company: '', email: '', phone: '', message: '' });
    } catch {
      setError(language === 'fr' ? 'Erreur. Veuillez reessayer.' : language === 'ru' ? 'Ошибка. Попробуйте снова.' : language === 'hy' ? 'Սխալ: Խնդրում ենք կրկին փորձեք:' : 'Error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c1220]" data-testid="b2b-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical={seoUrls ? `https://www.zont.cab${seoUrls[language] || seoUrls.en}` : undefined}
        ogType="website"
        ogImage="https://images.unsplash.com/photo-1764089859662-7b4773dff85b?w=1200&q=80&auto=format"
        hreflang={seoUrls ? [
          { lang: 'en', href: `https://www.zont.cab${seoUrls.en}` },
          { lang: 'fr', href: `https://www.zont.cab${seoUrls.fr || seoUrls.en}` },
          { lang: 'ru', href: `https://www.zont.cab${seoUrls.ru || seoUrls.en}` },
        ] : undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": c.seoTitle,
          "description": c.seoDesc,
          "url": "https://www.zont.cab",
          "image": "https://www.zont.cab/logo512.png",
          "telephone": "+33783777027",
          "address": { "@type": "PostalAddress", "addressLocality": "Paris", "addressCountry": "FR" },
          "priceRange": "$$",
          "serviceType": "B2B Airport Transfer & Chauffeur Service",
          "areaServed": ["Paris", "France", "Monaco", "Europe"],
        }}
      />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1220] via-[#111b2e] to-[#0c1220]" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(46,204,113,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              {c.badge && (
                <span className="inline-block mb-4 px-4 py-1.5 bg-[#2ecc71]/10 text-[#2ecc71] text-xs font-semibold tracking-widest uppercase rounded-full border border-[#2ecc71]/20" data-testid="b2b-badge">
                  {c.badge}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5" data-testid="b2b-h1">
                {c.heroTitle}
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {c.heroSub}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={scrollToContact} className="px-8 py-3.5 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20" data-testid="cta-become-partner">
                  {c.ctaPartner || 'Become a Partner'}
                </button>
                <button onClick={scrollToContact} className="px-8 py-3.5 border border-gray-500 text-white font-semibold rounded-lg hover:border-[#2ecc71] hover:text-[#2ecc71] transition-all" data-testid="cta-request-quote">
                  {c.ctaQuote || 'Request a Quote'}
                </button>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="grid grid-cols-2 gap-3">
                {(c.heroStats || []).map((stat, i) => (
                  <div key={i} className="bg-[#151f33]/80 backdrop-blur border border-gray-700/40 rounded-xl p-5 text-center">
                    <div className="text-2xl font-bold text-[#2ecc71]">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-[#111b2e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3" data-testid="benefits-title">
            {c.benefitsTitle}
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">{c.benefitsSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(c.benefits || []).map((b, i) => (
              <div key={i} className="bg-[#1a2744]/60 border border-gray-700/30 rounded-xl p-6 hover:border-[#2ecc71]/30 transition-all group" data-testid={`benefit-${i}`}>
                <div className="w-10 h-10 rounded-lg bg-[#2ecc71]/10 flex items-center justify-center mb-4 group-hover:bg-[#2ecc71]/20 transition-colors">
                  <CheckCircle className="w-5 h-5 text-[#2ecc71]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      {c.services && (
        <section className="py-16 bg-[#0c1220]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">{c.servicesTitle}</h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">{c.servicesSub}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {c.services.map((s, i) => (
                <div key={i} className="flex gap-4 bg-[#151f33] border border-gray-700/30 rounded-xl p-5">
                  <div className="w-8 h-8 rounded-full bg-[#2ecc71]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-4 h-4 text-[#2ecc71]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                    <p className="text-gray-400 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-[#111b2e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">{c.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(c.howSteps || []).map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-12 h-12 rounded-full bg-[#2ecc71] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                {i < (c.howSteps.length - 1) && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#2ecc71]/40 to-transparent" />
                )}
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-[#0c1220]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">{c.trustTitle}</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">{c.trustSub}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(c.trustPoints || []).map((tp, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-[#2ecc71] mb-1">{tp.value}</div>
                <div className="text-gray-400 text-sm">{tp.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Pages / Internal Links */}
      {relatedPages && relatedPages.length > 0 && (
        <section className="py-16 bg-[#111b2e]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
              {c.relatedTitle || 'Explore Our Solutions'}
            </h2>
            <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">{c.relatedSub || ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPages.map((rp, i) => (
                <Link key={i} to={rp.path} className="bg-[#1a2744]/60 border border-gray-700/30 rounded-xl p-5 hover:border-[#2ecc71]/40 transition-all group flex items-center justify-between" data-testid={`related-link-${i}`}>
                  <div>
                    <div className="text-white font-semibold group-hover:text-[#2ecc71] transition-colors">{rp.name}</div>
                    <div className="text-gray-500 text-xs mt-1">{rp.tagline}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#2ecc71] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact / CTA Section */}
      <section ref={contactRef} className="py-20 bg-[#0c1220]" id="contact" data-testid="b2b-contact-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#151f33] to-[#1a2744] border border-gray-700/40 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">{c.contactTitle}</h2>
            <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">{c.contactSub}</p>
            {submitted ? (
              <div className="text-center py-8" data-testid="form-success">
                <CheckCircle className="w-16 h-16 text-[#2ecc71] mx-auto mb-4" />
                <p className="text-xl text-white font-semibold mb-2">{language === 'fr' ? 'Demande envoyee !' : language === 'ru' ? 'Запрос отправлен!' : language === 'hy' ? 'Հարցումը ուղարկվեց!' : 'Request sent!'}</p>
                <p className="text-gray-400">{language === 'fr' ? 'Nous vous repondrons sous 24h.' : language === 'ru' ? 'Мы ответим в течение 24 часов.' : language === 'hy' ? 'Մենք կպատասխանենք 24 ժամվա ընթացքում:' : 'We will respond within 24 hours.'}</p>
              </div>
            ) : (
            <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit} data-testid="b2b-contact-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder={c.formName || 'Your Name'} value={formState.name} onChange={e => setFormState(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-name" />
                <input type="text" required placeholder={c.formCompany || 'Company'} value={formState.company} onChange={e => setFormState(p => ({...p, company: e.target.value}))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-company" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="email" required placeholder={c.formEmail || 'Email'} value={formState.email} onChange={e => setFormState(p => ({...p, email: e.target.value}))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-email" />
                <input type="tel" placeholder={c.formPhone || 'Phone'} value={formState.phone} onChange={e => setFormState(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-phone" />
              </div>
              <textarea rows="4" placeholder={c.formMessage || 'Tell us about your needs...'} value={formState.message} onChange={e => setFormState(p => ({...p, message: e.target.value}))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors resize-none" data-testid="form-message" />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20 disabled:opacity-50" data-testid="form-submit">
                {submitting ? '...' : (c.formSubmit || 'Send Your Request')}
              </button>
            </form>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-sm text-gray-400">
              <a href="mailto:partners@zont.cab" className="flex items-center gap-2 hover:text-[#2ecc71] transition-colors">
                <Mail className="w-4 h-4" /> partners@zont.cab
              </a>
              <a href="tel:+33123456789" className="flex items-center gap-2 hover:text-[#2ecc71] transition-colors">
                <Phone className="w-4 h-4" /> +33 1 23 45 67 89
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Partners link */}
      {c.backToPartners && (
        <div className="bg-[#0c1220] pb-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <Link to="/partners" className="text-gray-400 hover:text-[#2ecc71] transition-colors text-sm inline-flex items-center gap-1">
              <ArrowRight className="w-3 h-3 rotate-180" /> {c.backToPartners}
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default B2BPage;
