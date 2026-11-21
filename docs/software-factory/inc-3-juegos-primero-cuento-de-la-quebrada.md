# Juegos de 1.° · «La piedra que cantaba» (tarea 3.11 de `juegos-primero`, `cuento-de-la-quebrada`)

- **Fecha:** 2026-11-20
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.11; delta `specs/actividad-aventura-cuento/`)
- **Referencias:** `docs/investigacion/referencia-cuentos-primero.md`
  - **Mundo Primaria `9908`:** el juego pide reconocer el cuento por una imagen.
  - **Colombia Aprende L_G01_U04_L05:** se lee primero, se ordena inicio-nudo-desenlace y se pregunta por acciones y emociones.
  - **Árbol ABC «Zoológico»:** descartado, porque es un juego de sílabas.
  - El relato es propio; de las referencias no se copió nada salvo el audio, con permiso.
- **Captura sonora:** `content/referencias/mundoprimaria-cuentos-tradicionales/` (4 efectos) y `content/referencias/colombiaaprende-lectura-de-cuentos/` (7 pistas del .zip).
- **Personaje:** Bruno, oso de anteojos, guía de Comprensión lectora (poses de `cuenta-las-silabas`).

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Lectura de las 3 referencias; captura de audio y licencias; servidor del paquete en 8765 y Chrome en 9333 para REA; decisiones con el usuario y redacción del cuento; adaptación de 5 efectos; 7 imágenes con Gemini (escenas 1–5 en dos tandas); encargos; revisión; 3 arreglos menores; verificación y cierre |
| Codex (CLI) | Estudio REA de las 3 referencias, con 2 argumentos propuestos; construcción (esquema, `clasica.tsx`/`narrada.tsx`, JSON, delta, capturas y partida con teclado). Se quedó sin cupo de uso antes de las corridas finales: las hizo Claude. Voces no generadas por falta de cupo de Gemini TTS: las generó y conectó Claude el 2026-11-20 |
| Usuario | Aventura + ordenar la trama al final; cuento «La piedra que cantaba» (aprobó el texto); efectos de Mundo Primaria + `success` del MEN |

Lecciones:

- **Imágenes de un cuento:** usar una escena con todos los personajes como referencia hace que Gemini copie su composición en las demás; la Madremonte aparecía desde la escena 1. Funcionó así:
  - escenas sin la Madremonte: referencias de estilo (Bruno y un fondo) y, en el prompt, «NO aparece…»;
  - escenas que siguen a otra: la escena anterior como referencia para mantener la continuidad (el tamaño de la piedra).
- **`voz.mjs actividad` no lee `escenas`** de `aventura`: se usa `voz.mjs frase` por escena, con `--sin-respaldo`.
- **El cupo de Codex también se acaba** (se renueva a las 4:21). El trabajo escrito sobrevive; Claude completó las verificaciones.
- **Correcciones de Claude** (Codex sin cupo):
  1. Revertí su cambio en `juegos/comun/voz.ts`, que es compartido: sin voz en español la síntesis habría usado la voz por defecto del navegador en todos los juegos.
  2. La secuencia ya no puede salir ordenada (`mezclarDesordenado`).
  3. En las fases sin ilustración, Bruno tapaba «Desenlace» y «Comprobar orden» a 1440 px; ahora se le reserva una franja en escritorio.

## Qué es

`aventura` con campos opcionales y genéricos:
- `carga` opcional: sin ella no hay carreta ni textos de reparto;
- `imagen` + `alt` por escena (`lugar` opcional si hay imagen);
- `escena.personaje` (guía con poses);
- `efectos` por evento (acierto, error, avanzar, secuencia, fin);
- `secuencia` final: 3 dibujos en 3 casillas rotuladas, un ítem más calificado en el servidor (1 punto al primer envío; pista, segundo intento y revelado);
- `audioInicio` y `audioFinal`, la lectura grabada del encargo y la del cierre.

`juego.tsx` elige según los datos: `clasica.tsx`, que es el juego de antes y conserva «La entrega de Armi» igual, o `narrada.tsx`.

## Contenido

