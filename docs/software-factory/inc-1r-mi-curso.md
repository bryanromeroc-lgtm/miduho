# Inc. 1R · Mi curso del DOCENTE

Estado: implementado por `t_d0705068`, pendiente de integración (`t_6c35cb94`) y E2E del incremento (`t_4fb71c5e`).

Fuente: [requerimiento aprobado](inc-1r-requerimiento-aprobado.md) §2.2, §3 (matriz), §4.3 y gates 10–11 y 13.

## Alcance

- `/mi-curso` (DOCENTE, o DOCENTE+ADMIN en contexto DOCENTE): tarjetas con los grupos del año ACTIVO donde el docente tiene al menos una asignación ACTIVA. Cada tarjeta muestra el grupo, el año, el número de estudiantes con asociación vigente, las asignaturas del docente en ese grupo (con su área) y sus bloques de horario ordenados por día y hora. Estado vacío cuando no hay asignaciones.
- `/mi-curso/[grupoId]`: asignaturas y horario del docente en el grupo, y la tabla de estudiantes con asociación vigente: nombre completo, correo y estado (Activo, Inactivo, Pendiente). Orden por apellidos.
- Restablecimiento: casilla por estudiante y «seleccionar todos los activos». Confirmación modal, `POST /api/usuarios/estudiantes/restablecer-contrasenas` (INC1R-03) y panel de una sola descarga del CSV `correo,contrasena`. Al descargar, el contenido se descarta de la memoria del navegador; mientras no se haya descargado, salir de la página pide confirmación. La contraseña nunca se muestra en pantalla.
- Fuera de alcance (no incluido): perfil académico, calificaciones, entregas, observaciones y cualquier edición de identidad, correo, rol, estado o grupo.

## Aislamiento y anti-enumeración

- Página: `exigirRolPagina(["DOCENTE"])` además de `proxy.ts` (familia `MI_CURSO`). ESTUDIANTE y ADMIN puro van a `/cuenta?sinPermiso=1`.
- `servicioMiCurso.obtenerGrupo(docenteId, grupoId)` filtra por `docenteId`, asignación `ACTIVA`, año de la asignación `ACTIVO` **y año del grupo `ACTIVO`** antes de leer estudiantes. Un id inexistente, de otro docente, con asignación INACTIVA, de un año CERRADO o con una asignación cruzada (año activo → grupo de año cerrado) produce el mismo `NO_ENCONTRADO` (404) y la misma página `not-found` («Este grupo no existe o no tienes una asignación activa en él»). No se consulta la lista de estudiantes si no hay autorización.
- Corrección de revisión (t_6c35cb94, §8): el servicio administrativo impide crear asignaciones cruzadas, pero la BD no lo restringe. Por eso Mi curso, el chip de grupos del shell (`src/server/shell.ts`) y la autorización de restablecimiento del DOCENTE (`src/server/auth/cuentas.ts`) exigen además que el grupo/asignación sean del año ACTIVO. Con un único año ACTIVO eso garantiza que el año del grupo y el de la asignación coinciden.
- El restablecimiento revalida en servidor: un DOCENTE solo puede restablecer estudiantes con asociación vigente en un grupo donde tiene asignación ACTIVA o es director (INC1R-03, todo o nada, mismo 403 para inexistente y ajeno). Las cuentas no activas se muestran pero su casilla queda deshabilitada (el servicio responde `ESTUDIANTE_INACTIVO`).
- No se añadieron APIs de lectura: los datos se cargan en Server Components, de modo que no hay un endpoint nuevo que enumerar.

🔶 Diferencia por confirmar: el servicio de restablecimiento (INC1R-03) también autoriza al **director de grupo** sin asignación activa, mientras que Mi curso solo lista grupos con asignación ACTIVA (§2.2). Un director sin asignación no ve el grupo en Mi curso, aunque la API le permitiría restablecer. Se dejó sin cambiar porque INC1R-03 está aprobado; decidir en revisión si el director debe ver el grupo.

## Archivos

- `src/server/modules/mi-curso/{servicio,index}.ts` — consultas acotadas al docente.
- `src/server/modules/mi-curso/mi-curso.test.ts` — 8 pruebas (SQLite temporal con migraciones reales), incluida la asignación cruzada.
- `src/app/mi-curso/page.tsx`, `src/app/mi-curso/horario.tsx`.
- `src/app/mi-curso/[grupoId]/{page,estudiantes,not-found}.tsx`.
- `src/app/shell.css` — sección «Mi curso del DOCENTE (INC1R-10)» al final.

## Verificación

- `npm test`: 126/126 (12 archivos; 7 nuevas). Tras la corrección de revisión: **128/128** (prueba cruzada en `mi-curso.test.ts` y en `cuentas.test.ts`; ambas fallan sin la corrección y pasan con ella).
- `npm run lint`: 0 problemas. `npm run build`: OK (incluye `/mi-curso` y `/mi-curso/[grupoId]`).
- Smoke en `next start` (BD temporal migrada desde vacío + seed ficticio + escenario ficticio con un segundo docente, un grupo ajeno y un estudiante inactivo), Chromium 1366×900 y 390×844: **61/61 PASS** (repetido tras la corrección: 61/61). Cubre redirecciones sin sesión/ESTUDIANTE/ADMIN puro, solo grupos asignados, horario, conteo, tabla, 404 idéntico para grupo ajeno e inexistente, 403 de la API para estudiante ajeno, restablecimiento múltiple con descarga única (CSV con 2 filas, panel desaparece), contraseña anterior rechazada y nueva aceptada, seleccionar todos en móvil y ausencia de desbordamiento horizontal. Script y capturas fuera del repositorio, en el workspace de la tarjeta (`e2e/`).
