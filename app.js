/* ===========================================================================
   Mis viajes — lógica de la aplicación
   Todo funciona sin conexión. Nada de lo que se pinta en pantalla depende
   de una llamada de red.
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
const eur = n => (n === null || n === undefined) ? "—" :
  n.toLocaleString("es-ES", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €";

const mapsUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const rutaUrl = q => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);

/* ============================ 2. ICONOS ============================ */

const ICONOS = {
  rayo:       '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  avion:      '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  casa:       '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  cartera:    '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  rejilla:    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  reloj:      '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin:        '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  enlace:     '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
  abajo:      '<path d="m6 9 6 6 6-6"/>',
  alerta:     '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  info:       '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  doc:        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/>',
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
  bombilla:   '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"/>'
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
  avion: "avion", tren: "tren", ferry: "barco", bus: "bus", coche: "coche",
  hotel: "casa", comida: "comida", playa: "playa", montana: "montana",
  compras: "compras", actividad: "ticket", templo: "templo", idea: "bombilla"
};

/* ============================ 3. ESTADO ============================ */

const CLAVE = "misviajes.estado.v1";
let estado = {
  viajeActivo: null, tema: "dia", pestana: "ahora",
  check: {}, tipos: {}, gastos: {}, contactos: {}
};

function cargarEstado() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) estado = Object.assign(estado, JSON.parse(raw));
  } catch (e) { console.warn("No se pudo leer el estado guardado", e); }
}
function guardarEstado() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
  catch (e) { console.warn("No se pudo guardar el estado", e); }
}

/* ============================ 4. ALMACÉN DE DOCUMENTOS (IndexedDB) ======= */

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

/* ============================ 5. MODELO ============================ */

let VIAJE_ACTIVO = null;
const viaje = () => VIAJE_ACTIVO;

const tzDe = (v, ciudad) => (v.lugares[ciudad] && v.lugares[ciudad].tz) || v.casa.tz;
const monedaDe = (v, ciudad) => (v.lugares[ciudad] && v.lugares[ciudad].moneda) || "EUR";

/** Enriquece transportes con instantes UTC y huecos de conexión. */
function prepararViaje(v) {
  v._trans = v.transportes.map(t => {
    const tzO = tzDe(v, t.desde.ciudad), tzD = tzDe(v, t.hasta.ciudad);
    const sal = aUTC(t.salida, tzO), lle = aUTC(t.llegada, tzD);
    return Object.assign({}, t, { tzO, tzD, sal, lle, durMs: lle - sal });
  }).sort((a, b) => a.sal - b.sal);

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

  v._camas = v.alojamientos.map(a => {
    const tz = tzDe(v, a.ciudad);
    return Object.assign({}, a, {
      tz,
      inMs: aUTC(a.entrada + "T" + (a.horaEntrada || "15:00"), tz),
      outMs: aUTC(a.salida + "T" + (a.horaSalida || "12:00"), tz)
    });
  }).sort((a, b) => a.inMs - b.inMs);

  v._inicioMs = aUTC(v.inicio + "T00:00", tzDe(v, v.dias[0] ? v.dias[0].ciudad : v.casa.ciudad));
  v._finMs = aUTC(v.fin + "T23:59", v.casa.tz);
  return v;
}

