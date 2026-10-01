# Inc. 1 · QA integrado de la fundación (sin matrícula)

Tarjeta: `t_978772c3` · Rama de trabajo: `kanban/inc1-qa-sin-matricula` · Base verificada: `main` @ `ab84092`.
Alcance: validación integrada del Inc. 1 sobre main — autenticación, recuperación de contraseña, entidades académicas base, autorización por rol y asignación docente — más el criterio negativo de ausencia de matrícula. Sin corregir producción en paralelo; los hallazgos se registran para el gate de revisión.

## Resultado global

| Gate | Resultado |
|---|---|
| Pruebas automáticas | ✅ 18/18 (2 archivos) |
| `npm run lint` | ✅ sin errores |
| `npm run build` | ✅ compila (Turbopack); 0 rutas de matrícula |
| Smoke HTTP (`next start`) | ✅ autenticación, autorización y CSRF de origen correctos |
| Criterio negativo: matrícula | ✅ ausente (entidad, migración, ruta, flujo, CSV) |
| Privacidad | ✅ sin datos reales de menores; seed ficticio |
| WCAG 2.1 AA | ✅ revisión de código conforme en formularios de acceso; 🔶 sin auditoría automatizada en navegador (ver §WCAG) |
| Defectos | 🟡 1 de autorización (fuga de alcance a DOCENTE) + hallazgos menores (ver §Defectos) |

## Comandos ejecutados y resultados

Entorno: worktree `.worktrees/t_978772c3` con `node_modules` copiado por hardlink desde el repositorio principal (Turbopack rechaza el symlink de `node_modules` fuera de la raíz del proyecto). Base SQLite temporal `dev.db` creada con `prisma migrate deploy` (3 migraciones) y `prisma db seed` (solo datos ficticios).

```bash
# 1. Generar cliente Prisma (requerido por build y tests)
npm run db:generate                      # ✔ Generated Prisma Client 7.10.0

# 2. Pruebas
npm run test                             # ✔ 18/18 passed (2 archivos) — 7.58 s

# 3. Lint
npm run lint                             # ✔ sin errores

# 4. Build
npm run build                            # ✔ compilado; ver lista de rutas abajo

# 5. Base de datos y seed (ficticio)
./node_modules/.bin/prisma migrate deploy # ✔ 3 migraciones aplicadas (auth, academico_base, roles_asignacion_docente)
./node_modules/.bin/prisma db seed        # ✔ roles + admin@miduho.test + académico demo

# 6. Smoke HTTP contra `next start -p 3917`
bash scripts/qa-smoke-inc1.sh
bash scripts/qa-rol-docente.sh
```

Rutas compiladas por `next build` (relevante a Inc. 1):

```
/auth:      /login, /recuperar, /recuperar/nueva, /cuenta, /api/auth/[...nextauth]
/académico: /api/{anios-lectivos,periodos,grados,grupos,asignaturas}[/id]
/roles:     /api/{asignaciones-docente,acudientes-estudiantes}[/id]
Proxy:      /cuenta (redirige a /login sin sesión)
```

No existe ruta `/api/matriculas`, `/matricula` ni importación CSV.

## Escenarios cubiertos

### Autenticación y recuperación (HU-01 / HU-02)

| Escenario | Resultado | Evidencia |
|---|---|---|
| `/api/grados` sin sesión | 401 `NO_AUTENTICADO` | smoke |
| `/cuenta` sin sesión | 307 → `/login?desde=/cuenta` | smoke (proxy.ts) |
| `/login`, `/recuperar`, `/recuperar/nueva` | 200 | smoke |
| Login correcto (cuenta ficticia del seed) | sesión válida; `/api/grados` y `/cuenta` 200 | smoke |
| Login con contraseña incorrecta | sin sesión → `/api/grados` 401 | smoke |
| Token de recuperación | SHA-256 en BD, un solo uso, 24 h | código (recuperacion.ts) + test |
| Respuesta de recuperación no revela existencia | misma respuesta con/sin cuenta | código (recuperacion.ts) |
| Bloqueo por 5 fallos / 15 min | en memoria del proceso 🔶 | test + código (intentos.ts) |

### Entidades académicas base

Confirmadas las cinco entidades + soporte (`Area`, `AsignaturaGrado`) y sus reglas en SQL/capa de datos: año único, un solo `ACTIVO`, períodos sin solape y dentro del año, ponderación ≤ 100 %, grupo único por grado+año+identificador, año `CERRADO` de solo lectura, director debe ser docente activo. Cubierto por `academico.test.ts` (integración contra SQLite temporal con las migraciones reales).

### Autorización y roles

| Escenario | Resultado | Evidencia |
|---|---|---|
| 401 sin sesión / 403 sin rol en rutas académicas | correcto | `http-acceso.ts` + test |
| Lectura/escritura académica restringida a `ADMIN`/`COORDINACION` | docente → 403 | `qa-rol-docente.sh` |
| Verificación de `Origin` en mutaciones (CSRF) | `ORIGEN_INVALIDO` con origen ajeno | smoke |
| `AsignacionDocente` única por docente+asignatura+grupo+año, desactivación sin borrado | correcto | schema + servicio + test |
| `AcudienteEstudiante` exige roles acudiente/estudiante y `verificado` | correcto | servicio |

### Criterio negativo — matrícula (retirada de alcance)

Confirmado ausente en todo el código y el esquema:

