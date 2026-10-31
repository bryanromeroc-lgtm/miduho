# Operación de MIDUHO — guía del operador

**Propósito:** levantar MIDUHO en local, desplegarlo en un servidor con Docker Compose, actualizarlo, respaldarlo y restaurarlo. Escrita para una sola persona que opera la plataforma.
**Fecha:** 2026-10-30
**Fuente:** cambio OpenSpec `preparar-despliegue-produccion` (`openspec/changes/…/design.md`), `docker-compose.yml`, `deploy/`.
**Convenciones:** 🔶 = por confirmar. Las tareas y metas de operación del plan siguen en [plan-mvp/09-operacion.md](plan-mvp/09-operacion.md).

---

## 1. Piezas

| Servicio | Imagen | Qué hace | Red |
|---|---|---|---|
| `proxy` | `caddy:2.11.7-alpine` | HTTPS, redirección HTTP→HTTPS, cabeceras de seguridad, compresión y `/libros/*` desde `content/libros` (solo lectura, caché de 30 días) | `web` (publica 80 y 443) |
| `app` | `miduho-app` (este repo, `Dockerfile`, etapa `runner`) | Next.js standalone como usuario `node`; `GET /api/health` | `web` + `datos` |
| `migrate` | `miduho-migrate` (etapa `builder`) | `prisma migrate deploy` y termina | `datos` |
| `db` | `postgres:17.11-alpine` | PostgreSQL, volumen `db-datos` | `datos` (interna, sin puertos) |
| `backup` | `prodrigestivill/postgres-backup-local:17-alpine-d257e5d` | `pg_dump` diario a las 2:00 (hora de Colombia), rotación 7 diarios / 4 semanales / 6 mensuales | `datos` |

Los logs de todos los contenedores rotan a 5 archivos de 10 MB (`docker compose logs <servicio>`).

Requisitos no funcionales que esto sostiene: 250 usuarios concurrentes, p95 < 500 ms, 99,5 % de disponibilidad en horario escolar (lunes a viernes, 6:00–18:00), **RPO 24 h** (respaldo diario) y **RTO 4 h** (§7).

---

## 2. Arranque local (menos de 30 minutos)

Requisitos: Git, Node.js 22 o superior, Docker con Compose.

```bash
git clone <repo> miduho && cd miduho
docker compose -f docker-compose.dev.yml up -d          # PostgreSQL 17 en 127.0.0.1:5432
cd apps/web
cp .env.example .env                                     # completa AUTH_SECRET y SEED_ADMIN_PASSWORD
npx auth secret                                          # o: openssl rand -base64 32
npm install
npm run db:migrate                                       # aplica prisma/migrations
npm run db:seed                                          # roles, estructura demo y ADMIN ficticio
npm run dev                                              # http://localhost:3000
npm test                                                 # usa el mismo PostgreSQL (bases miduho_test_*)
```

- Si el puerto 5432 ya está ocupado: `MIDUHO_PG_PUERTO=5433 docker compose -f docker-compose.dev.yml up -d` y cambia el puerto en `DATABASE_URL` y `TEST_DATABASE_URL` de `.env`.
- `npm test` crea `miduho_plantilla` una vez y clona una base por suite; si no encuentra PostgreSQL, las suites de integración fallan con la instrucción para levantarlo.
- Las páginas de los libros (`content/libros`, fuera de git) se copian aparte; sin ellas la biblioteca muestra imágenes rotas.

---

## 3. Primer despliegue en un servidor

Servidor Linux con Docker y Compose. Mínimo propuesto: 2 vCPU, 4 GB de RAM y 40 GB de disco 🔶 (confirmado solo con la prueba de carga local, §8).

1. **DNS y puertos.** Con dominio público, apunta el registro A/AAAA al servidor y abre 80 y 443. En la LAN del colegio basta la IP fija del servidor.
2. **Código y libros.**
   ```bash
   git clone <repo> /srv/miduho && cd /srv/miduho
   rsync -a <origen>/content/libros/ content/libros/     # o define MIDUHO_LIBROS con otra ruta
   ```
3. **Secretos.**
   ```bash
   cp .env.production.example .env.production && chmod 600 .env.production
   openssl rand -hex 24        # → POSTGRES_PASSWORD (solo letras y números: va dentro de una URL)
   openssl rand -base64 32     # → AUTH_SECRET
   ```
   - `MIDUHO_DOMINIO`: el dominio (o la IP en la LAN), sin `https://`.
   - `MIDUHO_TLS`: tu correo para Let's Encrypt, o `internal` en la LAN. Con `internal`, instala en los equipos del colegio la CA raíz de Caddy (`docker compose --env-file .env.production cp proxy:/data/caddy/pki/authorities/local/root.crt .`) para que el navegador no advierta.
   - `SMTP_*`: cuenta de correo para la recuperación de contraseña 🔶 por confirmar.
   - `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`: la cuenta administradora inicial.
4. **Desplegar.**
   ```bash
   deploy/deploy.sh
   ```
