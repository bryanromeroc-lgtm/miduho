# Juegos de 1.° · «Sonidos y letras» (tarea 3.9 de `juegos-primero`)

- **Fecha:** 2026-11-19
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.9; delta `specs/actividad-clasificar-sonido/`)
- **Referencia funcional:** `docs/investigacion/referencia-colombiaaprende-sonidos-y-letras.md` (Colombia Aprende, lección MEN L_G01_U01_L01, estudiada desde su paquete sin conexión con REA y Playwright; nada copiado salvo el audio, con permiso)
- **Captura sonora:** `content/referencias/colombiaaprende-sonidos-y-letras/` (150 pistas distintas de 192 en el .zip; `LICENCIA.md` con las licencias de Freesound comprobadas)
- **Personaje:** Bruno, oso de anteojos, guía de Comprensión lectora (poses de `cuenta-las-silabas`)

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Captura del .zip, licencias (Freesound: 3 CC BY 4.0, 3 CC0), servidor estático y Chrome en 9333 para REA, decisiones con el usuario, adaptación de 12 audios, 6 imágenes con Gemini, encargos, revisión, dos ajustes menores, verificación y cierre |
| Codex (CLI) | Estudio REA (2.° intento) e informe; construcción (esquema, tablero, reglas, JSON, delta) y voz de la consigna (sin cupo) (3 encargos; sin ronda de correcciones) |
| Usuario | Clasificar en dos grupos con tarjetas de solo sonido, los 10 sonidos sin la risa, «Sonidos de letras» / «Otros sonidos», botón «Ver pista» |

Lecciones:

- Dentro del sandbox de Codex, REA no llegó al Chrome que él mismo lanzó (`endpoint_unreachable`, aunque `curl` sí). Funcionó cuando Claude levantó el servidor estático y el Chrome en 9333 fuera del sandbox.
- Con elementos que ya tienen audio original, la voz Gemini va con `--solo instruccion` para no sustituirlos.
- `voz.mjs` falla con `ENOENT` al escribir `LICENCIAS.md` si no generó ningún MP3 (carpeta inexistente) 🔶 (arreglo pendiente en la herramienta).
- Correcciones menores de Claude: respaldo de voz neutro («Sonido N») para que la síntesis no delate la respuesta si el MP3 falla; miniaturas del revelado de 56 a 88 px en la variante de sonido.

## Qué es

`clasificar` + `tablero` (tema girasol) con tres campos opcionales y genéricos: `tarjetas: "sonido"` (la tarjeta es un botón grande «Sonido N» que suena y se selecciona; exige `audio` en cada elemento), `simbolo` (letra grande cuando no hay imagen) y `efectos` (sobrescribe por evento los sonidos del tema). «Ver pista» por tarjeta (`aria-expanded`, sin penalización). Calificación existente (primera ubicación). Sin los campos nuevos, `vivo-o-no-vivo` y `como-se-siente` siguen igual.

## Contenido

Sonidos de letras: A, E, I, O, U (grabaciones de la lección). Otros sonidos: campanas, oveja, silbato, vaca, gato maullando. La risa del original se excluyó (caso límite). Validación docente 🔶.

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/sonidos-y-letras/campanas.webp` | Gemini chat — https://gemini.google.com/app/cbae7d84b10a1f19 |
| `public/images/juegos/sonidos-y-letras/oveja.webp` | Gemini chat — https://gemini.google.com/app/23ce0d353f4334aa |
| `public/images/juegos/sonidos-y-letras/silbato.webp` | Gemini chat — https://gemini.google.com/app/99c6f3fe1772ab39 |
| `public/images/juegos/sonidos-y-letras/vaca.webp` | Gemini chat — https://gemini.google.com/app/bb9bf2a9a617a2b5 |
| `public/images/juegos/sonidos-y-letras/gato.webp` | Gemini chat — https://gemini.google.com/app/9bfc403e357d884d |
| `public/images/juegos/sonidos-y-letras/portada.webp` | Gemini chat — https://gemini.google.com/app/c7b68343e0fa8540 |
| `public/audio/juegos/sonidos-y-letras/*.mp3` (12) | Audio original de la lección con `captura-audio adaptar`; `LICENCIAS.md` (MEN: permiso declarado; Freesound: oveja y vaca CC BY 4.0 con atribución, campanas, silbato y gato CC0) |

## Verificación (2026-11-19)

- `npm test`: 93 archivos, 946 pruebas en verde (con PostgreSQL). `npm run lint`: 0 errores. `npm run build`: compila (página temporal borrada).
- Partida (1440×900): tarjetas sin pista = «Sonido 1…10» (nada delata); un fallo por grupo → «Acertaste 8 de 10»; poses reposo/senala/duda; se pidieron los 10 sonidos originales y `error`/`exito` de la lección; 0 imágenes rotas, 0 errores de consola, 0 respuestas ≥ 400; los tableros de control cargan. Codex: partida con teclado en 3 tamaños; 390 px sin desborde, Bruno oculto en teléfono.

## Pendiente 🔶

- Escuchar los 10 sonidos y los efectos (volumen de las campanas, 8 s).
- Voz Gemini de la consigna: `bash -ic "node tools/voz-gemini/voz.mjs actividad apps/web/curriculo/actividades/comprension-lectora/1/sonidos-y-letras.json --solo instruccion --sin-respaldo"` cuando haya cupo.
- Recorrido con `demo-primero`; validación docente.
- Licencia MEN de «Contenidos para aprender»; origen de `gato2`, `perros`, `pollitos`, `vaca2` (no usados).
