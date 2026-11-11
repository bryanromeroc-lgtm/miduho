---
name: "Crear juego desde referencia"
description: Estudia con REA un juego web de referencia y crea en MIDUHO uno propio que juegue igual, adaptado para evaluar, con el audio original de la referencia (voces, efectos y música) e imágenes propias de Gemini
category: Workflow
tags: [juegos, actividades, rea, referencia, skills]
argument-hint: "<URL del juego de referencia, tema y grado, p. ej. https://www.cokitos.com/golpear-al-zombie-sumas-y-restas-hasta-100/play/ sumas y restas 3.°>"
---

Crea un juego educativo 2D para MIDUHO a partir de un juego de referencia:

> $ARGUMENTS

Modelos terminados de este flujo: **tablero «Agrupar» de `vivo-o-no-vivo`** (2026-11-10, el modelo del **audio original** y de parecerse a la referencia: `apps/web/src/features/actividades/juegos/agrupar/`, informe `docs/investigacion/referencia-cokitos-seres-vivos-e-inertes.md`) y, aprobado por el usuario el 2026-11-05, **El taller de los topos** — informe `docs/investigacion/referencia-golpea-el-resultado.md`, cambio `openspec/changes/tipo-golpea-resultado/`, código `apps/web/src/features/actividades/juegos/golpea/`, registro `docs/software-factory/inc-2-golpea-resultado.md`. Léelos antes de empezar.

Lee también:
1. `.claude/skills/referencia-rea/SKILL.md` — cómo estudiar la referencia con REA y las lecciones de adaptación.
2. `.claude/skills/juegos-2d-miduho/SKILL.md` — pila real, piezas comunes, **estándar aprobado** (personajes grandes, escena en 4 tiempos, dos poses, cámara, música aparte), verificación.
3. `.claude/skills/gemini-media/SKILL.md` — imágenes y música.

Las reglas duras de `AGENTS.md` mandan: **de la referencia se reproduce la mecánica**; nada de su código, imágenes, nombre ni personajes, aunque se pida. **El audio es la única excepción: audio capturado con permiso declarado y registrado** (decisión del usuario del 2026-11-10, cambio `openspec/changes/juegos-primero/`): se captura siempre, se inventaría y **se usa siempre** en la adaptación, trazado en un `LICENCIAS.md` (ver «Audio de la referencia» en la fase 0.5). WCAG 2.1 AA, 🔶 en lo no confirmado, español de Colombia, sin datos de menores. No hagas commit ni push salvo que se pida. Da avances cortos al usuario entre fases.

## Fase 0 — Estudiar la referencia con REA (solo lectura)

Sigue `referencia-rea`: instalar REA en el scratchpad (sin `setup`), Chrome aislado en el puerto 9333 (nunca el 9222 de Gemini), `inspect-web-page` con scripts, leer la lógica, medir jugando con Playwright, **borrar lo capturado** y escribir `docs/investigacion/referencia-<slug>.md` con palabras propias. Incluye la autoría real (los portales incrustan juegos de otros).

Entrega al usuario: hallazgos (construcción, mecánica con tiempos, generación y distractores, qué le falta para evaluar) en un resumen corto.

## Fase 0.5 — Captura sonora (obligatoria, siempre)

Se hace **siempre**, también cuando la referencia parece no tener audio (queda la constancia de que se buscó). Con `tools/captura-audio/` (ver su `README.md`):

```bash
cd tools/captura-audio
node src/cli.mjs capturar "<URL>" --slug <plataforma>-<juego> [--guion guiones/<plataforma>.mjs] [--manual 90] [--zip <url>]
node src/cli.mjs inventariar <slug>
node src/cli.mjs resumen <slug>
```

- Chrome propio con perfil temporal (nunca el 9222 de Gemini ni el 9333 de REA), sigue los `iframe` hasta el autor real, como máximo una petición por segundo por dominio, sin iniciar sesión.
- El audio queda en `content/referencias/<slug>/audio/` (**fuera de git**, no se borra); se versionan `inventario.json`, `LICENCIA.md` (desde `tools/captura-audio/plantillas/LICENCIA.md`) y `RESUMEN.md`.
- Claude no oye: `rol`, `evento` y transcripción quedan `inferido` o `null` 🔶 y van a la lista «por escuchar».
- El informe `docs/investigacion/referencia-<slug>.md` lleva la sección **«Inventario sonoro»** (qué se usará y qué se completa con recursos propios).
- Para usar una pista: `node src/cli.mjs adaptar <slug> <id…> --destino apps/web/public/audio/... [--nombre …]` (normaliza, escribe la línea de `LICENCIAS.md` y anota `uso`).

**Audio de la referencia: SIEMPRE se usa** (decisión del usuario del 2026-11-10, confirmada con `vivo-o-no-vivo`: «tenemos los audios, usa los audios originales»). No es una opción que se propone, es lo que se hace por defecto:

