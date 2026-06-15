import React from 'react';
import EsServicePage from './EsServicePage';

const EsMilan = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-milan"
    title="Traslado Aeropuerto Milan | Conductor Privado Malpensa y Linate"
    description="Traslado privado del aeropuerto de Milan-Malpensa (MXP) o Linate (LIN) hacia el centro, Como, Bergamo, Turin. Moda, business, precio fijo."
    keywords="traslado aeropuerto Milan, taxi Malpensa MXP, taxi Linate LIN, conductor privado Milan, transfer Como Milan"
    h1="Traslado privado aeropuertos de Milan"
    serviceName="Traslado privado a Milan"
    intro="Llegada a Milan-Malpensa (MXP), Linate (LIN) o Bergamo-Orio al Serio (BGY)? ZONT te ofrece traslados premium en Mercedes con conductor profesional."
    heroImage="/images/milan-airport-transfer.webp"
    paragraphs={[
      'Milan tiene 3 aeropuertos principales: Malpensa (MXP) a 50 km del centro, Linate (LIN) a 8 km y Bergamo-Orio al Serio (BGY) a 50 km. Cubrimos los tres con precio fijo y recepcion personalizada.',
      'Destinos habituales: Hotel Bulgari Milano, Park Hyatt, Four Seasons, Mandarin Oriental, Duomo, Galleria Vittorio Emanuele, Quadrilatero della Moda, Navigli. Tambien Lago di Como, Bergamo y Turin.',
      'Servicio adaptado a clientes business: Salone del Mobile (abril), Milan Fashion Week (febrero/septiembre), Salone Internazionale del Mobile y exposiciones de Fiera Milano Rho. Sin recargo durante los grandes eventos.',
    ]}
    bullets={[
      'Recepcion en Malpensa T1/T2, Linate o Bergamo',
      'Mercedes Clase E, S, V o minibus 8 plazas',
      'Sin recargo durante Fashion Week o Salone del Mobile',
      'Servicio business con factura TVA italiana disponible',
      'Conductores que hablan italiano, ingles y espanol',
    ]}
    faq={[
      { q: '¿Cuanto cuesta de Malpensa al centro de Milan?', a: 'Tarifa fija desde 75€ en Mercedes Clase E. Trayecto de 50 minutos. Minivan Clase V desde 100€ para grupos.' },
      { q: '¿Cubren Linate al centro?', a: 'Si, trayecto rapido de 20 minutos. Tarifa fija desde 50€ en Mercedes Clase E.' },
      { q: '¿Trabajais con Fiera Milano Rho?', a: 'Si, traslado directo entre Malpensa o Linate y Fiera Milano Rho. Tarifa fija segun aeropuerto y tipo de vehiculo.' },
      { q: '¿Hacen traslados al Lago di Como?', a: 'Si, traslados desde aeropuertos de Milan hacia Como, Bellagio, Cernobbio. Tarifa fija desde 130€.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Roma', url: '/es/traslado-aeropuerto-roma' },
      { label: 'Traslado aeropuerto Munich', url: '/es/traslado-aeropuerto-munich' },
      { label: 'Conductor privado Paris', url: '/es/conductor-privado-paris' },
      { label: 'Chofer privado por horas', url: '/es/chofer-privado-a-disposicion' },
    ]}
  />
);
export default EsMilan;
