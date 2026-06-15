import React from 'react';
import EsServicePage from './EsServicePage';

const EsBerlin = () => (
  <EsServicePage
    url="/es/traslado-aeropuerto-berlin"
    title="Traslado Aeropuerto Berlin | Conductor Privado BER Brandenburg"
    description="Traslado privado del aeropuerto Berlin Brandenburg (BER) hacia tu hotel en Berlin. Mitte, Kreuzberg, Potsdam. Precio fijo, conductor profesional."
    keywords="traslado aeropuerto Berlin, taxi Berlin BER, conductor privado Berlin Brandenburg, transfer hotel Berlin"
    h1="Traslado privado aeropuerto Berlin Brandenburg"
    serviceName="Traslado privado a Berlin"
    intro="Llegada a Berlin Brandenburg Willy Brandt (BER)? ZONT te ofrece traslados privados premium hacia tu hotel en Berlin, Potsdam o cualquier destino aleman."
    heroImage="/images/berlin-airport-transfer.webp"
    paragraphs={[
      'El Aeropuerto Berlin Brandenburg Willy Brandt (BER) es el unico aeropuerto comercial de la capital alemana desde 2020. Situado a 25 km al sur del centro, conecta Berlin con destinos europeos y de larga distancia. Trayecto al centro en 30-40 minutos segun el trafico.',
      'Destinos habituales: Hotel Adlon Kempinski, Hotel de Rome, Regent Berlin, Mandala Hotel, Berlin Mitte, Kreuzberg, Charlottenburg, Potsdamer Platz, Brandenburg Gate. Tambien traslados a Potsdam (45 min) y Tegel-Reinickendorf.',
      'Servicio adaptado a viajeros business asistiendo a ferias como IFA (electronica), ITB Berlin (turismo), Berlinale (festival de cine) y conferencias en Estrel Congress Center.',
    ]}
    bullets={[
      'Recepcion en Terminal 1 o 2 de BER con cartel',
      'Mercedes Clase E, S, V o minibus 8 plazas',
      'Trayecto BER a Mitte en 30-40 minutos',
      'Conductores que hablan aleman, ingles y espanol',
      'Sin recargo durante IFA, ITB o Berlinale',
    ]}
    faq={[
      { q: '¿Cuanto cuesta de BER al centro de Berlin?', a: 'Tarifa fija desde 70€ en Mercedes Clase E. Minivan Clase V desde 90€ para grupos hasta 6 pasajeros.' },
      { q: '¿Cubren llegadas en Terminal 2?', a: 'Si, ambos terminales (T1 y T2). Indica al reservar tu terminal de llegada para una recepcion sin esperas.' },
      { q: '¿Hacen traslados a Potsdam?', a: 'Si, traslado desde BER a Potsdam (Sanssouci, Cecilienhof). Tarifa fija desde 85€.' },
      { q: '¿Trabajais con ferias como IFA o Berlinale?', a: 'Si, sin recargo durante las grandes ferias. Reserva con antelacion para asegurar disponibilidad.' },
    ]}
    relatedLinks={[
      { label: 'Traslado aeropuerto Munich', url: '/es/traslado-aeropuerto-munich' },
      { label: 'Traslado aeropuerto Paris', url: '/es/traslado-aeropuerto-paris' },
      { label: 'Conductor privado Paris', url: '/es/conductor-privado-paris' },
      { label: 'Minivan privado', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);
export default EsBerlin;
