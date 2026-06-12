import React from 'react';
import EsServicePage from './EsServicePage';

const EsMinivan = () => (
  <EsServicePage
    url="/es/minivan-traslado-aeropuerto-paris"
    title="Minivan para traslado aeropuerto Paris | Familias y grupos"
    description="Reserva un minivan privado para traslados en Paris, aeropuertos y Disneyland. Ideal para familias y grupos, precio fijo y equipaje incluido."
    keywords="minivan aeropuerto Paris, traslado grupo Paris, minivan Disneyland Paris, minivan CDG Paris, traslado familiar Paris"
    h1="Minivan privado para traslados en Paris"
    serviceName="Minivan privado para traslados en Paris"
    intro="Para familias y grupos, ZONT ofrece traslados privados en minivan desde los aeropuertos de Paris, Disneyland, estaciones y hoteles."
    heroImage="/images/minivan-7-seats-transfer.webp"
    paragraphs={[
      'Los minivans permiten viajar comodamente con varios pasajeros y equipaje. Este servicio es perfecto para familias con ninos, grupos turisticos, viajes de empresa y pasajeros que necesitan mas espacio que en un vehiculo estandar.',
      'Disponemos de modelos como Mercedes Clase V capaces de transportar hasta 6 pasajeros y todo su equipaje en condiciones de confort y seguridad. Bajo solicitud, se pueden anadir sillas infantiles para bebes o ninos pequenos segun disponibilidad.',
      'Reserva tu minivan con precio fijo y conductor profesional para viajar sin estres en Paris y alrededores. El conductor te espera en el aeropuerto, estacion u hotel con un cartel a tu nombre y te ayuda con el equipaje hasta el vehiculo.',
    ]}
    bullets={[
      'Mercedes Clase V o equivalente para hasta 6 pasajeros',
      'Espacio amplio para maletas y equipaje voluminoso',
      'Sillas infantiles disponibles bajo solicitud',
      'Conductor profesional con licencia VTC',
      'Precio fijo, sin sorpresas ni recargos',
    ]}
    faq={[
      { q: '\u00bfCuantos pasajeros caben en un minivan ZONT?', a: 'Hasta 6 pasajeros con equipaje. Para grupos mayores ofrecemos microbuses de hasta 8 plazas.' },
      { q: '\u00bfPuedo solicitar sillas infantiles en el minivan?', a: 'Si, bajo solicitud y segun disponibilidad. Indica al reservar la edad del nino y el tipo de silla (bebe, grupo 1, elevador).' },
      { q: '\u00bfEl precio es por persona o por vehiculo?', a: 'El precio es por vehiculo completo. Pagas lo mismo viajen 1 o 6 personas dentro del minivan.' },
      { q: '\u00bfA que aeropuertos cubre el servicio de minivan?', a: 'Charles de Gaulle (CDG), Orly y Beauvais. Tambien hacemos traslados desde y hacia Disneyland Paris.' },
    ]}
    relatedLinks={[
      { label: 'Traslado desde CDG', url: '/es/traslado-aeropuerto-charles-de-gaulle' },
      { label: 'Traslado desde Orly', url: '/es/traslado-aeropuerto-orly' },
      { label: 'Traslado a Disneyland Paris', url: '/es/traslado-disneyland-paris' },
      { label: 'Traslado con silla infantil', url: '/es/traslado-aeropuerto-paris-silla-infantil' },
    ]}
  />
);

export default EsMinivan;
