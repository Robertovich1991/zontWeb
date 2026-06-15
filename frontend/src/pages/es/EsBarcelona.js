import React from 'react';
import EsServicePage from './EsServicePage';

const EsBarcelona = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-barcelona"
    title="Traslado Aeropuerto Barcelona | Conductor Privado El Prat"
    description="Traslado privado desde el aeropuerto de Barcelona El Prat (BCN) hacia tu hotel en Barcelona, Sitges, Castelldefels. Precio fijo, conductor profesional."
    keywords="traslado aeropuerto Barcelona, taxi El Prat BCN, conductor privado Barcelona, transfer Sitges Barcelona, taxi a Castelldefels"
    h1="Traslado privado aeropuerto Barcelona El Prat"
    serviceName="Traslado privado a Barcelona"
    intro="Llegada a Barcelona-El Prat (BCN)? ZONT te ofrece un traslado privado puerta a puerta con precio fijo, recepcion personalizada y conductor profesional."
    heroImage="/images/barcelona-airport-transfer.webp"
    paragraphs={[
      'El Aeropuerto Josep Tarradellas Barcelona-El Prat (BCN) es el segundo aeropuerto de Espana, con dos terminales (T1 y T2) que reciben vuelos nacionales, internacionales y low-cost. Nuestros conductores te esperan en el area de llegadas internacionales con un cartel personalizado.',
      'Trayecto al centro de Barcelona en unos 25-30 minutos por la C-32 y B-10. Destinos habituales: Hotel Arts, W Barcelona, Majestic, Mandarin Oriental, Las Ramblas, Eixample, Sagrada Familia, Camp Nou.',
      'Ofrecemos tambien traslados desde Barcelona hacia Sitges (30 min), Castelldefels (15 min), Costa Brava (1h30) y Andorra. Precio fijo, sin recargo nocturno ni de fin de semana.',
    ]}
    bullets={[
      'Recepcion en Terminal 1 o Terminal 2 con cartel',
      'Trayecto BCN al centro en 25-30 minutos',
      'Mercedes Clase E, S, V o minibus 8 plazas',
      'Tambien Sitges, Costa Brava, Andorra',
      'Sin recargo nocturno o de fin de semana',
    ]}
    faq={[
      { q: '¿Cuanto cuesta el traslado del aeropuerto BCN al centro?', a: 'Tarifa fija desde 60€ en Mercedes Clase E para 1-3 pasajeros. Minivan Clase V desde 85€ para grupos hasta 6.' },
      { q: '¿Donde me encuentro con el conductor?', a: 'En el area de llegadas internacionales (T1 o T2 segun tu vuelo), justo despues de la zona de equipajes. El conductor lleva un cartel con tu nombre.' },
      { q: '¿Cubren Sitges desde el aeropuerto?', a: 'Si, trayecto de 30 minutos. Tarifa fija desde 80€ en Mercedes Clase E.' },
      { q: '¿Trabajais con cruceros del puerto de Barcelona?', a: 'Si, recogemos y dejamos clientes directamente en las terminales de cruceros del puerto. Tarifa fija desde 50€ desde el aeropuerto.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Alicante', url: '/es/traslado-aeropuerto-alicante' },
      { label: 'Traslado aeropuerto Paris', url: '/es/traslado-aeropuerto-paris' },
      { label: 'Conductor privado Paris', url: '/es/conductor-privado-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsBarcelona;
