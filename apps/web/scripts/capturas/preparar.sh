#!/usr/bin/env bash
# Prepara la base desechable de las capturas visuales (línea base y regresión de
# Laboratorios). Datos 100 % ficticios: seed versionado, sin datos personales.
# Regenera capturas.env (gitignorado) en cada ejecución y NUNCA hereda
# DATABASE_URL del entorno: solo trabaja contra la base `miduho_capturas`.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$DIR/../.." && pwd)"
umask 077

DB="miduho_capturas"
PUERTO="${PUERTO:-3114}"
SERVIDOR="${TEST_DATABASE_URL:-postgresql://miduho:miduho@localhost:5433/postgres}"
export DATABASE_URL="${SERVIDOR%/*}/$DB"
export AUTH_SECRET="$(openssl rand -base64 32)"
export AUTH_TRUST_HOST=true
export AUTH_URL="http://localhost:$PUERTO"
export SEED_ADMIN_EMAIL="admin@miduho.test"
export SEED_ADMIN_PASSWORD="prueba-$(openssl rand -hex 4)-7"
export SEED_DOCENTE_PASSWORD="prueba-$(openssl rand -hex 4)-7"
export SEED_ESTUDIANTE_PASSWORD="prueba-$(openssl rand -hex 4)-7"

case "$DATABASE_URL" in
  postgresql://*/"$DB") ;;
  *) echo "ABORTO: DATABASE_URL inesperada ($DATABASE_URL); se espera la base $DB" >&2; exit 1 ;;
esac

{
  printf 'export AUTH_SECRET=%q\n' "$AUTH_SECRET"
  printf 'export AUTH_TRUST_HOST=true\n'
  printf 'export AUTH_URL=%q\n' "$AUTH_URL"
  printf 'export DATABASE_URL=%q\n' "$DATABASE_URL"
  printf 'export PORT=%q\n' "$PUERTO"
  printf 'export BASE=%q\n' "http://localhost:$PUERTO"
  printf 'export SEED_ADMIN_EMAIL=%q\n' "$SEED_ADMIN_EMAIL"
  printf 'export SEED_ADMIN_PASSWORD=%q\n' "$SEED_ADMIN_PASSWORD"
  printf 'export SEED_DOCENTE_PASSWORD=%q\n' "$SEED_DOCENTE_PASSWORD"
  printf 'export SEED_ESTUDIANTE_PASSWORD=%q\n' "$SEED_ESTUDIANTE_PASSWORD"
} > "$DIR/capturas.env"

cd "$APP"
SERVIDOR="$SERVIDOR" DB="$DB" node -e '
  const { Client } = require("pg");
  const c = new Client({ connectionString: process.env.SERVIDOR });
  c.connect()
    .then(() => c.query(`DROP DATABASE IF EXISTS "${process.env.DB}" WITH (FORCE)`))
    .then(() => c.query(`CREATE DATABASE "${process.env.DB}"`))
    .then(() => c.end())
    .catch((e) => {
      console.error(`Sin PostgreSQL de pruebas (${e.message}). Ejecuta: docker compose -f docker-compose.dev.yml up -d`);
      process.exit(1);
    });'
./node_modules/.bin/prisma migrate deploy | tail -2
./node_modules/.bin/tsx prisma/seed.ts | tail -2
# La docente sembrada debe cambiar la contraseña al primer ingreso; en esta base
# desechable se omite para poder capturar su inicio.
node -e '
  const { Client } = require("pg");
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  c.connect()
    .then(() => c.query(`UPDATE usuarios SET "debeCambiarContrasena" = false WHERE correo = $1`, ["docente@miduho.test"]))
    .then(() => c.end());'
echo "Base $DB lista. Siguiente: source scripts/capturas/capturas.env && ./node_modules/.bin/next start"
