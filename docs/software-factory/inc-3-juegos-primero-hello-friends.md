# Juegos de 1.° · «Hello friends» (tarea 3.13 de `juegos-primero`, `hello-friends`)

- **Fecha:** 2026-11-21 (estudio y construcción) y 2026-11-25 (supervisión, verificación y cierre)
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.13; delta `specs/actividad-quiz-dialogo/`)
- **Referencia funcional:** `docs/investigacion/referencia-hello-friends.md`
  - Cristic solo enlaza: el juego real es Árbol ABC «Greetings Exploratory» (`arbolabcgames.top/E37ABC/`, Phaser 2).
  - Es una conversación lineal de 6 frases entre dos personajes: se toca al personaje indicado por una mano y se abre su globo con voz. No evalúa nada.
  - La mecánica se estudió con REA; no se copió código ni imagen.
- **Captura sonora:** `content/referencias/arbolabc-greetings/` (13 entradas: 2 *sprites* y 11 cortes; marcas copiadas de `AudioManager.js` a `captura.json`).
- **Personaje:** Maca, la guacamaya, guía de Inglés.
- **Primera actividad de Inglés en 1.°:** se añadió a `scripts/demo-primero.ts`, que ahora da 6 asignaturas a `estudiante.primero`.

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Captura sonora e inventario; decisiones con el usuario; audio adaptado (6 voces, título, música, toque, jugar, perro); imágenes con Gemini; encargos; supervisión, 2 arreglos menores propios (ver abajo), verificación, `demo-primero` y cierre |
| Codex (CLI) | Estudio REA con 3 diseños propuestos; construcción de la presentación `dialogo` (esquema, `reproductor/dialogo.tsx` + CSS, reglas, JSON, delta, pruebas) y QA propio en tres tamaños con controles de `emociones-del-recreo` y `cuenta-las-silabas` |
| Usuario | Eligió la opción 3, «escuchar y completar la respuesta del diálogo» (2026-11-21), con los personajes del referente y Maca de guía |

Lecciones:

- **La sesión se cortó tras la construcción** (2026-11-21) y el scratchpad se perdió: encargos, entregas, capturas de Codex y `recursos.md` con las URL de Gemini. Lo escrito en el worktree sobrevivió y el cierre se retomó el 2026-11-25 desde el informe y el diff. Guardar `recursos.md` en el worktree desde el principio.
- **Foco al desactivar opciones.** Al responder, los botones de opción quedan `disabled` y el foco cae a `body`. El quiz común lo evita con `Avanzar` (enfoca «Siguiente» al montarse); una presentación nueva debe hacer lo mismo. Revisar `document.activeElement` en la partida de verificación.
- **El guía no se oculta en el teléfono.** Codex puso `display: none` a Maca en ≤ 767 px para no tapar nada; se perdían sus poses. Mejor pequeño y en un hueco libre de la escena.

## Qué es

Es la presentación opcional `dialogo` sobre `seleccion-multiple` (no un tipo nuevo):

- `presentacion: "dialogo"` y `dialogo.hablantes`: dos hablantes con `id`, `nombre`, `imagen`, `alt`, `lado` y `acompanante` opcional.
- Cada pregunta lleva `hablante`; el otro responde. `alResponder` opcional reproduce un efecto (y puede animar al acompañante) tras la voz de la respuesta.
- `musica`, `audioTitulo`, `tituloAudioTexto`, `efectoToque` y `efectoJugar` opcionales.
- El esquema exige que el hablante exista y que el enunciado y cada opción tengan grabación.
- **Secuencia:** globo HTML del enunciado con voz y «Escuchar de nuevo» → dos respuestas con «Escuchar opción» → al elegir, marca el resultado, Maca pasa a `senala` o `duda`, aparece la respuesta correcta en el globo del otro hablante y suena su voz → «Siguiente». La respuesta revelada es el enunciado del turno siguiente, sin repetirse sola.
- **Calificación:** la de `seleccion-multiple`, 1 punto por primera elección (regla en `reproductor/reglas.ts`). Sin reloj.
- Sin `presentacion`/`dialogo`, el quiz conserva su flujo anterior.

## Contenido

Cinco turnos con las seis frases del referente (Teresa, Christian y el perro Perry son personajes ficticios del juego original, no datos de estudiantes):

