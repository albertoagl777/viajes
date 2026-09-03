# Cómo funciona esto

Tres cosas que conviene tener claras antes de nada:

1. **El código y los datos están separados.** Todo lo que cambia de un viaje a otro vive en `datos/`. La lógica (`app.js`) no se toca nunca.
2. **Funciona sin conexión** porque `sw.js` guarda la app entera en el móvil la primera vez que la abres.
3. **Las tarjetas de embarque las guarda el navegador del móvil**, no un servidor. Están solo en ese teléfono.

---

## 1. Ponerla en el móvil (solo la primera vez)

1. Entra en [github.com/new](https://github.com/new), crea un repositorio llamado `viajes` y márcalo **Public** (GitHub Pages gratis solo sirve páginas públicas; la URL no la sabe nadie salvo tú, pero no metas ahí nada que no quieras que sea público — las tarjetas de embarque **no** se suben ahí, se quedan en tu móvil).
2. Pulsa **uploading an existing file** y arrastra **el contenido** de esta carpeta (no la carpeta: los archivos sueltos, con sus subcarpetas `datos/`, `lib/` e `iconos/`). Commit.
3. Ve a **Settings › Pages**, en *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guarda.
4. Espera un minuto y abre `https://TU-USUARIO.github.io/viajes/` desde el **Chrome del móvil**.
5. Menú ⋮ › **Añadir a la pantalla de inicio**. Ábrela desde ese icono, no desde el navegador.

Ese último paso es el que importa: instalada, Android le da almacenamiento permanente y no borra tus tarjetas de embarque. Abierta como una web normal, sí puede borrarlas si pasan meses sin usarla.

**Compruébalo antes de viajar:** pon el móvil en modo avión y abre la app. Tiene que cargar entera. Si carga, ya está.

---

## 2. Meter un viaje nuevo

### Paso 1 — copia un archivo de datos

Copia `datos/tenerife-2026.js` y renómbralo, por ejemplo `datos/japon-2027.js`. Cambia lo de dentro.

### Paso 2 — añade una línea en `index.html`

Busca el bloque `===== DATOS DE LOS VIAJES =====` y añade tu archivo:

```html
<script src="datos/tenerife-2026.js"></script>
<script src="datos/tailandia-2027.js"></script>
<script src="datos/japon-2027.js"></script>   <!-- ← esta línea -->
```

### Paso 3 — añade la misma línea en `sw.js`

En la lista `ARCHIVOS`, para que se guarde para uso sin conexión:

```js
"datos/japon-2027.js"
```

### Paso 4 — sube el número de versión en `sw.js`

```js
const VERSION = "v2";   // era "v1"
```

**Esto es obligatorio cada vez que cambies cualquier archivo.** Si no lo haces, el móvil seguirá enseñando la versión vieja porque la tiene guardada. Súbelo siempre: v2, v3, v4…

### Paso 5 — sube los archivos a GitHub y abre la app

Se actualiza sola al abrirla con datos. Si ves lo de antes, ciérrala del todo y vuelve a abrirla.

---

## 3. El archivo de datos, campo a campo

```js
VIAJES.push({
  id: "japon-2027",              // único, sin espacios ni acentos
  nombre: "Japón",               // lo que sale arriba
  subtitulo: "Tokyo · Kyoto",
  emoji: "⛩️",
  paleta: "atlantico",           // "atlantico" (azul) o "tropico" (verde)
  inicio: "2027-04-10",          // SIEMPRE año-mes-día
  fin:    "2027-04-25",
  viajeros: ["Alberto", "Valeria"],
  casa: { ciudad: "Galicia", tz: "Europe/Madrid" },
```

### `lugares` — obligatorio

Cada ciudad que aparezca en el viaje tiene que estar aquí con su zona horaria. **De aquí salen los relojes, las duraciones de vuelo y los tiempos de conexión.** Si te falta una ciudad, las horas saldrán mal.

```js
  lugares: {
    "Tokyo": { tz: "Asia/Tokyo", pais: "Japón", moneda: "JPY" },
    "Madrid": { tz: "Europe/Madrid", pais: "España", moneda: "EUR" }
  },
```

Zonas horarias que te van a hacer falta: `Europe/Madrid`, `Atlantic/Canary`, `Asia/Bangkok`, `Asia/Kuala_Lumpur`, `Asia/Tokyo`, `Asia/Qatar`, `Asia/Dubai`, `America/New_York`, `America/Mexico_City`. Si necesitas otra, búscala como *"IANA timezone <país>"*.

### `monedas`

```js
  monedas: [
    { codigo: "JPY", nombre: "Yen japonés", simbolo: "¥", porEuro: 165, actualizado: "2027-03-01" }
  ],
```

`porEuro` es cuántas unidades te dan por **un** euro. Déjalo en `[]` si el destino usa euros: entonces no sale el conversor. Los tipos también se cambian desde la propia app (Dinero › cambiar), y eso manda sobre lo que pongas aquí.

### `transportes` — vuelos, trenes, ferris, buses

```js
  {
    id: "jl6802",                 // único dentro del viaje: es a lo que se
                                  // enganchan las tarjetas de embarque.
                                  // NO lo cambies después de subir una tarjeta.
    modo: "avion",                // avion | tren | ferry | bus | coche
    compania: "Iberia", numero: "IB6802", localizador: "ABC123",
    avion: "Airbus A350",         // opcional
    desde: { ciudad: "Madrid", iata: "MAD", aeropuerto: "Adolfo Suárez Barajas", terminal: "T4S" },
    hasta: { ciudad: "Tokyo",  iata: "HND", aeropuerto: "Haneda", terminal: "T3" },
    salida:  "2027-04-10T12:30",  // hora LOCAL de donde sale
    llegada: "2027-04-11T09:55",  // hora LOCAL de donde llega
    notas: ["Lo que quieras recordar de este vuelo"],
    pendiente: false              // ponlo a true si aún no lo has reservado
  }
```

**No pongas la duración ni el tiempo de escala: los calcula la app** a partir de las horas locales y las zonas horarias. Si dos trayectos seguidos salen y llegan a la misma ciudad, la app muestra la conexión sola, y la marca en ámbar si baja de 2h 30m.

### `alojamientos`

```js
  {
    id: "hotel-tokyo",            // el prefijo "cama-" + este id es donde se
                                  // guardan los documentos de esta reserva
    ciudad: "Tokyo", zona: "Asakusa",
    nombre: "Tavinos Asakusa", plataforma: "Trip.com",
    entrada: "2027-04-11", salida: "2027-04-14",
    horaEntrada: "15:00", horaSalida: "11:00",
    noches: 3,
    habitacion: "Habitación doble",
    servicios: ["Piscina", "Desayuno"],
    precio: 92, precioNoche: 30.6, puntos: null,
    localizador: "XYZ987",
    maps: "Tavinos Asakusa, Tokyo",   // lo que se busca en Google Maps
    notas: ["Avisar si llegamos después de las 22:00"]
  }
```

Si la reserva es solo con puntos, pon `precio: 0` y `puntos: 14500`.

### `dias` — el itinerario

Un objeto por día. **No hace falta que estén todos:** los días que falten salen igual, como "Día libre".

```js
  { fecha: "2027-04-12", ciudad: "Tokyo",
    actividades: [
      { hora: "09:00", texto: "Senso-ji", tipo: "templo", maps: "Senso-ji, Tokyo" },
      { texto: "Akihabara", tipo: "compras", maps: "Akihabara, Tokyo" }
    ],
    comidas: [ { texto: "Sushiro", maps: "Sushiro Asakusa" } ]
  }
```

- `hora` es **opcional**. Lo que lleva hora se ordena en su sitio; lo que no, se va al final del día. Si quieres que algo salga en un momento concreto, ponle hora.
- `tipo` solo elige el icono: `templo`, `compras`, `playa`, `montana`, `comida`, `coche`, `tren`, `actividad`. Si te lo saltas, sale un chincheta.
- `maps` convierte el texto en un enlace a Google Maps. Sin `maps`, sale como texto normal.
- Los check-in y check-out de los hoteles y los vuelos se meten solos en el día que toca. No los escribas aquí.

### `ideas`, `gastos`, `mochila`, `emergencia`

```js
  ideas: [ { texto: "Nara", maps: "Nara, Japón" } ],   // cosas sin día asignado

  gastos: [   // el presupuesto, lo de la pestaña Precios de tu hoja
    { categoria: "Transporte", fecha: "2027-04-10", detalle: "Vuelos", precio: 840, pagado: true, nota: "18.000 avios" }
  ],

  mochila: [
    { categoria: "Documentación", items: ["DNI", "Pasaporte"] }
  ],

  emergencia: [
    { titulo: "Emergencias Japón", valor: "119", tel: "119" }   // tel: null = no es pulsable
  ]
});
```

Los gastos que apuntas dentro de la app durante el viaje **no van aquí**: se guardan solos en el móvil.

---

## 4. Cosas que conviene saber

**Las tarjetas de embarque están solo en ese móvil.** No hay copia en ningún sitio. Si cambias de teléfono o borras los datos de Chrome, se van. Manténlas también en el correo como respaldo.

**Los PDF se convierten en imagen al subirlos.** Chrome en Android no enseña PDF dentro de una web, así que la app lo convierte (hasta 6 páginas) y guarda las dos versiones. Por eso tarda un par de segundos al subir uno.

**Sube la tarjeta en cuanto la tengas**, con wifi, no en el aeropuerto.

**Si cambias el `id` de un vuelo**, la tarjeta que ya habías subido se queda huérfana: la app la sigue guardando pero deja de enseñarla. No cambies los `id` una vez subidas.

**Cada archivo que toques exige subir `VERSION` en `sw.js`.** Es el error número uno: cambias los datos, subes a GitHub, abres la app y ves lo de antes.

**El modo noche** está en Más › Ajustes. Para andar por un aeropuerto con sol, deja el modo día: tiene más contraste.

---

## 5. Los dos viajes que ya están metidos

- `datos/tenerife-2026.js` — 29 sep a 2 oct 2026.
- `datos/tailandia-2027.js` — 11 a 29 enero 2027.

Ambos salieron de tus hojas de Drive. Dos cosas quedaron pendientes de que las rellenes tú:

- El **vuelo Madrid–Vigo de vuelta** de enero está marcado como *sin reservar*, porque la fila está vacía en tu hoja. Cuando lo reserves, rellena `compania`, `numero`, `localizador`, `salida` y `llegada`, y quita `pendiente: true`.
- Los **teléfonos del seguro y del bloqueo de tarjetas** están como texto para que los pongas (bloque `emergencia`). Los de las embajadas y las emergencias locales ya están puestos.
