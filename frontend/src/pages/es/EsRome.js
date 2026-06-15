import React from 'react';
import EsServicePage from './EsServicePage';

const EsRome = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-roma"
    title="Traslado Aeropuerto Roma | Conductor Privado Fiumicino y Ciampino"
    description="Traslado privado del aeropuerto de Fiumicino (FCO) o Ciampino (CIA) hacia tu hotel en Roma. Vaticano, Coliseo, Trastevere. Precio fijo."
    keywords="traslado aeropuerto Roma, taxi Fiumicino FCO, taxi Ciampino CIA, conductor privado Roma, transfer hotel Roma"
    h1="Traslado privado aeropuertos de Roma"
    serviceName="Traslado privado a Roma"
    intro="Llegada a Roma Fiumicino (FCO) o Ciampino (CIA)? ZONT te ofrece traslados privados premium hacia tu hotel en Roma, el Vaticano, Trastevere y todos los destinos romanos."
    heroImage="/images/rome-airport-transfer.webp"
    paragraphs={[
      'El aeropuerto Leonardo da Vinci-Fiumicino (FCO) es el mas grande de Italia, situado a 32 km al suroeste de Roma. Trayecto al centro en 35-40 minutos. El aeropuerto de Ciampino (CIA) recibe principalmente vuelos low-cost (Ryanair) a 15 km del centro.',
      'Nuestros conductores te esperan en el area de llegadas internacionales con un cartel a tu nombre. Destinos habituales: Hotel Hassler Roma, St. Regis, Hotel de Russie, Vaticano, Coliseo, Plaza Navona, Trastevere, Fontana di Trevi.',
      'Servicio adaptado al turismo religioso (audiencias papales del miercoles), bodas en Roma, conferencias y eventos. Precio fijo independiente del trafico romano, peajes y propinas incluidos.',
    ]}
    bullets={[
      'Recepcion en Fiumicino o Ciampino con cartel',
      'Mercedes Clase E, S, V o minibus 8 plazas',
      'Conductores que hablan italiano, ingles y espanol',
      'Tarifa fija incluso con trafico romano',
      'Servicio adaptado a turismo religioso y bodas',
    ]}
    faq={[
      { q: '¿Cuanto cuesta el traslado de Fiumicino al centro de Roma?', a: 'Tarifa fija desde 65€ en Mercedes Clase E. Minivan Clase V desde 90€ para grupos hasta 6 pasajeros.' },
      { q: '¿Cubren Ciampino para vuelos low-cost?', a: 'Si, traslado desde Ciampino al centro en 30 minutos. Tarifa fija desde 50€.' },
      { q: '¿Hacen traslados al Vaticano?', a: 'Si, te dejamos en la entrada de Plaza San Pedro o en hoteles cerca del Vaticano. Sin recargo en dia de audiencia papal.' },
      { q: '¿Trabajais con cruceros desde Civitavecchia?', a: 'Si, traslados desde el puerto de Civitavecchia a aeropuertos de Roma. Tarifa fija desde 120€.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Milan', url: '/es/traslado-aeropuerto-milan' },
      { label: 'Traslado aeropuerto Paris', url: '/es/traslado-aeropuerto-paris' },
      { label: 'Conductor privado Paris', url: '/es/conductor-privado-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsRome;