| # | Habla | Enunciado | Respuesta correcta | Distractor |
|---|---|---|---|---|
| 1 | Teresa | Good morning, my name is Teresa. | Hi, my name is Christian. Nice to meet you. | Goodbye Teresa. |
| 2 | Christian | Hi, my name is Christian. Nice to meet you. | Hello Christian, what is your dog's name? | Goodbye Christian and Perry. |
| 3 | Teresa | Hello Christian, what is your dog's name? | My dog's name is Perry. (+ ladridos) | Hi, my name is Christian. Nice to meet you. |
| 4 | Christian | My dog's name is Perry. | Goodbye Christian and Perry. | Hello Christian, what is your dog's name? |
| 5 | Teresa | Goodbye Christian and Perry. | Goodbye Teresa. | My dog's name is Perry. |

🔶 Validación docente: si ING-1-04 en 1.° abarca presentarse y preguntar por una mascota, y si las frases 2 y 3 son largas para lectores iniciales.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/tipos/preguntas.ts` | Esquema `dialogo`, `hablante`, `alResponder` y campos de audio; validación cruzada |
| `apps/web/src/features/actividades/reproductor/dialogo.tsx` + `dialogo.module.css` | Presentación de diálogo |
| `apps/web/src/features/actividades/reproductor/juegos-preguntas.tsx` | `Quiz` elige `DialogoQuiz` cuando hay diálogo |
| `apps/web/src/features/actividades/reproductor/reglas.ts` | Primera respuesta y texto de reglas del diálogo |
| `apps/web/src/features/actividades/tipos/tipos.test.ts`, `reproductor/reglas.test.ts`, `server/modules/curriculo/curriculo.test.ts` | Pruebas añadidas |
| `apps/web/curriculo/actividades/ingles/1/hello-friends.json` | La actividad |
| `apps/web/scripts/demo-primero.ts` | Inglés añadido a la lista de 1.° |
| `openspec/changes/juegos-primero/specs/actividad-quiz-dialogo/spec.md`, `proposal.md`, `specs/juegos-primero/spec.md` | Delta y referencias |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/hello-friends/` (`maca-reposo`, `maca-senala`, `maca-duda`, `teresa`, `christian`, `perry`, `parque`, `portada`) | Gemini chat con `images/guias/ingles.webp` como referencia de Maca. Las URL de las conversaciones se perdieron con el scratchpad 🔶 |
| `public/audio/actividades/hello-friends/` | 6 frases y el título del referente, `captura-audio adaptar`; `LICENCIAS.md` |
| `public/audio/juegos/hello-friends/` | Música, toque, jugar y perro del referente; `LICENCIAS.md` (permiso declarado 2026-11-10; soporte escrito por adjuntar 🔶) |
| `public/audio/juegos/parejas/` | Acierto, fallo, fin de ronda y fin del quiz ilustrado (reutilizados) |

## Verificación (2026-11-25)

- `npm test`: 95 archivos, 964 pruebas en verde (con PostgreSQL). `npm run lint`: 0 errores (1 aviso previo en `scripts/verificar-material-audiovisual.mjs`). `npm run build`: compila (página temporal `prueba.hello` borrada antes).
- Partida en navegador (Playwright, 1440×900 y 390×844) con fallos a propósito en los turnos 2 y 4: «Acertaste 3 de 5»; Maca `senala` en aciertos y `duda` en fallos; 0 imágenes rotas, 0 errores de consola, 0 px de desborde horizontal; foco en «Siguiente»/«Ver resultado» tras cada respuesta.
- Codex (2026-11-21): partida con teclado 4/5 en tres tamaños y controles de `emociones-del-recreo` y `cuenta-las-silabas` sin cambios.

### Arreglos de Claude en la supervisión

1. **Foco perdido tras responder** (WCAG 2.4.3): `dialogo.tsx` enfoca «Siguiente» al revelarse la respuesta, como `Avanzar` en el quiz común.
2. **Maca oculta en teléfono:** ahora se ve pequeña entre Teresa y el perro (`left: 37%`, `14cqw`), sin tapar controles.

## Pendiente 🔶

- Escuchar las 6 voces originales (que coincidan con el texto del globo), el título «Greetings», la música y los efectos.
- Consigna sin grabación (en 1.° la lee la síntesis del navegador); voz Gemini por generar si el usuario la quiere.
- Recorrido con la cuenta `demo-primero`.
- Validación docente del alcance de ING-1-04 y de las frases largas.
- Soporte escrito del permiso de Árbol ABC.
- URL de las conversaciones de Gemini de las imágenes.
