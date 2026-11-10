## 1. PostgreSQL local y adaptador

- [x] 1.1 Crear `docker-compose.dev.yml` en la raíz con `postgres:17-alpine`, volumen propio, puerto solo en `127.0.0.1:5432` y `healthcheck` con `pg_isready`
- [x] 1.2 Reemplazar `@prisma/adapter-libsql` y `@libsql/client` por `@prisma/adapter-pg` y `pg` en `apps/web/package.json`
- [x] 1.3 Cambiar `provider` a `postgresql` en `schema.prisma` y quitar el comentario de «pendiente de hospedaje»
- [x] 1.4 Actualizar `src/server/db.ts`, `prisma.config.ts`, `prisma/seed.ts`, `scripts/poblar-demo.ts`, `scripts/qa-fixtures.ts` y `e2e/escenario.ts` para usar `PrismaPg` y fallar sin `DATABASE_URL`, sin respaldo a `file:./dev.db`
- [x] 1.5 Actualizar `.env.example` con una `DATABASE_URL` de PostgreSQL local y retirar `dev.db*` del flujo documentado

## 2. Línea base de migraciones y paridad de reglas

- [x] 2.1 Inventariar en una tabla (regla → migración SQLite → mecanismo en PostgreSQL) cada `TRIGGER` y `CHECK` de las 7 migraciones actuales
- [x] 2.2 Mover las migraciones SQLite a `prisma/migrations-sqlite-archivo/` y actualizar `migration_lock.toml` a `postgresql`
- [x] 2.3 Generar `0001_base_postgresql` con `prisma migrate diff --from-empty --to-schema`
- [x] 2.4 Añadir a `0001_base_postgresql` los `CHECK`, índices únicos parciales y funciones PL/pgSQL del inventario, conservando los códigos de error (`ROL_NO_PERMITIDO`, `COMBINACION_ROLES_INVALIDA`, etc.)
- [x] 2.5 Verificar que `src/server/errores.ts` traduce los errores de PostgreSQL (`P0001`/mensaje) igual que los de SQLite
- [x] 2.6 Comprobar que `prisma migrate deploy` sobre una base vacía y `prisma migrate diff` no reportan diferencias, y que la semilla corre dos veces sin duplicar

## 3. Pruebas contra PostgreSQL

- [x] 3.1 Crear `tests/soporte/base-pruebas.ts`: `globalSetup` que migra `miduho_plantilla` y helper que crea y elimina `miduho_test_<id>` con `TEMPLATE`
- [x] 3.2 Migrar `tests/integracion/*.test.ts` y los `*.test.ts` de `src/server/**` que abren SQLite al nuevo helper
- [x] 3.3 Reescribir `migraciones.test.ts` y `migraciones-inc1r.test.ts` para que prueben cada regla del inventario (2.1) contra PostgreSQL
- [x] 3.4 Mensaje claro cuando no hay PostgreSQL alcanzable («ejecuta `docker compose -f docker-compose.dev.yml up -d`»)
- [x] 3.5 `npm test`, `npm run lint` y `npm run build` pasan; el E2E de navegador pasa contra PostgreSQL

## 4. Imagen de la app

- [x] 4.1 Añadir `output: "standalone"` en `apps/web/next.config.ts`, leyendo antes la guía de self-hosting en `node_modules/next/dist/docs/`
- [x] 4.2 Crear `src/app/api/health/route.ts` (`SELECT 1` con tope de 2 s; `200 {"estado":"ok"}` / `503`) y excluirlo de la protección de `src/proxy.ts`, con prueba
- [x] 4.3 Marcar `unoptimized` en los `next/image` que apuntan a `/libros/*` (`portada.tsx` y los que aparezcan al buscar)
- [x] 4.4 Escribir el `Dockerfile` multietapa (`deps` → `builder` → `runner`, `node:22-alpine`, usuario `node`) y el `.dockerignore` de la raíz
- [x] 4.5 Verificar que la imagen se construye desde un clon limpio, que no contiene `content/`, `.env*` ni `*.db`, y que el proceso no corre como root

## 5. Stack de producción

- [x] 5.1 Escribir `docker-compose.yml` con `proxy`, `app`, `migrate` (`target: builder`, `prisma migrate deploy`), `db` y `backup`; redes `web` y `datos` (interna); `healthcheck`, `restart`, `depends_on` con condiciones, límites de memoria y rotación de logs
- [x] 5.2 Escribir `deploy/Caddyfile`: HTTPS (dominio o `tls internal` según variable), redirección HTTP→HTTPS, compresión, cabeceras de seguridad, `/libros/*` con `file_server` desde `/srv/libros:ro` y caché larga, y `reverse_proxy app:3000`
- [x] 5.3 Crear `.env.production.example` con todas las variables de `app`, `migrate`, `db`, `backup` y `proxy`, y confirmar que `.gitignore` excluye `.env.production`
- [x] 5.4 Probar el stack completo en local: arranque en orden, base no expuesta, inicio de sesión detrás del proxy con cookie `Secure`, libros con `Cache-Control` y migración fallida que no arranca la app

## 6. Operación

- [x] 6.1 Configurar `backup` con programación diaria y rotación 7/4/6 hacia `./respaldos`, con versión de imagen fijada
- [x] 6.2 Escribir `deploy/restore.sh` y probar una restauración en una base aparte comparando conteos por tabla
- [x] 6.3 Escribir `deploy/deploy.sh` (imagen → respaldo → migrate → app → espera de `/api/health` con 60 s de tope → logs si falla) y la verificación de carpetas de libros contra el catálogo
- [ ] 6.4 Escribir el escenario k6 en `tests/carga/` (250 VU, 10 min: inicio de sesión, inicio, biblioteca, abrir libro, mi curso) con umbrales p95 < 500 ms y errores < 1 %, y ejecutarlo contra el stack
- [x] 6.5 Documentar en `docs/operacion.md`: arranque local en menos de 30 min, primer despliegue, actualización, restauración, copia de respaldos fuera del servidor, monitor externo de `/api/health` y bitácora mensual de restauración
- [x] 6.6 Actualizar `AGENTS.md` y `docs/arquitectura-backend.md` (stack: PostgreSQL; despliegue: Docker Compose) y cerrar en `docs/plan-mvp/00-decisiones-pendientes.md` lo que quede decidido