- **Efectos:** cada evento del juego suena con el efecto que la referencia usa en ese mismo evento (levantar y soltar pieza, acierto, fallo, revelado, inicio, fin, menú…). Si la referencia tiene variantes del mismo efecto (`tilepickup1…5`), se adaptan 2–3 y se turnan.
- **Voces:** si la referencia dice palabras o consignas, se usan todas. Cuando el contenido de MIDUHO es una lista de palabras (clasificar, emparejar, memoria…), **se eligen los ítems del original** para que cada tarjeta tenga su voz; solo se quita o se cambia un ítem si es ambiguo o erróneo para el grado (🔶, se le dice al usuario), y el cambio se cubre con síntesis.
- **Música:** la de la referencia (bucle, intro, cierre) si la tiene.
- **Solo lo que la referencia no tiene** se completa con `comun/sonido.ts`, Kenney CC0 o Gemini, y se dice cuál es el hueco.
- Se adapta con `node src/cli.mjs adaptar <slug> <id…> --destino apps/web/public/audio/<juegos/<tipo>|actividades/<slug>> --nombre <evento>-1.mp3,…`: normaliza y escribe la fila del `LICENCIAS.md` (lo exige `public-audio.test.ts`). Los archivos se nombran por evento (`acierto-1.mp3`, `fallo-2.mp3`, `inicio.mp3`) o por palabra (`tortuga.mp3`), nunca con el hash.
- Se tocan con `juegos/comun/efectos-grabados.ts` (`useEfectosGrabados`: Web Audio, buffers decodificados en el gesto de «Empezar», variantes turnadas, respeta «Sonidos: sí/no») y las voces con el campo `audio` del contenido + `<Escuchar>`.
- Claude no oye: al cerrar, lista los archivos y pide al usuario que los escuche.

**El juego también debe verse y jugarse como el original** (misma lección): disposición de pantalla, piezas a la vista, botones y secuencia (p. ej. «Enviar respuestas» → revelado uno por uno). Lo que MIDUHO añade (teclado y tocar además de arrastrar, sin reloj ni récords, calificación) va encima de esa forma, sin cambiarla por otra. Modelo: tablero «Agrupar» de `vivo-o-no-vivo` (`juegos/agrupar/`, informe `docs/investigacion/referencia-cokitos-seres-vivos-e-inertes.md`).

## Fase 1 — Diseñar la adaptación (espera visto bueno)

1. ¿Sirve un tipo existente (`tipos/registro.ts`, `juegos/`)? Prefiérelo; si la mecánica no existe, tipo nuevo justificado.
2. Propuesta en el formato del modelo: mecánica igual a la referencia; rondas evaluables deterministas por semilla; calificación (2/1/0 con revelado tras el segundo fallo es el patrón aprobado); pista según el error; opciones para la docente; accesibilidad (botones HTML, teclas, `role="status"`, sin reloj salvo que la mecánica lo exija y entonces pausable).
3. Personajes y escenas: tema propio de MIDUHO, qué hace cada personaje al acertar (escena completa en 4 tiempos) y al fallar (versión suave), qué poses hacen falta.
4. 🔶 lo no confirmado (grado, escala de puntaje, tamaño de personajes si la mecánica obliga a muchos).

**Para y pide confirmación** antes de construir un tipo nuevo.

## Fase 2 — Especificar

Tipo nuevo → `/opsx:propose` (proposal, spec, design, tasks), como `openspec/changes/tipo-golpea-resultado/`. Solo contenido → sin OpenSpec.

## Fase 3 — Construir

Orden probado (ver tareas del modelo):

1. **Lógica pura primero:** `generador.ts` (determinista, distractores por error típico, restricciones), `tipo.ts` (Zod, `items`, `calificar`, `repaso`) y `tipo.test.ts`. Corre las pruebas antes de seguir.
2. **Recursos en paralelo** (en segundo plano mientras escribes la interfaz):
   - Personaje base con Gemini (ref.: un personaje existente para el estilo); míralo; recórtalo y redúcelo.
   - Poses, objeto de acción, fondo, portada y música en cola con Gemini (`--ref` del base). Carteles y pizarras **vacíos**: el texto va en HTML.
   - **Audio original de la referencia** con `captura-audio adaptar` (voces, efectos por evento, música); Kenney CC0 o Gemini solo para los eventos que la referencia no tiene.
3. **Registro** en los cuatro lugares (`tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx`).
4. **Interfaz** `juego.tsx` + `<tipo>.module.css`, partiendo de `juegos/golpea/` y `juegos/robots/`: cabecera fuera de la cámara, `useRondas` con `efectosPropios`, `<Guirnalda>`, `<Chispas>`, Web Audio al ms del impacto, poses con keyframes sincronizados, `prefers-reduced-motion`. Pasa por `/impeccable` para las decisiones visuales.
5. **Contenido:** `curriculo/actividades/<asignatura>/<grado>/<slug>.json` con `imagen` a la portada.

## Fase 4 — Verificar y pulir

1. `npm test`, `npm run lint`, `npm run build` desde la raíz (Postgres de desarrollo arriba). Reporta lo que salga.
2. Página temporal `src/app/prueba.<tipo>/` → capturas a 1920×1080, 1440×900, 390×844 y **video** de acierto y fallo con hoja de cuadros recortada en el elemento golpeado. Corrige lo que veas (tamaños, etiquetas tapadas, texto que se cruza con el dibujo, teléfono) y vuelve a grabar. Borra la página antes del build final.
3. Tabla de `design-game` (con filas «Tamaño de personajes en 1920×1080» y «Escena de acción / poses»), revisión de accesibilidad (`/a11y-audit` si está disponible) y pasada de `/impeccable`.
4. Registra recursos y decisiones en `docs/software-factory/inc-<n>-<tipo>.md` y marca las tareas de OpenSpec con honestidad (lo no hecho queda sin marcar).

## Cierre

Entrega: qué se creó, qué se tomó de la referencia (solo mecánica) y qué se añadió para evaluar, recursos generados y sus licencias, resultado de cada verificación, tabla de `design-game`, lo 🔶 y lo no comprobado. Di qué audio original se usó en cada evento y qué se completó con recursos propios; pide al usuario que **escuche** las voces, los efectos y la música.
