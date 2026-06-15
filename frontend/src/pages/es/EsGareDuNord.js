import React from 'react';
import EsServicePage from './EsServicePage';

const EsGareDuNord = () => (
  <EsServicePage
    url="/es/traslado-estacion-gare-du-nord-paris"
    title="Traslado Gare du Nord Paris | Conductor privado precio fijo"
    description="Reserva tu traslado privado desde o hacia la estacion Gare du Nord en Paris. Eurostar, Thalys, TGV. Precio fijo, conductor profesional, 24/7."
    keywords="traslado Gare du Nord, taxi Gare du Nord Paris, conductor privado Gare du Nord, Eurostar Paris traslado, transfer estacion Paris"
    h1="Traslado privado Gare du Nord Paris"
    serviceName="Traslado privado Gare du Nord"
    intro="ZONT te lleva desde o hacia la Gare du Nord — el hub europeo de Eurostar y Thalys — con un conductor privado, precio fijo y recepcion personalizada."
    heroImage="/images/gare-du-nord-paris-transfer.webp"
    paragraphs={[
      'La Gare du Nord es la estacion mas concurrida de Europa, con conexiones diarias hacia Londres (Eurostar), Bruselas, Amsterdam (Thalys) y todas las regiones del norte de Francia. Te recogemos directamente en el anden principal con un cartel a tu nombre.',
      'Tras un largo viaje en tren, evita las colas de taxi y el metro abarrotado. Nuestros vehiculos Mercedes Clase E o V te esperan en el aparcamiento oficial de la estacion. El conductor te ayuda con el equipaje y conoce las rutas alternativas para esquivar el trafico parisino.',
      'Tarifa fija desde la Gare du Nord hacia cualquier hotel de Paris o aeropuerto (CDG, Orly, Beauvais). Sin recargo si tu tren llega con retraso — seguimos los horarios SNCF en tiempo real.',
    ]}
    bullets={[
      'Recepcion personalizada en el anden con cartel',
      'Seguimiento de los horarios de Eurostar y Thalys',
      '60 minutos de espera gratuitos si tu tren se retrasa',
      'Vehiculos Mercedes Clase E o V, perfectamente limpios',
      'Precio fijo confirmado al reservar, peajes incluidos',
    ]}
    faq={[
      { q: '¿Donde me encontrare con el conductor en la Gare du Nord?', a: 'El conductor te espera junto a la salida principal (Rue de Dunkerque) con un cartel a tu nombre. Si llegas en Eurostar, justo a la salida de la zona de control.' },
      { q: '¿Cubre el servicio los trenes nocturnos?', a: 'Si, ZONT opera 24/7. Reserva tu traslado nocturno con el horario exacto de llegada de tu tren.' },
      { q: '¿Puedo reservar Gare du Nord hacia el aeropuerto CDG?', a: 'Si, es uno de nuestros trayectos mas habituales. Precio fijo desde 65€ segun el tipo de vehiculo.' },
      { q: '¿Hay descuento para grupos?', a: 'Para grupos de mas de 4 personas, reserva un minivan o minibus con tarifa unica por vehiculo.' },
    ]}
    relatedLinks={[
      { label: 'Traslado Gare de Lyon', url: '/es/traslado-estacion-gare-de-lyon-paris' },
      { label: 'Traslado Gare Saint-Lazare', url: '/es/traslado-estacion-gare-saint-lazare-paris' },
      { label: 'Traslado aeropuerto CDG', url: '/es/traslado-aeropuerto-charles-de-gaulle' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsGareDuNord;
