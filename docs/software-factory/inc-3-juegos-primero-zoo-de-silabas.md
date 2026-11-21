# Juegos de 1.° · «Zoo de sílabas» (tarea 3.10 de `juegos-primero`)

- **Fecha:** 2026-11-19/20
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.10; delta `specs/actividad-formar/`)
- **Referencia funcional:** `docs/investigacion/referencia-arbolabc-zoo-silabas.md` (Cristic solo enlaza; el juego real es de Árbol ABC, `arbolabcgames.top/F37A/`, Phaser 2; estudiado con REA y Playwright por CDP; nada copiado salvo el audio, con permiso)
- **Captura sonora:** `content/referencias/arbolabc-zoo-silabas/` (2 sprites → 22 cortes; las marcas de Phaser de `AudioManager.js` se copiaron a mano a `audio/captura.json`)
- **Personaje:** Bruno, oso de anteojos, guía de Comprensión lectora (poses de `cuenta-las-silabas`)

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Lectura del portal y del juego real, captura y corte de sprites, licencia, Chrome en 9333 para REA, decisiones con el usuario, adaptación de 8 audios, 7 imágenes con Gemini (+5 reutilizadas), encargos, revisión, verificación y cierre |
| Codex (CLI) | Estudio REA e informe; construcción del tipo `formar` (esquema, juego, reglas, JSON, delta) y voces Gemini; una ronda de correcciones |
| Usuario | Formar palabras por ronda, 10 animales (5 de 2 sílabas + 5 de 3), reintento con punto al primer intento, Bruno recorre el zoo |

Lecciones:

- El tablero preveía `emparejar`, pero el original ordena sílabas en huecos: leer el juego real antes de fijar el tipo.
- `captura-audio` solo reconoce sprites al estilo Howler; con Phaser (`{name, start, duration}`) basta añadir las marcas a `captura.json` → `sprites` y reinventariar.
- Sin `--sin-respaldo`, `voz.mjs` cae en otro modelo con otra voz (`Sulafat`) cuando se acaba el cupo. La plantilla del encargo de construcción ya lo exige.
- Una imagen reutilizada de otro juego puede tener otro estilo (la tortuga de `vivo-o-no-vivo`): revisar la hoja de contacto con todas juntas.
- Ronda de correcciones: los huecos vacíos mostraban números, las fichas quedaban fuera de la pantalla a 1440×900, las fichas eran pequeñas y el CSS estaba minificado.

## Qué es

Tipo nuevo `formar`: una ronda por elemento (`texto`, `silabas`, `imagen`, `alt`, `audio?`). Las fichas salen barajadas con un solo `generador(semilla)` y nunca en orden correcto. Se colocan en huecos ordenados tocando, arrastrando o con teclado. Al llenarlos todos se comprueba la palabra: si falla, las fichas vuelven y se puede reintentar sin límite. Se registra el primer intento, que `calificar` recalcula (1 punto si es correcto). Tiene `escena` opcional con recorrido (`escena.fondo`, una parada por elemento, poses de Bruno) y `efectos` opcionales por evento, más un botón «Música», apagado al inicio.

## Contenido

ga·to, va·ca, pa·to, pe·rro, o·so · co·ne·jo, ji·ra·fa, tor·tu·ga, ca·ba·llo, o·ve·ja. Validación docente 🔶.

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/zoo-de-silabas/pato.webp` | Gemini — https://gemini.google.com/app/2a5dac628ce0c23c |
| `public/images/juegos/zoo-de-silabas/oso.webp` | Gemini — https://gemini.google.com/app/f1673daeee32197f |
| `public/images/juegos/zoo-de-silabas/conejo.webp` | Gemini — https://gemini.google.com/app/9fa140b0def8e74c |
| `public/images/juegos/zoo-de-silabas/caballo.webp` | Gemini — https://gemini.google.com/app/25a47244db00b39b |
| `public/images/juegos/zoo-de-silabas/tortuga.webp` | Gemini — https://gemini.google.com/app/df8007ae5e95ffec |
| `public/images/juegos/zoo-de-silabas/portada.webp` | Gemini — https://gemini.google.com/app/cd62a789fcdfb21d |
| `public/images/juegos/zoo-de-silabas/fondo.webp` | Gemini — https://gemini.google.com/app/62d5200aaa715d00 |
| `gato`, `vaca`, `oveja` / `jirafa` / `perro` `.webp` | Copias de `sonidos-y-letras` / `separa-las-silabas` / `cuenta-las-silabas` |
| `public/audio/juegos/zoo-de-silabas/*.mp3` (8) | Audio original con `captura-audio adaptar`: inicio=btnNavigation, soltar=btnSelection, error=effectError, acierto=ovation, avanzar=turronRunning, fin=stickers, felicitacion=congratulate1 (voz), musica=backgroundMusic; `LICENCIAS.md` (permiso declarado) |
| `public/audio/actividades/zoo-de-silabas/*.mp3` (8) | Gemini TTS `gemini-3.8-flash-lite-tts`, voz `es-419-tutor-3` (regeneradas el 2026-11-20 por Claude; las primeras salieron con el respaldo `Sulafat`); gato, vaca y jirafa reutilizan `separa-las-silabas` (`es-419-tutor-3`) |

## Verificación (2026-11-20)

- `npm test`: 94 archivos y 950 pruebas en verde, con PostgreSQL.
- `npm run lint`: 0 errores (1 aviso previo).
- `npm run build`: compila; la página temporal se borró.
- Partida a 1440×900, con un fallo a propósito en el animal 1 y en el 6:
  - resultado «Acertaste 8 de 10»;
  - las sílabas nunca salieron en el orden correcto;
  - poses reposo, senala y duda;
  - se pidieron los 8 efectos y la consigna;
  - 0 imágenes rotas, 0 errores de consola y 0 respuestas ≥ 400;
  - el control `separa-las-silabas` carga.
- Codex jugó una partida completa con teclado en 3 tamaños: no hay desborde a 390 px y las fichas quedan dentro de la pantalla a 1440×900 (bottom 789 ≤ 900).

## Pendiente 🔶

- **Escuchar** los efectos, la música y `felicitacion.mp3`, que no está transcrita y cuyo acento no se conoce.
- **Escuchar las 8 voces** con `es-419-tutor-3`. Se regeneraron el 2026-11-20 con `--rehacer-respaldo --sin-respaldo`. En el navegador, la consigna y «Escuchar» suenan desde sus MP3, sin síntesis, y las 19 rutas de audio del JSON existen.
- **Recorrido** con `demo-primero`; validación docente.
- **Permiso escrito** de Árbol ABC (titular del juego).
