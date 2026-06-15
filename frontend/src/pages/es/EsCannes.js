import React from 'react';
import EsServicePage from './EsServicePage';

const EsCannes = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-cannes"
    title="Traslado Aeropuerto Cannes | Conductor Privado Festival"
    description="Traslado privado desde el aeropuerto de Niza hacia Cannes, Mandelieu o Cannes-La Bocca. Festival de Cannes, MIPIM, Cannes Lions. Precio fijo."
    keywords="traslado aeropuerto Cannes, taxi Cannes festival, conductor privado Cannes, Niza a Cannes traslado, MIPIM Cannes"
    h1="Traslado privado aeropuerto Cannes"
    serviceName="Traslado privado a Cannes"
    intro="ZONT ofrece traslados premium desde el aeropuerto de Niza-Costa Azul hacia Cannes, Mandelieu y la Croisette — perfectos para el Festival de Cannes, MIPIM y Cannes Lions."
    heroImage="/images/cannes-airport-transfer.webp"
    paragraphs={[
      'Cannes no tiene aeropuerto comercial propio (solo el pequeno aerodromo Cannes-Mandelieu para aviacion privada). Para llegar a Cannes, la mayoria de viajeros internacionales aterrizan en el aeropuerto de Niza (NCE), a 40 minutos.',
      'Recogemos a nuestros clientes en Terminal 1 o Terminal 2 del aeropuerto de Niza segun la compania aerea. El conductor te espera en llegadas con un cartel a tu nombre y te lleva directamente a tu hotel en la Croisette, al Palais des Festivals o a Cannes Mandelieu.',
      'Servicio especialmente adaptado a eventos del Palais des Festivals: Festival de Cannes (mayo), MIPIM (marzo), Cannes Lions (junio). Precio fijo sin recargo durante los eventos.',
    ]}
    bullets={[
      'Recepcion en Terminal 1 o 2 de Niza con cartel',
      'Trayecto Niza-Cannes en 40 minutos por la A8',
      'Sin recargo durante el Festival de Cannes o MIPIM',
      'Mercedes Clase E, S o V segun tu necesidad',
      'Servicio adaptado a delegaciones de empresa (MICE)',
    ]}
    faq={[
      { q: '¿Cuanto cuesta el traslado de Niza a Cannes?', a: 'Tarifa fija desde 80€ en Mercedes Clase E para 1-3 pasajeros. Clase S desde 130€, minivan Clase V desde 110€.' },
      { q: '¿Cubren el Festival de Cannes?', a: 'Si, sin recargo. Reserva con varias semanas de antelacion durante el Festival (mayo) para asegurar disponibilidad.' },
      { q: '¿Trabajais con la aviacion privada en Cannes-Mandelieu?', a: 'Si, recogemos clientes en el aerodromo de Cannes-Mandelieu (CEQ). Tarifa fija desde 50€ hasta hoteles de la Croisette.' },
      { q: '¿Hay servicios para grupos o equipos de produccion?', a: 'Si, ofrecemos minibuses hasta 8 plazas y vehiculos premium para delegaciones MICE.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Niza', url: '/es/traslado-aeropuerto-niza' },
      { label: 'Traslado aeropuerto Monaco', url: '/es/traslado-aeropuerto-monaco' },
      { label: 'Conductor privado', url: '/es/conductor-privado-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsCannes;
