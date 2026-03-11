import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Car, Clock, DollarSign, Users, CheckCircle, Star, ArrowRight } from 'lucide-react';

const content = {
  en: {
    seoTitle: 'Become a Driver - Join Zont | Professional Chauffeur',
    seoDesc: 'Join Zont as a professional driver. Flexible hours, competitive rates, work with your own car.',
    heroTitle: 'Become a Driver',
    heroAccent: 'with Zont',
    heroSub: 'Join thousands of professional drivers earning money on their own schedule',
    badge: 'Now Recruiting',
    whyTitle: 'Why Drive with Zont?',
    benefits: [
      { title: 'Earn More', desc: 'Set your own schedule and earn competitive rates for every ride. Weekly payouts guaranteed.' },
      { title: 'Flexible Hours', desc: "Drive whenever you want. You're in control of your schedule. No minimum hours." },
      { title: 'Meet People', desc: 'Connect with travelers from around the world and be part of our growing community.' },
      { title: 'Use Your Car', desc: 'Make money with your existing vehicle. Mercedes, BMW or similar premium cars.' },
    ],
    stats: { drivers: '2,500+', driversLabel: 'Active Drivers', cities: '120+', citiesLabel: 'Cities', earnings: '3,200', earningsLabel: 'Avg Monthly', rating: '4.9/5', ratingLabel: 'Driver Rating' },
    formTitle: 'Apply to Drive',
    formSub: "Fill out the form below and we'll get back to you within 24 hours",
    fullName: 'Full Name', email: 'Email', phone: 'Phone Number', city: 'City',
    carModel: 'Car Model', carYear: 'Car Year', license: "Driver's License Number",
    message: 'Additional Information',
    messagePlaceholder: 'Tell us about your experience as a driver...',
    submit: 'Submit Application', sending: 'Sending...',
    successTitle: 'Application sent!', successDesc: 'We will review your application and contact you soon.',
    errorTitle: 'Error', errorDesc: 'An error occurred while sending your application.',
    requirements: 'Requirements',
    reqItems: ['Valid driver\'s license (3+ years)', 'Premium vehicle (Mercedes, BMW or similar)', 'Clean driving record', 'Professional appearance', 'Smartphone with data plan'],
  },
  fr: {
    seoTitle: 'Devenir Chauffeur - Rejoignez Zont | Chauffeur Professionnel',
    seoDesc: 'Rejoignez Zont en tant que chauffeur professionnel. Horaires flexibles, tarifs competitifs.',
    heroTitle: 'Devenir Chauffeur',
    heroAccent: 'chez Zont',
    heroSub: 'Rejoignez des milliers de chauffeurs professionnels qui gagnent a leur propre rythme',
    badge: 'Recrutement en cours',
    whyTitle: 'Pourquoi Conduire avec Zont ?',
    benefits: [
      { title: 'Gagnez Plus', desc: 'Fixez vos propres horaires et gagnez des tarifs competitifs pour chaque course. Paiements hebdomadaires garantis.' },
      { title: 'Horaires Flexibles', desc: 'Conduisez quand vous voulez. Vous controlez votre planning. Pas de minimum d\'heures.' },
      { title: 'Rencontrez des Gens', desc: 'Connectez avec des voyageurs du monde entier et faites partie de notre communaute.' },
      { title: 'Utilisez Votre Voiture', desc: 'Gagnez de l\'argent avec votre vehicule existant. Mercedes, BMW ou similaire.' },
    ],
    stats: { drivers: '2 500+', driversLabel: 'Chauffeurs Actifs', cities: '120+', citiesLabel: 'Villes', earnings: '3 200', earningsLabel: 'Moy. Mensuel', rating: '4.9/5', ratingLabel: 'Note Chauffeur' },
    formTitle: 'Postuler pour Conduire',
    formSub: 'Remplissez le formulaire ci-dessous et nous vous recontacterons sous 24 heures',
    fullName: 'Nom Complet', email: 'Email', phone: 'Telephone', city: 'Ville',
    carModel: 'Modele de Voiture', carYear: 'Annee du Vehicule', license: 'Numero de Permis',
    message: 'Informations Complementaires',
    messagePlaceholder: 'Parlez-nous de votre experience en tant que chauffeur...',
    submit: 'Envoyer la Candidature', sending: 'Envoi en cours...',
    successTitle: 'Candidature envoyee !', successDesc: 'Nous examinerons votre candidature et vous contacterons bientot.',
    errorTitle: 'Erreur', errorDesc: 'Une erreur est survenue lors de l\'envoi de votre demande.',
    requirements: 'Conditions requises',
    reqItems: ['Permis de conduire valide (3+ ans)', 'Vehicule premium (Mercedes, BMW ou similaire)', 'Casier de conduite vierge', 'Presentation professionnelle', 'Smartphone avec forfait data'],
  },
  ru: {
    seoTitle: 'Стать Водителем - Присоединяйтесь к Zont',
    seoDesc: 'Присоединяйтесь к Zont как профессиональный водитель. Гибкий график, конкурентные тарифы.',
    heroTitle: 'Стать Водителем',
    heroAccent: 'в Zont',
    heroSub: 'Присоединяйтесь к тысячам профессиональных водителей, зарабатывающих по своему графику',
    badge: 'Набор открыт',
    whyTitle: 'Почему Работать с Zont?',
    benefits: [
      { title: 'Зарабатывайте Больше', desc: 'Устанавливайте свой график и получайте конкурентные тарифы. Еженедельные выплаты.' },
      { title: 'Гибкий График', desc: 'Работайте когда хотите. Вы контролируете свое расписание. Без минимума часов.' },
      { title: 'Знакомьтесь с Людьми', desc: 'Общайтесь с путешественниками со всего мира.' },
      { title: 'Используйте Свой Автомобиль', desc: 'Зарабатывайте на своем автомобиле. Mercedes, BMW или аналогичные.' },
    ],
    stats: { drivers: '2 500+', driversLabel: 'Активных Водителей', cities: '120+', citiesLabel: 'Городов', earnings: '3 200', earningsLabel: 'Ср. Месячный', rating: '4.9/5', ratingLabel: 'Рейтинг' },
    formTitle: 'Подать Заявку',
    formSub: 'Заполните форму ниже, и мы свяжемся с вами в течение 24 часов',
    fullName: 'Полное Имя', email: 'Email', phone: 'Телефон', city: 'Город',
    carModel: 'Модель Авто', carYear: 'Год Авто', license: 'Номер Водительского Удостоверения',
    message: 'Дополнительная Информация',
    messagePlaceholder: 'Расскажите о своем опыте вождения...',
    submit: 'Отправить Заявку', sending: 'Отправка...',
    successTitle: 'Заявка отправлена!', successDesc: 'Мы рассмотрим вашу заявку и свяжемся с вами.',
    errorTitle: 'Ошибка', errorDesc: 'Произошла ошибка при отправке заявки.',
    requirements: 'Требования',
    reqItems: ['Действующие водительские права (3+ лет)', 'Премиум автомобиль (Mercedes, BMW)', 'Чистая история вождения', 'Профессиональный вид', 'Смартфон с интернетом'],
  },
  hy: {
    seoTitle: 'Դառնալ Վարորդ - Միացեք Zont-ին | Պրոֆdelays Վdelays',
    seoDesc: 'Միdelays Zont- delays delays delays delays delays delays delays delays delays.',
    heroTitle: 'Դdelays Վdelays',
    heroAccent: 'Zont-ի Հdelays',
    heroSub: 'Միdelays delays delays delays delays delays delays delays delays delays delays delays',
    badge: 'Հdelays delays delays delays',
    whyTitle: 'Delays delays delays delays Zont-delays Delays?',
    benefits: [
      { title: 'Վdelays delays delays', desc: 'Delays delays delays delays delays delays delays delays delays delays delays delays.' },
      { title: 'Delays delays delays delays', desc: 'Delays delays delays delays delays delays delays delays delays delays delays.' },
      { title: 'Delays delays delays delays delays', desc: 'Delays delays delays delays delays delays delays delays delays.' },
      { title: 'Delays delays delays delays delays delays delays', desc: 'Delays delays delays delays delays delays delays delays.' },
    ],
    stats: { drivers: '2 500+', driversLabel: 'Delays delays delays delays', cities: '120+', citiesLabel: 'Delays delays', earnings: '3 200', earningsLabel: 'Delays delays delays', rating: '4.9/5', ratingLabel: 'Delays delays delays' },
    formTitle: 'Delays Delays delays delays delays',
    formSub: 'Delays delays delays delays 24 delays delays delays delays delays',
    fullName: 'Delays delays delays delays', email: 'Email', phone: 'Delays delays delays', city: 'Delays delays',
    carModel: 'Delays delays delays delays delays', carYear: 'Delays delays delays delays delays', license: 'Delays delays delays delays delays delays',
    message: 'Delays delays delays delays delays delays',
    messagePlaceholder: 'Delays delays delays delays delays delays delays...',
    submit: 'Delays delays delays delays delays', sending: 'Delays delays delays...',
    successTitle: 'Delays delays delays delays!', successDesc: 'Delays delays delays delays delays delays delays delays.',
    errorTitle: 'Delays delays', errorDesc: 'Delays delays delays delays delays delays delays.',
    requirements: 'Delays delays delays delays',
    reqItems: ['Delays delays delays delays (3+ delays)', 'Delays delays delays (Mercedes, BMW)', 'Delays delays delays delays delays', 'Delays delays delays delays delays delays', 'Delays delays delays delays delays delays delays'],
  },
};

