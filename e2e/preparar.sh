#!/usr/bin/env bash
# Prepara la BD temporal del smoke E2E INC1R-13 (fuera del repo). Datos 100 % ficticios.
set -euo pipefail
E2E="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$E2E/.." && pwd)"
mkdir -p "$E2E/capturas" "$E2E/trazas"
clave() { echo "prueba-$(openssl rand -hex 4)-7"; }
umask 077
if [ ! -f "$E2E/smoke.env" ]; then
  cat > "$E2E/smoke.env" <<EOF
export AUTH_SECRET="$(openssl rand -base64 32)"
export AUTH_TRUST_HOST=true
export AUTH_URL="http://localhost:3113"
export DATABASE_URL="file:$E2E/smoke.db"
export SEED_ADMIN_EMAIL="admin@miduho.test"
export SEED_ADMIN_PASSWORD="$(clave)"
export SEED_DOCENTE_PASSWORD="$(clave)"
export SEED_ESTUDIANTE_PASSWORD="$(clave)"
EOF
fi
# shellcheck disable=SC1091
source "$E2E/smoke.env"
rm -f "$E2E/smoke.db"
cd "$APP"
./node_modules/.bin/prisma migrate deploy | tail -2
./node_modules/.bin/tsx prisma/seed.ts | tail -2
./node_modules/.bin/tsx "$E2E/escenario.ts" > "$E2E/ids.json"
