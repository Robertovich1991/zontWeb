import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { Car, Clock, DollarSign, Users, CheckCircle, Star, ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react';

const t = {
  en: {
    seoTitle: 'Sign Up to Drive - Join Zont | Register Your Company',
    seoDesc: 'Register your transport company on Zont. Manage your fleet, drivers, and earn more with airport transfers.',
    heroTitle: 'Register Your Company',
    heroAccent: 'on Zont',
    heroSub: 'Join our network of professional transport companies and grow your business',
    badge: 'Now Recruiting',
    whyTitle: 'Why Partner with Zont?',
    benefits: [
      { title: 'Earn More', desc: 'Access thousands of airport transfer requests. Competitive rates and weekly payouts guaranteed.' },
      { title: 'Flexible Schedule', desc: 'Accept rides when you want. You control your fleet availability. No minimum commitments.' },
      { title: 'Growing Network', desc: 'Connect with travelers from 120+ cities worldwide. Expanding customer base.' },
      { title: 'Easy Management', desc: 'Register your vehicles and drivers. Simple dashboard to manage everything.' },
    ],
    stats: { drivers: '2,500+', driversLabel: 'Active Drivers', cities: '120+', citiesLabel: 'Cities', earnings: '3,200', earningsLabel: 'Avg Monthly', rating: '4.9/5', ratingLabel: 'Rating' },
    formTitle: 'Company Registration',
    formSub: 'Create your company account to start managing your fleet',
    firstName: 'First Name', lastName: 'Last Name',
    companyName: 'Company Name', companyAddress: 'Company Address',
    email: 'Email Address', phone: 'Mobile Phone',
    password: 'Choose Password', confirmPassword: 'Confirm Password',
    terms: 'I agree with', termsLink: 'Terms of Services', and: 'and', privacyLink: 'Privacy Policy',
    submit: 'Sign Up', sending: 'Registering...',
    alreadyAccount: 'Already have an account?', signIn: 'Sign in',
    successTitle: 'Registration successful!', successDesc: 'Your company account has been created. You will be contacted shortly.',
    errorEmail: 'This email is already registered.', errorMatch: 'Passwords do not match.',
    errorTerms: 'You must accept the terms and conditions.',
    requirements: 'What You Get',
    reqItems: ['Company fleet management dashboard', 'Register unlimited vehicles', 'Add and manage your drivers', 'Access to airport transfer requests', 'Weekly automated payouts'],
  },
  fr: {
    seoTitle: 'Inscription Societe - Rejoignez Zont | Enregistrez Votre Entreprise',
    seoDesc: 'Enregistrez votre societe de transport sur Zont. Gerez votre flotte, vos chauffeurs et gagnez plus.',
    heroTitle: 'Inscrivez Votre Societe',
    heroAccent: 'sur Zont',
    heroSub: 'Rejoignez notre reseau de societes de transport professionnelles et developpez votre activite',
    badge: 'Recrutement en cours',
    whyTitle: 'Pourquoi Devenir Partenaire Zont ?',
    benefits: [
      { title: 'Gagnez Plus', desc: 'Acces a des milliers de demandes de transfert aeroport. Tarifs competitifs, paiements hebdomadaires.' },
      { title: 'Planning Flexible', desc: 'Acceptez les courses quand vous voulez. Vous controlez la disponibilite de votre flotte.' },
      { title: 'Reseau en Croissance', desc: 'Connectez avec des voyageurs de 120+ villes. Base de clients en expansion.' },
      { title: 'Gestion Facile', desc: 'Enregistrez vos vehicules et chauffeurs. Tableau de bord simple pour tout gerer.' },
    ],
    stats: { drivers: '2 500+', driversLabel: 'Chauffeurs Actifs', cities: '120+', citiesLabel: 'Villes', earnings: '3 200', earningsLabel: 'Moy. Mensuel', rating: '4.9/5', ratingLabel: 'Note' },
    formTitle: 'Inscription Societe',
    formSub: 'Creez votre compte societe pour commencer a gerer votre flotte',
    firstName: 'Prenom', lastName: 'Nom',
    companyName: 'Nom de la Societe', companyAddress: 'Adresse de la Societe',
    email: 'Adresse Email', phone: 'Telephone Mobile',
    password: 'Choisir un Mot de Passe', confirmPassword: 'Confirmer le Mot de Passe',
    terms: 'J\'accepte les', termsLink: 'Conditions Generales', and: 'et la', privacyLink: 'Politique de Confidentialite',
    submit: 'S\'inscrire', sending: 'Inscription en cours...',
    alreadyAccount: 'Vous avez deja un compte ?', signIn: 'Se connecter',
    successTitle: 'Inscription reussie !', successDesc: 'Votre compte societe a ete cree. Vous serez contacte prochainement.',
    errorEmail: 'Cet email est deja enregistre.', errorMatch: 'Les mots de passe ne correspondent pas.',
    errorTerms: 'Vous devez accepter les conditions generales.',
    requirements: 'Ce que vous obtenez',
    reqItems: ['Tableau de bord de gestion de flotte', 'Enregistrement illimite de vehicules', 'Ajout et gestion de vos chauffeurs', 'Acces aux demandes de transfert aeroport', 'Paiements hebdomadaires automatises'],
  },
  ru: {
    seoTitle: 'Регистрация Компании - Присоединяйтесь к Zont',
    seoDesc: 'Зарегистрируйте транспортную компанию на Zont. Управляйте автопарком и водителями.',
    heroTitle: 'Зарегистрируйте Компанию',
    heroAccent: 'на Zont',
    heroSub: 'Присоединяйтесь к сети профессиональных транспортных компаний',
    badge: 'Набор открыт',
    whyTitle: 'Почему Стать Партнером Zont?',
    benefits: [
      { title: 'Зарабатывайте Больше', desc: 'Доступ к тысячам запросов на трансфер. Конкурентные тарифы, еженедельные выплаты.' },
      { title: 'Гибкий График', desc: 'Принимайте заказы когда хотите. Контролируйте доступность автопарка.' },
      { title: 'Растущая Сеть', desc: 'Связь с путешественниками из 120+ городов мира.' },
      { title: 'Простое Управление', desc: 'Регистрируйте автомобили и водителей. Простая панель управления.' },
    ],
    stats: { drivers: '2 500+', driversLabel: 'Водителей', cities: '120+', citiesLabel: 'Городов', earnings: '3 200', earningsLabel: 'Ср. Месячный', rating: '4.9/5', ratingLabel: 'Рейтинг' },
    formTitle: 'Регистрация Компании',
    formSub: 'Создайте аккаунт компании для управления автопарком',
    firstName: 'Имя', lastName: 'Фамилия',
    companyName: 'Название Компании', companyAddress: 'Адрес Компании',
    email: 'Email', phone: 'Телефон',
    password: 'Придумайте Пароль', confirmPassword: 'Подтвердите Пароль',
    terms: 'Я принимаю', termsLink: 'Условия Использования', and: 'и', privacyLink: 'Политику Конфиденциальности',
    submit: 'Зарегистрироваться', sending: 'Регистрация...',
    alreadyAccount: 'Уже есть аккаунт?', signIn: 'Войти',
    successTitle: 'Регистрация успешна!', successDesc: 'Аккаунт компании создан. Мы свяжемся с вами.',
    errorEmail: 'Этот email уже зарегистрирован.', errorMatch: 'Пароли не совпадают.',
    errorTerms: 'Примите условия использования.',
    requirements: 'Что вы получите',
    reqItems: ['Панель управления автопарком', 'Неограниченная регистрация авто', 'Добавление и управление водителями', 'Доступ к заказам трансферов', 'Еженедельные автоматические выплаты'],
  },
  hy: {
    seoTitle: 'Ընdelays delays Zont-delays',
    seoDesc: 'Delays delays delays delays delays Zont.',
    heroTitle: 'Delays delays delays delays',
    heroAccent: 'Zont-delays',
    heroSub: 'Delays delays delays delays delays delays delays delays delays',
    badge: 'Delays delays delays',
    whyTitle: 'Delays delays delays Zont?',
    benefits: [
      { title: 'Delays delays delays', desc: 'Delays delays delays delays delays delays delays delays delays.' },
      { title: 'Delays delays delays', desc: 'Delays delays delays delays delays delays delays delays.' },
      { title: 'Delays delays delays', desc: 'Delays delays delays delays delays delays delays.' },
      { title: 'Delays delays delays', desc: 'Delays delays delays delays delays delays delays delays.' },
    ],
    stats: { drivers: '2 500+', driversLabel: 'Delays', cities: '120+', citiesLabel: 'Delays', earnings: '3 200', earningsLabel: 'Delays', rating: '4.9/5', ratingLabel: 'Delays' },
    formTitle: 'Delays delays delays delays',
    formSub: 'Delays delays delays delays delays delays delays delays delays',
    firstName: 'Delays', lastName: 'Delays',
    companyName: 'Delays delays delays', companyAddress: 'Delays delays delays',
    email: 'Email', phone: 'Delays',
    password: 'Delays delays delays', confirmPassword: 'Delays delays delays',
    terms: 'Delays delays', termsLink: 'Delays delays delays', and: 'delays', privacyLink: 'Delays delays delays',
    submit: 'Delays delays', sending: 'Delays...',
    alreadyAccount: 'Delays delays delays?', signIn: 'Delays',
    successTitle: 'Delays delays!', successDesc: 'Delays delays delays delays delays delays.',
    errorEmail: 'Delays delays delays.', errorMatch: 'Delays delays delays.',
    errorTerms: 'Delays delays delays.',
    requirements: 'Delays delays delays',
    reqItems: ['Delays delays delays delays', 'Delays delays delays delays', 'Delays delays delays delays', 'Delays delays delays delays', 'Delays delays delays delays'],
  },
};

const COUNTRY_CODES = [
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', name: 'France' },
  { code: '+374', flag: '\u{1F1E6}\u{1F1F2}', name: 'Armenia' },
  { code: '+7', flag: '\u{1F1F7}\u{1F1FA}', name: 'Russia' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'UK' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany' },
  { code: '+39', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italy' },
  { code: '+34', flag: '\u{1F1EA}\u{1F1F8}', name: 'Spain' },
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'USA' },
];

const BecomeDriver = () => {
  const { language } = useLanguage();
  const c = t[language] || t.en;
  const API = process.env.REACT_APP_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState('+33');
  const [form, setForm] = useState({
    firstName: '', lastName: '', companyName: '', companyAddress: '',
    email: '', phone: '', password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!accepted) { setError(c.errorTerms); return; }
    if (form.password !== form.confirmPassword) { setError(c.errorMatch); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/company/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName, last_name: form.lastName,
          company_name: form.companyName, company_address: form.companyAddress,
          email: form.email, phone: form.phone, phone_country: phoneCountry,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail === 'Email already registered' ? c.errorEmail : data.detail);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const benefitIcons = [
    <DollarSign className="w-6 h-6" />, <Clock className="w-6 h-6" />,
    <Users className="w-6 h-6" />, <Car className="w-6 h-6" />,
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

        {/* Registration Form + Sidebar */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-7 h-7 text-[#2ecc71]" />
                    <h2 className="text-2xl font-bold text-white">{c.formTitle}</h2>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">{c.formSub}</p>

                  {success ? (
                    <div className="text-center py-12" data-testid="registration-success">
                      <div className="w-16 h-16 bg-[#2ecc71]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-[#2ecc71]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{c.successTitle}</h3>
                      <p className="text-gray-400">{c.successDesc}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4" data-testid="company-register-form">
                      {/* First + Last Name */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                            {c.firstName} <span className="text-red-400">*</span>
                          </label>
                          <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required
                            placeholder={c.firstName}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                            data-testid="reg-firstname" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                            {c.lastName} <span className="text-red-400">*</span>
                          </label>
                          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required
                            placeholder={c.lastName}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                            data-testid="reg-lastname" />
                        </div>
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                          {c.companyName} <span className="text-red-400">*</span>
                        </label>
                        <input type="text" name="companyName" value={form.companyName} onChange={handleChange} required
                          placeholder={c.companyName}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                          data-testid="reg-company" />
                      </div>

                      {/* Company Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                          {c.companyAddress}
                        </label>
                        <input type="text" name="companyAddress" value={form.companyAddress} onChange={handleChange}
                          placeholder={c.companyAddress}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                          data-testid="reg-address" />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                          {c.email} <span className="text-red-400">*</span>
                        </label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required
                          placeholder={c.email}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                          data-testid="reg-email" />
                      </div>

                      {/* Phone with country code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                          {c.phone}
                        </label>
                        <div className="flex gap-2">
                          <select value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)}
                            className="w-28 px-2 py-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                            data-testid="reg-phone-country">
                            {COUNTRY_CODES.map((cc) => (
                              <option key={cc.code} value={cc.code} className="bg-[#1a2332]">
                                {cc.flag} {cc.code}
                              </option>
                            ))}
                          </select>
                          <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                            placeholder="01 23 45 67 89"
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                            data-testid="reg-phone" />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                          {c.password} <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required minLength={6}
                            placeholder={c.password}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent pr-12"
                            data-testid="reg-password" />
                          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 uppercase tracking-wide">
                          {c.confirmPassword} <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required minLength={6}
                            placeholder={c.confirmPassword}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent pr-12"
                            data-testid="reg-confirm-password" />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-3 pt-2">
                        <input type="checkbox" id="terms" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setError(''); }}
                          className="mt-1 w-4 h-4 rounded border-gray-500 text-[#2ecc71] focus:ring-[#2ecc71] bg-transparent"
                          data-testid="reg-terms" />
                        <label htmlFor="terms" className="text-sm text-gray-400">
                          {c.terms}{' '}
                          <a href="/terms" className="text-[#2ecc71] underline hover:text-[#27ae60]">{c.termsLink}</a>{' '}
                          {c.and}{' '}
                          <a href="/privacy" className="text-[#2ecc71] underline hover:text-[#27ae60]">{c.privacyLink}</a>
                        </label>
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg" data-testid="reg-error">
                          {error}
                        </div>
                      )}

                      {/* Submit */}
                      <button type="submit" disabled={loading}
                        className="w-full bg-[#2ecc71] text-white py-3.5 rounded-lg font-semibold text-base hover:bg-[#27ae60] transition-colors disabled:bg-gray-600 flex items-center justify-center gap-2"
                        data-testid="reg-submit">
                        {loading ? c.sending : c.submit}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                      </button>

                      {/* Sign in link */}
                      <p className="text-center text-gray-400 text-sm pt-2">
                        {c.alreadyAccount}{' '}
                        <a href="/sign-in" className="text-white font-semibold hover:text-[#2ecc71]">{c.signIn}</a>
                      </p>
                    </form>
                  )}
                </div>
              </div>

              {/* Sidebar */}
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
