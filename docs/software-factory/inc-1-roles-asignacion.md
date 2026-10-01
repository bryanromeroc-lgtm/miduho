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

## Corrección de alcance D-01

Tarjeta `t_e7cc1239`: el `GET /api/asignaciones-docente` fuerza el identificador del usuario de sesión cuando la cuenta solo tiene rol `DOCENTE`, incluso si intenta consultar otro `docenteId`. `ADMIN` y `COORDINACION` conservan el listado completo y el filtro explícito. La regla de alcance está aislada como función pura y cubierta por pruebas negativas.

Verificación de la corrección:

- `npm run test`: 20/20 pruebas aprobadas (incluye intento de consultar un `docenteId` ajeno y preservación del alcance administrativo).
- `npm run lint`: 0 errores; conserva 1 advertencia preexistente en `scripts/qa-fixtures.ts`.
- `npm run build`: compilación de producción correcta; `/api/asignaciones-docente` se mantiene como ruta dinámica.
