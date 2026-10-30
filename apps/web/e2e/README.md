# E2E del Incremento 1R (INC1R-13)

Suite de navegador real (Chromium + playwright-core) que valida de punta a punta el
Incremento 1R sobre `next start`, en viewports de escritorio (1366×900) y móvil
(390×844). Todos los datos son ficticios; la suite verifica además la ausencia de
datos reales y captura traza Playwright + captura en el primer fallo.

## Prerrequisitos

- Build del proyecto: `npm run build` (genera `.next` y `src/generated/prisma`).
- `playwright-core` (declarado y bloqueado como `devDependency` en `package.json`;
  `npm install` lo instala). Chromium se resuelve de forma portable: primero
  `CHROMIUM_PATH`, luego `PLAYWRIGHT_BROWSERS_PATH` y los cachés habituales de
  playwright (`~/.cache/ms-playwright`, `~/.pw-browsers`). Para instalar un
  Chromium compatible ejecuta `npx playwright-core install chromium` (lo deja en
  `~/.cache/ms-playwright`, donde la suite lo detecta automáticamente). No se
  dependen de rutas de otros proyectos ni de otra máquina.
- `openssl` para generar secretos temporales del smoke.

## Cómo ejecutar

```bash
# 1. Prepara una BD SQLite temporal con migraciones reales + seed + escenario ficticio.
./e2e/preparar.sh

# 2. Levanta el servidor contra esa BD.
source e2e/smoke.env && PORT=3113 ./node_modules/.bin/next start

# 3. En otra terminal, ejecuta la suite.
cd e2e && source smoke.env && BASE=http://localhost:3113 node smoke.mjs
```

`preparar.sh` regenera `smoke.env` en cada ejecución y fija `DATABASE_URL` a la
BD temporal del smoke (`e2e/smoke.db`); nunca reutiliza un env previo ni hereda
`DATABASE_URL` del entorno, de modo que `migrate deploy` y `seed` jamás apuntan a
una base externa.

El resultado queda en `e2e/smoke-resultado.txt`; las capturas en `e2e/capturas/`
y, si algo falla, la traza en `e2e/trazas/fallo-traza.zip` junto con
`e2e/capturas/fallo.png`. La evidencia se captura tanto en una aserción fallida
como ante una excepción o rechazo no controlado.

## Variables de entorno opcionales

| Variable | Default | Uso |
|---|---|---|
| `PLAYWRIGHT_CORE_DIR` | _(autodetección)_ | carpeta que expone `playwright-core`, si no está en `node_modules` del repo |
| `PLAYWRIGHT_BROWSERS_PATH` | _(autodetección)_ | carpeta de caché de navegadores de playwright (p. ej. un `ms-playwright` custom) |
| `CHROMIUM_PATH` | _(autodetección)_ | binario de Chromium, si no está en los cachés habituales |
| `BASE` | `http://localhost:3113` | URL del servidor `next start` |

## Cobertura

La suite cubre, en escritorio (1366×900) y móvil (390×844): login y destino por
rol; cambio obligatorio de contraseña del DOCENTE; selector y persistencia de
contexto DOCENTE+ADMIN; navegación por rol; rutas protegidas (sin sesión,
ESTUDIANTE, DOCENTE, ADMIN puro); CRUD de usuarios (alta DOCENTE/ESTUDIANTE/
ADMIN-puro, edición, desactivación con revocación, promoción a DOCENTE+ADMIN,
último ADMIN protegido, combinación inválida, duplicado); CRUD de estructura
(áreas, grados, grupos, borrado bloqueado por relaciones); CSV válido e inválido
(plantillas, vista previa por fila, todo-o-nada, duplicados, descarga única);
asignaciones y cruces de horario; traslado de estudiantes con historial; Mi
curso (aislamiento horizontal, 404 anti-enumeración, restablecimiento múltiple
con descarga única); cierre de año al 100 % e inmutabilidad; cierre de sesión; y
ausencia de datos reales en toda la experiencia autenticada. Estructura,
asignaciones y el estado de año cerrado (solo lectura) se verifican además en el
viewport móvil.

> La credencial de un docente recién creado y el restablecimiento múltiple se
> validan comprobando que la contraseña anterior deja de funcionar y la nueva
> entra, sin conservar las contraseñas en disco: los CSV de credenciales
> descargados se eliminan al terminar (también si la suite falla) y toda clave
> que aparezca en el resultado se redacta como `[REDACTADO]`.
