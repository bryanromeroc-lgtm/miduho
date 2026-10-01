#!/usr/bin/env bash
# Smoke e2e local de la API académica (t_b089e01a). Solo datos ficticios.
# Uso: AUTH_SECRET=<efímero> SEED_ADMIN_PASSWORD=<efímera> bash scripts/smoke-academico.sh
set -u
B=${BASE:-http://localhost:3917}
J=$(mktemp)
codigo() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

echo "sin sesion GET /api/grados -> $(codigo "$B/api/grados")"
CSRF=$(curl -s -c "$J" -b "$J" "$B/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
curl -s -o /dev/null -c "$J" -b "$J" -X POST "$B/api/auth/callback/credentials" \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "correo=${SEED_ADMIN_EMAIL:-admin@miduho.test}" \
  --data-urlencode "contrasena=$SEED_ADMIN_PASSWORD"
echo "admin GET /api/grados?pageSize=2 -> $(curl -s -b "$J" "$B/api/grados?pageSize=2" | head -c 200)"
A=$(curl -s -b "$J" "$B/api/anios-lectivos" | sed 's/.*"id":"\([^"]*\)".*/\1/')
echo "admin GET /api/anios-lectivos/[id] -> $(curl -s -b "$J" "$B/api/anios-lectivos/$A" | grep -o '"sumaPonderaciones":[0-9.]*,"ponderacionCompleta":[a-z]*')"
echo "POST periodo solapado -> $(curl -s -b "$J" -H 'content-type: application/json' -X POST "$B/api/periodos" \
  -d "{\"anioLectivoId\":\"$A\",\"nombre\":\"X\",\"orden\":5,\"fechaInicio\":\"2026-02-01\",\"fechaFin\":\"2026-02-10\",\"ponderacion\":1}")"
echo "POST grado invalido -> $(curl -s -b "$J" -H 'content-type: application/json' -X POST "$B/api/grados" -d '{"nombre":"","nivel":"X","orden":-1}')"
echo "POST origen ajeno -> $(curl -s -b "$J" -H 'origin: https://ajeno.example' -H 'content-type: application/json' -X POST "$B/api/grados" -d '{}')"
echo "GET /api/grupos total -> $(curl -s -b "$J" "$B/api/grupos" | grep -o '"total":[0-9]*')"
echo "GET /api/asignaturas total -> $(curl -s -b "$J" "$B/api/asignaturas" | grep -o '"total":[0-9]*')"
echo "GET id inexistente -> $(curl -s -b "$J" "$B/api/grupos/no-existe")"
rm -f "$J"
