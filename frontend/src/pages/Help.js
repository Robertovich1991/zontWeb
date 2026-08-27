import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { buildCanonicalUrl, buildHreflangCluster } from '@/utils/pageUrlMaps';
import { useLangRouting } from '@/utils/useLangRouting';
import { Mail, Phone, MapPin, Send, ChevronRight, Headphones, Clock, Shield, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const content = {
  en: {
    seoTitle: 'Help & Support - Contact Zont | 24/7 Customer Service | FAQ',
    seoDesc: 'Need help with your airport transfer? Contact Zont support 24/7. Find answers to common questions about bookings, payments, cancellations. Call, email or live chat.',
    heroTitle: 'Help & Support',
    heroSub: 'We\'re here to help you 24/7. Find answers below or contact our multilingual team.',
    supportCards: [
      { icon: 'headphones', title: '24/7 Support', desc: 'Our team is available round the clock, every day of the year.' },
      { icon: 'clock', title: 'Quick Response', desc: 'Average response time under 5 minutes by phone and chat.' },
      { icon: 'shield', title: 'Multilingual', desc: 'Support in French, English, Russian and Armenian.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      { q: 'How do I book a ride?', a: 'You can book directly on zont.cab or via our mobile app (iOS/Android). Enter your pickup and drop-off locations, choose your vehicle, and confirm. You\'ll receive driver details 3 hours before your trip.' },
      { q: 'Can I book in advance?', a: 'Absolutely! You can book your transfer days, weeks or even months in advance. The price is locked at booking with no surge pricing. Early booking guarantees availability.' },
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard and Apple Pay. All payments are processed securely with encryption. You can also pay in cash to the driver.' },
      { q: 'Can I cancel my booking?', a: 'Yes, free cancellation is available up to 24 hours before your scheduled transfer. After that, cancellation fees may apply depending on the vehicle type.' },
      { q: 'What happens if my flight is delayed?', a: 'We track all flights in real-time. If your flight is delayed, your driver automatically adjusts their arrival time at no extra cost. We include 60 minutes of free waiting time.' },
      { q: 'How are your drivers verified?', a: 'All drivers undergo thorough background checks, have valid professional licenses, and are continuously rated by passengers. We only work with the highest-rated drivers.' },
      { q: 'Is Zont available in my city?', a: 'Zont operates in 16 cities across Europe including Paris, Nice, London, Berlin, Barcelona, Rome, and many more. Check our Countries page for the full list.' },
      { q: 'What if I have an issue during my ride?', a: 'Contact our 24/7 support team through the app, call our hotline, or email us. We respond within minutes and will resolve any issue promptly.' },
    ],
    contactTitle: 'Contact Us',
    contactSub: 'Can\'t find an answer? Our team responds within minutes.',
    contactInfo: [
      { type: 'email', label: 'Email Support', value: 'support@zont.cab', action: 'mailto:support@zont.cab' },
      { type: 'phone', label: 'WhatsApp', value: '+33 7 83 77 70 27', action: 'https://wa.me/33783777027' },
      { type: 'address', label: 'Office', value: 'Paris, France', action: null },
    ],
    formName: 'Your Name', formEmail: 'Email', formSubject: 'Subject',
    formMessage: 'Your Message', formPlaceholder: 'Describe your question or issue...',
    submit: 'Send Message', sending: 'Sending...',
    successTitle: 'Message sent!',
    errorTitle: 'Error sending message',
  },
  fr: {
    seoTitle: 'Aide & Support - Contactez Zont | Service Client 24h/24 | FAQ',
    seoDesc: 'Besoin d\'aide pour votre transfert aeroport ? Contactez le support Zont 24h/24 7j/7. Reponses aux questions frequentes sur les reservations, paiements et annulations.',
    heroTitle: 'Aide & Support',
    heroSub: 'Nous sommes la pour vous aider 24h/24 et 7j/7. Trouvez des reponses ci-dessous ou contactez notre equipe multilingue.',
    supportCards: [
      { icon: 'headphones', title: 'Support 24h/24', desc: 'Notre equipe est disponible jour et nuit, 365 jours par an.' },
      { icon: 'clock', title: 'Reponse Rapide', desc: 'Temps de reponse moyen de moins de 5 minutes par telephone et chat.' },
      { icon: 'shield', title: 'Multilingue', desc: 'Support en francais, anglais, russe et armenien.' },
    ],
    faqTitle: 'Questions Frequentes',
    faqs: [
      { q: 'Comment reserver une course ?', a: 'Reservez directement sur zont.cab ou via notre appli mobile (iOS/Android). Entrez vos lieux de depart et d\'arrivee, choisissez votre vehicule et confirmez. Vous recevrez les details du chauffeur 3 heures avant votre trajet.' },
      { q: 'Puis-je reserver a l\'avance ?', a: 'Absolument ! Vous pouvez reserver votre transfert des jours, semaines ou meme des mois a l\'avance. Le prix est verrouille a la reservation sans majoration. La reservation anticipee garantit la disponibilite.' },
      { q: 'Quels modes de paiement acceptez-vous ?', a: 'Nous acceptons Visa, Mastercard et Apple Pay. Tous les paiements sont traites de maniere securisee avec chiffrement. Vous pouvez egalement payer en especes au chauffeur.' },
      { q: 'Puis-je annuler ma reservation ?', a: 'Oui, l\'annulation gratuite est disponible jusqu\'a 24 heures avant votre transfert. Apres ce delai, des frais d\'annulation peuvent s\'appliquer selon le type de vehicule.' },
      { q: 'Que se passe-t-il si mon vol est en retard ?', a: 'Nous suivons tous les vols en temps reel. Si votre vol est retarde, votre chauffeur ajuste automatiquement son heure d\'arrivee sans frais supplementaires. Nous incluons 60 minutes d\'attente gratuite.' },
      { q: 'Comment sont verifies vos chauffeurs ?', a: 'Tous les chauffeurs passent des verifications approfondies, possedent des licences professionnelles valides et sont notes en continu par les passagers. Nous ne travaillons qu\'avec les chauffeurs les mieux notes.' },
      { q: 'Zont est-il disponible dans ma ville ?', a: 'Zont opere dans plus de 120 villes en Europe dont Paris, Nice, Londres, Berlin, Barcelone, Rome et bien d\'autres. Consultez notre page Destinations pour la liste complete.' },
      { q: 'Que faire en cas de probleme pendant la course ?', a: 'Contactez notre support 24/7 via l\'application, appelez notre ligne directe ou envoyez-nous un email. Nous repondons en quelques minutes.' },
    ],
    contactTitle: 'Contactez-Nous',
    contactSub: 'Vous ne trouvez pas de reponse ? Notre equipe repond en quelques minutes.',
    contactInfo: [
      { type: 'email', label: 'Support Email', value: 'support@zont.cab', action: 'mailto:support@zont.cab' },
      { type: 'phone', label: 'WhatsApp', value: '+33 7 83 77 70 27', action: 'https://wa.me/33783777027' },
      { type: 'address', label: 'Bureau', value: 'Paris, France', action: null },
    ],
    formName: 'Votre Nom', formEmail: 'Email', formSubject: 'Sujet',
    formMessage: 'Votre Message', formPlaceholder: 'Decrivez votre question ou probleme...',
    submit: 'Envoyer', sending: 'Envoi en cours...',
    successTitle: 'Message envoye !',
    errorTitle: 'Erreur lors de l\'envoi',
  },
  ru: {
    seoTitle: 'Помощь и Поддержка - Свяжитесь с Zont | Служба Поддержки 24/7 | FAQ',
    seoDesc: 'Нужна помощь с трансфером из аэропорта? Свяжитесь с поддержкой Zont 24/7. Ответы на частые вопросы о бронированиях, оплате и отменах.',
    heroTitle: 'Помощь и Поддержка',
    heroSub: 'Мы здесь, чтобы помочь вам 24/7. Найдите ответы ниже или свяжитесь с нашей многоязычной командой.',
    supportCards: [
      { icon: 'headphones', title: 'Поддержка 24/7', desc: 'Наша команда доступна круглосуточно, 365 дней в году.' },
      { icon: 'clock', title: 'Быстрый Ответ', desc: 'Среднее время ответа менее 5 минут по телефону и в чате.' },
      { icon: 'shield', title: 'Многоязычная', desc: 'Поддержка на французском, английском, русском и армянском.' },
    ],
    faqTitle: 'Часто Задаваемые Вопросы',
    faqs: [
      { q: 'Как забронировать поездку?', a: 'Забронируйте на zont.cab или через мобильное приложение (iOS/Android). Введите места отправления и прибытия, выберите автомобиль и подтвердите. Данные водителя вы получите за 3 часа до поездки.' },
      { q: 'Можно ли забронировать заранее?', a: 'Конечно! Вы можете забронировать за дни, недели или даже месяцы. Цена фиксируется при бронировании без наценок.' },
      { q: 'Какие способы оплаты вы принимаете?', a: 'Мы принимаем Visa, Mastercard и Apple Pay. Все платежи обрабатываются безопасно с шифрованием.' },
      { q: 'Могу ли я отменить бронирование?', a: 'Да, бесплатная отмена доступна за 24 часа до трансфера. После этого могут применяться штрафы.' },
      { q: 'Что если рейс задерживается?', a: 'Мы отслеживаем все рейсы. Водитель автоматически корректирует время без доплаты. 60 минут бесплатного ожидания.' },
      { q: 'Как проверяются водители?', a: 'Все водители проходят тщательную проверку, имеют лицензии и постоянно оцениваются пассажирами.' },
      { q: 'Работает ли Zont в моем городе?', a: 'Zont работает в 16 городах Европы: Париж, Ницца, Лондон, Берлин, Барселона, Рим и многие другие.' },
      { q: 'Что делать при проблеме во время поездки?', a: 'Свяжитесь с поддержкой 24/7 через приложение, позвоните или напишите. Мы отвечаем в течение минут.' },
    ],
    contactTitle: 'Свяжитесь с Нами',
    contactSub: 'Не нашли ответ? Наша команда отвечает в течение минут.',
    contactInfo: [
      { type: 'email', label: 'Email Поддержки', value: 'support@zont.cab', action: 'mailto:support@zont.cab' },
      { type: 'phone', label: 'WhatsApp', value: '+33 7 83 77 70 27', action: 'https://wa.me/33783777027' },
      { type: 'address', label: 'Офис', value: 'Париж, Франция', action: null },
    ],
    formName: 'Ваше Имя', formEmail: 'Email', formSubject: 'Тема',
    formMessage: 'Ваше Сообщение', formPlaceholder: 'Опишите ваш вопрос или проблему...',
    submit: 'Отправить', sending: 'Отправка...',
    successTitle: 'Сообщение отправлено!',
    errorTitle: 'Ошибка при отправке',
  },
  hy: {
    seoTitle: 'Օգնություն և Աջակցություն - Կապվեք Zont-ի հետ | Սպասարկում 24/7 | ՀՏՀ',
    seoDesc: 'Օգնությա՞ն կարիք ունեք ձեր օդանավակայանի տրանսֆերի հարցում։ Կապվեք Zont-ի աջակցության հետ 24/7։ Պատասխաններ ամրագրումների, վճարումների և չեղարկումների վերաբերյալ հաճախ տրվող հարցերին։',
    heroTitle: 'Օգնություն և Աջակցություն',
    heroSub: 'Մենք այստեղ ենք՝ ձեզ օգնելու 24/7։ Գտեք պատասխանները ստորև կամ կապվեք մեր բազմալեզու թիմի հետ։',
    supportCards: [
      { icon: 'headphones', title: 'Աջակցություն 24/7', desc: 'Մեր թիմը հասանելի է շուրջօրյա, տարվա 365 օր։' },
      { icon: 'clock', title: 'Արագ պատասխան', desc: 'Պատասխանի միջին ժամանակը՝ 5 րոպեից պակաս հեռախոսով և չաթով։' },
      { icon: 'shield', title: 'Բազմալեզու', desc: 'Աջակցություն հայերեն, անգլերեն, ռուսերեն և ֆրանսերեն։' },
    ],
    faqTitle: 'Հաճախ տրվող հարցեր',
    faqs: [
      { q: 'Ինչպե՞ս ամրագրել ուղևորություն', a: 'Ամրագրեք անմիջապես zont.cab կայքում կամ մեր բջջային հավելվածով (iOS/Android)։ Մուտքագրեք վերցնելու և իջեցնելու վայրերը, ընտրեք մեքենան և հաստատեք։ Վարորդի տվյալները կստանաք ուղևորությունից 3 ժամ առաջ։' },
      { q: 'Կարո՞ղ եմ ամրագրել նախապես', a: 'Իհարկե։ Կարող եք ամրագրել ձեր տրանսֆերը օրեր, շաբաթներ կամ նույնիսկ ամիսներ առաջ։ Գինը ֆիքսվում է ամրագրման պահին՝ առանց հավելավճարների։ Վաղ ամրագրումը երաշխավորում է հասանելիությունը։' },
      { q: 'Վճարման ի՞նչ եղանակներ եք ընդունում', a: 'Մենք ընդունում ենք Visa, Mastercard և Apple Pay։ Բոլոր վճարումները մշակվում են անվտանգ՝ գաղտնագրմամբ։ Կարող եք նաև վճարել կանխիկ՝ վարորդին։' },
      { q: 'Կարո՞ղ եմ չեղարկել ամրագրումը', a: 'Այո, անվճար չեղարկումը հասանելի է տրանսֆերից 24 ժամ առաջ։ Դրանից հետո կարող են կիրառվել չեղարկման վճարներ՝ կախված մեքենայի տեսակից։' },
      { q: 'Ի՞նչ կլինի, եթե իմ թռիչքն ուշանա', a: 'Մենք հետևում ենք բոլոր թռիչքներին իրական ժամանակում։ Եթե ձեր թռիչքն ուշանում է, վարորդն ավտոմատ հարմարեցնում է ժամանման ժամը՝ առանց հավելավճարի։ Ներառված է 60 րոպե անվճար սպասում։' },
      { q: 'Ինչպե՞ս են ստուգվում ձեր վարորդները', a: 'Բոլոր վարորդներն անցնում են մանրակրկիտ ստուգում, ունեն վավեր մասնագիտական լիցենզիաներ և մշտապես գնահատվում են ուղևորների կողմից։ Մենք աշխատում ենք միայն ամենաբարձր գնահատված վարորդների հետ։' },
      { q: 'Zont-ը հասանելի՞ է իմ քաղաքում', a: 'Zont-ը գործում է Եվրոպայի 16 քաղաքներում՝ Փարիզ, Նիցցա, Լոնդոն, Բեռլին, Բարսելոնա, Հռոմ և այլն։ Ամբողջական ցանկը տեսեք մեր Ուղղություններ էջում։' },
      { q: 'Ի՞նչ անել, եթե ուղևորության ընթացքում խնդիր առաջանա', a: 'Կապվեք մեր 24/7 աջակցության թիմի հետ հավելվածով, զանգահարեք կամ գրեք մեզ email։ Մենք պատասխանում ենք րոպեների ընթացքում և արագ կլուծենք ցանկացած խնդիր։' },
    ],
    contactTitle: 'Կապվեք մեզ հետ',
    contactSub: 'Չգտա՞ք պատասխանը։ Մեր թիմը պատասխանում է րոպեների ընթացքում։',
    contactInfo: [
      { type: 'email', label: 'Email աջակցություն', value: 'support@zont.cab', action: 'mailto:support@zont.cab' },
      { type: 'phone', label: 'WhatsApp', value: '+33 7 83 77 70 27', action: 'https://wa.me/33783777027' },
      { type: 'address', label: 'Գրասենյակ', value: 'Փարիզ, Ֆրանսիա', action: null },
    ],
    formName: 'Ձեր անունը', formEmail: 'Email', formSubject: 'Թեմա',
    formMessage: 'Ձեր հաղորդագրությունը', formPlaceholder: 'Նկարագրեք ձեր հարցը կամ խնդիրը...',
    submit: 'Ուղարկել', sending: 'Ուղարկվում է...',
    successTitle: 'Հաղորդագրությունն ուղարկված է',
    errorTitle: 'Ուղարկման սխալ',
  },
  es: {
    seoTitle: 'Ayuda y Soporte - Contacta con Zont | Atención al Cliente 24/7 | FAQ',
    seoDesc: '¿Necesitas ayuda con tu traslado al aeropuerto? Contacta con el soporte de Zont 24/7. Respuestas a preguntas frecuentes sobre reservas, pagos y cancelaciones.',
    heroTitle: 'Ayuda y Soporte',
    heroSub: 'Estamos aquí para ayudarte 24/7. Encuentra respuestas abajo o contacta con nuestro equipo multilingüe.',
    supportCards: [
      { icon: 'headphones', title: 'Soporte 24/7', desc: 'Nuestro equipo está disponible día y noche, los 365 días del año.' },
      { icon: 'clock', title: 'Respuesta Rápida', desc: 'Tiempo medio de respuesta inferior a 5 minutos por teléfono y chat.' },
      { icon: 'shield', title: 'Multilingüe', desc: 'Soporte en español, francés, inglés, ruso y armenio.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      { q: '¿Cómo reservo un trayecto?', a: 'Reserva directamente en zont.cab o a través de nuestra app móvil (iOS/Android). Introduce los lugares de recogida y destino, elige tu vehículo y confirma. Recibirás los datos del conductor 3 horas antes de tu viaje.' },
      { q: '¿Puedo reservar con antelación?', a: '¡Por supuesto! Puedes reservar tu traslado con días, semanas o incluso meses de antelación. El precio queda fijado al reservar, sin recargos. Reservar pronto garantiza la disponibilidad.' },
      { q: '¿Qué métodos de pago aceptáis?', a: 'Aceptamos Visa, Mastercard y Apple Pay. Todos los pagos se procesan de forma segura con cifrado. También puedes pagar en efectivo al conductor.' },
      { q: '¿Puedo cancelar mi reserva?', a: 'Sí, la cancelación gratuita está disponible hasta 24 horas antes de tu traslado. Después de ese plazo, pueden aplicarse gastos de cancelación según el tipo de vehículo.' },
      { q: '¿Qué pasa si mi vuelo se retrasa?', a: 'Seguimos todos los vuelos en tiempo real. Si tu vuelo se retrasa, tu conductor ajusta automáticamente su hora de llegada sin coste adicional. Incluimos 60 minutos de espera gratuita.' },
      { q: '¿Cómo se verifica a vuestros conductores?', a: 'Todos los conductores pasan verificaciones exhaustivas, tienen licencias profesionales válidas y son valorados continuamente por los pasajeros. Solo trabajamos con los conductores mejor valorados.' },
      { q: '¿Zont está disponible en mi ciudad?', a: 'Zont opera en 16 ciudades de Europa, incluyendo París, Niza, Londres, Berlín, Barcelona, Roma y muchas más. Consulta nuestra página de Destinos para ver la lista completa.' },
      { q: '¿Qué hago si tengo un problema durante el trayecto?', a: 'Contacta con nuestro equipo de soporte 24/7 a través de la app, llama a nuestra línea directa o envíanos un email. Respondemos en minutos y resolveremos cualquier problema rápidamente.' },
    ],
    contactTitle: 'Contáctanos',
    contactSub: '¿No encuentras respuesta? Nuestro equipo responde en minutos.',
    contactInfo: [
      { type: 'email', label: 'Soporte por Email', value: 'support@zont.cab', action: 'mailto:support@zont.cab' },
      { type: 'phone', label: 'WhatsApp', value: '+33 7 83 77 70 27', action: 'https://wa.me/33783777027' },
      { type: 'address', label: 'Oficina', value: 'París, Francia', action: null },
    ],
    formName: 'Tu Nombre', formEmail: 'Email', formSubject: 'Asunto',
    formMessage: 'Tu Mensaje', formPlaceholder: 'Describe tu pregunta o problema...',
    submit: 'Enviar Mensaje', sending: 'Enviando...',
    successTitle: '¡Mensaje enviado!',
    errorTitle: 'Error al enviar el mensaje',
  },
};

const iconMap = { headphones: Headphones, clock: Clock, shield: Shield };

const Help = () => {
  const language = useLangRouting('help');
  const c = content[language] || content.en;
  const [loading, setLoading] = useState(false);
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

  const inputCls = 'w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm';

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="help-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        canonical={buildCanonicalUrl('help', language)}
        hreflang={buildHreflangCluster('help')}
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

      {/* Hero */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#1a2332] to-[#0f1419]" />
        <div className="absolute top-20 left-0 w-80 h-80 bg-[#2ecc71]/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#2ecc71]/10 text-[#2ecc71] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <MessageCircle className="w-4 h-4" />
            <span>24/7</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="help-h1">{c.heroTitle}</h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">{c.heroSub}</p>
        </div>
      </section>

      {/* Support Cards */}
      <section className="py-8 px-4 bg-[#0f1419] border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {c.supportCards.map((card, i) => {
            const Icon = iconMap[card.icon] || Headphones;
            return (
              <div key={i} className="flex items-center gap-4 p-4" data-testid={`support-card-${i}`}>
                <div className="w-11 h-11 bg-[#2ecc71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#2ecc71]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{card.title}</h3>
                  <p className="text-gray-400 text-xs">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 bg-[#1a2332]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">{c.faqTitle}</h2>
          <div className="space-y-3">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group bg-[#0f1419] rounded-xl border border-gray-800" data-testid={`faq-${i}`}>
                <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-semibold text-sm list-none">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 px-4 bg-[#0f1419]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{c.contactTitle}</h2>
            <p className="text-gray-400 text-sm">{c.contactSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {c.contactInfo.map((info, i) => {
              const isExternal = info.action && info.action.startsWith('http');
              const content = (
                <div className="bg-[#1a2332] rounded-xl p-5 text-center border border-gray-800 hover:border-[#2ecc71]/40 transition-colors" data-testid={`contact-${info.type}`}>
                  {info.type === 'email' && <Mail className="w-7 h-7 text-[#2ecc71] mx-auto mb-3" />}
                  {info.type === 'phone' && (
                    <svg className="w-7 h-7 text-[#25D366] mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.11 1.6 5.92L0 24l6.32-1.65A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 21.82a9.81 9.81 0 01-5-1.36l-.36-.22-3.75.98 1-3.66-.24-.38A9.83 9.83 0 1121.82 12 9.83 9.83 0 0112 21.82zm5.4-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07a8.1 8.1 0 01-2.38-1.47 8.97 8.97 0 01-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37s-1.05 1.02-1.05 2.5 1.07 2.9 1.22 3.1c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.71.64.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z"/></svg>
                  )}
                  {info.type === 'address' && <MapPin className="w-7 h-7 text-[#2ecc71] mx-auto mb-3" />}
                  <h3 className="font-semibold text-white text-sm mb-1">{info.label}</h3>
                  <p className="text-gray-400 text-sm">{info.value}</p>
                </div>
              );
              return info.action
                ? <a key={i} href={info.action} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>{content}</a>
                : <div key={i}>{content}</div>;
            })}
          </div>

          <div className="max-w-2xl mx-auto bg-[#1a2332] rounded-2xl border border-gray-800 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="help-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{c.formName} *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputCls} data-testid="help-name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{c.formEmail} *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputCls} data-testid="help-email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{c.formSubject} *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className={inputCls} data-testid="help-subject" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{c.formMessage} *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" className={inputCls} placeholder={c.formPlaceholder} data-testid="help-message" />
              </div>
              <button type="submit" disabled={loading} data-testid="help-submit"
                className="w-full py-3.5 bg-[#2ecc71] text-white font-semibold rounded-lg hover:bg-[#27ae60] transition-all disabled:bg-gray-600 flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20">
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
