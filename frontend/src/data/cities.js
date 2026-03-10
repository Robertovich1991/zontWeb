export const citiesData = {
  // FRANCE
  paris: {
    id: 'paris',
    country: 'France',
    nameEn: 'Paris',
    nameFr: 'Paris',
    nameRu: 'Париж',
    airports: ['CDG', 'Orly', 'Beauvais'],
    urlEn: '/paris-airport-transfer',
    urlFr: '/transfert-aeroport-paris',
    urlRu: '/taksi-iz-aeroporta-parij',
  },
  nice: {
    id: 'nice',
    country: 'France',
    nameEn: 'Nice',
    nameFr: 'Nice',
    nameRu: 'Ницца',
    airports: ['Nice Côte d\'Azur'],
    urlEn: '/nice-airport-transfer',
    urlFr: '/transfert-aeroport-nice',
    urlRu: '/taksi-iz-aeroporta-nitstsa',
  },
  monaco: {
    id: 'monaco',
    country: 'Monaco',
    nameEn: 'Monaco',
    nameFr: 'Monaco',
    nameRu: 'Монако',
    airports: ['Nice Côte d\'Azur'],
    urlEn: '/monaco-airport-transfer',
    urlFr: '/transfert-aeroport-monaco',
    urlRu: '/taksi-iz-aeroporta-monako',
  },
  cannes: {
    id: 'cannes',
    country: 'France',
    nameEn: 'Cannes',
    nameFr: 'Cannes',
    nameRu: 'Канны',
    airports: ['Nice Côte d\'Azur', 'Cannes Mandelieu'],
    urlEn: '/cannes-airport-transfer',
    urlFr: '/transfert-aeroport-cannes',
    urlRu: '/taksi-iz-aeroporta-kanny',
  },
  cotedazur: {
    id: 'cotedazur',
    country: 'France',
    nameEn: 'French Riviera',
    nameFr: 'Côte d\'Azur',
    nameRu: 'Лазурный Берег',
    airports: ['Nice Côte d\'Azur'],
    urlEn: '/french-riviera-airport-transfer',
    urlFr: '/transfert-aeroport-cote-azur',
    urlRu: '/taksi-iz-aeroporta-lazurnyy-bereg',
  },
  
  // GERMANY
  berlin: {
    id: 'berlin',
    country: 'Germany',
    nameEn: 'Berlin',
    nameFr: 'Berlin',
    nameRu: 'Берлин',
    airports: ['BER Brandenburg'],
    urlEn: '/berlin-airport-transfer',
    urlFr: '/transfert-aeroport-berlin',
    urlRu: '/taksi-iz-aeroporta-berlin',
  },
  munich: {
    id: 'munich',
    country: 'Germany',
    nameEn: 'Munich',
    nameFr: 'Munich',
    nameRu: 'Мюнхен',
    airports: ['Munich Airport'],
    urlEn: '/munich-airport-transfer',
    urlFr: '/transfert-aeroport-munich',
    urlRu: '/taksi-iz-aeroporta-munhen',
  },
  
  // ITALY
  rome: {
    id: 'rome',
    country: 'Italy',
    nameEn: 'Rome',
    nameFr: 'Rome',
    nameRu: 'Рим',
    airports: ['Fiumicino', 'Ciampino'],
    urlEn: '/rome-airport-transfer',
    urlFr: '/transfert-aeroport-rome',
    urlRu: '/taksi-iz-aeroporta-rim',
  },
  milan: {
    id: 'milan',
    country: 'Italy',
    nameEn: 'Milan',
    nameFr: 'Milan',
    nameRu: 'Милан',
    airports: ['Malpensa', 'Linate', 'Bergamo'],
    urlEn: '/milan-airport-transfer',
    urlFr: '/transfert-aeroport-milan',
    urlRu: '/taksi-iz-aeroporta-milan',
  },
  
  // SPAIN
  alicante: {
    id: 'alicante',
    country: 'Spain',
    nameEn: 'Alicante',
    nameFr: 'Alicante',
    nameRu: 'Аликанте',
    airports: ['Alicante-Elche Airport'],
    urlEn: '/alicante-airport-transfer',
    urlFr: '/transfert-aeroport-alicante',
    urlRu: '/taksi-iz-aeroporta-alikante',
  },
  barcelona: {
    id: 'barcelona',
    country: 'Spain',
    nameEn: 'Barcelona',
    nameFr: 'Barcelone',
    nameRu: 'Барселона',
    airports: ['Barcelona-El Prat'],
    urlEn: '/barcelona-airport-transfer',
    urlFr: '/transfert-aeroport-barcelone',
    urlRu: '/taksi-iz-aeroporta-barselona',
  },
  
  // ARMENIA
  yerevan: {
    id: 'yerevan',
    country: 'Armenia',
    nameEn: 'Yerevan',
    nameFr: 'Erevan',
    nameRu: 'Ереван',
    airports: ['Zvartnots International Airport'],
    urlEn: '/yerevan-airport-transfer',
    urlFr: '/transfert-aeroport-erevan',
    urlRu: '/taksi-iz-aeroporta-erevan',
  },
};

export const countriesList = [
  {
    name: 'France',
    cities: ['paris', 'nice', 'cannes', 'cotedazur']
  },
  {
    name: 'Monaco',
    cities: ['monaco']
  },
  {
    name: 'Germany',
    cities: ['berlin', 'munich']
  },
  {
    name: 'Italy',
    cities: ['rome', 'milan']
  },
  {
    name: 'Spain',
    cities: ['alicante', 'barcelona']
  },
  {
    name: 'Armenia',
    cities: ['yerevan']
  },
];
