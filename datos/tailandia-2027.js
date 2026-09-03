/* ===========================================================================
   TAILANDIA + MALASIA · 11 — 29 enero 2027
   Datos extraídos de la hoja "Tailandia 2027" (Drive › Plantillas viajes › Tailandia)
   Formato explicado en COMO-METER-UN-VIAJE.md
   =========================================================================== */

VIAJES.push({
  id: "tailandia-2027",
  nombre: "Tailandia y Malasia",
  subtitulo: "Bangkok · Chiang Mai · Phuket · Kuala Lumpur",
  emoji: "🛕",
  paleta: "tropico",
  inicio: "2027-01-11",
  fin: "2027-01-29",
  viajeros: ["Alberto", "Valeria"],
  casa: { ciudad: "Galicia", tz: "Europe/Madrid" },

  lugares: {
    "Vigo":         { tz: "Europe/Madrid",      pais: "España",    moneda: "EUR" },
    "Madrid":       { tz: "Europe/Madrid",      pais: "España",    moneda: "EUR" },
    "Doha":         { tz: "Asia/Qatar",         pais: "Catar",     moneda: "QAR" },
    "Bangkok":      { tz: "Asia/Bangkok",       pais: "Tailandia", moneda: "THB" },
    "Chiang Mai":   { tz: "Asia/Bangkok",       pais: "Tailandia", moneda: "THB" },
    "Khao Lak":     { tz: "Asia/Bangkok",       pais: "Tailandia", moneda: "THB" },
    "Phuket":       { tz: "Asia/Bangkok",       pais: "Tailandia", moneda: "THB" },
    "Kuala Lumpur": { tz: "Asia/Kuala_Lumpur",  pais: "Malasia",   moneda: "MYR" }
  },

  /* Tipos de cambio de partida. ACTUALÍZALOS A MANO ANTES DE SALIR
     (también se pueden cambiar desde la propia app, pestaña Dinero).
     valor = cuántas unidades de esa moneda vale 1 euro. */
  monedas: [
    { codigo: "THB", nombre: "Baht tailandés", simbolo: "฿",  porEuro: 38.0, actualizado: "2026-09-03" },
    { codigo: "MYR", nombre: "Ringgit malayo", simbolo: "RM", porEuro: 4.90, actualizado: "2026-09-03" }
  ],

  transportes: [
    {
      id: "ib1132", modo: "avion",
      compania: "Iberia", numero: "IB1132", localizador: "8LNRAD", avion: "CRJ-1000",
      desde: { ciudad: "Vigo",   iata: "VGO", aeropuerto: "Vigo–Peinador",       terminal: "Terminal única" },
      hasta: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4" },
      salida: "2027-01-11T17:45", llegada: "2027-01-11T19:00",
      notas: []
    },
    {
      id: "qr152", modo: "avion",
      compania: "Qatar Airways", numero: "QR152", localizador: "8HIO9T", avion: "Boeing 787-9",
      desde: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4 (facturación) · embarque en T4S" },
      hasta: { ciudad: "Doha",   iata: "DOH", aeropuerto: "Hamad International",   terminal: "Terminal única" },
      salida: "2027-01-11T22:25", llegada: "2027-01-12T07:00",
      notas: ["Llegas del vuelo de Vigo a T4: el embarque es en el satélite T4S, hay que coger el tren interno."]
    },
    {
      id: "qr826", modo: "avion",
      compania: "Qatar Airways", numero: "QR826", localizador: "8HIO9T", avion: "Boeing 787-9 Dreamliner",
      desde: { ciudad: "Doha",    iata: "DOH", aeropuerto: "Hamad International", terminal: "Terminal única" },
      hasta: { ciudad: "Bangkok", iata: "BKK", aeropuerto: "Suvarnabhumi",        terminal: "Terminal única" },
      salida: "2027-01-12T09:10", llegada: "2027-01-12T19:25",
      notas: []
    },
    {
      id: "pg219", modo: "avion",
      compania: "Bangkok Airways", numero: "PG219", localizador: "7PI3L5",
      desde: { ciudad: "Bangkok",    iata: "BKK", aeropuerto: "Suvarnabhumi",           terminal: "Terminal única · zona doméstica" },
      hasta: { ciudad: "Chiang Mai", iata: "CNX", aeropuerto: "Chiang Mai Internacional", terminal: "Edificio único · llegada doméstica" },
      salida: "2027-01-15T17:40", llegada: "2027-01-15T19:00",
      notas: ["Vuelo doméstico: Bangkok Airways sale de Suvarnabhumi, no de Don Mueang."]
    },
    {
      id: "pg248", modo: "avion",
      compania: "Bangkok Airways", numero: "PG248", localizador: "783Q8S",
      desde: { ciudad: "Chiang Mai", iata: "CNX", aeropuerto: "Chiang Mai Internacional", terminal: "Edificio único · salida doméstica" },
      hasta: { ciudad: "Phuket",     iata: "HKT", aeropuerto: "Phuket Internacional",     terminal: "T2 (doméstico)" },
      salida: "2027-01-19T14:35", llegada: "2027-01-19T16:40",
      notas: ["Pagado con 18.000 avios + 7 €.", "Esa noche duermes en Khao Lak, a ~1h del aeropuerto."]
    },
    {
      id: "mh787", modo: "avion",
      compania: "Malaysia Airlines", numero: "MH787", localizador: "801007570",
      desde: { ciudad: "Phuket",       iata: "HKT", aeropuerto: "Phuket Internacional",     terminal: "T1 (internacional)" },
      hasta: { ciudad: "Kuala Lumpur", iata: "KUL", aeropuerto: "Kuala Lumpur Internacional", terminal: "KLIA Terminal 1" },
      salida: "2027-01-25T10:30", llegada: "2027-01-25T13:00",
      notas: ["Cambias de terminal respecto a la llegada: sales por la T1, la internacional."]
    },
    {
      id: "qr4990", modo: "avion",
      compania: "Qatar Airways (operado por Malaysia Airlines)", numero: "QR4990", localizador: "8HIO9T", avion: "Airbus A350",
      desde: { ciudad: "Kuala Lumpur", iata: "KUL", aeropuerto: "Kuala Lumpur Internacional", terminal: "KLIA Terminal 1" },
      hasta: { ciudad: "Doha",         iata: "DOH", aeropuerto: "Hamad International",        terminal: "Terminal única" },
      salida: "2027-01-28T20:45", llegada: "2027-01-28T23:40",
      notas: []
    },
    {
      id: "ib392", modo: "avion",
      compania: "Iberia", numero: "IB392", localizador: "M88S3", avion: "Airbus A330-200",
      desde: { ciudad: "Doha",   iata: "DOH", aeropuerto: "Hamad International",   terminal: "Terminal única" },
      hasta: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4S (llegada) · recogida de maletas en T4" },
      salida: "2027-01-29T02:35", llegada: "2027-01-29T09:05",
      notas: []
    },
    {
      id: "mad-vgo-pendiente", modo: "avion",
      compania: null, numero: null, localizador: null,
      pendiente: true,
      desde: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4" },
      hasta: { ciudad: "Vigo",   iata: "VGO", aeropuerto: "Vigo–Peinador",         terminal: "Terminal única" },
      salida: "2027-01-29T12:00", llegada: "2027-01-29T13:15",
      notas: []
    }
  ],

  alojamientos: [
    {
      id: "blue-house", ciudad: "Bangkok", zona: null,
      nombre: "Blue House 191 Hometel", plataforma: "Agoda",
      entrada: "2027-01-12", salida: "2027-01-14", horaEntrada: "14:00", horaSalida: "12:00", noches: 2,
      habitacion: "Habitación superior extragrande",
      servicios: ["Sin piscina", "Sin desayuno"],
      precio: 52, precioNoche: 26, puntos: null, localizador: null,
      maps: "Blue House 191 Hometel, Bangkok",
      notas: ["El vuelo llega a Bangkok a las 19:25; con desplazamiento al hotel, llegada real prevista sobre las 21:00–21:30."]
    },
    {
      id: "pho-place", ciudad: "Bangkok", zona: null,
      nombre: "Pho Place", plataforma: "Booking",
      entrada: "2027-01-14", salida: "2027-01-15", horaEntrada: "14:00", horaSalida: "12:00", noches: 1,
      habitacion: "Habitación doble deluxe",
      servicios: ["Sin piscina", "Sin desayuno"],
      precio: 21, precioNoche: 21, puntos: null, localizador: null,
      maps: "Pho Place, Bangkok", notas: []
    },
    {
      id: "book-design", ciudad: "Chiang Mai", zona: null,
      nombre: "BOOK Design Hotel", plataforma: "Hostelworld",
      entrada: "2027-01-15", salida: "2027-01-19", horaEntrada: "14:00", horaSalida: "12:00", noches: 4,
      habitacion: "Habitación estándar doble",
      servicios: ["Piscina", "Sin desayuno"],
      precio: 38, precioNoche: 9.5, puntos: null, localizador: null,
      maps: "BOOK Design Hotel, Chiang Mai",
      notas: ["Pagada solo una parte: queda saldo por abonar al llegar."]
    },
    {
      id: "srichada", ciudad: "Khao Lak", zona: "Khao Lak",
      nombre: "Srichada Hotel Khaolak", plataforma: "Booking",
      entrada: "2027-01-19", salida: "2027-01-20", horaEntrada: "18:00", horaSalida: "12:00", noches: 1,
      habitacion: "Habitación superior doble con balcón",
      servicios: ["Sin piscina", "Sin desayuno"],
      precio: 24, precioNoche: 24, puntos: null, localizador: null,
      maps: "Srichada Hotel Khaolak",
      notas: ["Está a ~1h del aeropuerto de Phuket: cuenta el traslado tras aterrizar a las 16:40."]
    },
    {
      id: "sleepy-station", ciudad: "Phuket", zona: "Kata Beach",
      nombre: "Sleepy Station Hostel", plataforma: "Expedia",
      entrada: "2027-01-20", salida: "2027-01-23", horaEntrada: "14:00", horaSalida: "11:00", noches: 3,
      habitacion: "Habitación estándar doble",
      servicios: ["Sin piscina", "Sin desayuno"],
      precio: 99, precioNoche: 33, puntos: null, localizador: null,
      maps: "Sleepy Station Hostel, Kata Beach, Phuket", notas: []
    },
    {
      id: "rommanee", ciudad: "Phuket", zona: null,
      nombre: "The Rommanee Classic Guesthouse", plataforma: "Booking",
      entrada: "2027-01-23", salida: "2027-01-25", horaEntrada: "14:00", horaSalida: "12:00", noches: 2,
      habitacion: "Habitación doble deluxe",
      servicios: ["Sin piscina", "Sin desayuno"],
      precio: 25, precioNoche: 12.6, puntos: null, localizador: null,
      maps: "The Rommanee Classic Guesthouse, Phuket Old Town",
      notas: ["Ya pagado."]
    },
    {
      id: "colony-infinitum", ciudad: "Kuala Lumpur", zona: null,
      nombre: "The Colony Infinitum by Manila", plataforma: "Booking",
      entrada: "2027-01-25", salida: "2027-01-27", horaEntrada: "15:00", horaSalida: "12:00", noches: 2,
      habitacion: "Apartamento",
      servicios: ["Piscina", "Sin desayuno"],
      precio: 21, precioNoche: 10.5, puntos: null, localizador: null,
      maps: "The Colony Infinitum, Kuala Lumpur", notas: []
    },
    {
      id: "four-points-kl", ciudad: "Kuala Lumpur", zona: null,
      nombre: "Four Points by Sheraton Kuala Lumpur, Chinatown", plataforma: "Marriott",
      entrada: "2027-01-27", salida: "2027-01-28", horaEntrada: "15:00", horaSalida: "12:00", noches: 1,
      habitacion: "Habitación cama king",
      servicios: ["Piscina", "Sin desayuno"],
      precio: 0, precioNoche: 0, puntos: 14500, localizador: null,
      maps: "Four Points by Sheraton Kuala Lumpur Chinatown",
      notas: ["Reserva con 14.500 puntos Marriott Bonvoy.", "Última noche: el vuelo sale el 28 a las 20:45."]
    }
  ],

  dias: [
    { fecha: "2027-01-11", ciudad: "Vigo",         actividades: [], comidas: [] },
    { fecha: "2027-01-12", ciudad: "Bangkok",      actividades: [], comidas: [] },
    { fecha: "2027-01-13", ciudad: "Bangkok",      actividades: [], comidas: [] },
    { fecha: "2027-01-14", ciudad: "Bangkok",      actividades: [], comidas: [] },
    { fecha: "2027-01-15", ciudad: "Bangkok",      actividades: [], comidas: [] },
    { fecha: "2027-01-16", ciudad: "Chiang Mai",   actividades: [], comidas: [] },
    { fecha: "2027-01-17", ciudad: "Chiang Mai",   actividades: [], comidas: [] },
    { fecha: "2027-01-18", ciudad: "Chiang Mai",   actividades: [], comidas: [] },
    { fecha: "2027-01-19", ciudad: "Khao Lak",     actividades: [
        { hora: "17:00", texto: "Traslado del aeropuerto de Phuket a Khao Lak (~1h)", tipo: "coche", maps: "Khao Lak, Phang Nga" }
      ], comidas: [] },
    { fecha: "2027-01-20", ciudad: "Phuket",       actividades: [
        { texto: "Islas Similan", tipo: "playa", maps: "Similan Islands, Thailand" }
      ], comidas: [] },
    { fecha: "2027-01-21", ciudad: "Phuket",       actividades: [], comidas: [] },
    { fecha: "2027-01-22", ciudad: "Phuket",       actividades: [], comidas: [] },
    { fecha: "2027-01-23", ciudad: "Phuket",       actividades: [], comidas: [] },
    { fecha: "2027-01-24", ciudad: "Phuket",       actividades: [
        { texto: "Isla James Bond (bahía de Phang Nga)", tipo: "playa", maps: "James Bond Island, Phang Nga Bay" }
      ], comidas: [] },
    { fecha: "2027-01-25", ciudad: "Kuala Lumpur", actividades: [], comidas: [] },
    { fecha: "2027-01-26", ciudad: "Kuala Lumpur", actividades: [], comidas: [] },
    { fecha: "2027-01-27", ciudad: "Kuala Lumpur", actividades: [], comidas: [] },
    { fecha: "2027-01-28", ciudad: "Kuala Lumpur", actividades: [], comidas: [] },
    { fecha: "2027-01-29", ciudad: "Madrid",       actividades: [], comidas: [] }
  ],

  ideas: [],

  gastos: [
    { categoria: "Transporte", fecha: "2027-01-11", detalle: "Vuelo Vigo – Madrid",                             precio: 42,   pagado: true },
    { categoria: "Transporte", fecha: "2027-01-11", detalle: "Vuelos Madrid – Bangkok y Kuala Lumpur – Madrid", precio: 1107, pagado: true },
    { categoria: "Seguro",     fecha: "2027-01-11", detalle: "Seguro de viaje Mondo Tranquilidad",              precio: 117,  pagado: true },
    { categoria: "Transporte", fecha: "2027-01-15", detalle: "Vuelo Bangkok – Chiang Mai",                      precio: 7,    pagado: true },
    { categoria: "Transporte", fecha: "2027-01-19", detalle: "Vuelo Chiang Mai – Phuket",                       precio: 7,    pagado: true, nota: "18.000 avios" },
    { categoria: "Transporte", fecha: "2027-01-25", detalle: "Vuelo Phuket – Kuala Lumpur",                     precio: 155,  pagado: true },

    { categoria: "Alojamiento", fecha: "2027-01-12", detalle: "Blue House 191 Hometel",              precio: 52, pagado: true },
    { categoria: "Alojamiento", fecha: "2027-01-14", detalle: "Pho Place",                           precio: 21, pagado: true },
    { categoria: "Alojamiento", fecha: "2027-01-15", detalle: "BOOK Design Hotel",                    precio: 38, pagado: false, nota: "Pagada solo una parte" },
    { categoria: "Alojamiento", fecha: "2027-01-19", detalle: "Srichada Hotel Khaolak",               precio: 24, pagado: true },
    { categoria: "Alojamiento", fecha: "2027-01-20", detalle: "Sleepy Station Hostel",                precio: 99, pagado: true },
    { categoria: "Alojamiento", fecha: "2027-01-23", detalle: "The Rommanee Classic Guesthouse",      precio: 25, pagado: true },
    { categoria: "Alojamiento", fecha: "2027-01-25", detalle: "The Colony Infinitum",                 precio: 21, pagado: true },
    { categoria: "Alojamiento", fecha: "2027-01-27", detalle: "Four Points Chinatown (14.500 puntos)", precio: 0, pagado: true }
  ],

  mochila: [
    { categoria: "Documentación", items: ["DNI", "Pasaporte", "Dinero", "Carné de conducir", "Reservas de vuelos", "Reservas de alojamiento", "Tarjeta sanitaria / seguro de viaje", "Tarjetas de crédito", "Bolígrafo"] },
    { categoria: "Ropa", items: ["Pantalones", "Camisetas", "Sudaderas / jerseys", "Ropa interior", "Pijama", "Calzado", "Antifaz", "Gorra", "Ropa de deporte"] },
    { categoria: "Playa", items: ["Chanclas", "Bañadores", "Gafas de buceo", "Bolsa estanca"] },
    { categoria: "Neceser", items: ["Cepillo de dientes + pasta", "Champú en seco", "Protector labial", "Crema hidratante", "Peine", "Pinza de pelo", "Gomas de pelo", "Desodorante", "Pañuelos", "Acondicionador", "Gomina", "Cuchilla", "Crema de afeitar"] },
    { categoria: "Botiquín / Otros", items: ["Gafas de sol", "Gafas / lentillas de repuesto", "Ibuprofeno", "Paracetamol", "Repelente de mosquitos", "Tiritas", "Crema de sol", "Colirio", "Higiene femenina", "Biodramina", "Omeprazol"] },
    { categoria: "Tecnología / Ocio", items: ["Móvil", "Cargadores", "Adaptadores", "Batería externa", "Auriculares", "Auriculares con cable", "Portátil", "Series / películas descargadas", "Palo selfie", "Cartas", "HDMI", "eSIM activada"] }
  ],

  emergencia: [
    { titulo: "Emergencias Tailandia", valor: "191 · policía", tel: "191" },
    { titulo: "Policía turística Tailandia", valor: "1155 · habla inglés", tel: "1155" },
    { titulo: "Ambulancia Tailandia", valor: "1669", tel: "1669" },
    { titulo: "Emergencias Malasia", valor: "999", tel: "999" },
    { titulo: "Embajada de España en Bangkok", valor: "Urgencias: +66 81 868 7507 · Centralita: +66 2 661 8284", tel: "+66818687507" },
    { titulo: "Embajada de España en Kuala Lumpur", valor: "Urgencias: +60 12 389 3744 · Centralita: +60 3 2162 0261", tel: "+60123893744" },
    { titulo: "Seguro Mondo Tranquilidad", valor: "Rellena aquí tu nº de póliza y el teléfono de asistencia", tel: null },
    { titulo: "Bloqueo de tarjetas", valor: "Rellena aquí los teléfonos de Revolut / Amex / Santander", tel: null }
  ]
});
