# Inc. 1R · Estructura académica

**Estado:** Implementado para revisión (`t_72f1c86c`; búsqueda, filtros y paginación en `t_ff5853f4`).  
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

## Búsqueda, filtros y paginación (`t_ff5853f4`, INC1R-07F)

Corrección bloqueante del gate `t_8c45b256`. La página dejó de cargar `{ page: 1, pageSize: 100 }` fijo y sigue el patrón SSR accesible de `/admin/usuarios`.

- **Estado en la URL, por listado.** Cada listado usa parámetros con prefijo propio, validados con Zod en el servidor (`src/app/admin/estructura/consulta.ts`): `anios-q`, `periodos-q`, `periodos-anio`, `areas-q`, `grados-q`, `grupos-q`, `grupos-anio`, `grupos-grado`, `asignaturas-q`, `asignaturas-area`, `asignaturas-grado` y `<listado>-page`. `pageSize` queda en 20 (default del esquema). Los formularios de filtro son `GET` y llevan en campos ocultos el estado de los demás listados, así que filtrar o paginar uno no pierde los filtros de los otros.
- **Búsqueda (`q`) en servicio y API.** `GET /api/{anios-lectivos,periodos,areas,grados,grupos,asignaturas}` aplican `q` (antes se aceptaba y se ignoraba):
  - años: número exacto de año (`filtroAnios`, 2000–2100);
  - períodos, áreas y grados: nombre;
  - grupos: grado o identificador por palabra (`1° 01` o `1°-01`);
  - asignaturas: nombre de la asignatura o de su área.
  Cada palabra (máx. 5) debe coincidir; el `total` usa el mismo `where` que la página.
- **Filtros de relación ya admitidos:** períodos por año; grupos por año y grado; asignaturas por área y grado. Los `select` muestran año (con "(cerrado)"), nombre del grado y nombre del área desde `servicioAcademico.opciones()`, que también alimenta los formularios de alta (catálogo completo, independiente de la página). Los directores salen de los docentes activos, con el mismo criterio de `validarDirector`.
- **Entradas inválidas.** Página no numérica o < 1, año mal escrito, búsqueda > 120 caracteres o un ID que no está entre las opciones muestran `role="alert"` dentro del listado afectado y ese listado vuelve a página 1 sin filtros. Los demás listados conservan su estado. Un parámetro vacío equivale a "sin filtro" (también en la API).
- **Accesibilidad.** Cada listado tiene `form role="search"` con `aria-label` propio, etiquetas visibles y ayuda enlazada con `aria-describedby`, un contador `role="status"` (`desde–hasta de total`, "Sin resultados" o "Página N sin resultados · T en total"), un estado vacío diferenciado (sin datos, sin coincidencias con enlace para limpiar, o página fuera de rango con enlace a la primera página) y `nav aria-label="Paginación de <listado>"` con Anterior/Siguiente (`rel="prev"`/`rel="next"`, nombre accesible con el listado). Los enlaces llevan ancla `#estructura-<listado>` para volver a la sección.
- Sin cambios en el CRUD, el control ADMIN (`exigirRolPagina` y `requerirRol`) ni las reglas de cierre, inmutabilidad y borrado.

## Verificación

Ejecutado en el worktree de la tarjeta `t_72f1c86c`:

- `npm test` — 96 pruebas aprobadas en 9 archivos.
- `npm run lint` — sin errores.
- `npm run build` — compilación correcta; confirma `/admin/estructura` y todas las rutas API académicas, incluidas `/api/areas`.

Ejecutado para `t_ff5853f4` (rama `frontend/t_ff5853f4-estructura-busqueda`, sobre `1cff048`):

- `npm test` — 104 pruebas aprobadas en 10 archivos. Nuevas: esquemas de filtros (vacío = sin filtro, página/año/búsqueda inválidos), búsqueda y filtros combinados del servicio contra SQLite temporal (años, períodos, áreas, grados, grupos, asignaturas, totales y paginación) y `consulta.test.ts` (lectura de la URL, error y caída al filtro seguro por listado, ID ajeno, enlaces que conservan filtros, rango).
- `npm run lint` — sin errores.
- `npm run build` — compilación correcta.
- Smoke SSR con `next start` sobre una base SQLite temporal con el seed ficticio y sesión ADMIN ficticia (curl, sin navegador disponible):
  - sin sesión, `/admin/estructura` redirige a `/login?desde=%2Fadmin%2Festructura`;
  - contadores iniciales `1–1 de 1`, `1–4 de 4`, `1–3 de 3`, `1–5 de 5`, `1–1 de 1` y `1–3 de 3`;
  - los selects muestran `2026`, `1°…5°` y los nombres de área, no IDs;
  - `grupos-q=1° 01` devuelve 1; `grupos-q=zzz` muestra el estado vacío con "Ver todos los grupos";
  - `periodos-page=abc`, `anios-q=veinte` y `asignaturas-grado=no-existe` muestran su aviso y vuelven al filtro seguro;
  - `areas-page=99` y `grupos-page=2` muestran "Página N sin resultados" con enlace a la primera página;
  - con 22 áreas ficticias creadas por API: `1–20 de 25` con Siguiente → `?areas-page=2`; `areas-q=prueba&areas-page=2&grupos-q=01` muestra `21–22 de 22` y Anterior → `?grupos-q=01&areas-q=prueba` (conserva ambos filtros);
  - API: `/api/areas?q=prueba&page=2` → `total 22`; `/api/anios-lectivos?q=abc` → `DATOS_INVALIDOS`. Las áreas de prueba se borraron después (204).

🔶 La exploración automatizada de navegador en escritorio y móvil (foco visible y diseño responsive de los nuevos filtros) queda a cargo del gate E2E `t_4fb71c5e`.
