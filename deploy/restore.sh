#!/usr/bin/env bash
# Restaura un respaldo de PostgreSQL (.sql.gz de `backup`) con el stack de docker-compose.yml.
#
#   deploy/restore.sh RESPALDO [BASE]       Ensayo: restaura en una base aparte (por defecto
#                                           miduho_restauracion), compara filas por tabla con la
#                                           base en uso y la elimina. No toca la app.
#   deploy/restore.sh --conservar RESPALDO  Igual, pero deja la base restaurada para revisarla.
#   deploy/restore.sh --produccion RESPALDO Reemplaza la base de la app: respaldo de seguridad,
#                                           app detenida, restauración y espera de /api/health.
#
# Variables: ENV_FILE (por defecto .env.production). Guía: docs/operacion.md.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-.env.production}"
[ -f "$ENV_FILE" ] || { echo "No existe $ENV_FILE (copia .env.production.example)." >&2; exit 1; }
set -a; . "./$ENV_FILE"; set +a
dc() { docker compose --env-file "$ENV_FILE" "$@"; }
psql_() { dc exec -T db psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER" "$@"; }

modo=ensayo
case "${1:-}" in
  --produccion) modo=produccion; shift ;;
  --conservar) modo=conservar; shift ;;
esac
RESPALDO="${1:-}"
[ -n "$RESPALDO" ] && [ -s "$RESPALDO" ] || { echo "Uso: $0 [--produccion|--conservar] RESPALDO.sql.gz [BASE]" >&2; exit 1; }

# Filas por tabla de una base (conteo exacto), una línea «tabla|filas».
conteos() {
  psql_ -d "$1" -At -c "
    SELECT table_name, (xpath('/row/c/text()', query_to_xml(
      format('SELECT count(*) AS c FROM %I.%I', table_schema, table_name), false, true, '')))[1]::text
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name"
}

restaurar_en() {
  local base="$1"
  # template0 trae el esquema public vacío; el volcado no lo crea.
  psql_ -d postgres -c "DROP DATABASE IF EXISTS \"$base\" WITH (FORCE)" -c "CREATE DATABASE \"$base\" TEMPLATE template0"
  gunzip -c "$RESPALDO" | psql_ -d "$base" >/dev/null
}

if [ "$modo" = produccion ]; then
  echo "Esto REEMPLAZA la base «$POSTGRES_DB» con $RESPALDO. La app queda detenida mientras tanto."
  read -r -p "Escribe RESTAURAR para continuar: " ok
  [ "$ok" = RESTAURAR ] || { echo "Cancelado."; exit 1; }
  echo "› Respaldo de seguridad del estado actual…"
  dc exec -T backup /backup.sh >/dev/null
  echo "› Deteniendo app…"
  dc stop app
  echo "› Restaurando…"
  restaurar_en "$POSTGRES_DB"
  echo "› Arrancando app…"
  dc up -d --no-deps app
  for _ in $(seq 1 30); do
    if dc exec -T app wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
      echo "✓ Restaurado $RESPALDO en $POSTGRES_DB y /api/health responde 200."
      exit 0
    fi
    sleep 2
  done
  echo "✗ La app no respondió /api/health en 60 s:" >&2
  dc logs --tail 100 app >&2
  exit 1
fi

DESTINO="${2:-miduho_restauracion}"
[ "$DESTINO" != "$POSTGRES_DB" ] || { echo "Para restaurar sobre la base en uso usa --produccion." >&2; exit 1; }

inicio=$(date +%s)
echo "› Restaurando $RESPALDO en la base aparte «$DESTINO»…"
restaurar_en "$DESTINO"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
conteos "$POSTGRES_DB" > "$tmp/origen"
conteos "$DESTINO" > "$tmp/destino"
[ "$modo" = conservar ] || psql_ -d postgres -c "DROP DATABASE \"$DESTINO\" WITH (FORCE)"

echo "Filas por tabla (en uso | restaurada):"
join -t'|' -a1 -a2 -e '—' -o '0,1.2,2.2' "$tmp/origen" "$tmp/destino" | column -t -s'|'
duracion=$(( $(date +%s) - inicio ))
if diff -q "$tmp/origen" "$tmp/destino" >/dev/null; then
  echo "✓ Restauración correcta en ${duracion} s: mismas filas por tabla."
  echo "  Bitácora: $(date +%F) · $(basename "$RESPALDO") · OK · ${duracion} s"
else
  echo "✗ Las filas difieren. Si hubo escrituras después del respaldo es esperable; si no, revisa el respaldo." >&2
  echo "  Bitácora: $(date +%F) · $(basename "$RESPALDO") · DIFERENCIAS · ${duracion} s"
  exit 1
fi
