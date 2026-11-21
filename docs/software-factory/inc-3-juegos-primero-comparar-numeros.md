# Juegos de 1.° · «Comparar números» (tarea 3.12 de `juegos-primero`, `comparar-numeros`)

- **Fecha:** 2026-11-20
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.12; delta `specs/actividad-taller-comparar/`)
- **Referencia funcional:** `docs/investigacion/referencia-comparar-numeros.md`
  - El original es PhET «Comparar números» (University of Colorado Boulder): exploración libre, sin retos ni nota.
  - Tiene dos pantallas, «Compara» y «Laboratorio», con cantidades de 0 a 20, objetos, marco de diez y recta.
  - El signo y la frase cambian al instante.
  - La mecánica se estudió con REA; no se copió nada.
- **Captura sonora:** `content/referencias/phet-comparar-numeros/` (22 pistas `data:audio`, incrustadas en el HTML).
- **Personaje:** Armi, el armadillo, guía de Matemáticas. Sus poses las hizo Claude con Gemini para este juego.
- **Primera actividad de Matemáticas en 1.°:** se añadió a `scripts/demo-primero.ts`, que ahora da 5 asignaturas a `estudiante.primero`.

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Captura sonora y nombres de las pistas desde el código; Chrome 9333 para REA; **licencia resuelta** (ver abajo); decisiones con el usuario y lista de retos; 6 efectos adaptados; 8 imágenes con Gemini (Armi en 3 poses, 4 objetos y portada); encargos; revisión con una ronda de 6 correcciones; verificación; `demo-primero`; cierre |
| Codex (CLI) | Estudio REA con 3 diseños propuestos; construcción del tipo `taller-comparar` (esquema, figura, juego, JSON, delta, pruebas); 5 voces con Gemini TTS; una ronda de correcciones |
| Usuario | Explorar + retos; rango de 0 a 20; palabra y símbolo juntos; objetos colombianos; aprobó la lista de 10 retos |

Lecciones:

- **Las licencias de PhET cambiaron.** Desde el 2026-03-29 las simulaciones nuevas son **CC BY-NC 4.0**, incluida la `latest` (1.0.15, recompilada el 2026-11-18). Las versiones anteriores siguen con CC BY 4.0. Procedimiento:
  1. Probar `…/sims/html/<sim>/<versión>/<sim>_all.html` con versiones anteriores.
  2. Leer la cadena `license:` del HTML.
  3. Comparar los `data:audio` por sha256.

  Aquí la **1.0.10** (2025-09-03) es CC BY 4.0 y trae las 22 pistas idénticas.
- **PhET incrusta los sonidos como `data:audio`, sin nombre.** El nombre sale del `register("…SoundPlayer")` que sigue a cada pista en el código; las que no lo tienen las rastreó Codex. PhET no tiene sonidos de acierto, error ni fin, porque no tiene retos.
- **La página de licencias de PhET se arma con JavaScript.** WebFetch no la lee; hay que leerla por CDP.
- **Encabezado del reproductor:** al desplazar el contenedor `.reproductor`, el encabezado («Salir del juego · título») queda encima del contenido. También pasa en `taller-fracciones`, así que es previo y no de este juego 🔶.

## Qué es

Es el tipo nuevo `taller-comparar` (`juegos/comparar/`), del estilo de los simuladores de `simuladores-miduho`:

- **Laboratorio sin nota:**
  - dos colecciones de 0 a 20, cada una con su contador − / +;
  - dos marcos de diez por lado, uno encima del otro;
  - un selector de objeto por lado;
  - una lectura grande con la frase y el símbolo («3 es menor que 5 · 3 < 5»);
  - los botones «Volver a empezar» y «Empezar los retos».
- **10 retos:**
  - `leer`: elegir la relación entre tres botones, con palabra y símbolo;
  - `construir`: un lado fijo y el otro ajustable, que acepta cualquier cantidad que cumpla la relación.
- **Calificación:**
  - 1 punto por reto, al primer intento (`PRIMERA_RESPUESTA`);
  - si falla, una pista; si vuelve a fallar, la solución.
- **Escena opcional (Armi):** `reposo` mientras se juega, `senala` al acertar y `duda` al fallar.
- **Efectos por evento**, todos opcionales.
- El contenido se valida al cargar: la correcta de `leer` debe coincidir con las cantidades, y cada `construir` debe tener solución en 0–20.

## Contenido

Es la lista aprobada por el usuario el 2026-11-20:

