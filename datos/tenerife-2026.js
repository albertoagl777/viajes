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
      habitacion: "Apartamento deluxe · 1 dormitorio",
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
      habitacion: "Apartamento",
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
        { hora: "12:00", texto: "Los Cristianos", tipo: "playa", maps: "Los Cristianos, Tenerife" }
      ],
      comidas: []
    },
    {
      fecha: "2026-09-30", ciudad: "Tenerife",
      actividades: [
        { hora: "10:00", texto: "Siam Park (hasta el cierre)", tipo: "actividad", maps: "Siam Park, Costa Adeje" },
        { hora: "19:00", texto: "Traslado a Puerto de la Cruz (~1h 20m en coche)", tipo: "coche", maps: "Puerto de la Cruz, Tenerife" }
      ],
      comidas: []
    },
    {
      fecha: "2026-10-01", ciudad: "Tenerife",
      actividades: [
        { texto: "Día de relax por Puerto de la Cruz", tipo: "playa", maps: "Playa Jardín, Puerto de la Cruz" }
      ],
      comidas: []
    },
    {
      fecha: "2026-10-02", ciudad: "Tenerife",
      actividades: [
        { hora: "16:30", texto: "Devolver el coche en Tenerife Norte", tipo: "coche", maps: "Aeropuerto Tenerife Norte" }
      ],
      comidas: []
    }
  ],

  /* Cosas que quieres hacer pero que aún no tienen día asignado */
  ideas: [
    { texto: "Zona de Los Gigantes", maps: "Acantilados de Los Gigantes, Tenerife" },
    { texto: "Guachinches (tienes la lista en tu Google Maps)", maps: "guachinche Tenerife" },
    { texto: "Masca", maps: "Masca, Tenerife" }
  ],

  gastos: [
    { categoria: "Transporte",  fecha: "2026-09-29", detalle: "Vuelos Santiago – Tenerife Norte (ida y vuelta)", precio: 201, pagado: true },
    { categoria: "Alojamiento", fecha: "2026-09-29", detalle: "Sol Arona Tenerife",   precio: 78,  pagado: true },
    { categoria: "Coche",       fecha: "2026-09-29", detalle: "Coche de alquiler TopCar", precio: 83, pagado: false },
    { categoria: "Alojamiento", fecha: "2026-09-30", detalle: "Meliá Costa Atlantis", precio: 21,  pagado: true },
    { categoria: "Actividad",   fecha: "2026-09-30", detalle: "Entradas Siam Park",   precio: null, pagado: false }
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
