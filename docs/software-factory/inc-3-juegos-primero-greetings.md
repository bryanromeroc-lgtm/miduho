# Juegos de 1.° · «Hello and goodbye» (tarea 3.15 de `juegos-primero`, `greetings`)

- **Fecha:** 2026-11-25
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.15; delta `specs/actividad-quiz-ilustrado/`)
- **Referencia funcional:** `docs/investigacion/referencia-greetings.md`
  - La referencia de la tarea («Árbol ABC saludos», página `saludos-exploratorios`) incrusta **E37ABC, el mismo juego de `hello-friends`**. El usuario eligió el juego hermano con el mismo objetivo («Digo hola y adiós en inglés»): «Hello and goodbye» (`arbolabc.com/vocabulario-en-ingles/hello-good-bye` → `arbolabcgames.top/E35ABC/`).
  - Es un libro lineal de 5 páginas: un carro de safari llega a cada animal («Hello gorilla.») y se va («Goodbye gorilla.»). Solo se avanza con una flecha; no hay preguntas ni error. Lulú es el ave que conduce, no una persona.
  - Estudiado con REA; no se copió código ni imagen.
- **Captura sonora:** `content/referencias/arbolabc-hello-goodbye/` (25 entradas: 2 *sprites* `.ogg` y 23 cortes; marcas copiadas de `GlobalConfig.js` → `sounds`).
- **Personaje:** Maca, la guacamaya, guía de Inglés (poses de `hello-friends`; al volante del carro en las escenas).

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Detectó que la referencia repetía la de `hello-friends` y ubicó los juegos hermanos (E35ABC, E34ABC); captura sonora y licencias; decisiones con el usuario y lista final; 10 voces, música y efecto adaptados; 8 imágenes con Gemini; encargos; revisión sin ronda de correcciones; arreglo de una prueba frágil (ver abajo); verificación y cierre |
| Codex (CLI) | Estudio REA con 3 diseños propuestos; construcción (JSON, regla genérica de opciones grandes con situación, pruebas, delta); voz de la consigna con Gemini TTS |
| Usuario | E35ABC en lugar de repetir E37ABC; diseño «¿llega o se va?»; los 5 animales originales; 10 preguntas barajadas; aprobó la lista final (2026-11-25) |

Lecciones:

- **Comprobar que la referencia no esté ya usada:** dos tareas del programa (3.13 vía Cristic y 3.15 vía Árbol ABC) apuntaban al mismo juego E37ABC. Árbol ABC enlaza juegos hermanos por objetivo en cada ficha («Reconoce los saludos en inglés»).
- **Árbol ABC no siempre usa `AudioManager.js`:** en E35ABC el atlas está en `GlobalConfig.js` (`sounds.soundsSFX` / `soundsVoice`) y los audios son `.ogg`.
- **Pruebas de catálogo frágiles:** una prueba de `hello-friends` exigía que fuera la *primera* actividad de Inglés de 1.°; el catálogo ordena por nombre de archivo y `greetings.json` va antes. Claude la cambió por «contiene las tres». Codex no puede correr estas pruebas (no llega al PostgreSQL): siempre `npm test` completo antes de cerrar.
- **Heredoc sin comillas:** al armar un encargo con `python3 - <<EOF` (sin comillas) bash ejecutó los textos entre comillas invertidas; nada se ejecutó con efecto, pero los encargos se escriben con la herramienta de escritura o con `<<'EOF'`.

## Qué es

`seleccion-multiple` con la presentación ilustrada existente (`musica`, `barajarPreguntas`, guía Maca) y una regla genérica nueva en `reproductor/reglas.ts`:

- `opcionesVisualesGrandes`: si la pregunta tiene **2 opciones o menos y todas con imagen**, las opciones se muestran como tarjetas grandes en columnas aunque haya `imagen` de situación (clase `quizOpcionesGrandes`). Con 3 o más opciones, o si alguna no tiene imagen, se ve como antes (controles de `emociones-del-recreo`, `cuenta-las-silabas` y `my-family`).

