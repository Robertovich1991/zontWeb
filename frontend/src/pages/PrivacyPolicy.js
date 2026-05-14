import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  fr: {
    seoTitle: 'Politique de Confidentialite | Zont.cab',
    seoDesc: 'Decouvrez comment Zont.cab collecte, utilise et protege vos donnees personnelles.',
    lastUpdate: 'Derniere mise a jour : 14 mai 2026',
    title: 'Politique de Confidentialite',
    intro: 'La presente Politique de Confidentialite decrit comment Zont.cab collecte, utilise, stocke et protege vos donnees personnelles lorsque vous utilisez notre site web et nos services de transport avec chauffeur.',
    sections: [
      { title: '1. Responsable du traitement', text: 'Le responsable du traitement des donnees personnelles est :\n\nZont Technologies Inc.\nEmail : contact@zont.cab\nTelephone : +33 7 83 77 70 27' },
      { title: '2. Donnees collectees', text: 'Nous collectons les donnees suivantes :\n\n- Donnees d\'identification : nom, prenom, adresse email, numero de telephone\n- Donnees de reservation : adresses de depart et d\'arrivee, date et heure, numero de vol/train, nombre de passagers et bagages, categorie de vehicule\n- Donnees de paiement : informations de carte bancaire (traitees par Stripe, notre prestataire de paiement securise)\n- Donnees de navigation : adresse IP, type de navigateur, pages visitees, cookies\n- Donnees de communication : echanges avec notre service client par email, telephone, SMS ou WhatsApp' },
      { title: '3. Finalites du traitement', text: 'Vos donnees sont utilisees pour :\n\n- Gerer et confirmer vos reservations\n- Organiser votre transport et coordonner avec le chauffeur\n- Traiter les paiements et emettre les factures\n- Vous contacter concernant votre reservation (confirmations, modifications, informations de prise en charge)\n- Ameliorer nos services et notre site web\n- Assurer la securite de nos services\n- Respecter nos obligations legales et reglementaires\n- Vous envoyer des communications marketing (avec votre consentement)' },
      { title: '4. Bases legales du traitement', text: 'Le traitement de vos donnees repose sur :\n\n- L\'execution du contrat : traitement necessaire a la reservation et a la realisation du service de transport\n- Le consentement : pour les communications marketing et certains cookies\n- L\'interet legitime : amelioration de nos services, prevention de la fraude, securite\n- L\'obligation legale : conservation des factures, obligations fiscales et comptables' },
      { title: '5. Destinataires des donnees', text: 'Vos donnees peuvent etre partagees avec :\n\n- Nos chauffeurs et partenaires de transport : pour l\'execution du service\n- Notre prestataire de paiement (Stripe) : pour le traitement securise des paiements\n- Nos prestataires techniques : hebergement, email, SMS, analytics\n- Les autorites competentes : en cas d\'obligation legale\n\nNous ne vendons jamais vos donnees personnelles a des tiers.' },
      { title: '6. Transferts internationaux', text: 'Certaines donnees peuvent etre transferees en dehors de l\'Union Europeenne, notamment vers nos prestataires techniques. Dans ce cas, nous nous assurons que des garanties appropriees sont mises en place (clauses contractuelles types, decisions d\'adequation, etc.).' },
      { title: '7. Duree de conservation', text: 'Vos donnees sont conservees :\n\n- Donnees de reservation : 3 ans apres la derniere utilisation du service\n- Donnees de paiement : conformement aux obligations legales (10 ans pour les pieces comptables)\n- Donnees de navigation et cookies : 13 mois maximum\n- Donnees de communication : 3 ans apres le dernier contact\n- Compte client : jusqu\'a la suppression du compte par le client, puis archivage conforme aux obligations legales' },
      { title: '8. Vos droits', text: 'Conformement au RGPD, vous disposez des droits suivants :\n\n- Droit d\'acces : obtenir une copie de vos donnees\n- Droit de rectification : corriger vos donnees inexactes\n- Droit a l\'effacement : demander la suppression de vos donnees\n- Droit a la limitation : limiter le traitement de vos donnees\n- Droit d\'opposition : vous opposer au traitement de vos donnees\n- Droit a la portabilite : recevoir vos donnees dans un format structure\n- Droit de retirer votre consentement : a tout moment pour les traitements bases sur le consentement\n\nPour exercer vos droits, contactez-nous a : contact@zont.cab\n\nVous disposez egalement du droit d\'introduire une reclamation aupres de la CNIL (Commission Nationale de l\'Informatique et des Libertes).' },
      { title: '9. Cookies', text: 'Notre site utilise des cookies :\n\n- Cookies essentiels : necessaires au fonctionnement du site (session, panier, preferences de langue)\n- Cookies analytiques : Google Analytics, Yandex Metrica — pour comprendre l\'utilisation du site\n- Cookies marketing : Meta Pixel, Google Ads — pour mesurer l\'efficacite de nos campagnes publicitaires\n- Cookies tiers : Stripe (paiement), Google Maps (cartographie)\n\nVous pouvez gerer vos preferences de cookies a tout moment via les parametres de votre navigateur.' },
      { title: '10. Securite des donnees', text: 'Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger vos donnees :\n\n- Chiffrement SSL/TLS pour toutes les communications\n- Paiements securises via Stripe (certifie PCI DSS)\n- Acces restreint aux donnees personnelles\n- Surveillance et mise a jour reguliere de nos systemes' },
      { title: '11. Mineurs', text: 'Nos services ne s\'adressent pas aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de donnees personnelles de mineurs.' },
      { title: '12. Modifications', text: 'Nous pouvons modifier cette Politique de Confidentialite a tout moment. Les modifications seront publiees sur cette page avec la date de mise a jour. Nous vous encourageons a consulter regulierement cette page.' },
      { title: '13. Contact', text: 'Pour toute question relative a la protection de vos donnees personnelles :\n\nEmail : contact@zont.cab\nTelephone : +33 7 83 77 70 27\nAdresse : Zont Technologies Inc.' },
    ],
  },
  en: {
    seoTitle: 'Privacy Policy | Zont.cab',
    seoDesc: 'Learn how Zont.cab collects, uses and protects your personal data.',
    lastUpdate: 'Last updated: May 14, 2026',
    title: 'Privacy Policy',
    intro: 'This Privacy Policy describes how Zont.cab collects, uses, stores and protects your personal data when you use our website and chauffeur-driven transport services.',
    sections: [
      { title: '1. Data Controller', text: 'The data controller is:\n\nZont Technologies Inc.\nEmail: contact@zont.cab\nPhone: +33 7 83 77 70 27' },
      { title: '2. Data Collected', text: 'We collect the following data:\n\n- Identification data: name, email address, phone number\n- Booking data: pick-up and drop-off addresses, date and time, flight/train number, number of passengers and luggage, vehicle category\n- Payment data: credit card information (processed by Stripe, our secure payment provider)\n- Browsing data: IP address, browser type, pages visited, cookies\n- Communication data: exchanges with our customer service via email, phone, SMS or WhatsApp' },
      { title: '3. Purpose of Processing', text: 'Your data is used to:\n\n- Manage and confirm your bookings\n- Organize transport and coordinate with the driver\n- Process payments and issue invoices\n- Contact you regarding your booking (confirmations, changes, pick-up information)\n- Improve our services and website\n- Ensure the security of our services\n- Comply with our legal obligations\n- Send marketing communications (with your consent)' },
      { title: '4. Legal Basis', text: 'Processing of your data is based on:\n\n- Contract performance: processing necessary for booking and transport service delivery\n- Consent: for marketing communications and certain cookies\n- Legitimate interest: service improvement, fraud prevention, security\n- Legal obligation: invoice retention, tax and accounting obligations' },
      { title: '5. Data Recipients', text: 'Your data may be shared with:\n\n- Our drivers and transport partners: for service delivery\n- Our payment provider (Stripe): for secure payment processing\n- Our technical service providers: hosting, email, SMS, analytics\n- Competent authorities: when required by law\n\nWe never sell your personal data to third parties.' },
      { title: '6. International Transfers', text: 'Some data may be transferred outside the European Union, particularly to our technical service providers. In such cases, we ensure appropriate safeguards are in place (standard contractual clauses, adequacy decisions, etc.).' },
      { title: '7. Data Retention', text: 'Your data is retained:\n\n- Booking data: 3 years after last service use\n- Payment data: in accordance with legal obligations (10 years for accounting records)\n- Browsing data and cookies: maximum 13 months\n- Communication data: 3 years after last contact\n- Customer account: until account deletion by the customer, then archived as required by law' },
      { title: '8. Your Rights', text: 'Under the GDPR, you have the following rights:\n\n- Right of access: obtain a copy of your data\n- Right to rectification: correct inaccurate data\n- Right to erasure: request deletion of your data\n- Right to restriction: limit the processing of your data\n- Right to object: object to the processing of your data\n- Right to data portability: receive your data in a structured format\n- Right to withdraw consent: at any time for consent-based processing\n\nTo exercise your rights, contact us at: contact@zont.cab\n\nYou also have the right to lodge a complaint with the relevant supervisory authority (CNIL in France).' },
      { title: '9. Cookies', text: 'Our website uses cookies:\n\n- Essential cookies: required for website functionality (session, language preferences)\n- Analytics cookies: Google Analytics, Yandex Metrica — to understand site usage\n- Marketing cookies: Meta Pixel, Google Ads — to measure advertising effectiveness\n- Third-party cookies: Stripe (payments), Google Maps (mapping)\n\nYou can manage your cookie preferences at any time through your browser settings.' },
      { title: '10. Data Security', text: 'We implement appropriate technical and organizational measures to protect your data:\n\n- SSL/TLS encryption for all communications\n- Secure payments via Stripe (PCI DSS certified)\n- Restricted access to personal data\n- Regular monitoring and system updates' },
      { title: '11. Minors', text: 'Our services are not intended for persons under 16 years of age. We do not knowingly collect personal data from minors.' },
      { title: '12. Changes', text: 'We may modify this Privacy Policy at any time. Changes will be published on this page with the update date. We encourage you to review this page regularly.' },
      { title: '13. Contact', text: 'For any questions regarding the protection of your personal data:\n\nEmail: contact@zont.cab\nPhone: +33 7 83 77 70 27\nAddress: Zont Technologies Inc.' },
    ],
  },
  ru: {
    seoTitle: 'Политика конфиденциальности | Zont.cab',
    seoDesc: 'Узнайте, как Zont.cab собирает, использует и защищает ваши персональные данные.',
    lastUpdate: 'Последнее обновление: 14 мая 2026',
    title: 'Политика конфиденциальности',
    intro: 'Настоящая Политика конфиденциальности описывает, как Zont.cab собирает, использует, хранит и защищает ваши персональные данные при использовании нашего сайта и услуг транспорта с водителем.',
    sections: [
      { title: '1. Ответственный за обработку данных', text: 'Ответственный за обработку данных:\n\nZont Technologies Inc.\nEmail: contact@zont.cab\nТелефон: +33 7 83 77 70 27' },
      { title: '2. Собираемые данные', text: 'Мы собираем следующие данные:\n\n- Идентификационные данные: имя, email, номер телефона\n- Данные бронирования: адреса, дата и время, номер рейса/поезда, количество пассажиров и багажа, категория автомобиля\n- Платежные данные: данные карты (обрабатываются Stripe)\n- Данные навигации: IP-адрес, тип браузера, посещенные страницы, cookies\n- Данные коммуникации: переписка со службой поддержки' },
      { title: '3. Цели обработки', text: 'Ваши данные используются для:\n\n- Управления и подтверждения бронирований\n- Организации транспорта и координации с водителем\n- Обработки платежей и выставления счетов\n- Связи с вами по поводу бронирования\n- Улучшения наших услуг и сайта\n- Обеспечения безопасности\n- Выполнения юридических обязательств\n- Маркетинговых рассылок (с вашего согласия)' },
      { title: '4. Правовые основания', text: 'Обработка данных основана на:\n\n- Исполнении договора: для бронирования и оказания услуг\n- Согласии: для маркетинга и некоторых cookies\n- Законном интересе: улучшение сервиса, предотвращение мошенничества\n- Юридической обязанности: хранение счетов, налоговые обязательства' },
      { title: '5. Получатели данных', text: 'Ваши данные могут быть переданы:\n\n- Нашим водителям и партнерам: для оказания услуг\n- Платежному провайдеру (Stripe): для безопасной обработки платежей\n- Техническим провайдерам: хостинг, email, SMS, аналитика\n- Компетентным органам: по закону\n\nМы никогда не продаем ваши данные третьим лицам.' },
      { title: '6. Международные передачи', text: 'Некоторые данные могут передаваться за пределы ЕС нашим техническим провайдерам. Мы обеспечиваем соответствующие гарантии защиты.' },
      { title: '7. Сроки хранения', text: 'Ваши данные хранятся:\n\n- Данные бронирования: 3 года после последнего использования\n- Платежные данные: в соответствии с законом (10 лет для бухгалтерских документов)\n- Данные навигации и cookies: максимум 13 месяцев\n- Данные коммуникации: 3 года после последнего контакта' },
      { title: '8. Ваши права', text: 'В соответствии с GDPR вы имеете право:\n\n- Право доступа: получить копию ваших данных\n- Право на исправление: корректировка неточных данных\n- Право на удаление: запросить удаление данных\n- Право на ограничение: ограничить обработку\n- Право на возражение: возражать против обработки\n- Право на переносимость: получить данные в структурированном формате\n- Право на отзыв согласия: в любое время\n\nОбращайтесь: contact@zont.cab' },
      { title: '9. Файлы cookie', text: 'Наш сайт использует cookies:\n\n- Обязательные: для работы сайта\n- Аналитические: Google Analytics, Yandex Metrica\n- Маркетинговые: Meta Pixel, Google Ads\n- Сторонние: Stripe, Google Maps\n\nВы можете управлять cookies в настройках браузера.' },
      { title: '10. Безопасность данных', text: 'Мы применяем технические и организационные меры защиты:\n\n- SSL/TLS шифрование\n- Безопасные платежи через Stripe (сертификат PCI DSS)\n- Ограниченный доступ к данным\n- Регулярный мониторинг систем' },
      { title: '11. Несовершеннолетние', text: 'Наши услуги не предназначены для лиц младше 16 лет. Мы не собираем данные несовершеннолетних.' },
      { title: '12. Изменения', text: 'Мы можем изменить эту Политику в любое время. Изменения публикуются на этой странице.' },
      { title: '13. Контакт', text: 'По вопросам защиты данных:\n\nEmail: contact@zont.cab\nТелефон: +33 7 83 77 70 27' },
    ],
  },
  hy: {
    seoTitle: 'Գdelays | Zont.cab',
    seoDesc: 'Delays.',
    lastUpdate: 'Delays: 14 delays 2026',
    title: 'Delays',
    intro: 'Delays www.zont.cab.',
    sections: [
      { title: '1. Delays', text: 'Zont Technologies Inc.\nEmail: contact@zont.cab\nPhone: +33 7 83 77 70 27' },
    ],
  },
};

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const c = content[language] || content.fr;

  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="privacy-page">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://www.zont.cab/privacy" />
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-sm text-gray-500 mb-2">{c.lastUpdate}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{c.title}</h1>
        <p className="text-gray-600 mb-10 leading-relaxed">{c.intro}</p>
        <div className="space-y-8">
          {c.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">{s.text}</div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
