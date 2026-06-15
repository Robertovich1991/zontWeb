import React from 'react';
import EsServicePage from './EsServicePage';

const EsGareSaintLazare = () => (
  <EsServicePage
    url="/es/traslado-estacion-gare-saint-lazare-paris"
    title="Traslado Gare Saint-Lazare Paris | Conductor privado"
    description="Traslado privado desde y hacia la estacion Gare Saint-Lazare en Paris. Trenes hacia Normandia, Versalles. Precio fijo, conductor profesional."
    keywords="traslado Gare Saint-Lazare, taxi Saint-Lazare Paris, conductor privado Saint-Lazare, transfer Normandia Paris"
    h1="Traslado privado Gare Saint-Lazare Paris"
    serviceName="Traslado privado Gare Saint-Lazare"
    intro="Traslados puerta a puerta desde la Gare Saint-Lazare — la estacion historica del oeste de Paris hacia Normandia y Versalles — con conductor privado y precio fijo."
    heroImage="/images/gare-saint-lazare-paris-transfer.webp"
    paragraphs={[
      'La Gare Saint-Lazare es la estacion mas antigua de Paris, situada en el corazon del distrito 8. Conecta con Versalles, Le Havre, Caen, Rouen y toda Normandia. Es tambien una de las estaciones mas concurridas para los viajeros de negocios que llegan al centro de Paris.',
      'Nuestro conductor te espera junto al hall principal (Cour de Rome) con un cartel a tu nombre. Acceso facil al Boulevard Haussmann, Galerias Lafayette y Printemps a pocos minutos andando.',
      'Servicio adaptado a viajeros de negocios: vehiculos berlina Mercedes Clase E con WiFi gratuito, agua de bienvenida y posibilidad de factura con TVA para empresas.',
    ]}
    bullets={[
      'Recepcion en el hall Cour de Rome con cartel personalizado',
      'Acceso directo al distrito comercial (Haussmann, Opera)',
      'WiFi gratuito y agua a bordo',
      'Factura con TVA para clientes business',
      'Mercedes Clase E o V, conductor profesional',
    ]}
    faq={[
      { q: '¿Donde se encuentra el conductor en Saint-Lazare?', a: 'En el hall principal Cour de Rome, junto a la salida hacia Rue Saint-Lazare. El conductor lleva un cartel con tu nombre.' },
      { q: '¿Puedo reservar hacia Versalles desde Saint-Lazare?', a: 'Si, ofrecemos traslados directos hacia el Castillo de Versalles. Precio fijo independientemente del trafico.' },
      { q: '¿Es buena opcion para llegar al aeropuerto CDG?', a: 'Si, Saint-Lazare a CDG toma unos 45 minutos. Tarifa fija desde 70€ con peajes incluidos.' },
      { q: '¿Tienen vehiculos para grupos?', a: 'Si, ofrecemos minivans Mercedes Clase V (hasta 6 pasajeros) y minibuses (hasta 8 pasajeros) bajo reserva.' },
    ]}
    relatedLinks={[
      { label: 'Traslado Gare Montparnasse', url: '/es/traslado-estacion-gare-montparnasse-paris' },
      { label: 'Traslado aeropuerto CDG', url: '/es/traslado-aeropuerto-charles-de-gaulle' },
      { label: 'Conductor privado por horas', url: '/es/chofer-privado-a-disposicion' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsGareSaintLazare;
