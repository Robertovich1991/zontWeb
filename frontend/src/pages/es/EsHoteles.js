import React from 'react';
import EsServicePage from './EsServicePage';

const EsHoteles = () => (
  <EsServicePage
    url="/es/traslados-para-hoteles-paris"
    title="Servicio de traslados para hoteles en Paris | ZONT"
    description="ZONT ofrece soluciones de traslados privados para hoteles en Paris: reservas para clientes, conductores profesionales, seguimiento y comision hotelera."
    keywords="traslados hoteles Paris, servicio transfer hoteles, traslado privado hotel Paris, conductor para hotel Paris"
    h1="Servicio de traslados privados para hoteles en Paris"
    serviceName="Servicio de traslados privados para hoteles en Paris"
    intro="ZONT ofrece soluciones de traslados privados para hoteles en Paris y la region parisina. Nuestro servicio permite a los hoteles proponer a sus clientes traslados fiables hacia aeropuertos, estaciones, Disneyland Paris y otras direcciones."
    heroImage="/images/luxury-sedan-transfer.webp"
    paragraphs={[
      'Nos encargamos de la organizacion del traslado, seguimiento del conductor, atencion al cliente y coordinacion de la reserva. El hotel puede ofrecer un servicio adicional de calidad sin gestionar la operacion diaria.',
      'Esta solucion ayuda a mejorar la experiencia del huesped y puede generar ingresos adicionales para el hotel mediante comision por reserva. Trabajamos con hoteles de 3, 4 y 5 estrellas en Paris, asi como con hoteles boutique y residencias de lujo.',
      'Ponemos a disposicion una plataforma kiosco fisica con terminal de pago Stripe para que el conserje pueda reservar traslados directamente desde la recepcion, asi como un panel admin online para hoteles que prefieren reservar desde un ordenador.',
    ]}
    bullets={[
      'Comision atractiva por cada reserva confirmada',
      'Kiosco fisico con terminal Stripe disponible en recepcion',
      'Panel admin online para reservas rapidas',
      'Atencion al cliente 24/7 en frances, ingles y espanol',
      'Conductores profesionales con licencia VTC',
      'Vehiculos premium adaptados al standing del hotel',
      'Facturacion mensual unica para el hotel',
    ]}
    faq={[
      { q: '\u00bfComo funciona la comision para el hotel?', a: 'Por cada traslado confirmado y pagado por un cliente del hotel, ZONT abona una comision pre-acordada al hotel. La facturacion se realiza mensualmente con detalle de las reservas.' },
      { q: '\u00bfQue es el kiosco fisico ZONT?', a: 'Es una pantalla tactil con terminal de pago Stripe instalada en la recepcion del hotel. El conserje o el propio cliente puede reservar un traslado en pocos clics y pagar directamente con tarjeta sin contacto.' },
      { q: '\u00bfQue tipo de hoteles trabaja con ZONT?', a: 'Trabajamos con hoteles de 3, 4 y 5 estrellas, hoteles boutique, residencias de lujo y palacios. Nuestro servicio se adapta al standing de cada establecimiento.' },
      { q: '\u00bfHay un compromiso de exclusividad?', a: 'No exigimos exclusividad. El hotel puede colaborar con otros prestadores de traslado a la vez. Nuestro objetivo es ofrecer el mejor servicio para que los huespedes vuelvan a elegirnos.' },
      { q: '\u00bfCon que rapidez se confirma una reserva?', a: 'En menos de 5 minutos para reservas inmediatas o con anticipacion. Confirmacion instantanea para horarios estandar y respuesta en menos de 30 minutos para horarios especiales.' },
    ]}
    relatedLinks={[
      { label: 'Conductor privado en Paris', url: '/es/conductor-privado-paris' },
      { label: 'Traslado desde CDG', url: '/es/traslado-aeropuerto-charles-de-gaulle' },
      { label: 'Minivan para grupos', url: '/es/minivan-traslado-aeropuerto-paris' },
      { label: 'Traslado a Disneyland Paris', url: '/es/traslado-disneyland-paris' },
    ]}
  />
);

export default EsHoteles;
