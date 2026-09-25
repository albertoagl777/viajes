# Mis viajes · cómo funciona

```
Tus hojas de Drive  ──►  Apps Script (tu cuenta)  ──►  la app en los dos móviles
   (📱 pestañas)            lee y escribe             guarda copia → va sin red
```

- **Los datos viven en tus hojas.** Editas la hoja, abres la app y ya está. No hace falta tocar GitHub para cambiar un vuelo o un hotel.
- **Sin conexión funciona igual**: la app enseña la última copia que bajó. La red solo hace falta para actualizar.
- **Los gastos del viaje se comparten**: lo que apunta uno lo ve el otro, y queda en la pestaña `📱 Gastos viaje`. Si no hay cobertura, se guarda en el móvil y se sube solo en cuanto vuelve la red (la nube de arriba muestra cuántos quedan).
- **GitHub ya no tiene datos tuyos**: ni localizadores ni nombres. Solo hay que subir archivos cuando cambie el diseño de la app.

---

## 1. Instalación (una vez, unos 10 minutos)

### Paso 1: crea el script

1. Entra en [script.google.com](https://script.google.com) → **Nuevo proyecto**. Llámalo `Mis viajes`.
2. Borra lo que haya en `Código.gs` y pega el contenido de **`apps-script/Codigo.gs`**.
3. Pulsa **＋ › Secuencia de comandos** y llama al nuevo archivo `Semilla`. Pega dentro **`apps-script/Semilla.gs`**.
4. Guarda (icono del disquete).

### Paso 2: crea las pestañas 📱 en tus hojas

1. Arriba, en el desplegable de funciones, elige **`instalar`** y pulsa **Ejecutar**.
2. Google te pedirá permisos: *Revisar permisos › tu cuenta › Configuración avanzada › Ir a Mis viajes (no seguro) › Permitir*. Sale lo de "no seguro" porque el script es tuyo y Google no lo ha revisado; es normal.
3. Cuando el registro diga `Listo`, abre tus hojas **Tenerife**, **Tailandia 2027** y **Japón**: cada una tendrá 7 pestañas nuevas con 📱, ya rellenas con lo que tenía la app.

Tus pestañas de siempre no se tocan. **Precios** y **Mochila** la app las lee tal cual.

### Paso 3: publica el script

1. **Implementar › Nueva implementación**. En el engranaje, elige **Aplicación web**.
2. *Ejecutar como*: **Yo**. *Quién tiene acceso*: **Cualquier usuario**.
3. **Implementar** y copia la **URL de la aplicación web** (acaba en `/exec`).

> "Cualquier usuario" significa que cualquiera con esa URL **y** la clave podría leer tus viajes. La URL es larga y aleatoria y la clave también. No las publiques en ningún sitio.

### Paso 4: sube la app nueva a GitHub

En tu repositorio `viajes`:

1. **Borra la carpeta `datos/`** (abre cada archivo › ⋯ › *Delete file*) y también `COMO-METER-UN-VIAJE.md`.
2. **Add file › Upload files** y arrastra: `index.html`, `app.js`, `app.css`, `sw.js`, `manifest.json` y `COMO-FUNCIONA.md`. Commit.

> Los localizadores siguen en el **historial** de GitHub. Si quieres borrarlos del todo, lo más fácil es borrar el repositorio (*Settings › Delete this repository*) y crearlo de nuevo con los archivos nuevos. Tendrás que volver a activar Pages.

### Paso 5: conecta los móviles

1. En tu móvil, abre la app. La primera vez puede que salga todavía la versión vieja: ciérrala del todo y vuelve a abrirla.
2. Aparece **Conecta tus hojas de viaje**: pega la URL del paso 3 y la clave (está al principio de `Codigo.gs`, en `const CLAVE = "…"`).
3. Elige quién eres. Listo.
4. Para el otro móvil: **Más › Conectar otro móvil** y mándale el enlace por WhatsApp. Al abrirlo en Chrome se configura solo.

**Compruébalo antes de salir:** con los dos móviles conectados, apunta un gasto de prueba en uno. Tiene que salir en el otro y en la pestaña `📱 Gastos viaje`. Luego bórralo (tócalo › *Borrar este gasto*).

---

## 2. El día a día

| Quiero… | Dónde |
|---|---|
| Cambiar un vuelo, tren, bus… | `📱 Transportes` |
| Cambiar un hotel o marcarlo como pagado | `📱 Alojamientos` (columna *Pagado*: SI / NO / PARTE) |
| Añadir planes, restaurantes, ideas | `📱 Itinerario` |
| Cambiar el presupuesto | **Precios** (tu pestaña de siempre) |
| Cambiar la lista de la mochila | **Mochila** (tu pestaña de siempre) |
| Poner el teléfono del seguro | `📱 Emergencia` |
| Actualizar el tipo de cambio | `📱 Lugares`, columna *1 € =* |

La app se actualiza al abrirla, al volver a ella tras un rato y al pulsar la nube de arriba.

### `📱 Itinerario`, que es la que más vas a usar

Una fila por cosa. Las columnas que importan:

- **Momento**: *mañana*, *tarde* o *noche*, para cuando no tienes hora exacta. Si pones **Hora**, manda la hora.
- **Sin hora ni momento**: la fila se queda donde está, en el orden de la hoja. Si el día empieza con un vuelo de mañana, lo que no tiene hora va después de aterrizar. Si el vuelo es por la tarde, va antes.
- **Tipo**: *desayuno*, *comida*, *cena* o *para comer* hace que salga en el bloque de comidas del día y no en la lista de planes. Varias filas de *comida* el mismo día son opciones entre las que elegir. El resto de tipos solo cambian el icono.
- **Fecha vacía**: sale en *Ideas sin fecha*.
- **Ciudad**: opcional. Si no la pones, la app la deduce del hotel donde dormís.

### "Antes de salir"

En la pestaña *Ahora* sale una lista con lo que falta. La app la saca sola de la hoja:

- trayectos con *Reservado = NO*
- noches sin alojamiento (las que pasáis volando no cuentan)
- hoteles con *Pagado = NO* o *PARTE*
- filas de **Precios** con *Pagado = NO*
- datos de emergencia vacíos y monedas sin tipo de cambio

Cuando lo arreglas en la hoja, desaparece de la lista.

---

## 3. Meter un viaje nuevo

1. En Drive, abre la hoja de un viaje anterior › **Archivo › Hacer una copia**.
2. Cambia lo de dentro, empezando por `📱 Viaje` (nombre, fechas, color…) y `📱 Lugares` (cada ciudad con su zona horaria). **Deja vacío el campo ID**: se rellena solo.
3. En la app: **Más › Añadir un viaje** y pega el enlace de la hoja.

Si la hoja no tiene pestañas 📱 (una de las antiguas), el script se las crea vacías.

Para que un viaje viejo deje de salir en la app: `📱 Viaje › Visible en la app = NO`.

---

## 4. Cosas que conviene saber

- **Las zonas horarias son lo importante.** Cada ciudad de Transportes, Alojamientos e Itinerario tiene que estar en `📱 Lugares` escrita **igual**. Si no, la app usa la hora de España y te avisa en *Más › Cosas a revisar en la hoja*.
- **Las horas de los vuelos van en hora local** de cada aeropuerto, como vienen en la reserva. La duración y las escalas las calcula la app.
- **No cambies los ID** de `📱 Transportes` después de subir una tarjeta de embarque: la tarjeta va enganchada a ese ID.
- **Las tarjetas de embarque y los documentos siguen guardados solo en cada móvil**, no en la hoja. Súbelos con wifi y guárdalos también en el correo.
- **Las marcas de la mochila** son de cada móvil (cada uno hace su maleta).
- **Si cambias el código del script** (no las hojas), ve a *Implementar › Gestionar implementaciones › ✏️ › Versión: Nueva versión*. La URL no cambia.
- **Si cambias archivos de la app en GitHub**, sube el número `VERSION` de `sw.js`. Los móviles se recargan solos con la versión nueva.
- **Si algo no cuadra**, en el script ejecuta `probar`: el registro dice qué lee de cada hoja y qué avisos hay.
