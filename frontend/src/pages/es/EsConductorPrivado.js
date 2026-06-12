import React from 'react';
import EsServicePage from './EsServicePage';

const EsConductorPrivado = () => (
  <EsServicePage
    url="/es/conductor-privado-paris"
    title="Conductor privado en Paris | Traslados y servicio premium"
    description="Reserva un conductor privado en Paris para traslados aeropuerto, hoteles, eventos, Disneyland y viajes de negocios. Servicio profesional con precio fijo."
    keywords="conductor privado Paris, chofer privado Paris, chauffeur prive Paris, servicio conductor Paris, traslado premium Paris"
    h1="Conductor privado en Paris"
    serviceName="Servicio de conductor privado en Paris"
    intro="ZONT ofrece servicio de conductor privado en Paris para traslados aeropuerto, viajes de negocios, hoteles, eventos, Disneyland Paris y desplazamientos personalizados."
    heroImage="/images/luxury-sedan-transfer.webp"
    paragraphs={[
      'Nuestros conductores profesionales ofrecen un servicio puntual, discreto y comodo. Puedes reservar un traslado simple o solicitar un servicio mas personalizado segun tus necesidades: visitas turisticas, traslado entre reuniones, conduccion durante un evento o disposicion por horas.',
      'El servicio de conductor privado es ideal para clientes que buscan comodidad, seguridad y una experiencia premium en Paris. La flota incluye Mercedes Clase E, Mercedes Clase S, BMW Serie 7 y vehiculos minivan para grupos pequenos.',
      'Reserva online en pocos pasos y conoce el precio antes del viaje. Sin sorpresas, sin taximetro y con asistencia disponible para organizar tu agenda en Paris. El conductor se adapta a tu programa y respeta tus horarios.',
    ]}
    bullets={[
      'Conductores profesionales con licencia VTC',
      'Vehiculos premium Mercedes y BMW de menos de 3 anos',
      'Disponibilidad por horas (4h, 8h, 12h) o por trayecto',
      'Servicio discreto para viajeros VIP y de negocios',
      'WiFi a bordo, cargadores y privacidad total',
      'Disponible 24/7 en Paris y region parisina',
    ]}
    faq={[
      { q: '\u00bfPuedo reservar un conductor por varias horas?', a: 'Si. Ofrecemos servicio de disposicion por 4, 8 o 12 horas, ideal para visitas turisticas, jornadas de trabajo o eventos en Paris y alrededores.' },
      { q: '\u00bfQue vehiculos ofreceis para el servicio premium?', a: 'Mercedes Clase E para 1-3 pasajeros, Mercedes Clase S o BMW Serie 7 para servicio de lujo, y minivans Mercedes Clase V para grupos hasta 6 personas.' },
      { q: '\u00bfEl conductor habla varios idiomas?', a: 'La mayoria de nuestros conductores habla frances, ingles y nociones de espanol. Para clientes hispanohablantes podemos asignar un conductor especifico bajo solicitud.' },
      { q: '\u00bfQue diferencia hay entre conductor privado y taxi?', a: 'Un conductor privado ofrece un servicio personalizado con vehiculo premium, precio fijo conocido por adelantado y asistencia VIP. Un taxi es un servicio puntual sin reserva ni personalizacion.' },
    ]}
    relatedLinks={[
      { label: 'Traslado desde CDG', url: '/es/traslado-aeropuerto-charles-de-gaulle' },
      { label: 'Traslado desde Orly', url: '/es/traslado-aeropuerto-orly' },
      { label: 'Servicio para hoteles', url: '/es/traslados-para-hoteles-paris' },
      { label: 'Minivan para grupos', url: '/es/minivan-traslado-aeropuerto-paris' },
    ]}
  />
);

export default EsConductorPrivado;
