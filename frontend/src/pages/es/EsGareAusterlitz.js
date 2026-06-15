import React from 'react';
import EsServicePage from './EsServicePage';

const EsGareAusterlitz = () => (
  <EsServicePage
    url="/es/traslado-estacion-gare-austerlitz-paris"
    title="Traslado Gare d'Austerlitz Paris | Conductor privado"
    description="Traslado privado desde la Gare d'Austerlitz en Paris. Trenes Intercites, TER, Elipsos hacia Espana. Precio fijo, recepcion en el anden."
    keywords="traslado Gare Austerlitz, taxi Austerlitz Paris, conductor privado Austerlitz, Intercites Paris traslado"
    h1="Traslado privado Gare d'Austerlitz Paris"
    serviceName="Traslado privado Gare d'Austerlitz"
    intro="Traslados puerta a puerta desde la Gare d'Austerlitz — la estacion historica del distrito 13 — con conductor privado, precio fijo y recepcion personalizada."
    heroImage="/images/gare-austerlitz-paris-transfer.webp"
    paragraphs={[
      'La Gare d\'Austerlitz sirve principalmente trenes Intercites hacia el centro de Francia (Orleans, Limoges, Toulouse) y trenes TER de la region Centre-Val de Loire. Tambien recibia hasta 2013 los trenes nocturnos Elipsos hacia Madrid y Barcelona.',
      'Situada en el Quai d\'Austerlitz junto al Sena, ofrece acceso directo al Jardin des Plantes, al Museo de Historia Natural y al Hospital de la Pitie-Salpetriere. Es una estacion mas tranquila que Gare du Nord o Gare de Lyon, perfecta para una recepcion sin estres.',
      'El conductor te espera en el hall principal con un cartel personalizado. Tarifa fija hacia cualquier hotel, aeropuerto o destino turistico en Paris y alrededores.',
    ]}
    bullets={[
      'Recepcion en el hall principal con cartel',
      'Acceso facil al Jardin des Plantes y la Pitie-Salpetriere',
      'Trenes Intercites y TER del centro de Francia',
      '60 minutos de espera gratuitos en caso de retraso',
      'Tarifa fija desde 55€ hacia el centro de Paris',
    ]}
    faq={[
      { q: '¿Donde encuentro a mi conductor en Austerlitz?', a: 'En el hall principal junto a la salida Boulevard de l\'Hopital. El conductor lleva un cartel con tu nombre y te ayuda con el equipaje.' },
      { q: '¿Cubren llegadas tardias o nocturnas?', a: 'Si, ZONT opera 24/7 sin recargo nocturno. Solo necesitamos el horario exacto de llegada al reservar.' },
      { q: '¿Puedo reservar a CDG desde Austerlitz?', a: 'Si, Austerlitz a CDG dura unos 50 minutos. Tarifa fija desde 70€ con peajes incluidos.' },
      { q: '¿Hay servicio hacia Disneyland desde Austerlitz?', a: 'Si, traslado directo hacia Disneyland Paris en aproximadamente 50 minutos. Precio fijo desde 80€.' },
    ]}
    relatedLinks={[
      { label: 'Traslado Gare de Lyon', url: '/es/traslado-estacion-gare-de-lyon-paris' },
      { label: 'Traslado aeropuerto Orly', url: '/es/traslado-aeropuerto-orly' },
      { label: 'Disneyland Paris', url: '/es/traslado-disneyland-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsGareAusterlitz;
