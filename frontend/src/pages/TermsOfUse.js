import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  fr: {
    seoTitle: 'Conditions Generales de Vente et d\'Utilisation | Zont.cab',
    seoDesc: 'Consultez les conditions generales de vente et d\'utilisation du service de transport avec chauffeur Zont.cab.',
    lastUpdate: 'Derniere mise a jour : 14 mai 2026',
    title: 'Conditions Generales de Vente et d\'Utilisation',
    intro: 'Les presentes Conditions Generales de Vente et d\'Utilisation definissent les regles applicables aux reservations de services de transport avec chauffeur effectuees sur le site www.zont.cab.',
    sections: [
      { title: '1. Editeur du site', text: `Le site Zont.cab est exploite par :\n\nZont Technologies Inc.\nEmail : contact@zont.cab\nTelephone : +33 7 83 77 70 27\n\nLe site affiche egalement les mentions legales, notamment les informations de l'hebergeur du site, conformement aux obligations des sites professionnels en France.` },
      { title: '2. Objet du service', text: `Zont.cab propose un service de reservation de vehicules avec chauffeur, notamment pour :\n\n- Transferts aeroport\n- Transferts gare\n- Deplacements prives ou professionnels\n- Mise a disposition avec chauffeur\n- Transferts touristiques ou evenementiels\n\nZont.cab peut realiser la prestation avec ses propres chauffeurs ou avec des chauffeurs partenaires/sous-traitants selectionnes.` },
      { title: '3. Reservation', text: `Le client peut reserver un trajet directement sur le site internet, par telephone, par email ou via un partenaire.\n\nLors de la reservation, le client doit fournir des informations exactes :\n\n- Nom et prenom\n- Numero de telephone\n- Email\n- Adresse de depart\n- Adresse d'arrivee\n- Date et heure de prise en charge\n- Numero de vol ou de train si necessaire\n- Nombre de passagers\n- Nombre de bagages\n- Categorie de vehicule souhaitee\n\nLa reservation est consideree comme confirmee uniquement apres validation par Zont.cab et/ou paiement selon le mode choisi.` },
      { title: '4. Prix', text: `Les prix affiches sur le site sont indiques en euros, toutes taxes comprises, sauf mention contraire.\n\nLe prix peut dependre notamment de :\n\n- La distance\n- La duree estimee\n- La categorie du vehicule\n- L'horaire\n- Le lieu de prise en charge\n- Les frais de parking, peages ou supplements eventuels\n- Le nombre de passagers et de bagages\n\nLe prix confirme au moment de la reservation est valable pour les informations fournies par le client. En cas de modification du trajet, d'arret supplementaire, d'attente importante ou d'information incorrecte, un supplement peut etre applique.` },
      { title: '5. Paiement', text: `Le paiement peut etre effectue :\n\n- En ligne par carte bancaire\n- Par lien de paiement securise\n- Par terminal de paiement\n- En especes si accepte par Zont.cab\n- Par facturation pour les clients professionnels ou partenaires valides\n\nZont.cab se reserve le droit de demander un paiement complet ou partiel avant la realisation du trajet.\n\nEn cas de paiement refuse ou non recu, Zont.cab peut annuler la reservation.` },
      { title: '6. Modification de reservation', text: `Toute demande de modification doit etre envoyee le plus tot possible a Zont.cab.\n\nLa modification est acceptee uniquement apres confirmation par Zont.cab. Elle peut entrainer un changement de prix.\n\nExemples de modification :\n\n- Changement d'heure\n- Changement d'adresse\n- Ajout d'un arret\n- Changement de categorie de vehicule\n- Modification du nombre de passagers ou de bagages` },
      { title: '7. Annulation par le client', text: `Sauf conditions particulieres indiquees lors de la reservation, les frais d'annulation sont les suivants :\n\n- Annulation plus de 24 heures avant le depart : remboursement total ou avoir\n- Annulation entre 24 heures et 6 heures avant le depart : frais de 50 % du prix\n- Annulation moins de 6 heures avant le depart : frais de 100 % du prix\n- Absence du client au point de rendez-vous : frais de 100 % du prix\n\nPour les reservations specifiques, groupes, evenements, mises a disposition ou longues distances, des conditions particulieres peuvent s'appliquer.` },
      { title: '8. Droit de retractation', text: `Conformement aux regles applicables a la vente a distance, le consommateur beneficie en principe d'un delai de retractation de 14 jours pour certains contrats de services.\n\nCependant, lorsque le client demande expressement l'execution du service a une date ou heure determinee, notamment pour un transport reserve a l'avance, le droit de retractation peut etre limite ou exclu selon la nature exacte du service.` },
      { title: '9. Retard du client', text: `Le client doit etre present au point de rendez-vous a l'heure prevue.\n\nTemps d'attente inclus :\n\n- Prise en charge en ville : 15 minutes\n- Gare : 30 minutes\n- Aeroport : 60 minutes apres l'atterrissage reel du vol\n\nAu-dela du temps d'attente inclus, des frais supplementaires peuvent etre factures. Si le client ne se presente pas et ne repond pas aux appels ou messages, la prestation peut etre consideree comme annulee sans remboursement.` },
      { title: '10. Retard du vol ou du train', text: `Lorsque le client fournit un numero de vol ou de train valide, Zont.cab peut suivre l'evolution de l'arrivee.\n\nEn cas de retard important du vol ou du train, Zont.cab fera son possible pour adapter l'heure de prise en charge. Toutefois, la disponibilite du chauffeur ou du vehicule ne peut pas etre garantie dans tous les cas.` },
      { title: '11. Point de rendez-vous', text: `Pour les aeroports, gares ou lieux publics, le point de rendez-vous est communique au client par email, SMS, WhatsApp ou directement sur la page de reservation.\n\nLe client doit verifier les instructions envoyees par Zont.cab. En cas de difficulte, le client doit contacter rapidement le chauffeur ou le service client.` },
      { title: '12. Bagages', text: `Le client doit declarer le nombre de bagages lors de la reservation.\n\nZont.cab peut refuser la prise en charge si le nombre ou le volume des bagages depasse la capacite du vehicule reserve.\n\nLes bagages restent sous la responsabilite du client. Zont.cab ne peut etre responsable d'un objet oublie, perdu ou deteriore, sauf faute prouvee du chauffeur ou de la societe.` },
      { title: '13. Enfants et sieges bebe', text: `Le client doit indiquer a l'avance s'il voyage avec un enfant et s'il souhaite un siege bebe ou rehausseur.\n\nLa disponibilite des sieges enfant doit etre confirmee par Zont.cab. Un supplement peut etre applique.` },
      { title: '14. Comportement a bord', text: `Le client et les passagers doivent respecter le chauffeur, le vehicule et les regles de securite.\n\nIl est interdit de :\n\n- Fumer ou vapoter dans le vehicule\n- Consommer de l'alcool ou des produits interdits\n- Degrader le vehicule\n- Transporter des objets dangereux ou illegaux\n- Avoir un comportement agressif ou dangereux\n\nEn cas de comportement inapproprie, le chauffeur peut refuser ou interrompre la prestation sans remboursement.\n\nTout dommage cause au vehicule par le client ou ses passagers pourra etre facture.` },
      { title: '15. Responsabilite de Zont.cab', text: `Zont.cab s'engage a faire ses meilleurs efforts pour fournir un service fiable, ponctuel et professionnel.\n\nToutefois, Zont.cab ne peut etre tenue responsable en cas de retard ou d'impossibilite d'execution cause par :\n\n- Embouteillages importants\n- Accident\n- Greve\n- Conditions meteorologiques\n- Decision administrative\n- Fermeture de route\n- Evenement de force majeure\n- Erreur ou information incomplete fournie par le client` },
      { title: '16. Sous-traitance et partenaires', text: `Zont.cab peut confier certaines prestations a des chauffeurs ou societes partenaires.\n\nDans ce cas, Zont.cab veille a selectionner des partenaires professionnels, mais chaque partenaire reste responsable de ses obligations legales et professionnelles.` },
      { title: '17. Reclamations', text: `Toute reclamation doit etre envoyee par email a : contact@zont.cab\n\nLe client doit preciser :\n\n- Son nom\n- La date du trajet\n- Le numero de reservation\n- Le motif de la reclamation\n- Les justificatifs eventuels\n\nZont.cab s'engage a etudier la demande et a repondre dans un delai raisonnable.` },
      { title: '18. Mediation de la consommation', text: `Conformement au Code de la consommation, le client consommateur doit avoir acces a un dispositif de mediation de la consommation en cas de litige non resolu avec le professionnel.\n\nAvant de saisir le mediateur, le client doit d'abord adresser une reclamation ecrite a Zont.cab. Le consommateur doit ensuite saisir le mediateur dans un delai d'un an a compter de sa reclamation ecrite.` },
      { title: '19. Donnees personnelles', text: `Zont.cab collecte certaines donnees personnelles necessaires a la reservation et a l'execution du service : identite, coordonnees, informations de trajet, informations de paiement, echanges avec le service client.\n\nCes donnees sont utilisees pour : gerer les reservations, contacter le client, organiser le transport, traiter le paiement, gerer la facturation, ameliorer le service, respecter les obligations legales.\n\nLe client peut exercer ses droits d'acces, de rectification, d'effacement, d'opposition ou de limitation en contactant : contact@zont.cab` },
      { title: '20. Cookies', text: `Le site peut utiliser des cookies pour : le fonctionnement technique du site, les statistiques, la publicite, l'amelioration de l'experience utilisateur, le suivi des conversions.\n\nLorsque la loi l'exige, le consentement de l'utilisateur est demande avant le depot de certains cookies.` },
      { title: '21. Propriete intellectuelle', text: `Tous les elements du site Zont.cab sont proteges : textes, logos, images, design, marques, structure du site, contenus.\n\nToute reproduction ou utilisation sans autorisation est interdite.` },
      { title: '22. Disponibilite du site', text: `Zont.cab fait ses meilleurs efforts pour maintenir le site accessible.\n\nToutefois, le site peut etre temporairement indisponible pour maintenance, mise a jour, incident technique ou cause exterieure.` },
      { title: '23. Loi applicable', text: `Les presentes Conditions Generales sont soumises au droit francais.\n\nEn cas de litige, les parties chercheront d'abord une solution amiable. A defaut, le litige sera soumis aux tribunaux competents.` },
    ],
  },
  en: {
    seoTitle: 'Terms and Conditions | Zont.cab',
    seoDesc: 'Read the terms and conditions for Zont.cab chauffeur transport booking services.',
    lastUpdate: 'Last updated: May 14, 2026',
    title: 'Terms and Conditions of Sale and Use',
    intro: 'These Terms and Conditions define the rules applicable to chauffeur-driven transport service bookings made on www.zont.cab.',
    sections: [
      { title: '1. Website Publisher', text: `The website Zont.cab is operated by:\n\nZont Technologies Inc.\nEmail: contact@zont.cab\nPhone: +33 7 83 77 70 27` },
      { title: '2. Purpose of the Service', text: `Zont.cab offers a chauffeur-driven vehicle booking service, including:\n\n- Airport transfers\n- Train station transfers\n- Private or business trips\n- Chauffeur at disposal\n- Tourist or event transfers\n\nZont.cab may deliver the service using its own drivers or selected partner drivers/subcontractors.` },
      { title: '3. Booking', text: `Customers may book a trip directly on the website, by phone, email or through a partner.\n\nDuring booking, the customer must provide accurate information:\n\n- Full name\n- Phone number\n- Email\n- Pick-up address\n- Drop-off address\n- Pick-up date and time\n- Flight or train number if applicable\n- Number of passengers\n- Number of luggage items\n- Desired vehicle category\n\nA booking is considered confirmed only after validation by Zont.cab and/or payment.` },
      { title: '4. Pricing', text: `Prices displayed on the website are in euros, all taxes included, unless stated otherwise.\n\nPricing may depend on:\n\n- Distance\n- Estimated duration\n- Vehicle category\n- Time of day\n- Pick-up location\n- Parking, tolls or additional fees\n- Number of passengers and luggage\n\nThe price confirmed at booking time is valid for the information provided. Changes to the route, additional stops, significant waiting time or incorrect information may result in additional charges.` },
      { title: '5. Payment', text: `Payment may be made:\n\n- Online by credit card\n- Via secure payment link\n- By payment terminal\n- In cash if accepted by Zont.cab\n- By invoice for professional clients or approved partners\n\nZont.cab reserves the right to request full or partial payment before the trip.\n\nIf payment is declined or not received, Zont.cab may cancel the booking.` },
      { title: '6. Booking Modification', text: `Any modification request must be sent to Zont.cab as early as possible.\n\nModifications are accepted only after confirmation by Zont.cab and may result in a price change.` },
      { title: '7. Cancellation by Customer', text: `Unless special conditions are indicated at booking, cancellation fees are:\n\n- More than 24 hours before departure: full refund or credit\n- Between 24 and 6 hours before departure: 50% of the price\n- Less than 6 hours before departure: 100% of the price\n- No-show at the meeting point: 100% of the price\n\nSpecial conditions may apply for group bookings, events, disposals or long-distance transfers.` },
      { title: '8. Right of Withdrawal', text: `Under distance selling regulations, consumers may benefit from a 14-day withdrawal period for certain service contracts.\n\nHowever, when the customer expressly requests service execution at a specific date or time, the right of withdrawal may be limited or excluded.` },
      { title: '9. Customer Delay', text: `The customer must be present at the meeting point at the scheduled time.\n\nIncluded waiting time:\n\n- City pick-up: 15 minutes\n- Train station: 30 minutes\n- Airport: 60 minutes after actual flight landing\n\nBeyond the included waiting time, additional charges may apply. If the customer does not show up and does not respond to calls or messages, the service may be considered cancelled without refund.` },
      { title: '10. Flight or Train Delay', text: `When the customer provides a valid flight or train number, Zont.cab may track arrival status.\n\nIn case of significant delay, Zont.cab will do its best to adjust the pick-up time. However, driver or vehicle availability cannot be guaranteed in all cases.` },
      { title: '11. Meeting Point', text: `For airports, train stations or public locations, the meeting point is communicated to the customer by email, SMS, WhatsApp or on the booking page.\n\nThe customer must verify instructions sent by Zont.cab and contact the driver or customer service promptly if needed.` },
      { title: '12. Luggage', text: `The customer must declare luggage at the time of booking.\n\nZont.cab may refuse the service if luggage exceeds the vehicle capacity.\n\nLuggage remains the customer's responsibility. Zont.cab cannot be held responsible for forgotten, lost or damaged items, unless driver fault is proven.` },
      { title: '13. Children and Child Seats', text: `The customer must indicate in advance if traveling with a child and if a child seat or booster is needed.\n\nAvailability must be confirmed by Zont.cab. An additional charge may apply.` },
      { title: '14. On-Board Conduct', text: `Customers and passengers must respect the driver, the vehicle and safety rules.\n\nThe following are prohibited:\n\n- Smoking or vaping\n- Consuming alcohol or prohibited substances\n- Damaging the vehicle\n- Carrying dangerous or illegal items\n- Aggressive or dangerous behavior\n\nThe driver may refuse or interrupt the service without refund in case of inappropriate behavior.\n\nAny damage to the vehicle caused by the customer or passengers may be charged.` },
      { title: '15. Zont.cab Liability', text: `Zont.cab commits to providing reliable, punctual and professional service.\n\nHowever, Zont.cab cannot be held liable for delays or inability to perform caused by:\n\n- Heavy traffic\n- Accidents\n- Strikes\n- Weather conditions\n- Administrative decisions\n- Road closures\n- Force majeure\n- Customer error or incomplete information` },
      { title: '16. Subcontracting and Partners', text: `Zont.cab may entrust certain services to partner drivers or companies.\n\nZont.cab ensures professional partner selection, but each partner remains responsible for their own legal and professional obligations.` },
      { title: '17. Complaints', text: `Any complaint must be sent by email to: contact@zont.cab\n\nThe customer must specify: name, trip date, booking number, reason for complaint, and any supporting documents.\n\nZont.cab commits to reviewing the request and responding within a reasonable timeframe.` },
      { title: '18. Consumer Mediation', text: `In accordance with consumer law, customers have access to consumer mediation in case of unresolved disputes with the professional.\n\nBefore contacting the mediator, the customer must first submit a written complaint to Zont.cab.` },
      { title: '19. Personal Data', text: `Zont.cab collects personal data necessary for booking and service execution: identity, contact details, trip information, payment information, customer service exchanges.\n\nThis data is used to: manage bookings, contact the customer, organize transport, process payment, manage invoicing, improve service, and comply with legal obligations.\n\nCustomers may exercise their rights of access, rectification, erasure, objection or limitation by contacting: contact@zont.cab` },
      { title: '20. Cookies', text: `The website may use cookies for: technical operation, statistics, advertising, user experience improvement, and conversion tracking.\n\nWhen required by law, user consent is requested before placing certain cookies.` },
      { title: '21. Intellectual Property', text: `All elements of the Zont.cab website are protected: texts, logos, images, design, trademarks, site structure, and content.\n\nAny reproduction or use without authorization is prohibited.` },
      { title: '22. Website Availability', text: `Zont.cab makes its best efforts to keep the website accessible.\n\nHowever, the website may be temporarily unavailable for maintenance, updates, technical incidents or external causes.` },
      { title: '23. Applicable Law', text: `These Terms and Conditions are governed by French law.\n\nIn case of dispute, the parties will first seek an amicable resolution. Failing that, the dispute will be submitted to the competent courts.` },
    ],
  },
  ru: {
    seoTitle: 'Условия использования | Zont.cab',
    seoDesc: 'Ознакомьтесь с условиями использования и бронирования услуг транспорта с водителем Zont.cab.',
    lastUpdate: 'Последнее обновление: 14 мая 2026',
    title: 'Общие условия продажи и использования',
    intro: 'Настоящие Общие условия продажи и использования определяют правила, применимые к бронированию услуг транспорта с водителем на сайте www.zont.cab.',
    sections: [
      { title: '1. Издатель сайта', text: 'Сайт Zont.cab управляется:\n\nZont Technologies Inc.\nEmail: contact@zont.cab\nТелефон: +33 7 83 77 70 27' },
      { title: '2. Назначение услуги', text: 'Zont.cab предлагает услугу бронирования автомобилей с водителем:\n\n- Трансферы из аэропорта\n- Трансферы с вокзала\n- Частные или деловые поездки\n- Водитель в распоряжении\n- Туристические или событийные трансферы\n\nZont.cab может выполнять услуги своими водителями или через отобранных партнеров.' },
      { title: '3. Бронирование', text: 'Клиент может забронировать поездку на сайте, по телефону, email или через партнера.\n\nПри бронировании клиент должен предоставить точную информацию:\n\n- Имя и фамилия\n- Номер телефона\n- Email\n- Адрес отправления\n- Адрес прибытия\n- Дата и время подачи\n- Номер рейса или поезда\n- Количество пассажиров\n- Количество багажа\n- Категория автомобиля\n\nБронирование считается подтвержденным только после валидации Zont.cab и/или оплаты.' },
      { title: '4. Цены', text: 'Цены на сайте указаны в евро, все налоги включены.\n\nЦена может зависеть от:\n\n- Расстояния\n- Ориентировочной продолжительности\n- Категории автомобиля\n- Времени суток\n- Места подачи\n- Парковки, дорожных сборов\n- Количества пассажиров и багажа\n\nЦена, подтвержденная при бронировании, действительна для предоставленной информации. Изменения маршрута, дополнительные остановки или неверная информация могут повлечь доплату.' },
      { title: '5. Оплата', text: 'Оплата может быть произведена:\n\n- Онлайн банковской картой\n- По защищенной ссылке\n- Через терминал оплаты\n- Наличными (если принимается)\n- По счету для корпоративных клиентов\n\nZont.cab оставляет за собой право запросить полную или частичную предоплату.\n\nПри отказе в оплате бронирование может быть отменено.' },
      { title: '6. Изменение бронирования', text: 'Любой запрос на изменение должен быть отправлен как можно раньше.\n\nИзменение принимается только после подтверждения Zont.cab и может повлечь изменение цены.' },
      { title: '7. Отмена клиентом', text: 'Условия отмены:\n\n- Более 24 часов до отправления: полный возврат\n- От 24 до 6 часов до отправления: 50% стоимости\n- Менее 6 часов до отправления: 100% стоимости\n- Неявка: 100% стоимости\n\nДля групповых бронирований и мероприятий могут применяться особые условия.' },
      { title: '8. Право на отказ', text: 'В соответствии с правилами дистанционной продажи, потребитель имеет право на отказ в течение 14 дней для определенных контрактов.\n\nОднако при заказе услуги на конкретную дату это право может быть ограничено.' },
      { title: '9. Опоздание клиента', text: 'Клиент должен быть на месте встречи вовремя.\n\nВключенное время ожидания:\n\n- В городе: 15 минут\n- Вокзал: 30 минут\n- Аэропорт: 60 минут после посадки\n\nСверх этого времени могут взиматься дополнительные сборы.' },
      { title: '10. Задержка рейса или поезда', text: 'При предоставлении номера рейса Zont.cab может отслеживать прибытие.\n\nПри значительной задержке Zont.cab постарается адаптировать время подачи, но доступность водителя не гарантируется.' },
      { title: '11. Точка встречи', text: 'Для аэропортов и вокзалов точка встречи сообщается по email, SMS, WhatsApp или на странице бронирования.\n\nКлиент должен проверить инструкции и связаться с водителем при необходимости.' },
      { title: '12. Багаж', text: 'Клиент должен указать багаж при бронировании.\n\nZont.cab может отказать в обслуживании при превышении вместимости.\n\nБагаж остается под ответственностью клиента.' },
      { title: '13. Дети и детские кресла', text: 'Клиент должен заранее указать наличие детей и необходимость детского кресла.\n\nДоступность подтверждается Zont.cab. Может взиматься доплата.' },
      { title: '14. Поведение на борту', text: 'Запрещено:\n\n- Курить или парить\n- Употреблять алкоголь или запрещенные вещества\n- Повреждать автомобиль\n- Перевозить опасные предметы\n- Вести себя агрессивно\n\nВодитель может прервать поездку без возврата средств. Ущерб автомобилю оплачивается клиентом.' },
      { title: '15. Ответственность Zont.cab', text: 'Zont.cab не несет ответственности за задержки, вызванные:\n\n- Пробками\n- ДТП\n- Забастовками\n- Погодными условиями\n- Форс-мажором\n- Ошибками клиента' },
      { title: '16. Субподряд и партнеры', text: 'Zont.cab может привлекать партнеров-водителей.\n\nКаждый партнер несет ответственность за свои обязательства.' },
      { title: '17. Жалобы', text: 'Жалобы направляйте на: contact@zont.cab\n\nУкажите имя, дату поездки, номер бронирования, причину жалобы.\n\nZont.cab обязуется рассмотреть запрос в разумные сроки.' },
      { title: '18. Медиация', text: 'В соответствии с законодательством, потребитель имеет доступ к медиации при неразрешенных спорах.\n\nПеред обращением к медиатору необходимо направить письменную жалобу в Zont.cab.' },
      { title: '19. Персональные данные', text: 'Zont.cab собирает данные для бронирования: личность, контакты, информацию о поездке, платежные данные.\n\nКлиент может реализовать свои права, обратившись по адресу: contact@zont.cab' },
      { title: '20. Файлы cookie', text: 'Сайт использует файлы cookie для: работы сайта, статистики, рекламы, улучшения опыта.\n\nСогласие запрашивается в соответствии с законом.' },
      { title: '21. Интеллектуальная собственность', text: 'Все элементы сайта защищены. Любое воспроизведение без разрешения запрещено.' },
      { title: '22. Доступность сайта', text: 'Zont.cab прилагает все усилия для обеспечения доступности сайта. Временные перерывы возможны.' },
      { title: '23. Применимое право', text: 'Настоящие Условия регулируются французским правом.\n\nСпоры решаются мирным путем или через компетентные суды.' },
    ],
  },
  hy: {
    seoTitle: 'Օգտագործման պայմաններ | Zont.cab',
    seoDesc: ' Delays.',
    lastUpdate: 'Delays: 14 delays 2026',
    title: 'Delays',
    intro: 'Delays www.zont.cab.',
    sections: [
      { title: '1. Delays', text: 'Zont Technologies Inc.\nEmail: contact@zont.cab\nPhone: +33 7 83 77 70 27' },
    ],
  },
};

const TermsOfUse = () => {
  const { language } = useLanguage();
  const c = content[language] || content.fr;

  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="terms-page">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://www.zont.cab/terms" />
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

export default TermsOfUse;
