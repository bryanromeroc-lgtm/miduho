# Inc. 2 · Guías de materia en actividades

## Estado y alcance

**Propuesto, listo para implementación.** Cambio OpenSpec [`guias-en-actividades-por-materia`](../../openspec/changes/guias-en-actividades-por-materia/proposal.md); el [diseño](../../openspec/changes/guias-en-actividades-por-materia/design.md), las seis especificaciones y las [tareas](../../openspec/changes/guias-en-actividades-por-materia/tasks.md) constituyen la fuente de verdad. No se ha implementado este cambio.

**Observado en la auditoría local:** 77 actividades curriculares y un material audiovisual docente ficticio. En las tarjetas, solo «La entrega de Armi» muestra la guía correcta; 76 tarjetas curriculares y la docente no cumplen. Dentro de las actividades, 16 juegos de Matemáticas muestran correctamente a Armi, 59 juegos curriculares carecen de la guía esperada, dos usan a Armi en una materia ajena y el material docente carece de Bruno. Educación Religiosa aún no tiene guía asignada. La base de demostración no representa necesariamente otros entornos 🔶.

## Criterios y archivos esperados

La identidad de la guía se resuelve por asignatura y se conserva en tarjeta, actividad y resultado. Se sustituyen Armi por Andi en mapa y por Bruno en ruta de palabras, incluida portada, escena y texto. Educación Religiosa recibe una guía original propia cuya identidad editorial final está pendiente 🔶. Las actividades nuevas sin guía se rechazan antes de publicarse. No cambian notas, intentos ni permisos.

Archivos previstos: `src/lib/guias.ts`, `src/lib/escenas.ts`, `src/features/materias/vista/`, `src/features/actividades/reproductor/`, `src/features/actividades/asignadas/`, `src/features/actividades/juegos/{mapa,ruta-palabras}/`, `src/server/modules/{curriculo,actividades}/`, `curriculo/actividades/` y recursos en `public/images/`.

**Verificación al implementar:** `npm run lint`, `npm run build`, `npm test`, inventario curricular completo y navegador real a 1440, 390 y 360 px con teclado, contraste y movimiento reducido. Registrar evidencia y defectos pendientes aquí antes de cerrar la tarjeta.
