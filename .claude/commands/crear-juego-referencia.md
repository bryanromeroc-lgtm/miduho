---
name: "Crear juego desde referencia"
description: Estudia con REA un juego web de referencia y crea en MIDUHO uno propio que juegue igual, adaptado para evaluar, con imágenes y música de Gemini y efectos CC0
category: Workflow
tags: [juegos, actividades, rea, referencia, skills]
argument-hint: "<URL del juego de referencia, tema y grado, p. ej. https://www.cokitos.com/golpear-al-zombie-sumas-y-restas-hasta-100/play/ sumas y restas 3.°>"
---

Crea un juego educativo 2D para MIDUHO a partir de un juego de referencia:

> $ARGUMENTS

Modelo terminado de este flujo (aprobado por el usuario el 2026-11-05): **El taller de los topos** — informe `docs/investigacion/referencia-golpea-el-resultado.md`, cambio `openspec/changes/tipo-golpea-resultado/`, código `apps/web/src/features/actividades/juegos/golpea/`, registro `docs/software-factory/inc-2-golpea-resultado.md`. Léelos antes de empezar.

Lee también:
1. `.claude/skills/referencia-rea/SKILL.md` — cómo estudiar la referencia con REA y las lecciones de adaptación.
2. `.claude/skills/juegos-2d-miduho/SKILL.md` — pila real, piezas comunes, **estándar aprobado** (personajes grandes, escena en 4 tiempos, dos poses, cámara, música aparte), verificación.
3. `.claude/skills/gemini-media/SKILL.md` — imágenes y música.

Las reglas duras de `AGENTS.md` mandan: **de la referencia solo se reproduce la mecánica**; nada de su código, imágenes, sonidos, música, nombre ni personajes, aunque se pida (si alguien tiene derechos, que entregue originales con licencia escrita). WCAG 2.1 AA, 🔶 en lo no confirmado, español de Colombia, sin datos de menores. No hagas commit ni push salvo que se pida. Da avances cortos al usuario entre fases.

## Fase 0 — Estudiar la referencia con REA (solo lectura)

Sigue `referencia-rea`: instalar REA en el scratchpad (sin `setup`), Chrome aislado en el puerto 9333 (nunca el 9222 de Gemini), `inspect-web-page` con scripts, leer la lógica, medir jugando con Playwright, **borrar lo capturado** y escribir `docs/investigacion/referencia-<slug>.md` con palabras propias. Incluye la autoría real (los portales incrustan juegos de otros).

Entrega al usuario: hallazgos (construcción, mecánica con tiempos, generación y distractores, qué le falta para evaluar) en un resumen corto.

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
   - Efectos CC0 (Kenney vía Playwright) con `LICENCIAS.md`.
3. **Registro** en los cuatro lugares (`tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx`).
4. **Interfaz** `juego.tsx` + `<tipo>.module.css`, partiendo de `juegos/golpea/` y `juegos/robots/`: cabecera fuera de la cámara, `useRondas` con `efectosPropios`, `<Guirnalda>`, `<Chispas>`, Web Audio al ms del impacto, poses con keyframes sincronizados, `prefers-reduced-motion`. Pasa por `/impeccable` para las decisiones visuales.
5. **Contenido:** `curriculo/actividades/<asignatura>/<grado>/<slug>.json` con `imagen` a la portada.

## Fase 4 — Verificar y pulir

1. `npm test`, `npm run lint`, `npm run build` desde la raíz (Postgres de desarrollo arriba). Reporta lo que salga.
2. Página temporal `src/app/prueba.<tipo>/` → capturas a 1920×1080, 1440×900, 390×844 y **video** de acierto y fallo con hoja de cuadros recortada en el elemento golpeado. Corrige lo que veas (tamaños, etiquetas tapadas, texto que se cruza con el dibujo, teléfono) y vuelve a grabar. Borra la página antes del build final.
3. Tabla de `design-game` (con filas «Tamaño de personajes en 1920×1080» y «Escena de acción / poses»), revisión de accesibilidad (`/a11y-audit` si está disponible) y pasada de `/impeccable`.
4. Registra recursos y decisiones en `docs/software-factory/inc-<n>-<tipo>.md` y marca las tareas de OpenSpec con honestidad (lo no hecho queda sin marcar).

## Cierre

Entrega: qué se creó, qué se tomó de la referencia (solo mecánica) y qué se añadió para evaluar, recursos generados y sus licencias, resultado de cada verificación, tabla de `design-game`, lo 🔶 y lo no comprobado. Pide al usuario que **escuche** los efectos y la música.
