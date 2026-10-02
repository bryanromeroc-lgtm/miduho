# Inc. 1R · Experiencia del ESTUDIANTE (INC1R-11)

**Tarjeta:** `t_daaba94a` · **Requerimiento:** [inc-1r-requerimiento-aprobado.md](inc-1r-requerimiento-aprobado.md) §2.3, §3 y §10 · **Base:** [login y shell](inc-1r-login-shell.md) (`t_cc958a97`)
**Estado:** implementado, pendiente integración (gate `t_9227c634`)

## Alcance

Se conserva intacta la maqueta (Hoy, Mis clases, clase, Biblioteca, Laboratorios, Agenda y sus contenidos demostrativos). Solo se sustituyen identidad y grupo por los datos reales de la sesión y de la asociación estudiante–grupo.

| Criterio de la tarjeta | Dónde se cumple |
|---|---|
| Identidad real (nombre, correo, rol) | Shell (`Marco` + `MenuCuenta`), saludo de Hoy y Cuenta, desde `obtenerDatosShell` (INC1R-04). |
| Grupo real | Asociación activa (`finEn` nulo) del año ACTIVO. Chip del shell, saludo de Hoy, cabecera de **Mis clases**, encabezado, migas y panel «Grupo» de la **clase**. **Nuevo en esta tarjeta**: Mis clases y la clase pintaban `1°-01` fijo de `lib/datos.ts`. |
| Sin grupo | Chip y Cuenta dicen «Sin grupo asignado»; la maqueta omite el grupo en lugar de mostrar el demostrativo. |
| Navegación ESTUDIANTE | Hoy, Mis clases, Biblioteca, Laboratorios, Agenda y Cuenta (`rutasPorContexto`, INC1R-04). |
| Rutas protegidas | `proxy.ts` (sin sesión → `/login?desde=…`) y revalidación en BD (INC1R-03). |
| Sin administración ni Mi curso | `puedeAccederRuta` en el proxy + guardas `exigirRolPagina` en `/admin/*` y `/mi-curso/*`; las APIs responden 403. |
| Cuenta: consultar y cerrar sesión, sin cambiar contraseña | `/cuenta` oculta «Cambiar contraseña» para ESTUDIANTE; `/cuenta/contrasena` no muestra formulario y el servicio rechaza con `SIN_PERMISO` (prueba en `cuentas.test.ts`). |

## Decisiones

| Decisión | Motivo |
|---|---|
| `textoGrupo` y `grupoMaqueta` en `src/lib/navegacion.ts` (puras, probadas). El chip del shell usa `textoGrupo`; las páginas de la maqueta, `obtenerGrupoMaqueta(pathname)` en `src/server/shell.ts`. | Una sola regla para la barra y las páginas, calculada con el mismo `contextoVisible`: la página nunca contradice la barra. |
| ESTUDIANTE → su grupo; DOCENTE → solo si tiene exactamente un grupo; ADMIN o sin grupo → nada. | Con varios grupos, rotular una clase demostrativa con uno de ellos sería inventar una relación. |
| Los datos de clases, período «Período 3», fecha de Hoy, «25 estudiantes ficticios» y entregas siguen siendo demostrativos. | §10: la personalización de clases, calendario y contenidos queda fuera. 🔶 El chip puede mostrar el período real mientras la maqueta dice «Período 3». |
| `HOY[].grupo` y `DOCENTE.grupo` de `lib/datos.ts` se conservan pero ya no se pintan. | No tocar los datos de la maqueta; solo se dejó de leerlos para identidad. |

## Verificación

- `vitest run`: 12 archivos, **131 pruebas** aprobadas (3 nuevas en `src/lib/navegacion.test.ts`).
- `npm run lint`: 0 problemas. `npm run build`: compila (`/clases` y `/clases/[clase]` pasan a dinámicas).
- **Smoke real** en `next start` (BD SQLite temporal: migraciones desde vacío + seed + escenario ficticio con estudiante en 2°-03, estudiante sin grupo y estudiante trasladado), Chromium 1366×900 y 390×844: **183/183**. Cubre: rutas de la maqueta y Cuenta sin sesión → login con destino; navegación exacta; chip y rótulos con el grupo real y ausencia de `1°-01` demostrativo; una sola `<main>`; sin scroll horizontal; 12 rutas de administración y Mi curso → `/cuenta?sinPermiso=1`; 5 APIs administrativas → 403; Cuenta con datos y sin cambio de contraseña; menú de cuenta y cierre de sesión; grupo histórico no visible tras traslado; regresión del estudiante sembrado (1°-01) y del cambio obligatorio del DOCENTE.
- Script y capturas fuera del repo: `~/.hermes/kanban/boards/miduho/workspaces/t_daaba94a/e2e/`.

## Pendiente

- 🔶 Coherencia entre el período real del chip y el «Período 3» demostrativo de la maqueta: depende de la personalización de contenidos (fuera de alcance).
- QA E2E integrado del incremento: `t_4fb71c5e` (INC1R-13).
