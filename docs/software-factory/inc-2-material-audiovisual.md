# Inc. 2 · Material audiovisual

## Alcance y fuente

Cambio OpenSpec [`material-audiovisual`](../../openspec/changes/material-audiovisual/proposal.md), esquema `spec-driven`. Criterios de aceptación en sus cuatro specs y tareas en [`tasks.md`](../../openspec/changes/material-audiovisual/tasks.md). El alcance incluye el núcleo de actividades, videos de YouTube con preguntas, asignación y calificación, pantallas docentes y estudiantiles, seguimiento y accesibilidad WCAG 2.1 AA. No se agregan datos personales de menores.

## Archivos esperados

`apps/web/prisma/schema.prisma` y dos migraciones; `src/features/actividades/tipos/`; `src/server/modules/actividades/`; rutas delgadas bajo `src/app/api/actividades/`; páginas de `clases` y `materias`; pruebas junto a la lógica y en `tests/integracion/`; `docs/operacion.md`.

## Dirección de interfaz docente

Se aplicó la skill `impeccable` en modo **Operate**. La docente llega con una asignación concreta y necesita entrar al material, crearlo o revisar respuestas. Se conserva el friso como estructura visual, usando solo asignatura y grupo reales; no se muestran horas, contenidos ni cifras de la maqueta. La clase abierta da prioridad a Actividades y deja las otras secciones señaladas como demostración 🔶. El formulario y el seguimiento deben mantener controles habituales, etiquetas claras, errores vinculados y foco visible, incluso a 360 px.

## Verificación

`npm run build` y `npm run lint` pasaron; `npm test` pasó con 918 pruebas en 89 archivos. La prueba de punta a punta en `apps/web/scripts/verificar-material-audiovisual.mjs` pasó con la base desechable de `scripts/capturas/preparar.sh`: la docente publicó para dos grupos, el estudiante encontró la actividad en su materia, marcó «Ya lo vi», respondió y recibió 100 %, y la docente vio la nota en seguimiento.

La auditoría local usó `axe-core` con el Playwright ya instalado en el proyecto, como adaptador alternativo a la ruta Puppeteer de la skill `a11y-audit`. En ocho estados de las pantallas nuevas a 360 px no quedaron reglas WCAG 2.1 A/AA detectadas por axe ni desbordamiento de página. Se verificó con Tab que la tabla desplazable de seguimiento se alcanza y tiene foco visible. Estas comprobaciones automatizadas no sustituyen una revisión con lector de pantalla y dispositivos reales 🔶.

## Decisión de duplicados (aclarada por el responsable)

Se permiten varios materiales con el mismo video y materiales parecidos. Solo se rechaza con `409` el envío idéntico del formulario, definido por autora, título, indicaciones, id e intervalo del video, preguntas, asignatura, grado, grupos, fechas explícitas e intentos. Una huella única en `Actividad` hace cumplir esta regla incluso ante dos solicitudes simultáneas. El índice parcial de asignación por versión y grupo conserva su propósito específico.
