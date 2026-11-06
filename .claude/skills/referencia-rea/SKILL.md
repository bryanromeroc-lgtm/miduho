---
name: referencia-rea
description: Estudia a fondo un juego educativo web de referencia con REA (Reverse Engineer Anything) para reproducir en MIDUHO su MECÁNICA exacta con recursos, código y redacción propios. Cubre instalar REA sin tocar la configuración de los agentes, abrir un Chrome aislado por CDP, inspeccionar la página (DOM, scripts, recursos), leer la lógica, medir tiempos jugando, borrar lo capturado y escribir el informe de referencia. Incluye las lecciones de adaptación aprendidas con «Golpea el resultado». Se activa con "usa REA", "ingeniería inversa del juego", "entender cómo funciona este juego", "que quede funcionando igual que la referencia", "analiza este juego de cokitos/digipuzzle/…".
---

# Estudiar un juego de referencia con REA

Objetivo: **entender por completo** cómo funciona un juego de terceros (render, ciclo, generación de preguntas, distractores, tiempos, estados, sonidos) para que la versión de MIDUHO **juegue igual**, sin que falten detalles. Lo que se reproduce es la **mecánica**; nunca la expresión.

## Línea roja (regla dura 2 de AGENTS.md y aviso legal de REA)

- **No se copian** código, imágenes, sonidos, música, fuentes, textos, nombres ni personajes del referente, aunque el usuario lo pida o diga que es el dueño. Si alguien tiene derechos, que entregue los originales con una licencia escrita (`LICENCIA.md`) y se trata como material licenciado, no con REA.
- Leer el código **para entenderlo** está bien; pegarlo o traducirlo línea a línea, no. La implementación se escribe desde cero en la pila de MIDUHO.
- Datos (rangos, tiempos, reglas de distractores, posiciones relativas) son mecánica: se pueden reproducir.
- Todo lo capturado (JSON de REA, scripts, capturas) vive en el scratchpad y **se borra** al terminar el informe.
- Revisa la **autoría real**: los portales suelen incrustar juegos de otros (Cokitos incrusta Digipuzzle). Dilo en el informe.

## 1. Instalar REA sin tocar los agentes

```bash
S=<scratchpad>; mkdir -p $S/rea-run && cd $S/rea-run && npm init -y >/dev/null
npm i rea-agents@latest --no-fund --no-audit     # CLI local; NO correr `rea setup`
./node_modules/.bin/rea --version
```

Requiere Node ≥ 22.23.4 / 24.22.1 / 26.12.1 y `ps` (procps) en Linux.

## 2. Chrome aislado por CDP

El puerto **9222 es el Chrome de Gemini del usuario: no se toca**. Usa otro puerto y un perfil temporal:

```bash
nohup google-chrome --headless=new --remote-debugging-port=9333 --user-data-dir=$S/chrome-rea \
  --window-size=1440,900 --autoplay-policy=no-user-gesture-required --no-first-run "<URL>" > $S/chrome-rea.log 2>&1 &
curl -s localhost:9333/json/list    # mira los iframes: el juego suele estar en otro dominio
```

Si el juego vive en un `iframe`, ábrelo como pestaña propia (`curl -X PUT "localhost:9333/json/new?<url-del-iframe>"`).

## 3. Inspeccionar con REA

```bash
R=./node_modules/.bin/rea
$R list-browser-targets http://127.0.0.1:9333 --format json > $S/targets.json      # target_id de la pestaña
$R inspect-web-page http://127.0.0.1:9333 <targetId> --observation-ms 3000 \
  --include-script-sources --include-accessibility-text --format json > $S/analisis/inspect.json
```

- `--allowed-origins` en la CLI 6.8 rechaza el valor: omítelo y filtra después.
- En el JSON: `normalized_result.dom`, `.resources` (url, tipo, peso), `.scripts.items[].source.artifact.text` (código), `.accessibility`, `.network`.
- Saca los scripts a archivos para leerlos (`analisis/src/`), con Python (`json.load`, nunca ejecutándolos).

Qué responder leyendo:
1. **Render:** canvas o DOM; motor o framework; librería de audio.
2. **Configuración de la página:** variables que eligen tema/modo (suelen estar en scripts en línea).
3. **Ciclo del juego:** fases, temporizadores (`setInterval`/`requestAnimationFrame`), qué pasa al acertar/fallar, cuándo termina.
4. **Generación:** cómo crea preguntas, rangos, restricciones (llevadas, sin repetir), **distractores** (suelen codificar errores típicos: es lo más valioso).
5. **Constantes:** posiciones, velocidades, duraciones, cortes de sonido (sprites con `[inicio, duración]`).
6. **Opciones** que ofrece y sus valores por defecto.
7. **Accesibilidad:** si el texto está en canvas, no hay teclado ni lector: MIDUHO lo mejora.

## 4. Medir jugando (Playwright)

`connectOverCDP` al Chrome de REA se vuelve inestable con anuncios; para medir, lanza un Chrome limpio con `playwright-core` de `apps/web/node_modules`:

