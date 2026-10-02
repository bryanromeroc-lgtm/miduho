# Inc. 1R · Estructura académica

**Estado:** Implementado para revisión (`t_72f1c86c`; búsqueda, filtros y paginación en `t_ff5853f4`; edición completa y cierre de años en `t_b0aaf4ff`).\
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

## Edición completa y cierre de años (`t_b0aaf4ff`, INC1R-07H)

Corrección bloqueante del gate `t_8c45b256`, sobre `f92818f`. Se conservan la búsqueda, los filtros y la paginación de INC1R-07F. Antes, el alta de años ofrecía `CERRADO` (el servicio lo rechazaba), no había ningún control que enviara `PATCH { estado: "CERRADO" }` y cada listado solo editaba un campo con `window.prompt`.

- **Contrato UI ↔ API** (`src/app/admin/estructura/edicion.ts`, puro): `cuerpoFormulario(tipo, FormData, modo)` arma el JSON del alta o la edición y `errorCuerpo` lo valida con los mismos esquemas `crear*`/`actualizar*` de la API antes de enviarlo. En edición solo envía lo que admite el esquema `.strict()`:
  - años: `fechaInicio` y `fechaFin`; el número del año no cambia y el estado solo cambia con el cierre;
  - períodos: `nombre`, `orden`, `ponderacion`, `fechaInicio` y `fechaFin` (el año queda fijo);
  - áreas: `nombre`, `tipo`, `idioma` y `orden` (si está vacío, se envía `null`);
  - grados: `nombre`, `nivel` y `orden`;
  - grupos: `identificador` y `directorId` (si está vacío, se envía `null`); el año y el grado quedan fijos. Un director sin cambios no se reenvía, así que conservar uno que ya no es docente activo no provoca `DIRECTOR_INVALIDO`;
  - asignaturas: `nombre`, `areaId`, `intensidadHoraria` y el conjunto completo de `grados`, con `intensidad` por grado; desmarcar un grado lo deshabilita (RN-09).
- **Alta de año alineada con la regla.** El formulario de alta ya no tiene campo de estado: muestra "Estado inicial: Activo" y nunca envía `estado`. Las altas de períodos y grupos solo ofrecen años activos (`aniosEditables`).
- **Cierre ACTIVO → CERRADO.** Cada año `ACTIVO` tiene la acción "Cerrar año", que abre una confirmación modal (`Confirmar`). Esa confirmación explica que el cierre es irreversible y que exige períodos al 100 %, y envía `PATCH /api/anios-lectivos/:id` con `CUERPO_CIERRE = { estado: "CERRADO" }`. Si falla (`CIERRE_REQUIERE_PERIODOS`, `PONDERACION_INCOMPLETA`), el mensaje del servicio aparece como `role="alert"` dentro del diálogo y este sigue abierto.
- **Edición completa.** "Editar" abre un `<dialog>` modal nativo con el formulario completo de la entidad, rellenado con los valores actuales. Ese diálogo atrapa el foco; Escape y Cancelar lo cierran y devuelven el foco al disparador. Las relaciones fijas se muestran como texto con su explicación. Los errores de esquema o de dominio (`PERIODO_SOLAPADO`, `PONDERACION_EXCEDIDA`, `PERIODO_FUERA_DE_ANIO`, `DIRECTOR_INVALIDO`, `ANIO_CERRADO`, `DUPLICADO`…) aparecen como `role="alert"` sin perder lo escrito. El diálogo amplio se desplaza en pantallas bajas y la intensidad por grado se apila en móvil.
- **Solo lectura por estado.** Un año `CERRADO`, y sus períodos y grupos, no ofrecen Editar, Cerrar ni Eliminar: muestran "Solo lectura (año cerrado)", tal como lo exige RN-52 en el servicio. El estado aparece como insignia legible (Activo/Cerrado), y el nivel del grado, el tipo del área y la intensidad se muestran con etiquetas.
- **Errores de alta por sección.** El error de un alta aparece debajo de su propio formulario, no al inicio de la página.
- Se mantienen la confirmación de borrado (ahora con el error dentro del diálogo), el control ADMIN y todas las reglas del servicio. No hubo cambios en el servicio, los esquemas ni las rutas API.

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

Ejecutado para `t_b0aaf4ff` (rama `frontend/t_b0aaf4ff-estructura-edicion`, sobre `f92818f`):

- `npm test` — 116 pruebas aprobadas en 11 archivos. Nuevas:
  - `edicion.test.ts`: cuerpos de alta y edición de las seis entidades contra sus esquemas; el alta de año nunca envía `estado`; el cuerpo de cierre es válido; el director sin cambios no se reenvía; desmarcar grados envía `[]`; mensajes de error. Además, un render SSR de `FormularioEstructura` con datos ficticios comprueba que el alta no ofrece `CERRADO`, que un año ACTIVO tiene Editar y Cerrar año, y que el año CERRADO, sus períodos y el alta de períodos no ofrecen acciones ni años cerrados.
  - `academico.test.ts`: el contrato del panel recorre FormData → `cuerpoFormulario` → esquema → servicio sobre SQLite temporal. Edita áreas, grados, años, períodos, grupos y asignaturas (con intensidad por grado); el cierre devuelve `PONDERACION_INCOMPLETA` al 90 % y luego cierra; tras cerrar, editar el año, un período o un grupo devuelve `ANIO_CERRADO`.
- `npm run lint` — sin errores.
- `npm run build` — compilación correcta.
- Smoke con `next start`, una base SQLite temporal con el seed ficticio y una sesión ADMIN ficticia (`scripts/smoke-estructura-edicion.sh`; curl, sin navegador disponible). La sesión se verificó con `/admin/estructura` → 200. Resultados:
  - sin sesión → 307 a `/login?desde=%2Fadmin%2Festructura`;
  - HTML del panel: aparece "Cerrar año" para 2026; el alta no tiene `name="estado"` ni `value="CERRADO"` y muestra "Estado inicial";
  - `POST` de un año `CERRADO` → `CIERRE_REQUIERE_PERIODOS`. `PATCH` de fechas del año → `ACTIVO 2026-01-19 a 2026-12-04`; un fin anterior a los períodos → `PERIODO_FUERA_DE_ANIO`;
  - período editado al 1 % → el cierre devuelve `PONDERACION_INCOMPLETA`; con el período restaurado al 25 %, el cierre → `CERRADO`;
  - edición completa de área (`ENFOQUE · en · 7`), grado (`PREESCOLAR · 91`), asignatura (`2 h · grados …=3`) y grupo (`S2 · director null`). Un director inválido → `DIRECTOR_INVALIDO`;
  - tras el cierre: `PATCH` de período → `ANIO_CERRADO`; reabrir → `ANIO_CERRADO`. El panel muestra 6 filas "Solo lectura (año cerrado)", 0 "Cerrar año" y la insignia Cerrado;
  - los registros de prueba se borraron (204).

🔶 La revisión en navegador de escritorio y móvil (diálogos de edición y cierre, foco, desplazamiento del diálogo amplio) queda a cargo del gate E2E `t_4fb71c5e`. En este servidor no hay Chrome.

🔶 La exploración automatizada de navegador en escritorio y móvil (foco visible y diseño responsive de los nuevos filtros) queda a cargo del gate E2E `t_4fb71c5e`.
