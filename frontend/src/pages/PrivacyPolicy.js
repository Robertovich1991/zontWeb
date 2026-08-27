import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { buildCanonicalUrl, buildHreflangCluster } from '@/utils/pageUrlMaps';
import { useLangRouting } from '@/utils/useLangRouting';

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
  es: {
    seoTitle: 'Política de Privacidad | Zont.cab',
    seoDesc: 'Descubre cómo Zont.cab recopila, utiliza y protege tus datos personales.',
    lastUpdate: 'Última actualización: 14 de mayo de 2026',
    title: 'Política de Privacidad',
    intro: 'Esta Política de Privacidad describe cómo Zont.cab recopila, utiliza, almacena y protege tus datos personales cuando utilizas nuestro sitio web y nuestros servicios de transporte con conductor.',
    sections: [
      { title: '1. Responsable del tratamiento', text: 'El responsable del tratamiento de los datos personales es:\n\nZont Technologies Inc.\nEmail: contact@zont.cab\nTeléfono: +33 7 83 77 70 27' },
      { title: '2. Datos recopilados', text: 'Recopilamos los siguientes datos:\n\n- Datos de identificación: nombre, apellidos, dirección de email, número de teléfono\n- Datos de reserva: direcciones de recogida y destino, fecha y hora, número de vuelo/tren, número de pasajeros y equipaje, categoría de vehículo\n- Datos de pago: información de tarjeta bancaria (procesada por Stripe, nuestro proveedor de pago seguro)\n- Datos de navegación: dirección IP, tipo de navegador, páginas visitadas, cookies\n- Datos de comunicación: intercambios con nuestro servicio de atención al cliente por email, teléfono, SMS o WhatsApp' },
      { title: '3. Finalidades del tratamiento', text: 'Tus datos se utilizan para:\n\n- Gestionar y confirmar tus reservas\n- Organizar el transporte y coordinar con el conductor\n- Procesar los pagos y emitir facturas\n- Contactarte en relación con tu reserva (confirmaciones, cambios, información de recogida)\n- Mejorar nuestros servicios y nuestro sitio web\n- Garantizar la seguridad de nuestros servicios\n- Cumplir nuestras obligaciones legales y reglamentarias\n- Enviarte comunicaciones de marketing (con tu consentimiento)' },
      { title: '4. Bases legales del tratamiento', text: 'El tratamiento de tus datos se basa en:\n\n- La ejecución del contrato: tratamiento necesario para la reserva y la prestación del servicio de transporte\n- El consentimiento: para las comunicaciones de marketing y determinadas cookies\n- El interés legítimo: mejora de nuestros servicios, prevención del fraude, seguridad\n- La obligación legal: conservación de facturas, obligaciones fiscales y contables' },
      { title: '5. Destinatarios de los datos', text: 'Tus datos pueden compartirse con:\n\n- Nuestros conductores y socios de transporte: para la prestación del servicio\n- Nuestro proveedor de pago (Stripe): para el procesamiento seguro de los pagos\n- Nuestros proveedores técnicos: alojamiento, email, SMS, analítica\n- Las autoridades competentes: cuando la ley lo exija\n\nNunca vendemos tus datos personales a terceros.' },
      { title: '6. Transferencias internacionales', text: 'Algunos datos pueden transferirse fuera de la Unión Europea, en particular a nuestros proveedores técnicos. En tal caso, nos aseguramos de que existan garantías adecuadas (cláusulas contractuales tipo, decisiones de adecuación, etc.).' },
      { title: '7. Plazos de conservación', text: 'Tus datos se conservan:\n\n- Datos de reserva: 3 años tras el último uso del servicio\n- Datos de pago: conforme a las obligaciones legales (10 años para documentos contables)\n- Datos de navegación y cookies: máximo 13 meses\n- Datos de comunicación: 3 años tras el último contacto\n- Cuenta de cliente: hasta la eliminación de la cuenta por el cliente, con posterior archivo conforme a las obligaciones legales' },
      { title: '8. Tus derechos', text: 'De conformidad con el RGPD, tienes los siguientes derechos:\n\n- Derecho de acceso: obtener una copia de tus datos\n- Derecho de rectificación: corregir datos inexactos\n- Derecho de supresión: solicitar la eliminación de tus datos\n- Derecho de limitación: limitar el tratamiento de tus datos\n- Derecho de oposición: oponerte al tratamiento de tus datos\n- Derecho a la portabilidad: recibir tus datos en un formato estructurado\n- Derecho a retirar tu consentimiento: en cualquier momento para los tratamientos basados en el consentimiento\n\nPara ejercer tus derechos, contáctanos en: contact@zont.cab\n\nTambién tienes derecho a presentar una reclamación ante la autoridad de control competente (CNIL en Francia, AEPD en España).' },
      { title: '9. Cookies', text: 'Nuestro sitio utiliza cookies:\n\n- Cookies esenciales: necesarias para el funcionamiento del sitio (sesión, preferencias de idioma)\n- Cookies analíticas: Google Analytics, Yandex Metrica — para comprender el uso del sitio\n- Cookies de marketing: Meta Pixel, Google Ads — para medir la eficacia de nuestras campañas publicitarias\n- Cookies de terceros: Stripe (pago), Google Maps (cartografía)\n\nPuedes gestionar tus preferencias de cookies en cualquier momento desde la configuración de tu navegador.' },
      { title: '10. Seguridad de los datos', text: 'Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos:\n\n- Cifrado SSL/TLS en todas las comunicaciones\n- Pagos seguros a través de Stripe (certificado PCI DSS)\n- Acceso restringido a los datos personales\n- Supervisión y actualización periódica de nuestros sistemas' },
      { title: '11. Menores', text: 'Nuestros servicios no están dirigidos a personas menores de 16 años. No recopilamos conscientemente datos personales de menores.' },
      { title: '12. Modificaciones', text: 'Podemos modificar esta Política de Privacidad en cualquier momento. Los cambios se publicarán en esta página con la fecha de actualización. Te recomendamos consultar esta página con regularidad.' },
      { title: '13. Contacto', text: 'Para cualquier cuestión relativa a la protección de tus datos personales:\n\nEmail: contact@zont.cab\nTeléfono: +33 7 83 77 70 27\nDirección: Zont Technologies Inc.' },
    ],
  },
  hy: {
    seoTitle: 'Գաղտնիության քաղաքականություն | Zont.cab',
    seoDesc: 'Իմացեք, թե ինչպես է Zont.cab-ը հավաքում, օգտագործում և պաշտպանում ձեր անձնական տվյալները։',
    lastUpdate: 'Վերջին թարմացումը՝ 14 մայիսի 2026',
    title: 'Գաղտնիության քաղաքականություն',
    intro: 'Սույն Գաղտնիության քաղաքականությունը նկարագրում է, թե ինչպես է Zont.cab-ը հավաքում, օգտագործում, պահպանում և պաշտպանում ձեր անձնական տվյալները մեր կայքից և վարորդով տրանսպորտային ծառայություններից օգտվելիս։',
    sections: [
      { title: '1. Տվյալների մշակման պատասխանատու', text: 'Անձնական տվյալների մշակման պատասխանատուն է՝\n\nZont Technologies Inc.\nEmail՝ contact@zont.cab\nՀեռախոս՝ +33 7 83 77 70 27' },
      { title: '2. Հավաքագրվող տվյալներ', text: 'Մենք հավաքում ենք հետևյալ տվյալները՝\n\n- Նույնականացման տվյալներ՝ անուն, ազգանուն, էլ. հասցե, հեռախոսահամար\n- Ամրագրման տվյալներ՝ վերցնելու և իջեցնելու հասցեներ, ամսաթիվ և ժամ, թռիչքի/գնացքի համար, ուղևորների և ուղեբեռի քանակ, մեքենայի կարգ\n- Վճարման տվյալներ՝ բանկային քարտի տվյալներ (մշակվում են Stripe-ի կողմից՝ մեր անվտանգ վճարային մատակարարի)\n- Նավիգացիոն տվյալներ՝ IP հասցե, բրաուզերի տեսակ, այցելած էջեր, cookie-ներ\n- Հաղորդակցության տվյալներ՝ նամակագրություն մեր սպասարկման ծառայության հետ email-ով, հեռախոսով, SMS-ով կամ WhatsApp-ով' },
      { title: '3. Մշակման նպատակները', text: 'Ձեր տվյալներն օգտագործվում են՝\n\n- Ամրագրումները կառավարելու և հաստատելու համար\n- Փոխադրումը կազմակերպելու և վարորդի հետ համակարգելու համար\n- Վճարումները մշակելու և հաշիվներ տրամադրելու համար\n- Ձեր ամրագրման վերաբերյալ ձեզ հետ կապ հաստատելու համար\n- Մեր ծառայությունները և կայքը բարելավելու համար\n- Մեր ծառայությունների անվտանգությունն ապահովելու համար\n- Օրենսդրական պարտավորությունները կատարելու համար\n- Մարքեթինգային հաղորդագրություններ ուղարկելու համար (ձեր համաձայնությամբ)' },
      { title: '4. Իրավական հիմքերը', text: 'Ձեր տվյալների մշակումը հիմնված է՝\n\n- Պայմանագրի կատարման վրա՝ ամրագրման և փոխադրման ծառայության մատուցման համար\n- Համաձայնության վրա՝ մարքեթինգի և որոշ cookie-ների համար\n- Օրինական շահի վրա՝ ծառայությունների բարելավում, խարդախության կանխարգելում, անվտանգություն\n- Օրենսդրական պարտավորության վրա՝ հաշիվների պահպանում, հարկային պարտավորություններ' },
      { title: '5. Տվյալների ստացողները', text: 'Ձեր տվյալները կարող են փոխանցվել՝\n\n- Մեր վարորդներին և տրանսպորտային գործընկերներին՝ ծառայության մատուցման համար\n- Մեր վճարային մատակարարին (Stripe)՝ վճարումների անվտանգ մշակման համար\n- Մեր տեխնիկական մատակարարներին՝ հոսթինգ, email, SMS, վերլուծություն\n- Իրավասու մարմիններին՝ օրենքով նախատեսված դեպքերում\n\nՄենք երբեք չենք վաճառում ձեր անձնական տվյալները երրորդ անձանց։' },
      { title: '6. Միջազգային փոխանցումներ', text: 'Որոշ տվյալներ կարող են փոխանցվել Եվրոպական Միությունից դուրս, մասնավորապես մեր տեխնիկական մատակարարներին։ Այդ դեպքում մենք ապահովում ենք համապատասխան երաշխիքներ (ստանդարտ պայմանագրային դրույթներ և այլն)։' },
      { title: '7. Պահպանման ժամկետները', text: 'Ձեր տվյալները պահպանվում են՝\n\n- Ամրագրման տվյալներ՝ ծառայությունից վերջին օգտվելուց 3 տարի\n- Վճարման տվյալներ՝ օրենքի համաձայն (հաշվապահական փաստաթղթերի համար՝ 10 տարի)\n- Նավիգացիոն տվյալներ և cookie-ներ՝ առավելագույնը 13 ամիս\n- Հաղորդակցության տվյալներ՝ վերջին կապից 3 տարի\n- Հաճախորդի հաշիվ՝ մինչև հաճախորդի կողմից հաշվի ջնջումը' },
      { title: '8. Ձեր իրավունքները', text: 'GDPR-ի համաձայն դուք ունեք հետևյալ իրավունքները՝\n\n- Հասանելիության իրավունք՝ ստանալ ձեր տվյալների պատճենը\n- Ուղղման իրավունք՝ ուղղել ոչ ճշգրիտ տվյալները\n- Ջնջման իրավունք՝ պահանջել ձեր տվյալների ջնջումը\n- Սահմանափակման իրավունք՝ սահմանափակել մշակումը\n- Առարկության իրավունք՝ առարկել ձեր տվյալների մշակմանը\n- Տեղափոխելիության իրավունք՝ ստանալ տվյալները կառուցվածքային ձևաչափով\n- Համաձայնությունը հետ կանչելու իրավունք՝ ցանկացած պահի\n\nԻրավունքներից օգտվելու համար դիմեք՝ contact@zont.cab' },
      { title: '9. Cookie ֆայլեր', text: 'Մեր կայքն օգտագործում է cookie-ներ՝\n\n- Անհրաժեշտ cookie-ներ՝ կայքի աշխատանքի համար (սեսիա, լեզվի նախապատվություններ)\n- Վերլուծական cookie-ներ՝ Google Analytics, Yandex Metrica\n- Մարքեթինգային cookie-ներ՝ Meta Pixel, Google Ads\n- Երրորդ կողմի cookie-ներ՝ Stripe (վճարում), Google Maps (քարտեզներ)\n\nCookie-ների նախապատվությունները կարող եք կառավարել բրաուզերի կարգավորումներում։' },
      { title: '10. Տվյալների անվտանգություն', text: 'Մենք կիրառում ենք համապատասխան տեխնիկական և կազմակերպչական միջոցներ ձեր տվյալները պաշտպանելու համար՝\n\n- SSL/TLS գաղտնագրում բոլոր հաղորդակցությունների համար\n- Անվտանգ վճարումներ Stripe-ի միջոցով (PCI DSS հավաստագրված)\n- Անձնական տվյալների սահմանափակ հասանելիություն\n- Համակարգերի կանոնավոր մոնիտորինգ և թարմացում' },
      { title: '11. Անչափահասներ', text: 'Մեր ծառայությունները նախատեսված չեն 16 տարեկանից ցածր անձանց համար։ Մենք գիտակցաբար չենք հավաքում անչափահասների անձնական տվյալներ։' },
      { title: '12. Փոփոխություններ', text: 'Մենք կարող ենք ցանկացած պահի փոփոխել սույն Գաղտնիության քաղաքականությունը։ Փոփոխությունները կհրապարակվեն այս էջում՝ թարմացման ամսաթվի նշումով։' },
      { title: '13. Կապ', text: 'Անձնական տվյալների պաշտպանության հարցերով՝\n\nEmail՝ contact@zont.cab\nՀեռախոս՝ +33 7 83 77 70 27\nՀասցե՝ Zont Technologies Inc.' },
    ],
  },
};

const PrivacyPolicy = () => {
  const lang = useLangRouting('privacy');
  const c = content[lang] || content.en;

  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="privacy-page">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical={buildCanonicalUrl('privacy', lang)} hreflang={buildHreflangCluster('privacy')} />
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
