#!/usr/bin/env bash
# Prepara la BD temporal del smoke E2E INC1R-13. Datos 100 % ficticios.
# Regenera smoke.env en cada ejecución (secretos y DATABASE_URL temporales) y
# NUNCA reutiliza un env previo ni hereda DATABASE_URL del entorno, de modo que
# `prisma migrate deploy`/`seed` jamás apunten a una base externa.
set -euo pipefail
E2E="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$E2E/.." && pwd)"
mkdir -p "$E2E/capturas" "$E2E/trazas"
umask 077

# DATABASE_URL queda fijado a la BD temporal del smoke; se ignora cualquier
# valor previo del entorno o de un smoke.env anterior.
DB="$E2E/smoke.db"
export DATABASE_URL="file:$DB"
export AUTH_SECRET="$(openssl rand -base64 32)"
export AUTH_TRUST_HOST=true
export AUTH_URL="http://localhost:3113"
export SEED_ADMIN_EMAIL="admin@miduho.test"
export SEED_ADMIN_PASSWORD="prueba-$(openssl rand -hex 4)-7"
export SEED_DOCENTE_PASSWORD="prueba-$(openssl rand -hex 4)-7"
export SEED_ESTUDIANTE_PASSWORD="prueba-$(openssl rand -hex 4)-7"

# Guarda de seguridad explícita: el smoke solo trabaja contra su propio archivo.
case "$DATABASE_URL" in
  "file:$DB") ;;
  *) echo "ABORTO: DATABASE_URL inesperada ($DATABASE_URL); se espera file:$DB" >&2; exit 1 ;;
esac

# Escribe smoke.env (lo consumen `next start` y `node smoke.mjs`) con estos valores.
{
  printf 'export AUTH_SECRET=%q\n' "$AUTH_SECRET"
  printf 'export AUTH_TRUST_HOST=true\n'
  printf 'export AUTH_URL=%q\n' "$AUTH_URL"
  printf 'export DATABASE_URL=%q\n' "$DATABASE_URL"
  printf 'export SEED_ADMIN_EMAIL=%q\n' "$SEED_ADMIN_EMAIL"
  printf 'export SEED_ADMIN_PASSWORD=%q\n' "$SEED_ADMIN_PASSWORD"
  printf 'export SEED_DOCENTE_PASSWORD=%q\n' "$SEED_DOCENTE_PASSWORD"
  printf 'export SEED_ESTUDIANTE_PASSWORD=%q\n' "$SEED_ESTUDIANTE_PASSWORD"
} > "$E2E/smoke.env"

rm -f "$DB"
cd "$APP"
./node_modules/.bin/prisma migrate deploy | tail -2
./node_modules/.bin/tsx prisma/seed.ts | tail -2
./node_modules/.bin/tsx "$E2E/escenario.ts" > "$E2E/ids.json"
