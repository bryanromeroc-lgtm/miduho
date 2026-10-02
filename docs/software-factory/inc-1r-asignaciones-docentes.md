# Inc. 1R · Asignaciones docentes y horarios

Estado: implementado por `t_89e7d927`, pendiente de integración y QA independiente.

## Alcance

El panel ADMIN `/admin/asignaciones` permite buscar, filtrar y paginar asignaciones; crear una carga con docente, asignatura, grupo, año y múltiples bloques; desactivar o reactivar; y reasignar con confirmación. La reasignación desactiva el registro anterior, crea uno nuevo y conserva el historial.

## Reglas aplicadas en servidor

- docente ACTIVO con rol DOCENTE;
- grupo perteneciente al año seleccionado;
- asignatura habilitada mediante `AsignaturaGrado` para el grado del grupo;
- año cerrado inmutable;
- bloque válido `HH:mm`, con inicio anterior al fin y sin cruces internos;
- ausencia de cruces en asignaciones activas del docente y del grupo;
- reactivación sujeta nuevamente a todas las validaciones y conflictos.

Los cruces usan intervalos semiabiertos: un bloque que termina a las 09:00 no cruza con otro que inicia a las 09:00.

## API ADMIN

- `POST /api/asignaciones-docente`: crea con `bloques[]`.
- `DELETE /api/asignaciones-docente/:id`: desactiva sin borrar historial.
- `PATCH /api/asignaciones-docente/:id` con `REACTIVAR` o `REASIGNAR`.
- `GET /api/asignaciones-docente`: búsqueda, filtros, estado y paginación; DOCENTE conserva alcance horizontal a su propia cuenta.

## Verificación

La prueba de integración usa SQLite temporal y migraciones reales. Cubre asignatura–grado, cruces de docente y grupo, reasignación, historial, reactivación, confirmación y año cerrado. Los gates finales se registran en el handoff de la tarjeta.
