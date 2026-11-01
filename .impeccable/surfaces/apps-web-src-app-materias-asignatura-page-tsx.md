---
version: 1
slug: "apps-web-src-app-materias-asignatura-page-tsx"
primary_target: "apps/web/src/app/materias/[asignatura]/page.tsx"
related_targets: ["apps/web/src/features/materias/vista","apps/web/src/features/materias/tematica","apps/web/src/app/materias/[asignatura]/actividades/[id]/page.tsx","apps/web/src/app/muestras/materia/page.tsx"]
---

# Vista de materia del estudiante — surface brief

Scope: `/materias/[asignatura]` con contexto ESTUDIANTE (`apps/web/src/app/materias/[asignatura]/page.tsx` → `features/materias/vista/`, `features/materias/tematica/`), su destino `/materias/[asignatura]/actividades/[id]` y la muestra `/muestras/materia`. Visitor mode: Operate (el niño ve las actividades de su materia y abre una con un toque), con registro lúdico.

Audience: estudiante de 6 a 10 años, lector emergente, en tableta compartida o computador del colegio. Job: encontrar la actividad que toca y entrar. Content: actividades reales de `fundacion-actividades` (`ActividadResumen`); hoy la fuente no existe y la vista real muestra el estado vacío. Constraints: una pantalla sin scroll desde 900×640; WCAG AA; nada de actividades ni cifras inventadas; Laboratorios intocable; la referencia del operador solo aporta el esquema (título + cuadrícula de tarjetas con botón), nunca su mascota, escenas ni texto.

Pinned by the operator (2026-10-31): 2D flat moderno y lúdico; layout centrado sin panel lateral; temática estricta por materia; fondo pastel neutro con marcas de agua sutiles; **todo flat, incluido el encabezado** (no usa `MarcoJuego`); paginación de 6; Sociales con bandera de Colombia; `fisica` = Física (ciencia).

## Direction contract

THESIS: Cada materia es su propio pupitre plano: la vista se viste entera con los útiles de *esa* asignatura y deja las actividades al centro como fichas para tomar. Rechaza la rejilla genérica de tarjetas blancas con icono, el sticker con contorno de tinta de «Mis materias» y la escenografía de bosque o madera sin relación con el tema.

OWN-WORLD: Planos de color sólidos sin sombra ni contorno oscuro. Por materia, cinco tokens: `fondo` pastel (OKLCH L≈0.96, C ≤ 0.03), `marca` de agua (≤ 0.12 de opacidad), `tarjeta` (plano claro sobre el fondo), `acento` (botón y chip, relleno saturado) y `tinta` (texto ≥ 4.5:1). Utilería propia de la materia: clip, cinta y chinche reinterpretados (Matemáticas: clip de papel, cinta cuadriculada, chinche-ficha numérica), marco de tarjeta temático (regla con marcas de cm). Baloo 2 para cabecera y títulos, Atkinson Hyperlegible Next para el cuerpo, mínimo 16 px. Esquinas generosas (20–28 px), pastillas en botones y chips.

STORY: El niño llega desde «Entrar a {materia}», reconoce la materia por su cabecera y su fondo, ve de un vistazo qué puede jugar (chip y botón), qué ya hizo (estrellas, intentos) y qué abre después; toca una tarjeta y entra. «Volver a Mis materias» lo devuelve con el mismo cromo elegido.

FIRST VIEWPORT: Encabezado flat de una línea (escudo + wordmark, «Volver a Mis materias», cuenta). Debajo, cabecera temática centrada: nombre de la materia en Baloo 2 grande sobre un plano con la escenografía del kit a los lados (regla, escuadra, compás, números en Matemáticas) y el subtítulo de la materia. Al centro, cuadrícula 3×2 (`minmax(0,1fr)`, máx. 1200 px) de tarjetas de actividad; cada tarjeta: banda de ilustración del tipo, título (2 líneas), chip de estado, estrellas e intentos, botón en pastilla. Abajo, paginador «Anteriores · Página X de Y · Siguientes». Sueltos flotando en los márgenes, fuera de la zona de texto. Acción primaria: el botón de cada tarjeta.

FORM: Pupitre temático plano, fijado por el operador (D4–D6 de `openspec/changes/vistas-de-materia/design.md`); sin ronda de dirección porque la dirección está fijada. Seed key: none (pinned). Build path: code-led (no hay generación de imágenes); todo el arte en SVG de autoría propia.

SIGNATURE INTERACTION: las tarjetas entran escalonadas (≤ 60 ms entre tarjetas, 320 ms cada una); al pasar el puntero la tarjeta sube 4 px y su utilería se balancea (el clip gira, la cinta se tensa). Los sueltos flotan lento (6–9 s). Solo `transform`/`opacity`; con movimiento reducido no hay entrada, flotar ni balanceo.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Kits (fuente de verdad: D4)

Matemáticas · Lectura · Naturales · Inglés · Robótica · Emprendimiento · Ética · Artística · Física · Sociales · Genérica. Cada kit: `fondo`, `marcas` (≥ 3), `cabecera`, `utileria` (clip, cinta, chinche), `marco`, `sueltos` (≥ 3). Ningún id se comparte entre kits. Nada de bosque, madera ni paisajes. Sin banderas de otros países.

## Reglas flat (D5)

- Sin `box-shadow`, `filter: drop-shadow`, bordes de tinta oscura de más de 1 px, degradados de volumen ni texturas. Lo vigila `vista.estilos.test.ts`.
- Separación por planos de color y espacio; texto siempre sobre plano sólido.
- Foco visible: anillo de 3 px de alto contraste (requisito AA, no decoración).

## Unresolved

- 🔶 Educación física sin kit propio (hoy cae en la escena `fisica`).
- 🔶 Reproductor de actividades: el destino muestra «Esta actividad se abre pronto».
