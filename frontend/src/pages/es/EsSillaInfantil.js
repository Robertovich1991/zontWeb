import React from 'react';
import EsServicePage from './EsServicePage';

const EsSillaInfantil = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-paris-silla-infantil"
    title="Traslado aeropuerto Paris con silla infantil | ZONT"
    description="Reserva un traslado privado en Paris con silla infantil bajo solicitud. Aeropuertos CDG, Orly, Beauvais, Disneyland y hoteles."
    keywords="traslado aeropuerto Paris silla infantil, transfer Paris con silla bebe, taxi privado silla infantil Paris, traslado Disneyland con ninos"
    h1="Traslado privado en Paris con silla infantil"
    serviceName="Traslado privado en Paris con silla infantil"
    intro="Viajar con ninos requiere comodidad y organizacion. ZONT permite reservar traslados privados en Paris con silla infantil bajo solicitud y segun disponibilidad."
    heroImage="/images/minivan-7-seats-transfer.webp"
    paragraphs={[
      'El servicio esta pensado para familias que llegan a CDG, Orly o Beauvais, o que viajan hacia Disneyland Paris, hoteles y direcciones privadas. Sabemos que los ninos pequenos necesitan seguridad y comodidad durante el viaje, especialmente despues de un vuelo largo.',
      'Para garantizar la mejor organizacion, la solicitud de silla infantil debe indicarse al realizar la reserva. Especifica la edad del nino y el tipo de silla necesaria: silla para bebe (0-12 meses), silla grupo 1 (9-18 kg, 1-4 anos) o elevador (15-36 kg, 4-12 anos).',
      'Las sillas estan disponibles segun disponibilidad y se entregan instaladas correctamente en el vehiculo a tu llegada. Para grupos familiares con varios ninos pequenos recomendamos el minivan Mercedes Clase V que permite instalar varias sillas con comodidad.',
    ]}
    bullets={[
      'Silla para bebe (0-12 meses, 0-13 kg)',
      'Silla grupo 1 (1-4 anos, 9-18 kg)',
      'Asiento elevador (4-12 anos, 15-36 kg)',
      'Instalacion correcta antes de tu llegada',
      'Disponible en berlinas, minivans y microbuses',
      'Sin recargo en la mayoria de los casos (segun disponibilidad)',
    ]}
    faq={[
      { q: '\u00bfHay que pagar suplemento por silla infantil?', a: 'En la mayoria de casos no. La silla infantil esta incluida en el precio del traslado bajo solicitud y segun disponibilidad. Algunas configuraciones especiales pueden conllevar un pequeno suplemento.' },
      { q: '\u00bfPuedo pedir varias sillas infantiles?', a: 'Si. Si viajas con varios ninos pequenos te recomendamos reservar un minivan Mercedes Clase V que permite instalar 2 o 3 sillas sin perder espacio para el equipaje.' },
      { q: '\u00bfCuando hay que solicitar la silla?', a: 'Lo antes posible y siempre al realizar la reserva. Indicanos la edad del nino, su peso aproximado y el tipo de silla preferido. Confirmamos la disponibilidad en menos de 24h.' },
      { q: '\u00bfLas sillas estan homologadas?', a: 'Si. Todas nuestras sillas infantiles cumplen la norma europea ECE R44/04 o R129 (i-Size) y son verificadas regularmente.' },
    ]}
    relatedLinks={[
      { label: 'Traslado desde CDG', url: '/es/traslado-aeropuerto-charles-de-gaulle' },
      { label: 'Traslado a Disneyland Paris', url: '/es/traslado-disneyland-paris' },
      { label: 'Minivan para familias', url: '/es/minivan-traslado-aeropuerto-paris' },
      { label: 'Traslado desde Orly', url: '/es/traslado-aeropuerto-orly' },
    ]}
  />
);

export default EsSillaInfantil;
