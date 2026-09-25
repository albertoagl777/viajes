/* ===========================================================================
   TENERIFE · 29 sep — 2 oct 2026
   Datos extraídos de la hoja "Tenerife" (Drive › Plantillas viajes › Canarias)
   Formato explicado en COMO-METER-UN-VIAJE.md
   =========================================================================== */

VIAJES.push({
  id: "tenerife-2026",
  nombre: "Tenerife",
  subtitulo: "Los Cristianos · Puerto de la Cruz",
  emoji: "🌋",
  paleta: "atlantico",
  inicio: "2026-09-29",
  fin: "2026-10-02",
  viajeros: ["Alberto", "Valeria"],
  casa: { ciudad: "Galicia", tz: "Europe/Madrid" },

  /* Zona horaria y moneda de cada sitio del viaje */
  lugares: {
    "Santiago de Compostela": { tz: "Europe/Madrid", pais: "España", moneda: "EUR" },
    "Tenerife":               { tz: "Atlantic/Canary", pais: "España", moneda: "EUR" }
  },

  /* Sin conversor: mismo euro en origen y destino */
  monedas: [],

  transportes: [
    {
      id: "vy3229",
      modo: "avion",
      compania: "Vueling",
      numero: "VY3229",
      localizador: "XNDQPD",
      desde: { ciudad: "Santiago de Compostela", iata: "SCQ", aeropuerto: "Santiago–Rosalía de Castro", terminal: "Terminal única" },
      hasta: { ciudad: "Tenerife", iata: "TFN", aeropuerto: "Tenerife Norte–Ciudad de La Laguna", terminal: "Terminal única" },
      salida:  "2026-09-29T06:40",
      llegada: "2026-09-29T08:30",
      notas: ["Salida muy temprana: estar en el aeropuerto sobre las 05:10."]
    },
    {
      id: "vy3226",
      modo: "avion",
      compania: "Vueling",
      numero: "VY3226",
      localizador: "GP3H7H",
      desde: { ciudad: "Tenerife", iata: "TFN", aeropuerto: "Tenerife Norte–Ciudad de La Laguna", terminal: "Terminal única" },
      hasta: { ciudad: "Santiago de Compostela", iata: "SCQ", aeropuerto: "Santiago–Rosalía de Castro", terminal: "Terminal única" },
      salida:  "2026-10-02T18:45",
      llegada: "2026-10-02T22:25",
      notas: ["Devolver el coche antes de facturar."]
    }
  ],

  alojamientos: [
    {
      id: "sol-arona",
      ciudad: "Tenerife",
      zona: "Los Cristianos",
      nombre: "Sol Arona Tenerife",
      plataforma: "Meliá",
      entrada: "2026-09-29", salida: "2026-09-30",
      horaEntrada: "15:00", horaSalida: "12:00",
      noches: 1,
      habitacion: "Skyline Junior Suite",
      servicios: ["Piscina", "Desayuno"],
      precio: 78, precioNoche: 77.84, puntos: 8500,
      localizador: null,
      maps: "Sol Arona Tenerife, Los Cristianos",
      notas: ["Reserva en Puntos + Dinero de MeliáRewards.", "Pedir upgrade a The Level al llegar."]
    },
    {
      id: "costa-atlantis",
      ciudad: "Tenerife",
      zona: "Puerto de la Cruz",
      nombre: "Meliá Costa Atlantis",
      plataforma: "Meliá",
      entrada: "2026-09-30", salida: "2026-10-02",
      horaEntrada: "15:00", horaSalida: "12:00",
      noches: 2,
      habitacion: "Meliá Room",
      servicios: ["Piscina", "Desayuno"],
      precio: 21, precioNoche: 10.29, puntos: 49728,
      localizador: null,
      maps: "Meliá Costa Atlantis, Puerto de la Cruz",
      notas: ["Reserva en Puntos + Dinero.", "Pedir upgrade a The Level al llegar."]
    }
  ],

  dias: [
    {
      fecha: "2026-09-29", ciudad: "Tenerife",
      actividades: [
        { hora: "08:30", texto: "Recoger coche de alquiler (TopCar)", tipo: "coche", maps: "TopCar Tenerife Norte" },
        { texto: "Santa Cruz de Tenerife", tipo: "actividad", maps: "Santa Cruz de Tenerife" },
        { texto: "Candelaria", tipo: "templo", maps: "Basílica de Candelaria, Tenerife" },
        { texto: "Playa de las Teresitas", tipo: "playa", maps: "Playa de las Teresitas, Tenerife" },
        { texto: "Los Gigantes", tipo: "montana", maps: "Acantilados de Los Gigantes, Tenerife" },
        { texto: "Puerto de Santiago", tipo: "playa", maps: "Puerto de Santiago, Tenerife" },
        { texto: "Los Cristianos", tipo: "playa", maps: "Los Cristianos, Tenerife" }
      ],
      comidas: [
        { texto: "Comida · Guachinche El Portezuelo", maps: "Guachinche El Portezuelo, Tenerife" },
        { texto: "Comida · Guachinche El Fogón", maps: "Guachinche El Fogón, Tenerife" },
        { texto: "Cena · Restaurante El Cordero", maps: "Restaurante El Cordero, Tenerife" },
        { texto: "Cena · Guachinche La Maestra", maps: "Guachinche La Maestra, Tenerife" }
      ]
    },
    {
      fecha: "2026-09-30", ciudad: "Tenerife",
      actividades: [
        { hora: "10:00", texto: "Siam Park (hasta el cierre)", tipo: "actividad", maps: "Siam Park, Costa Adeje" },
        { hora: "19:00", texto: "Traslado a Puerto de la Cruz (~1h 20m en coche)", tipo: "coche", maps: "Puerto de la Cruz, Tenerife" }
      ],
      comidas: [
        { texto: "Comida · En Siam Park" },
        { texto: "Comida · Mercadona", maps: "Mercadona Costa Adeje" },
        { texto: "Cena · Guachinche Los Gómez", maps: "Guachinche Los Gómez, Tenerife" },
        { texto: "Cena · Guachinche Ramón", maps: "Guachinche Ramón, Tenerife" },
        { texto: "Cena · Ristta Thai Food", maps: "Ristta Thai Food, Puerto de la Cruz" }
      ]
    },
    {
      fecha: "2026-10-01", ciudad: "Tenerife",
      actividades: [
        { texto: "Santiago del Teide", tipo: "actividad", maps: "Santiago del Teide, Tenerife" },
        { texto: "Masca", tipo: "montana", maps: "Masca, Tenerife" },
        { texto: "Buenavista del Norte", tipo: "actividad", maps: "Buenavista del Norte, Tenerife" },
        { texto: "Garachico", tipo: "actividad", maps: "Garachico, Tenerife" },
        { texto: "Icod de los Vinos", tipo: "actividad", maps: "Icod de los Vinos, Tenerife" },
        { texto: "Vuelta al Meliá Costa Atlantis", tipo: "coche", maps: "Meliá Costa Atlantis, Puerto de la Cruz" }
      ],
      comidas: [
        { texto: "Comida · Guachinche El Miradero", maps: "Guachinche El Miradero, Tenerife" },
        { texto: "Comida · Guachinche Miguel", maps: "Guachinche Miguel, Tenerife" },
        { texto: "Cena · Guachinche Los Gómez", maps: "Guachinche Los Gómez, Tenerife" },
        { texto: "Cena · Guachinche Ramón", maps: "Guachinche Ramón, Tenerife" },
        { texto: "Cena · Ristta Thai Food", maps: "Ristta Thai Food, Puerto de la Cruz" }
      ]
    },
    {
      fecha: "2026-10-02", ciudad: "Tenerife",
      actividades: [
        { texto: "La Orotava", tipo: "actividad", maps: "La Orotava, Tenerife" },
        { texto: "Rambla de Castro", tipo: "playa", maps: "Rambla de Castro, Los Realejos" },
        { texto: "Mirador de Humboldt", tipo: "montana", maps: "Mirador de Humboldt, La Orotava" },
        { texto: "Casa del Vino (El Sauzal)", tipo: "comida", maps: "Casa del Vino, El Sauzal" },
        { texto: "San Cristóbal de La Laguna", tipo: "actividad", maps: "San Cristóbal de La Laguna, Tenerife" },
        { hora: "16:30", texto: "Devolver el coche en Tenerife Norte", tipo: "coche", maps: "Aeropuerto Tenerife Norte" }
      ],
      comidas: [
        { texto: "Comida · Guachinche Las Chozas", maps: "Guachinche Las Chozas, Tenerife" },
        { texto: "Comida · Guachinche El Talegazo", maps: "Guachinche El Talegazo, Tenerife" },
        { texto: "Comida · Guachinche Romance", maps: "Guachinche Romance, Tenerife" },
        { texto: "Comida · Guachinche El Portezuelo", maps: "Guachinche El Portezuelo, Tenerife" },
        { texto: "Cena · Guachinche El Fogón", maps: "Guachinche El Fogón, Tenerife" }
      ]
    }
  ],

  /* Cosas que quieres hacer pero que aún no tienen día asignado */
  ideas: [],

  gastos: [
    { categoria: "Transporte",  fecha: "2026-09-29", detalle: "Vuelos Santiago – Tenerife Norte (ida y vuelta)", precio: 201, pagado: true },
    { categoria: "Alojamiento", fecha: "2026-09-29", detalle: "Sol Arona Tenerife",       precio: 78, pagado: true },
    { categoria: "Coche",       fecha: "2026-09-29", detalle: "Coche de alquiler TopCar", precio: 79, pagado: false },
    { categoria: "Coche",       fecha: "2026-09-29", detalle: "Parking AENA (Santiago)",  precio: 30, pagado: true },
    { categoria: "Alojamiento", fecha: "2026-09-30", detalle: "Meliá Costa Atlantis",     precio: 21, pagado: true },
    { categoria: "Actividad",   fecha: "2026-09-30", detalle: "Entradas Siam Park",       precio: 79, pagado: true }
  ],

  mochila: [
    { categoria: "Documentación", items: ["DNI", "Tarjetas de crédito", "Carné de conducir", "Reserva del coche", "Reservas de alojamiento", "Tarjeta sanitaria"] },
    { categoria: "Ropa", items: ["Pantalones", "Camisetas", "Sudadera", "Ropa interior", "Pijama", "Calzado", "Gorra", "Ropa de deporte"] },
    { categoria: "Playa", items: ["Chanclas", "Bañadores", "Toalla", "Gafas de buceo", "Bolsa estanca"] },
    { categoria: "Neceser", items: ["Cepillo de dientes + pasta", "Champú en seco", "Protector labial", "Crema hidratante", "Peine", "Gomas de pelo", "Desodorante", "Cuchilla", "Crema de afeitar"] },
    { categoria: "Botiquín / Otros", items: ["Gafas de sol", "Crema de sol", "Ibuprofeno", "Paracetamol", "Tiritas", "Colirio", "Biodramina"] },
    { categoria: "Tecnología", items: ["Móvil", "Cargadores", "Batería externa", "Auriculares", "Palo selfie", "HDMI", "Chromecast"] }
  ],

  emergencia: [
    { titulo: "Emergencias (España)", valor: "112", tel: "112" },
    { titulo: "Seguro de viaje", valor: "Rellena aquí tu póliza y teléfono", tel: null },
    { titulo: "Coche de alquiler · TopCar", valor: "Rellena aquí el teléfono de asistencia", tel: null }
  ]
});
