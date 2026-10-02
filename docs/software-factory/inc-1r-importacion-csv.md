# Inc. 1R · Importación de usuarios por CSV (INC1R-06)

Tarjeta: `t_9cc15d95`. Requerimiento: `inc-1r-requerimiento-aprobado.md` §9 y §4.2–4.3.

## Qué hace

Pantalla ADMIN `/admin/usuarios/importar` (enlace «Importar CSV» en `/admin/usuarios`):

1. Elegir tipo (estudiantes o docentes) y descargar su plantilla.
2. Adjuntar el CSV → **vista previa** fila por fila (se creará / ya existe · se omite / con error y motivos).
3. Si no hay errores y hay al menos una cuenta nueva → confirmar → se crean todas y se descarga el CSV `correo,contrasena`.

## APIs (solo ADMIN, mutaciones con verificación de Origin)

| Ruta | Respuesta |
|---|---|
| `GET /api/usuarios/importar/plantilla?tipo=estudiantes\|docentes` | CSV solo con encabezados exactos |
| `POST /api/usuarios/importar/vista-previa {tipo, contenido}` | `Revision` JSON; no escribe |
| `POST /api/usuarios/importar {tipo, contenido}` | 201 `text/csv` de credenciales (`X-Total-Creadas`, `X-Total-Omitidas`); 422 `IMPORTACION_INVALIDA` + `revision`; 409 `SIN_CUENTAS_NUEVAS` o `CORREO_DUPLICADO` (carrera) |

## Reglas implementadas

- Encabezados exactos: `nombres,apellidos,correo,año,grado,grupo` y `nombres,apellidos,correo` (mayúsculas/espacios tolerados; BOM y separador `;` aceptados).
- Máximo 500 filas de datos y 512 KB.
- Validación completa antes de escribir; errores por fila con número de línea: campos vacíos, correo inválido, correo repetido en el archivo, año no numérico, grupo inexistente, año CERRADO.
- Grupo por referencia legible (año + nombre de grado + identificador, p. ej. `2026,2°,01`), nunca IDs; el reporte no expone IDs.
- Correos con cuenta existente: se omiten sin bloquear y se reportan.
- Todo o nada: con cualquier error no se crea ninguna cuenta; la escritura es una sola transacción.
- El tipo fija el rol: DOCENTE (ACTIVO, `debeCambiarContrasena`) o ESTUDIANTE (ACTIVO, asociado al grupo). No existe columna de rol: el CSV nunca crea ADMIN.
- Contraseñas generadas con los generadores de INC1R-03; en BD solo el hash bcrypt.

## Entrega única de contraseñas

El texto plano solo existe en la respuesta del `POST /api/usuarios/importar` (`Cache-Control: no-store`); el cliente lo descarga y no lo guarda. Verificado: ningún `GET` de `src/app/api` devuelve contraseñas (el único GET con CSV es la plantilla sin datos). Reimportar el mismo archivo omite los correos y no reentrega contraseñas. Si se pierden, se usa el restablecimiento (§4.3).

## Verificación

- `src/server/modules/importacion/importacion.test.ts`: 9 pruebas (parser, plantillas, encabezados/rol, vacío, 501 vs 500 filas, errores por fila sin escrituras, importación de estudiantes y docentes, no ADMIN, reimportación).
- `npm test` 94/94 · `npm run lint` 0 · `npm run build` OK.

🔶 Por confirmar: smoke en navegador (escritorio/móvil) queda para QA.
