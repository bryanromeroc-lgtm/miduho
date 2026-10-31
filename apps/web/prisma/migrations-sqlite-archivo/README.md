# Migraciones SQLite archivadas

Solo referencia histórica. **Prisma no las lee** (`prisma.config.ts` apunta a `prisma/migrations`).
Desde el cambio `preparar-despliegue-produccion` la base es PostgreSQL y el esquema completo
nace de `prisma/migrations/0001_base_postgresql`. No había datos reales que migrar.

## Inventario de reglas de integridad (SQLite → PostgreSQL)

Cada regla tiene su prueba en `tests/integracion/migraciones.test.ts`.

| # | Regla | Migración SQLite | Mecanismo SQLite | Mecanismo PostgreSQL (`0001_base_postgresql`) |
|---|---|---|---|---|
| R1 | `roles.codigo` ∈ ADMIN, DOCENTE, ESTUDIANTE | `20261002000000_inc1r_modelo_acceso…` | triggers `roles_codigo_permitido_insert` / `_update` → `ROL_NO_PERMITIDO` | `CHECK` con nombre `ROL_NO_PERMITIDO` (el mensaje de error lo contiene) |
| R2 | `usuarios.estado` ∈ PENDIENTE_ACTIVACION, ACTIVO, INACTIVO | `20261002000000_…` | `CHECK (estado IN …)` | tipo `ENUM "EstadoUsuario"` |
| R3 | `usuarios.debeCambiarContrasena` es booleano | `20261002000000_…` | `CHECK (… IN (0, 1))` | tipo `BOOLEAN` nativo |
| R4 | `usuarios.versionSesion` ≥ 1 | `20261002000000_…` | `CHECK` | `CHECK usuarios_versionSesion_minima` |
| R5 | `usuarios.ultimoContexto` nulo, ADMIN o DOCENTE | `20261002010000_inc1r_revocacion_contexto` | triggers `usuarios_contexto_valido_insert` / `_update` | `CHECK usuarios_ultimoContexto_invalido` |
| R6 | `restablecimientos_contrasena.tipo` ∈ RECUPERACION, INVITACION | `20261002020000_inc1r_ciclos_contrasena` | triggers `restablecimientos_tipo_valido_insert` / `_update` | `CHECK restablecimientos_tipo_invalido` |
| R7 | ESTUDIANTE nunca junto a ADMIN o DOCENTE | `20261002000000_…` | trigger `usuarios_roles_combinacion_valida` (solo INSERT) → `COMBINACION_ROLES_INVALIDA` | función PL/pgSQL + trigger `BEFORE INSERT OR UPDATE` con el mismo código; bloquea la fila de la cuenta para serializar asignaciones concurrentes |
| R8 | `finEn` ≥ `inicioEn` en asociaciones estudiante–grupo | `20261002000000_…` | `CHECK` | `CHECK asociaciones_fin_posterior_inicio` |
| R9 | Una asociación activa (`finEn` nulo) por estudiante y año | `20261002000000_…` | índice único parcial | índice único parcial `asociacion_estudiante_activa_por_anio_key` |
| R10 | El grupo de la asociación pertenece a su año lectivo | `20261002000000_…` | triggers `asociacion_grupo_anio_insert` / `_update` → `GRUPO_ANIO_INVALIDO` | función PL/pgSQL + trigger `BEFORE INSERT OR UPDATE OF grupoId, anioLectivoId` con el mismo código |
| R11 | Bloques de horario: día válido, horas `HH:MM` y fin posterior al inicio | `20261002000000_…` | `CHECK` de día, formato (`length`/`substr`) y orden | día: `ENUM "DiaSemana"`; formato: `CHECK` con expresión regular; orden: `CHECK` con `COLLATE "C"` |
| R12 | Cambiar estado o contraseña revoca sesiones (`versionSesion` = anterior + 1, `sesionesRevocadasEn` = ahora) | `20261002010000_…` | trigger `AFTER UPDATE` `usuarios_revocar_por_estado_o_clave` | función PL/pgSQL + trigger `BEFORE UPDATE OF estado, hashContrasena` que reescribe `NEW` |
| R13 | Agregar o retirar un rol revoca sesiones | `20261002010000_…` | triggers `usuarios_revocar_por_rol_agregado` / `_retirado` | función PL/pgSQL + trigger `AFTER INSERT OR DELETE` `usuarios_revocar_por_rol` |
| R14 | Historial de asignaciones: la misma combinación docente/asignatura/grupo/año puede repetirse | `20261002040000_inc1r_historial_asignaciones` | índice único reemplazado por índice simple | índice simple (lo genera Prisma desde `schema.prisma`) |

Las migraciones `20261001…` (auth, estructura académica, roles/asignación docente) solo crean
tablas e índices que ahora genera Prisma; la tabla `acudientes_estudiantes` y los roles
COORDINACION/ACUDIENTE ya estaban retirados y no existen en PostgreSQL.
