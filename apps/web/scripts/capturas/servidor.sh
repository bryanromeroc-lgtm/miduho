#!/usr/bin/env bash
# (Re)inicia `next start` contra la base de capturas. Requiere `npm run build` previo.
# Uso (desde apps/web): ./scripts/capturas/servidor.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/capturas.env"
PID="$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1 || true)"
[ -n "$PID" ] && kill "$PID" && sleep 1
cd "$DIR/../.."
nohup ./node_modules/.bin/next start -p "$PORT" > "$DIR/servidor.log" 2>&1 &
for _ in $(seq 1 40); do
  curl -s -o /dev/null -w "%{http_code}" "$BASE/login" 2>/dev/null | grep -q 200 && { echo "Servidor de capturas en $BASE"; exit 0; }
  sleep 0.5
done
echo "El servidor no respondió; revisa $DIR/servidor.log" >&2; exit 1
