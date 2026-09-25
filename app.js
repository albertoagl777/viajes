/* ===========================================================================
   Mis viajes — lógica de la aplicación
   Los datos vienen de tus hojas de Drive a través de un Apps Script. La app
   guarda la última copia en el móvil, así que todo funciona sin conexión:
   la red solo hace falta para ACTUALIZAR, nunca para enseñar.
   =========================================================================== */
"use strict";

/* ============================ 1. UTILIDADES ============================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* --- Husos horarios sin librerías: Intl hace el trabajo --- */

/** Desplazamiento (ms) de una zona respecto a UTC en un instante dado. */
function tzOffset(utcMs, tz) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  }).formatToParts(new Date(utcMs)).reduce((a, x) => (a[x.type] = x.value, a), {});
  let h = Number(p.hour); if (h === 24) h = 0;
  return Date.UTC(+p.year, p.month - 1, +p.day, h, +p.minute, +p.second) - utcMs;
}

/** "2027-01-11T22:25" en la zona `tz` -> instante UTC en ms. */
function aUTC(local, tz) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(local || "");
  if (!m) return NaN;
  const base = Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  let utc = base;
  for (let i = 0; i < 3; i++) utc = base - tzOffset(utc, tz);
  return utc;
}

function tzValida(tz) {
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch (e) { return false; }
}

const _cacheFmt = {};
function fmt(tz, opts) {
  const k = tz + JSON.stringify(opts);
  return _cacheFmt[k] || (_cacheFmt[k] = new Intl.DateTimeFormat("es-ES", Object.assign({ timeZone: tz }, opts)));
}
const hora     = (ms, tz) => fmt(tz, { hour: "2-digit", minute: "2-digit", hour12: false }).format(ms);
const diaMes   = (ms, tz) => fmt(tz, { day: "numeric", month: "short" }).format(ms).replace(".", "");
const diaSem   = (ms, tz) => fmt(tz, { weekday: "short" }).format(ms).replace(".", "");
const fechaISO = (ms, tz) => {
  const p = fmt(tz, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(ms)
    .reduce((a, x) => (a[x.type] = x.value, a), {});
  return `${p.year}-${p.month}-${p.day}`;
};
/** "2026-09-29" -> "29 sep" sin líos de zona horaria */
const fechaCorta = iso => diaMes(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10), 12), "UTC");

function dur(ms) {
  if (!isFinite(ms) || ms < 0) return "—";
  const t = Math.round(ms / 60000), h = Math.floor(t / 60), m = t % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}
