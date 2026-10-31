---
version: 1
slug: "apps-web-src-features-inicio-inicio-docente-tsx"
primary_target: "apps/web/src/features/inicio/inicio-docente.tsx"
related_targets: ["apps/web/src/app/inicio.module.css"]
---

# Inicio de la docente — surface brief

Scope: `/` con contexto DOCENTE (`apps/web/src/app/page.tsx` → `apps/web/src/features/inicio/inicio-docente.tsx`, `apps/web/src/app/inicio.module.css`). Visitor mode: Operate.

Audience: docente titular generalista, preparando o dictando clase. Job: llegar al material de la clase de hoy en ≤3 clics. Constraints: se conserva la estructura actual (saludo, clase de ahora, mundos, franja de estado, friso del día) 🔶; sin oso, castillo, paisaje raster ni Twemoji.

## Direction contract

THESIS: La misma estructura de trabajo, vestida con la identidad del escudo. Rechaza tanto el escenario infantil anterior como convertir el inicio adulto en un juego: es una herramienta, con el mismo material sticker en dosis sobria.

OWN-WORLD: Tokens, tipografía (Baloo 2 en títulos, Atkinson Hyperlegible Next en cuerpo) y controles sticker del mundo «Mis materias». Las planchas del friso toman la familia de color de cada materia; el fondo es claro, con el azul noche solo en el encabezado.

STORY: La docente ve qué clase dicta ahora, qué sigue y cuál no tiene material, y entra a la clase con un toque.

FIRST VIEWPORT: Saludo y clase de ahora con su acción principal «Abrir la clase»; debajo, los mundos y el friso del día envolvente, sin scroll horizontal.

FORM: Extensión del mundo «Mis materias» (seed 493bfde9); sin ronda propia.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