```js
import { chromium } from '/…/apps/web/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(URL_DEL_JUEGO, { waitUntil: 'load' });
// Los juegos clásicos exponen su estado en globales (var m_…): léelo con page.evaluate
// para encontrar la respuesta correcta, medir fases (Date.now() al cambiar) y muestrear preguntas.
```

Mide: duración de cada fase (aparecer, mostrar resultado, desaparecer), cuántas opciones salen, 6–10 preguntas de muestra con sus distractores, y captura acierto y error. Las capturas son para **ti**: no van al repo.

## 5. Limpiar y escribir el informe

```bash
pkill -f "chrome-rea"   # ojo: si el patrón aparece en tu propio comando, mata por PID con pgrep
rm -rf $S/analisis $S/chrome-rea $S/targets.json $S/obs/*.png
```

Informe en `docs/investigacion/referencia-<slug>.md`, **con palabras propias**, sin código ni recursos:
- Fecha, herramienta, página observada, **autoría real**.
- Cómo está construido (tabla).
- Mecánica observada y medida (pasos numerados, con tiempos).
- Generación (inferido de la lógica): rangos, restricciones, distractores, memoria de repetidos.
- Qué le falta para evaluar y cómo lo resuelve MIDUHO (tabla Original | MIDUHO 🔶).
- Qué se conserva tal cual (mecánica) y qué se hace propio (todo lo demás).

Modelo: `docs/investigacion/referencia-golpea-el-resultado.md`.

## 6. Lecciones de adaptación (Golpea el resultado, 2026-11-05)

Lo que hizo falta para que la versión de MIDUHO quedara «como me gusta»:

**Evaluación**
- Generación **determinista** desde el contenido (`semilla` + configuración) con `generador()` de `tipos/contrato.ts`: el servidor recalifica lo mismo que vio el estudiante. La docente configura (rango, operaciones, rondas), no escribe ítems.
- Rondas fijas en vez de «hasta N errores»; respuesta = lista de intentos (máx. 2) y calificación 2/1/0; tras el segundo fallo se revela la solución y se avanza.
- Distractores del referente conservados como **error típico** + pista según el error («Revisa las decenas» si difiere en 10/20; «las unidades» si difiere en 1/2).

**Imágenes**
- Personajes que llevan texto (carteles, pizarras): pedir a Gemini el objeto **en blanco, VACÍO**, y poner el número en HTML encima. Medir el rectángulo blanco de cada pose con PIL (región blanca conectada más grande) y mover la etiqueta por pose (`top/left/right/height` en el keyframe del cambio de pose; en la pose de celebración el cartel puede cambiar de sitio).
- Generar primero el personaje base y usarlo como `--ref` de las demás poses; encajarlas con `recortar-pose.py --como <base>`; reducir el base (~640 px de alto) **antes** de encajar las poses.
- Fondo con la mitad inferior «despejada y poco detallada» para colocar encima los elementos del juego; huecos/escotillas en CSS, no en la imagen.

**Sonido**
- Efectos CC0 de Kenney (`kenney.nl/assets/impact-sounds`, `interface-sounds`): `curl` da 403; descargarlos con Playwright (botón «Download» → «Continue without donating…»), confirmar `License.txt` y registrar en `public/audio/juegos/<tipo>/LICENCIAS.md`. Convertir a MP3 mono normalizado (`loudnorm=I=-18:TP=-2`). Claude no los oye: pedir al usuario que los escuche.
- Tocarlos con Web Audio (buffers decodificados en el gesto de «Jugar») para programar el golpe **al ms del impacto**; respetar la preferencia de `useSonido`. Pasar `efectosPropios: true` a `useRondas` para no duplicar sonidos.

**Interfaz**
- Cabecera (marcador, operación, aviso) **fuera** de la cámara; la cámara (`.camara`) con `transform-origin: var(--gx) var(--gy)` en el elemento golpeado.
- Tailwind pone `img { max-width: 100% }`: una imagen dentro de un contenedor de ancho 0 (anclas de efectos) mide 0 → `max-width: none`.
- Elementos interactivos como `<button>` con `aria-label` del valor y `aria-keyshortcuts`; etiquetas de tecla en un sitio que ningún vecino tape (el labio de la escotilla).
- Teléfono: cabecera en `flex-wrap`, aviso en flujo con alto reservado (no superpuesto a la escena).
- Lint de React 19: no leer `ref.current` en el render (usa estado); tras un `return` de guarda TypeScript puede estrechar el estado a `never` (usa un contador en ref).

**Verificación**
- Página temporal `src/app/prueba.<tipo>/page.tsx` con `<Reproductor>` y el JSON (fuera del proxy), en `localhost`; borrarla antes de `npm run build`.
- Video a 1920×1080 → hoja de cuadros **recortada alrededor del elemento golpeado** y en el segundo correcto (busca el cambio de color/estado para ubicar el impacto). Si algo no aparece, inspecciona su `getBoundingClientRect()` y `animationName` en el momento del impacto.
