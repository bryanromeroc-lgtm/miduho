#!/usr/bin/env bash
# QA Inc. 1 — autorización por rol: ¿un DOCENTE ve asignaciones de otros?
set -u
B="${BASE:-http://localhost:3917}"
J="$(mktemp)"
login() { # $1 correo $2 clave $3 jar
  local csrf
  csrf=$(curl -s -c "$3" -b "$3" "$B/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
  curl -s -o /dev/null -c "$3" -b "$3" -X POST "$B/api/auth/callback/credentials" \
    --data-urlencode "csrfToken=$csrf" --data-urlencode "correo=$1" --data-urlencode "contrasena=$2"
}
J1="$(mktemp)"; login "docente1.qa@miduho.test" "qa-docente-ficticia-2026" "$J1"
echo "docente1 GET /api/asignaciones-docente ->"
curl -s -b "$J1" "$B/api/asignaciones-docente" | head -c 400
echo
echo "docente1 GET /api/grados (solo ADMIN/COORDINACION) -> $(curl -s -o /dev/null -w '%{http_code}' -b "$J1" "$B/api/grados")"
echo "docente1 GET /api/anios-lectivos (solo ADMIN/COORD) -> $(curl -s -o /dev/null -w '%{http_code}' -b "$J1" "$B/api/anios-lectivos")"
echo "docente1 POST /api/asignaciones-docente (solo ADMIN/COORD) -> $(curl -s -o /dev/null -w '%{http_code}' -b "$J1" -H 'content-type: application/json' -X POST "$B/api/asignaciones-docente" -d '{}')"
rm -f "$J" "$J1"