Calificación: la de `seleccion-multiple`, sin cambios.

## Contenido

10 preguntas barajadas. Cada una: ilustración del animal (situación con `alt`), la frase en HTML con su voz original y dos escenas fijas: **Llega** (el carro de Maca viene de frente) y **Se va** (el carro se aleja de espaldas, con polvo).

| Frases | Correcta |
|---|---|
| Hello gorilla. · Hello cheetah. · Hello elephant. · Hello giraffe. · Hello zebra. | Llega |
| Goodbye gorilla. · Goodbye cheetah. · Goodbye elephant. · Goodbye giraffe. · Goodbye zebra. | Se va |

Consigna: «Escucha el saludo en inglés. ¿Maca llega o se va?» Explicaciones: «Hello se dice al llegar.» / «Goodbye se dice al irse.» 🔶 Validación docente: animales de safari frente a fauna colombiana; si basta *hello/goodbye* sin *hi/bye*.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/curriculo/actividades/ingles/1/greetings.json` | La actividad |
| `apps/web/src/features/actividades/reproductor/reglas.ts` (+ prueba), `juegos-preguntas.tsx`, `reproductor.module.css` | Regla y estilos de opciones grandes |
| `apps/web/src/features/actividades/reproductor/greetings.test.ts` | Prueba del contenido y la calificación de la actividad 🔶 (está en la carpeta del reproductor; podría moverse junto al currículo) |
| `apps/web/src/server/modules/curriculo/curriculo.test.ts` | Prueba de Inglés 1.° menos frágil (Claude) |
| `openspec/changes/juegos-primero/specs/actividad-quiz-ilustrado/spec.md`, `specs/juegos-primero/spec.md` | Delta y fila |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/greetings/` | Gemini chat; conversaciones en `content/referencias/arbolabc-hello-goodbye/recursos-imagenes.md` (llega `c696914f8f0b26df`, se va `d7851df8555c3934`, gorila `25d84be647db1626`, guepardo `c4d0e84366f1aea1`, elefante `5c8101da3bb08937`, jirafa `598e931785b8440b`, cebra `14504ec1c56c3a33`, portada `4269955497698cf1`) |
| `public/audio/actividades/greetings/` | 10 frases del referente (`captura-audio adaptar`) + `instruccion.mp3` (Gemini TTS `es-419-tutor-3`); `LICENCIAS.md` |
| `public/audio/juegos/greetings/` | Música y navegación (fin de ronda) del referente; `LICENCIAS.md` (permiso declarado 2026-11-10; soporte escrito por adjuntar 🔶) |
| `public/audio/juegos/parejas/` | Acierto, fallo y fin (reutilizados; el referente no los tiene) |

## Verificación (2026-11-25)

- `npm test`: 98 archivos, 972 pruebas en verde (con PostgreSQL), tras corregir la prueba frágil. `npm run lint`: 0 errores (1 aviso previo). `npm run build`: compila (página temporal borrada antes).
- Partida en navegador, modo práctica, a 1920×1080, 1440×900 y 390×844, con fallos a propósito en las preguntas 2 y 4: «Acertaste 8 de 10»; orden barajado; Maca `senala`/`duda` correctas; foco en «Siguiente»/«Ver resultado»; 0 imágenes rotas, 0 errores de consola, 0 px de desborde. Tarjetas «Llega»/«Se va» de ~240 px a 1440×900.
- Control `my-family` tras el cambio de CSS: 5/7, misma distribución, sin errores. Codex: controles de `emociones-del-recreo` y `cuenta-las-silabas`.

## Pendiente 🔶

- Escuchar las 10 voces originales (que digan el saludo y el animal), la música y la consigna Gemini.
- Recorrido con la cuenta `demo-primero` (tarea 3.16, con las 15 de la fase 2).
- Validación docente.
- Soporte escrito del permiso de Árbol ABC.
