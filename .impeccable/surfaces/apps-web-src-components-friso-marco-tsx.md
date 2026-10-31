---
version: 1
slug: "apps-web-src-components-friso-marco-tsx"
primary_target: "apps/web/src/components/friso/marco.tsx"
related_targets: ["apps/web/src/styles/shell.css","apps/web/src/app/(auth)"]
---

# Shell e ingreso — surface brief

Scope: encabezado y navegación compartidos (`apps/web/src/components/friso/marco.tsx`, `apps/web/src/styles/shell.css`) e ingreso/recuperación (`apps/web/src/app/(auth)/*`). Visitor mode: Operate. Laboratorios conserva su `<nav>` bajo `.cosmos` sin cambios.

Audience: estudiante y docente. Job: orientarse y saltar de mundo; ingresar. Constraints: un solo menú en el DOM, adaptado por CSS; foco visible ≥3:1; escudo como marca institucional, nunca un avatar.

## Direction contract

THESIS: El encabezado es una franja de juego, no una barra de LMS. Rechaza la barra blanca con logo a la izquierda y enlaces grises, y el paisaje raster anterior.

OWN-WORLD: Azul noche `#0a2350`; escudo real en círculo con filo blanco y contorno de tinta; wordmark MIDUHO en Baloo 2 800, letra por letra en amarillo, naranja, lima, cielo y durazno, con contorno de tinta de 7 px y sombra sólida. Botones sticker de 50 px de alto: contorno de 3 px, sombra interior inferior y sombra exterior desplazada, que se hunden al presionar. La página activa es blanca; las demás llevan el color de su mundo.

STORY: Quien entra reconoce su colegio por el escudo, ve en qué mundo está y cambia de mundo con un toque. En el ingreso, el escudo y el wordmark reciben; el formulario es un panel sticker blanco con campos de 48 px.

FIRST VIEWPORT: Escudo + wordmark a la izquierda, menú al centro, chips de estrellas (solo con datos) y grupo/período y ayuda a la derecha. En móvil, el mismo `<nav>` se fija abajo con objetivos de 56 px.

FORM: Extensión del mundo «Mis materias» (seed 493bfde9); sin ronda propia.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
