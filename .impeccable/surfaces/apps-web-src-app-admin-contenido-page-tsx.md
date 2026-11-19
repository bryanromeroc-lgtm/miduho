---
version: 1
slug: "apps-web-src-app-admin-contenido-page-tsx"
primary_target: "apps/web/src/app/admin/contenido/page.tsx"
related_targets: ["apps/web/src/features/contenido-coordinacion","apps/web/src/app/admin/contenido/[asignatura]/[grado]/page.tsx"]
---

# Contenido pedagógico de la coordinadora — surface brief

Scope: `/admin/contenido` (índice por área), `/admin/contenido/[asignatura]/[grado]` (vista previa de la materia) y `.../actividades/[id]` (actividad en vista previa). Componentes en `apps/web/src/features/contenido-coordinacion/`; la vista previa reutiliza `features/materias/vista/` y `features/actividades/reproductor/` con `modo` vista previa. Cambio `vista-admin-contenido`.

Visitor mode: **Operate** en el índice (la coordinadora escanea qué hay y qué falta, y entra a una materia); la vista previa hereda el registro lúdico de la vista del estudiante (es literalmente lo que ve el niño).

Audience: la coordinadora del colegio (rol `ADMIN`, DC-09), adulta, en computador. Job: saber qué contenido tiene cada asignatura en cada grado, ver vacíos de un vistazo y comprobar cómo lo recibe el estudiante. Solo lectura.

## Direction contract

THESIS: El índice es un mapa de cobertura honesto: una matriz por área donde se lee al instante qué grado tiene material, cuál está vacío y cuál no aplica. Rechaza las cifras de ejemplo, los tableros de KPI y las tarjetas decorativas que esconden los vacíos.

OWN-WORLD: hereda la hoja del contexto ADMIN (`MarcoJuego variante="hoja"`, tokens `--dia-*`, Baloo 2 + Atkinson Hyperlegible Next). La vista previa hereda el mundo plano de cada materia (`--m-*`), sin cambiarlo.

FIRST VIEWPORT (índice): `Cabecera` del marco («Contenido pedagógico», nota de solo consulta y fuente del conteo 🔶 catálogo en git). Debajo, una sección por área con su matriz: fila por asignatura (`th scope="row"`), columna por cada grado del colegio (`th scope="col"`), `caption` con el nombre del área.

Tres estados de celda, distinguidos por palabra (no solo por color), contraste ≥ 4.5:1:
- **Con contenido** — «N actividades»: enlace en pastilla `--dia-azul` sobre papel, nombre accesible «Asignatura, Grado: N actividades».
- **Sin contenido** — «Sin contenido»: enlace (lleva al estado vacío de la vista previa), contorno punteado, texto `--dia-suave`, nombre accesible «Asignatura, Grado: sin contenido».
- **No se dicta** — «No se dicta»: texto plano, no enlace, `--dia-suave` en cursiva sobre tinte; nunca parece activable.

Responsive: la tabla nunca rompe en tarjetas (contra el patrón `.admin-tabla` ≤ 640px); se desplaza dentro de su contenedor `role="region"` con `tabindex="0"` y `aria-label`, con la columna de asignatura fija (`position: sticky`). Sin scroll horizontal de la página a 375 px.

VISTA PREVIA: misma composición que `/materias/[asignatura]`. Franja visible en el encabezado «Vista previa · {grado}» (texto real, pastilla `banda` con tinta, ≥ 4.5:1), «Volver a Contenido» en lugar de «Volver a Mis materias», sin aviso de primera visita. Tarjetas «Para jugar» sin estrellas, intentos ni fechas (la línea de intentos dice solo el tipo de juego). Estado vacío: «Aún no hay actividades para {grado}». Reproductor: aviso «Vista previa: este resultado no se guarda» y vuelta a la vista previa de la materia.

## Constraints

- Ningún dato de estudiantes, docentes ni resultados. Ninguna acción de escritura.
- Cifras reales del catálogo; jamás estimadas.
- WCAG 2.1 AA; foco `3px solid` visible; teclado completo.
- La vista del estudiante no cambia: el modo por defecto es `estudiante`.

## Unresolved

- 🔶 El conteo sale del catálogo en git (`curriculo/actividades/`) hasta que `actividades-en-clase` lo lleve a la base.
- 🔶 ¿Enlazar Robótica/Emprendimiento con su mundo en Laboratorios? (design, Open Questions).
