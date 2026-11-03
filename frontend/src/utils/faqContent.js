// Localized FAQ generator — builds relevant, keyword-rich Q&A from each page's
// real routes/prices. Covers SEO rich results (FAQPage schema) and GEO (AI answers).
// Pages that define their own `faq` array keep it; this is the fallback for the rest.

const HEADINGS = {
  fr: 'Questions fréquentes',
  en: 'Frequently Asked Questions',
  ru: 'Часто задаваемые вопросы',
  es: 'Preguntas frecuentes',
  hy: 'Հաճախ տրվող հարցեր',
};

export function faqHeading(language) {
  return HEADINGS[language] || HEADINGS.en;
}

function validRoutes(c) {
  return (Array.isArray(c.routes) ? c.routes : []).filter((r) => r && r.name && r.price > 0);
}

const GENERATORS = {
  fr: (routes) => {
    const list = routes.slice(0, 3).map((r) => `${r.name} à partir de ${r.price} €`).join(' ; ');
    const priceAnswer = list
      ? `Nos tarifs sont fixes et tout compris. Par exemple : ${list}. Le prix exact est confirmé avant la réservation, sans supplément ni compteur.`
      : 'Nos tarifs sont fixes et confirmés avant la réservation, sans supplément ni compteur. Le montant affiché est le montant payé.';
    return [
      { q: 'Combien coûte le transfert ?', a: priceAnswer },
      { q: 'Quels aéroports, gares et adresses desservez-vous ?', a: 'Nous assurons les transferts depuis et vers les aéroports de Paris (Roissy-Charles-de-Gaulle, Orly, Beauvais), les gares (Gare du Nord, Gare de Lyon, Montparnasse) ainsi que toute adresse en Île-de-France, hôtel ou domicile.' },
      { q: 'Que se passe-t-il si mon vol ou mon train a du retard ?', a: 'Nous suivons votre vol en temps réel et ajustons automatiquement l\'heure de prise en charge. Vous bénéficiez de 60 minutes d\'attente gratuites à l\'aéroport, sans frais supplémentaires en cas de retard.' },
      { q: 'Le service convient-il aux familles et aux groupes ?', a: 'Oui. Notre flotte va de la berline au van 7 places et au minibus 8 places. Les sièges bébé, sièges enfant et rehausseurs sont fournis gratuitement sur demande lors de la réservation.' },
      { q: 'Le prix inclut-il les péages, le parking et l\'attente ?', a: 'Oui, nos tarifs sont tout compris : péages, parking aéroport, temps d\'attente et accueil avec pancarte au nom du passager sont inclus dans le prix affiché. Aucun frais caché.' },
      { q: 'Comment réserver et payer ?', a: 'La réservation se fait en ligne en moins de deux minutes, avec confirmation immédiate. Le paiement est 100 % sécurisé (Visa, Mastercard, Apple Pay) et le service est disponible 24h/24, 7j/7.' },
    ];
  },
  en: (routes) => {
    const list = routes.slice(0, 3).map((r) => `${r.name} from €${r.price}`).join('; ');
    const priceAnswer = list
      ? `Our fares are fixed and all-inclusive. For example: ${list}. The exact price is confirmed before you book, with no surcharges or meter.`
      : 'Our fares are fixed and confirmed before you book, with no surcharges or meter. The price shown is the price you pay.';
    return [
      { q: 'How much does the transfer cost?', a: priceAnswer },
      { q: 'Which airports, stations and addresses do you serve?', a: 'We provide transfers to and from all Paris airports (Roissy-Charles-de-Gaulle, Orly, Beauvais), train stations (Gare du Nord, Gare de Lyon, Montparnasse) and any address across the Île-de-France region, hotel or home.' },
      { q: 'What happens if my flight or train is delayed?', a: 'We track your flight in real time and automatically adjust the pickup time. You also get 60 minutes of free airport waiting, with no extra charge for delays.' },
      { q: 'Is the service suitable for families and groups?', a: 'Yes. Our fleet ranges from sedans to 7-seat vans and 8-seat minibuses. Baby seats, child seats and boosters are provided free of charge on request at booking.' },
      { q: 'Does the price include tolls, parking and waiting?', a: 'Yes, our fares are all-inclusive: tolls, airport parking, waiting time and meet-and-greet with a name board are included in the displayed price. No hidden fees.' },
      { q: 'How do I book and pay?', a: 'Booking takes under two minutes online, with instant confirmation. Payment is 100% secure (Visa, Mastercard, Apple Pay) and the service is available 24/7, 365 days a year.' },
    ];
  },
  ru: (routes) => {
    const list = routes.slice(0, 3).map((r) => `${r.name} — от ${r.price} €`).join('; ');
    const priceAnswer = list
      ? `Наши цены фиксированные и включают всё. Например: ${list}. Точная стоимость подтверждается до бронирования, без доплат и счётчика.`
      : 'Наши цены фиксированные и подтверждаются до бронирования, без доплат и счётчика. Указанная сумма — это сумма к оплате.';
    return [
      { q: 'Сколько стоит трансфер?', a: priceAnswer },
      { q: 'Какие аэропорты, вокзалы и адреса вы обслуживаете?', a: 'Мы выполняем трансферы из/в аэропорты Парижа (Шарль-де-Голль, Орли, Бове), на вокзалы (Gare du Nord, Gare de Lyon, Montparnasse) и по любому адресу в регионе Иль-де-Франс, отель или дом.' },
      { q: 'Что если мой рейс или поезд задерживается?', a: 'Мы отслеживаем ваш рейс в реальном времени и автоматически корректируем время подачи. В аэропорту включено 60 минут бесплатного ожидания, без доплат за задержку.' },
      { q: 'Подходит ли сервис для семей и групп?', a: 'Да. У нас есть седаны, минивэны на 7 мест и минибусы на 8 мест. Детские кресла и бустеры предоставляются бесплатно по запросу при бронировании.' },
      { q: 'Входят ли в цену платные дороги, парковка и ожидание?', a: 'Да, наши цены включают всё: платные дороги, парковку в аэропорту, время ожидания и встречу с табличкой. Скрытых доплат нет.' },
      { q: 'Как забронировать и оплатить?', a: 'Бронирование занимает меньше двух минут онлайн, с мгновенным подтверждением. Оплата полностью безопасна (Visa, Mastercard, Apple Pay), сервис доступен круглосуточно, 7 дней в неделю.' },
    ];
  },
  es: (routes) => {
    const list = routes.slice(0, 3).map((r) => `${r.name} desde ${r.price} €`).join('; ');
    const priceAnswer = list
      ? `Nuestras tarifas son fijas y todo incluido. Por ejemplo: ${list}. El precio exacto se confirma antes de reservar, sin recargos ni taxímetro.`
      : 'Nuestras tarifas son fijas y se confirman antes de reservar, sin recargos ni taxímetro. El importe mostrado es el importe a pagar.';
    return [
      { q: '¿Cuánto cuesta el traslado?', a: priceAnswer },
      { q: '¿Qué aeropuertos, estaciones y direcciones cubren?', a: 'Realizamos traslados desde y hacia todos los aeropuertos de París (Charles de Gaulle, Orly, Beauvais), estaciones de tren (Gare du Nord, Gare de Lyon, Montparnasse) y cualquier dirección de la región de Île-de-France, hotel o domicilio.' },
      { q: '¿Qué pasa si mi vuelo o tren se retrasa?', a: 'Seguimos tu vuelo en tiempo real y ajustamos automáticamente la hora de recogida. Incluye 60 minutos de espera gratuita en el aeropuerto, sin recargo por retrasos.' },
      { q: '¿El servicio es adecuado para familias y grupos?', a: 'Sí. Nuestra flota va desde berlinas hasta minivans de 7 plazas y microbuses de 8 plazas. Las sillas infantiles y los elevadores se ofrecen gratis bajo solicitud al reservar.' },
      { q: '¿El precio incluye peajes, parking y espera?', a: 'Sí, nuestras tarifas son todo incluido: peajes, parking del aeropuerto, tiempo de espera y recibimiento con cartel están incluidos en el precio mostrado. Sin costes ocultos.' },
      { q: '¿Cómo reservar y pagar?', a: 'La reserva se hace online en menos de dos minutos, con confirmación inmediata. El pago es 100% seguro (Visa, Mastercard, Apple Pay) y el servicio está disponible 24/7.' },
    ];
  },
  hy: (routes) => {
    const list = routes.slice(0, 3).map((r) => `${r.name} — ${r.price} €-ic`).join('; ');
    const priceAnswer = list
      ? `Mer gnery fiksvats en ev amen inch neraryal. Orinak՝ ${list}. Chisht giny hastatvum e minch amragrume, arants havelumneri.`
      : 'Mer gnery fiksvats en ev hastatvum en minch amragrume, arants havelumneri kam hashvich.';
    return [
      { q: 'Vorքan e arzhum transfery?', a: priceAnswer },
      { q: 'Vor otanavakayanneri ev hascenern eq spasarkum?', a: 'Menq iraganatsnum enq transferner Parizi bolor otanavakayannerits (Charles de Gaulle, Orly, Beauvais), kayaraninerits yev ցankacac hasce depi Île-de-France.' },
      { q: 'Inch klini, ete chvarcs ushana?', a: 'Menq hetevum enq dzer chvarcin real jamanakum yev kargavorum vercnelu jamy. Otanavakayanum 60 rope anvchar spasum e neraryal.' },
      { q: 'Haroc e ARDYOQ yntanikneri ev khmberi hamar?', a: 'Ayo. Menq uneng sedanner, 7 teghanoc minivaner yev 8 teghanoc minibusner. Mankakan nstateghnern anvchar en pahanjov.' },
      { q: 'Giny nerarumе voghkeri yev ԿԱՅԱՆԱՏԵՂԻ vchary?', a: 'Ayo, mer gnery amen inch neraryal en՝ voghkeri, kayanatexi, spasman jamanaki hamar. Tsatsuk vcharumner chka.' },
      { q: 'Inchpes amragrel ev vcharel?', a: 'Amragrume tevum e 2 ropeits pakas՝ anmijakan hastatmamb. Vcharumn ampoghjovin apahov e, isk sparkumy հասանելի e 24/7.' },
    ];
  },
};

export function buildFaq(c, language) {
  const gen = GENERATORS[language] || GENERATORS.en;
  return gen(validRoutes(c));
}
