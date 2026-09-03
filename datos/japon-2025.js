/* ===========================================================================
   JAPÓN · 22 septiembre — 8 octubre 2025 · VIAJE PASADO
   Datos extraídos de la hoja "Japón" (Drive › Plantillas viajes › Japón)
   =========================================================================== */

VIAJES.push({
  id: "japon-2025",
  nombre: "Japón",
  subtitulo: "Tokyo · Osaka · Kyoto · Kanazawa",
  emoji: "⛩️",
  paleta: "atlantico",
  inicio: "2025-09-22",
  fin: "2025-10-08",
  viajeros: ["Alberto", "Valeria"],
  casa: { ciudad: "Galicia", tz: "Europe/Madrid" },

  lugares: {
    "Vigo":     { tz: "Europe/Madrid", pais: "España", moneda: "EUR" },
    "Madrid":   { tz: "Europe/Madrid", pais: "España", moneda: "EUR" },
    "Tokyo":    { tz: "Asia/Tokyo",    pais: "Japón",  moneda: "JPY" },
    "Osaka":    { tz: "Asia/Tokyo",    pais: "Japón",  moneda: "JPY" },
    "Kyoto":    { tz: "Asia/Tokyo",    pais: "Japón",  moneda: "JPY" },
    "Kanazawa": { tz: "Asia/Tokyo",    pais: "Japón",  moneda: "JPY" }
  },

  monedas: [
    { codigo: "JPY", nombre: "Yen japonés", simbolo: "¥", porEuro: 165, actualizado: "2025-09-22" }
  ],

  transportes: [
    {
      id: "ib0474", modo: "avion",
      compania: "Iberia", numero: "IB0474", localizador: "JRF7S",
      desde: { ciudad: "Vigo",   iata: "VGO", aeropuerto: "Vigo–Peinador",       terminal: "Terminal única" },
      hasta: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4" },
      salida: "2025-09-22T06:30", llegada: "2025-09-22T07:45", notas: []
    },
    {
      id: "ib0281", modo: "avion",
      compania: "Iberia", numero: "IB0281", localizador: "HMV7T",
      desde: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4S" },
      hasta: { ciudad: "Tokyo",  iata: "HND", aeropuerto: "Haneda",              terminal: "T3 internacional" },
      salida: "2025-09-22T12:30", llegada: "2025-09-23T09:55",
      notas: ["Sala VIP T4S antes del embarque."]
    },
    {
      id: "shink-nozomi447", modo: "tren",
      compania: "JR Central", numero: "NOZOMI 447", localizador: null, avion: "Shinkansen serie N700",
      desde: { ciudad: "Tokyo", iata: "TYO", aeropuerto: "Estación de Tokio",   terminal: "Andenes Shinkansen Tokaido" },
      hasta: { ciudad: "Osaka", iata: "OSA", aeropuerto: "Shin-Osaka",          terminal: "Shinkansen" },
      salida: "2025-09-25T18:09", llegada: "2025-09-25T20:36", notas: []
    },
    {
      id: "tren-osa-kyo", modo: "tren",
      compania: "JR", numero: "Tren + tren", localizador: null,
      desde: { ciudad: "Osaka", iata: "OSA", aeropuerto: "Osaka",   terminal: "" },
      hasta: { ciudad: "Kyoto", iata: "KYO", aeropuerto: "Kyoto",   terminal: "" },
      salida: "2025-09-29T10:00", llegada: "2025-09-29T11:00", notas: ["Hora aproximada: la hoja original no la fijó."]
    },
    {
      id: "shink-kyo-kaz", modo: "tren",
      compania: "JR", numero: "Tren + Shinkansen", localizador: null,
      desde: { ciudad: "Kyoto",    iata: "KYO", aeropuerto: "Kyoto",             terminal: "" },
      hasta: { ciudad: "Kanazawa", iata: "KMQ", aeropuerto: "Kanazawa",          terminal: "" },
      salida: "2025-10-02T06:59", llegada: "2025-10-02T08:48", notas: []
    },
    {
      id: "shink-kaz-tok", modo: "tren",
      compania: "JR", numero: "Shinkansen", localizador: null,
      desde: { ciudad: "Kanazawa", iata: "KMQ", aeropuerto: "Kanazawa",           terminal: "" },
      hasta: { ciudad: "Tokyo",    iata: "TYO", aeropuerto: "Estación de Tokio",  terminal: "" },
      salida: "2025-10-04T09:00", llegada: "2025-10-04T11:30", notas: ["Hora aproximada: la hoja original no la fijó."]
    },
    {
      id: "ib0282", modo: "avion",
      compania: "Iberia", numero: "IB0282", localizador: "KT27D",
      desde: { ciudad: "Tokyo",  iata: "HND", aeropuerto: "Haneda",              terminal: "T3 internacional" },
      hasta: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4S" },
      salida: "2025-10-07T11:35", llegada: "2025-10-07T20:25", notas: []
    },
    {
      id: "ib0471", modo: "avion",
      compania: "Iberia", numero: "IB0471", localizador: "JRF7S",
      desde: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4" },
      hasta: { ciudad: "Vigo",   iata: "VGO", aeropuerto: "Vigo–Peinador",         terminal: "Terminal única" },
      salida: "2025-10-08T19:45", llegada: "2025-10-08T21:05", notas: []
    }
  ],

  alojamientos: [
    {
      id: "tavinos", ciudad: "Tokyo", zona: "Asakusa",
      nombre: "Tavinos Asakusa", plataforma: "Trip.com",
      entrada: "2025-09-23", salida: "2025-09-25", horaEntrada: "15:00", horaSalida: "11:00", noches: 2,
      habitacion: "Habitación Hollywood · 2 camas",
      servicios: ["Sin desayuno"],
      precio: 92, precioNoche: 46, puntos: null, localizador: null,
      maps: "Tavinos Asakusa, Tokyo", notas: []
    },
    {
      id: "yukiko", ciudad: "Osaka", zona: null,
      nombre: "Airbnb Yukiko", plataforma: "Airbnb",
      entrada: "2025-09-25", salida: "2025-09-29", horaEntrada: "16:00", horaSalida: "11:00", noches: 4,
      habitacion: "Apartamento",
      servicios: ["Sin desayuno"],
      precio: 140, precioNoche: 35, puntos: null, localizador: null,
      maps: "Airbnb Yukiko, Osaka",
      notas: ["Avisar si llegabais después de las 22:00.", "Enviar DNI y pasaporte antes de la llegada."]
    },
    {
      id: "ubell", ciudad: "Kyoto", zona: null,
      nombre: "Kyoto U-Bell Hotel", plataforma: "Agoda",
      entrada: "2025-09-29", salida: "2025-10-02", horaEntrada: "15:00", horaSalida: "11:00", noches: 3,
      habitacion: "Habitación doble estándar",
      servicios: ["Onsen", "Traslado a estación"],
      precio: 145, precioNoche: 48.5, puntos: null, localizador: null,
      maps: "Kyoto U-Bell Hotel", notas: []
    },
    {
      id: "vista-kaz", ciudad: "Kanazawa", zona: null,
      nombre: "Hotel Vista Kanazawa", plataforma: "Booking",
      entrada: "2025-10-02", salida: "2025-10-04", horaEntrada: "15:00", horaSalida: "11:00", noches: 2,
      habitacion: "Habitación doble moderate",
      servicios: ["Onsen"],
      precio: 100, precioNoche: 50, puntos: null, localizador: null,
      maps: "Hotel Vista Kanazawa", notas: []
    },
    {
      id: "shinjuku", ciudad: "Tokyo", zona: "Shinjuku",
      nombre: "Airbnb Shinjuku", plataforma: "Airbnb",
      entrada: "2025-10-04", salida: "2025-10-07", horaEntrada: "15:00", horaSalida: "11:00", noches: 3,
      habitacion: "Apartamento",
      servicios: ["Sin desayuno"],
      precio: 162, precioNoche: 54, puntos: null, localizador: null,
      maps: "Shinjuku, Tokyo", notas: []
    },
    {
      id: "marriott-mad", ciudad: "Madrid", zona: null,
      nombre: "Marriott Auditorium", plataforma: "Marriott",
      entrada: "2025-10-07", salida: "2025-10-08", horaEntrada: "15:00", horaSalida: "12:00", noches: 1,
      habitacion: "Habitación Premium",
      servicios: ["Piscina", "Gimnasio"],
      precio: 0, precioNoche: 0, puntos: 18500, localizador: null,
      maps: "Marriott Auditorium, Madrid",
      notas: ["Reserva con 18.500 puntos Marriott Bonvoy."]
    }
  ],

  dias: [
    { fecha: "2025-09-22", ciudad: "Madrid", actividades: [], comidas: [] },
    { fecha: "2025-09-23", ciudad: "Tokyo", actividades: [
        { hora: "10:30", texto: "Llegada a Haneda", tipo: "actividad" },
        { texto: "Asakusa", tipo: "templo", maps: "Asakusa, Tokyo" }
      ], comidas: [
        { texto: "Gyukatsu Motomura", maps: "Gyukatsu Motomura Asakusa" },
        { texto: "Sushiro", maps: "Sushiro Asakusa" }
      ] },
    { fecha: "2025-09-24", ciudad: "Tokyo", actividades: [
        { texto: "Senso-ji", tipo: "templo", maps: "Senso-ji, Tokyo" },
        { texto: "Ueno", tipo: "templo", maps: "Ueno, Tokyo" },
        { texto: "Mercado Ameyoko", tipo: "compras", maps: "Ameyoko Market, Tokyo" },
        { texto: "Akihabara", tipo: "compras", maps: "Akihabara, Tokyo" }
      ], comidas: [
        { texto: "Himuro Ueno", maps: "Himuro Ueno" },
        { texto: "Kyushu Jangara", maps: "Kyushu Jangara" },
        { texto: "Kikambo Ramen", maps: "Kikambo Ramen" },
        { texto: "Kanda Ramen Waizu", maps: "Kanda Ramen Waizu" },
        { texto: "Kanda Menya Musashi Kanzan", maps: "Menya Musashi Kanzan" }
      ] },
    { fecha: "2025-09-25", ciudad: "Tokyo", actividades: [
        { texto: "Jardines Hamarikyu", tipo: "actividad", maps: "Hamarikyu Gardens, Tokyo" },
        { texto: "Mercado de Tsukiji", tipo: "compras", maps: "Tsukiji Market, Tokyo" },
        { texto: "Ginza", tipo: "compras", maps: "Ginza, Tokyo" },
        { texto: "Palacio Imperial", tipo: "templo", maps: "Tokyo Imperial Palace" },
        { texto: "Estación de Tokyo", tipo: "actividad", maps: "Tokyo Station" }
      ], comidas: [
        { texto: "Buta-Daigaku Shimbashi", maps: "Buta-Daigaku Shimbashi" },
        { texto: "Matsuri", maps: "Matsuri Ginza" }
      ] },
    { fecha: "2025-09-26", ciudad: "Osaka", actividades: [
        { texto: "Universal Studios Japan", tipo: "actividad", maps: "Universal Studios Japan" },
        { texto: "Shinsekai", tipo: "actividad", maps: "Shinsekai, Osaka" },
        { texto: "Torre Tsutenkaku", tipo: "actividad", maps: "Tsutenkaku Tower" }
      ], comidas: [
        { texto: "Universal", maps: "Universal Studios Japan" },
        { texto: "Algo en Shin-Osaka", maps: "Shin-Osaka Station" }
      ] },
    { fecha: "2025-09-27", ciudad: "Osaka", actividades: [
        { texto: "Castillo de Osaka", tipo: "templo", maps: "Osaka Castle" },
        { texto: "Umeda", tipo: "compras", maps: "Umeda, Osaka" },
        { texto: "Santuario Namba Yasaka", tipo: "templo", maps: "Namba Yasaka Shrine" },
        { texto: "Mercado de Kuromon", tipo: "compras", maps: "Kuromon Market, Osaka" },
        { texto: "Namba Parks y Denden Town", tipo: "compras", maps: "Namba Parks, Osaka" },
        { texto: "Dotonbori", tipo: "actividad", maps: "Dotonbori, Osaka" },
        { texto: "Templo Hozenji", tipo: "templo", maps: "Hozenji Temple" }
      ], comidas: [] },
    { fecha: "2025-09-28", ciudad: "Osaka", actividades: [
        { hora: "09:00", texto: "Tren a Nara", tipo: "tren", maps: "Nara, Japón" },
        { texto: "Todai-ji", tipo: "templo", maps: "Todai-ji, Nara" },
        { texto: "Nigatsu-do", tipo: "templo", maps: "Nigatsu-do, Nara" },
        { texto: "Kofuku-ji", tipo: "templo", maps: "Kofuku-ji, Nara" },
        { texto: "Kasuga-taisha", tipo: "templo", maps: "Kasuga-taisha, Nara" },
        { texto: "Pabellón Ukimido", tipo: "templo", maps: "Ukimido, Nara" },
        { texto: "Dotonbori (vuelta)", tipo: "actividad", maps: "Dotonbori, Osaka" }
      ], comidas: [] },
    { fecha: "2025-09-29", ciudad: "Kyoto", actividades: [
        { texto: "Ginkaku-ji (pabellón plata)", tipo: "templo", maps: "Ginkaku-ji, Kyoto" },
        { texto: "Paseo del filósofo", tipo: "actividad", maps: "Philosopher's Path, Kyoto" },
        { texto: "Eikando y Nanzenji", tipo: "templo", maps: "Eikando, Kyoto" },
        { texto: "Keage Incline", tipo: "actividad", maps: "Keage Incline, Kyoto" },
        { texto: "Gion (de noche)", tipo: "actividad", maps: "Gion, Kyoto" },
        { texto: "Pontocho", tipo: "actividad", maps: "Pontocho, Kyoto" }
      ], comidas: [] },
    { fecha: "2025-09-30", ciudad: "Kyoto", actividades: [
        { texto: "Fushimi Inari", tipo: "templo", maps: "Fushimi Inari, Kyoto" },
        { texto: "Templo Kiyomizudera", tipo: "templo", maps: "Kiyomizu-dera, Kyoto" },
        { texto: "Sannenzaka y Ninenzaka", tipo: "actividad", maps: "Sannenzaka, Kyoto" },
        { texto: "Santuario Yasaka y parque Maruyama", tipo: "templo", maps: "Yasaka Shrine, Kyoto" },
        { texto: "Templo Chionin", tipo: "templo", maps: "Chion-in, Kyoto" },
        { texto: "Santuario Heian", tipo: "templo", maps: "Heian Shrine, Kyoto" }
      ], comidas: [
        { texto: "Comida por Gion", maps: "Gion, Kyoto" },
        { texto: "Cena por estación de Kyoto", maps: "Kyoto Station" }
      ] },
    { fecha: "2025-10-01", ciudad: "Kyoto", actividades: [
        { texto: "Bosque de bambú de Arashiyama", tipo: "montana", maps: "Arashiyama Bamboo Grove" },
        { texto: "Templo Tenryu-ji", tipo: "templo", maps: "Tenryu-ji, Kyoto" },
        { texto: "Parque de los monos", tipo: "montana", maps: "Iwatayama Monkey Park" },
        { texto: "Mercado de Nishiki", tipo: "compras", maps: "Nishiki Market, Kyoto" },
        { texto: "Pabellón dorado (Kinkaku-ji)", tipo: "templo", maps: "Kinkaku-ji, Kyoto" }
      ], comidas: [
        { texto: "Comer en mercado de Nishiki", maps: "Nishiki Market, Kyoto" },
        { texto: "Cena en Pontocho o estación", maps: "Pontocho, Kyoto" }
      ] },
    { fecha: "2025-10-02", ciudad: "Kanazawa", actividades: [
        { texto: "Higashi Chaya y Kazuemachi", tipo: "actividad", maps: "Higashi Chaya, Kanazawa" },
        { texto: "Omicho Market", tipo: "compras", maps: "Omicho Market, Kanazawa" },
        { texto: "Kenroku-en y castillo", tipo: "templo", maps: "Kenroku-en, Kanazawa" },
        { texto: "Nagamachi (distrito samurái)", tipo: "actividad", maps: "Nagamachi, Kanazawa" },
        { texto: "Katamachi (tabernas)", tipo: "actividad", maps: "Katamachi, Kanazawa" }
      ], comidas: [] },
    { fecha: "2025-10-03", ciudad: "Kanazawa", actividades: [
        { hora: "08:00", texto: "Autobús a Shirakawa-go y regreso", tipo: "bus", maps: "Shirakawa-go" },
        { texto: "Deai Bridge", tipo: "actividad", maps: "Deai Bridge, Shirakawa-go" },
        { texto: "Santuario Hachiman", tipo: "templo", maps: "Shirakawa Hachiman Shrine" },
        { texto: "Templo Myozenji", tipo: "templo", maps: "Myozenji, Shirakawa-go" },
        { texto: "Casa Kanda", tipo: "templo", maps: "Kanda House, Shirakawa-go" },
        { texto: "Tenshukaku Observatory Deck", tipo: "actividad", maps: "Tenshukaku Observatory Shirakawa-go" }
      ], comidas: [] },
    { fecha: "2025-10-04", ciudad: "Tokyo", actividades: [
        { texto: "Ikebukuro", tipo: "compras", maps: "Ikebukuro, Tokyo" },
        { texto: "Shinjuku", tipo: "actividad", maps: "Shinjuku, Tokyo" },
        { texto: "Odaiba", tipo: "actividad", maps: "Odaiba, Tokyo" }
      ], comidas: [] },
    { fecha: "2025-10-05", ciudad: "Tokyo", actividades: [
        { texto: "Shinjuku", tipo: "actividad", maps: "Shinjuku, Tokyo" },
        { hora: "15:00", texto: "TeamLab Planets", tipo: "actividad", maps: "teamLab Planets Tokyo" }
      ], comidas: [] },
    { fecha: "2025-10-06", ciudad: "Tokyo", actividades: [
        { texto: "Harajuku", tipo: "compras", maps: "Harajuku, Tokyo" },
        { hora: "14:00", texto: "Shibuya Sky", tipo: "actividad", maps: "Shibuya Sky, Tokyo" },
        { texto: "Shibuya", tipo: "actividad", maps: "Shibuya, Tokyo" }
      ], comidas: [] },
    { fecha: "2025-10-07", ciudad: "Tokyo", actividades: [
        { texto: "Primark antes del vuelo", tipo: "compras", maps: "Primark Ikebukuro, Tokyo" }
      ], comidas: [] },
    { fecha: "2025-10-08", ciudad: "Madrid", actividades: [], comidas: [] }
  ],

  ideas: [],

  gastos: [
    { categoria: "Transporte",  fecha: "2025-09-22", detalle: "Vuelos Vigo–Madrid y regreso", precio: 81,     pagado: true },
    { categoria: "Transporte",  fecha: "2025-09-22", detalle: "Vuelos Madrid–Tokyo y regreso", precio: 340,   pagado: true },
    { categoria: "Seguro",      fecha: "2025-09-22", detalle: "Seguro de viaje Heymondo Tranquilidad", precio: 102, pagado: true },
    { categoria: "Internet",    fecha: "2025-09-22", detalle: "SIM Amazon Valeria",         precio: 20,     pagado: true },
    { categoria: "Internet",    fecha: "2025-09-22", detalle: "eSIM Alberto",               precio: 5,      pagado: true },
    { categoria: "Otros",       fecha: "2025-09-22", detalle: "Maleta Madrid–Vigo (15 kg)", precio: 14,     pagado: true },
    { categoria: "Alojamiento", fecha: "2025-09-23", detalle: "Tavinos Asakusa",            precio: 92,     pagado: true },
    { categoria: "Alojamiento", fecha: "2025-09-25", detalle: "Airbnb Osaka Yukiko",        precio: 140,    pagado: true },
    { categoria: "Transporte",  fecha: "2025-09-25", detalle: "Shinkansen Tokyo–Osaka",     precio: 150,    pagado: true },
    { categoria: "Actividad",   fecha: "2025-09-26", detalle: "Universal Studios Japan",    precio: 126,    pagado: true },
    { categoria: "Alojamiento", fecha: "2025-09-29", detalle: "Kyoto U-Bell Hotel",         precio: 150,    pagado: true },
    { categoria: "Alojamiento", fecha: "2025-10-02", detalle: "Hotel Vista Kanazawa",       precio: 98,     pagado: true },
    { categoria: "Transporte",  fecha: "2025-10-02", detalle: "Trenes Kyoto–Kanazawa",      precio: 86,     pagado: true },
    { categoria: "Transporte",  fecha: "2025-10-03", detalle: "Autobús Shirakawa-go (ida y vuelta)", precio: 73, pagado: true },
    { categoria: "Alojamiento", fecha: "2025-10-04", detalle: "Airbnb Tokyo Shinjuku",      precio: 163,    pagado: true },
    { categoria: "Transporte",  fecha: "2025-10-04", detalle: "Shinkansen Kanazawa–Tokyo", precio: 165,    pagado: true },
    { categoria: "Actividad",   fecha: "2025-10-05", detalle: "TeamLab Planets Tokyo",      precio: 58,     pagado: true },
    { categoria: "Actividad",   fecha: "2025-10-06", detalle: "Shibuya Sky",                precio: 30,     pagado: true },
    { categoria: "Alojamiento", fecha: "2025-10-07", detalle: "Marriott Auditorium (puntos)", precio: 0,   pagado: true, nota: "18.500 puntos Bonvoy" },
    { categoria: "Otros",       fecha: "2025-10-07", detalle: "Comidas Madrid y Pontevedra", precio: 73,   pagado: true },
    { categoria: "Otros",       fecha: "2025-10-07", detalle: "Efectivo Revolut Alberto (1)", precio: 820, pagado: true },
    { categoria: "Otros",       fecha: "2025-10-07", detalle: "Efectivo Revolut Alberto (2)", precio: 535, pagado: true }
  ],

  mochila: [
    { categoria: "Documentación", items: ["DNI", "Pasaporte", "Dinero", "Carné de conducir", "Reservas de vuelos", "Reservas de alojamiento", "Tarjeta sanitaria / seguro de viaje", "Tarjetas de crédito", "Bolígrafo"] },
    { categoria: "Ropa", items: ["Pantalones", "Camisetas", "Sudaderas / jerseys", "Ropa interior", "Pijama", "Calzado", "Antifaz", "Gorra", "Ropa de deporte", "Abrigo"] },
    { categoria: "Neceser", items: ["Cepillo de dientes + pasta", "Champú en seco", "Protector labial", "Crema hidratante", "Peine", "Pinza de pelo", "Gomas de pelo", "Desodorante", "Pañuelos", "Acondicionador", "Gomina", "Crema de afeitar"] },
    { categoria: "Botiquín / Otros", items: ["Gafas de sol", "Gafas / lentillas de repuesto", "Ibuprofeno", "Paracetamol", "Repelente de mosquitos", "Tiritas", "Crema de sol", "Colirio", "Higiene femenina", "Omeprazol"] },
    { categoria: "Tecnología / Ocio", items: ["Móvil", "Cargadores", "Adaptadores", "Batería externa", "Auriculares con cable", "Portátil", "Series / películas", "Palo selfie", "HDMI", "SIM", "eSIM", "Chromecast", "Cartas"] }
  ],

  emergencia: [
    { titulo: "Emergencias Japón (general)", valor: "119 · ambulancia y bomberos", tel: "119" },
    { titulo: "Policía Japón", valor: "110", tel: "110" },
    { titulo: "Embajada de España en Tokyo", valor: "+81 3 3583 8531 · Urgencias: +81 90 6009 4404", tel: "+819060094404" }
  ]
});
