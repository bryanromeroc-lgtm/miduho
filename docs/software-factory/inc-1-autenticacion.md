# Inc. 1 · Autenticación: login y recuperación de contraseña (t_85913f5b)

Tarjeta: `t_85913f5b` · Rama: `backend/t_85913f5b-auth` · Historias: HU-01 (login), HU-02 (recuperación).
Diseño de referencia: [arquitectura-backend.md §5](../arquitectura-backend.md).

## Alcance implementado

| Pieza | Archivo | Estado |
|---|---|---|
| Esquema Prisma de acceso (Usuario, Rol, UsuarioRol, RestablecimientoContrasena) + migración `auth` | `prisma/schema.prisma`, `prisma/migrations/` | Implementado |
| Config Prisma 7 (adaptador libSQL/SQLite en dev) | `prisma.config.ts`, `src/server/db.ts` | Implementado |
| Auth.js v5 Credentials + JWT (roles en el token) | `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` | Implementado |
| Hash bcrypt (costo 12), token de recuperación SHA-256, vigencia 24 h, un solo uso | `src/server/auth/contrasena.ts`, `recuperacion.ts` | Implementado |
| Bloqueo temporal: 5 fallos en 15 min → 15 min bloqueado | `src/server/auth/intentos.ts` | Implementado (en memoria, 🔶 ver pendientes) |
| Validación Zod y mensajes en español | `src/server/auth/esquemas.ts` | Implementado |
| Pantallas `/login`, `/recuperar`, `/recuperar/nueva`, `/cuenta` | `src/app/(auth)/…`, `src/app/cuenta/page.tsx` | Implementado |
| Check optimista de sesión (solo `/cuenta`) | `src/proxy.ts` | Implementado |
| Envío de correo SMTP (consola en dev) | `src/server/correo.ts` | Implementado |
| Seed: 5 roles + cuenta admin **ficticia** | `prisma/seed.ts` | Implementado |

Decisiones tomadas en la tarjeta:

- **Sin Google SSO** en el Inc. 1, según §5 de la arquitectura ("autenticación propia"). Se puede añadir un proveedor OAuth después sin cambiar el modelo.
- Errores de login **genéricos** y comparación contra un hash señuelo cuando el correo no existe (no revela existencia por tiempo).
- La solicitud de recuperación responde igual exista o no la cuenta; invalida enlaces previos sin usar; el consumo del token es atómico.
- `/recuperar/nueva` usa `referrer: no-referrer` y `noindex` porque el token viaja en la URL.
- Redirección post-login solo a rutas internas (`?desde=` no permite URLs externas).
- Prisma 7 genera el cliente en `src/generated/prisma` (ignorado en git; `postinstall` y `build` ejecutan `prisma generate`).

## Verificación (2026-10-01, servidor local)

| Comando / escenario | Resultado |
|---|---|
| `npx vitest run` (7 pruebas: bcrypt, token, esquemas, bloqueo) | ✅ 7/7 |
| `npm run lint` | ✅ sin errores |
| `npm run build` | ✅ compila; rutas `/login`, `/recuperar`, `/recuperar/nueva`, `/cuenta`, `/api/auth/[...nextauth]`, Proxy |
| `next start` · `/cuenta` sin sesión | ✅ 307 → `/login?desde=%2Fcuenta` |
| Login con contraseña incorrecta | ✅ rechazado (`CredentialsSignin`) |
| Login correcto (cuenta ficticia del seed) | ✅ sesión JWT con `roles: ["ADMIN"]`; `/cuenta` 200 |
| 5 fallos seguidos → contraseña correcta | ✅ rechazada (bloqueo activo) |
| Recuperación: correo inexistente | ✅ no envía correo, misma respuesta |
| Recuperación: token guardado | ✅ solo hash SHA-256, nunca plano |
| Token falso / reusado / vencido | ✅ `token-invalido` |
| Token válido → nueva contraseña → login | ✅ funciona |

## Pendientes y riesgos (🔶)

- 🔶 **Bloqueo en memoria**: vale para un solo proceso. Con varias instancias, pasar a tabla `LoginIntentos` o caché compartida.
- 🔶 **Política de contraseña** (10+ caracteres, letra y número): propuesta; confirmar con el colegio.
- 🔶 **SMTP**: falta definir proveedor (Resend/SMTP del colegio). Sin `SMTP_HOST` en producción no se envía el correo (se registra error).
- 🔶 **Producción**: requiere `AUTH_SECRET`, `AUTH_URL` y `AUTH_TRUST_HOST=true` detrás de proxy inverso; PostgreSQL pendiente de la decisión de hospedaje.
- Fuera de alcance: autorización por rol/`AsignacionDocente` (tarjeta de roles), protección de las rutas de la maqueta (decisión de producto), auditoría de accesos.
- Bloqueo por cuenta permite a un tercero bloquear a otra persona 15 minutos (trade-off aceptado de HU-01).