| # | Clase | Izquierda | Derecha | Respuesta |
|---|---|---|---|---|
| 1 | leer | 3 mangos | 5 mangos | es menor que |
| 2 | leer | 8 mariposas | 4 mariposas | es mayor que |
| 3 | leer | 6 ranas | 6 ranas | es igual a |
| 4 | construir | 7 mangos | arepas | 7 |
| 5 | leer | 10 mangos | 9 mangos | es mayor que |
| 6 | leer | 12 ranas | 15 ranas | es menor que |
| 7 | construir | 11 mangos | mariposas | de 12 a 20 |
| 8 | leer | 20 arepas | 14 arepas | es mayor que |
| 9 | leer | 9 mariposas | 19 mariposas | es menor que |
| 10 | construir | 16 arepas | ranas | de 0 a 15 |

🔶 Falta la validación docente: el alcance de MAT-1-03, ya que el DBA no fija el rango, y los umbrales del SIEE.

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/comparar-numeros/armi-reposo.webp` | Gemini — https://gemini.google.com/app/73f23a620a8336cd (ref `images/guias/matematicas.webp`); lienzo de 1440×1623 |
| `…/armi-senala.webp` | Gemini — https://gemini.google.com/app/775a0a7532fcf211 (ref reposo; `recortar-pose --como`) |
| `…/armi-duda.webp` | Gemini — https://gemini.google.com/app/8f1329f718ab9812 (ref reposo; `recortar-pose --como`) |
| `…/mango.webp`, `…/mariposa.webp` | Gemini — https://gemini.google.com/app/b88651925e816ebb (par 2:1; fondo transparente, 320×320) |
| `…/rana.webp`, `…/arepa.webp` | Gemini — https://gemini.google.com/app/3d6be252a14d5839 (ídem) |
| `…/portada.webp` | Gemini — https://gemini.google.com/app/a8a5373fa6951e31 (1280×720) |
| `public/audio/juegos/comparar-numeros/{cambiar,limite,elegir,boton,reiniciar,retos}.mp3` | PhET «Comparar números» versión 1.0.10, CC BY 4.0, con atribución en `LICENCIAS.md` |
| `…/{acierto,error,avanzar,fin}.mp3` | Copias de `cuento-de-la-quebrada` (Mundo Primaria; permiso declarado el 2026-11-10, soporte escrito 🔶) |
| `public/audio/actividades/comparar-numeros/*.mp3` (5) | Gemini TTS `gemini-3.8-flash-lite-tts`, voz `es-419-tutor-3` (las generó Codex) |

## Verificación (2026-11-20)

- `npm test`: 95 archivos y 959 pruebas en verde, con PostgreSQL. `npm run lint`: 0 errores (1 aviso previo). `npm run build`: compila; la página temporal se borró.
- **Partida de Claude a 1440×900:**
  - en el laboratorio, la frase cambia al instante («7 es mayor que 5»);
  - en 0, «−» queda deshabilitado y su etiqueta dice «límite 0»;
  - «Volver a empezar» devuelve a 3 < 5;
  - en los retos, fallo y acierto en el 1 y dos fallos en el 4 (revelado): resultado **«Acertaste 8 de 10»**;
  - las poses `duda` y `senala` cambian bien;
  - se pidieron los 10 efectos y sonaron las 4 voces de enunciado desde su MP3;
  - 0 imágenes rotas, 0 errores de consola y 0 respuestas ≥ 400.
- **Codex:**
  - partida completa con teclado a 1920×1080, 1440×900 y 390×844;
  - tras las correcciones, el aviso y «Seguir» se ven sin desplazarse a 1440×900;
  - las casillas miden 58–60 px en escritorio y 48 px a 390;
  - el control «El taller de las fracciones» no cambia.

## Pendiente 🔶

- **3 voces de relación** («es mayor que», «es menor que», «es igual a»), cuando vuelva el cupo de Gemini TTS. Van en `public/audio/actividades/comparar-numeros/{mayor,menor,igual}.mp3`. Hay que conectarlas en el JSON y anotarlas en su `LICENCIAS.md`. Mientras tanto, esos botones usan la síntesis del navegador.
- **Escuchar** las 5 voces y los 10 efectos.
- **Recorrido** con `demo-primero` y validación docente.
- **Permiso escrito** de Mundo Primaria para acierto, error, avanzar y fin.
- **Encabezado del reproductor** encima del contenido al desplazarse (es previo y afecta a todos los juegos).
