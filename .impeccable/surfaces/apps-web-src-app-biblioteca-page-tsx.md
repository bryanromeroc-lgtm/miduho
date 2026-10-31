---
version: 1
slug: "apps-web-src-app-biblioteca-page-tsx"
primary_target: "apps/web/src/app/biblioteca/page.tsx"
related_targets: ["apps/web/src/features/biblioteca/components"]
---

# Biblioteca — surface brief

Scope: `/biblioteca` (`apps/web/src/app/biblioteca/**`, `apps/web/src/features/biblioteca/components/*`) y su lector. Visitor mode: Operate (buscar, filtrar, abrir un título). Reemplaza al brief anterior `src/app/biblioteca/page.tsx` (mundo «Friso de Aula»): se conservan estructura y comportamiento, cambia el mundo.

Audience: estudiante y docente. Job: encontrar un título por nombre o autor, o recorrer el catálogo por tipo, edad e idioma, y abrir los libros digitalizados. Constraints: paginado en servidor, texto real, WCAG AA; la pastilla de tipo solo cuando el tipo no es «Libro».

## Direction contract

THESIS: La Biblioteca sigue siendo un lugar con estantes y no una lista; ahora es un rincón del mismo álbum. Rechaza la rejilla de tarjetas beige y la plancha pesada de filtros.

OWN-WORLD: Encabezado azul noche compartido; hero enmarcado como el tablero (contorno de tinta, filo blanco, sombra sólida) sobre la sabana lavada, en la familia de Lectura. Estantes con raíl sticker; libros de pie con lomo, canto y cubierta; cubiertas compuestas con las rampas del escudo. Filtros como botones sticker de 44 px.

STORY: El visitante ve de inmediato los libros que puede abrir hoy en la «Mesa de lectura», busca desde el hero y recorre los estantes filtrando; cada obra muestra su recurso hermano (guía o audio) de forma explícita.

FIRST VIEWPORT: Hero con «Biblioteca», número de títulos e idiomas y el campo de búsqueda de 52 px como acción primaria; escena SVG propia a la derecha. La «Mesa de lectura» se posa en el borde inferior; debajo, cinta de filtros y estantes (12 por página).

FORM: Extensión del mundo «Mis materias» (seed 493bfde9) sobre la estructura de estantes del brief anterior.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