const BecomeDriver = () => {
  const { language } = useLanguage();
  const c = content[language] || content.en;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', city: '', carModel: '', carYear: '', licenseNumber: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast({ title: c.successTitle, description: c.successDesc });
      setFormData({ fullName: '', email: '', phone: '', city: '', carModel: '', carYear: '', licenseNumber: '', message: '' });
    } catch {
      toast({ title: c.errorTitle, description: c.errorDesc, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const benefitIcons = [
    <DollarSign className="w-6 h-6" />,
    <Clock className="w-6 h-6" />,
    <Users className="w-6 h-6" />,
    <Car className="w-6 h-6" />,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="become-driver-page">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://zont.cab/become-driver" />
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2ecc71]/10 via-transparent to-transparent" />
          <div className="relative z-10 px-4 pt-12 pb-16 md:pt-20 md:pb-24">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center bg-[#2ecc71]/20 text-[#2ecc71] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Star className="w-4 h-4 fill-current mr-1.5" />
                {c.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight" data-testid="driver-h1">
                {c.heroTitle} <span className="text-[#2ecc71]">{c.heroAccent}</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">{c.heroSub}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: c.stats.drivers, label: c.stats.driversLabel },
                { val: c.stats.cities, label: c.stats.citiesLabel },
                { val: `${c.stats.earnings}\u20AC`, label: c.stats.earningsLabel },
                { val: c.stats.rating, label: c.stats.ratingLabel },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-center">
                  <div className="text-2xl font-bold text-[#2ecc71]">{s.val}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">{c.whyTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.benefits.map((b, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-[#2ecc71]/20 text-[#2ecc71] flex items-center justify-center mb-4">
                    {benefitIcons[i]}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-400">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form + Requirements */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">{c.formTitle}</h2>
                  <p className="text-gray-400 text-sm mb-6">{c.formSub}</p>
                  <form onSubmit={handleSubmit} className="space-y-4" data-testid="driver-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'fullName', label: c.fullName, type: 'text', tid: 'driver-fullname' },
                        { name: 'email', label: c.email, type: 'email', tid: 'driver-email' },
                        { name: 'phone', label: c.phone, type: 'tel', tid: 'driver-phone' },
                        { name: 'city', label: c.city, type: 'text', tid: 'driver-city' },
                        { name: 'carModel', label: c.carModel, type: 'text', tid: 'driver-carmodel' },
                        { name: 'carYear', label: c.carYear, type: 'number', tid: 'driver-caryear', min: 2010, max: 2026 },
                      ].map((f) => (
                        <div key={f.name}>
                          <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
                          <input
                            type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange} required
                            min={f.min} max={f.max}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                            data-testid={f.tid}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">{c.license}</label>
                      <input
                        type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                        data-testid="driver-license"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">{c.message}</label>
                      <textarea
                        name="message" value={formData.message} onChange={handleChange} rows="3"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                        placeholder={c.messagePlaceholder} data-testid="driver-message"
                      />
                    </div>
                    <button
                      type="submit" disabled={loading}
                      className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold text-base hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 flex items-center justify-center gap-2"
                      data-testid="driver-submit"
                    >
                      {loading ? c.sending : c.submit}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 sticky top-24">
                  <h3 className="text-xl font-bold text-white mb-6">{c.requirements}</h3>
                  <ul className="space-y-4">
                    {c.reqItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#2ecc71] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeDriver;
