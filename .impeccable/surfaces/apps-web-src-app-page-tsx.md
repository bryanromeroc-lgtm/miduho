---
version: 1
slug: "apps-web-src-app-page-tsx"
primary_target: "apps/web/src/app/page.tsx"
related_targets: ["apps/web/src/features/materias/mis-materias.tsx","apps/web/src/features/materias/cromo.tsx","apps/web/src/features/materias/escenas"]
---

# Inicio del estudiante «Mis materias» — surface brief

Scope: `/` con contexto ESTUDIANTE (`apps/web/src/app/page.tsx` → `features/materias/mis-materias.tsx`, `cromo.tsx`, `escenas/`). Visitor mode: Operate (el niño elige su materia y entra con un toque), con el registro expresivo de un álbum en modo juego.

Audience: estudiante de 6 a 10 años, lector emergente, en tableta compartida o computador del colegio. Job: ver sus materias y entrar a la que toca. Content: asignaturas reales del grupo (`ResumenMateria`); estrellas, avance, «Sigue con», «¡Nuevo!» y «en preparación» solo cuando su fuente exista. Constraints: una pantalla sin scroll desde 900×640; WCAG AA; nada de cifras de ejemplo; Laboratorios intocable; avatares provisionales.

Approved reference: maqueta v11 del 2026-10-31 (`openspec/changes/rediseno-identidad-juvenil/referencia/maqueta-mis-materias.dc.html`). Es ley de composición y comportamiento; sus datos de ejemplo no se trasladan.

## Direction contract

THESIS: El inicio es un álbum de cromos que el niño colecciona, no un panel de tarjetas. Rechaza la rejilla de tarjetas blancas con icono y barra de progreso, y rechaza el friso de horario del adulto: aquí manda lo que es suyo.

OWN-WORLD: Fondo azul noche `#0a2350` como mesa; tablero enmarcado (contorno tinta `#1b2440`, filo blanco, sombra sólida desplazada) sobre una sabana lavada de cielo pálido, sol tenue y colinas de baja saturación. Cromos sticker: marco con bisel en la familia de la materia (`marco`, `cinta`, `cielo`, `rayo`, `suelo`, derivadas del escudo), ventana con rayos, personaje que sobresale, placa Baloo 2 blanca con contorno de tinta de 5 px, botón redondo de jugar amarillo `#ffc21a`. Cuerpo en Atkinson Hyperlegible Next.

STORY: El niño ve sus materias en un vistazo, reconoce cada una por su escena, ve dónde está su avatar, toca un cromo para verlo en el panel y entra con el botón de jugar o con «Entrar a {asignatura}».

FIRST VIEWPORT: Encabezado de una línea: escudo en círculo + wordmark MIDUHO letra por letra en colores del escudo, menú de botones sticker (Mis materias, Biblioteca, Laboratorios, Agenda), «mis estrellas» (solo con datos), grupo y período, ayuda. Debajo, a la izquierda, el tablero con «Mis materias» centrado y la cuadrícula 5×2 (`minmax(0,1fr)`, `row-gap` que acomoda al personaje). A la derecha, el panel: «Mi explorador» con 4 avatares y la materia elegida con su botón grande «Entrar a {asignatura}». Acción primaria: el botón de jugar de cada cromo.

FORM: «Álbum de láminas» (IMPECCABLE’S PICK de la ronda de dirección), llevado a tablero de cromos en modo juego e iterado hasta la maqueta v11 aprobada. Seed key: 493bfde9. Build path: code-led (no hay generación de imágenes).

SIGNATURE INTERACTION: el avatar salta en curva con rebote (≤650 ms, `cubic-bezier(.5,-.35,.3,1.35)`) hasta la esquina superior del cromo elegido y flota en reposo. Al pasar el puntero, los rayos giran y el personaje sube. Bucles permitidos: flotar, destello del cromo dominado, latido de «¡Nuevo!». Con movimiento reducido: posición instantánea, sin bucles.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisiones de construcción

- El botón de ayuda «?» de la maqueta se retiró: no existe destino de ayuda y un control sin destino no se publica. Vuelve cuando exista la ayuda 🔶.
- El menú de la cuenta (cerrar sesión) reemplaza el espacio libre a la derecha: es necesidad del producto.
- Sin datos, el panel no muestra cifras ni rótulo de área; el botón «Entrar a…» queda bajo la descripción.

## Unresolved

- 🔶 Paginación con más de 10 asignaturas.
- 🔶 Móvil: 2 columnas, luego 1, con hoja inferior.
- 🔶 Umbrales de estrellas (SIEE) y definición de «¡Nuevo!».
