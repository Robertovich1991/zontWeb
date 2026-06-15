import React from 'react';
import EsServicePage from './EsServicePage';

const EsAlicante = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-alicante"
    title="Traslado Aeropuerto Alicante | Conductor Privado Costa Blanca"
    description="Traslado privado desde el aeropuerto de Alicante-Elche (ALC) hacia Benidorm, Torrevieja, Calpe, Denia. Costa Blanca. Precio fijo, 24/7."
    keywords="traslado aeropuerto Alicante, taxi Alicante ALC, conductor privado Benidorm, Costa Blanca transfer, taxi a Torrevieja"
    h1="Traslado privado aeropuerto Alicante-Elche"
    serviceName="Traslado privado a la Costa Blanca"
    intro="Aeropuerto de Alicante-Elche Miguel Hernandez? ZONT te ofrece traslados privados hacia Alicante, Benidorm, Torrevieja, Calpe, Denia y toda la Costa Blanca."
    heroImage="/images/alicante-airport-transfer.webp"
    paragraphs={[
      'El Aeropuerto de Alicante-Elche (ALC) es la principal puerta de entrada a la Costa Blanca, recibiendo viajeros britanicos, alemanes y nordicos en busca de sol. Nuestros conductores te esperan en el area de llegadas con un cartel personalizado.',
      'Destinos habituales: Alicante centro (15 min), Benidorm (50 min), Torrevieja (40 min), Calpe (1h), Denia (1h30), Altea, Javea, Murcia. Tambien traslados hacia los puertos de cruceros y campos de golf.',
      'Servicio ideal para familias y grupos de amigos que llegan en vuelos low-cost: Mercedes Clase V o minibus hasta 8 plazas con espacio para todo el equipaje y carritos de bebe.',
    ]}
    bullets={[
      'Recepcion en el area de llegadas ALC con cartel',
      'Mercedes Clase E, V o minibus 8 plazas',
      'Trayectos a Benidorm, Torrevieja, Calpe, Denia',
      'Familias bienvenidas — sillas infantiles disponibles',
      'Precio fijo sin recargo nocturno o festivo',
    ]}
    faq={[
      { q: '¿Cuanto cuesta del aeropuerto de Alicante a Benidorm?', a: 'Tarifa fija desde 70€ en Mercedes Clase E. Minivan Clase V desde 95€ para grupos hasta 6.' },
      { q: '¿Cubren Torrevieja desde el aeropuerto?', a: 'Si, trayecto de 40 minutos. Tarifa fija desde 60€ en Mercedes Clase E.' },
      { q: '¿Trabajais con vuelos low-cost?', a: 'Si, todos los vuelos. Hacemos seguimiento del horario de aterrizaje en tiempo real, sin recargo si tu vuelo se retrasa.' },
      { q: '¿Tienen sillas infantiles?', a: 'Si, sillas para bebe, grupo 1 (9-18kg) y elevadores disponibles bajo solicitud al reservar.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Barcelona', url: '/es/traslado-aeropuerto-barcelona' },
      { label: 'Traslado aeropuerto Paris', url: '/es/traslado-aeropuerto-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
      { label: 'Traslado con silla infantil', url: '/es/traslado-aeropuerto-paris-silla-infantil' },
    ]}
  />
);
export default EsAlicante;
