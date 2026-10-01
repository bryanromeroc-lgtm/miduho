# Inc. 1 · Revisión final (gate) — resultado

Tarjeta: `t_0305f597` · Rama de revisión: `kanban/inc1-review` · Base revisada: `main` @ `da27a18` (fast-forward de `kanban/inc1-qa-sin-matricula`).
Alcance: revisión independiente del estado integrado de main y de la evidencia QA del Incremento 1. Sin modificaciones de producción en paralelo (revisión sobre worktree).

## Veredicto

**NO APROBADO — se solicita cambio (D-01, autorización).** El resto de los gates se verificó conforme; solo el gate de seguridad/autorización queda abierto por una fuga de alcance de datos al rol DOCENTE.

## Gates verificados (re-ejecutados sobre el worktree)

| Gate | Resultado | Evidencia |
|---|---|---|
| Pruebas automáticas | ✅ 18/18 (2 archivos) | `npm run test` → 18 passed, 6.48 s |
| `npm run lint` | ✅ 0 errores (1 warning no bloqueante) | `eslint` → solo `qa-fixtures.ts:23` variable sin uso |
| `npm run build` | ✅ compila; 0 rutas de matrícula | `next build` → rutas de auth/académico/roles; sin `/api/matriculas` ni `/matricula` |
| Migraciones | ✅ 3 aplicables (`auth`, `academico_base`, `roles_asignacion_docente`), consistentes con el esquema | `prisma/migrations/` + test de integración aplica las migraciones reales |
| Privacidad de menores | ✅ sin datos reales de menores | `seed.ts` y `qa-fixtures.ts` solo cuentas adultas ficticias `@miduho.test` marcadas "(ficticia/demo)" |
| Ausencia de contenido protegido | ✅ Inc. 1 no toca contenido | `git diff 8f3f46e..da27a18` → 42 archivos (backend/docs/scripts), 0 archivos de `public/` |
| WCAG 2.1 AA | ✅ conforme por código; 🔶 sin auditoría automatizada en navegador | revisión de `src/app/(auth)/componentes.tsx` (labels, aria, foco, contraste ≥ 4.5:1) |
| Alineación con arquitectura | 🟡 ver §Hallazgos | el modelo y las rutas siguen `arquitectura-backend.md` §5–§7; la regla de alcance por `AsignacionDocente` (§6) no está implementada |
| Seguridad y autorización | ❌ **D-01** (ver abajo) | `GET /api/asignaciones-docente` expone a DOCENTE todas las asignaciones del colegio |
| No modificar producción en paralelo | ✅ | revisión solo lectura en worktree; `main` intacto en `da27a18` |

## Hallazgo bloqueante

### D-01 (media-alta) — GET /api/asignaciones-docente no restringe el alcance al DOCENTE de la sesión

- **Ruta:** `src/app/api/asignaciones-docente/route.ts:5` permite `["ADMIN", "COORDINACION", "DOCENTE"]` en el GET.
- **Causa:** `src/server/modules/academico/servicio.ts:310-317` — `asignacionesDocente.listar()` filtra solo por parámetros de query (`docenteId`, `grupoId`, `anioLectivoId`), nunca por el usuario de la sesión.
- **Efecto:** una cuenta con rol DOCENTE puede listar TODAS las asignaciones del colegio (qué docente dicta qué asignatura en qué grupo y año), no solo las propias.
- **Evidencia reproducida:** `scripts/qa-rol-docente.sh` — sesión como `docente1.qa@miduho.test` obtiene el registro de `docente2.qa@miduho.test`. Confirmado en revisión por lectura del código (ruta + servicio).
- **Contradice:** `arquitectura-backend.md` §6 — "`AsignacionDocente` gobierna todo el acceso docente… Tener el rol DOCENTE no basta… cada consulta filtra por el alcance devuelto por `permisos.ts`. Nunca se confía en IDs que llegan por query/params sin verificar alcance." La capa `src/server/auth/permisos.ts` (con `requiereAsignacion`/`alcanceEstudiante`/`alcanceAcudiente`) no existe; se implementó solo control por rol (`http-acceso.ts`).
- **Riesgo:** exposición de datos internos de asignación a cualquier docente. No expone datos de menores (no se modelan), por eso es media y no crítica, pero es un fallo real del gate de autorización.
- **Corrección sugerida:** en el GET, si el rol de la sesión es `DOCENTE`, forzar el filtro `docenteId = sesion.user.id`; o restringir la ruta a `ADMIN`/`COORDINACION` y exponer más adelante el alcance docente por `AsignacionDocente` (§6).

## Hallazgos no bloqueantes (registrados para seguimiento)

- H-01 — `AcudienteEstudiante` sin ruta GET (el servicio tiene `listar`).
- H-02 — `POST /api/acudientes-estudiantes` valida rol pero no el estado `ACTIVO` de los usuarios vinculados.
- H-03 — `DELETE /api/asignaciones-docente/[id]` no verifica año lectivo abierto (a diferencia del POST).
- H-04 — `verificarOrigen` solo actúa si llega `Origin`; sin `Origin` pasa (mitigación razonable con endpoints JSON-only + cookie; documentado).
- H-05 — bloqueo de login en memoria del proceso (un solo servidor; ya documentado).
- WCAG — sin auditoría automatizada (axe/Playwright no instalados): recomendación de calidad, no violación constatada.

## Nota de alineación (no bloqueante)

El esquema usa `AsignacionDocente.estado` como enum `ACTIVA`/`INACTIVA` (mejor que el `bool` del borrador del Anexo A). El modelo de datos coincide con `docs/modelo-de-entidades.md` §4 y el catálogo de entidades del Inc. 1; la lista real de 14 asignaturas y el calendario del colegio siguen pendientes (D-05, 🔶 ya documentado).

## Estado

Se solicita cambio a la tarjeta de implementación para corregir D-01 y re-presentar la revisión. Este documento se actualizará con el cierre al verificarse el gate de autorización.
