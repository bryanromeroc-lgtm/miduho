## Why

MIDUHO solo corre en desarrollo: SQLite en un archivo local, sin imagen de contenedor, sin proxy con HTTPS, sin respaldos y con los libros en una carpeta fuera de git. Para tener una plataforma productiva (y para construir encima el motor de actividades, que necesita PostgreSQL) hay que dejar listo un despliegue reproducible con Docker Compose que una sola persona pueda operar.

## What Changes

- **BREAKING** La base de datos pasa de SQLite a **PostgreSQL** en todos los entornos (desarrollo, pruebas, producción). Las migraciones se rehacen como una línea base nueva para PostgreSQL; las reglas que hoy viven en triggers de SQLite (`RAISE(ABORT, …)`) se reimplementan con `CHECK`, índices únicos parciales o funciones PL/pgSQL que conservan los mismos códigos de error. No hay datos reales que migrar.
- Las pruebas de integración dejan de crear archivos SQLite temporales y corren contra un PostgreSQL de pruebas (una base aislada por suite, clonada de una plantilla migrada).
- Imagen de contenedor de la app con salida `standalone` de Next.js, multietapa, sin privilegios y con `GET /api/health`.
- `docker-compose.yml` de producción con los servicios `proxy` (Caddy), `app`, `migrate` (de un solo uso), `db` (PostgreSQL) y `backup`; y `docker-compose.dev.yml` que solo levanta PostgreSQL para desarrollo local.
- Los libros (`content/libros`, fuera de git) se montan como volumen de solo lectura y Caddy los sirve directo con caché larga.
- Secretos en `.env.production` (no versionado) con plantilla `.env.production.example` versionada.
- Respaldos diarios con `pg_dump`, rotación y procedimiento de restauración probado; scripts `deploy.sh` y `restore.sh`.
- Prueba de carga (k6) que verifica los requisitos no funcionales acordados.

## Capabilities

### New Capabilities

- `persistencia-postgresql`: PostgreSQL como único motor de base de datos, migraciones con paridad de reglas de integridad, y pruebas de integración contra PostgreSQL.
- `despliegue-contenedores`: imagen de la app, stack de Docker Compose, proxy con HTTPS y cabeceras de seguridad, servicio de los libros, secretos, chequeo de salud y despliegue con migraciones controladas.
- `operacion-plataforma`: respaldos y restauración, logs, requisitos no funcionales medibles (concurrencia, latencia, disponibilidad, RPO/RTO) y su verificación con prueba de carga.

### Modified Capabilities

(Ninguna: `openspec/specs/` aún no tiene especificaciones.)

## Impact

- `apps/web/prisma/schema.prisma` (`provider`), `prisma/migrations/` (línea base nueva), `prisma.config.ts`, `prisma/seed.ts`.
- `apps/web/src/server/db.ts`, `scripts/poblar-demo.ts`, `scripts/qa-fixtures.ts`, `e2e/escenario.ts`: adaptador `@prisma/adapter-pg` en lugar de `@prisma/adapter-libsql`.
- Pruebas que hoy abren SQLite (`tests/integracion/*`, `src/server/**/*.test.ts`): nuevo helper de base de pruebas.
- `apps/web/next.config.ts` (`output: "standalone"`), componentes que usan `next/image` con rutas `/libros/*`.
- Archivos nuevos en la raíz: `Dockerfile` (o `apps/web/Dockerfile`), `.dockerignore`, `docker-compose.yml`, `docker-compose.dev.yml`, `deploy/Caddyfile`, `deploy/*.sh`, `.env.production.example`, `apps/web/src/app/api/health/route.ts`.
- Dependencias: se agregan `@prisma/adapter-pg` y `pg`; se retiran `@prisma/adapter-libsql` y `@libsql/client`.
- Sin cambios en la autenticación: estudiantes, docentes y administración siguen entrando con usuario y contraseña como hoy.