5. **Cuenta administradora inicial.**
   ```bash
   docker compose --env-file .env.production run --rm migrate npx tsx prisma/seed.ts
   ```
   Crea los tres roles, la cuenta ADMIN y la estructura académica marcada «(demo)» 🔶 (definir con el colegio si la estructura real se carga a mano y se retira la de demo). Luego **borra** `SEED_ADMIN_PASSWORD` de `.env.production` y cambia la contraseña desde la app.
6. **Comprobar.** `https://<dominio>/api/health` responde `{"estado":"ok"}`; `http://<dominio>/` redirige a HTTPS; el inicio de sesión funciona.
7. **Monitor externo** (§6) y **copia de respaldos fuera del servidor** (§5).

> Siempre `docker compose --env-file .env.production …`: sin ese archivo Compose se niega a arrancar y nombra la variable que falta. Un alias ayuda: `alias dc='docker compose --env-file .env.production'`.

---

## 4. Actualización

Fuera del horario escolar (la construcción consume CPU en el servidor):

```bash
cd /srv/miduho && git pull
deploy/deploy.sh
```

`deploy.sh` hace, en orden y deteniéndose en el primer fallo:

1. Verifica que cada libro del catálogo (`src/features/biblioteca/libros.ts`) tenga su carpeta en `content/libros` (solo avisa).
2. Guarda la imagen en uso como `miduho-app:anterior` y construye la nueva.
3. Levanta `db` y `backup` y hace un respaldo previo (si la base ya tiene esquema).
4. Ejecuta `migrate`. **Si falla, no toca `app`:** la versión anterior sigue atendiendo.
5. Reinicia `app` y `proxy`.
6. Espera hasta 60 s a que `/api/health` responda 200; si no, muestra los últimos logs de `app` y cómo volver atrás.

**No uses `docker compose up -d` para actualizar:** Compose elimina el contenedor viejo de `app` antes de saber si `migrate` terminó bien, y una migración fallida dejaría la plataforma caída.

**Volver a la versión anterior** (lo imprime `deploy.sh` al fallar):

```bash
docker image tag miduho-app:anterior miduho-app:local      # o la etiqueta de MIDUHO_VERSION
docker compose --env-file .env.production up -d --no-deps app
# Si la migración nueva cambió datos: deploy/restore.sh --produccion respaldos/last/miduho-latest.sql.gz
```

---

## 5. Respaldos

- `backup` escribe en `./respaldos` (o `MIDUHO_RESPALDOS`), fuera del volumen de PostgreSQL:
  `last/` (cada ejecución), `daily/` (7), `weekly/` (4), `monthly/` (6). Cada carpeta tiene un `miduho-latest.sql.gz`.
- Respaldo manual: `docker compose --env-file .env.production exec backup /backup.sh`.
- **Copia fuera del servidor (obligatoria para el RTO).** Un respaldo que vive solo en el servidor se pierde con él. Programa en el host, después de las 2:00, una copia a otro lugar 🔶 (destino según D-08), por ejemplo con rclone:
  ```cron
  30 3 * * * rclone sync /srv/miduho/respaldos remoto:miduho-respaldos --max-age 8d
  ```
  Los respaldos contienen datos personales de la comunidad educativa: el destino debe ser privado y, si es un tercero, cifrado (`rclone crypt`).

---

## 6. Monitor externo

Configura un servicio de disponibilidad externo al servidor (Uptime Kuma en otra máquina, UptimeRobot, Better Stack…) 🔶:

- URL: `https://<dominio>/api/health`, cada **5 minutos**, esperando `200` y el texto `"ok"`.
- Aviso al operador (correo o celular) tras **2 fallos seguidos**.
- `/api/health` es público y no expone versiones, usuarios ni detalles de conexión; responde 503 en menos de 3 s si la base no contesta.

---

## 7. Restauración

**Ensayo mensual (base aparte, sin tocar la app):**

```bash
deploy/restore.sh respaldos/daily/miduho-latest.sql.gz
```

Restaura en `miduho_restauracion`, compara filas por tabla con la base en uso, la elimina e imprime la línea para la bitácora (§9). Con `--conservar` deja la base para revisarla.

**Restaurar producción** (pérdida o corrupción de datos):

```bash
deploy/restore.sh --produccion respaldos/daily/miduho-20261030.sql.gz
```

Pide confirmación escrita, hace un respaldo de seguridad del estado actual, detiene `app`, reemplaza la base y espera `/api/health`.

**Servidor perdido (RTO 4 h):** servidor nuevo con Docker → §3 pasos 1–3 con el mismo `.env.production` (guárdalo también fuera del servidor, en un gestor de contraseñas) → trae el último respaldo de la copia externa a `respaldos/` → `deploy/deploy.sh` → `deploy/restore.sh --produccion <respaldo>`. Los datos quedan como en el último respaldo diario (RPO 24 h).

---

## 8. Prueba de carga

`apps/web/tests/carga/escenario.js` (k6): 250 usuarios virtuales, 10 minutos (2 de subida, 7 sostenidos, 1 de bajada). Cada uno inicia sesión una vez y recorre inicio, biblioteca y un libro; los docentes, también Mi curso. Umbrales: p95 < 500 ms y errores < 1 %. No mide `/libros/*`.

