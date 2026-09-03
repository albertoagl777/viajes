/* ===========================================================================
   Service worker: guarda la app entera en el móvil la primera vez que la abres.
   A partir de ahí arranca sin conexión.

   SI CAMBIAS CUALQUIER ARCHIVO (incluidos los de datos/), sube el número de
   VERSION. Eso es lo que hace que el móvil se descargue la versión nueva.
   =========================================================================== */

const VERSION = "v1";
const CACHE = "misviajes-" + VERSION;

const ARCHIVOS = [
  "./",
  "index.html",
  "app.css",
  "app.js",
  "manifest.json",
  "lib/pdf.min.js",
  "lib/pdf.worker.min.js",
  "iconos/icono-192.png",
  "iconos/icono-512.png",
  "iconos/icono-mascara.png",
  "datos/tenerife-2026.js",
  "datos/tailandia-2027.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ARCHIVOS.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Primero la copia guardada (para que abra al instante y sin red);
   si hay conexión, se refresca por detrás para la próxima vez. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(guardada => {
      const red = fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return resp;
      }).catch(() => guardada);
      return guardada || red;
    })
  );
});
