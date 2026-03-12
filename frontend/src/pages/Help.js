import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Phone, MapPin, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const content = {
  en: {
    seoTitle: 'Help & Support - Contact Zont | FAQ',
    seoDesc: 'Need help? Contact Zont support 24/7. Find answers to common questions about bookings, payments, cancellations. Call, email or live chat.',
    heroTitle: 'Help & Support',
    heroSub: 'We\'re here to help you 24/7. Find answers below or contact our team.',
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      { q: 'How do I book a ride?', a: 'Download the Zont app, create an account, enter your pickup and drop-off locations, and confirm your booking. You\'ll receive driver details 3 hours before your trip.' },
      { q: 'What payment methods do you accept?', a: 'We accept credit cards, debit cards, and mobile payment options through our app. Payment is processed securely at the end of your ride.' },
      { q: 'Can I cancel my booking?', a: 'Yes, you can cancel your booking through the app. Cancellation fees may apply depending on how close to the pickup time you cancel.' },
      { q: 'How do I become a driver?', a: 'Visit our "Become a Driver" page and fill out the application form. We\'ll review your application and contact you within 24 hours.' },
      { q: 'Is Zont available in my city?', a: 'Zont operates in 120+ cities worldwide. Check our "Countries" page or the app to see if we\'re available in your location.' },
      { q: 'What if I have an issue during my ride?', a: 'Contact our 24/7 support team through the app or call our emergency hotline. We\'re always here to help.' },
    ],
    contactTitle: 'Contact Us',
    contactSub: 'Can\'t find an answer? Reach out to our team.',
    contactInfo: [
      { type: 'email', label: 'Email Support', value: 'support@zont.cab' },
      { type: 'phone', label: 'Phone Support', value: '+33 1 23 45 67 89' },
      { type: 'address', label: 'Office', value: 'Paris, France' },
    ],
    formName: 'Your Name *', formEmail: 'Email *', formSubject: 'Subject *',
    formMessage: 'Your Message *', formPlaceholder: 'Describe your question or issue...',
    submit: 'Send Message', sending: 'Sending...',
    successTitle: 'Message sent!', successDesc: 'We will respond as soon as possible.',
    errorTitle: 'Error', errorDesc: 'An error occurred while sending.',
  },
  fr: {
    seoTitle: 'Aide & Support - Contactez Zont | FAQ',
    seoDesc: 'Besoin d\'aide ? Contactez le support Zont 24h/24. Trouvez les reponses aux questions frequentes sur les reservations, paiements et annulations.',
    heroTitle: 'Aide & Support',
    heroSub: 'Nous sommes la pour vous aider 24h/24. Trouvez des reponses ci-dessous ou contactez notre equipe.',
    faqTitle: 'Questions Frequentes',
    faqs: [
      { q: 'Comment reserver une course ?', a: 'Telechargez l\'appli Zont, creez un compte, entrez vos lieux de depart et d\'arrivee, et confirmez votre reservation. Vous recevrez les details du chauffeur 3 heures avant votre trajet.' },
      { q: 'Quels modes de paiement acceptez-vous ?', a: 'Nous acceptons les cartes de credit, cartes de debit et les paiements mobiles via notre application. Le paiement est traite de maniere securisee a la fin de votre course.' },
      { q: 'Puis-je annuler ma reservation ?', a: 'Oui, vous pouvez annuler votre reservation via l\'application. Des frais d\'annulation peuvent s\'appliquer selon la proximite de l\'heure de prise en charge.' },
      { q: 'Comment devenir chauffeur ?', a: 'Visitez notre page "Devenir Chauffeur" et remplissez le formulaire de candidature. Nous examinerons votre dossier et vous contacterons sous 24 heures.' },
      { q: 'Zont est-il disponible dans ma ville ?', a: 'Zont opere dans plus de 120 villes. Consultez notre page "Destinations" ou l\'application pour verifier la disponibilite.' },
      { q: 'Que faire en cas de probleme pendant la course ?', a: 'Contactez notre support 24/7 via l\'application ou appelez notre ligne d\'urgence. Nous sommes toujours la pour vous aider.' },
    ],
    contactTitle: 'Contactez-Nous',
    contactSub: 'Vous ne trouvez pas de reponse ? Contactez notre equipe.',
    contactInfo: [
      { type: 'email', label: 'Support Email', value: 'support@zont.cab' },
      { type: 'phone', label: 'Support Telephone', value: '+33 1 23 45 67 89' },
      { type: 'address', label: 'Bureau', value: 'Paris, France' },
    ],
    formName: 'Votre Nom *', formEmail: 'Email *', formSubject: 'Sujet *',
    formMessage: 'Votre Message *', formPlaceholder: 'Decrivez votre question ou probleme...',
    submit: 'Envoyer le Message', sending: 'Envoi en cours...',
    successTitle: 'Message envoye !', successDesc: 'Nous vous repondrons dans les plus brefs delais.',
    errorTitle: 'Erreur', errorDesc: 'Une erreur est survenue lors de l\'envoi.',
  },
  ru: {
    seoTitle: 'Помощь и Поддержка - Свяжитесь с Zont | FAQ',
    seoDesc: 'Нужна помощь? Свяжитесь с поддержкой Zont 24/7. Ответы на частые вопросы о бронированиях, оплате и отменах.',
    heroTitle: 'Помощь и Поддержка',
    heroSub: 'Мы здесь, чтобы помочь вам 24/7. Найдите ответы ниже или свяжитесь с нашей командой.',
    faqTitle: 'Часто Задаваемые Вопросы',
    faqs: [
      { q: 'Как забронировать поездку?', a: 'Скачайте приложение Zont, создайте аккаунт, введите места отправления и прибытия и подтвердите бронирование. Вы получите данные водителя за 3 часа до поездки.' },
      { q: 'Какие способы оплаты вы принимаете?', a: 'Мы принимаем кредитные карты, дебетовые карты и мобильные платежи через приложение. Оплата обрабатывается безопасно после поездки.' },
      { q: 'Могу ли я отменить бронирование?', a: 'Да, вы можете отменить бронирование через приложение. Могут применяться штрафы за отмену в зависимости от времени до подачи.' },
      { q: 'Как стать водителем?', a: 'Посетите страницу "Стать Водителем" и заполните форму заявки. Мы рассмотрим вашу заявку и свяжемся с вами в течение 24 часов.' },
      { q: 'Работает ли Zont в моем городе?', a: 'Zont работает в 120+ городах. Проверьте страницу "Направления" или приложение для уточнения доступности.' },
      { q: 'Что делать при проблеме во время поездки?', a: 'Свяжитесь с нашей поддержкой 24/7 через приложение или позвоните на горячую линию. Мы всегда готовы помочь.' },
    ],
    contactTitle: 'Свяжитесь с Нами',
    contactSub: 'Не нашли ответ? Обратитесь к нашей команде.',
    contactInfo: [
      { type: 'email', label: 'Email Поддержки', value: 'support@zont.cab' },
      { type: 'phone', label: 'Телефон', value: '+33 1 23 45 67 89' },
      { type: 'address', label: 'Офис', value: 'Париж, Франция' },
    ],
    formName: 'Ваше Имя *', formEmail: 'Email *', formSubject: 'Тема *',
    formMessage: 'Ваше Сообщение *', formPlaceholder: 'Опишите ваш вопрос или проблему...',
    submit: 'Отправить Сообщение', sending: 'Отправка...',
    successTitle: 'Сообщение отправлено!', successDesc: 'Мы ответим как можно скорее.',
    errorTitle: 'Ошибка', errorDesc: 'Произошла ошибка при отправке.',
  },
  hy: {
    seoTitle: 'Օգնություն և Աջակցություն - Կապվեք Zont-ի Հետ | FAQ',
    seoDesc: 'Օգնություն է պետք՞ Կապվեք Zont-ի աջակցության 24/7: Պատասխաններ ամրագրումների, վճարումների և չեղարկումների մասին:',
    heroTitle: 'Օգնություն և Աջակցություն',
    heroSub: 'Մենք այստեղ ենք ձեզ օգնելու 24/7: Գտեք պատասխաններ ստորև կամ կապվեք մեր թիմի հետ:',
    faqTitle: 'Հաճախ Տրվող Հարցեր',
    faqs: [
      { q: 'Ինչպես ամրագրել ուղևորություն՞', a: 'Ներբեռնեք Zont հավելվածը, ստեղծեք հաշիվ, մուտքագրեք վերցնելու և իջնելու վայրերը և հաստատեք: Վարորդի տվյալները կստանաք 3 ժամ առաջ:' },
      { q: 'Ինչ վճարման եղանակներ եք ընդունում՞', a: 'Մենք ընդունում ենք վարկային քարտեր, դեբիտ քարտեր և բջջային վճարման մեթոդներ: Վճարումը անվտանգ մշակվում է:' },
      { q: 'Կարող՞ եմ չեղարկել ամրագրումը՞', a: 'Այո, դուք կարող եք չեղարկել հավելվածի միջոցով: Չեղարկման վճարներ կարող են կիրառվել:' },
      { q: 'Ինչպես դառնալ վարորդ՞', a: 'Այցելեք Մեր "Դառնալ Վարորդ" էջը և լրացրեք հայտադիմումի ձևը: Մենք կքննարկենք և կկապվենք 24 ժամվա ընթացքում:' },
      { q: 'Zont-ը հասանելի՞ է իմ քաղաքում՞', a: 'Zont-ը գործում է 120+ քաղաքներում: Ստուգեք Մեր "Երկրներ" էջը կամ հավելվածը:' },
      { q: 'Ինչ անել ուղևորության ժամանակ խնդրի դեպքում՞', a: 'Կապվեք մեր 24/7 աջակցության թիմին հավելվածի միջոցով կամ զանգեք թեժ գծին: Մենք միշտ այստեղ ենք օգնելու:' },
    ],
    contactTitle: 'Կապվեք Մեզ',
    contactSub: 'Պատասխան չգտաք՞ Կապվեք մեր թիմի հետ:',
    contactInfo: [
      { type: 'email', label: 'Email Աջակցություն', value: 'support@zont.cab' },
      { type: 'phone', label: 'Հեռախոս', value: '+33 1 23 45 67 89' },
      { type: 'address', label: 'Գրասենյակ', value: 'Փարիզ, Ֆրանսիա' },
    ],
    formName: 'Ձեր Անունը *', formEmail: 'Email *', formSubject: 'Թեմա *',
    formMessage: 'Ձեր Հաղորդագրությունը *', formPlaceholder: 'Նկարագրեք ձեր հարցը կամ խնդիրը...',
    submit: 'Ուղարկել Հաղորդագրությունը', sending: 'Ուղարկվում է...',
    successTitle: 'Հաղորդագրությունը ուղարկվեց!', successDesc: 'Մենք կպատասխանենք հնարավորինս շուտ:',
    errorTitle: 'Սխալ', errorDesc: 'Սխալ տեղի ունեցավ ուղարկելիս:',
  },
};

