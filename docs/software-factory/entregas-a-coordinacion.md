# Entregas a coordinación · tarjeta de implementación

## Alcance y criterio de aceptación

Cambio OpenSpec [`entregas-a-coordinacion`](../../openspec/changes/entregas-a-coordinacion/tasks.md): conexión de Drive para `ADMIN`, solicitudes y tablero en Coordinación, entregas de `DOCENTE` con versiones y aviso en Hoy. Se aceptará al cumplir las specs del cambio, WCAG 2.1 AA y las verificaciones del repositorio. 🔶 La arquitectura basada en una carpeta elegida en Google Picker depende del spike D10.

## Archivos previstos

`apps/web/prisma/`, `apps/web/src/lib/entregas.ts`, `apps/web/src/server/integraciones/google/`, `apps/web/src/server/modules/entregas/`, `apps/web/src/features/entregas/`, rutas de `apps/web/src/app/`, `.env.production.example`, `apps/web/.env` (local, sin versionar), `deploy/Caddyfile`, `docs/operacion.md` y pruebas junto a la lógica nueva.

## Verificación

`npm run lint`, `npm run build`, `npm test`, migración contra PostgreSQL de desarrollo y prueba manual del flujo de Google con cuenta de prueba.

## Evidencia de esta sesión

- 1.2 completada: documentación local de Next.js 16 leída en `01-app/01-getting-started/15-route-handlers.md`, `01-app/03-api-reference/03-file-conventions/route.md`, `01-app/02-guides/backend-for-frontend.md`, `01-app/02-guides/server-actions.md`, `01-app/03-api-reference/05-config/01-next-config-js/serverActions.md` y `01-app/03-api-reference/04-functions/cookies.md`.
- `request.formData()` procesa multipart en Route Handlers; la documentación no describe un límite de cuerpo propio para estos handlers. El límite predeterminado de 1 MB y `serverActions.bodySizeLimit` corresponden a Server Actions. Las cookies se leen y modifican con `await cookies()` en Route Handlers; los parámetros de ruta son asíncronos.
- 🔶 1.1 pendiente: no hay variables de Google configuradas en `apps/web/.env`; el spike necesita una cuenta personal de prueba, un proyecto OAuth en modo «Prueba», Picker y una comprobación al día siguiente. No se ha supuesto que `drive.file` permita escribir en la carpeta elegida desde el servidor.

## Implementación y QA · 2026-11-11

- Modelo y cuatro migraciones aditivas en `apps/web/prisma/`; seed ficticio sin integración ni archivos. Las migraciones se aplicaron a PostgreSQL de desarrollo.
- Lógica pura de estados, fechas, nombres y firmas; integración OAuth con PKCE, desafío de un solo uso en PostgreSQL, cifrado AES-256-GCM y cliente Drive con doble de pruebas. Subida multipart hasta 5 MB y sesión resumable por encima de 5 MB, según la guía oficial de Drive.
- Servicio de solicitudes y versiones; pantallas de coordinación y docente, avisos en Cuenta y Hoy, y guía de operación. La cuenta de Google reconectada con otro correo obliga a elegir otra vez la carpeta de cada solicitud abierta.
- Pruebas específicas: `apps/web/src/lib/entregas.test.ts`, `apps/web/src/server/integraciones/google/{cifrado,oauth}.test.ts`, `apps/web/src/app/api/integraciones/google/retorno/route.test.ts` y `apps/web/tests/integracion/entregas.test.ts` en verde. `npm test`: 81 archivos, 874 pruebas en verde.
- `docker compose config --quiet` y `caddy validate` en verde con valores de configuración ficticios; `impeccable detect` no reportó hallazgos mecánicos.
- Auditoría de rutas autenticadas en `docs/accessibility/audits/`: 0 infracciones confirmadas por axe; contraste sobre el fondo ilustrado quedó inconcluso. La revisión móvil y el foco por teclado del selector se documentaron allí. 🔶 No se declara conformidad WCAG 2.1 AA todavía.
- 🔶 Spike D10 y prueba punta a punta con Google real pendientes: faltan credenciales y cuenta de prueba. El código del Picker y la permanencia del permiso `drive.file` no se han validado contra Google.
- Gate de código: `npm run build` (Next.js 16, rutas nuevas incluidas), `npm run lint` y `npm test` (81 archivos, 874 pruebas) completados en verde el 2026-11-11. Después se acotó el manejo de 404 en el tablero; `npx tsc --noEmit` pasó. 🔶 Se repetirá el gate completo antes del cierre definitivo con Google real.
