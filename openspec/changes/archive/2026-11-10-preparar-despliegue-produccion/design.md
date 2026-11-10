## Context

- `apps/web` es una app Next.js 16 full-stack: las páginas, los Route Handlers de `/api/*` y Auth.js v5 (sesión JWT de 8 h, revocada por `versionSesion`) corren en un mismo proceso. No hay backend aparte.
- Prisma 7 con `@prisma/adapter-libsql` sobre SQLite. Las 7 migraciones contienen 21 sentencias `TRIGGER`/`RAISE(ABORT, …)` propias de SQLite, más varios `CHECK`.
- Las pruebas de integración y de módulos crean archivos `test.db` temporales con `@libsql/client`.
- `apps/web/public/libros` es un enlace simbólico a `content/libros` (196 MB, unas 80 obras, ~51 KB por página), que está fuera de git. El catálogo (`src/features/biblioteca/libros.ts`) solo referencia URLs `/libros/<slug>/…`, y `portada.tsx` las pasa a `next/image`.
- El limitador de recuperación (`src/server/auth/limite.ts`) y el bloqueo por intentos fallidos (`src/server/auth/intentos.ts`) viven en memoria del proceso.
- Una sola persona opera la plataforma. Es un solo colegio, con unas 700 cuentas (250 estudiantes).
- Hospedaje sin decidir (D-08 en `docs/plan-mvp/00-decisiones-pendientes.md`). El diseño sirve para un VPS con dominio público y también para un servidor en la LAN del colegio.

## Goals / Non-Goals

**Goals:**
- Desplegar con un solo `docker compose up -d` en un servidor Linux con Docker.
- PostgreSQL como único motor, sin perder ninguna regla de integridad.
- Respaldos automáticos y restauración probada que cumplan RPO 24 h y RTO 4 h.
- Cumplir los requisitos no funcionales acordados y comprobarlos con una prueba de carga.

**Non-Goals:**
- Cambiar la librería de autenticación (Better Auth queda como decisión aparte; D-07).
- Tiempo real o salas en vivo.
- Almacenamiento de objetos (S3/MinIO) o CDN externo: los libros siguen en disco del servidor por ahora.
- CI/CD con GitHub Actions y publicación de imágenes en un registro (ARQ-13/ARQ-14, cambio posterior).
- Varias instancias de la app o alta disponibilidad.
- Motor de actividades (cambio `fundacion-actividades`).

## Decisions

### D1. PostgreSQL 17 con `@prisma/adapter-pg`
Prisma 7 usa adaptadores de driver; para PostgreSQL el oficial es `@prisma/adapter-pg` sobre `pg`. Se fija `postgres:17-alpine`: versión estable vigente con soporte largo. El plan anterior mencionaba la 16; el esquema no usa nada que las diferencie.
- *Alternativa:* seguir con SQLite en un volumen. Descartada: el motor de actividades necesita `JSONB`, los respaldos en caliente son más simples en PostgreSQL y cada trigger nuevo en SQLite aumenta el costo de migrar después.

### D2. Línea base nueva de migraciones en lugar de traducir las 7
No hay datos reales en ningún entorno, así que se archivan las migraciones SQLite (`prisma/migrations-sqlite-archivo/`, solo como referencia) y se genera `0001_base_postgresql` con `prisma migrate diff --from-empty`. Luego se añade a mano el SQL de integridad, en este orden de preferencia:
1. `CHECK` nativo (listas de valores, rangos de fechas).
2. Índice único parcial (`CREATE UNIQUE INDEX … WHERE …`) para las unicidades condicionales.
3. Función PL/pgSQL más trigger `BEFORE INSERT OR UPDATE` para las reglas entre tablas, con `RAISE EXCEPTION 'ROL_NO_PERMITIDO'` y los demás códigos, para que `src/server/errores.ts` siga traduciéndolos igual.
- *Alternativa:* traducir migración por migración. Descartada: más trabajo sin beneficio, porque nadie tiene una base SQLite que actualizar.

