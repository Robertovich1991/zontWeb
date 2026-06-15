import React from 'react';
import EsServicePage from './EsServicePage';

const EsMonaco = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-monaco"
    title="Traslado Aeropuerto Monaco | Conductor Privado Grand Prix"
    description="Traslado privado del aeropuerto de Niza hacia Monaco. Grand Prix, Casino, Monte-Carlo. Mercedes Clase S, precio fijo, conductor profesional."
    keywords="traslado Monaco, Monaco Grand Prix transfer, taxi Monte-Carlo, conductor privado Monaco, Niza a Monaco"
    h1="Traslado privado a Monaco Monte-Carlo"
    serviceName="Traslado privado a Monaco"
    intro="ZONT ofrece traslados de lujo del aeropuerto de Niza hacia Monaco, Monte-Carlo y el Casino — perfectos para el Grand Prix, Yacht Show y eventos exclusivos."
    heroImage="/images/monaco-airport-transfer.webp"
    paragraphs={[
      'Monaco no tiene aeropuerto propio. La forma mas rapida de llegar es a traves del aeropuerto de Niza-Costa Azul (NCE), a solo 30 minutos por la autopista A8. Tambien ofrecemos traslados desde el helipuerto de Monaco (LNMC) para llegadas en helicoptero.',
      'Nuestros conductores te recogen en Terminal 1 o Terminal 2 de Niza con un cartel personalizado. Trayecto en Mercedes Clase E, Clase S o Clase V para grupos. Destinos habituales: Hotel de Paris, Hermitage, Metropole, Fairmont, Casino de Monte-Carlo, Yacht Club de Monaco.',
      'Servicio adaptado a eventos exclusivos: Grand Prix de Monaco (mayo), Monaco Yacht Show (septiembre), Monte-Carlo Open de Tenis (abril). Sin recargo durante los eventos.',
    ]}
    bullets={[
      'Trayecto Niza-Monaco en 30 minutos via A8',
      'Vehiculos premium: Mercedes Clase E, S o V',
      'Sin recargo durante Grand Prix o Yacht Show',
      'Conductores que conocen los hoteles y palacios de Monaco',
      'Posibilidad de chofer por horas para todo el dia',
    ]}
    faq={[
      { q: '¿Cuanto cuesta el traslado de Niza a Monaco?', a: 'Tarifa fija desde 95€ en Mercedes Clase E. Clase S desde 150€. Minivan Clase V desde 130€.' },
      { q: '¿Cubren el Grand Prix de Monaco?', a: 'Si, sin recargo durante el Grand Prix. Reserva con al menos 1 mes de antelacion para asegurar disponibilidad.' },
      { q: '¿Ofrecen chofer para todo el dia en Monaco?', a: 'Si, servicio de chofer privado por horas (4h, 8h, 12h) — ideal para visitas, reuniones de negocios o eventos.' },
      { q: '¿Hacen traslados al helipuerto de Monaco?', a: 'Si, transferimos clientes entre el aeropuerto de Niza y el helipuerto LNMC para conexiones rapidas.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Niza', url: '/es/traslado-aeropuerto-niza' },
      { label: 'Traslado aeropuerto Cannes', url: '/es/traslado-aeropuerto-cannes' },
      { label: 'Chofer privado por horas', url: '/es/chofer-privado-a-disposicion' },
      { label: 'Conductor privado Paris', url: '/es/conductor-privado-paris' },
    ]}
  />
);
export default EsMonaco;