```bash
# Cuentas ficticias de demo (3 docentes, 30 estudiantes) y su CSV de credenciales
# (carga/ está en .gitignore; el contenedor escribe como uid 1000 y k6 lee como otro usuario):
mkdir -m 777 carga
docker compose --env-file .env.production run --rm -v "$PWD/carga:/out" migrate npx tsx scripts/poblar-demo.ts /out/cred.csv
sudo chmod 644 carga/cred.csv
docker run --rm -i --network host -v "$PWD/apps/web/tests/carga:/carga:ro" -v "$PWD/carga/cred.csv:/cred.csv:ro" \
  -e BASE=https://<dominio> grafana/k6:1.8.2 run /carga/escenario.js
```

Con certificado público añade `-e TLS_INTERNO=0`. Ejecútala desde otra máquina contra el servidor real y fuera del horario escolar; borra `carga/cred.csv` al terminar. Solo en un entorno sin datos reales: crea cuentas de demo.

---

## 9. Bitácora de operación

Registra aquí (o en la bóveda) cada ensayo de restauración —**al menos uno al mes**—, cada despliegue y cada incidente.

| Fecha | Tipo | Detalle | Resultado | Duración |
|---|---|---|---|---|
| 2026-10-30 | Ensayo de restauración | Stack local, `last/miduho-latest.sql.gz` en `miduho_restauracion` | OK: mismas filas en 15 tablas | 1 s |

---

## 10. Demo en Heroku

Entorno de **demostración** para mostrar avances: solo datos ficticios, nunca datos reales de la comunidad educativa. La producción del colegio sigue siendo §3 (Docker Compose). `heroku.yml` reutiliza el `Dockerfile`: `web` = etapa `runner`; `release` = etapa `builder`, que ejecuta `prisma migrate deploy` antes de publicar (si falla, Heroku deja la versión anterior).

Diferencias con el stack de Compose:

| Pieza de Compose | En Heroku |
|---|---|
| Caddy: HTTPS, cabeceras, redirección HTTP→HTTPS | Certificado del router de Heroku; cabeceras y redirección en `next.config.ts` (`x-forwarded-proto`) |
| Caddy: `/libros/*` desde `content/libros` | Bucket público; `LIBROS_URL` en `heroku.yml` y la app redirige `/libros/*` allá |
| `db` | Heroku Postgres Essential-0; exige TLS → `DATABASE_SSL=no-verify` |
| `backup` | `heroku pg:backups:capture` (manual) 🔶 retención según el plan |

Costo propuesto 🔶 (verificar en heroku.com/pricing): dyno **Basic** (~7 USD, no se duerme) + **Essential-0** (~5 USD) ≈ 12 USD/mes, dentro del crédito del GitHub Student Pack. Eco se duerme a los 30 min: no sirve para demos.

### Primera vez

```bash
curl https://cli-assets.heroku.com/install.sh | sh && heroku login
APP=miduho-demo                                         # nombre único en Heroku
heroku create "$APP" --stack container
heroku addons:create heroku-postgresql:essential-0 -a "$APP"
URL_APP=$(heroku apps:info -a "$APP" --json | jq -r .app.web_url | sed 's#/$##')
heroku config:set -a "$APP" DATABASE_SSL=no-verify AUTH_TRUST_HOST=true \
  AUTH_URL="$URL_APP" AUTH_SECRET="$(openssl rand -base64 32)"
git push heroku HEAD:main                               # construye, migra y publica
heroku ps:type web=basic -a "$APP"
```

Cuenta administradora y cuentas de demo (desde `apps/web`, contra la base de Heroku):

```bash
export DATABASE_URL="$(heroku config:get DATABASE_URL -a "$APP")" DATABASE_SSL=no-verify
SEED_ADMIN_EMAIL=admin@miduho.test SEED_ADMIN_PASSWORD="$(openssl rand -base64 12)" npx tsx prisma/seed.ts
npx tsx scripts/poblar-demo.ts /ruta/privada/cred.csv   # 3 docentes y 30 estudiantes ficticios
```

### Libros

🔶 Antes de subir obras a una URL pública, el permiso de `content/biblioteca/LICENCIA.md` debe estar adjunto (o limitar la subida a los títulos que cubre). Con un bucket público, por ejemplo Cloudflare R2:

```bash
rclone copy content/libros r2:miduho-libros --header-upload "Cache-Control: public, max-age=2592000, immutable"
```

Pon la URL pública del bucket (sin `/` final) en `LIBROS_URL` de `heroku.yml`, haz commit y `git push heroku HEAD:main`. Con `LIBROS_URL` vacía la app funciona, pero la biblioteca muestra imágenes rotas.

### Actualizar y operar

```bash
git push heroku HEAD:main                 # cada avance (desde cualquier rama)
heroku logs --tail -a "$APP"
heroku pg:backups:capture -a "$APP"       # respaldo manual antes de cambios grandes
heroku releases -a "$APP" && heroku rollback vNN -a "$APP"   # volver a una versión (no revierte la base)
```
