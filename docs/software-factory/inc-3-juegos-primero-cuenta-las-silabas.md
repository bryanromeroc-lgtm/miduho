# Juegos de 1.° · «Cuenta las sílabas» (tarea 3.7 de `juegos-primero`)

- **Fecha:** 2026-11-19
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.7; requisito añadido al delta `specs/actividad-quiz-ilustrado/`)
- **Referencia funcional:** `docs/investigacion/referencia-digipuzzle-cuenta-las-silabas.md` (Digipuzzle.net, variante `syllablescount_names_es`; canvas, 83 palabras; mecánica estudiada con REA; nada copiado)
- **Captura sonora:** `content/referencias/digipuzzle-cuenta-las-silabas/` — **0 pistas**: el motor tiene funciones de audio, pero este juego no las llama (scripts y partida, 2026-11-19)
- **Personaje:** Bruno, oso de anteojos, guía de Lectura

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Captura sonora y diagnóstico del juego mudo (lectura de scripts), preguntas de diseño, lista de palabras, poses de Bruno, 8 ilustraciones y portada con Gemini, encargos, supervisión, verificación y cierre |
| Codex (CLI) | Estudio con REA e informe (lista completa de 83 palabras, revisión silábica con RAE/ASALE); construcción (`barajarOpciones`, disposición de 4 opciones, JSON, delta) y las **9 voces con Gemini TTS**; sin ronda de correcciones |
| Usuario | Quiz existente con separación en la explicación; lista colombiana de 8 palabras; voz de la palabra en vez de audio por opción; efectos del quiz ilustrado (2026-11-19) |

Lecciones:

- Digipuzzle carga sin interfaz; `curl` y `request.get` de Node fallan por certificado en este entorno: leer los scripts con `page.goto` del navegador.
- Un juego de referencia mudo es posible: se registra con `LICENCIA.md` explicativo y 0 pistas, y el sonido se decide con el usuario entre efectos ya existentes.
- Poses con un brazo extendido: si el lienzo de reposo es estrecho, `recortar-pose.py --como` encoge la pose. Ensanchar antes el lienzo de reposo con transparencia (ancho ≈ 0,85 × alto).
- La sesión de Claude se cortó dos veces a media tarea (Gemini en primer plano y Codex en segundo plano). Lanzar las generaciones largas de Gemini en segundo plano; el trabajo escrito en el worktree sobrevive.

## Qué es

`seleccion-multiple` ilustrado (el de la tarea 3.6) con un único campo nuevo, `barajarOpciones` (opcional, por defecto `true`), para mostrar las opciones 1–4 en orden. Con 4 opciones y escena, las opciones se disponen 2 × 2. Sin el campo, todo quiz baraja como antes. Primer intento cuenta; la explicación muestra la palabra separada.

## Contenido

sol, flor (1) · ca-sa, pe-rro (2) · pe-lo-ta, za-pa-to (3) · ma-ri-po-sa, com-pu-ta-dor (4). Enunciado «¿Cuántas sílabas tiene «…»?», que la voz dice con la palabra. Validación docente 🔶.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/curriculo/actividades/comprension-lectora/1/cuenta-las-silabas.json` | Actividad |
| `apps/web/src/features/actividades/tipos/preguntas.ts` (+ `tipos.test.ts`) | `barajarOpciones` |
| `apps/web/src/features/actividades/reproductor/ordenes-preguntas.ts` (+ prueba), `juegos-preguntas.tsx`, `reproductor.module.css` | Orden fijo y disposición de 4 opciones |
| `openspec/changes/juegos-primero/specs/actividad-quiz-ilustrado/spec.md` | Requisito añadido |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/cuenta-las-silabas/bruno-reposo.webp` | Gemini, ref. `images/guias/lectura.webp` — https://gemini.google.com/app/afa12fe3665794f3 |
| `…/bruno-senala.webp` | https://gemini.google.com/app/8cf370dd90ee75a5 |
| `…/bruno-duda.webp` | https://gemini.google.com/app/534233c915264724 |
| `…/sol.webp` · `flor` · `casa` · `perro` | https://gemini.google.com/app/6046f3ef200fea04 · 2b79259d00ae8a5d · c8b8601c64576604 · 84bfb2d91eb4f433 |
| `…/pelota.webp` · `zapato` · `mariposa` · `computador` | https://gemini.google.com/app/664ab7f3a618b519 · 3951b752d02f6c90 · 4112399ba2744536 · 9101908a5cc964da |
| `…/portada.webp` (1280 px) | https://gemini.google.com/app/bdbeac6353fba75c |
| `public/audio/actividades/cuenta-las-silabas/*.mp3` (9) | Gemini TTS, voz `es-419-tutor-3` (7 con `gemini-3.8-flash-tts`, `mariposa` y `computador` con `gemini-3.8-flash-lite-tts`), generadas por Codex; `LICENCIAS.md` (términos de uso por confirmar 🔶) |
| `public/audio/juegos/parejas/*.mp3` | Efectos del quiz ilustrado (de Mundo Primaria; permiso declarado 2026-11-10, soporte por adjuntar 🔶) |

## Verificación (2026-11-19)

- `npm test`: 92 archivos, 937 pruebas en verde (con PostgreSQL). `npm run lint`: 0 errores (1 aviso previo). `npm run build`: compila (página temporal borrada antes).
- Partida en navegador (1440×900 y 390×844) con dos fallos a propósito: 6 de 8; opciones en orden 1–4; poses `senala`/`duda` tras cada respuesta; sin imágenes rotas, errores de consola ni desborde; opciones visibles sin desplazarse a 1440 (borde inferior 651 px); voces por MP3, ninguna por síntesis. Codex: partida solo con teclado (7 de 8) en 1920, 1440 y 390, y control `emociones-del-recreo`.

## Pendiente 🔶

- Escuchar las 9 voces (en particular que «sol» y «flor» se oigan claras) y los efectos.
- Recorrido con la cuenta `demo-primero`.
- Validación docente de las 8 palabras.
- El fondo crema de las ilustraciones difiere un poco del de la escena (se nota un recuadro tenue).
- Términos de uso del audio de Gemini TTS.
