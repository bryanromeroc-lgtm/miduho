# Juegos de 1.° · «My family» (tarea 3.14 de `juegos-primero`, `my-family`)

- **Fecha:** 2026-11-25
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.14; delta `specs/actividad-quiz-ilustrado/`)
- **Referencia funcional:** `docs/investigacion/referencia-my-family.md`
  - La página de Árbol ABC «Conoce la familia de Christian» incrusta el juego Phaser `arbolabcgames.top/E38ABC/` (el mismo motor que `hello-friends`).
  - En cada turno se oye y se lee una oración («She is my mom.») y se elige entre **dos retratos**: el correcto y un distractor al azar entre los otros siete. Reintento ilimitado; 3 hitos de progreso; 8 oraciones.
  - La tarea preveía `emparejar`; la mecánica real es selección entre dos imágenes.
  - Estudiado con REA; no se copió código ni imagen.
- **Captura sonora:** `content/referencias/arbolabc-my-family/` (26 entradas: 3 *sprites* y 23 cortes; marcas copiadas de `AudioManager.js` a `captura.json`).
- **Personaje:** Maca, la guacamaya, guía de Inglés (poses reutilizadas de `hello-friends`).

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Ubicó el juego real (la página es una SPA), captura sonora y licencias; decisiones con el usuario y lista final; 7 voces y 5 efectos/música adaptados; 8 imágenes con Gemini; encargos; revisión con una ronda de 2 correcciones; 1 arreglo propio (ver abajo); verificación y cierre |
| Codex (CLI) | Estudio REA con 3 diseños propuestos; construcción (JSON, música genérica en el quiz ilustrado, guía sin imagen de situación, `barajarPreguntas`, pruebas, delta); voz de la consigna con Gemini TTS; una ronda de correcciones |
| Usuario | Quiz ilustrado existente; 7 oraciones sin el nombre propio; familia colombiana sin nombres; distractor fijo; aprobó la lista final (2026-11-25) |

Lecciones:

- **Árbol ABC (arbolabc.com) es una SPA:** `curl` no trae el juego; se abre la página con Playwright y se lee el `iframe` (`arbolabcgames.top/<carpeta>/`).
- **Nombres de la familia de la autora:** la página dice que la autora tiene dos hijos, Teresa y Christian. Aquí se quitó la oración con el nombre; en `hello-friends` el usuario decidió conservarlos como personajes del juego.
- **Datos que el reproductor no recibe:** las páginas del estudiante y del admin arman `actividad` campo por campo; un campo nuevo que el juego lee (aquí `imagen` para la pantalla de inicio) debe añadirse también allí, no solo en la página temporal. Revisar `app/materias/[asignatura]/actividades/[id]/page.tsx` y la del admin.
- **Texto fijo en la pantalla de inicio:** Codex volvió a escribir texto del juego en un componente genérico («Escucha y elige la imagen»); se corrigió con título, portada e instrucción de la actividad.
- **Retratos en el quiz ilustrado:** con dos opciones, la rejilla de cuatro dejaba los retratos en ~170 px; ahora las columnas siguen la cantidad de opciones (266 px a 1440×900).

## Qué es

`seleccion-multiple` con la presentación ilustrada existente y tres campos genéricos opcionales:

- `musica`: bucle a volumen bajo tras una pantalla de inicio con la portada, el título y la instrucción de la actividad (necesaria para el gesto que habilita el audio); control «Música: sí/no» con `aria-pressed`; baja con la voz y se pausa al ocultar la pestaña y al terminar. Lógica compartida con `dialogo` en `juegos/comun/musica.ts`.
- Guía (`escena.personaje`) visible aunque la pregunta no tenga `imagen`; poses sincronizadas con el impacto.
- `barajarPreguntas`: mezcla los turnos con el mismo generador que las opciones (`ordenPartida`).
- Sin esos campos, los quizzes anteriores se ven y suenan igual (controles de `emociones-del-recreo`, `cuenta-las-silabas` y `hello-friends`).

Calificación: la de `seleccion-multiple`, sin cambios (1 punto por pregunta; al fallar se revela la correcta).

