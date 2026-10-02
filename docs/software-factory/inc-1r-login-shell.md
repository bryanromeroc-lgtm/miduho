# Inc. 1R · Login y shell visual por contexto (INC1R-04)

**Tarjeta:** `t_cc958a97` · **Requerimiento:** [inc-1r-requerimiento-aprobado.md](inc-1r-requerimiento-aprobado.md) §2, §3 y §10
**Estado:** implementado, pendiente integración (gate `t_e61e786d`)

## Alcance entregado

- **Pantallas de acceso** (`/login`, `/recuperar`, `/recuperar/nueva`) y **cambio obligatorio** (`/cuenta/contrasena` con contraseña temporal) rediseñadas con la identidad de la maqueta: paisaje del portal, escudo, naranja del colegio, tinta `#20334b` y botones pastilla. Son pantallas independientes con una sola `<main>`.
- **Shell autenticado** (`Marco`): identidad y grupo reales desde la sesión, navegación por contexto, menú de cuenta (Cuenta + Cerrar sesión) y selector de contexto para cuentas `DOCENTE + ADMIN`.
- **Cuenta** dentro del shell: nombre, correo, rol, grupo (ESTUDIANTE), grupos a cargo (DOCENTE), período; cambiar contraseña solo ADMIN/DOCENTE; cerrar sesión para todos.
- **Rutas del contexto ADMIN** (`/admin`, `/admin/usuarios`, `/admin/estructura`, `/admin/asignaciones`) y **Mi curso** (`/mi-curso`) creadas con guarda de servidor. El Dashboard muestra cifras reales; las demás son marcadores 🔶 que completan INC1R-05/07/08 y INC1R-10.

## Decisiones

| Decisión | Motivo |
|---|---|
| Navegación por contexto en `src/lib/navegacion.ts` (pura, probada). ESTUDIANTE: Hoy, Mis clases, Biblioteca, Laboratorios, Agenda, Cuenta. DOCENTE: lo mismo + Mi curso. ADMIN: Dashboard, Usuarios, Estructura, Asignaciones, Cuenta. | §2.1–2.3. Solo decide qué se muestra; la autorización sigue en `proxy.ts` + servidor. |
| Rutas ADMIN bajo `/admin/*`. | `proxy.ts` ya las clasifica como familia `ADMIN`; evita choque con `/api/usuarios`. Las tarjetas INC1R-05/07/08 deben construir sobre estas rutas. |
| Datos del shell en servidor (`src/server/shell.ts`, `cache()` por render) y entregados por `ProveedorShell` desde el layout raíz. | El `Marco` es componente cliente y lo usan páginas cliente (Laboratorios); así ninguna página inventa identidad ni grupo. Consulta solo la propia cuenta. |
| Grupo ESTUDIANTE = asociación activa (`finEn NULL`) del año ACTIVO; DOCENTE = grupos con asignación ACTIVA del año ACTIVO; ADMIN = chip "Administración" sin grupo. | Criterio "no mostrar DOCENTE/grupo ficticio a ADMIN". `DOCENTE` de `lib/datos.ts` ya no se usa en el shell ni en Hoy. |
| Contexto visible: en `/admin/*` una cuenta mixta ve navegación ADMIN; en la maqueta/Mi curso, DOCENTE. Biblioteca y Cuenta conservan el contexto guardado. | La barra nunca contradice la página. |
| Destino tras login resuelto en servidor (`destinoTrasIngreso`): cambio obligatorio → `/cuenta/contrasena`; `desde` interno si existe (validado por `destinoInterno` en `src/lib/destino.ts`: mismo origen, sin `//host`, `/\host`, barras invertidas, esquemas ni caracteres de control; INC1R-04F); si no, inicio del contexto (`/admin` o `/`). `proxy.ts` también redirige `/` → `/admin` para contexto ADMIN. | Una redirección de server action que el proxy vuelve a redirigir dejaba la URL del navegador desfasada (detectado en el smoke). |
| `.school-header { z-index: 40 }` en `shell.css`. | El hero aísla su contexto de apilamiento y tapaba el menú de cuenta (detectado en el smoke). |
| Estilos nuevos en `src/app/shell.css`; `globals.css` sin cambios. | No tocar la maqueta; menos colisiones con otras tarjetas. |

## Verificación

- `npm run lint`: 0 errores.
- `vitest run`: 6 archivos, 55 pruebas aprobadas (incluye `src/lib/navegacion.test.ts`, 10 casos nuevos).
- `npm run build`: compila; rutas nuevas `/admin`, `/admin/usuarios`, `/admin/estructura`, `/admin/asignaciones` y `/mi-curso` dinámicas.
- **Smoke real** con `next start`, BD SQLite temporal (migraciones desde vacío + seed ficticio + cuenta mixta ficticia) y Chromium headless en **1366×900 y 390×844**: **109/109 comprobaciones aprobadas**, sin errores de Auth.js en el log. Cubre: una sola `<main>` y sin `<main>` anidada en todas las rutas visitadas; sin scroll horizontal; navegación exacta por rol; grupo real del estudiante y del docente; ADMIN sin grupo ficticio ni "DOCENTE"; ESTUDIANTE y DOCENTE bloqueados en rutas ajenas; ADMIN puro bloqueado en `/clases`; cambio obligatorio del docente sin shell; menú de cuenta (abrir, Escape, cerrar sesión y rutas protegidas después); selector de contexto (primer acceso ADMIN, cambio a DOCENTE, persistencia y regreso).
- Revisión visual de capturas: login, recuperación, cambio obligatorio, Hoy (estudiante/docente), Dashboard, Cuenta y cuenta mixta en móvil.

## Pendiente / riesgos

- 🔶 Con 7 pestañas en móvil (DOCENTE) las etiquetas quedan a ~10 px; legibles a 390 px, ajustadas a 320 px. Revisar en QA E2E (INC1R-13).
- Las secciones ADMIN y Mi curso son marcadores; su funcionalidad corresponde a INC1R-05/07/08/10.
- La fecha "Martes 9 de septiembre · Período 3" de Hoy y los contenidos de clases siguen siendo demostrativos (§10: fuera de alcance).