/** Lista plana de todo lo que ocurre, ordenada en el tiempo. */
function eventos(v) {
  const ev = [];
  v._trans.forEach(t => {
    ev.push({
      ms: t.sal, tipo: t.modo, clase: "transporte", ref: t,
      titulo: `${t.desde.ciudad} → ${t.hasta.ciudad}`,
      sub: [t.compania, t.numero].filter(Boolean).join(" · ") || "Sin reservar",
      tz: t.tzO, fuerte: true
    });
  });
  v._camas.forEach(a => {
    ev.push({ ms: a.inMs, tipo: "hotel", clase: "checkin", ref: a, titulo: "Entrada · " + a.nombre, sub: a.habitacion, tz: a.tz });
    ev.push({ ms: a.outMs, tipo: "hotel", clase: "checkout", ref: a, titulo: "Salida · " + a.nombre, sub: a.zona || a.ciudad, tz: a.tz });
  });
  (v.dias || []).forEach(d => {
    const tz = tzDe(v, d.ciudad);
    (d.actividades || []).forEach((a, i) => {
      ev.push({
        ms: aUTC(d.fecha + "T" + (a.hora || "23:45"), tz), sinHora: !a.hora,
        tipo: a.tipo || "actividad", clase: "actividad", ref: a,
        titulo: a.texto, sub: null, tz, fecha: d.fecha, orden: i
      });
    });
    (d.comidas || []).forEach((c, i) => {
      ev.push({
        ms: aUTC(d.fecha + "T23:50", tz), sinHora: true,
        tipo: "comida", clase: "comida", ref: c,
        titulo: typeof c === "string" ? c : c.texto, tz, fecha: d.fecha, orden: 100 + i
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
  const enVuelo = v._trans.find(t => ahora >= t.sal && ahora <= t.lle);
  if (enVuelo) ciudad = enVuelo.hasta.ciudad;
  if (!ciudad) ciudad = v.casa.ciudad;
  return { ciudad, tz: tzDe(v, ciudad) };
}

/* ============================ 6. FRAGMENTOS REUTILIZABLES ============== */

function elMaps(texto, consulta, clase) {
  if (!consulta) return esc(texto);
  return `<a class="maps ${clase || ""}" href="${esc(mapsUrl(consulta))}" target="_blank" rel="noopener">${esc(texto)}${ico("enlace", 11)}</a>`;
}
function seccion(icono, titulo, sub) {
  return `<div class="seccion"><div class="seccion-ico">${ico(icono, 17)}</div>
    <div><h2>${esc(titulo)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div></div>`;
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

/* ============================ 7. VISTA: AHORA ========================== */

function vistaAhora() {
  const v = viaje(), ahora = Date.now();
  const ev = eventos(v);
  const prox = ev.find(e => e.ms > ahora);
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
      <h3>Bienvenido a casa</h3><div class="sub">${esc(v.nombre)}</div></div>`;
  } else if (actualTrans) {
    h += `<div class="ahora-hero">
      <div class="et">Ahora mismo · en ruta</div>
      <h3>${esc(actualTrans.desde.iata || actualTrans.desde.ciudad)} → ${esc(actualTrans.hasta.iata || actualTrans.hasta.ciudad)}</h3>
      <div class="sub">${esc([actualTrans.compania, actualTrans.numero].filter(Boolean).join(" · "))}</div>
      <div class="cuenta"><div class="big num">${durLarga(actualTrans.lle - ahora)}</div>
        <div class="lb">para aterrizar · llegada ${hora(actualTrans.lle, actualTrans.tzD)} hora local</div></div>
    </div>`;
  } else if (prox) {
    h += `<div class="ahora-hero">
      <div class="et">A continuación</div>
      <h3>${esc(prox.titulo)}</h3>
      <div class="sub">${esc(prox.sub || (prox.sinHora ? "Sin hora fijada" : diaSem(prox.ms, prox.tz) + " " + diaMes(prox.ms, prox.tz)))}</div>
      <div class="cuenta"><div class="big num">${prox.sinHora ? diaMes(prox.ms, prox.tz) : durLarga(prox.ms - ahora)}</div>
        <div class="lb">${prox.sinHora ? "sin hora concreta" : "a las " + hora(prox.ms, prox.tz) + " hora local"}</div></div>
    </div>`;
  }

  /* --- Mini fichas --- */
  h += `<div class="mini-grid">
    <div class="mini"><div class="et">Dónde estás</div><div class="vl">${esc(loc.ciudad)}</div></div>
    <div class="mini"><div class="et">Esta noche</div><div class="vl">${camaHoy ? esc(camaHoy.nombre) : "—"}</div></div>
  </div>`;

  /* --- Próximo vuelo con su tarjeta de embarque --- */
  const proxVuelo = v._trans.find(t => t.lle > ahora && !t.pendiente);
  if (proxVuelo) {
    h += `<div class="tarjeta">${cabeceraVuelo(proxVuelo)}${cuerpoVuelo(proxVuelo)}
      ${bloqueDocs(proxVuelo.id, "Tarjetas de embarque", docsDe(proxVuelo.id).length ? "Añadir otra" : "Subir tarjeta de embarque")}</div>`;
  }

  /* --- Resto de hoy --- */
  const hoyISO = fechaISO(ahora, loc.tz);
  const restoHoy = ev.filter(e => fechaISO(e.ms, e.tz) === hoyISO && e.ms > ahora && e !== prox);
  if (restoHoy.length) {
    h += `<div class="dia-cab hoy"><span class="pt"></span><h3>También hoy</h3></div>
      <div class="tarjeta">${restoHoy.map(filaEvento).join("")}</div>`;
  }

  return h;
}

/* ============================ 8. VISTA: VIAJE ========================= */

function filaEvento(e) {
  const iconoN = ICO_TIPO[e.tipo] || "pin";
  const fuerte = e.clase === "transporte";
  const ref = e.ref || {};
  const maps = ref.maps || (e.clase === "checkin" || e.clase === "checkout" ? (ref.maps || ref.nombre + ", " + ref.ciudad) : null);
  const titulo = maps ? elMaps(e.titulo, maps) : esc(e.titulo);
  let sub = e.sub ? esc(e.sub) : "";
  if (e.clase === "transporte" && e.ref.conexion && e.ref.conexion.ajustada) {
    sub += `${sub ? " · " : ""}<b style="color:var(--ambar)">conexión de ${dur(e.ref.conexion.ms)}</b>`;
  }
  return `<div class="evento">
    <div class="evento-ico${fuerte ? " fuerte" : ""}">${ico(iconoN, 17)}</div>
    <div class="evento-cuerpo">
      <div class="evento-tit">${titulo}</div>
      ${sub ? `<div class="evento-sub">${sub}</div>` : ""}
    </div>
    <div class="evento-hora num">${e.sinHora ? "" : hora(e.ms, e.tz)}</div>
  </div>`;
}

function vistaViaje() {
  const v = viaje(), ahora = Date.now();
  const ev = eventos(v);
  const tzRef = v.casa.tz;
  const hoyISO = fechaISO(ahora, tzRef);

  /* Todos los días del viaje, aunque la hoja no los tuviera */
  const dias = [];
  let cur = aUTC(v.inicio + "T12:00", tzRef);
  const fin = aUTC(v.fin + "T12:00", tzRef);
  while (cur <= fin && dias.length < 120) {
    const f = fechaISO(cur, tzRef);
    const dd = v.dias.find(x => x.fecha === f);
    dias.push({ fecha: f, ciudad: dd ? dd.ciudad : null, ms: cur });
    cur += 86400e3;
  }

  let h = seccion("calendario", "Itinerario",
    `${diaMes(v._inicioMs, tzRef)} — ${diaMes(v._finMs, tzRef)} · ${dias.length} días`);

  /* Chips de ciudad */
  const ciudades = ["Todas"].concat([...new Set(dias.map(d => d.ciudad).filter(Boolean))]);
  h += `<div class="chips">${ciudades.map(c =>
    `<button class="chip" data-ciudad="${esc(c)}" aria-pressed="${FILTRO_CIUDAD === c}">${esc(c)}</button>`).join("")}</div>`;

  const visibles = FILTRO_CIUDAD === "Todas" ? dias : dias.filter(d => d.ciudad === FILTRO_CIUDAD);

  visibles.forEach(d => {
    const evDia = ev.filter(e => fechaISO(e.ms, e.tz) === d.fecha);
    const esHoy = d.fecha === hoyISO;
    h += `<div class="dia-cab${esHoy ? " hoy" : ""}">
      <span class="pt"></span>
      <h3>${esc(diaSem(d.ms, tzRef))} ${esc(diaMes(d.ms, tzRef))}${esHoy ? " · hoy" : ""}</h3>
      <span class="ct">${esc(d.ciudad || "")}</span>
    </div>`;
    h += evDia.length
      ? `<div class="tarjeta">${evDia.map(filaEvento).join("")}</div>`
      : `<div class="tarjeta"><div class="vacio">Día libre</div></div>`;
  });

  if (v.ideas && v.ideas.length) {
    h += `<div class="dia-cab"><span class="pt"></span><h3>Ideas sin fecha</h3></div>
      <div class="tarjeta">${v.ideas.map(i => `
        <div class="evento">
          <div class="evento-ico">${ico("bombilla", 17)}</div>
          <div class="evento-cuerpo"><div class="evento-tit">${elMaps(i.texto, i.maps)}</div></div>
        </div>`).join("")}</div>`;
  }
  return h;
}

/* ============================ 9. VISTA: VUELOS ======================== */

function cabeceraVuelo(t) {
  return `<div class="vuelo-cab">
    ${ico(ICO_TIPO[t.modo] || "avion", 19)}
    <span class="rt">${esc(t.desde.ciudad)} → ${esc(t.hasta.ciudad)}</span>
    ${t.numero ? `<span class="nm">${esc(t.numero)}</span>` : `<span class="nm">Sin reservar</span>`}
  </div>`;
}

function cuerpoVuelo(t) {
  const term = x => x.terminal ? `<br>${esc(x.terminal)}` : "";
  let h = `<div class="tramo">
    <div class="tramo-lado">
      <div class="iata num">${esc(t.desde.iata || t.desde.ciudad.slice(0, 3).toUpperCase())}</div>
      <div class="hora num">${hora(t.sal, t.tzO)}</div>
      <div class="meta">${esc(diaSem(t.sal, t.tzO))} ${esc(diaMes(t.sal, t.tzO))}${term(t.desde)}</div>
    </div>
    <div class="tramo-medio">
      <div class="dur num">${dur(t.durMs)}</div>
      <div class="ln"></div>
      <div class="meta" style="font-size:10.5px;color:var(--tinta-3)">${esc(t.compania || "—")}</div>
    </div>
    <div class="tramo-lado der">
      <div class="iata num">${esc(t.hasta.iata || t.hasta.ciudad.slice(0, 3).toUpperCase())}</div>
      <div class="hora num">${hora(t.lle, t.tzD)}</div>
      <div class="meta">${esc(diaSem(t.lle, t.tzD))} ${esc(diaMes(t.lle, t.tzD))}${term(t.hasta)}</div>
    </div>
  </div>`;

  h += `<div class="datos">
    <div><div class="et">Localizador</div><div class="vl num">${esc(t.localizador || "—")}</div></div>
    <div><div class="et">Vuelo</div><div class="vl num">${esc(t.numero || "—")}</div></div>
    <div><div class="et">Avión</div><div class="vl" style="font-size:12.5px">${esc(t.avion || "—")}</div></div>
  </div>`;

  if (t.pendiente) {
    h += `<div class="aviso" style="margin-top:12px">${ico("alerta", 16)}<div><b>Sin reservar.</b> Las horas que ves son un hueco, no un vuelo real.</div></div>`;
  }
  (t.notas || []).forEach(n => {
    h += `<div class="aviso neutro" style="margin-top:12px">${ico("info", 16)}<div>${esc(n)}</div></div>`;
  });
  if (!t.esEnlace) {
    h += `<div style="padding:0 14px 14px">
      <a class="btn suave" href="${esc(rutaUrl(t.desde.aeropuerto + ", " + t.desde.ciudad))}" target="_blank" rel="noopener">
        ${ico("pin", 17)} Cómo llegar a ${esc(t.desde.iata || t.desde.ciudad)}</a>
    </div>`;
  } else {
    h += `<div style="height:4px"></div>`;
  }
  return h;
}

function vistaVuelos() {
  const v = viaje(), ahora = Date.now();
  let h = seccion("avion", "Vuelos y traslados", `${v._trans.length} trayectos`);

  v._trans.forEach(t => {
    const pasado = t.lle < ahora;
    h += `<div class="tarjeta" style="${pasado ? "opacity:.55" : ""}">
      ${cabeceraVuelo(t)}${cuerpoVuelo(t)}
      ${t.pendiente ? "" : bloqueDocs(t.id, "Tarjetas de embarque", docsDe(t.id).length ? "Añadir otra" : "Subir tarjeta de embarque")}
    </div>`;
    if (t.conexion) {
      const c = t.conexion;
      h += `<div class="conexion${c.ajustada ? " ajustada" : ""}">
        ${ico(c.ajustada ? "alerta" : "reloj", 17)}
        <span>Conexión en ${esc(c.ciudad)}: <b>${dur(c.ms)}</b>${c.cambiaTerminal ? " · cambias de terminal" : ""}${c.ajustada ? " — vas justo" : ""}</span>
      </div>`;
    }
  });
  return h;
}

/* ============================ 10. VISTA: CAMAS ======================== */

function vistaCamas() {
  const v = viaje();
  const noches = v._camas.reduce((s, a) => s + (a.noches || 0), 0);
  let h = seccion("casa", "Hoteles", `${v._camas.length} estancias · ${noches} noches`);

  v._camas.forEach(a => {
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
        <div><div class="et">Total</div><div class="vl num">${a.puntos && !a.precio ? a.puntos.toLocaleString("es-ES") + " pts" : eur(a.precio)}</div></div>
        <div><div class="et">Reserva</div><div class="vl" style="font-size:12.5px">${esc(a.localizador || a.plataforma || "—")}</div></div>
      </div>
      <div style="padding:12px 14px 0;display:flex;flex-wrap:wrap;gap:6px">
        ${(a.servicios || []).map(s => `<span class="eti">${esc(s)}</span>`).join("")}
        ${a.puntos && a.precio ? `<span class="eti verde">+ ${a.puntos.toLocaleString("es-ES")} puntos</span>` : ""}
        ${a.precioNoche ? `<span class="eti borde">${eur(a.precioNoche)} / noche</span>` : ""}
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

/* ============================ 11. VISTA: DINERO ======================= */

function tipoDe(cod) {
  const v = viaje();
  const k = v.id + "::" + cod;
  if (estado.tipos[k] !== undefined) return estado.tipos[k];
  const m = (v.monedas || []).find(x => x.codigo === cod);
  return m ? m.porEuro : 1;
}
function gastosMios() {
  const v = viaje();
  return (estado.gastos[v.id] || []).slice().sort((a, b) => b.creado - a.creado);
}
const aEuros = g => g.moneda === "EUR" ? g.importe : g.importe / (tipoDe(g.moneda) || 1);

function vistaDinero() {
  const v = viaje();
  let h = seccion("cartera", "Dinero", "Presupuesto, conversor y gastos del viaje");

  /* --- Conversor --- */
  if (v.monedas && v.monedas.length) {
    h += `<div class="tarjeta"><div class="conv">
      <div class="docs-tit" style="margin-bottom:12px">Conversor sin conexión</div>
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
    h += `<div class="nota" style="margin-top:12px">Los tipos los pones tú a mano; no se consulta ninguna web, así que funcionan en el avión.</div>
      </div></div>`;
  }

  /* --- Gastos apuntados durante el viaje --- */
  const mios = gastosMios();
  const totalMios = mios.reduce((s, g) => s + aEuros(g), 0);
  h += `<div class="seccion" style="margin-top:22px"><div class="seccion-ico">${ico("mas", 17)}</div>
    <div><h2>Gastos del viaje</h2><p>Lo que vas gastando sobre la marcha</p></div></div>`;
  h += `<div class="tarjeta">
    <div style="padding:14px 14px 4px;display:flex;align-items:baseline;justify-content:space-between">
      <div><div class="et" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--tinta-3)">Total apuntado</div>
        <div class="num" style="font-size:28px;font-weight:800;letter-spacing:-.03em">${eur(Math.round(totalMios * 100) / 100)}</div></div>
      <button class="btn chico" data-nuevo-gasto>${ico("mas", 16)} Apuntar</button>
    </div>
    ${mios.length ? mios.map(g => `
      <div class="gasto-fila">
        <div class="tx"><div class="n">${esc(g.concepto)}</div>
          <div class="d">${esc(g.categoria)} · ${esc(g.fecha)}${g.moneda !== "EUR" ? " · " + g.importe + " " + esc(g.moneda) : ""}</div></div>
        <div class="pr num">${eur(Math.round(aEuros(g) * 100) / 100)}</div>
        <button data-borrar-gasto="${esc(g.id)}" style="color:var(--tinta-3);padding:6px" aria-label="Borrar">${ico("papelera", 16)}</button>
      </div>`).join("") : `<div class="vacio">Aún no has apuntado nada.</div>`}
  </div>`;

  /* --- Presupuesto de la hoja --- */
  const gs = v.gastos.filter(g => g.precio !== null && g.precio !== undefined);
  const total = gs.reduce((s, g) => s + g.precio, 0);
  const pend = gs.filter(g => !g.pagado).reduce((s, g) => s + g.precio, 0);
  const porCat = {};
  gs.forEach(g => (porCat[g.categoria] = porCat[g.categoria] || []).push(g));
  const cats = Object.entries(porCat)
    .map(([c, items]) => ({ c, items, suma: items.reduce((s, x) => s + x.precio, 0) }))
    .sort((a, b) => b.suma - a.suma);

  h += `<div class="seccion" style="margin-top:22px"><div class="seccion-ico">${ico("ticket", 17)}</div>
    <div><h2>Presupuesto</h2><p>Lo reservado y pagado antes de salir</p></div></div>`;
  h += `<div class="total-hero">
    <div class="et">Gasto reservado</div>
    <div class="vl num">${eur(Math.round(total * 100) / 100)}</div>
    <div class="sb">${pend ? `Quedan ${eur(pend)} por pagar` : "Todo pagado"}</div>
  </div>`;
  cats.forEach(({ c, items, suma }) => {
    const abierto = ABIERTO_CAT === c;
    h += `<div class="tarjeta acor" data-abierto="${abierto ? 1 : 0}">
      <button style="width:100%;text-align:left;padding:13px 14px" data-cat="${esc(c)}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-weight:700;font-size:14.5px">${esc(c)}</span>
          <span style="display:flex;align-items:center;gap:8px">
            <b class="num" style="font-size:14.5px;color:var(--acento)">${eur(Math.round(suma * 100) / 100)}</b>
            <span class="acor-flecha">${ico("abajo", 16)}</span></span>
        </div>
        <div class="barra"><i style="width:${(suma / total * 100).toFixed(1)}%"></i></div>
      </button>
      <div class="acor-cuerpo"><div>
        ${items.map(g => `<div class="gasto-fila">
          <div class="tx"><div class="n">${esc(g.detalle)}</div>
            <div class="d">${esc(g.fecha || "")}${g.nota ? " · " + esc(g.nota) : ""}${g.pagado ? "" : " · pendiente"}</div></div>
          <div class="pr num" style="color:${g.pagado ? "var(--tinta)" : "var(--ambar)"}">${eur(g.precio)}</div>
        </div>`).join("")}
      </div></div>
    </div>`;
  });
  return h;
}

/* ============================ 12. VISTA: MÁS ========================== */

function vistaMas() {
  const v = viaje();
  let h = "";

  /* --- Mochila --- */
  const total = v.mochila.reduce((s, g) => s + g.items.length, 0);
  const hechos = v.mochila.reduce((s, g) => s + g.items.filter(i => estado.check[v.id + "::" + g.categoria + "::" + i]).length, 0);
  h += seccion("rejilla", "Mochila", `${hechos} de ${total} metidos`);
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

  /* --- Documentos generales --- */
  h += seccion("doc", "Documentos del viaje", "Seguro, visados, reservas… todo offline");
  h += `<div class="tarjeta">${bloqueDocs("general", "Guardados en este móvil", "Subir un documento")}</div>`;

  /* --- Emergencia --- */
  if (v.emergencia && v.emergencia.length) {
    h += seccion("telefono", "Si algo va mal", "Lo que necesitas rápido y sin red");
    h += `<div class="tarjeta">${v.emergencia.map(e => `
      <div class="evento">
        <div class="evento-ico">${ico("telefono", 16)}</div>
        <div class="evento-cuerpo">
          <div class="evento-tit">${esc(e.titulo)}</div>
          <div class="evento-sub">${e.tel ? `<a href="tel:${esc(e.tel)}" class="maps">${esc(e.valor)}</a>` : esc(e.valor)}</div>
        </div>
      </div>`).join("")}</div>`;
  }

  /* --- Ajustes --- */
  const noche = estado.tema === "noche";
  h += seccion("sol", "Ajustes", "");
  h += `<div class="tarjeta">
    <button class="check-fila" data-modo-noche aria-pressed="false">
      <span style="color:var(--acento);display:flex">${ico(noche ? "luna" : "sol", 22)}</span>
      <span class="tx">${noche ? "Modo noche activado" : "Modo día (alto contraste)"}</span>
    </button>
    <button class="check-fila" data-cambiar-viaje aria-pressed="false">
      <span style="color:var(--acento);display:flex">${ico("cambiar", 22)}</span>
      <span class="tx">Cambiar de viaje</span>
    </button>
    <div class="check-fila" style="display:block">
      <div class="nota">Documentos guardados en este móvil: <b class="num">${DOCS.length}</b>.
      Se quedan aquí aunque cierres la app o te quedes sin datos.</div>
    </div>
  </div>`;
  h += `<div class="nota" style="padding:6px 4px 0">Versión offline · los datos de los viajes están en la carpeta <b>datos/</b>.</div>`;
  return h;
}

/* ============================ 13. VISOR ============================== */

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

/* ============================ 14. HOJA MODAL ========================= */

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

function hojaGasto() {
  const v = viaje();
  const monedas = ["EUR"].concat((v.monedas || []).map(m => m.codigo));
  const hoy = fechaISO(Date.now(), v.casa.tz);
  abrirHoja(`
    <h3 style="margin:0 0 14px;font-size:19px;font-weight:800;letter-spacing:-.02em">Apuntar un gasto</h3>
    <div class="campo"><label>Concepto</label><input id="gConcepto" placeholder="Cena en el mercado"></div>
    <div class="fila-2">
      <div class="campo"><label>Importe</label><input id="gImporte" type="number" inputmode="decimal" placeholder="0"></div>
      <div class="campo"><label>Moneda</label><select id="gMoneda">${monedas.map(m => `<option>${m}</option>`).join("")}</select></div>
    </div>
    <div class="fila-2">
      <div class="campo"><label>Categoría</label><select id="gCat">
        ${["Comida", "Transporte", "Alojamiento", "Actividad", "Compras", "Otros"].map(c => `<option>${c}</option>`).join("")}
      </select></div>
      <div class="campo"><label>Día</label><input id="gFecha" type="date" value="${hoy}"></div>
    </div>
    <button class="btn" id="gGuardar" style="margin-top:6px">Guardar gasto</button>
    <button class="btn peligro" data-cerrar-hoja style="margin-top:4px">Cancelar</button>`);

  $("#gGuardar").onclick = () => {
    const imp = parseFloat($("#gImporte").value);
    if (!isFinite(imp) || imp <= 0) { $("#gImporte").focus(); return; }
    const v2 = viaje();
    (estado.gastos[v2.id] = estado.gastos[v2.id] || []).push({
      id: "g" + Date.now(),
      concepto: $("#gConcepto").value.trim() || "Gasto",
      importe: imp, moneda: $("#gMoneda").value,
      categoria: $("#gCat").value, fecha: $("#gFecha").value,
      creado: Date.now()
    });
    guardarEstado(); cerrarHoja(); pintar();
  };
}

function hojaTipo(cod) {
  const v = viaje();
  const m = v.monedas.find(x => x.codigo === cod) || { nombre: cod };
  abrirHoja(`
    <h3 style="margin:0 0 6px;font-size:19px;font-weight:800;letter-spacing:-.02em">Tipo de cambio</h3>
    <p class="nota" style="margin:0 0 14px">¿Cuántos ${esc(m.nombre || cod)} te dan por un euro? Míralo antes de salir y déjalo puesto.</p>
    <div class="campo"><label>1 EUR = ? ${esc(cod)}</label>
      <input id="tValor" type="number" inputmode="decimal" value="${tipoDe(cod)}"></div>
    <button class="btn" id="tGuardar">Guardar</button>
    <button class="btn peligro" data-cerrar-hoja style="margin-top:4px">Cancelar</button>`);
  $("#tGuardar").onclick = () => {
    const n = parseFloat($("#tValor").value);
    if (isFinite(n) && n > 0) { estado.tipos[viaje().id + "::" + cod] = n; guardarEstado(); }
    cerrarHoja(); pintar();
  };
}

function hojaViajes() {
  abrirHoja(`
    <h3 style="margin:0 0 14px;font-size:19px;font-weight:800;letter-spacing:-.02em">Tus viajes</h3>
    ${VIAJES.map(v => `
      <button class="check-fila" data-elegir-viaje="${esc(v.id)}" aria-pressed="false" style="border-bottom:1px solid var(--borde-2)">
        <span style="font-size:24px">${v.emoji || "🧭"}</span>
        <span class="tx"><b>${esc(v.nombre)}</b><br>
          <span style="font-size:12.5px;color:var(--tinta-3)">${esc(v.subtitulo || "")}</span></span>
        ${v.id === viaje().id ? `<span style="color:var(--verde);display:flex">${ico("hecho", 20)}</span>` : ""}
      </button>`).join("")}
    <button class="btn peligro" data-cerrar-hoja style="margin-top:12px">Cerrar</button>`);
}

/* ============================ 15. PINTADO Y EVENTOS ================== */

const TABS = [
  { id: "ahora",  lb: "Ahora",  ico: "rayo",       v: vistaAhora },
  { id: "viaje",  lb: "Viaje",  ico: "calendario", v: vistaViaje },
  { id: "vuelos", lb: "Vuelos", ico: "avion",      v: vistaVuelos },
  { id: "camas",  lb: "Hoteles",  ico: "casa",       v: vistaCamas },
  { id: "dinero", lb: "Dinero", ico: "cartera",    v: vistaDinero },
  { id: "mas",    lb: "Más",    ico: "rejilla",    v: vistaMas }
];

let FILTRO_CIUDAD = "Todas";
let ABIERTO_CAT = null;
const CONV = { eur: "" };

function pintarCabecera() {
  const v = viaje(), ahora = Date.now();
  const loc = ubicacion(v, ahora);
  const tzCasa = v.casa.tz;
  const mismaZona = tzOffset(ahora, loc.tz) === tzOffset(ahora, tzCasa);
  const difH = (tzOffset(ahora, loc.tz) - tzOffset(ahora, tzCasa)) / 3600e3;

  $("#cabTitulo").textContent = v.nombre;
  $("#cabSub").textContent = v.subtitulo || "";
  $("#cabEmoji").textContent = v.emoji || "🧭";

  $("#relojes").innerHTML = mismaZona
    ? `<div class="reloj"><div class="et">${esc(loc.ciudad)}</div>
         <div class="hr num">${hora(ahora, loc.tz)}</div>
         <div class="df">${esc(diaSem(ahora, loc.tz))} ${esc(diaMes(ahora, loc.tz))} · misma hora que en España</div></div>`
    : `<div class="reloj"><div class="et">${esc(loc.ciudad)}</div>
         <div class="hr num">${hora(ahora, loc.tz)}</div>
         <div class="df">${esc(diaSem(ahora, loc.tz))} ${esc(diaMes(ahora, loc.tz))}</div></div>
       <div class="reloj"><div class="et">España</div>
         <div class="hr num">${hora(ahora, tzCasa)}</div>
         <div class="df">${difH > 0 ? "van " + Math.abs(difH) + "h por detrás" : "van " + Math.abs(difH) + "h por delante"}</div></div>`;
}

function pintarNav() {
  $("#tabs").innerHTML = TABS.map(t => `
    <button data-tab="${t.id}" ${estado.pestana === t.id ? 'aria-current="page"' : ""}>
      ${ico(t.ico, 21)}<span class="lb">${t.lb}</span></button>`).join("");
}

function pintar() {
  const t = TABS.find(x => x.id === estado.pestana) || TABS[0];
  liberarMinis();
  document.documentElement.dataset.paleta = viaje().paleta || "atlantico";
  document.documentElement.dataset.tema = estado.tema;
  pintarCabecera();
  pintarNav();
  $("#vista").innerHTML = t.v();
  window.scrollTo(0, 0);
}

function cambiarViaje(id) {
  const v = VIAJES.find(x => x.id === id) || VIAJES[0];
  VIAJE_ACTIVO = v;
  estado.viajeActivo = v.id;
  FILTRO_CIUDAD = "Todas"; ABIERTO_CAT = null;
  guardarEstado();
  recargarDocs().then(pintar);
}

/* --- Delegación de eventos --- */
document.addEventListener("click", async ev => {
  const t = ev.target.closest("[data-tab],[data-ver],[data-ciudad],[data-cat],[data-check],[data-modo-noche],[data-cambiar-viaje],[data-elegir-viaje],[data-nuevo-gasto],[data-borrar-gasto],[data-tipo],[data-cerrar-hoja],[data-cerrar-visor],[data-borrar-doc]");
  if (!t) return;
  const d = t.dataset;

  if (d.tab)     { estado.pestana = d.tab; guardarEstado(); pintar(); }
  else if (d.ver) { abrirVisor(d.ver); }
  else if (d.ciudad) { FILTRO_CIUDAD = d.ciudad; pintar(); }
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
    guardarEstado(); pintar();
  }
  else if (d.modoNoche !== undefined) { estado.tema = estado.tema === "noche" ? "dia" : "noche"; guardarEstado(); pintar(); }
  else if (d.cambiarViaje !== undefined) hojaViajes();
  else if (d.elegirViaje) { cerrarHoja(); cambiarViaje(d.elegirViaje); }
  else if (d.nuevoGasto !== undefined) hojaGasto();
  else if (d.borrarGasto) {
    const v = viaje();
    estado.gastos[v.id] = (estado.gastos[v.id] || []).filter(g => g.id !== d.borrarGasto);
    guardarEstado(); pintar();
  }
  else if (d.tipo) hojaTipo(d.tipo);
  else if (d.cerrarHoja !== undefined) cerrarHoja();
  else if (d.cerrarVisor !== undefined) cerrarVisor();
  else if (d.borrarDoc !== undefined) {
    const id = $("#visorBorrar").dataset.doc;
    await DB.borrar(id); await recargarDocs(); cerrarVisor(); pintar();
  }
});

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
    pintar();
  } catch (e) {
    if (etq) etq.innerHTML = original;
    alert("No se pudo guardar: " + e.message);
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

/* ============================ 16. ARRANQUE ========================== */

(async function arrancar() {
  cargarEstado();
  if (!window.VIAJES || !VIAJES.length) {
    document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">No hay ningún viaje cargado. Revisa los &lt;script&gt; de datos/ en index.html.</p>';
    return;
  }
  VIAJES.forEach(prepararViaje);
  VIAJE_ACTIVO = VIAJES.find(v => v.id === estado.viajeActivo) || elegirViajePorFecha();
  estado.viajeActivo = VIAJE_ACTIVO.id;
  await recargarDocs();
  pintar();

  /* Persistencia del almacenamiento y service worker */
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) {}
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(e => console.warn("SW:", e));
  }
})();

function elegirViajePorFecha() {
  const n = Date.now();
  return VIAJES.find(v => n <= v._finMs) || VIAJES[VIAJES.length - 1];
}
