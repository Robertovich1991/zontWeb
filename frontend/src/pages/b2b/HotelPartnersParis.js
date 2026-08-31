import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { CheckCircle, ArrowRight, Mail, Plane, Car, Users, Star, Building2, Percent, MonitorSmartphone, ChevronRight } from 'lucide-react';
import { trackLead } from '@/utils/fbPixel';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const CANONICAL = 'https://www.zont.cab/partenaire-vtc-hotel-paris';

const transferList = [
  'Transferts Aéroport Paris-Charles de Gaulle (CDG) ↔ hôtel',
  'Transferts Aéroport Paris-Orly (ORY) ↔ hôtel',
  'Transferts Paris-Beauvais (BVA) ↔ hôtel',
  'Transferts entre les principales gares parisiennes et votre établissement',
  'Trajets hôtel ↔ restaurant, rendez-vous ou événement',
  'Chauffeurs à disposition pour plusieurs heures ou pour une journée',
  'Déplacements professionnels et roadshows',
  'Excursions privées vers Versailles, Disneyland Paris et d\'autres destinations',
  'Transferts longue distance en France et en Europe',
];

const hotelTypes = [
  { icon: Building2, title: 'Hôtels 3 et 4 étoiles', desc: 'Transferts aéroport, gares, vans pour familles et groupes et déplacements touristiques.' },
  { icon: Star, title: 'Hôtels 4 et 5 étoiles', desc: 'Berlines Premium, Mercedes Classe V, accueil personnalisé et chauffeurs à disposition.' },
  { icon: Users, title: 'Boutique-hôtels et appart\'hôtels', desc: 'Une solution de transport disponible pour les établissements ne disposant pas de leur propre service chauffeur.' },
  { icon: CheckCircle, title: 'Conciergeries', desc: 'Possibilité d\'organiser plusieurs prestations de transport pour les clients pendant leur séjour.' },
];

const advantages = [
  { icon: Percent, title: 'Jusqu\'à 10 % de commission Premium', desc: 'Votre établissement bénéficie d\'une rémunération sur les prestations Premium éligibles.' },
  { icon: Car, title: 'Aucun véhicule à gérer', desc: 'ZONT organise le transport et la prestation chauffeur.' },
  { icon: Users, title: 'Plusieurs catégories de véhicules', desc: 'Berlines, véhicules Premium, Mercedes Classe V, vans et minibus selon les besoins.' },
  { icon: Plane, title: 'Transferts aéroports et gares', desc: 'CDG, Orly, Beauvais et principales gares parisiennes.' },
  { icon: CheckCircle, title: 'Chauffeur à disposition', desc: 'Pour shopping, rendez-vous professionnels, événements, tourisme ou journées complètes.' },
  { icon: Star, title: 'Clientèle internationale', desc: 'Un service particulièrement adapté aux voyageurs internationaux séjournant à Paris.' },
  { icon: MonitorSmartphone, title: 'Borne de réservation disponible', desc: 'Possibilité d\'installer gratuitement une borne ZONT dans les hôtels partenaires éligibles.' },
];

