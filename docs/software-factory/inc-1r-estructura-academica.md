# Inc. 1R · Estructura académica

**Estado:** Implementado para revisión (`t_72f1c86c`).  
**Alcance confirmado:** requerimiento aprobado §7 y §11.

## Entrega

- Panel protegido para `ADMIN` en `/admin/estructura` que lista y permite crear y borrar físicamente registros de años, períodos, áreas, grados, grupos y asignaturas; la eliminación abre una confirmación accesible.
- APIs paginadas protegidas por rol para las seis entidades, incluidas rutas de detalle `GET`, `PATCH` y `DELETE`; se añadió `GET/POST/PATCH/DELETE /api/areas`.
- El servicio de dominio exige un único año activo, períodos dentro del año sin solape, director `DOCENTE` activo y bloqueo de inmutabilidad en años cerrados.
- Cerrar un año ahora exige al menos un período y una ponderación exactamente igual a 100 %. El borrado físico se bloquea si existen relaciones o historial.

## Decisiones

- Crear directamente un año `CERRADO` se rechaza: el cierre es una transición que valida los períodos configurados.
- La eliminación se limita a registros sin relaciones: un año con períodos/grupos/asignaciones/asociaciones, un grado con grupos/asignaturas, un área con asignaturas, un grupo con asignaciones/asociaciones o una asignatura con grados/asignaciones devuelve `REGISTRO_UTILIZADO`.
- Los datos del panel son los datos ficticios existentes del seed; no se añadieron identidades ni datos personales reales.

## Verificación

Ejecutado en el worktree de la tarjeta:

- `npm test` — 96 pruebas aprobadas en 9 archivos.
- `npm run lint` — sin errores.
- `npm run build` — compilación correcta; confirma `/admin/estructura` y todas las rutas API académicas, incluidas `/api/areas`.

🔶 La exploración automatizada de navegador en escritorio y móvil queda a cargo del gate E2E `t_4fb71c5e`.
