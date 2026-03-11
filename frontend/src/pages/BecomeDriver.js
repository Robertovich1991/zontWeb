import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Car, Clock, DollarSign, Users } from 'lucide-react';

const content = {
  en: {
    seoTitle: 'Become a Driver - Join Zont | Professional Chauffeur',
    seoDesc: 'Join Zont as a professional driver. Flexible hours, competitive rates, work with your own car. Apply now to start earning with Zont airport transfer service.',
    heroTitle: 'Become a Driver',
    heroSub: 'Join thousands of drivers earning money on their own schedule with Zont',
    whyTitle: 'Why Drive with Zont?',
    benefits: [
      { title: 'Earn More', desc: 'Set your own schedule and earn competitive rates for every ride.' },
      { title: 'Flexible Hours', desc: "Drive whenever you want. You're in control of your schedule." },
      { title: 'Meet People', desc: 'Connect with riders from around the world and be part of our community.' },
      { title: 'Use Your Car', desc: 'Make money with your existing vehicle. No special requirements.' },
    ],
    formTitle: 'Apply to Drive',
    formSub: "Fill out the form below and we'll get back to you within 24 hours",
    fullName: 'Full Name *', email: 'Email *', phone: 'Phone Number *', city: 'City *',
    carModel: 'Car Model *', carYear: 'Car Year *', license: "Driver's License Number *",
    message: 'Additional Information (Optional)',
    messagePlaceholder: 'Tell us why you want to drive with Zont...',
    submit: 'Submit Application', sending: 'Sending...',
    successTitle: 'Application sent!', successDesc: 'We will review your application and contact you soon.',
    errorTitle: 'Error', errorDesc: 'An error occurred while sending your application.',
  },
  fr: {
    seoTitle: 'Devenir Chauffeur - Rejoignez Zont | Chauffeur Professionnel',
    seoDesc: 'Rejoignez Zont en tant que chauffeur professionnel. Horaires flexibles, tarifs competitifs, conduisez votre propre vehicule. Postulez maintenant.',
    heroTitle: 'Devenir Chauffeur',
    heroSub: 'Rejoignez des milliers de chauffeurs qui gagnent de l\'argent a leur propre rythme avec Zont',
    whyTitle: 'Pourquoi Conduire avec Zont ?',
    benefits: [
      { title: 'Gagnez Plus', desc: 'Fixez vos propres horaires et gagnez des tarifs competitifs pour chaque course.' },
      { title: 'Horaires Flexibles', desc: 'Conduisez quand vous voulez. Vous controlez votre planning.' },
      { title: 'Rencontrez des Gens', desc: 'Connectez avec des voyageurs du monde entier et faites partie de notre communaute.' },
      { title: 'Utilisez Votre Voiture', desc: 'Gagnez de l\'argent avec votre vehicule existant. Pas d\'exigences speciales.' },
    ],
    formTitle: 'Postuler pour Conduire',
    formSub: 'Remplissez le formulaire ci-dessous et nous vous recontacterons sous 24 heures',
    fullName: 'Nom Complet *', email: 'Email *', phone: 'Telephone *', city: 'Ville *',
    carModel: 'Modele de Voiture *', carYear: 'Annee du Vehicule *', license: 'Numero de Permis *',
    message: 'Informations Complementaires (Optionnel)',
    messagePlaceholder: 'Dites-nous pourquoi vous souhaitez conduire avec Zont...',
    submit: 'Envoyer la Candidature', sending: 'Envoi en cours...',
    successTitle: 'Candidature envoyee !', successDesc: 'Nous examinerons votre candidature et vous contacterons bientot.',
    errorTitle: 'Erreur', errorDesc: 'Une erreur est survenue lors de l\'envoi de votre demande.',
  },
  ru: {
    seoTitle: 'Стать Водителем - Присоединяйтесь к Zont | Профессиональный Шофер',
    seoDesc: 'Присоединяйтесь к Zont как профессиональный водитель. Гибкий график, конкурентные тарифы, работайте на своем автомобиле. Подайте заявку сейчас.',
    heroTitle: 'Стать Водителем',
    heroSub: 'Присоединяйтесь к тысячам водителей, зарабатывающих по своему графику с Zont',
    whyTitle: 'Почему Работать с Zont?',
    benefits: [
      { title: 'Зарабатывайте Больше', desc: 'Устанавливайте свой график и получайте конкурентные тарифы за каждую поездку.' },
      { title: 'Гибкий График', desc: 'Работайте когда хотите. Вы контролируете свое расписание.' },
      { title: 'Знакомьтесь с Людьми', desc: 'Общайтесь с путешественниками со всего мира и станьте частью сообщества.' },
      { title: 'Используйте Свой Автомобиль', desc: 'Зарабатывайте на своем автомобиле. Без специальных требований.' },
    ],
    formTitle: 'Подать Заявку',
    formSub: 'Заполните форму ниже, и мы свяжемся с вами в течение 24 часов',
    fullName: 'Полное Имя *', email: 'Email *', phone: 'Телефон *', city: 'Город *',
    carModel: 'Модель Авто *', carYear: 'Год Авто *', license: 'Номер Водительского Удостоверения *',
    message: 'Дополнительная Информация (Необязательно)',
    messagePlaceholder: 'Расскажите, почему хотите работать с Zont...',
    submit: 'Отправить Заявку', sending: 'Отправка...',
    successTitle: 'Заявка отправлена!', successDesc: 'Мы рассмотрим вашу заявку и свяжемся с вами в ближайшее время.',
    errorTitle: 'Ошибка', errorDesc: 'Произошла ошибка при отправке заявки.',
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

  const icons = [
    <DollarSign className="w-12 h-12 text-[#2ecc71]" />,
    <Clock className="w-12 h-12 text-[#3498db]" />,
    <Users className="w-12 h-12 text-[#9b59b6]" />,
    <Car className="w-12 h-12 text-[#e74c3c]" />,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="become-driver-page">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://zont.cab/become-driver" />
      <Header />

      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="driver-h1">{c.heroTitle}</h1>
          <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto">{c.heroSub}</p>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{c.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {c.benefits.map((b, i) => (
              <div key={i} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">{icons[i]}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                <p className="text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{c.formTitle}</h2>
            <p className="text-gray-600 mb-8 text-center">{c.formSub}</p>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="driver-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.fullName}</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="driver-fullname" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.email}</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="driver-email" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.phone}</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="driver-phone" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.city}</label><input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="driver-city" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.carModel}</label><input type="text" name="carModel" value={formData.carModel} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="driver-carmodel" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.carYear}</label><input type="number" name="carYear" value={formData.carYear} onChange={handleChange} required min="2010" max="2026" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="driver-caryear" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.license}</label><input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="driver-license" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">{c.message}</label><textarea name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" placeholder={c.messagePlaceholder} data-testid="driver-message" /></div>
              <button type="submit" disabled={loading} className="w-full bg-[#2ecc71] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#27ae60] transition-colors disabled:bg-gray-400" data-testid="driver-submit">{loading ? c.sending : c.submit}</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeDriver;