function durLarga(ms) {
  if (!isFinite(ms)) return "—";
  const t = Math.max(0, Math.round(ms / 60000));
  const d = Math.floor(t / 1440), h = Math.floor((t % 1440) / 60), m = t % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m} min`;
}
function haceCuanto(ms) {
  if (!ms) return "nunca";
  const s = (Date.now() - ms) / 1000;
  if (s < 60) return "ahora mismo";
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return `hace ${Math.round(s / 86400)} días`;
}
const r2 = n => Math.round(n * 100) / 100;
const eur = n => (n === null || n === undefined || !isFinite(n)) ? "—" :
  n.toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €";
const miles = n => Number(n).toLocaleString("es-ES");

const mapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const rutaUrl = q => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
const hojaUrl = id => "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(id) + "/edit";

const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
const nuevoId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ============================ 2. ICONOS ============================ */

const ICONOS = {
  rayo:       '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  avion:      '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  ruta:       '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  casa:       '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  cartera:    '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  rejilla:    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  reloj:      '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin:        '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  enlace:     '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
  abajo:      '<path d="m6 9 6 6 6-6"/>',
  derecha:    '<path d="m9 18 6-6-6-6"/>',
  alerta:     '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  info:       '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  doc:        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/>',
  hoja:       '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  hecho:      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10.01-3-3"/>',
  circulo:    '<circle cx="12" cy="12" r="9.5"/>',
  mas:        '<path d="M12 5v14M5 12h14"/>',
  cerrar:     '<path d="M18 6 6 18M6 6l12 12"/>',
  subir:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  papelera:   '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  flecha:     '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  coche:      '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  tren:       '<rect x="4" y="3" width="16" height="15" rx="2"/><path d="M4 11h16M12 3v8"/><path d="m8 18-2 3M16 18l2 3"/><circle cx="8" cy="14.5" r="1"/><circle cx="16" cy="14.5" r="1"/>',
  barco:      '<path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/><path d="M19.4 19A11.6 11.6 0 0 0 21 13l-9-4-9 4c0 2.4.6 4.5 1.8 6.4"/><path d="M19 12V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5"/><path d="M12 2v3"/>',
  bus:        '<path d="M8 6v6M15 6v6M4 12h16"/><rect x="4" y="3" width="16" height="15" rx="2"/><path d="M7 18v3M17 18v3"/>',
  comida:     '<path d="M3 2v7a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3V2"/><path d="M6.5 2v6"/><path d="M13 22V2c3 0 5 2 5 6v6h-4"/>',
  cafe:       '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
  playa:      '<path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M2 12a10 10 0 0 1 20 0Z"/>',
  montana:    '<path d="m8 3 4 8 5-5 5 15H2Z"/>',
  compras:    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  ticket:     '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v14"/>',
  templo:     '<path d="M3 21h18"/><path d="M5 21V10l7-6 7 6v11"/><path d="M10 21v-6h4v6"/>',
  luna:       '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  sol:        '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
  telefono:   '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  globo:      '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
  cambiar:    '<path d="M7 4v13"/><path d="m4 7 3-3 3 3"/><path d="M17 20V7"/><path d="m14 17 3 3 3-3"/>',
  bombilla:   '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"/>',
  nube:       '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  nubeOk:     '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 13.5 2 2 4-4"/>',
  nubeNo:     '<path d="m2 2 20 20"/><path d="M5.78 5.78A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.31-.2"/><path d="M21.53 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7 7 0 0 0 10 5.07"/>',
  refrescar:  '<path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/>',
  persona:    '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  compartir:  '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  llave:      '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  lapiz:      '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'
};
const RELLENOS = { avion: true, rayo: true, montana: true, luna: true, telefono: true };

function ico(n, t = 20, extra = "") {
  const c = ICONOS[n] || ICONOS.pin;
  const relleno = RELLENOS[n];
  return `<svg width="${t}" height="${t}" viewBox="0 0 24 24" aria-hidden="true" ${extra}
    fill="${relleno ? "currentColor" : "none"}" stroke="${relleno ? "none" : "currentColor"}"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${c}</svg>`;
}

const ICO_TIPO = {
  avion: "avion", tren: "tren", ferry: "barco", barco: "barco", bus: "bus", coche: "coche",
  hotel: "casa", comida: "comida", gastronomia: "comida", playa: "playa", montana: "montana",
  compras: "compras", actividad: "ticket", visita: "pin", templo: "templo", idea: "bombilla"
};
const COMIDAS = [
  { k: "desayuno",  lb: "Desayuno",   ico: "cafe" },
  { k: "comida",    lb: "Comida",     ico: "comida" },
  { k: "cena",      lb: "Cena",       ico: "luna" },
  { k: "paracomer", lb: "Para comer", ico: "comida" }
];
const ES_COMIDA = { desayuno: 1, comida: 1, cena: 1, paracomer: 1, comer: 1 };
const MOMENTOS = {
  manana: { lb: "Mañana", ancla: "09:00" },
  tarde:  { lb: "Tarde",  ancla: "16:00" },
  noche:  { lb: "Noche",  ancla: "21:00" }
};
const MODO = {
  avion: { nombre: "Vuelo",  num: "Vuelo",   veh: "Avión",    docs: "Tarjetas de embarque", subir: "Subir tarjeta de embarque", llegar: "para aterrizar", plural: "Vuelos" },
  tren:  { nombre: "Tren",   num: "Tren",    veh: "Tren",     docs: "Billetes", subir: "Subir billete", llegar: "para llegar", plural: "Trenes" },
  bus:   { nombre: "Bus",    num: "Línea",   veh: "Vehículo", docs: "Billetes", subir: "Subir billete", llegar: "para llegar", plural: "Buses" },
  ferry: { nombre: "Barco",  num: "Barco",   veh: "Barco",    docs: "Billetes", subir: "Subir billete", llegar: "para llegar", plural: "Barcos" },
  coche: { nombre: "Coche",  num: "Ref.",    veh: "Vehículo", docs: "Documentos", subir: "Subir documento", llegar: "para llegar", plural: "Coche" }
};
const modoDe = t => MODO[t.modo] || MODO.avion;
const CATEGORIAS = ["Comida", "Transporte", "Alojamiento", "Actividad", "Compras", "Otros"];
const ICO_CAT = { Comida: "comida", Transporte: "ruta", Alojamiento: "casa", Actividad: "ticket", Compras: "compras", Otros: "cartera" };

/* ============================ 3. ESTADO LOCAL ============================ */

const CLAVE = "misviajes.estado.v1";
let estado = {
  viajeActivo: null, tema: "dia", pestana: "ahora",
  check: {}, tipos: {}, gastos: {}, contactos: {},
  conexion: null,   // { url, clave }
  yo: null,         // quién usa este móvil
  cola: []          // cambios de gastos pendientes de subir a la hoja
};

function cargarEstado() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) estado = Object.assign(estado, JSON.parse(raw));
  } catch (e) { console.warn("No se pudo leer el estado guardado", e); }
  if (estado.pestana === "vuelos") estado.pestana = "transportes";
  if (!Array.isArray(estado.cola)) estado.cola = [];
}
function guardarEstado() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
  catch (e) { console.warn("No se pudo guardar el estado", e); }
}

/* Última copia de los datos de las hojas. Es lo que se enseña sin conexión. */
const CLAVE_DATOS = "misviajes.datos.v1";
let DATOS = { viajes: [], generado: null, recibido: null, errores: [] };
function cargarDatos() {
  try { const r = localStorage.getItem(CLAVE_DATOS); if (r) DATOS = Object.assign(DATOS, JSON.parse(r)); }
  catch (e) { console.warn("No se pudo leer la copia de datos", e); }
}
function guardarDatos() {
  try { localStorage.setItem(CLAVE_DATOS, JSON.stringify(DATOS)); }
  catch (e) { console.warn("No se pudo guardar la copia de datos", e); }
}

/* ============================ 4. CONEXIÓN CON LAS HOJAS ================== */

const SYNC = { estado: "reposo", error: null, enCurso: null, enviando: null };

async function llamar(opciones, params) {
  const c = estado.conexion;
  if (!c) throw new Error("Sin conexión configurada");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 45000);
  try {
    let url = c.url, init = { redirect: "follow", signal: ctrl.signal };
    if (opciones === "GET") {
      url += (url.includes("?") ? "&" : "?") + new URLSearchParams(Object.assign({ clave: c.clave }, params));
    } else {
      init.method = "POST";
      init.headers = { "Content-Type": "text/plain;charset=utf-8" };
      init.body = JSON.stringify(Object.assign({ clave: c.clave }, params));
    }
    const resp = await fetch(url, init);
    if (!resp.ok) throw new Error("El script respondió " + resp.status);
    const texto = await resp.text();
    let j;
    try { j = JSON.parse(texto); }
    catch (e) { throw new Error("La dirección no parece la del script (¿acaba en /exec?)"); }
    if (!j.ok) throw new Error(j.error === "clave" ? "La clave no coincide con la del script" : (j.error || "Error del script"));
    return j;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("El script tarda demasiado en responder");
    throw e;
  } finally { clearTimeout(t); }
}

/** Sube los gastos pendientes y descarga todo de nuevo. */
function sincronizar() {
  if (!estado.conexion) return Promise.resolve();
  if (SYNC.enCurso) return SYNC.enCurso;
  SYNC.enCurso = (async () => {
    SYNC.estado = "cargando"; pintarSync();
    try {
      const antes = JSON.stringify(DATOS.viajes) + estado.cola.length;
      await enviarCola();
      const r = await llamar("GET", { accion: "todo" });
      DATOS = { viajes: r.viajes || [], generado: r.generado, recibido: Date.now(), errores: r.errores || [] };
      migrarGastosAntiguos();
      guardarDatos();
      SYNC.estado = "ok"; SYNC.error = null;
      if (JSON.stringify(DATOS.viajes) + estado.cola.length !== antes || !VIAJE_ACTIVO) {
        montarViajes();
        await recargarDocs();
        pintar(true);
      }
      if (estado.cola.length) empujar();
    } catch (e) {
      SYNC.estado = navigator.onLine === false ? "offline" : "error";
      SYNC.error = e.message;
      console.warn("Sincronización:", e);
      if (!VIAJES.length) pintar();
    } finally {
      SYNC.enCurso = null;
      pintarSync();
    }
  })();
  return SYNC.enCurso;
}

/** Manda la cola de cambios de gastos. Lo que no sale se queda para luego. */
async function enviarCola() {
  if (!estado.cola.length || !estado.conexion) return;
  const ops = estado.cola.slice();
  const r = await llamar("POST", { accion: "lote", ops });
  const hechas = new Set(r.hechas || []);
  estado.cola = estado.cola.filter(o => !hechas.has(o.opId));
  guardarEstado();
  Object.entries(r.gastosViaje || {}).forEach(([hoja, lista]) => {
    DATOS.viajes.filter(v => v.hoja === hoja).forEach(v => v.gastosViaje = lista);
    VIAJES.filter(v => v.hoja === hoja).forEach(v => v.gastosViaje = lista);
  });
  guardarDatos();
}

/** Intento rápido de subir la cola (tras apuntar un gasto). */
function empujar() {
  if (SYNC.enviando || SYNC.enCurso) return;
  if (navigator.onLine === false) { SYNC.estado = "offline"; pintarSync(); return; }
  SYNC.enviando = (async () => {
    try { await enviarCola(); SYNC.estado = "ok"; SYNC.error = null; }
    catch (e) { SYNC.estado = navigator.onLine === false ? "offline" : "error"; SYNC.error = e.message; }
    finally {
      SYNC.enviando = null; pintarSync();
      if (estado.pestana === "dinero" && $("#hoja").dataset.abierto !== "1") pintar(true);
    }
  })();
}

/** Gastos que se apuntaron en el móvil con la versión anterior de la app. */
function migrarGastosAntiguos() {
  let movidos = 0;
  Object.entries(estado.gastos || {}).forEach(([vid, lista]) => {
    const v = DATOS.viajes.find(x => x.id === vid);
    if (!v || !Array.isArray(lista)) return;
    lista.forEach(g => {
      estado.cola.push({ opId: nuevoId("o"), tipo: "gasto", hoja: v.hoja, gasto: {
        id: g.id || nuevoId("g"), fecha: g.fecha, quien: estado.yo || "", concepto: g.concepto,
        categoria: g.categoria, importe: g.importe, moneda: g.moneda, eur: null, creado: g.creado || Date.now()
      }});
      movidos++;
    });
    delete estado.gastos[vid];
  });
  if (movidos) guardarEstado();
}

/* ============================ 5. ALMACÉN DE DOCUMENTOS (IndexedDB) ======= */

const DB = {
  _p: null,
  abrir() {
    if (this._p) return this._p;
    this._p = new Promise((ok, ko) => {
      const r = indexedDB.open("misviajes-docs", 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains("docs")) {
          const s = db.createObjectStore("docs", { keyPath: "id" });
          s.createIndex("porRef", ["viajeId", "refId"], { unique: false });
          s.createIndex("porViaje", "viajeId", { unique: false });
        }
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ko(r.error);
    });
    return this._p;
  },
  async _tx(modo, fn) {
    const db = await this.abrir();
    return new Promise((ok, ko) => {
      const tx = db.transaction("docs", modo);
      const res = fn(tx.objectStore("docs"));
      tx.oncomplete = () => ok(res && res.result !== undefined ? res.result : res);
      tx.onerror = () => ko(tx.error);
    });
  },
  poner(doc)     { return this._tx("readwrite", s => s.put(doc)); },
  borrar(id)     { return this._tx("readwrite", s => s.delete(id)); },
  todos(viajeId) {
    return this._tx("readonly", s => s.index("porViaje").getAll(viajeId));
  }
};

let DOCS = [];                                   // caché en memoria del viaje activo
const docsDe = ref => DOCS.filter(d => d.refId === ref).sort((a, b) => a.creado - b.creado);

async function recargarDocs() {
  if (!viaje()) { DOCS = []; return; }
  try { DOCS = (await DB.todos(viaje().id)) || []; }
  catch (e) { DOCS = []; console.warn("IndexedDB no disponible", e); }
}

/* --- Importar un archivo (imagen o PDF) --- */

let _pdfjsCargado = null;
function cargarPdfJs() {
  if (_pdfjsCargado) return _pdfjsCargado;
  _pdfjsCargado = new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = "lib/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdf.worker.min.js";
      ok(window.pdfjsLib);
    };
    s.onerror = () => ko(new Error("No se pudo cargar pdf.js"));
    document.head.appendChild(s);
  });
  return _pdfjsCargado;
}

async function pdfAImagenes(file) {
  const pdfjs = await cargarPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const paginas = [];
  const n = Math.min(pdf.numPages, 6);
  for (let i = 1; i <= n; i++) {
    const page = await pdf.getPage(i);
    const v1 = page.getViewport({ scale: 1 });
    const escala = Math.min(1800 / v1.width, 3);
    const vp = page.getViewport({ scale: escala });
    const c = document.createElement("canvas");
    c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    paginas.push(await new Promise(r => c.toBlob(r, "image/jpeg", 0.92)));
  }
  return paginas;
}

async function importarArchivo(file, refId, etiqueta) {
  const id = "d" + Date.now() + Math.random().toString(36).slice(2, 7);
  const doc = {
    id, viajeId: viaje().id, refId,
    nombre: etiqueta || file.name || "Documento",
    tipo: file.type, creado: Date.now(),
    original: file, imagenes: []
  };
  if (/pdf/i.test(file.type) || /\.pdf$/i.test(file.name || "")) {
    doc.imagenes = await pdfAImagenes(file);
  } else if (/^image\//i.test(file.type)) {
    doc.imagenes = [file];
  } else {
    throw new Error("Solo se admiten imágenes y PDF.");
  }
  await DB.poner(doc);
  await recargarDocs();
  return doc;
}

/* ============================ 6. MODELO ============================ */

let VIAJES = [];
let VIAJE_ACTIVO = null;
const viaje = () => VIAJE_ACTIVO;

const tzDe = (v, ciudad) => (v.lugares[ciudad] && v.lugares[ciudad].tz) || v.casa.tz;

function montarViajes() {
  VIAJES = (DATOS.viajes || []).map(v => {
    try { return prepararViaje(JSON.parse(JSON.stringify(v))); }
    catch (e) { console.error("Viaje con datos rotos", v && v.nombre, e); return null; }
  }).filter(Boolean).sort((a, b) => a.inicio.localeCompare(b.inicio));
  VIAJE_ACTIVO = VIAJES.find(v => v.id === estado.viajeActivo) || elegirViajePorFecha();
  if (VIAJE_ACTIVO) estado.viajeActivo = VIAJE_ACTIVO.id;
}

function elegirViajePorFecha() {
  const n = Date.now();
  return VIAJES.find(v => n <= v._finMs) || VIAJES[VIAJES.length - 1] || null;
}

/** Deja un viaje listo para pintar: horas en UTC, días, avisos… */
function prepararViaje(v) {
  v._avisosApp = [];
  ["transportes", "alojamientos", "plan", "gastos", "mochila", "emergencia", "gastosViaje", "monedas", "avisos", "viajeros"]
    .forEach(k => { if (!Array.isArray(v[k])) v[k] = []; });
  v.lugares = v.lugares || {};
  v.casa = v.casa || { ciudad: "Casa", tz: "Europe/Madrid" };
  if (!tzValida(v.casa.tz)) { av(v, `La zona horaria de casa «${v.casa.tz}» no existe. Uso Europe/Madrid.`); v.casa.tz = "Europe/Madrid"; }
  Object.entries(v.lugares).forEach(([c, l]) => {
    if (!tzValida(l.tz)) { av(v, `📱 Lugares: la zona horaria de ${c} («${l.tz}») no existe. Uso la de casa.`); l.tz = v.casa.tz; }
  });
  const revisa = (ciudad, donde) => {
    if (ciudad && !v.lugares[ciudad] && !v._avisosApp.some(x => x.includes(`«${ciudad}»`)))
      av(v, `«${ciudad}» (${donde}) no está en 📱 Lugares: uso la hora de casa. Añádela o escríbela igual.`);
  };

  /* Fechas del viaje: si faltan, se deducen de lo que haya */
  const fechas = [].concat(
    v.transportes.map(t => t.salida.slice(0, 10)), v.transportes.map(t => t.llegada.slice(0, 10)),
    v.alojamientos.map(a => a.entrada), v.alojamientos.map(a => a.salida),
    v.plan.filter(p => p.fecha).map(p => p.fecha)).filter(Boolean).sort();
  v._vacio = !v.inicio && !fechas.length;
  if (!v.inicio) v.inicio = fechas[0] || fechaISO(Date.now(), v.casa.tz);
  if (!v.fin) v.fin = fechas[fechas.length - 1] || v.inicio;
  if (v.fin < v.inicio) { av(v, "📱 Viaje: el Fin es anterior al Inicio."); v.fin = v.inicio; }

  /* Transportes */
  v._trans = v.transportes.map(t => {
    revisa(t.desde.ciudad, "Transportes"); revisa(t.hasta.ciudad, "Transportes");
    const tzO = tzDe(v, t.desde.ciudad), tzD = tzDe(v, t.hasta.ciudad);
    const sal = aUTC(t.salida, tzO), lle = aUTC(t.llegada, tzD);
    if (lle < sal) av(v, `📱 Transportes: ${t.desde.ciudad} → ${t.hasta.ciudad} llega antes de salir. Revisa fechas y zonas horarias.`);
    return Object.assign({}, t, { tzO, tzD, sal, lle, durMs: lle - sal });
  }).filter(t => isFinite(t.sal) && isFinite(t.lle)).sort((a, b) => a.sal - b.sal);

  v._trans.forEach((t, i) => {
    const sig = v._trans[i + 1];
    t.conexion = null;
    if (sig && !sig.pendiente && sig.desde.ciudad === t.hasta.ciudad) {
      const ms = sig.sal - t.lle;
      if (ms >= 0 && ms < 20 * 3600e3) {
        sig.esEnlace = true;
        t.conexion = {
          ms, ciudad: t.hasta.ciudad, siguiente: sig,
          cambiaTerminal: !!(t.hasta.terminal && sig.desde.terminal && t.hasta.terminal !== sig.desde.terminal),
          ajustada: ms < 150 * 60e3
        };
      }
    }
  });

  /* Alojamientos */
  v._camas = v.alojamientos.map(a => {
    revisa(a.ciudad, "Alojamientos");
    const tz = tzDe(v, a.ciudad);
    return Object.assign({}, a, {
      tz,
      inMs: aUTC(a.entrada + "T" + (a.horaEntrada || "15:00"), tz),
      outMs: aUTC(a.salida + "T" + (a.horaSalida || "12:00"), tz)
    });
  }).sort((a, b) => a.inMs - b.inMs);

  v._inicioMs = aUTC(v.inicio + "T00:00", v.casa.tz);
  v._finMs = aUTC(v.fin + "T23:59", v.casa.tz);

  construirDias(v);
  v._nochesSinCama = nochesSinCama(v);
  v.monedas.forEach(m => { if (!m.porEuro) m.porEuro = null; });
  return v;
}

/** Dónde estáis a una hora concreta, según lo último que haya pasado. */
function ciudadEn(v, ms) {
  let mejor = null, t = -Infinity;
  v._trans.forEach(x => { if (x.lle <= ms && x.lle > t) { t = x.lle; mejor = x.hasta.ciudad; } });
  v._camas.forEach(a => { if (a.inMs <= ms && a.inMs > t) { t = a.inMs; mejor = a.ciudad; } });
  if (!mejor) mejor = v._trans[0] ? v._trans[0].desde.ciudad : v.casa.ciudad;
  return mejor;
}

/** Un día por fecha del viaje, con su ciudad, sus planes y sus comidas. */
function construirDias(v) {
  const tzRef = v.casa.tz;
  const dias = [];
  let cur = aUTC(v.inicio + "T12:00", tzRef);
  const fin = aUTC(v.fin + "T12:00", tzRef);
  while (cur <= fin && dias.length < 120) {
    dias.push({ fecha: fechaISO(cur, tzRef), ms: cur, ciudad: null, planes: [], comidas: [] });
    cur += 86400e3;
  }
  v._ideas = [];
  v.plan.forEach((p, i) => {
    p._i = i;
    p.tipo = (p.tipo || "").replace(/[^a-z]/g, "");
    if (p.tipo === "comer") p.tipo = "paracomer";
    if (!p.fecha) { if (p.texto) v._ideas.push(p); return; }
    const d = dias.find(x => x.fecha === p.fecha);
    if (!d) { av(v, `📱 Itinerario: «${p.texto || p.ciudad}» es del ${fechaCorta(p.fecha)}, fuera de las fechas del viaje.`); return; }
    if (p.ciudad && !d.ciudad) d.ciudad = p.ciudad;
    if (!p.texto) return;                               // fila que solo marca la ciudad
    (ES_COMIDA[p.tipo] ? d.comidas : d.planes).push(p);
  });

  dias.forEach(d => {
    if (!d.ciudad) {
      const cama = v._camas.find(a => a.entrada <= d.fecha && d.fecha < a.salida);
      d.ciudad = cama ? cama.ciudad : ciudadEn(v, d.ms);
    }
    const tz = tzDe(v, d.ciudad);
    d.tz = tz;
    /* Lo que no tiene hora hereda la de la fila anterior; si el día empieza
       con un trayecto de mañana, lo que no tiene hora va después de llegar. */
    let ancla = aUTC(d.fecha + "T00:00", tz);
    v._trans.forEach(t => {
      if (fechaISO(t.sal, t.tzO) === d.fecha && +hora(t.sal, t.tzO).slice(0, 2) < 12 && fechaISO(t.lle, t.tzD) === d.fecha)
        ancla = Math.max(ancla, t.lle);
    });
    let prev = ancla;
    d.planes.forEach(p => {
      if (p.hora) { p._ms = aUTC(d.fecha + "T" + p.hora, tz); p._blando = false; }
      else if (MOMENTOS[p.momento]) { p._ms = aUTC(d.fecha + "T" + MOMENTOS[p.momento].ancla, tz); p._blando = true; }
      else { p._ms = prev + 1000; p._blando = true; }
      prev = p._ms;
    });
  });
  v.dias = dias;
}
function av(v, t) { if (!v._avisosApp.includes(t)) v._avisosApp.push(t); }

/** Noches entre inicio y fin sin hotel y sin ir de viaje en ese momento. */
function nochesSinCama(v) {
  if (v._vacio) return [];
  const out = [];
  v.dias.slice(0, -1).forEach((d, i) => {
    if (v._camas.some(a => a.entrada <= d.fecha && d.fecha < a.salida)) return;
    const sig = v.dias[i + 1];
    const madrugada = aUTC(sig.fecha + "T03:00", d.tz);
    if (v._trans.some(t => t.sal <= madrugada && t.lle >= madrugada)) return;
    out.push({ fecha: d.fecha, ciudad: d.ciudad });
  });
  return out;
}

/** Lista plana de todo lo que ocurre, ordenada en el tiempo. */
function eventos(v) {
  const ev = [];
  v._trans.forEach(t => {
    ev.push({
      ms: t.sal, tipo: t.modo, clase: "transporte", ref: t,
      titulo: `${t.desde.ciudad} → ${t.hasta.ciudad}`,
      sub: t.pendiente ? "Sin reservar" : [t.compania, t.numero].filter(Boolean).join(" · "),
      tz: t.tzO, fecha: fechaISO(t.sal, t.tzO)
    });
  });
  v._camas.forEach(a => {
    ev.push({ ms: a.inMs, tipo: "hotel", clase: "checkin", ref: a, titulo: "Entrada · " + a.nombre, sub: a.habitacion, tz: a.tz, fecha: a.entrada });
    ev.push({ ms: a.outMs, tipo: "hotel", clase: "checkout", ref: a, titulo: "Salida · " + a.nombre, sub: a.zona || a.ciudad, tz: a.tz, fecha: a.salida });
  });
  v.dias.forEach(d => {
    d.planes.forEach(p => {
      ev.push({
        ms: p._ms, blando: p._blando, momento: !p.hora && MOMENTOS[p.momento] ? p.momento : null,
        tipo: p.tipo || "visita", clase: "plan", ref: p,
        titulo: p.texto, sub: p.nota, tz: d.tz, fecha: d.fecha, orden: p._i
      });
    });
  });
  return ev.sort((a, b) => a.ms - b.ms || (a.orden || 0) - (b.orden || 0));
}

/** Dónde estoy ahora (o dónde estaré al empezar el viaje). */
function ubicacion(v, ahora) {
  const tzRef = v.casa.tz;
  const hoy = fechaISO(ahora, tzRef);
  let ciudad = null;
  const d = v.dias.find(x => x.fecha === hoy);
  if (d) ciudad = d.ciudad;
  else if (ahora > v._finMs) ciudad = v.casa.ciudad;
  else if (ahora < v._inicioMs) {
    // Viaje sin empezar: apunta a la primera ciudad de destino con otra zona horaria.
    const primeraFuera = v.dias.find(x => tzDe(v, x.ciudad) !== tzRef);
    ciudad = primeraFuera ? primeraFuera.ciudad : (v.dias[v.dias.length - 1] || {}).ciudad;
  }
  const enRuta = v._trans.find(t => ahora >= t.sal && ahora <= t.lle);
  if (enRuta) ciudad = enRuta.hasta.ciudad;
  if (!ciudad) ciudad = v.casa.ciudad;
  return { ciudad, tz: tzDe(v, ciudad) };
}

/** Lo que queda por hacer antes de salir (o durante el viaje). */
function pendientes(v, ahora) {
  const hoy = fechaISO(ahora, v.casa.tz);
  const empezado = ahora >= v._inicioMs;
  const L = [];
  v._trans.forEach(t => {
    if (t.pendiente && t.lle > ahora)
      L.push({ ico: "alerta", tit: `Sin reservar: ${t.desde.ciudad} → ${t.hasta.ciudad}`, sub: `${modoDe(t).nombre} del ${diaMes(t.sal, t.tzO)}`, tab: "transportes" });
  });
  v._nochesSinCama.forEach(n => {
    if (n.fecha >= hoy) L.push({ ico: "casa", tit: `Sin alojamiento la noche del ${fechaCorta(n.fecha)}`, sub: n.ciudad, tab: "camas" });
  });
  v._camas.forEach(a => {
    if ((a.pagado === false || a.pagado === "parte") && a.outMs > ahora)
      L.push({ ico: "cartera", tit: `${a.pagado === "parte" ? "Pagado solo en parte" : "Sin pagar"}: ${a.nombre}`, sub: `${fechaCorta(a.entrada)} · ${a.ciudad}`, tab: "camas" });
  });
  v.gastos.forEach(g => {
    if (!g.pagado && (!g.fecha || g.fecha >= hoy))
      L.push({ ico: "cartera", tit: `Por pagar: ${g.detalle}`, sub: [g.precio !== null ? eur(g.precio) : null, g.fecha ? fechaCorta(g.fecha) : null].filter(Boolean).join(" · "), tab: "dinero" });
  });
  if (!empezado) {
    v.emergencia.forEach(e => {
      if (!e.valor && !e.tel) L.push({ ico: "telefono", tit: `Falta el dato: ${e.titulo}`, sub: "Pestaña 📱 Emergencia de la hoja", tab: "mas" });
    });
    v.monedas.forEach(m => {
      if (!m.porEuro && estado.tipos[v.id + "::" + m.codigo] === undefined)
        L.push({ ico: "cartera", tit: `Falta el tipo de cambio de ${m.codigo}`, sub: "Pestaña 📱 Lugares, columna «1 € =»", tab: "dinero" });
    });
  }
  return L;
}

/* ============================ 7. FRAGMENTOS REUTILIZABLES ============== */

function elMaps(texto, consulta, clase) {
  if (!consulta) return esc(texto);
  return `<a class="maps ${clase || ""}" href="${esc(mapsUrl(consulta))}" target="_blank" rel="noopener">${esc(texto)}${ico("enlace", 11)}</a>`;
}
function seccion(icono, titulo, sub, extra) {
  return `<div class="seccion"><div class="seccion-ico">${ico(icono, 17)}</div>
    <div style="flex:1;min-width:0"><h2>${esc(titulo)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${extra || ""}</div>`;
}

let _mini = [];
function urlMini(blob) { const u = URL.createObjectURL(blob); _mini.push(u); return u; }
function liberarMinis() { _mini.forEach(u => URL.revokeObjectURL(u)); _mini = []; }

function bloqueDocs(refId, titulo, textoBoton) {
  const ds = docsDe(refId).filter(d => d.imagenes && d.imagenes.length);
  return `<div class="docs">
    <div class="docs-tit">${esc(titulo)}</div>
    ${ds.map(d => `
      <div class="doc-fila">
        <img class="doc-mini" data-ver="${d.id}" alt="" src="${urlMini(d.imagenes[0])}">
        <div class="doc-nom" data-ver="${d.id}">${esc(d.nombre)}
          <div class="doc-sub">${d.imagenes.length > 1 ? d.imagenes.length + " páginas · " : ""}${new Date(d.creado).toLocaleDateString("es-ES")}</div>
        </div>
        <button class="cab-btn" style="background:var(--borde-2);color:var(--tinta-2)" data-ver="${d.id}" aria-label="Abrir">${ico("flecha", 18)}</button>
      </div>`).join("")}
    <label class="btn suave" style="margin-top:${ds.length ? "10" : "0"}px">
      ${ico("subir", 18)} ${esc(textoBoton)}
      <input type="file" accept="image/*,application/pdf" data-subir="${esc(refId)}" hidden>
    </label>
  </div>`;
}

function inicial(nombre) { return esc((nombre || "?").trim().charAt(0).toUpperCase()); }
function colorPersona(nombre) {
  const v = viaje();
  const i = v ? v.viajeros.indexOf(nombre) : -1;
  return i === 0 ? "var(--acento)" : i === 1 ? "var(--acento-2)" : "var(--tinta-3)";
}
function avatar(nombre, t = 26) {
  return `<span class="avatar" style="width:${t}px;height:${t}px;background:${colorPersona(nombre)}" title="${esc(nombre)}">${inicial(nombre)}</span>`;
}

/** Bloque de comidas de un día: Desayuno / Comida / Cena / Para comer */
function bloqueComer(d) {
  if (!d.comidas.length) return "";
  return `<div class="comer">${COMIDAS.map(c => {
    const sitios = d.comidas.filter(x => x.tipo === c.k);
    if (!sitios.length) return "";
    return `<div class="comer-fila">
      <div class="comer-et">${ico(c.ico, 14)}<span>${c.lb}</span></div>
      <div class="comer-sitios">${sitios.map(s => s.maps
        ? `<a class="sitio" href="${esc(mapsUrl(s.maps))}" target="_blank" rel="noopener">${esc(s.texto)}</a>`
        : `<span class="sitio sin">${esc(s.texto)}</span>`).join("")}</div>
    </div>`;
  }).join("")}</div>`;
}

/* ============================ 8. VISTA: AHORA ========================== */

function tarjetaPendientes(v, ahora) {
  const L = pendientes(v, ahora);
  const antes = ahora < v._inicioMs;
  if (!L.length) {
    return antes && !v._vacio ? `<div class="listo">${ico("hecho", 18)}<div><b>Todo listo para salir.</b> Nada sin reservar ni sin pagar.</div></div>` : "";
  }
  return `<div class="tarjeta pend">
    <div class="pend-cab">${ico("alerta", 16)}<span>${antes ? "Antes de salir" : "Pendiente"}</span><b class="num">${L.length}</b></div>
    ${L.map(p => `<button class="pend-fila" data-tab="${p.tab}">
      <span class="pend-ico">${ico(p.ico, 16)}</span>
      <span class="pend-tx"><span class="t">${esc(p.tit)}</span>${p.sub ? `<span class="s">${esc(p.sub)}</span>` : ""}</span>
      <span class="pend-fl">${ico("derecha", 16)}</span>
    </button>`).join("")}
  </div>`;
}

function vistaAhora() {
  const v = viaje(), ahora = Date.now();
  if (v._vacio) return vistaVacio(v);
  const ev = eventos(v);
  const prox = ev.find(e => e.ms > ahora && !e.blando);
  const actualTrans = v._trans.find(t => ahora >= t.sal && ahora <= t.lle);
  const camaHoy = v._camas.find(a => ahora >= a.inMs - 6 * 3600e3 && ahora <= a.outMs);
  const loc = ubicacion(v, ahora);
  let h = "";

  /* --- Héroe --- */
  if (ahora < v._inicioMs) {
    const dias = Math.ceil((v._inicioMs - ahora) / 86400e3);
    h += `<div class="ahora-hero">
      <div class="et">Salís en</div>
      <h3 class="num">${dias} ${dias === 1 ? "día" : "días"}</h3>
      <div class="sub">${esc(v.subtitulo || v.nombre)}</div>
      ${prox ? `<div class="cuenta"><div class="big num">${hora(prox.ms, prox.tz)}</div>
        <div class="lb">${esc(prox.titulo)} · ${diaMes(prox.ms, prox.tz)}</div></div>` : ""}
    </div>`;
  } else if (ahora > v._finMs) {
    h += `<div class="ahora-hero"><div class="et">Viaje terminado</div>
      <h3>Bienvenidos a casa</h3><div class="sub">${esc(v.nombre)}</div></div>`;
  } else if (actualTrans) {
    const m = modoDe(actualTrans);
    h += `<div class="ahora-hero">
      <div class="et">Ahora mismo · en ruta</div>
      <h3>${esc(actualTrans.desde.iata || actualTrans.desde.ciudad)} → ${esc(actualTrans.hasta.iata || actualTrans.hasta.ciudad)}</h3>
      <div class="sub">${esc([actualTrans.compania, actualTrans.numero].filter(Boolean).join(" · "))}</div>
      <div class="cuenta"><div class="big num">${durLarga(actualTrans.lle - ahora)}</div>
        <div class="lb">${m.llegar} · llegada ${hora(actualTrans.lle, actualTrans.tzD)} hora local</div></div>
    </div>`;
  } else if (prox) {
    h += `<div class="ahora-hero">
      <div class="et">A continuación</div>
      <h3>${esc(prox.titulo)}</h3>
      <div class="sub">${esc(prox.sub || diaSem(prox.ms, prox.tz) + " " + diaMes(prox.ms, prox.tz))}</div>
      <div class="cuenta"><div class="big num">${durLarga(prox.ms - ahora)}</div>
        <div class="lb">a las ${hora(prox.ms, prox.tz)} hora local</div></div>
    </div>`;
  }

  /* --- Lo que falta --- */
  h += tarjetaPendientes(v, ahora);

  /* --- Mini fichas --- */
  h += `<div class="mini-grid">
    <div class="mini"><div class="et">Dónde estás</div><div class="vl">${esc(loc.ciudad)}</div></div>
    <div class="mini"><div class="et">Esta noche</div><div class="vl">${camaHoy ? esc(camaHoy.nombre) : "—"}</div></div>
  </div>`;

  /* --- Próximo trayecto con su tarjeta de embarque --- */
  const proxT = v._trans.find(t => t.lle > ahora && !t.pendiente);
  if (proxT) {
    const m = modoDe(proxT);
    h += `<div class="tarjeta">${cabeceraTrans(proxT)}${cuerpoTrans(proxT)}
      ${bloqueDocs(proxT.id, m.docs, docsDe(proxT.id).length ? "Añadir otro" : m.subir)}</div>`;
  }

  /* --- Hoy --- */
  const hoyISO = fechaISO(ahora, loc.tz);
  const dHoy = v.dias.find(d => d.fecha === hoyISO);
  const restoHoy = ev.filter(e => e.fecha === hoyISO && (e.ms > ahora || e.blando) && e !== prox);
  if (restoHoy.length || (dHoy && dHoy.comidas.length)) {
    h += `<div class="dia-cab hoy"><span class="pt"></span><h3>Hoy</h3><span class="ct">${esc(dHoy ? dHoy.ciudad : "")}</span></div>
      <div class="tarjeta">${restoHoy.map(filaEvento).join("")}${dHoy ? bloqueComer(dHoy) : ""}</div>`;
  }
  return h;
}

function vistaVacio(v) {
  return `<div class="ahora-hero"><div class="et">Viaje nuevo</div><h3>${esc(v.nombre)}</h3>
    <div class="sub">Todavía no hay nada que enseñar.</div></div>
    <div class="tarjeta"><div style="padding:16px 16px 6px" class="nota">Rellena las pestañas <b>📱</b> de la hoja
    (empieza por <b>📱 Viaje</b> y <b>📱 Lugares</b>) y vuelve aquí: se actualiza solo al abrir la app.</div>
    <div style="padding:10px 14px 14px"><a class="btn" href="${esc(hojaUrl(v.hoja))}" target="_blank" rel="noopener">${ico("hoja", 18)} Abrir la hoja</a></div></div>`;
}

/* ============================ 9. VISTA: VIAJE ========================= */

function filaEvento(e) {
  const iconoN = ICO_TIPO[e.tipo] || "pin";
  const fuerte = e.clase === "transporte";
  const ref = e.ref || {};
  const maps = ref.maps || (e.clase === "checkin" || e.clase === "checkout" ? (ref.nombre + ", " + ref.ciudad) : null);
  const titulo = maps ? elMaps(e.titulo, maps) : esc(e.titulo);
  let sub = e.sub ? esc(e.sub) : "";
  if (e.clase === "transporte" && ref.pendiente) sub = `<b style="color:var(--ambar)">Sin reservar</b>`;
  if (e.clase === "transporte" && ref.conexion && ref.conexion.ajustada) {
    sub += `${sub ? " · " : ""}<b style="color:var(--ambar)">conexión de ${dur(ref.conexion.ms)}</b>`;
  }
  const hr = e.blando
    ? (e.momento ? `<span class="momento">${MOMENTOS[e.momento].lb}</span>` : "")
    : hora(e.ms, e.tz);
  return `<div class="evento${e.clase === "checkout" || e.clase === "checkin" ? " suave" : ""}">
    <div class="evento-ico${fuerte ? " fuerte" : ""}">${ico(iconoN, 17)}</div>
    <div class="evento-cuerpo">
      <div class="evento-tit">${titulo}</div>
      ${sub ? `<div class="evento-sub">${sub}</div>` : ""}
    </div>
    <div class="evento-hora num">${hr}</div>
  </div>`;
}

function vistaViaje() {
  const v = viaje(), ahora = Date.now();
  if (v._vacio) return vistaVacio(v);
  const ev = eventos(v);
  const tzRef = v.casa.tz;
  const hoyISO = fechaISO(ahora, tzRef);
  const dias = v.dias;

  let h = seccion("calendario", "Itinerario",
    `${diaMes(v._inicioMs, tzRef)} — ${diaMes(v._finMs, tzRef)} · ${dias.length} días`);

  /* Chips de ciudad */
  const ciudades = ["Todas"].concat([...new Set(dias.map(d => d.ciudad).filter(Boolean))]);
  if (ciudades.length > 2) {
    h += `<div class="chips">${ciudades.map(c =>
      `<button class="chip" data-ciudad="${esc(c)}" aria-pressed="${FILTRO_CIUDAD === c}">${esc(c)}</button>`).join("")}</div>`;
  }

  const visibles = FILTRO_CIUDAD === "Todas" ? dias : dias.filter(d => d.ciudad === FILTRO_CIUDAD);

  visibles.forEach(d => {
    const evDia = ev.filter(e => e.fecha === d.fecha);
    const esHoy = d.fecha === hoyISO;
    h += `<div class="dia-cab${esHoy ? " hoy" : ""}" ${esHoy ? 'id="diaHoy"' : ""}>
      <span class="pt"></span>
      <h3>${esc(diaSem(d.ms, tzRef))} ${esc(diaMes(d.ms, tzRef))}${esHoy ? " · hoy" : ""}</h3>
      <span class="ct">${esc(d.ciudad || "")}</span>
    </div>`;
    h += (evDia.length || d.comidas.length)
      ? `<div class="tarjeta">${evDia.map(filaEvento).join("")}${bloqueComer(d)}</div>`
      : `<div class="tarjeta"><div class="vacio">Día libre</div></div>`;
  });

  if (v._ideas.length) {
    h += `<div class="dia-cab"><span class="pt"></span><h3>Ideas sin fecha</h3></div>
      <div class="tarjeta">${v._ideas.map(i => `
        <div class="evento">
          <div class="evento-ico">${ico(ICO_TIPO[i.tipo] || "bombilla", 17)}</div>
          <div class="evento-cuerpo"><div class="evento-tit">${elMaps(i.texto, i.maps)}</div>
          ${i.nota ? `<div class="evento-sub">${esc(i.nota)}</div>` : ""}</div>
        </div>`).join("")}</div>`;
  }
  return h;
}

/* ============================ 10. VISTA: TRANSPORTES =================== */

function cabeceraTrans(t) {
  return `<div class="vuelo-cab">
    ${ico(ICO_TIPO[t.modo] || "avion", 19)}
    <span class="rt">${esc(t.desde.ciudad)} → ${esc(t.hasta.ciudad)}</span>
    <span class="nm">${t.pendiente ? "Sin reservar" : esc(t.numero || modoDe(t).nombre)}</span>
  </div>`;
}

function cuerpoTrans(t) {
  const m = modoDe(t);
  const term = x => x.terminal ? `<br>${esc(x.terminal)}` : "";
  const cod = x => esc(x.iata || x.ciudad.slice(0, 3).toUpperCase());
  let h = `<div class="tramo">
    <div class="tramo-lado">
      <div class="iata num">${cod(t.desde)}</div>
      <div class="hora num">${hora(t.sal, t.tzO)}</div>
      <div class="meta">${esc(diaSem(t.sal, t.tzO))} ${esc(diaMes(t.sal, t.tzO))}${term(t.desde)}</div>
    </div>
    <div class="tramo-medio">
      <div class="dur num">${dur(t.durMs)}</div>
      <div class="ln"></div>
      <div class="meta" style="font-size:10.5px;color:var(--tinta-3)">${esc(t.compania || "—")}</div>
    </div>
    <div class="tramo-lado der">
      <div class="iata num">${cod(t.hasta)}</div>
      <div class="hora num">${hora(t.lle, t.tzD)}</div>
      <div class="meta">${esc(diaSem(t.lle, t.tzD))} ${esc(diaMes(t.lle, t.tzD))}${term(t.hasta)}</div>
    </div>
  </div>`;

  h += `<div class="datos">
    <div><div class="et">Localizador</div><div class="vl num">${esc(t.localizador || "—")}</div></div>
    <div><div class="et">${m.num}</div><div class="vl num">${esc(t.numero || "—")}</div></div>
    <div><div class="et">${m.veh}</div><div class="vl" style="font-size:12.5px">${esc(t.avion || "—")}</div></div>
  </div>`;

  if (t.pendiente) {
    h += `<div class="aviso" style="margin-top:12px">${ico("alerta", 16)}<div><b>Sin reservar.</b> Las horas que ves son un hueco, no un ${m.nombre.toLowerCase()} real.</div></div>`;
  }
  (t.notas || []).forEach(n => {
    h += `<div class="aviso neutro" style="margin-top:12px">${ico("info", 16)}<div>${esc(n)}</div></div>`;
  });
  if (!t.esEnlace) {
    h += `<div style="padding:0 14px 14px">
      <a class="btn suave" href="${esc(rutaUrl((t.desde.aeropuerto || t.desde.ciudad) + ", " + t.desde.ciudad))}" target="_blank" rel="noopener">
        ${ico("pin", 17)} Cómo llegar a ${esc(t.desde.iata || t.desde.aeropuerto || t.desde.ciudad)}</a>
    </div>`;
  } else {
    h += `<div style="height:4px"></div>`;
  }
  return h;
}

function vistaTransportes() {
  const v = viaje(), ahora = Date.now();
  const modos = [...new Set(v._trans.map(t => t.modo))];
  let h = seccion("ruta", "Transportes", `${v._trans.length} ${v._trans.length === 1 ? "trayecto" : "trayectos"}`);
  if (!v._trans.length) return h + `<div class="tarjeta"><div class="vacio">No hay trayectos en la pestaña 📱 Transportes.</div></div>`;

  if (modos.length > 1) {
    h += `<div class="chips">${["todos"].concat(modos).map(m =>
      `<button class="chip" data-modo="${m}" aria-pressed="${FILTRO_MODO === m}">${m === "todos" ? "Todos" : (MODO[m] || MODO.avion).plural}</button>`).join("")}</div>`;
  }
  const lista = v._trans.filter(t => FILTRO_MODO === "todos" || t.modo === FILTRO_MODO || !modos.includes(FILTRO_MODO));

  lista.forEach(t => {
    const pasado = t.lle < ahora;
    const m = modoDe(t);
    h += `<div class="tarjeta" style="${pasado ? "opacity:.55" : ""}">
      ${cabeceraTrans(t)}${cuerpoTrans(t)}
      ${t.pendiente ? "" : bloqueDocs(t.id, m.docs, docsDe(t.id).length ? "Añadir otro" : m.subir)}
    </div>`;
    if (t.conexion && (FILTRO_MODO === "todos" || lista.includes(t.conexion.siguiente))) {
      const c = t.conexion;
      h += `<div class="conexion${c.ajustada ? " ajustada" : ""}">
        ${ico(c.ajustada ? "alerta" : "reloj", 17)}
        <span>Conexión en ${esc(c.ciudad)}: <b>${dur(c.ms)}</b>${c.cambiaTerminal ? " · cambias de terminal" : ""}${c.ajustada ? " — vas justo" : ""}</span>
      </div>`;
    }
  });
  return h;
}

/* ============================ 11. VISTA: HOTELES ====================== */

function vistaCamas() {
  const v = viaje();
  const noches = v._camas.reduce((s, a) => s + (a.noches || 0), 0);
  let h = seccion("casa", "Hoteles", `${v._camas.length} estancias · ${noches} noches`);

  v._nochesSinCama.forEach(n => {
    h += `<div class="aviso" style="margin:0 0 12px">${ico("alerta", 16)}<div><b>Noche del ${esc(fechaCorta(n.fecha))} sin alojamiento</b> · ${esc(n.ciudad)}</div></div>`;
  });
  if (!v._camas.length) return h + `<div class="tarjeta"><div class="vacio">No hay alojamientos en la pestaña 📱 Alojamientos.</div></div>`;

  v._camas.forEach(a => {
    const pago = a.pagado === false ? `<span class="eti ambar">Sin pagar</span>`
      : a.pagado === "parte" ? `<span class="eti ambar">Pagado en parte</span>` : "";
    h += `<div class="tarjeta">
      <div class="cama-cab">
        <span class="eti" style="background:rgba(255,255,255,.22);color:inherit">${esc(a.zona || a.ciudad)}</span>
        <h3>${esc(a.nombre)}</h3>
        <div class="hb">${esc(a.habitacion || "")}</div>
      </div>
      <div class="inout">
        <div><div class="et">Entrada</div><div class="vl num">${diaSem(a.inMs, a.tz)} ${diaMes(a.inMs, a.tz)}</div><div class="hr num">desde las ${esc(a.horaEntrada || "15:00")}</div></div>
        <div><div class="et">Salida</div><div class="vl num">${diaSem(a.outMs, a.tz)} ${diaMes(a.outMs, a.tz)}</div><div class="hr num">antes de las ${esc(a.horaSalida || "12:00")}</div></div>
      </div>
      <div class="datos">
        <div><div class="et">Noches</div><div class="vl num">${a.noches}</div></div>
        <div><div class="et">Total</div><div class="vl num">${a.puntos && !a.precio ? miles(a.puntos) + " pts" : eur(a.precio)}</div></div>
        <div><div class="et">${a.localizador ? "Localizador" : "Reserva"}</div><div class="vl" style="font-size:12.5px">${esc(a.localizador || a.plataforma || "—")}</div></div>
      </div>
      <div style="padding:12px 14px 0;display:flex;flex-wrap:wrap;gap:6px">
        ${pago}
        ${(a.servicios || []).map(s => `<span class="eti">${esc(s)}</span>`).join("")}
        ${a.puntos && a.precio ? `<span class="eti verde">+ ${miles(a.puntos)} puntos</span>` : ""}
        ${a.precioNoche ? `<span class="eti borde">${eur(a.precioNoche)} / noche</span>` : ""}
        ${a.localizador && a.plataforma ? `<span class="eti borde">${esc(a.plataforma)}</span>` : ""}
      </div>
      ${(a.notas || []).map(n => `<div class="aviso" style="margin-top:12px">${ico("info", 16)}<div>${esc(n)}</div></div>`).join("")}
      <div style="padding:12px 14px 14px">
        <a class="btn suave" href="${esc(rutaUrl(a.maps || a.nombre + ", " + a.ciudad))}" target="_blank" rel="noopener">
          ${ico("pin", 17)} Cómo llegar</a>
      </div>
    </div>`;
  });
  return h;
}

/* ============================ 12. VISTA: DINERO ======================= */

function tipoDe(cod) {
  const v = viaje();
  if (cod === "EUR") return 1;
  const k = v.id + "::" + cod;
  if (estado.tipos[k] !== undefined) return estado.tipos[k];
  const m = (v.monedas || []).find(x => x.codigo === cod);
  return (m && m.porEuro) || 1;
}
const aEuros = g => (g.eur !== null && g.eur !== undefined && g.eur !== "") ? Number(g.eur)
  : g.moneda === "EUR" ? g.importe : g.importe / (tipoDe(g.moneda) || 1);

/** Gastos compartidos: lo que dice la hoja + lo que este móvil aún no ha subido. */
function gastosVista(v) {
  const m = new Map((v.gastosViaje || []).map(g => [g.id, Object.assign({}, g)]));
  estado.cola.filter(o => o.hoja === v.hoja).forEach(o => {
    if (o.tipo === "gasto") m.set(o.gasto.id, Object.assign({}, o.gasto, { pendiente: true }));
    else if (o.tipo === "borrar") m.delete(o.id);
  });
  return [...m.values()].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "") || (b.creado || 0) - (a.creado || 0));
}

function lineaSync() {
  const pend = estado.cola.length;
  if (SYNC.estado === "cargando" || SYNC.enviando) return `${ico("refrescar", 13, 'class="gira"')} Sincronizando…`;
  if (pend) return `${ico("nube", 13)} ${pend} ${pend === 1 ? "cambio" : "cambios"} sin subir · se suben al tener conexión`;
  if (SYNC.estado === "error") return `${ico("nubeNo", 13)} No se pudo sincronizar`;
  return `${ico("nubeOk", 13)} Compartido con la hoja · ${haceCuanto(DATOS.recibido)}`;
}

function vistaDinero() {
  const v = viaje();
  let h = "";

  /* --- Gastos del viaje (compartidos) --- */
  const lista = gastosVista(v);
  const total = lista.reduce((s, g) => s + aEuros(g), 0);
  const porPersona = {};
  v.viajeros.forEach(p => porPersona[p] = 0);
  lista.forEach(g => { const q = g.quien || "Sin asignar"; porPersona[q] = (porPersona[q] || 0) + aEuros(g); });
  const porCat = {};
  lista.forEach(g => { porCat[g.categoria || "Otros"] = (porCat[g.categoria || "Otros"] || 0) + aEuros(g); });
  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);

  h += `<div class="total-hero gastado">
    <div class="et">Gastado en el viaje</div>
    <div class="vl num">${eur(r2(total))}</div>
    <div class="personas">${Object.entries(porPersona).filter(([p, n]) => n || v.viajeros.includes(p)).map(([p, n]) =>
      `<span class="persona">${avatar(p, 20)}<span>${esc(p)}</span><b class="num">${eur(r2(n))}</b></span>`).join("")}</div>
    <button class="btn apuntar" data-nuevo-gasto>${ico("mas", 18)} Apuntar un gasto</button>
    <div class="sync-linea" id="syncLinea">${lineaSync()}</div>
  </div>`;

  if (cats.length > 1 && total > 0) {
    h += `<div class="tarjeta" style="padding:14px">
      <div class="apilada">${cats.map(([c, n], i) => `<i style="width:${(n / total * 100).toFixed(2)}%;background:var(--serie-${i % 6})"></i>`).join("")}</div>
      <div class="leyenda">${cats.map(([c, n], i) => `<span><i style="background:var(--serie-${i % 6})"></i>${esc(c)} <b class="num">${eur(r2(n))}</b></span>`).join("")}</div>
    </div>`;
  }

  if (lista.length) {
    let fechaPrev = null;
    h += `<div class="tarjeta">`;
    lista.forEach(g => {
      if (g.fecha !== fechaPrev) {
        fechaPrev = g.fecha;
        const del = lista.filter(x => x.fecha === g.fecha).reduce((s, x) => s + aEuros(x), 0);
        h += `<div class="gasto-dia"><span>${g.fecha ? esc(diaSem(aUTC(g.fecha + "T12:00", "UTC"), "UTC") + " " + fechaCorta(g.fecha)) : "Sin fecha"}</span><b class="num">${eur(r2(del))}</b></div>`;
      }
      h += `<button class="gasto-fila" data-editar-gasto="${esc(g.id)}">
        <span class="gasto-ico">${ico(ICO_CAT[g.categoria] || "cartera", 16)}</span>
        <span class="tx"><span class="n">${esc(g.concepto)}</span>
          <span class="d">${g.quien ? esc(g.quien) + " · " : ""}${esc(g.categoria || "Otros")}${g.moneda !== "EUR" ? " · " + miles(g.importe) + " " + esc(g.moneda) : ""}</span></span>
        ${g.pendiente ? `<span class="subiendo" title="Pendiente de subir">${ico("nube", 14)}</span>` : ""}
        <span class="pr num">${eur(r2(aEuros(g)))}</span>
      </button>`;
    });
    h += `</div>`;
  } else {
    h += `<div class="tarjeta"><div class="vacio">Aún no habéis apuntado nada.<br><span style="font-size:12.5px">Lo que apuntéis aquí lo veréis los dos, y queda en la pestaña 📱 Gastos viaje.</span></div></div>`;
  }

  /* --- Conversor --- */
  if (v.monedas && v.monedas.length) {
    h += seccion("globo", "Conversor", "Funciona sin conexión");
    h += `<div class="tarjeta"><div class="conv">
      <div class="conv-fila">
        <input type="number" inputmode="decimal" id="convEur" placeholder="0" value="${esc(CONV.eur)}">
        <div class="conv-mon">EUR</div>
      </div>`;
    v.monedas.forEach(m => {
      const t = tipoDe(m.codigo);
      h += `<div class="conv-fila">
        <input type="number" inputmode="decimal" data-conv="${esc(m.codigo)}" placeholder="0" value="${esc(CONV.eur === "" ? "" : (Number(CONV.eur) * t).toFixed(2))}">
        <div class="conv-mon">${esc(m.codigo)}</div>
      </div>
      <div class="conv-tipo">1 € = <b class="num">${t}</b> ${esc(m.codigo)} · <button data-tipo="${esc(m.codigo)}" style="color:var(--acento);font-weight:700">cambiar</button></div>`;
    });
    h += `</div></div>`;
  }

  /* --- Presupuesto: lo reservado antes de salir --- */
  const items = v.gastos.filter(g => g.precio !== null && g.precio !== undefined).map(g => Object.assign({}, g));
  v._camas.forEach(a => {
    if (a.precio === null && !a.puntos) return;
    items.push({ categoria: "Alojamiento", fecha: a.entrada, detalle: a.nombre, precio: a.precio || 0,
      pagado: a.pagado !== false && a.pagado !== "parte", nota: [a.pagado === "parte" ? "pagado en parte" : null, a.puntos ? miles(a.puntos) + " puntos" : null].filter(Boolean).join(" · ") || null });
  });
  if (items.length) {
    const totalP = items.reduce((s, g) => s + g.precio, 0);
    const pend = items.filter(g => !g.pagado).reduce((s, g) => s + g.precio, 0);
    const porC = {};
    items.forEach(g => (porC[g.categoria] = porC[g.categoria] || []).push(g));
    const grupos = Object.entries(porC)
      .map(([c, it]) => ({ c, it, suma: it.reduce((s, x) => s + x.precio, 0) }))
      .sort((a, b) => b.suma - a.suma);

    h += seccion("ticket", "Presupuesto", "Lo reservado antes de salir · Precios y 📱 Alojamientos");
    h += `<div class="tarjeta resumen-p">
      <div><div class="et">Reservado</div><div class="vl num">${eur(r2(totalP))}</div></div>
      <div><div class="et">${pend ? "Por pagar" : "Estado"}</div><div class="vl num" style="color:${pend ? "var(--ambar)" : "var(--verde)"}">${pend ? eur(r2(pend)) : "Todo pagado"}</div></div>
      <div><div class="et">Viaje entero</div><div class="vl num">${eur(r2(totalP + total))}</div></div>
    </div>`;
    grupos.forEach(({ c, it, suma }) => {
      const abierto = ABIERTO_CAT === c;
      h += `<div class="tarjeta acor" data-abierto="${abierto ? 1 : 0}">
        <button style="width:100%;text-align:left;padding:13px 14px" data-cat="${esc(c)}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-weight:700;font-size:14.5px">${esc(c)}</span>
            <span style="display:flex;align-items:center;gap:8px">
              ${it.some(x => !x.pagado) ? `<span class="eti ambar">pendiente</span>` : ""}
              <b class="num" style="font-size:14.5px;color:var(--acento)">${eur(r2(suma))}</b>
              <span class="acor-flecha">${ico("abajo", 16)}</span></span>
          </div>
          <div class="barra"><i style="width:${totalP ? (suma / totalP * 100).toFixed(1) : 0}%"></i></div>
        </button>
        <div class="acor-cuerpo"><div>
          ${it.map(g => `<div class="gasto-fila estatica">
            <span class="tx"><span class="n">${esc(g.detalle)}</span>
              <span class="d">${g.fecha ? esc(fechaCorta(g.fecha)) : ""}${g.nota ? " · " + esc(g.nota) : ""}${g.pagado ? "" : " · pendiente"}</span></span>
            <span class="pr num" style="color:${g.pagado ? "var(--tinta)" : "var(--ambar)"}">${eur(g.precio)}</span>
          </div>`).join("")}
        </div></div>
      </div>`;
    });
  }
  return h;
}

/* ============================ 13. VISTA: MÁS ========================== */

function vistaMas() {
  const v = viaje();
  let h = "";

  /* --- Mochila --- */
  if (v.mochila.length) {
    const total = v.mochila.reduce((s, g) => s + g.items.length, 0);
    const hechos = v.mochila.reduce((s, g) => s + g.items.filter(i => estado.check[v.id + "::" + g.categoria + "::" + i]).length, 0);
    h += seccion("rejilla", "Mochila", `${hechos} de ${total} metidos · de tu pestaña Mochila`);
    h += `<div class="barra" style="margin:0 2px 14px"><i style="width:${total ? (hechos / total * 100).toFixed(1) : 0}%;background:var(--verde)"></i></div>`;
    v.mochila.forEach(g => {
      const n = g.items.filter(i => estado.check[v.id + "::" + g.categoria + "::" + i]).length;
      h += `<div class="tarjeta">
        <div class="grupo-cab"><span class="nm">${esc(g.categoria)}</span><span class="ct num">${n}/${g.items.length}</span></div>
        ${g.items.map(i => {
          const k = v.id + "::" + g.categoria + "::" + i, on = !!estado.check[k];
          return `<button class="check-fila" data-check="${esc(k)}" aria-pressed="${on}">
            <span style="color:${on ? "var(--verde)" : "var(--borde)"};display:flex">${ico(on ? "hecho" : "circulo", 22)}</span>
            <span class="tx">${esc(i)}</span></button>`;
        }).join("")}
      </div>`;
    });
  }

  /* --- Documentos generales --- */
  h += seccion("doc", "Documentos del viaje", "Seguro, visados, reservas… guardados en este móvil");
  h += `<div class="tarjeta">${bloqueDocs("general", "Guardados en este móvil", "Subir un documento")}</div>`;

  /* --- Emergencia --- */
  if (v.emergencia && v.emergencia.length) {
    h += seccion("telefono", "Si algo va mal", "Lo que necesitas rápido y sin red");
    h += `<div class="tarjeta">${v.emergencia.map(e => `
      <div class="evento">
        <div class="evento-ico">${ico("telefono", 16)}</div>
        <div class="evento-cuerpo">
          <div class="evento-tit">${esc(e.titulo)}</div>
          <div class="evento-sub">${e.tel ? `<a href="tel:${esc(e.tel)}" class="maps">${esc(e.valor || e.tel)}</a>` : (e.valor ? esc(e.valor) : `<span style="color:var(--ambar)">Sin rellenar en la hoja</span>`)}</div>
        </div>
      </div>`).join("")}</div>`;
  }

  /* --- La hoja y la sincronización --- */
  const avisos = (v.avisos || []).concat(v._avisosApp || []);
  const errores = DATOS.errores || [];
  h += seccion("hoja", "Datos del viaje", "Salen de tu hoja de Drive");
  h += `<div class="tarjeta">
    <a class="check-fila" href="${esc(hojaUrl(v.hoja))}" target="_blank" rel="noopener">
      <span class="ajuste-ico">${ico("hoja", 20)}</span>
      <span class="tx"><b>Abrir la hoja</b><br><span class="sub">${esc(v.hojaNombre || v.nombre)} · edita y la app se actualiza sola</span></span>
      <span style="color:var(--tinta-3);display:flex">${ico("enlace", 16)}</span>
    </a>
    <button class="check-fila" data-sincronizar aria-pressed="false">
      <span class="ajuste-ico">${ico("refrescar", 20, SYNC.estado === "cargando" ? 'class="gira"' : "")}</span>
      <span class="tx"><b>Actualizar ahora</b><br><span class="sub" id="syncAjuste">${esc(textoSync())}</span></span>
    </button>
    ${avisos.length || errores.length ? `<div class="revisar">
      <div class="revisar-tit">${ico("alerta", 15)} Cosas a revisar en la hoja</div>
      <ul>${avisos.map(a => `<li>${esc(a)}</li>`).join("")}${errores.map(e => `<li>Una hoja no se pudo leer: ${esc(e.error)}</li>`).join("")}</ul>
    </div>` : ""}
  </div>`;

  /* --- Ajustes --- */
  const noche = estado.tema === "noche";
  h += seccion("sol", "Ajustes", "");
  h += `<div class="tarjeta">
    <button class="check-fila" data-quien aria-pressed="false">
      <span class="ajuste-ico">${estado.yo ? avatar(estado.yo, 24) : ico("persona", 20)}</span>
      <span class="tx"><b>${estado.yo ? "Este móvil es de " + esc(estado.yo) : "¿De quién es este móvil?"}</b><br><span class="sub">Para saber quién pagó cada gasto</span></span>
    </button>
    <button class="check-fila" data-invitar aria-pressed="false">
      <span class="ajuste-ico">${ico("compartir", 20)}</span>
      <span class="tx"><b>Conectar otro móvil</b><br><span class="sub">Manda un enlace y se configura solo</span></span>
    </button>
    <button class="check-fila" data-anadir-viaje aria-pressed="false">
      <span class="ajuste-ico">${ico("mas", 20)}</span>
      <span class="tx"><b>Añadir un viaje</b><br><span class="sub">Pega el enlace de su hoja de Drive</span></span>
    </button>
    <button class="check-fila" data-cambiar-viaje aria-pressed="false">
      <span class="ajuste-ico">${ico("cambiar", 20)}</span>
      <span class="tx"><b>Cambiar de viaje</b></span>
    </button>
    <button class="check-fila" data-modo-noche aria-pressed="false">
      <span class="ajuste-ico">${ico(noche ? "luna" : "sol", 20)}</span>
      <span class="tx"><b>${noche ? "Modo noche" : "Modo día"}</b><br><span class="sub">${noche ? "Pulsa para volver al modo día" : "Alto contraste para el sol · pulsa para modo noche"}</span></span>
    </button>
    <button class="check-fila" data-conexion aria-pressed="false">
      <span class="ajuste-ico">${ico("llave", 20)}</span>
      <span class="tx"><b>Conexión con el script</b><br><span class="sub">${esc(estado.conexion ? recortarUrl(estado.conexion.url) : "Sin configurar")}</span></span>
    </button>
    <div class="check-fila" style="display:block">
      <div class="nota">Documentos guardados en este móvil: <b class="num">${DOCS.length}</b>.
      Se quedan aquí aunque cierres la app o te quedes sin datos.</div>
    </div>
  </div>`;
  return h;
}

function textoSync() {
  if (SYNC.estado === "cargando") return "Sincronizando…";
  if (SYNC.estado === "error") return "No se pudo: " + (SYNC.error || "error") + " · enseñando la última copia";
  if (SYNC.estado === "offline") return "Sin conexión · enseñando la copia de " + haceCuanto(DATOS.recibido);
  return "Última actualización: " + haceCuanto(DATOS.recibido);
}
const recortarUrl = u => { const m = /\/s\/([^/]+)\//.exec(u || ""); return m ? "Script …" + m[1].slice(-8) : (u || ""); };

/* ============================ 14. PANTALLA DE CONEXIÓN ================ */

function vistaConectar(mensaje) {
  return `<div class="conectar">
    <div class="conectar-logo">🧭</div>
    <h2>Conecta tus hojas de viaje</h2>
    <p>La app lee tus viajes de Drive a través de tu script. Lo más fácil es abrir el <b>enlace de conexión</b>
       desde el otro móvil (Más › Conectar otro móvil). Si no, pega aquí los datos del script.</p>
    ${mensaje ? `<div class="aviso" style="margin:0 0 14px">${ico("alerta", 16)}<div>${esc(mensaje)}</div></div>` : ""}
    <div class="campo"><label>Dirección del script (acaba en /exec)</label>
      <input id="cUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(estado.conexion ? estado.conexion.url : "")}"></div>
    <div class="campo"><label>Clave</label>
      <input id="cClave" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="La CLAVE de Codigo.gs" value="${esc(estado.conexion ? estado.conexion.clave : "")}"></div>
    <button class="btn" data-conectar>${ico("nubeOk", 18)} Conectar</button>
  </div>`;
}

function vistaCargando() {
  return `<div class="conectar"><div class="conectar-logo gira-lento">🧭</div>
    <h2>Trayendo tus viajes…</h2><p>La primera vez tarda unos segundos: el script abre tus hojas de Drive.</p></div>`;
}

async function conectar(url, clave) {
  url = (url || "").trim(); clave = (clave || "").trim();
  if (!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(url)) {
    pintar(false, "La dirección tiene que ser la del script: https://script.google.com/macros/s/…/exec");
    return;
  }
  estado.conexion = { url, clave };
  guardarEstado();
  pintar();
  await sincronizar();
  if (SYNC.estado !== "ok") { pintar(false, SYNC.error || "No se pudo conectar"); return; }
  if (!estado.yo) hojaQuien();
}

/* ============================ 15. VISOR ============================== */

let _urls = [];
let _wakeLock = null;

function liberarUrls() { _urls.forEach(u => URL.revokeObjectURL(u)); _urls = []; }

async function abrirVisor(id) {
  const d = DOCS.find(x => x.id === id);
  if (!d) return;
  const lienzo = $("#visorLienzo");
  liberarUrls();
  lienzo.innerHTML = d.imagenes.map(b => {
    const u = URL.createObjectURL(b); _urls.push(u);
    return `<img src="${u}" alt="">`;
  }).join("");
  $("#visorNombre").textContent = d.nombre;
  $("#visorBorrar").dataset.doc = id;
  $("#visor").dataset.abierto = "1";
  document.body.style.overflow = "hidden";
  try { if ("wakeLock" in navigator) _wakeLock = await navigator.wakeLock.request("screen"); } catch (e) {}
}
function cerrarVisor() {
  $("#visor").dataset.abierto = "0";
  document.body.style.overflow = "";
  liberarUrls();
  $("#visorLienzo").innerHTML = "";
  if (_wakeLock) { try { _wakeLock.release(); } catch (e) {} _wakeLock = null; }
}

/* ============================ 16. HOJAS MODALES ====================== */

function abrirHoja(html) {
  $("#hojaContenido").innerHTML = html;
  $("#hoja").dataset.abierto = "1";
  document.body.style.overflow = "hidden";
}
function cerrarHoja() {
  $("#hoja").dataset.abierto = "0";
  document.body.style.overflow = "";
  $("#hojaContenido").innerHTML = "";
}
const tituloHoja = (t, sub) => `<h3 class="hoja-tit">${esc(t)}</h3>${sub ? `<p class="nota" style="margin:-8px 0 14px">${sub}</p>` : ""}`;

let _toastT = null;
function toast(texto) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = texto;
  t.dataset.visible = "1";
  clearTimeout(_toastT);
  _toastT = setTimeout(() => t.dataset.visible = "0", 3200);
}

function hojaGasto(id) {
  const v = viaje();
  const g = id ? gastosVista(v).find(x => x.id === id) : null;
  const monedas = ["EUR"].concat((v.monedas || []).map(m => m.codigo));
  const loc = ubicacion(v, Date.now());
  const monedaLocal = (v.lugares[loc.ciudad] && v.lugares[loc.ciudad].moneda) || "EUR";
  const hoy = fechaISO(Date.now(), loc.tz);
  const personas = v.viajeros.length ? v.viajeros : [estado.yo || "Yo"];
  const quien = g ? g.quien : (estado.yo || personas[0]);
  const moneda = g ? g.moneda : (monedas.includes(monedaLocal) ? monedaLocal : "EUR");

  abrirHoja(`
    ${tituloHoja(g ? "Editar gasto" : "Apuntar un gasto")}
    <div class="campo"><label>Concepto</label><input id="gConcepto" placeholder="Cena en el mercado" value="${esc(g ? g.concepto : "")}"></div>
    <div class="fila-2">
      <div class="campo"><label>Importe</label><input id="gImporte" type="number" inputmode="decimal" step="any" placeholder="0" value="${g ? esc(g.importe) : ""}"></div>
      <div class="campo"><label>Moneda</label><select id="gMoneda">${monedas.map(m => `<option ${m === moneda ? "selected" : ""}>${m}</option>`).join("")}</select></div>
    </div>
    <div class="campo"><label>Pagó</label>
      <div class="segmentos" id="gQuien">${personas.map(p =>
        `<button type="button" data-persona="${esc(p)}" aria-pressed="${p === quien}">${avatar(p, 22)} ${esc(p)}</button>`).join("")}</div>
    </div>
    <div class="fila-2">
      <div class="campo"><label>Categoría</label><select id="gCat">
        ${CATEGORIAS.concat(g && !CATEGORIAS.includes(g.categoria) ? [g.categoria] : []).map(c => `<option ${g && g.categoria === c ? "selected" : ""}>${esc(c)}</option>`).join("")}
      </select></div>
      <div class="campo"><label>Día</label><input id="gFecha" type="date" value="${esc(g ? g.fecha || hoy : hoy)}"></div>
    </div>
    <div class="nota" id="gEquiv" style="margin:-4px 0 12px;min-height:18px"></div>
    <button class="btn" id="gGuardar">${g ? "Guardar cambios" : "Guardar gasto"}</button>
    ${g ? `<button class="btn peligro" id="gBorrar" style="margin-top:6px">${ico("papelera", 16)} Borrar este gasto</button>` : ""}
    <button class="btn peligro" data-cerrar-hoja style="margin-top:2px;color:var(--tinta-3)">Cancelar</button>`);

  const equiv = () => {
    const imp = parseFloat($("#gImporte").value), mon = $("#gMoneda").value;
    $("#gEquiv").textContent = isFinite(imp) && mon !== "EUR" ? `≈ ${eur(r2(imp / tipoDe(mon)))} con 1 € = ${tipoDe(mon)} ${mon}` : "";
  };
  $("#gImporte").addEventListener("input", equiv);
  $("#gMoneda").addEventListener("change", equiv);
  equiv();
  $("#gQuien").addEventListener("click", e => {
    const b = e.target.closest("[data-persona]"); if (!b) return;
    $$("#gQuien [data-persona]").forEach(x => x.setAttribute("aria-pressed", x === b));
  });
  if (!g) setTimeout(() => { const c = $("#gConcepto"); if (c) c.focus(); }, 250);

  $("#gGuardar").onclick = () => {
    const imp = parseFloat($("#gImporte").value);
    if (!isFinite(imp) || imp <= 0) { $("#gImporte").focus(); return; }
    const mon = $("#gMoneda").value;
    const sel = $("#gQuien [aria-pressed=true]");
    const nuevo = {
      id: g ? g.id : nuevoId("g"),
      concepto: $("#gConcepto").value.trim() || "Gasto",
      importe: imp, moneda: mon, eur: r2(mon === "EUR" ? imp : imp / tipoDe(mon)),
      categoria: $("#gCat").value, fecha: $("#gFecha").value || hoy,
      quien: sel ? sel.dataset.persona : (estado.yo || ""),
      creado: g ? (g.creado || Date.now()) : Date.now()
    };
    estado.cola.push({ opId: nuevoId("o"), tipo: "gasto", hoja: v.hoja, gasto: nuevo });
    guardarEstado(); cerrarHoja(); pintar(true); empujar();
  };
  if (g) $("#gBorrar").onclick = () => {
    // Si nunca llegó a subirse, basta con quitarlo de la cola
    const enCola = estado.cola.filter(o => o.tipo === "gasto" && o.gasto.id === g.id);
    const enHoja = (v.gastosViaje || []).some(x => x.id === g.id);
    estado.cola = estado.cola.filter(o => !(o.tipo === "gasto" && o.gasto.id === g.id));
    if (enHoja || !enCola.length) estado.cola.push({ opId: nuevoId("o"), tipo: "borrar", hoja: v.hoja, id: g.id });
    guardarEstado(); cerrarHoja(); pintar(true); empujar();
  };
}

function hojaTipo(cod) {
  const v = viaje();
  const m = v.monedas.find(x => x.codigo === cod) || { nombre: cod };
  abrirHoja(`
    ${tituloHoja("Tipo de cambio", `¿Cuántos ${esc(m.nombre || cod)} te dan por un euro? Esto cambia solo en este móvil; para los dos, cámbialo en 📱 Lugares.`)}
    <div class="campo"><label>1 EUR = ? ${esc(cod)}</label>
      <input id="tValor" type="number" inputmode="decimal" step="any" value="${tipoDe(cod)}"></div>
    <button class="btn" id="tGuardar">Guardar</button>
    ${estado.tipos[v.id + "::" + cod] !== undefined ? `<button class="btn peligro" id="tQuitar" style="margin-top:4px">Volver al de la hoja (${m.porEuro || "—"})</button>` : ""}
    <button class="btn peligro" data-cerrar-hoja style="margin-top:4px;color:var(--tinta-3)">Cancelar</button>`);
  $("#tGuardar").onclick = () => {
    const n = parseFloat($("#tValor").value);
    if (isFinite(n) && n > 0) { estado.tipos[viaje().id + "::" + cod] = n; guardarEstado(); }
    cerrarHoja(); pintar(true);
  };
  const q = $("#tQuitar");
  if (q) q.onclick = () => { delete estado.tipos[v.id + "::" + cod]; guardarEstado(); cerrarHoja(); pintar(true); };
}

function hojaViajes() {
  const ahora = Date.now();
  abrirHoja(`
    ${tituloHoja("Tus viajes")}
    ${VIAJES.map(v => `
      <button class="check-fila" data-elegir-viaje="${esc(v.id)}" aria-pressed="false">
        <span style="font-size:26px;width:34px;text-align:center">${v.emoji || "🧭"}</span>
        <span class="tx"><b>${esc(v.nombre)}</b><br>
          <span class="sub">${esc(fechaCorta(v.inicio))} – ${esc(fechaCorta(v.fin))} ${v.inicio.slice(0, 4)}${v._finMs < ahora ? " · pasado" : ""}</span></span>
        ${v.id === (viaje() || {}).id ? `<span style="color:var(--verde);display:flex">${ico("hecho", 20)}</span>` : ""}
      </button>`).join("")}
    <button class="btn suave" data-anadir-viaje style="margin-top:12px">${ico("mas", 18)} Añadir un viaje</button>
    <button class="btn peligro" data-cerrar-hoja style="margin-top:4px;color:var(--tinta-3)">Cerrar</button>`);
}

function hojaQuien() {
  const v = viaje();
  const personas = [...new Set(VIAJES.flatMap(x => x.viajeros))];
  if (!personas.length) return;
  abrirHoja(`
    ${tituloHoja("¿De quién es este móvil?", "Así, al apuntar un gasto, sale ya marcado quién pagó. Se puede cambiar en cada gasto.")}
    <div class="quien">${personas.map(p => `
      <button data-soy="${esc(p)}" aria-pressed="${estado.yo === p}">${avatar(p, 44)}<span>${esc(p)}</span></button>`).join("")}</div>
    <button class="btn peligro" data-cerrar-hoja style="margin-top:10px;color:var(--tinta-3)">Ahora no</button>`);
}

function enlaceInvitacion() {
  const c = estado.conexion;
  return location.origin + location.pathname + "#conectar=" + b64(JSON.stringify({ u: c.url, k: c.clave }));
}

async function invitar() {
  if (!estado.conexion) return;
  const url = enlaceInvitacion();
  abrirHoja(`
    ${tituloHoja("Conectar otro móvil", "Manda este enlace (por WhatsApp, por ejemplo) y ábrelo en el otro móvil con Chrome. Queda conectado a las mismas hojas y veréis los mismos gastos.")}
    <div class="enlace-caja num" id="enlaceInv">${esc(url)}</div>
    ${navigator.share ? `<button class="btn" id="invCompartir">${ico("compartir", 18)} Compartir enlace</button>` : ""}
    <button class="btn suave" id="invCopiar" style="margin-top:8px">Copiar enlace</button>
    <p class="nota" style="margin-top:12px">Ojo: quien tenga este enlace puede ver tus viajes y apuntar gastos. Mándalo solo a quien viaje contigo.</p>
    <button class="btn peligro" data-cerrar-hoja style="margin-top:4px;color:var(--tinta-3)">Cerrar</button>`);
  const comp = $("#invCompartir");
  if (comp) comp.onclick = () => navigator.share({ title: "Mis viajes", text: "Nuestros viajes, con los gastos compartidos:", url }).catch(() => {});
  $("#invCopiar").onclick = async () => {
    try { await navigator.clipboard.writeText(url); toast("Enlace copiado"); }
    catch (e) { const r = document.createRange(); r.selectNodeContents($("#enlaceInv")); getSelection().removeAllRanges(); getSelection().addRange(r); toast("Selecciónalo y cópialo"); }
  };
}

function hojaAnadirViaje() {
  abrirHoja(`
    ${tituloHoja("Añadir un viaje", "Haz una copia de la hoja de otro viaje en Drive (Archivo › Hacer una copia), cambia lo de dentro y pega aquí su enlace. Si la hoja no tiene pestañas 📱, el script se las crea vacías.")}
    <div class="campo"><label>Enlace de la hoja</label>
      <input id="aUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://docs.google.com/spreadsheets/d/…"></div>
    <div class="nota" id="aMsg" style="min-height:18px;margin:-4px 0 10px"></div>
    <button class="btn" id="aOk">${ico("mas", 18)} Añadir</button>
    <button class="btn peligro" data-cerrar-hoja style="margin-top:4px;color:var(--tinta-3)">Cancelar</button>`);
  $("#aOk").onclick = async () => {
    const url = $("#aUrl").value.trim();
    if (!/docs\.google\.com\/spreadsheets\/d\//.test(url)) { $("#aMsg").textContent = "Tiene que ser el enlace de una hoja de cálculo de Google."; return; }
    $("#aOk").disabled = true; $("#aMsg").textContent = "Preparando la hoja…";
    try {
      const r = await llamar("POST", { accion: "registrar", url });
      cerrarHoja();
      toast(r.preparada ? `«${r.nombre}» añadida. Rellena sus pestañas 📱` : `«${r.nombre}» añadida`);
      estado.viajeActivo = null;
      await sincronizar();
      const nuevo = VIAJES.find(x => x.hoja === r.id);
      if (nuevo) cambiarViaje(nuevo.id);
    } catch (e) {
      $("#aOk").disabled = false; $("#aMsg").textContent = "No se pudo: " + e.message;
    }
  };
}

function hojaConexion() {
  abrirHoja(`
    ${tituloHoja("Conexión con el script")}
    <div class="campo"><label>Dirección del script</label><input id="xUrl" type="url" value="${esc(estado.conexion ? estado.conexion.url : "")}"></div>
    <div class="campo"><label>Clave</label><input id="xClave" autocapitalize="off" spellcheck="false" value="${esc(estado.conexion ? estado.conexion.clave : "")}"></div>
    <button class="btn" id="xOk">Guardar y actualizar</button>
    <button class="btn peligro" data-cerrar-hoja style="margin-top:4px;color:var(--tinta-3)">Cancelar</button>`);
  $("#xOk").onclick = () => { const u = $("#xUrl").value, k = $("#xClave").value; cerrarHoja(); conectar(u, k); };
}

/* ============================ 17. PINTADO Y EVENTOS ================== */

const TABS = [
  { id: "ahora",       lb: "Ahora",       ico: "rayo",       v: vistaAhora },
  { id: "viaje",       lb: "Viaje",       ico: "calendario", v: vistaViaje },
  { id: "transportes", lb: "Transportes", ico: "ruta",       v: vistaTransportes },
  { id: "camas",       lb: "Hoteles",     ico: "casa",       v: vistaCamas },
  { id: "dinero",      lb: "Dinero",      ico: "cartera",    v: vistaDinero },
  { id: "mas",         lb: "Más",         ico: "rejilla",    v: vistaMas }
];

let FILTRO_CIUDAD = "Todas";
let FILTRO_MODO = "todos";
let ABIERTO_CAT = null;
const CONV = { eur: "" };

function pintarCabecera() {
  const v = viaje(), ahora = Date.now();
  if (!v) {
    $("#cabTitulo").textContent = "Mis viajes";
    $("#cabSub").textContent = "";
    $("#cabEmoji").textContent = "🧭";
    $("#relojes").innerHTML = "";
    return;
  }
  const loc = ubicacion(v, ahora);
  const tzCasa = v.casa.tz;

  $("#cabTitulo").textContent = v.nombre;
  $("#cabSub").textContent = v.subtitulo || "";
  $("#cabEmoji").textContent = v.emoji || "🧭";

  /* Relojes: la ciudad donde estás + España + una zona por cada ciudad en la
     que vas a dormir cuya zona sea distinta a las anteriores. Máximo 4. */
  const usadas = new Set();
  const relojes = [];
  const push = (etiqueta, tz, sub) => {
    if (usadas.has(tz)) return;
    usadas.add(tz);
    relojes.push({ etiqueta, tz, sub });
  };
  push(loc.ciudad, loc.tz, `${diaSem(ahora, loc.tz)} ${diaMes(ahora, loc.tz)}`);
  const difH = (tzOffset(ahora, tzCasa) - tzOffset(ahora, loc.tz)) / 3600e3;
  push("España", tzCasa,
    tzOffset(ahora, tzCasa) === tzOffset(ahora, loc.tz)
      ? `${diaSem(ahora, tzCasa)} ${diaMes(ahora, tzCasa)}`
      : (difH > 0 ? `${diaSem(ahora, tzCasa)} · +${difH}h` : `${diaSem(ahora, tzCasa)} · ${difH}h`));
  (v._camas || []).forEach(a => push(a.ciudad, a.tz, `${diaSem(ahora, a.tz)} ${diaMes(ahora, a.tz)}`));

  $("#relojes").innerHTML = relojes.slice(0, 4).map(r => `
    <div class="reloj">
      <div class="et">${esc(r.etiqueta)}</div>
      <div class="hr num">${hora(ahora, r.tz)}</div>
      <div class="df">${esc(r.sub)}</div>
    </div>`).join("");
}

/** Icono de la nube de la cabecera + textos de estado. */
function pintarSync() {
  const b = $("#cabSync");
  if (b) {
    const pend = estado.cola.length;
    let icono = "nubeOk", clase = "";
    if (!estado.conexion) { icono = "nubeNo"; }
    else if (SYNC.estado === "cargando" || SYNC.enviando) { icono = "refrescar"; clase = "gira"; }
    else if (SYNC.estado === "error" || SYNC.estado === "offline") { icono = "nubeNo"; }
    else if (pend) { icono = "nube"; }
    b.innerHTML = ico(icono, 20, clase ? `class="${clase}"` : "") + (pend ? `<span class="punto num">${pend}</span>` : "");
    b.dataset.estado = SYNC.estado;
    b.setAttribute("aria-label", textoSync());
  }
  const l = $("#syncLinea"); if (l) l.innerHTML = lineaSync();
  const a = $("#syncAjuste"); if (a) a.textContent = textoSync();
}

function pintarNav() {
  const hay = !!viaje();
  $("nav.tabs").style.display = hay ? "" : "none";
  $("#tabs").innerHTML = TABS.map(t => `
    <button data-tab="${t.id}" ${estado.pestana === t.id ? 'aria-current="page"' : ""}>
      ${ico(t.ico, 21)}<span class="lb">${t.lb}</span></button>`).join("");
}

function pintar(mantenerScroll, mensaje) {
  liberarMinis();
  const v = viaje();
  document.documentElement.dataset.paleta = (v && v.paleta) || "atlantico";
  document.documentElement.dataset.tema = estado.tema;
  pintarCabecera();
  pintarNav();
  pintarSync();
  const y = window.scrollY;

  if (!estado.conexion || mensaje) {
    $("#vista").innerHTML = vistaConectar(mensaje);
  } else if (!v) {
    $("#vista").innerHTML = SYNC.estado === "error" || SYNC.estado === "offline"
      ? vistaConectar("No se pudieron traer los viajes: " + (SYNC.error || "sin conexión"))
      : (DATOS.recibido && !VIAJES.length
        ? `<div class="conectar"><div class="conectar-logo">🗺️</div><h2>No hay viajes</h2><p>El script funciona, pero no tiene ninguna hoja registrada o todas están ocultas. Ejecuta <b>instalar()</b> en el script o añade una hoja.</p><button class="btn" data-anadir-viaje>${ico("mas", 18)} Añadir un viaje</button></div>`
        : vistaCargando());
  } else {
    const t = TABS.find(x => x.id === estado.pestana) || TABS[0];
    $("#vista").innerHTML = t.v();
  }
  if (mantenerScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
}

function cambiarViaje(id) {
  const v = VIAJES.find(x => x.id === id) || VIAJES[0];
  VIAJE_ACTIVO = v;
  estado.viajeActivo = v ? v.id : null;
  FILTRO_CIUDAD = "Todas"; FILTRO_MODO = "todos"; ABIERTO_CAT = null;
  guardarEstado();
  recargarDocs().then(() => pintar());
}

/* --- Delegación de eventos --- */
document.addEventListener("click", async ev => {
  const t = ev.target.closest("[data-tab],[data-ver],[data-ciudad],[data-modo],[data-cat],[data-check],[data-modo-noche],[data-cambiar-viaje],[data-elegir-viaje],[data-nuevo-gasto],[data-editar-gasto],[data-tipo],[data-cerrar-hoja],[data-cerrar-visor],[data-borrar-doc],[data-sincronizar],[data-quien],[data-soy],[data-invitar],[data-anadir-viaje],[data-conectar],[data-conexion]");
  if (!t) return;
  const d = t.dataset;

  if (d.tab)     { estado.pestana = d.tab; guardarEstado(); cerrarHoja(); pintar(); }
  else if (d.ver) { abrirVisor(d.ver); }
  else if (d.ciudad) { FILTRO_CIUDAD = d.ciudad; pintar(true); }
  else if (d.modo) { FILTRO_MODO = d.modo; pintar(true); }
  else if (d.cat) {
    ABIERTO_CAT = ABIERTO_CAT === d.cat ? null : d.cat;
    $$(".acor").forEach(a => {
      const b = a.querySelector("[data-cat]");
      a.dataset.abierto = (b && b.dataset.cat === ABIERTO_CAT) ? "1" : "0";
    });
  }
  else if (d.check !== undefined) {
    estado.check[d.check] = !estado.check[d.check];
    if (!estado.check[d.check]) delete estado.check[d.check];
    guardarEstado(); pintar(true);
  }
  else if (d.modoNoche !== undefined) { estado.tema = estado.tema === "noche" ? "dia" : "noche"; guardarEstado(); pintar(true); }
  else if (d.cambiarViaje !== undefined) { if (VIAJES.length) hojaViajes(); }
  else if (d.elegirViaje) { cerrarHoja(); cambiarViaje(d.elegirViaje); }
  else if (d.nuevoGasto !== undefined) { if (!estado.yo && viaje().viajeros.length) { hojaQuien(); PENDIENTE_TRAS_QUIEN = () => hojaGasto(); } else hojaGasto(); }
  else if (d.editarGasto) hojaGasto(d.editarGasto);
  else if (d.tipo) hojaTipo(d.tipo);
  else if (d.cerrarHoja !== undefined) {
    cerrarHoja();
    const f = PENDIENTE_TRAS_QUIEN; PENDIENTE_TRAS_QUIEN = null; if (f) f();
  }
  else if (d.cerrarVisor !== undefined) cerrarVisor();
  else if (d.borrarDoc !== undefined) {
    const id = $("#visorBorrar").dataset.doc;
    if (!confirmarBorrado()) return;
    await DB.borrar(id); await recargarDocs(); cerrarVisor(); pintar(true);
  }
  else if (d.sincronizar !== undefined) { sincronizar().then(() => { if (SYNC.estado === "ok") toast("Actualizado"); }); pintarSync(); }
  else if (d.quien !== undefined) hojaQuien();
  else if (d.soy) {
    estado.yo = d.soy; guardarEstado(); cerrarHoja(); pintar(true);
    const f = PENDIENTE_TRAS_QUIEN; PENDIENTE_TRAS_QUIEN = null; if (f) f();
  }
  else if (d.invitar !== undefined) invitar();
  else if (d.anadirViaje !== undefined) hojaAnadirViaje();
  else if (d.conectar !== undefined) conectar($("#cUrl").value, $("#cClave").value);
  else if (d.conexion !== undefined) hojaConexion();
});
let PENDIENTE_TRAS_QUIEN = null;

/* Botón de borrar del visor: doble pulsación para no borrar sin querer */
let _borrarArmado = 0;
function confirmarBorrado() {
  const b = $("#visorBorrar");
  if (Date.now() - _borrarArmado < 3000) { _borrarArmado = 0; b.classList.remove("armado"); return true; }
  _borrarArmado = Date.now(); b.classList.add("armado"); toast("Pulsa otra vez para borrar");
  setTimeout(() => b.classList.remove("armado"), 3000);
  return false;
}

/* Subida de archivos */
document.addEventListener("change", async ev => {
  const inp = ev.target;
  if (!inp.dataset || inp.dataset.subir === undefined) return;
  const file = inp.files && inp.files[0];
  inp.value = "";
  if (!file) return;
  const etq = inp.closest("label");
  const original = etq ? etq.innerHTML : "";
  if (etq) etq.innerHTML = "Procesando…";
  try {
    await importarArchivo(file, inp.dataset.subir, file.name);
    pintar(true);
  } catch (e) {
    if (etq) etq.innerHTML = original;
    toast("No se pudo guardar: " + e.message);
  }
});

/* Conversor en vivo */
document.addEventListener("input", ev => {
  const el = ev.target;
  if (el.id === "convEur") {
    CONV.eur = el.value;
    const n = parseFloat(el.value);
    $$("[data-conv]").forEach(i => {
      i.value = isFinite(n) ? (n * tipoDe(i.dataset.conv)).toFixed(2) : "";
    });
  } else if (el.dataset && el.dataset.conv) {
    const n = parseFloat(el.value), t = tipoDe(el.dataset.conv);
    const e = isFinite(n) ? n / t : NaN;
    CONV.eur = isFinite(e) ? e.toFixed(2) : "";
    const ce = $("#convEur"); if (ce) ce.value = CONV.eur;
    $$("[data-conv]").forEach(i => {
      if (i !== el) i.value = isFinite(e) ? (e * tipoDe(i.dataset.conv)).toFixed(2) : "";
    });
  }
});

/* Reloj vivo */
setInterval(() => { if ($("#visor").dataset.abierto !== "1") pintarCabecera(); }, 20000);

/* Al volver a la app o recuperar la conexión: actualizar */
let _ultimaVuelta = 0;
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && Date.now() - _ultimaVuelta > 60000) {
    _ultimaVuelta = Date.now(); sincronizar();
  }
});
window.addEventListener("online", () => sincronizar());
window.addEventListener("offline", () => { SYNC.estado = "offline"; pintarSync(); });

/* ============================ 18. ARRANQUE ========================== */

(async function arrancar() {
  cargarEstado();
  cargarDatos();

  /* Enlace de invitación: #conectar=… */
  const m = /#conectar=([A-Za-z0-9_-]+)/.exec(location.hash);
  if (m) {
    try {
      const c = JSON.parse(deb64(m[1]));
      if (c.u && c.k) { estado.conexion = { url: c.u, clave: c.k }; guardarEstado(); }
    } catch (e) { console.warn("Enlace de conexión no válido", e); }
    history.replaceState(null, "", location.pathname + location.search);
  }

  montarViajes();
  await recargarDocs();
  pintar();
  _ultimaVuelta = Date.now();
  if (estado.conexion) {
    sincronizar().then(() => { if (m && SYNC.estado === "ok" && !estado.yo) hojaQuien(); });
  }

  /* Persistencia del almacenamiento y service worker */
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) {}
  if ("serviceWorker" in navigator) {
    // Cuando subes una versión nueva de la app, se recarga sola una vez.
    const habia = !!navigator.serviceWorker.controller;
    let recargando = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (habia && !recargando && $("#hoja").dataset.abierto !== "1") { recargando = true; location.reload(); }
    });
    navigator.serviceWorker.register("sw.js").catch(e => console.warn("SW:", e));
  }
})();
