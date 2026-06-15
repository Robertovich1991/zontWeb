import React from 'react';
import EsServicePage from './EsServicePage';

const EsMunich = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-munich"
    title="Traslado Aeropuerto Munich | Conductor Privado MUC Oktoberfest"
    description="Traslado privado del aeropuerto Munich Franz Josef Strauss (MUC) hacia tu hotel. Oktoberfest, Marienplatz, BMW Welt. Precio fijo, profesional."
    keywords="traslado aeropuerto Munich, taxi Munich MUC, conductor privado Munich, Oktoberfest transfer, transfer hotel Munich"
    h1="Traslado privado aeropuerto Munich"
    serviceName="Traslado privado a Munich"
    intro="Llegada a Munich Franz Josef Strauss (MUC)? ZONT te ofrece traslados privados premium hacia tu hotel en Munich, Marienplatz o destinos en Baviera."
    heroImage="/images/munich-airport-transfer.webp"
    paragraphs={[
      'El Aeropuerto de Munich-Franz Josef Strauss (MUC) es el segundo aeropuerto de Alemania, situado a 35 km al noreste del centro de Munich. Trayecto al centro en 40-45 minutos por la autopista A9. Dos terminales (T1 y T2) operados principalmente por Lufthansa Star Alliance.',
      'Destinos habituales: Hotel Bayerischer Hof, Mandarin Oriental, Charles Hotel, Marienplatz, Englischer Garten, BMW Welt, Allianz Arena, Stadt Mitte. Tambien traslados a Garmisch-Partenkirchen, Salzburgo, Innsbruck.',
      'Servicio especialmente adaptado al Oktoberfest (septiembre-octubre): sin recargo durante el festival, conductores que conocen los Festzelte y los hoteles cercanos a Theresienwiese. Tambien clientes business para ferias de Messe Munchen.',
    ]}
    bullets={[
      'Recepcion en Terminal 1 o 2 de MUC con cartel',
      'Mercedes Clase E, S, V o minibus 8 plazas',
      'Sin recargo durante el Oktoberfest',
      'Conductores que hablan aleman, ingles y espanol',
      'Servicio business con factura TVA alemana',
    ]}
    faq={[
      { q: '¿Cuanto cuesta de MUC al centro de Munich?', a: 'Tarifa fija desde 80€ en Mercedes Clase E. Minivan Clase V desde 110€ para grupos hasta 6 pasajeros.' },
      { q: '¿Cubren el Oktoberfest?', a: 'Si, sin recargo durante todo el Oktoberfest. Reserva con varias semanas de antelacion — la demanda es muy alta en septiembre-octubre.' },
      { q: '¿Hacen traslados a Salzburgo o Innsbruck?', a: 'Si, traslados desde Munich a Salzburgo (1h30) o Innsbruck (2h). Tarifa fija segun destino.' },
      { q: '¿Tienen vehiculos electricos disponibles?', a: 'Si, bajo solicitud al reservar. Mercedes Clase E hibrida o BMW i5 electrico.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Berlin', url: '/es/traslado-aeropuerto-berlin' },
      { label: 'Traslado aeropuerto Milan', url: '/es/traslado-aeropuerto-milan' },
      { label: 'Conductor privado Paris', url: '/es/conductor-privado-paris' },
      { label: 'Chofer privado por horas', url: '/es/chofer-privado-a-disposicion' },
    ]}
  />
);
export default EsMunich;
