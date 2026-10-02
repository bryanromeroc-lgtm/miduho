# Inc. 1R · Asociación estudiante–grupo

Estado: implementado por `t_620c8df1`, pendiente de integración y QA independiente.

## Alcance

El panel ADMIN `/admin/estudiantes` lista estudiantes del año seleccionado (por defecto, el año activo) con su grupo activo y el historial de asociaciones de ese año. Permite asignar un grupo a quien no tiene y trasladar a quien ya tiene, con confirmación. Incluye búsqueda por nombre o correo, filtros (año, grupo, situación con/sin grupo, estado de la cuenta), paginación de 20, estados vacíos y errores visibles. El enlace aparece en la navegación ADMIN y en el dashboard.

## Reglas (servidor)

- una sola asociación activa por estudiante y año: servicio + índice único parcial `finEn IS NULL` (INC1R-01);
- traslado: exige `confirmarTraslado`; cierra la asociación anterior (`finEn`) y crea la nueva en la misma transacción; el historial se conserva;
- solo cuentas ESTUDIANTE activas; mismo grupo rechazado (`MISMO_GRUPO`);
- año cerrado: solo lectura (`ANIO_CERRADO`); la UI lo muestra como «Solo lectura»;
- acceso: página y APIs exigen ADMIN (401 sin sesión, 403 sin rol).

## API ADMIN

- `GET /api/asociaciones-estudiantes?q&anioLectivoId&grupoId&situacion=CON_GRUPO|SIN_GRUPO&estado&page&pageSize` — nuevo.
- `PUT /api/usuarios/:id/grupo` `{ grupoId, confirmarTraslado }` — reutilizado de INC1R-05 para asignar y trasladar.

## Verificación

Pruebas de integración en `src/server/modules/usuarios/usuarios.test.ts` (SQLite temporal, migraciones reales): listado con historial, filtros, paginación, año cerrado, año inexistente y unicidad activa en base. Smoke visual escritorio/móvil pendiente para QA 🔶.