const Help = () => {
  const { language } = useLanguage();
  const c = content[language] || content.en;
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast.success(c.successTitle);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error(c.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex flex-col" data-testid="help-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical="https://zont.cab/help"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": c.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": { "@type": "Answer", "text": faq.a }
          }))
        }}
      />
      <Header />

      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="help-h1">{c.heroTitle}</h1>
          <p className="text-lg max-w-2xl mx-auto">{c.heroSub}</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{c.faqTitle}</h2>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden" data-testid={`faq-${i}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">{c.contactTitle}</h2>
          <p className="text-gray-600 text-center mb-10">{c.contactSub}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {c.contactInfo.map((info, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm">
                {info.type === 'email' && <Mail className="w-8 h-8 text-[#2ecc71] mx-auto mb-3" />}
                {info.type === 'phone' && <Phone className="w-8 h-8 text-[#2ecc71] mx-auto mb-3" />}
                {info.type === 'address' && <MapPin className="w-8 h-8 text-[#2ecc71] mx-auto mb-3" />}
                <h3 className="font-semibold text-gray-900 mb-1">{info.label}</h3>
                <p className="text-gray-600 text-sm">{info.value}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="help-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{c.formName}</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="help-name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{c.formEmail}</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="help-email" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{c.formSubject}</label><input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="help-subject" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{c.formMessage}</label><textarea name="message" value={formData.message} onChange={handleChange} required rows="5" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" placeholder={c.formPlaceholder} data-testid="help-message" /></div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2" data-testid="help-submit">
                <Send className="w-4 h-4" />
                {loading ? c.sending : c.submit}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