export default function HotelPartnersParis() {
  const contactRef = useRef(null);
  const [formState, setFormState] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.company) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formState, source_page: '/partenaire-vtc-hotel-paris' }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      trackLead({ source: 'Hotel Partners Paris' });
      setFormState({ name: '', company: '', email: '', phone: '', message: '' });
    } catch {
      setError('Erreur. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const H2 = ({ children }) => (
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5">{children}</h2>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0c1220]" data-testid="hotel-partners-page">
      <SEO
        title="Partenaire VTC Hôtel Paris | Chauffeur Privé & Commission 10% | ZONT"
        description="Devenez hôtel partenaire ZONT à Paris. Chauffeurs privés, transferts CDG et Orly, véhicules Premium et jusqu'à 10 % de commission. Borne de réservation disponible gratuitement."
        canonical={CANONICAL}
        language="fr"
        ogType="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Partenariat VTC pour Hôtels à Paris',
          description: "Programme partenaire ZONT pour hôtels : chauffeur privé, transferts aéroport CDG, Orly, Beauvais et jusqu'à 10 % de commission sur la gamme Premium.",
          url: CANONICAL,
          provider: { '@type': 'LocalBusiness', name: 'ZONT', telephone: '+33783777027', address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' } },
          areaServed: ['Paris', 'Île-de-France'],
          serviceType: 'Chauffeur privé et transferts aéroport pour hôtels',
        }}
      />
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1220] via-[#111b2e] to-[#0c1220]" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(46,204,113,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block mb-4 px-4 py-1.5 bg-[#2ecc71]/10 text-[#2ecc71] text-xs font-semibold tracking-widest uppercase rounded-full border border-[#2ecc71]/20">
            Programme Partenaire Hôtels
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5" data-testid="hotel-partners-h1">
            Partenaire VTC pour Hôtels à Paris – Chauffeur Privé & Transferts Aéroport
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Un service de chauffeur privé conçu pour les hôtels et leurs clients — avec jusqu'à 10 % de commission sur la gamme Premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={scrollToContact} className="px-8 py-3.5 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20" data-testid="cta-become-hotel-partner">
              Devenir hôtel partenaire
            </button>
            <Link to="/borne-reservation-hotel" className="px-8 py-3.5 border border-gray-500 text-white font-semibold rounded-lg hover:border-[#2ecc71] hover:text-[#2ecc71] transition-all" data-testid="cta-discover-kiosk-hero">
              Découvrir la borne ZONT pour hôtels
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-14 bg-[#111b2e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 text-gray-300 leading-relaxed">
          <H2>Un service de chauffeur privé conçu pour les hôtels et leurs clients</H2>
          <p>ZONT accompagne les hôtels à Paris et en Île-de-France qui souhaitent proposer à leurs clients un service fiable de VTC, chauffeur privé et transfert aéroport.</p>
          <p>Notre programme partenaire permet aux hôtels, conciergeries et établissements touristiques de réserver facilement un chauffeur pour leurs clients tout en bénéficiant d'une commission pouvant atteindre <strong className="text-white">10 % sur notre gamme Premium</strong>.</p>
          <p>Transfert depuis ou vers l'aéroport, gare, rendez-vous professionnel, restaurant, excursion touristique ou chauffeur à disposition : votre équipe dispose d'un interlocuteur unique pour organiser les déplacements de vos clients.</p>
          <p>Notre objectif est simple : permettre à votre réception et à votre conciergerie de proposer un service de transport professionnel sans avoir à gérer une flotte de véhicules ou plusieurs prestataires.</p>
        </div>
      </section>

      {/* Pourquoi devenir partenaire */}
      <section className="py-14 bg-[#0c1220]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 text-gray-300 leading-relaxed">
          <H2>Pourquoi devenir hôtel partenaire ZONT ?</H2>
          <p>Un client qui demande un taxi ou un chauffeur à la réception attend généralement une réponse immédiate.</p>
          <p>Avec ZONT, votre établissement peut proposer directement une solution de transport adaptée au niveau de service attendu par votre clientèle.</p>

          <h3 className="text-xl font-semibold text-white pt-4">Jusqu'à 10 % de commission sur la gamme Premium</h3>
          <p>Les hôtels partenaires peuvent bénéficier d'une commission jusqu'à 10 % sur les réservations éligibles de notre gamme Premium.</p>
          <p>Cela permet à votre établissement de transformer les demandes de transport quotidiennes en une source de revenus supplémentaire, sans investissement dans une flotte et sans frais de fonctionnement liés au transport.</p>
          <p>Votre hôtel reste concentré sur son métier : nous nous occupons du chauffeur, du véhicule et de la prestation.</p>

          <div className="bg-[#151f33] border border-[#2ecc71]/30 rounded-xl p-5 my-6">
            <p className="text-white">
              Vous souhaitez automatiser les réservations de vos clients ?{' '}
              <Link to="/borne-reservation-hotel" className="text-[#2ecc71] font-semibold hover:underline" data-testid="kiosk-link-inline">
                Découvrez notre borne de réservation gratuite pour hôtels
              </Link>.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-white pt-2">Un service qui valorise l'expérience de vos clients</h3>
          <p>Le transport fait partie de l'expérience globale d'un séjour.</p>
          <p>Un chauffeur ponctuel, un véhicule propre et confortable et une prise en charge bien organisée contribuent directement à l'image de votre établissement.</p>
          <p className="text-white font-medium">ZONT peut notamment prendre en charge vos clients pour :</p>
          <ul className="space-y-2.5">
            {transferList.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#2ecc71] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Chauffeur privé + transferts aéroport */}
      <section className="py-14 bg-[#111b2e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 text-gray-300 leading-relaxed">
          <H2>Chauffeur privé pour hôtel à Paris</H2>
          <p>ZONT propose plusieurs catégories de véhicules afin que votre réception puisse sélectionner une solution adaptée au nombre de passagers, aux bagages et au niveau de confort souhaité.</p>
          <p>Pour une clientèle Premium, nous pouvons proposer notamment des berlines Business/Premium et Mercedes Classe V.</p>
          <p>Pour les familles et les groupes, nos vans et minibus permettent de transporter plusieurs voyageurs avec leurs bagages.</p>
          <p>Votre équipe peut ainsi proposer une solution aussi bien à un voyageur d'affaires seul qu'à une famille ou à un groupe séjournant dans votre hôtel.</p>

          <h3 className="text-xl font-semibold text-white pt-4">Transferts aéroport pour les clients de votre hôtel</h3>
          <p>Les transferts aéroport représentent l'une des demandes les plus fréquentes des hôtels parisiens.</p>
          <p>ZONT organise les arrivées et départs entre votre établissement et CDG, Orly et Beauvais.</p>
          <p>Pour les prises en charge à l'aéroport, le service peut comprendre le suivi du vol, l'adaptation de la prise en charge en fonction de l'arrivée et l'accueil du passager.</p>
          <p>Selon la prestation réservée, le chauffeur peut accueillir votre client avec un panneau nominatif.</p>
          <p>Votre client arrive ainsi à Paris avec son transport déjà organisé jusqu'à votre établissement.</p>

          <h3 className="text-xl font-semibold text-white pt-4">Un partenaire VTC pour votre réception et votre conciergerie</h3>
          <p>Nous avons conçu le partenariat ZONT pour qu'il puisse être utilisé simplement par les équipes d'un hôtel.</p>
          <p>Lorsqu'un client demande un chauffeur, votre réception peut effectuer ou transmettre la réservation avec les informations nécessaires : adresse, horaire, nombre de passagers, bagages et catégorie de véhicule souhaitée.</p>
          <p>Vous évitez ainsi de rechercher un nouveau chauffeur à chaque demande.</p>
          <p>Pour les établissements ayant des besoins réguliers, ZONT peut devenir un partenaire transport complémentaire de vos fournisseurs actuels.</p>
          <p>Il n'est pas nécessaire de remplacer vos prestataires existants : vous pouvez utiliser ZONT lorsqu'une réservation correspond à notre flotte, à nos destinations ou à nos catégories Premium.</p>
        </div>
      </section>

      {/* Types d'hôtels */}
      <section className="py-14 bg-[#0c1220]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">Une solution pour hôtels 3, 4 et 5 étoiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hotelTypes.map((h, i) => (
              <div key={i} className="bg-[#151f33] border border-gray-700/30 rounded-xl p-6 hover:border-[#2ecc71]/30 transition-all" data-testid={`hotel-type-${i}`}>
                <div className="w-10 h-10 rounded-lg bg-[#2ecc71]/10 flex items-center justify-center mb-4">
                  <h.icon className="w-5 h-5 text-[#2ecc71]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Borne */}
      <section className="py-14 bg-[#111b2e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 text-gray-300 leading-relaxed">
          <H2>Une borne de réservation gratuite directement dans votre hôtel</H2>
          <p>Pour les hôtels souhaitant aller plus loin, ZONT propose également une solution particulièrement intéressante : la borne de réservation ZONT.</p>
          <p>La borne peut être installée dans votre établissement afin que vos clients puissent consulter et réserver directement leurs transferts et services chauffeur.</p>
          <p>Le client peut effectuer sa réservation depuis l'hôtel, tandis que la réception peut également l'accompagner si nécessaire.</p>
          <h3 className="text-xl font-semibold text-white pt-2">Installation gratuite pour les hôtels partenaires</h3>
          <p>L'installation de la borne peut être proposée gratuitement aux hôtels partenaires éligibles.</p>
          <p>Il n'est donc pas nécessaire de développer votre propre système de réservation de transport.</p>
          <p>La borne devient un point de réservation accessible directement depuis votre établissement.</p>
          <Link to="/borne-reservation-hotel" className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-[#2ecc71]/10 border border-[#2ecc71]/40 text-[#2ecc71] font-semibold rounded-lg hover:bg-[#2ecc71]/20 transition-all" data-testid="cta-discover-kiosk-section">
            Découvrir la borne ZONT pour hôtels et demander une installation gratuite <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-14 bg-[#0c1220]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">Les avantages du partenariat ZONT pour votre hôtel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {advantages.map((a, i) => (
              <div key={i} className="bg-[#151f33] border border-gray-700/30 rounded-xl p-6 hover:border-[#2ecc71]/30 transition-all" data-testid={`advantage-${i}`}>
                <div className="w-10 h-10 rounded-lg bg-[#2ecc71]/10 flex items-center justify-center mb-4">
                  <a.icon className="w-5 h-5 text-[#2ecc71]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{a.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment devenir partenaire + Contact */}
      <section ref={contactRef} className="py-20 bg-[#111b2e]" id="contact" data-testid="hotel-partners-contact">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 text-gray-300 leading-relaxed space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Comment devenir hôtel partenaire ZONT ?</h2>
            <p>Devenir partenaire est simple. Contactez notre équipe en indiquant le nom de votre hôtel, son adresse et vos coordonnées professionnelles.</p>
            <p>Nous vous présenterons le fonctionnement du partenariat, les catégories de véhicules disponibles et les conditions de commission.</p>
            <p>Si votre établissement souhaite également proposer une réservation directement sur place, vous pourrez demander l'étude d'une installation gratuite de la borne ZONT.</p>
          </div>
          <div className="bg-gradient-to-br from-[#151f33] to-[#1a2744] border border-gray-700/40 rounded-2xl p-8 sm:p-12">
            <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">Proposez un chauffeur privé à vos clients et gagnez jusqu'à 10 % de commission</h3>
            <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">Offrez à vos clients une solution professionnelle pour leurs transferts aéroport et leurs déplacements à Paris tout en développant un service complémentaire pour votre établissement.</p>
            {submitted ? (
              <div className="text-center py-8" data-testid="form-success">
                <CheckCircle className="w-16 h-16 text-[#2ecc71] mx-auto mb-4" />
                <p className="text-xl text-white font-semibold mb-2">Demande envoyée !</p>
                <p className="text-gray-400">Nous vous répondrons sous 24h.</p>
              </div>
            ) : (
              <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit} data-testid="hotel-partners-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" required placeholder="Votre nom" value={formState.name} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-name" />
                  <input type="text" required placeholder="Nom de l'hôtel" value={formState.company} onChange={e => setFormState(p => ({ ...p, company: e.target.value }))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-company" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="email" required placeholder="Email professionnel" value={formState.email} onChange={e => setFormState(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-email" />
                  <input type="tel" placeholder="Téléphone" value={formState.phone} onChange={e => setFormState(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors" data-testid="form-phone" />
                </div>
                <textarea rows="4" placeholder="Adresse de l'hôtel, nombre de chambres, besoins transport..." value={formState.message} onChange={e => setFormState(p => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2ecc71] transition-colors resize-none" data-testid="form-message" />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20 disabled:opacity-50" data-testid="form-submit">
                  {submitting ? '...' : 'Devenir hôtel partenaire'}
                </button>
              </form>
            )}
            <div className="text-center mt-6">
              <Link to="/borne-reservation-hotel" className="text-[#2ecc71] text-sm font-semibold hover:underline inline-flex items-center gap-1" data-testid="cta-discover-kiosk-footer">
                Découvrir la borne ZONT pour hôtels <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              <a href="mailto:partners@zont.cab" className="hover:text-[#2ecc71] transition-colors">partners@zont.cab</a>
            </div>
          </div>
        </div>
      </section>

      {/* Retour B2B */}
      <div className="bg-[#0c1220] py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link to="/b2b-transferts-aeroport" className="text-gray-400 hover:text-[#2ecc71] transition-colors text-sm inline-flex items-center gap-1" data-testid="back-to-b2b-link">
            <ArrowRight className="w-3 h-3 rotate-180" /> Voir toutes nos solutions B2B
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
