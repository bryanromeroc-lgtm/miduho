# Juegos de 1.° · «Emociones del recreo» (tarea 3.6 de `juegos-primero`)

- **Fecha:** 2026-11-18
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.6; delta `specs/actividad-quiz-ilustrado/`)
- **Referencia funcional:** `docs/investigacion/referencia-mundoprimaria-emociones-y-sentimientos.md` (Mundo Primaria natu-seh-1-4 → juegos servidos por mundoprimaria.com, `juegos-premium/9033` y `9034`; mecánica estudiada con REA; nada copiado)
- **Captura sonora:** `content/referencias/mundoprimaria-emociones-y-sentimientos/` (`inventario.json`, `LICENCIA.md`, `RESUMEN.md`; audio fuera de git). Los 4 efectos son idénticos por sha256 a los de `mundoprimaria-antes-y-ahora`.
- **Personaje:** Ciro, capibara, guía de Ética y valores

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Captura sonora y comparación sha256 (sin audio nuevo que adaptar), Chrome en el 9333 para REA, preguntas de diseño, redacción de las 6 situaciones, 6 ilustraciones y portada con Gemini, encargos, supervisión de diff y capturas, arreglo menor de estilo, verificación y cierre |
| Codex (CLI) | Estudio con REA e informe; construcción (esquema, reproductor, orden de opciones, JSON, delta OpenSpec); **generación de las voces con Gemini TTS** (primera vez delegada); 3 encargos de construcción (el 2 se cortó y siguió con un 2b) y 1 ronda de correcciones |
| Usuario | Mecánica «escena + 3 emociones», 6 situaciones de recreo nuevas, voces solo para la consigna y los enunciados (2026-11-18); commit `eb37c30` |

Lecciones:

- **Voces delegadas en Codex:** su sandbox filtra las variables con `KEY`, así que `GEMINI_API_KEY_VOZ` no llega por el entorno. Funciona con `bash -ic '…'` (lee `~/.bashrc`) y `--add-dir ~/.cache/miduho-voz` para el estado del cupo. La herramienta está en el repo principal (`tools/voz-gemini/`, sin seguimiento) y se llama por ruta absoluta con el JSON del worktree.
- `voz.mjs actividad` genera también todas las opciones: para reutilizar voces existentes hay que usar `--solo instruccion,<ids>` y escribir `audioOpciones` a mano.
- Si la sesión de Claude se reinicia, se borra el scratchpad (encargos, registros, capturas, `recursos.md`). Lo que deba durar se guarda en el worktree o en este registro.
- Codex corre solo `src/features/actividades`; la prueba de estilo «flat» (`features/materias/vista/vista.estilos.test.ts`) también lee `reproductor.module.css`. Pídele `npm test` completo, sin la parte de integración.

## Qué es

`seleccion-multiple` con campos opcionales nuevos: por pregunta, `imagen` + `alt` (obligatorio si hay imagen) e `imagenesOpciones` (una por opción, decorativas con `alt=""`); en el contenido, `escena` (forma de `juegos/comun/escena.ts`) y `efectos` grabados (`acierto`, `fallo`, `finRonda`, `fin`). Con imagen o escena, el quiz se dispone en dos columnas en escritorio (ilustración + Ciro, pregunta + opciones en filas) y Ciro se oculta en teléfono. Ciro reacciona en 4 tiempos y mantiene `senala`/`duda` mientras la pregunta está respondida. En 1.° con escena se lee la consigna y después el primer enunciado. Sin los campos nuevos el quiz se ve y juega igual; **cambio común:** las opciones de todos los quizzes se barajan con un único `generador(semilla)` (`reproductor/ordenes-preguntas.ts`), de modo que el orden de los quizzes antiguos cambió. `comun/voz.ts` cuenta los usuarios del canal para no cortar la consigna al desmontar «Escuchar» (modo estricto).

## Contenido

6 situaciones de recreo propias, 3 opciones cada una tomadas de las 12 emociones de `como-se-siente` (texto idéntico para reutilizar caras y voces): lonchera → Agradecido/a, cometa → Triste, balón → Enojado/a, perro → Asustado/a, pasamanos → Orgulloso/a, lleva → Feliz. Niños ilustrados genéricos, sin nombres. Validación docente 🔶.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/curriculo/actividades/etica-y-valores/1/emociones-del-recreo.json` | Actividad |
| `apps/web/src/features/actividades/tipos/preguntas.ts` (+ `tipos.test.ts`) | Campos opcionales nuevos |
| `apps/web/src/features/actividades/reproductor/juegos-preguntas.tsx`, `reproductor.module.css`, `ordenes-preguntas.ts` (+ prueba) | Quiz ilustrado y orden de opciones |
| `apps/web/src/features/actividades/juegos/comun/voz.ts` | Canal de voz por usuarios |
| `openspec/changes/juegos-primero/specs/actividad-quiz-ilustrado/spec.md` | Delta |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/emociones-del-recreo/{lonchera,cometa,balon}.webp` (1024×768) | Gemini chat, modo imagen, 2026-11-18, referencia `como-se-siente/portada.webp`; URL de la conversación no registrada 🔶 |
| `…/perro.webp` | https://gemini.google.com/app/081e57017022b8d3 |
| `…/pasamanos.webp` (2.º intento; el 1.º lo rechazó Gemini) | https://gemini.google.com/app/2a80924bc0203fab |
| `…/lleva.webp` | https://gemini.google.com/app/aab1c86970af2bdb |
| `…/portada.webp` (1280×714) | https://gemini.google.com/app/c1bb4bf85ca575ef |
| Caras de opción y poses de Ciro | Reutilizadas de `public/images/juegos/como-se-siente/` |
| `public/audio/actividades/emociones-del-recreo/*.mp3` (7) | Gemini TTS `gemini-3.8-flash-tts`, voz `es-419-tutor-3`, generadas por Codex; `LICENCIAS.md` (términos de uso por confirmar 🔶) |
| Voces de opciones | Reutilizadas de `public/audio/actividades/como-se-siente/` |
| `public/audio/juegos/parejas/{acierto,fallo,fin-ronda,fin}.mp3` | Efectos de la referencia ya adaptados para `antes-y-ahora`; permiso declarado 2026-11-10, soporte escrito por adjuntar 🔶 |

## Verificación (2026-11-18/19)

- `npm test`: 92 archivos; tras corregir el CSS, las 2 pruebas de estilo «flat» que fallaban pasan (213/213 en `actividades` + estilos; las demás ya pasaban, con PostgreSQL en el 5433). `npm run lint`: 0 errores (1 aviso previo). `npm run build`: compila (página temporal borrada antes).
- Partida en navegador (1440×900 y 390×844) con dos fallos a propósito: 4 de 6; poses `senala`/`duda` visibles tras cada respuesta (Ciro oculto en teléfono); sin imágenes rotas, sin errores de consola, sin desborde horizontal; voces por MP3, ninguna por síntesis. Codex: partida solo con teclado, capturas a 1920×1080, 1440×900, 1024×768 y 390×844, captura de control del quiz existente.
- Corregido por Claude: borde de 4 px → 2 px y `drop-shadow` quitado de la escena del quiz (estilo flat).

## Pendiente 🔶

- Escuchar los efectos y las 7 voces generadas.
- Recorrido con la cuenta `demo-primero`.
- Validación docente de las 6 situaciones.
- Las caras de las opciones en escritorio quedaron en ~64 px; valorar agrandarlas.
- Términos de uso del audio de Gemini TTS; soporte escrito del permiso de Mundo Primaria.
