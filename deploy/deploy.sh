#!/usr/bin/env bash
# Despliega o actualiza MIDUHO en este servidor. Guía: docs/operacion.md.
#
#   deploy/deploy.sh
#
# Orden: libros vs. catálogo → imagen nueva → respaldo → migrate → app → /api/health (60 s).
# Si una etapa falla, se detiene y deja la versión anterior atendiendo (o las
# instrucciones para volver a ella). Usa siempre el compose con .env.production:
# un `docker compose up -d` directo recrea `app` ANTES de saber si `migrate` pasó.
#
# Variables: ENV_FILE (por defecto .env.production).
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-.env.production}"
[ -f "$ENV_FILE" ] || { echo "No existe $ENV_FILE (copia .env.production.example y complétala)." >&2; exit 1; }
set -a; . "./$ENV_FILE"; set +a
dc() { docker compose --env-file "$ENV_FILE" "$@"; }
VERSION="${MIDUHO_VERSION:-local}"
paso() { printf '\n› %s\n' "$*"; }
fallo() {
  printf '\n✗ %s\n' "$1" >&2
  shift
  printf '%s\n' "$@" >&2
  exit 1
}

paso "1/6 Libros del catálogo en ${MIDUHO_LIBROS:-./content/libros}"
libros="${MIDUHO_LIBROS:-./content/libros}"
faltan=()
while read -r slug; do
  [ -d "$libros/$slug" ] || faltan+=("$slug")
done < <(grep -oE 'slug: "[^"]+"' apps/web/src/features/biblioteca/libros.ts | cut -d'"' -f2)
if [ "${#faltan[@]}" -gt 0 ]; then
  echo "⚠ Faltan ${#faltan[@]} carpeta(s) de libros: ${faltan[*]}"
  echo "  Esas obras mostrarán imágenes rotas. Copia las páginas a $libros/<slug>/ (tools/flipbook-forge)."
else
  echo "✓ Cada libro del catálogo tiene su carpeta."
fi

paso "2/6 Imagen nueva (miduho-app:$VERSION)"
anterior=""
if docker image inspect "miduho-app:$VERSION" >/dev/null 2>&1; then
  docker image tag "miduho-app:$VERSION" miduho-app:anterior
  docker image tag "miduho-migrate:$VERSION" miduho-migrate:anterior 2>/dev/null || true
  anterior="miduho-app:anterior"
fi
dc build app migrate || fallo "La imagen no se construyó. Nada cambió en el servidor."

paso "3/6 Base de datos y respaldo previo"
mkdir -p "${MIDUHO_RESPALDOS:-./respaldos}"
dc up -d --wait db backup || fallo "PostgreSQL no quedó sano." "Revisa: docker compose --env-file $ENV_FILE logs db"
if dc exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT to_regclass('public._prisma_migrations') IS NOT NULL" | grep -q t; then
  dc exec -T backup /backup.sh >/dev/null || fallo "El respaldo previo falló; no se despliega sin respaldo." "Revisa: docker compose --env-file $ENV_FILE logs backup"
  echo "✓ Respaldo en ${MIDUHO_RESPALDOS:-./respaldos}/last/$POSTGRES_DB-latest.sql.gz"
else
  echo "Base vacía (primer despliegue): no hay nada que respaldar."
fi

paso "4/6 Migraciones"
dc run --rm --no-deps migrate || fallo "Las migraciones fallaron. La app NO se reinició: sigue atendiendo la versión anterior." \
  "Corrige la migración y vuelve a ejecutar deploy/deploy.sh." \
  "Si quedó a medias, restaura el respaldo previo: deploy/restore.sh --produccion ${MIDUHO_RESPALDOS:-./respaldos}/last/$POSTGRES_DB-latest.sql.gz"

paso "5/6 App y proxy"
dc up -d --no-deps app proxy

paso "6/6 Chequeo de salud (hasta 60 s)"
for _ in $(seq 1 30); do
  if dc exec -T app wget -qO- http://127.0.0.1:3000/api/health 2>/dev/null | grep -q '"ok"'; then
    printf '\n✓ Desplegado miduho-app:%s. https://%s responde.\n' "$VERSION" "$MIDUHO_DOMINIO"
    exit 0
  fi
  sleep 2
done
echo "Últimos logs de app:" >&2
dc logs --tail 100 app >&2
volver=("Para volver a la versión anterior:")
if [ -n "$anterior" ]; then
  volver+=("  docker image tag miduho-app:anterior miduho-app:$VERSION && docker compose --env-file $ENV_FILE up -d --no-deps app")
else
  volver+=("  (no había una imagen anterior en este servidor)")
fi
volver+=("Si la migración nueva cambió datos, restaura además: deploy/restore.sh --produccion ${MIDUHO_RESPALDOS:-./respaldos}/last/$POSTGRES_DB-latest.sql.gz")
fallo "/api/health no respondió 200 en 60 s." "${volver[@]}"