- **Entidad:** sin modelo `Matricula`/`EstadoMatricula` en `prisma/schema.prisma` (13 modelos; ninguno de matrícula).
- **Migración:** las 3 migraciones crean 14 tablas — `usuarios, roles, usuarios_roles, restablecimientos_contrasena, anios_lectivos, periodos, grados, grupos, areas, asignaturas, asignaturas_grados, asignaciones_docente, acudientes_estudiantes` (13 listadas; `migration_lock` y `_prisma_migrations` son internas). Ninguna de matrícula.
- **Rutas/flujo:** `search_files` sobre `src/` y `prisma/` con `matricul|Matricula|EstadoMatricula|SIMAT` → 0 coincidencias. `GET/POST /api/matriculas` y `GET /matricula` → 404.
- **CSV:** `search_files` sobre todo el worktree con `csv|CSV|importaci|SIMAT` → solo referencias documentales en `docs/` y `AGENTS.md` (decisiones de alcance), ninguna implementación.

## WCAG 2.1 AA

Revisión de código de los formularios de acceso (única UI funcional nueva del Inc. 1), `src/app/(auth)/componentes.tsx` y formularios:

- ✅ `<html lang="es-CO">`; títulos de página descriptivos (`metadata.title`).
- ✅ Cada campo con `<label htmlFor>` asociado y `aria-invalid`/`aria-describedby` para ayuda y error.
- ✅ Errores con `role="alert"`, éxito con `role="status"`.
- ✅ Foco visible en inputs y botones (`focus-visible:ring-3` con color de contraste alto).
- ✅ Navegación por teclado con elementos nativos (`input`, `button`, `a`).
- ✅ Contraste: texto `neutral-900`/`neutral-700` sobre blanco, enlace y botón `#00658B` sobre blanco ≈ 6.5:1, error `#B3261E` sobre blanco, estados con fondos propios (`#FDECEA`, `#EEF6E8`). Todos ≥ 4.5:1.
- ✅ Sin texto pedagógico como imagen en las pantallas de acceso.
- 🔶 **Sin auditoría automatizada en navegador (axe/Playwright):** el repositorio no declara `@playwright/test` en `package.json`, no hay `playwright.config`, y el entorno no dispone de navegador (sin Chrome/Chromium ni caché de Playwright). La verificación de UI se hizo a nivel HTTP (curl) y por inspección de código. Recomendación para el gate de revisión: añadir Playwright + axe como parte del plan de calidad antes de considerar el gate de accesibilidad "verificado por herramienta".

## Privacidad

- El seed (`prisma/seed.ts`) solo crea los 5 roles y una cuenta `admin@miduho.test` ("Cuenta Administradora (ficticia)"), más estructura académica demo (año, períodos, grados, grupo sin director). No hay nombres, cédulas ni datos de menores.
- Las fixtures de esta QA (`scripts/qa-fixtures.ts`) crean únicamente cuentas adultas ficticias ("Docente Uno/Dos (ficticio)", "Estudiante Demo (ficticio)", "Acudiente Demo (ficticio)") con `@miduho.test` y sin datos personales reales.
- Contraseñas de fixtures y `AUTH_SECRET` son valores efímeros locales, no versionados (`.env` y `dev.db` están en `.gitignore`).

## Defectos y hallazgos

### D-01 (media) — `GET /api/asignaciones-docente` filtra la asignación de otros docentes al rol DOCENTE

`src/app/api/asignaciones-docente/route.ts` permite `DOCENTE` en el GET, pero `servicio.asignacionesDocente.listar()` no restringe por el docente de la sesión.

**Evidencia reproducida** (`scripts/qa-rol-docente.sh`): iniciando sesión como `docente1.qa@miduho.test`, `GET /api/asignaciones-docente` devuelve el registro de `docente2.qa@miduho.test` ("Docente Dos"), no solo el propio.

**Riesgo:** fuga de información de asignaciones de todo el colegio a cualquier cuenta con rol docente (no expone datos de menores, que no se modelan). No es un fallo de la autorización central (`requerirRol` sí distingue 401/403; el POST sí exige ADMIN/COORDINACION y devuelve 403 al docente), sino de alcance de datos en una ruta de lectura.

**Corrección sugerida:** en el GET, filtrar por `docenteId = user.id` cuando el rol de la sesión sea `DOCENTE` (o restringir la ruta a `ADMIN`/`COORDINACION`). Queda a cargo de la tarjeta de implementación; no se corrige en paralelo desde QA.

### Hallazgos menores (no bloqueantes)

- H-01 — `AcudienteEstudiante` no expone `GET` (el servicio tiene `listar`, pero no hay ruta). Vacío de funcionalidad, no defecto.
- H-02 — `POST /api/acudientes-estudiantes` valida rol pero no estado `ACTIVO` de los usuarios vinculados (un usuario `INACTIVO` podría vincularse). Baja.
- H-03 — `DELETE /api/asignaciones-docente/[id]` (desactivación) no verifica que el año lectivo esté abierto, a diferencia del `POST`. Inconsistencia baja.
- H-04 — `verificarOrigen` (CSRF) solo actúa cuando la cabecera `Origin` está presente; peticiones sin `Origin` pasan. Mitigación razonable para sesión por cookie (los navegadores envían `Origin` en peticiones cross-site), pero conviene documentarlo como límite conocido.
- H-05 — 🔶 Bloqueo de login en memoria: se reinicia con cada proceso; solo válido para un único servidor (ya documentado en `inc-1-autenticacion.md`).

## Archivos de evidencia

- `docs/software-factory/inc-1-fundacion-qa.md` — este reporte.
- `scripts/qa-smoke-inc1.sh` — smoke HTTP (auth, autorización, negativo matrícula, CSRF).
- `scripts/qa-rol-docente.sh` — reproducción del hallazgo D-01.
- `scripts/qa-fixtures.ts` — generación de cuentas ficticias para reproducir D-01 (no datos de menores).