### D3. Base de pruebas: plantilla migrada y una base por suite
Un `globalSetup` de Vitest migra una vez una base `miduho_plantilla`. Cada suite crea `miduho_test_<id>` con `CREATE DATABASE … TEMPLATE miduho_plantilla`, que tarda milisegundos, y la elimina al terminar. Las suites quedan aisladas y pueden correr en paralelo, como hoy con los archivos temporales.
- *Alternativa:* un esquema por suite con `search_path`. Descartada: los triggers y funciones quedan ligados al esquema y complican la plantilla.
- *Alternativa:* Testcontainers. Descartada por ahora: añade dependencia y tiempo de arranque. Basta con el PostgreSQL de `docker-compose.dev.yml`.

### D4. Imagen `standalone` en tres etapas
`deps` (`npm ci`) → `builder` (`prisma generate` y `next build` con `output: "standalone"`) → `runner` (`node:22-alpine`, usuario `node`, solo `.next/standalone`, `.next/static` y `public` sin `libros`). El contexto de construcción es la raíz del monorepo, con `.dockerignore` que excluye `content/`, `.env*`, `*.db`, `node_modules`, `.next`, `output/`, `docs/` y las carpetas de agentes.
- El servicio `migrate` usa la etapa `builder` (`target: builder`), que tiene la CLI de Prisma, y ejecuta `prisma migrate deploy`. La CLI no entra en la imagen final.
- Las imágenes se construyen en el servidor (`docker compose build`) mientras no exista CI. Publicarlas en GHCR queda para ARQ-13.

