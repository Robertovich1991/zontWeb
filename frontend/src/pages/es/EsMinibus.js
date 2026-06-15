import React from 'react';
import EsServicePage from './EsServicePage';

const EsMinibus = () => (
  <EsServicePage
    url="/es/minibus-8-plazas-traslado-paris"
    title="Minibus 8 Plazas Paris | Traslado Grupos y Familias Numerosas"
    description="Reserva un minibus privado de 8 plazas para tu traslado en Paris, aeropuertos, Disneyland o gira turistica. Grupos, familias, equipos. Precio fijo."
    keywords="minibus 8 plazas Paris, traslado grupo Paris, minibus aeropuerto Paris, transfer grupo Disneyland, Renault Trafic Paris"
    h1="Minibus privado 8 plazas para traslados en Paris"
    serviceName="Minibus privado 8 plazas"
    intro="Para grupos numerosos, equipos deportivos, familias o tours, ZONT ofrece minibuses privados de 8 plazas con conductor profesional y precio fijo desde aeropuertos, estaciones y hoteles de Paris."
    heroImage="/images/minibus-8-seats-transfer.webp"
    paragraphs={[
      'Los minibuses son la solucion ideal para grupos de hasta 8 pasajeros. Disponemos de Renault Trafic, Mercedes Vito Tourer o equivalentes con capacidad de 8 plazas reales y un amplio maletero — perfectos para familias numerosas, grupos de amigos, equipos corporativos y tours turisticos.',
      'Servicio adaptado a la llegada en aeropuertos parisinos (CDG, Orly, Beauvais), estaciones de tren (Gare du Nord, Gare de Lyon, Saint-Lazare) y para excursiones a Disneyland Paris, Versalles, Giverny o el Loira.',
      'A diferencia del transporte publico o de varios taxis, un minibus privado de 8 plazas ofrece un solo viaje confortable, equipaje agrupado, conversaciones en grupo y un coste total mas bajo que dividirlo en multiples vehiculos.',
    ]}
    bullets={[
      'Capacidad real de 8 pasajeros + equipaje completo',
      'Renault Trafic, Mercedes Vito Tourer o equivalente',
      'Ideal para familias, equipos deportivos, tours',
      'Tarifa unica por vehiculo (no por pasajero)',
      'Sillas infantiles disponibles bajo solicitud',
      'Conductor profesional con licencia VTC',
    ]}
    faq={[
      { q: '¿Cuantos pasajeros caben en un minibus 8 plazas?', a: 'Hasta 8 pasajeros con su equipaje. Para grupos mayores, podemos coordinar varios minibuses o un autocar.' },
      { q: '¿El precio es por persona o por vehiculo?', a: 'Por vehiculo completo. Pagas lo mismo viajen 5 o 8 personas dentro del minibus.' },
      { q: '¿Hay espacio para equipaje voluminoso?', a: 'Si, los minibuses tienen un amplio maletero ademas del compartimento bajo los asientos. Equipaje grande, esquis o carritos de bebe sin problema.' },
      { q: '¿Cubren el aeropuerto CDG con minibus?', a: 'Si, tarifa fija desde 110€ para 8 pasajeros, peajes incluidos. Recepcion personalizada en llegadas.' },
      { q: '¿Puedo reservar para una excursion de un dia?', a: 'Si, ofrecemos el servicio de minibus por horas (4h, 8h, 12h) — ideal para visitas turisticas a Versalles, Giverny o el Loira.' },
    ]}
    relatedLinks={[
      { label: 'Minivan 7 plazas', url: '/es/minivan-traslado-aeropuerto-paris' },
      { label: 'Traslado aeropuerto CDG', url: '/es/traslado-aeropuerto-charles-de-gaulle' },
      { label: 'Traslado Disneyland Paris', url: '/es/traslado-disneyland-paris' },
      { label: 'Chofer privado por horas', url: '/es/chofer-privado-a-disposicion' },
    ]}
  />
);
export default EsMinibus;
