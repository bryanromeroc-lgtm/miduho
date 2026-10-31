# Auditoría de partida — rediseño identidad juvenil (tarea 2.4)

Fecha: 2026-10-31 · Rama `feat/rediseno-identidad-juvenil` antes de tocar estilos.
Superficies: inicio (estudiante y docente), Biblioteca, Agenda e ingreso, a 1440 y 390 px.
Evidencia: capturas en `.impeccable/review/baseline/`; detector `impeccable detect --json`; pasada automática en navegador (contraste calculado, nombres accesibles, encabezados, objetivos táctiles, scroll horizontal, recursos raster).

## Puntuación

| # | Dimensión | Puntaje | Hallazgo clave |
|---|---|---|---|
| 1 | Accesibilidad | 3 | Cuerpo de 14 px y rótulos de 11–13 px para lectores emergentes; filtros de la Biblioteca de 40 px de alto |
| 2 | Rendimiento | 2 | Inicio con 22 imágenes Twemoji y 4 raster; Biblioteca con 24 raster y 19 Twemoji |
| 3 | Responsive | 3 | Sin scroll horizontal en ninguna vista; objetivos táctiles por debajo de 44 px en filtros y migas |
| 4 | Theming | 1 | 380 colores literales en `globals.css`, 103 en `shell.css`, 73 en `valle.tsx`; tres bloques `:root` que se pisan |
| 5 | Integridad | 2 | Identidad «Friso de Aula» coherente para la docente, pero oso, castillo y emojis leen «para bebés» para el estudiante (motivo del cambio) |
| **Total** | | **11/20** | **Aceptable: trabajo significativo pendiente** |

## Veredicto de integridad

**No pasa para la audiencia que ahora manda.** El sistema es coherente para la docente, pero el estudiante no tiene inicio propio: ve el friso del adulto con escenografía infantil (oso 3D, castillo, Twemoji). El color se reparte en tres bloques `:root` que se sobrescriben (`--color-tinta` vale `#1b1b1f` en `@theme` y `#20334b` en el `:root` posterior), así que el token declarado no es el que se pinta. El detector solo marcó un caso (borde de acento sobre elemento redondeado, `shell.css:453`).

## Resumen

- P0: 0 · P1: 3 · P2: 4 · P3: 1
- Lo más grave: sin superficie de estudiante; tipografía pequeña para lectores emergentes; tokens con valores que se pisan.
- Siguiente paso: el propio cambio (colorize → typeset → extract → «Mis materias»).

## Hallazgos

**[P1] El estudiante no tiene inicio propio** — `app/page.tsx` · Integridad. Ve el friso de la docente. Contradice el producto: el estudiante manda. → `/impeccable` (nuevo trabajo, grupo 8).

**[P1] Cuerpo de 14 px y rótulos de 11–13 px** — `globals.css` (49 reglas de 10–13 px), `shell.css` (22), `inicio.module.css` (6) · Accesibilidad. Lectores de 6 a 10 años y posible baja visión. → `/impeccable typeset` (mínimo 16 px de cuerpo).

**[P1] Tokens que se sobrescriben** — `globals.css:7`, `:71`, `:266`, `:534` · Theming. El valor del token depende del orden del archivo; un cambio en `@theme` no llega a la pantalla. → `/impeccable colorize` (una sola fuente de tokens).

**[P2] Colores literales** — 380 en `globals.css`, 103 en `shell.css`, 73 en `valle.tsx`, 53 en `biblioteca.module.css` · Theming. → `/impeccable colorize` (tarea 3.4).

**[P2] Contraste de «Estante anterior» 4.38:1** — Biblioteca, `rgb(122,117,128)` sobre `#fffcf7` a 13 px · Accesibilidad, WCAG 1.4.3. → `/impeccable colorize`.

**[P2] Objetivos táctiles de 40 px** — chips de filtro de la Biblioteca (tipo y edad); miga «Hoy» de 26×17; enlace «¿Olvidaste tu contraseña?» de 24 px de alto · Responsive, WCAG 2.5.5. → `/impeccable adapt`.

**[P2] Escenografía raster y Twemoji** — 22 imágenes en el inicio, 19 + 24 raster en la Biblioteca (`public/images/portal`, `dashboard`) · Rendimiento. Peso innecesario con la red del colegio (meta ≤2 s). → se retiran en la tarea 10.6.

**[P3] Reducción de movimiento global a 0.01 ms** — `globals.css` (`@media (prefers-reduced-motion)`) · Accesibilidad. Mata también la retroalimentación útil; la nueva identidad define variantes reducidas por componente. → `/impeccable animate`.

## Patrones sistémicos

- El color vive en literales y en tres capas de `:root`; el sistema de tokens existe pero no gobierna.
- La escala tipográfica es de panel adulto (14/13/11 px), no de lector emergente.

## Lo que funciona

- Un solo `<main>`, un `h1` por vista, sin saltos de encabezado, sin imágenes sin `alt` ni controles sin nombre en las vistas revisadas.
- Ninguna vista tiene scroll horizontal a 390 px.
- Un solo menú en el DOM, adaptado por CSS.

## Acciones recomendadas

1. **[P1] `/impeccable colorize`**: una sola fuente de tokens del escudo, sin literales (tareas 3.1–3.4).
2. **[P1] `/impeccable typeset`**: Baloo 2 + Atkinson Hyperlegible Next, cuerpo ≥16 px (grupo 4).
3. **[P1] `/impeccable`** nuevo trabajo: «Mis materias» (grupos 7–8).
4. **[P2] `/impeccable adapt`**: objetivos ≥44 px (≥48 px en el botón de jugar) (grupo 12).
5. **[P3] `/impeccable animate`**: variantes reducidas por componente (tarea 8.5).
6. `/impeccable polish` al cierre (tarea 13.4).

Laboratorios queda fuera: congelado en `.cosmos` (tarea 2.3) y vigilado con `npm run regresion:labs`.

---

**Nota de línea base (2026-10-31, tarea 8.4):** se re-tomaron las 9 capturas `estudiante-laboratorios*` de `baseline/` porque el menú del estudiante cambió de contenido por decisión de producto (🔶: «Hoy» → «Mis materias», sale «Mis clases»). El diff mostró cambios solo dentro del `<nav>`; el estilo de la cabina y el resto de Laboratorios no cambiaron, y las 9 capturas de docente siguieron idénticas.
