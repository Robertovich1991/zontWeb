import React from 'react';
import EsServicePage from './EsServicePage';

const EsGareDeLyon = () => (
  <EsServicePage
    url="/es/traslado-estacion-gare-de-lyon-paris"
    title="Traslado Gare de Lyon Paris | Conductor privado TGV"
    description="Traslado privado desde y hacia la estacion Gare de Lyon. TGV hacia el sur, Italia, Suiza. Precio fijo, recepcion en el anden, 24/7."
    keywords="traslado Gare de Lyon, taxi Gare de Lyon Paris, TGV Paris traslado, conductor privado Gare de Lyon"
    h1="Traslado privado Gare de Lyon Paris"
    serviceName="Traslado privado Gare de Lyon"
    intro="Servicio de traslado puerta a puerta desde la Gare de Lyon — la estacion principal hacia el sur de Francia, Italia y Suiza — con conductor profesional y precio fijo."
    heroImage="/images/gare-de-lyon-paris-transfer.webp"
    paragraphs={[
      'La Gare de Lyon conecta Paris con Lyon, Marsella, Niza, Avignon, Ginebra, Milan, Turin y Zurich a traves de los trenes TGV inOui y TGV Lyria. ZONT te recoge en el anden directamente con un cartel personalizado.',
      'Sus dos halls (Diderot y Daumesnil) pueden ser confusos para los viajeros que llegan por primera vez. Indicas tu hall al reservar y el conductor te espera exactamente alli, sin tener que cruzar la estacion con tu equipaje.',
      'Servicio operativo 24/7 con seguimiento de horarios SNCF y TGV Lyria. Si tu tren llega tarde, esperamos sin cargo extra hasta 60 minutos.',
    ]}
    bullets={[
      'Recepcion en el hall que elijas (Diderot o Daumesnil)',
      'Seguimiento de TGV inOui y TGV Lyria en tiempo real',
      'Ayuda con equipaje desde el anden hasta el vehiculo',
      'Mercedes Clase E, V o Renault Trafic segun grupo',
      'Tarifa fija desde 60€ hacia hoteles del centro de Paris',
    ]}
    faq={[
      { q: '¿En que hall me recogen?', a: 'Indica al reservar si llegas al hall Diderot (principal, TGV) o Daumesnil (RER y trenes regionales). El conductor te espera ahi con un cartel.' },
      { q: '¿Puedo reservar Gare de Lyon hacia Disneyland Paris?', a: 'Si, el trayecto dura unos 45 minutos. Precio fijo independientemente del trafico.' },
      { q: '¿Hacen tarifa hacia el aeropuerto de Orly?', a: 'Si, Gare de Lyon a Orly toma aproximadamente 30 minutos. Tarifa fija desde 55€.' },
      { q: '¿Que pasa si pierdo mi tren?', a: 'Avisanos lo antes posible para reprogramar el traslado. No cobramos cargo por cambio de horario si nos lo comunicas con antelacion.' },
    ]}
    relatedLinks={[
      { label: 'Traslado Gare du Nord', url: '/es/traslado-estacion-gare-du-nord-paris' },
      { label: 'Traslado aeropuerto Orly', url: '/es/traslado-aeropuerto-orly' },
      { label: 'Traslado Disneyland Paris', url: '/es/traslado-disneyland-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsGareDeLyon;
