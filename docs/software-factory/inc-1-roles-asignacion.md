# Inc. 1 · Roles y asignación docente

Estado: Implementado en la tarjeta `t_51ab8447`.

## Alcance confirmado

- Los cinco roles fijos son `ADMIN`, `COORDINACION`, `DOCENTE`, `ESTUDIANTE` y `ACUDIENTE`.
- `AsignacionDocente` es única por docente, asignatura, grupo y año lectivo; su estado permite desactivar sin borrar.
- `AcudienteEstudiante` exige roles compatibles y conserva el indicador verificable `verificado`.
- Matrícula, EstadoMatricula, importación CSV y exportación SIMAT no hacen parte de esta entrega.
- Seed y fixtures solo contienen estructura demo y cuentas ficticias; no hay datos reales de menores.

## Implementación

- Prisma: `AsignacionDocente`, `AcudienteEstudiante` y relaciones de acceso.
- Servicio académico: validación de docente activo, referencias académicas, año cerrado y vínculo de roles.
- API: `/api/asignaciones-docente` y `/api/acudientes-estudiantes` con autorización central y protección de origen.
- Migración: `20261001064331_roles_asignacion_docente`.

## Verificación

- `npm run lint`: OK.
- `npm run build`: OK; las cuatro rutas nuevas fueron compiladas.
- `prisma migrate dev --name roles_asignacion_docente`: OK.

🔶 Pendiente: pruebas de integración HTTP autenticadas y revisión QA independiente.
