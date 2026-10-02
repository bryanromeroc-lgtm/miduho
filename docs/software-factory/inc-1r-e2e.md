# INC1R-13 · E2E del Incremento 1R en escritorio y móvil (QA)

**Estado:** verificado — 304/304 comprobaciones pasan (corrección de portabilidad y redacción de credenciales)
**Fecha:** 2026-10-02
**Perfil:** qa
**Tarjeta:** `t_4fb71c5e` (implementación) · `t_3765ec8e` (corrección)
**Rama:** `wt/t_3765ec8e`

## Objetivo

Automatizar navegador real sobre `next start` para verificar de punta a punta el
Incremento 1R, en viewports de escritorio (1366×900) y móvil (390×844),
capturando traza y captura en el primer fallo y comprobando la ausencia de datos
reales. La suite vive en `e2e/` (ver `e2e/README.md`) y usa una SQLite temporal
con las migraciones reales, el seed y un escenario ficticio adicional.

## Cómo ejecutarla

```bash
./e2e/preparar.sh                      # BD temporal + migraciones + seed + escenario
source e2e/smoke.env && PORT=3113 ./node_modules/.bin/next start   # servidor
cd e2e && source smoke.env && BASE=http://localhost:3113 node smoke.mjs   # suite
```

## Cobertura por criterio

| Criterio | Sección | Resultado |
|---|---|---|
| Login y destino correcto por rol (ADMIN→/admin, DOCENTE temporal→/cuenta/contrasena, ESTUDIANTE→/) | 2, 3 | PASS |
| Cambio obligatorio de contraseña del DOCENTE (no entra a la maqueta antes) | 3 | PASS |
| Selector y persistencia de contexto DOCENTE+ADMIN | 4 | PASS |
| Navegación por rol (nav exacta ADMIN/DOCENTE/ESTUDIANTE) | 2, 3 | PASS |
| Protección de todas las rutas no públicas (sin sesión, por rol) | 1, 2 | PASS |
| CRUD de usuarios (alta DOCENTE/ESTUDIANTE/ADMIN-puro, edición, desactivación con revocación, promoción, último ADMIN, combinación inválida, duplicado) | 5 | PASS |
| CRUD de estructura (área, grado, grupo; borrado bloqueado por relaciones) | 6 | PASS |
| CSV válido, inválido, duplicados y descarga única | 7 | PASS |
| Asignaciones, cruces de horario, reactivación y reasignación | 8 | PASS |
| Asociación y traslado de estudiantes con historial | 9 | PASS |
| Mi curso: aislamiento horizontal, 404 anti-enumeración, restablecimiento múltiple con descarga única | 10 | PASS |
| Credenciales estudiantiles de un solo uso (anterior invalidada, nueva entra) | 5, 10 | PASS |
| Cierre de año al 100 % e inmutabilidad posterior | 11 | PASS |
| Ejecución en escritorio y móvil (sin scroll horizontal, una sola `<main>`) | 2, 3, 6, 8, 10 | PASS |
| Cierre de sesión | 2 | PASS |
| Ausencia de datos reales (sin cédula/documento/identidad; CSV solo correo+clave) | 1, 5, 6, 7, 12 | PASS |

## Resultado

- `node smoke.mjs` (Chromium real, playwright-core 1.62.1, declarado como
  `devDependency` bloqueada): **304/304 PASS**.
- `npm test`: 168/168 · `npm run lint`: 0 problemas · `npm run build`: OK (sin cambios de fuente; suite y docs fuera de `src/`).

## Portabilidad y redacción de credenciales (corrección `t_3765ec8e`)

- `playwright-core@1.62.1` está declarado y bloqueado como `devDependency` en
  `package.json`; `npm install` lo deja en `node_modules`. Se eliminó el fallback
  a un proyecto externo (`~/Documentos/taskflow_personal`): la suite se resuelve
  únicamente desde el repo (`PLAYWRIGHT_CORE_DIR` opcional) y nunca asume rutas
  de otra máquina. Chromium se resuelve desde `CHROMIUM_PATH`,
  `PLAYWRIGHT_BROWSERS_PATH` o los cachés habituales (`~/.cache/ms-playwright`,
  `~/.pw-browsers`); `npx playwright-core install chromium` lo deja donde la
  suite lo detecta.
- `DATABASE_URL` queda aislada y comprobable: `e2e/preparar.sh` la fija a
  `file:<repo>/e2e/smoke.db`, regenera `e2e/smoke.env` en cada corrida, ignora
  cualquier valor previo del entorno y aborta con guarda si el valor no es el
  esperado; `migrate deploy` y `seed` solo apuntan a esa base temporal.
- Ninguna contraseña se imprime ni persiste: `smoke-resultado.txt` redacta toda
  clave (los detalles muestran `[REDACTADO]` o un resumen sin valores), y los CSV
  de credenciales descargados (`credenciales-e2e.csv`, `descarga-mi-curso.csv`)
  se eliminan de disco al terminar, también si la suite falla (handler de
  limpieza en `exit`).

## Mecanismo de traza en fallo

Cada contexto inicia el trazado de Playwright (`screenshots` + `snapshots`). En el
primer fallo se guarda `e2e/capturas/fallo.png` y `e2e/trazas/fallo-traza.zip`;
el proceso termina con código distinto de cero. Durante la calibración el
mecanismo se disparó y dejó evidencia; la ejecución final quedó limpia (304/304).

## Datos ficticios

Todas las cuentas usan el dominio `@miduho.test` (ADMIN, DOCENTE, ESTUDIANTE del
seed; `mixta@miduho.test`, `docente-b@miduho.test` y `estudiante2…7@miduho.test`
del escenario). No se usan nombres, cédulas ni documentos reales; la suite
verifica que ninguna pantalla autenticada muestre marcadores de identidad real y
que los CSV de credenciales contengan únicamente `correo,contrasena`.

## Notas

- El panel `/admin/estructura` crea sus registros mediante `<form>` cuyos botones
  de guardado no llevan `type="submit"` explícito; la suite los selecciona por
  `form[aria-label=…] button` (no por `button[type=submit]`), ya que el HTML
  resuelve el tipo en tiempo de ejecución.
- Las mutaciones que recargan la página en el cliente se validan esperando que el
  contenido esperado aparezca/desaparezca (`waitForFunction`), no con
  `waitForLoadState("networkidle")`, que puede resolver antes del `reload()`.
- El cierre de año se ejecuta al final de la suite para no invalidar las pruebas
  de Mi curso y de la experiencia del estudiante que dependen del año ACTIVO.
