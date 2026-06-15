import React from 'react';
import EsServicePage from './EsServicePage';

const EsNice = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-niza"
    title="Traslado Aeropuerto Niza | Conductor Privado Costa Azul"
    description="Traslado privado desde el aeropuerto de Niza (NCE) hacia Cannes, Monaco, Antibes, Saint-Tropez. Precio fijo, conductor profesional, 24/7."
    keywords="traslado aeropuerto Niza, taxi NCE Niza, conductor privado Niza, Costa Azul transfer, Niza a Monaco taxi"
    h1="Traslado privado aeropuerto de Niza"
    serviceName="Traslado privado aeropuerto Niza"
    intro="ZONT te ofrece traslados premium desde el aeropuerto de Niza Costa Azul hacia Cannes, Monaco, Antibes, Saint-Tropez y todos los destinos de la Riviera Francesa."
    heroImage="/images/nice-airport-transfer.webp"
    paragraphs={[
      'El Aeropuerto de Niza (NCE) es el segundo de Francia por trafico de pasajeros y la puerta de entrada principal a la Costa Azul. Nuestros conductores te esperan en la zona de llegadas (Terminal 1 o Terminal 2 segun tu vuelo) con un cartel personalizado.',
      'Niza es el punto de partida ideal para descubrir Monaco (30 min), Cannes (40 min), Antibes (25 min), Saint-Tropez (1h30) y los pueblos perched del interior como Eze, Saint-Paul-de-Vence y Mougins.',
      'Reserva con precio fijo todo incluido — sin recargo en temporada alta del Festival de Cannes, Grand Prix de Monaco o eventos especiales. Vehiculos Mercedes adaptados a la calidad de la Costa Azul.',
    ]}
    bullets={[
      'Recepcion en Terminal 1 o 2 del aeropuerto NCE',
      'Vehiculos Mercedes Clase E, S, V o minibus',
      'Conductores que hablan ingles y frances',
      'Precio fijo sin recargos por eventos (Cannes, Monaco GP)',
      'Servicio premium para Yacht Club, casinos, hoteles 5*',
    ]}
    faq={[
      { q: '¿Cuanto dura el trayecto del aeropuerto de Niza a Monaco?', a: 'Aproximadamente 30 minutos por la autopista A8. Precio fijo desde 90€ por trayecto.' },
      { q: '¿Cuanto cuesta de Niza a Cannes?', a: 'Trayecto de 40 minutos. Tarifa fija desde 80€ en Mercedes Clase E para 1-3 pasajeros.' },
      { q: '¿Es buena opcion para el Festival de Cannes?', a: 'Si, garantizamos precio fijo durante todo el festival — sin recargo. Reserva con antelacion para asegurar disponibilidad.' },
      { q: '¿Cubren Saint-Tropez desde Niza?', a: 'Si, trayecto de aproximadamente 1h30. Tarifa fija desde 250€ en Clase E.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Cannes', url: '/es/traslado-aeropuerto-cannes' },
      { label: 'Traslado aeropuerto Monaco', url: '/es/traslado-aeropuerto-monaco' },
      { label: 'Conductor privado Paris', url: '/es/conductor-privado-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsNice;