### D5. Caddy como proxy
Caddy obtiene y renueva el certificado solo (Let's Encrypt con dominio público; `tls internal` si el hospedaje termina en la LAN). Necesita una configuración corta y no requiere acceso al socket de Docker.
- *Alternativas:* Nginx más certbot (un contenedor más y la renovación aparte) y Traefik (pensado para muchos servicios dinámicos y pide `docker.sock`).

### D6. Libros servidos por Caddy desde un volumen de solo lectura
`content/libros` se monta en `proxy` como `/srv/libros:ro` y Caddy responde `/libros/*` con `file_server` y `Cache-Control: public, max-age=2592000, immutable`. La app nunca ve esos archivos.
- Next.js solo sirve los archivos que había en `public/` al construir, y su optimizador de imágenes pediría `/libros/*` a sí mismo y fallaría. Por eso los `next/image` que apuntan a `/libros/*` llevan `unoptimized`: las páginas ya están en webp al tamaño final, así que optimizarlas no aporta nada.
- El enlace simbólico `public/libros` se mantiene para `next dev`, y `.dockerignore` lo excluye.
- *Alternativa:* copiar los libros a la imagen. Descartada: no están en git y harían la imagen 200 MB más pesada en cada despliegue.

### D7. Una sola instancia de la app
Con 250 usuarios, un proceso con 2 vCPU tiene margen de sobra. Una instancia permite mantener el limitador y el bloqueo en memoria, y la sesión JWT sin almacenamiento compartido. Si algún día se escala a dos instancias, primero hay que llevar ambos a PostgreSQL.

### D8. Respaldos con un contenedor de `pg_dump` programado
El servicio `backup` usa una imagen mantenida que hace `pg_dump` con programación y rotación diarias/semanales/mensuales (`prodrigestivill/postgres-backup-local:17-alpine-d257e5d`) y escribe en `./respaldos` del host. Sacar la copia fuera del servidor (rclone u otro destino) queda documentado como paso del operador.
- *Alternativa:* PITR con WAL-G. Descartada por ahora: es más compleja y el RPO acordado es de 24 h.

### D9. Variables y arranque
- `src/server/db.ts`, `prisma.config.ts` y los scripts dejan de usar `?? "file:./dev.db"`. Sin `DATABASE_URL`, el proceso falla con un mensaje claro.
- Detrás del proxy: `AUTH_URL=https://<dominio>` y `AUTH_TRUST_HOST=true`.
- `/api/health` ejecuta `SELECT 1` con tope de 2 s y queda fuera del `matcher` de `src/proxy.ts`, para no exigir sesión.
- `src/instrumentation.ts` comprueba `DATABASE_URL` y `AUTH_SECRET` al iniciar y termina el proceso con un mensaje que nombra la variable (un error en `register()` solo se registra y deja el servidor vivo pero roto). `docker-compose.yml` exige además las variables con `${VAR:?…}`.

## Risks / Trade-offs

- [Una regla de integridad de SQLite se pierde en la traducción] → Inventario de los 21 triggers y los `CHECK` como lista de tareas, con una prueba de integración por regla antes de borrar las migraciones viejas.
- [Diferencias de comportamiento entre SQLite y PostgreSQL: comparación de texto, fechas, `Boolean` como 0/1] → La suite completa corre contra PostgreSQL y se revisan los `CHECK (... IN (0, 1))`, que dejan de tener sentido con `boolean` nativo.
- [Un solo servidor es punto único de falla] → Aceptado para un colegio. Se mitiga con respaldos fuera del servidor y un RTO de 4 h documentado y ensayado.
- [El volumen de libros queda desincronizado con el catálogo en código] → `deploy.sh` verifica que cada `slug` del catálogo tenga su carpeta en `content/libros` y avisa si falta alguna.
- [Construir en el servidor consume CPU en horario de clase] → Desplegar fuera del horario escolar; GHCR más adelante.
- [El limitador de recuperación (`limite.ts`) y el bloqueo por intentos fallidos de inicio de sesión (`intentos.ts`) viven en memoria: un reinicio los borra y un atacante gana intentos con cada despliegue] → Aceptado en este cambio porque los despliegues son esporádicos y fuera de horario. Llevar ambos a PostgreSQL queda como deuda explícita, obligatoria antes de tener dos instancias.

- [`docker compose up -d` recrea `app` antes de esperar a `migrate`: con una migración fallida, el contenedor viejo ya se eliminó y la plataforma queda caída (comprobado al implementar)] → Las actualizaciones pasan por `deploy/deploy.sh`, que ejecuta `migrate` aparte (`run --rm`) y solo reinicia `app` (`up -d --no-deps`) si terminó con 0. `depends_on` se conserva para el orden de arranque en un servidor limpio.
- [`contains` en PostgreSQL distingue mayúsculas; en SQLite (`LIKE`) no] → Las búsquedas de `academico` y `usuarios` usan `mode: "insensitive"`.

## Migration Plan

1. Levantar `docker-compose.dev.yml` y cambiar el adaptador. Generar la línea base y portar las reglas con sus pruebas.
2. Adaptar las pruebas a la base por suite. `npm test`, `npm run lint` y `npm run build` deben pasar.
3. Añadir `standalone`, `/api/health`, `Dockerfile`, `.dockerignore` y `unoptimized` en las imágenes de `/libros`.
4. Escribir `docker-compose.yml`, `Caddyfile`, `.env.production.example` y los scripts. Probar todo el stack en local con `tls internal`.
5. Probar los respaldos y la restauración. Ejecutar la prueba de carga contra el stack local y luego contra el servidor real.
6. Primer despliegue en el servidor elegido. Volver atrás es trivial porque no hay producción previa: basta con `docker compose down`.

## Open Questions

- 🔶 Hospedaje (D-08): ¿VPS con dominio público o servidor del colegio? Define el modo TLS de Caddy y a dónde se copian los respaldos.
- 🔶 Dominio definitivo y correo SMTP de producción.
- 🔶 Recursos del servidor. Se propone un mínimo de 2 vCPU, 4 GB de RAM y 40 GB de disco, a confirmar con la prueba de carga.