El texto fue aprobado por el usuario el 2026-11-20 y está en el JSON. Son 6 escenas, cada una con una pregunta de 3 opciones, más la secuencia: escenas 1, 3 y 6 → Inicio, Nudo, Desenlace. Pendientes 🔶: validación docente y revisión cultural de la Madremonte, presentada como figura amable.

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/cuento-de-la-quebrada/escena-1.webp` | Gemini — https://gemini.google.com/app/4da0529da8f67629 |
| `…/escena-2.webp` | Gemini — https://gemini.google.com/app/add6c1cffa321080 |
| `…/escena-3.webp` | Gemini — https://gemini.google.com/app/f01fd20501986ba1 |
| `…/escena-4.webp` | Gemini — https://gemini.google.com/app/ab2f29afe1e912a2 |
| `…/escena-5.webp` | Gemini — https://gemini.google.com/app/04bb19deddf4f0f4 |
| `…/escena-6.webp` | Gemini — https://gemini.google.com/app/5024576af9f4f750 |
| `…/portada.webp` | Gemini — https://gemini.google.com/app/7c675a8f9cd518d3 |
| `public/audio/juegos/cuento-de-la-quebrada/*.mp3` (5) | `acierto`, `error`, `avanzar` y `fin` = Mundo Primaria (`ok`, `error`, `level_end`, `game_end`); `secuencia` = `success` del MEN. Detalle en `LICENCIAS.md` |

## Verificación (2026-11-20)

- `npm test`: 94 archivos y 954 pruebas en verde, con PostgreSQL. `npm run lint`: 0 errores (1 aviso previo). `npm run build`: compila; la página temporal se borró.
- Partida a 1440×900 (fallo y acierto en la escena 1, dos fallos en la escena 4 y secuencia correcta):
  - resultado «Acertaste 5 de 7»;
  - poses duda y senala;
  - se pidieron los 5 efectos;
  - Bruno no se cruza con ningún botón en ninguna fase;
  - 0 imágenes rotas, 0 errores de consola y 0 respuestas ≥ 400;
  - el control «La entrega de Armi» carga.
- Codex jugó una partida completa con teclado en 3 tamaños; a 1440×900 las opciones quedan dentro de la pantalla.

## Pendiente 🔶

- **Escuchar** las 9 voces y los 5 efectos.
- **Recorrido** con `demo-primero`; validación docente y cultural.
- **Licencia MEN** de «Contenidos para aprender» y permiso escrito de Mundo Primaria.

### Voces (generadas el 2026-11-20)

Las generó Claude con `voz.mjs frase --sin-respaldo`, modelo `gemini-3.8-flash-tts` y voz `es-419-tutor-3`. Van conectadas así:
- `instruccion.mp3` → `contenido.audioInicio`, un campo opcional nuevo del esquema que lee `narrada.tsx` en la tarjeta de inicio;
- cada escena → su `audio`;
- `secuencia.mp3` → `secuencia.audio`;
- `final.mp3` → `audioFinal`.

**Verificación:** en una partida a 1440×900, cada fase pidió su MP3 y ninguna usó la síntesis del navegador. Resultado: 7 de 7, 0 errores. `npm test`: 954 pruebas en verde; lint y build bien. Detalle en `public/audio/actividades/cuento-de-la-quebrada/LICENCIAS.md`.

| Archivo | Frase |
|---|---|
| `instruccion.mp3`  |  Escucha el cuento de la quebrada. Después de cada parte, responde la pregunta. |
| `llega-la-mirla.mp3`  |  Al amanecer, una mirla llega a la quebrada. El agua canta entre las piedras: ¡glu, glu, glu! ¿A dónde llega la mirla? |
| `agua-bajito.mp3`  |  Bruno, el oso de anteojos, escucha la quebrada. Hoy el agua suena muy bajito. ¿Cómo suena hoy el agua? |
| `piedra-grande.mp3`  |  Bruno y la mirla miran el agua. ¡Una piedra grande tapa el paso! ¿Qué tapa el paso del agua? |
| `madremonte.mp3`  |  Llega la Madremonte, que cuida el monte. «Antes de mover algo, miremos con cuidado», dice. Junto a la piedra hay una ranita. ¿Por qué hay que mirar con cuidado? |
| `ranita-salta.mp3`  |  La ranita salta a una hoja segura. Después, Bruno empuja la piedra despacio y el agua vuelve a pasar. ¿Qué pasó primero? |
| `canta-otra-vez.mp3`  |  La quebrada canta otra vez: ¡glu, glu, glu! La mirla canta feliz desde una rama. ¿Cómo termina el cuento? |
| `secuencia.mp3`  |  Ordena los tres momentos del cuento: inicio, nudo y desenlace. |
| `final.mp3`  |  La quebrada canta de nuevo y todos la escuchan con alegría. |
