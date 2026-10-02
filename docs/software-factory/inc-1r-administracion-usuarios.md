# Inc. 1R · Administración individual de usuarios (INC1R-05)

**Estado:** implementado (`t_29502cbf`), pendiente integración (`t_11e8f95a`)  
**Fuente:** [requerimiento aprobado](inc-1r-requerimiento-aprobado.md) §2, §4, §5, §6 y §11  
**Base:** `a09bd23` (main) · rama `frontend/t_29502cbf-usuarios`

## 1. Alcance entregado

Solo ADMIN, en `/admin/usuarios` (ruta preparada por INC1R-04):

| Necesidad | Dónde |
|---|---|
| Buscar (nombre, apellido, correo), filtrar (rol, estado, grupo) y paginar | `/admin/usuarios` (formulario GET) · `GET /api/usuarios` |
| Crear cuenta con combinación válida | `/admin/usuarios/nuevo` · `POST /api/usuarios` |
| Editar nombres, apellidos y correo único | ficha `/admin/usuarios/[id]` · `PATCH /api/usuarios/[id]` |
| Activar / desactivar | ficha · `PUT /api/usuarios/[id]/estado` |
| Cambiar combinación (promover DOCENTE a ADMIN, retirar ADMIN) | ficha · `PUT /api/usuarios/[id]/roles` |
| Asociar o trasladar un estudiante de grupo | ficha · `PUT /api/usuarios/[id]/grupo` |
| Invitar ADMIN puro / reenviar invitación | alta con tipo «Administración» · `POST /api/usuarios/[id]/invitacion` (INC1R-03) |
| Restablecer la contraseña de un estudiante | ficha · `POST /api/usuarios/estudiantes/restablecer-contrasenas` (INC1R-03) |

Estados vacíos (sin cuentas / sin coincidencias), errores visibles por sección y confirmación modal para desactivar, activar, cambiar rol, trasladar y restablecer.

## 2. Reglas aplicadas (servidor)

Implementadas en `src/server/modules/usuarios/servicio.ts`, dentro de transacciones:

- **Combinaciones:** solo `ADMIN`, `DOCENTE`, `ESTUDIANTE`, `DOCENTE + ADMIN` (`src/lib/usuarios.ts`). Una cuenta estudiantil nunca pasa a ser del personal ni al revés (`COMBINACION_NO_PERMITIDA`); el trigger SQL de INC1R-01 sigue como segunda barrera.
- **Credencial inicial por tipo:** DOCENTE y DOCENTE+ADMIN reciben contraseña temporal con cambio obligatorio; ESTUDIANTE, contraseña legible; ADMIN puro, invitación de 24 h sin contraseña. La contraseña se devuelve una sola vez (`Cache-Control: no-store`), solo se guarda el hash y la UI no la persiste: al ocultarla no se puede volver a consultar.
- **Último ADMIN:** no se desactiva ni se le retira ADMIN si no queda otro ADMIN **activo** (`ULTIMO_ADMIN`). Un ADMIN pendiente de activación no cuenta.
- **Propia cuenta:** un ADMIN no se desactiva (`AUTODESACTIVACION`) ni se retira ADMIN (`AUTODEGRADACION`) a sí mismo.
- **Carga docente:** no se retira DOCENTE a quien tiene asignaciones activas o dirige un grupo (`CARGA_DOCENTE_ACTIVA`).
- **Cuenta pendiente:** no se cambian roles de un ADMIN que aún no acepta la invitación (`CUENTA_PENDIENTE`).
- **Desactivación:** no hay borrado físico; se conserva historial. Los triggers de INC1R-02 incrementan `versionSesion` (revocación inmediata) al cambiar estado o roles; además se invalidan enlaces de invitación/recuperación pendientes. Reactivar devuelve `ACTIVO`, o `PENDIENTE_ACTIVACION` si la cuenta nunca tuvo contraseña.
- **Grupo del estudiante (§6):** un grupo activo por año. Si ya tiene grupo en ese año es un traslado: exige `confirmarTraslado`, cierra la asociación anterior (`finEn`) y crea la nueva en la misma transacción. Rechaza año CERRADO, mismo grupo, cuentas inactivas y cuentas que no son ESTUDIANTE.
- **Correo:** único también al editar (`CORREO_DUPLICADO`).
- **Autorización:** toda ruta exige `requerirRol(["ADMIN"])` (revalida sesión, estado y roles en BD) y `verificarOrigen` en mutaciones; las páginas usan `exigirRolPagina`.

## 3. Decisiones

- Se reutilizan `crearDocente`/`crearEstudiante` de INC1R-03 con parámetros opcionales (`tambienAdmin`, `asociacion`) en lugar de duplicar la generación de credenciales.
- El listado es un Server Component con filtros en la URL (enlazables y funcionales sin JavaScript); las mutaciones van por las APIs JSON con confirmación modal en `<dialog>` nativo (foco atrapado, Escape cancela).
- La columna «Grupo» del listado muestra la asociación activa del año ACTIVO. El filtro de grupos ofrece solo grupos de años no cerrados.
- Estilos nuevos solo en `src/app/shell.css` (sección INC1R-05); `globals.css` sin cambios.
- No se registra el actor de cada cambio (riesgo aceptado §7); solo `creadoEn`/`actualizadoEn`.

## 4. Verificación

| Comando | Resultado |
|---|---|
| `npm test` | 85/85 en 8 archivos (24 nuevas en `src/server/modules/usuarios/usuarios.test.ts`, BD SQLite temporal con migraciones reales) |
| `npm run lint` | 0 errores |
| `npm run build` | OK; rutas `/admin/usuarios`, `/admin/usuarios/nuevo`, `/admin/usuarios/[id]` y APIs nuevas generadas |
| Smoke `next start` (Chromium 1366×900 y 390×844, BD migrada desde vacío + seed ficticio) | 37/37 PASS |

El smoke cubre: 401/403 y redirección para no-ADMIN; listado, filtro por rol, estado vacío; alta DOCENTE con temporal única y CSV; duplicado con error visible; alta ESTUDIANTE con grupo; ADMIN puro por invitación; promoción DOCENTE→DOCENTE+ADMIN con confirmación; edición de identidad; desactivación con revocación inmediata de la sesión abierta del afectado; protección de propia cuenta/último ADMIN; combinación inválida; traslado con confirmación e historial; restablecimiento de credencial; móvil sin scroll horizontal y una sola `<main>`.

Script y capturas fuera del repo: `/home/server/.hermes/kanban/boards/miduho/workspaces/t_29502cbf/e2e/`.

## 5. Pendiente para otras tarjetas

- Importación CSV de usuarios: INC1R-06 (`t_9cc15d95`).
- Asociaciones con búsqueda/paginación propias y reasignación de carga docente: INC1R-07/08.
- E2E integral: INC1R-13 (`t_4fb71c5e`).
