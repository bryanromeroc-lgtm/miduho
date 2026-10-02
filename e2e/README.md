# E2E del Incremento 1R (INC1R-13)

Suite de navegador real (Chromium + playwright-core) que valida de punta a punta el
Incremento 1R sobre `next start`, en viewports de escritorio (1366×900) y móvil
(390×844). Todos los datos son ficticios; la suite verifica además la ausencia de
datos reales y captura traza Playwright + captura en el primer fallo.

## Prerrequisitos

- Build del proyecto: `npm run build` (genera `.next` y `src/generated/prisma`).
- `playwright-core` disponible (se toma de otro proyecto de la máquina; ver
  variables de entorno más abajo) y un binario de Chromium instalado.
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

El resultado queda en `e2e/smoke-resultado.txt`; las capturas en `e2e/capturas/`
y, si algo falla, la traza en `e2e/trazas/fallo-traza.zip` junto con
`e2e/capturas/fallo.png`.

## Variables de entorno opcionales

| Variable | Default | Uso |
|---|---|---|
| `PLAYWRIGHT_CORE_DIR` | `/home/server/Documentos/taskflow_personal` | carpeta que expone `playwright-core` |
| `CHROMIUM_PATH` | `~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome` | binario de Chromium |
| `BASE` | `http://localhost:3113` | URL del servidor `next start` |

## Cobertura

La suite (287 comprobaciones) cubre: login y destino por rol; cambio obligatorio
de contraseña del DOCENTE; selector y persistencia de contexto DOCENTE+ADMIN;
navegación por rol; rutas protegidas (sin sesión, ESTUDIANTE, DOCENTE, ADMIN
puro); CRUD de usuarios (alta DOCENTE/ESTUDIANTE/ADMIN-puro, edición,
desactivación con revocación, promoción a DOCENTE+ADMIN, último ADMIN protegido,
combinación inválida, duplicado); CRUD de estructura (áreas, grados, grupos,
borrado bloqueado por relaciones); CSV válido e inválido (plantillas, vista
previa por fila, todo-o-nada, duplicados, descarga única); asignaciones y cruces
de horario; traslado de estudiantes con historial; Mi curso (aislamiento
horizontal, 404 anti-enumeración, restablecimiento múltiple con descarga única);
cierre de año al 100 % e inmutabilidad; cierre de sesión; y ausencia de datos
reales en toda la experiencia autenticada.

> La credencial de un docente recién creado y el restablecimiento múltiple se
> validan comprobando que la contraseña anterior deja de funcionar y la nueva
> entra, sin conservar las contraseñas en disco.
