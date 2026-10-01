# Inc. 1 · Entidades base académicas (t_b089e01a)

**Estado:** implementado en `kanban/inc1-entidades-base`, pendiente de revisión e integración (t_bac7e269).
**Base:** `main` @ 8f3f46e (autenticación integrada).
**Fuente de diseño:** [modelo de entidades](../modelo-de-entidades.md) §4.2 y [arquitectura backend](../arquitectura-backend.md) §4, §6, §7, Anexo A.

## Alcance

| Incluido | Fuera (otra tarjeta) |
|---|---|
| `AnioLectivo`, `Periodo`, `Grado`, `Grupo`, `Asignatura` + `Area` y `AsignaturaGrado` (las requiere `Asignatura`) | `AsignacionDocente`, `AcudienteEstudiante` (roles/asignación); matrícula de estudiantes fue retirada del alcance |
| Migración Prisma `20261001061853_academico_base` | `Nivel`/`Bloque`/`Unidad`/`Sesion` (currículo) |
| Capa de datos `src/server/modules/academico/` | UI (sin pantallas en esta tarjeta) |
| API REST mínima GET/POST/PATCH de las cinco entidades | Auditoría (`Auditoria` aún no existe en el esquema) 🔶 |

## Decisiones

- **Restricciones en SQL:** `anios_lectivos.anio` único; `periodos(anioLectivoId, orden)` único; `grados.nombre` y `grados.orden` únicos; `grupos(gradoId, anioLectivoId, identificador)` único (RN-07); `areas(nombre, idioma)` único; `asignaturas(areaId, nombre)` único; PK compuesta en `asignaturas_grados`. FK con `RESTRICT` salvo `AsignaturaGrado` (cascade) y `Grupo.directorId` (`SET NULL`).
- **Reglas en la capa de datos** (SQLite no las expresa), dentro de transacciones:
  - RN-01 solo un año `ACTIVO`.
  - RN-02 períodos sin solape (bordes inclusivos) y RN-03 dentro de las fechas del año; editar el año no puede dejar períodos por fuera.
  - RN-06 la suma de ponderaciones nunca supera 100 %. 🔶 Se permite suma parcial mientras se configura; `GET /api/anios-lectivos/[id]` expone `sumaPonderaciones` y `ponderacionCompleta` para que la UI advierta. Confirmar si el colegio exige bloqueo estricto.
  - RN-52 año `CERRADO` = solo lectura (no se editan año, períodos ni grupos; no se reabre). 🔶 Reapertura por confirmar.
  - Director de grupo: usuario `ACTIVO` con rol `DOCENTE`.
  - RN-09 la intensidad vive por grado en `AsignaturaGrado`; un PATCH con `grados` reemplaza el conjunto.
- **Autorización:** todas las rutas exigen sesión con rol `ADMIN` o `COORDINACION` (401/403). Lectura para docentes/estudiantes queda para cuando exista `AsignacionDocente`.
- **API (§7):** Zod en cada handler, errores `{ error: { code, message } }` en español, paginación `?page&pageSize` (máx. 100) con `{ data, page, pageSize, total }`, verificación de `Origin` en mutaciones, IDs `cuid()`.
- **Fechas:** formato `AAAA-MM-DD`, guardadas como medianoche UTC.
- **Ponderación:** `Decimal` en BD, número en la API; comparación en centésimas para evitar errores de coma flotante.

## Endpoints

```
GET/POST   /api/anios-lectivos          GET/PATCH /api/anios-lectivos/[id]
GET/POST   /api/periodos?anioLectivoId  GET/PATCH /api/periodos/[id]
GET/POST   /api/grados                  GET/PATCH /api/grados/[id]
GET/POST   /api/grupos?anioLectivoId&gradoId   GET/PATCH /api/grupos/[id]
GET/POST   /api/asignaturas?areaId&gradoId     GET/PATCH /api/asignaturas/[id]
```

No hay endpoints de `Area` todavía (el mapa de la arquitectura las ubica en currículo); el seed crea las áreas demo.

## Datos demo (seed)

Todo ficticio y marcado "(demo)": año 2026 con fechas inventadas, 4 períodos de 25 %, grados 1°–5° de primaria, grupo piloto 1°-01 **sin director** (no se crean personas), y solo las tres asignaturas que ya muestra la maqueta (Comprensión Lectora, Robótica, Emprendimiento) en áreas demo. 🔶 La lista real de 14 asignaturas de 1.° y el calendario del colegio están pendientes (D-05). El seed es idempotente.

## Archivos

- `prisma/schema.prisma`, `prisma/migrations/20261001061853_academico_base/migration.sql`, `prisma/seed.ts`
- `src/server/modules/academico/{reglas,esquemas,servicio,index}.ts`, `academico.test.ts`
- `src/server/{errores,http,http-acceso}.ts`
- `src/app/api/{anios-lectivos,periodos,grados,grupos,asignaturas}/route.ts` y `[id]/route.ts`
- `scripts/smoke-academico.sh`

## Verificación (2026-10-01, worktree `.worktrees/t_b089e01a`)

| Comando | Resultado |
|---|---|
| `npx vitest run` | 18/18 (11 nuevas: reglas puras, Zod, acceso por rol, servicio contra SQLite temporal con las migraciones reales) |
| `npm run lint` | OK, sin errores |
| `npm run build` | OK; rutas `/api/{anios-lectivos,periodos,grados,grupos,asignaturas}` y `[id]` |
| `prisma migrate dev` + `prisma db seed` (×2) | OK, idempotente |
| `scripts/smoke-academico.sh` contra `next start` | sin sesión 401; admin lista grados; año demo `sumaPonderaciones: 100`; período solapado → `PERIODO_SOLAPADO`; grado inválido → `DATOS_INVALIDOS` con mensajes en español; origen ajeno → `ORIGEN_INVALIDO`; grupos total 1; asignaturas total 3; id inexistente → `NO_ENCONTRADO` |

## Pendientes 🔶

- Auditoría (RN-50) de cambios académicos cuando exista el modelo `Auditoria`.
- Endpoints de `Area` (currículo) y lectura con alcance para docentes.
- Política de reapertura de años y bloqueo estricto de RN-06.
- PostgreSQL en producción: las validaciones transaccionales asumen aislamiento serializable de SQLite; en Postgres conviene `isolationLevel: Serializable` o restricción parcial para RN-01.
