import React from 'react';
import EsServicePage from './EsServicePage';

const EsGareMontparnasse = () => (
  <EsServicePage
    url="/es/traslado-estacion-gare-montparnasse-paris"
    title="Traslado Gare Montparnasse Paris | Conductor privado TGV oeste"
    description="Traslado privado Gare Montparnasse. TGV hacia Bretana, Burdeos, Nantes y suroeste. Precio fijo, recepcion en el anden, 24/7."
    keywords="traslado Gare Montparnasse, taxi Montparnasse Paris, TGV oeste Paris, conductor privado Montparnasse"
    h1="Traslado privado Gare Montparnasse Paris"
    serviceName="Traslado privado Gare Montparnasse"
    intro="Servicio premium de traslado desde la Gare Montparnasse — la puerta de entrada hacia el oeste de Francia (Bretana, Burdeos, Nantes) — con precio fijo y conductor profesional."
    heroImage="/images/gare-montparnasse-paris-transfer.webp"
    paragraphs={[
      'La Gare Montparnasse conecta Paris con Bretana (Rennes, Brest, Quimper), Burdeos, Nantes, La Rochelle y todo el suroeste de Francia mediante los trenes TGV inOui. Es tambien terminal del TGV hacia Espana (Hendaya, Bilbao).',
      'La estacion tiene 3 halls (1, 2 y Vaugirard). Indica al reservar tu hall de llegada y el conductor te espera ahi con un cartel. Acceso facil al distrito 14 y la Tour Montparnasse.',
      'Servicio ideal para viajeros que vienen del oeste y desean trasladarse a hoteles del centro de Paris, aeropuertos (CDG/Orly) o destinos turisticos como Disneyland.',
    ]}
    bullets={[
      'Recepcion en el hall 1, 2 o Vaugirard segun tu llegada',
      'Seguimiento de TGV inOui Atlantico en tiempo real',
      '60 minutos de espera gratuitos si tu tren se retrasa',
      'Mercedes Clase E, V o Renault Trafic',
      'Tarifa fija desde 60€ hacia el centro de Paris',
    ]}
    faq={[
      { q: '¿En que hall me recogen en Montparnasse?', a: 'Indica al reservar si llegas al Hall 1 (principal TGV), Hall 2 o Hall Vaugirard. El conductor te espera ahi con un cartel.' },
      { q: '¿Puedo reservar Montparnasse al aeropuerto de Orly?', a: 'Si, Montparnasse a Orly toma aproximadamente 30 minutos. Tarifa fija desde 50€.' },
      { q: '¿Cubren los trenes de larga distancia desde Espana?', a: 'Si, recogemos viajeros de los TGV Renfe-SNCF procedentes de Barcelona, Madrid y Hendaya.' },
      { q: '¿Hacen traslados nocturnos?', a: 'Si, ZONT opera 24/7. Sin recargo nocturno comparado con las tarifas diurnas.' },
    ]}
    relatedLinks={[
      { label: 'Traslado Gare de Lyon', url: '/es/traslado-estacion-gare-de-lyon-paris' },
      { label: 'Traslado Gare Austerlitz', url: '/es/traslado-estacion-gare-austerlitz-paris' },
      { label: 'Traslado aeropuerto Orly', url: '/es/traslado-aeropuerto-orly' },
      { label: 'Disneyland Paris', url: '/es/traslado-disneyland-paris' },
    ]}
  />
);
export default EsGareMontparnasse;