## Contenido

| Oración (voz original) | Correcta | Distractor |
|---|---|---|
| She is my mom. | mamá | abuela |
| He is my dad. | papá | abuelo |
| She is my baby sister. | hermana bebé | mamá |
| She is my grandmother. | abuela | hermana bebé |
| He is my grandfather. | abuelo | papá |
| This is my dog. | perro | hermana bebé |
| This is my family. | familia | papá |

Consigna: «Escucha la oración en inglés y toca la imagen que corresponde.» Etiquetas en español bajo cada retrato. 🔶 Validación docente: vocabulario (*mom/dad* frente a *grandmother/grandfather*), inclusión del perro y representación de la familia.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/curriculo/actividades/ingles/1/my-family.json` | La actividad |
| `apps/web/src/features/actividades/reproductor/juegos-preguntas.tsx`, `reproductor.module.css`, `inicio.module.css` | Música, pantalla de inicio, guía sin imagen, retratos grandes |
| `apps/web/src/features/actividades/juegos/comun/musica.ts` (+ prueba) | Música compartida |
| `apps/web/src/features/actividades/reproductor/dialogo.tsx`, `dialogo.module.css` | Usa la música y el inicio compartidos |
| `apps/web/src/features/actividades/reproductor/ordenes-preguntas.ts` (+ prueba), `tipos/preguntas.ts` | `barajarPreguntas` |
| `apps/web/src/features/actividades/juegos/comun/escuchar.tsx`, `reproductor/reproductor.tsx` | `titulo` e `imagen` en `ContextoActividad` |
| `apps/web/src/app/materias/[asignatura]/actividades/[id]/page.tsx`, `app/admin/contenido/[asignatura]/[grado]/actividades/[id]/page.tsx` | Pasan `imagen` al reproductor (arreglo de Claude) |
| `openspec/changes/juegos-primero/specs/actividad-quiz-ilustrado/spec.md`, `specs/juegos-primero/spec.md` | Delta y fila |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/my-family/` | Gemini chat; conversaciones en `content/referencias/arbolabc-my-family/recursos-imagenes.md` (familia `a0e00181e4765eed`, padres `3a3761628bef6bd3`, abuelos `8d0d0436c2dc4d7a`, bebé y perro `7d9f52266fd8958e`, portada `9ae0204d81c5d2b3`) |
| `public/audio/actividades/my-family/` | 7 oraciones del referente (`captura-audio adaptar`) + `instruccion.mp3` (Gemini TTS `es-419-tutor-3`, `gemini-3.8-flash-tts`); `LICENCIAS.md` |
| `public/audio/juegos/my-family/` | Acierto, error, navegación (fin de ronda), hito (fin) y música del referente; `LICENCIAS.md` (permiso declarado 2026-11-10; soporte escrito por adjuntar 🔶) |

## Verificación (2026-11-25)

- `npm test`: 97 archivos, 968 pruebas en verde (con PostgreSQL). `npm run lint`: 0 errores (1 aviso previo en `scripts/verificar-material-audiovisual.mjs`). `npm run build`: compila (página temporal borrada antes).
- Partida en navegador, modo práctica, a 1920×1080, 1440×900 y 390×844, con fallos a propósito en las preguntas 2 y 4: «Acertaste 5 de 7»; orden barajado; Maca `senala`/`duda` correctas; foco en «Siguiente»/«Ver resultado» tras cada respuesta; 0 imágenes rotas, 0 errores de consola, 0 px de desborde.
- Control `hello-friends` tras el cambio de música: 3/5, foco correcto, sin errores. Codex: controles de `emociones-del-recreo` y `cuenta-las-silabas` sin cambios de distribución.

## Pendiente 🔶

- Escuchar las 7 voces originales (que digan la oración del texto), los efectos, la música y la consigna Gemini.
- Recorrido con la cuenta `demo-primero`.
- Validación docente del vocabulario y de la representación de la familia.
- `ReproductorAsignado` (actividades asignadas) no se revisó para el campo `imagen`.
- Soporte escrito del permiso de Árbol ABC.
