# Inc. 1 · Revisión final (gate) — resultado y cierre

Tarjeta: `t_0305f597` · Rama de revisión: `kanban/inc1-review` · Base revisada: `main` @ `69d33d1` (integración por fast-forward de la corrección `t_e7cc1239` sobre `da27a18`).
Alcance: revisión independiente del estado integrado de main y de la evidencia QA del Incremento 1. Sin modificaciones de producción en paralelo (revisión sobre worktree; el único cambio a main durante la revisión fue el fast-forward de la corrección D-01 ya aprobada por su tarjeta).

## Veredicto

**APROBADO — todos los gates del Incremento 1 verificados sobre main.**

En la primera pasada (commit `a4705bb`) el gate de seguridad/autorización quedó abierto por el hallazgo D-01: `GET /api/asignaciones-docente` permitía a un `DOCENTE` listar las asignaciones de todo el colegio. La corrección se tramitó en la tarjeta `t_e7cc1239` (commit `69d33d1`) y se re-verificó en esta segunda pasada. El resto de gates ya estaban conformes y se re-ejecutaron sobre el estado integrado.

## Gates verificados (re-ejecutados sobre main @ 69d33d1)

| Gate | Resultado | Evidencia |
|---|---|---|
| Pruebas automáticas | ✅ 20/20 (2 archivos) | `npm run test` → 20 passed, 6.87 s (18 previas + 2 negativas nuevas de alcance D-01) |
| `npm run lint` | ✅ 0 errores (1 warning no bloqueante) | `eslint` → solo `scripts/qa-fixtures.ts:23` variable sin uso |
| `npm run build` | ✅ compila; 0 rutas de matrícula | `next build` → rutas auth/académico/roles; `/api/asignaciones-docente` ruta dinámica; sin `/api/matriculas` ni `/matricula` |
| Migraciones | ✅ 3 aplicadas (`auth`, `academico_base`, `roles_asignacion_docente`) | `prisma migrate deploy` OK + test de integración aplica las migraciones reales |
| Privacidad de menores | ✅ sin datos reales de menores | `seed.ts` y `qa-fixtures.ts` solo cuentas adultas ficticias `@miduho.test`; 0 coincidencias de cédula/correos personales en src/prisma/scripts |
| Ausencia de contenido protegido | ✅ Inc. 1 no toca contenido | `git diff 8f3f46e..69d33d1` → backend/docs/scripts; 0 archivos de `public/` ni `src/lib/` de la maqueta |
| WCAG 2.1 AA | ✅ conforme por código; 🔶 sin auditoría automatizada en navegador | revisión de `src/app/(auth)/componentes.tsx` (labels, aria, foco, contraste ≥ 4.5:1); axe/Playwright no instalados (gap documentado, recomendación no bloqueante) |
| Alineación con arquitectura | ✅ | modelo y rutas siguen `arquitectura-backend.md` §5–§7; alcance por sesión implementado según §6 (función `docenteIdSegunAlcance`) |
| Seguridad y autorización | ✅ **D-01 corregido y reproducido** | ver §D-01: sesión `docente1.qa@miduho.test` → 1 registro propio, 0 de `Docente Dos`; ADMIN ve los 2 y filtra por `docenteId` |
| No modificar producción en paralelo | ✅ | revisión en worktree; único cambio a main = fast-forward de la corrección aprobada |

## Cierre del hallazgo bloqueante D-01

- **Corrección (tarjeta `t_e7cc1239`, commit `69d33d1`):** `src/app/api/asignaciones-docente/route.ts` ahora resuelve `docenteIdSegunAlcance(user.roles, user.id, f.docenteId)` — una cuenta con rol `DOCENTE` (sin `ADMIN`/`COORDINACION`) ve solo sus propias asignaciones aunque envíe un `docenteId` ajeno; `ADMIN`/`COORDINACION` conservan el listado completo y el filtro explícito. Regla aislada como función pura en `src/server/http-acceso.ts` y cubierta por 2 pruebas negativas nuevas (`academico.test.ts`): `20/20`.
- **Reproducción real sobre `next start` con fixtures ficticias (`scripts/qa-fixtures.ts` + `qa-rol-docente.sh` + verificación independiente):**
  - `docente1.qa@miduho.test` GET `/api/asignaciones-docente` → `total: 1`, único `docenteId` = el propio, `Docente Dos` presente 0 veces. ✔
  - `admin@miduho.test` GET → `total: 2` (ambos docentes); filtro explícito `?docenteId=<docente2>` → 1 registro del docente solicitado. ✔
  - `docente1` GET `/api/grados` y `/api/anios-lectivos` → 403; POST `/api/asignaciones-docente` → 403. ✔
  - Smoke general (`qa-smoke-inc1.sh`): 401 sin sesión, 307 en `/cuenta`, login correcto 200 / incorrecto 401, CSRF `ORIGEN_INVALIDO` con origen ajeno, matrícula ausente (404 en `/api/matriculas`, `/matricula`). ✔

## Hallazgos no bloqueantes (registrados para seguimiento)

- H-01 — `AcudienteEstudiante` sin ruta GET (el servicio tiene `listar`). → tarjeta de funcionalidad futura.
- H-02 — `POST /api/acudientes-estudiantes` valida rol pero no el estado `ACTIVO` de los usuarios vinculados. Baja.
- H-03 — `DELETE /api/asignaciones-docente/[id]` no verifica año lectivo abierto (a diferencia del POST). Inconsistencia baja.
- H-04 — `verificarOrigen` (CSRF) solo actúa si llega `Origin`; peticiones sin `Origin` pasan. Mitigación razonable con endpoints JSON + cookie; documentado como límite conocido.
- H-05 — 🔶 bloqueo de login en memoria del proceso (un solo servidor; ya documentado).
- WCAG — sin auditoría automatizada en navegador (axe/Playwright no instalados): recomendación de calidad para el plan de pruebas, no violación constatada.
- D-05 — 🔶 lista real de 14 asignaturas y calendario del colegio pendientes de confirmar (ya documentado en tarjetas previas).

## Nota de alineación

El esquema usa `AsignacionDocente.estado` como enum `ACTIVA`/`INACTIVA` (mejor que el `bool` del borrador del Anexo A). El modelo de datos coincide con `docs/modelo-de-entidades.md` §4 y el catálogo de entidades del Inc. 1.

## Estado final

Revisión completada y aprobada. Cierre documentado en este artefacto (`docs/software-factory/inc-1-revision-final.md`). El Incremento 1 queda listo para commit/push al repositorio remoto por la tarjeta de cierre `t_d895916e`.