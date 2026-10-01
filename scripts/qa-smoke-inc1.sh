#!/usr/bin/env bash
# QA integrado Inc. 1 — smoke HTTP contra `next start` local. Solo datos ficticios.
set -u
B="${BASE:-http://localhost:3917}"
J="$(mktemp)"
codigo() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
cuerpo() { curl -s "$@"; }

echo "== Autenticación y autorización =="
echo "GET /api/grados SIN sesión          -> $(codigo "$B/api/grados")"
echo "GET /cuenta SIN sesión              -> $(codigo "$B/cuenta")"
echo "GET /login                          -> $(codigo "$B/login")"
echo "GET /recuperar                      -> $(codigo "$B/recuperar")"
echo "GET /recuperar/nueva (sin token)    -> $(codigo "$B/recuperar/nueva")"

echo
echo "== Criterio negativo: matrícula =="
echo "GET /api/matriculas                 -> $(codigo "$B/api/matriculas")"
echo "POST /api/matriculas                -> $(codigo -X POST "$B/api/matriculas")"
echo "GET /matricula                      -> $(codigo "$B/matricula")"

echo
echo "== Login ficticio (seed) =="
CSRF=$(curl -s -c "$J" -b "$J" "$B/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
echo "csrf token obtenido: ${CSRF:0:12}..."
curl -s -o /dev/null -c "$J" -b "$J" -X POST "$B/api/auth/callback/credentials" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "correo=admin@miduho.test" \
  --data-urlencode "contrasena=qa-clave-ficticia-2026"
echo "GET /api/grados CON sesión admin    -> $(codigo -b "$J" "$B/api/grados")"
echo "GET /cuenta CON sesión admin        -> $(codigo -b "$J" "$B/cuenta")"
echo "GET /api/anios-lectivos             -> $(cuerpo -b "$J" "$B/api/anios-lectivos" | head -c 120)"
echo
echo "== Sesión con login INCORRECTO =="
J2="$(mktemp)"
CSRF2=$(curl -s -c "$J2" -b "$J2" "$B/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
curl -s -o /dev/null -c "$J2" -b "$J2" -X POST "$B/api/auth/callback/credentials" \
  --data-urlencode "csrfToken=$CSRF2" --data-urlencode "correo=admin@miduho.test" \
  --data-urlencode "contrasena=clave-mala"
echo "GET /api/grados con login fallido   -> $(codigo -b "$J2" "$B/api/grados")"

echo
echo "== Mutaciones: verificación de origen (CSRF) =="
echo "POST /api/grados origen ajeno       -> $(cuerpo -b "$J" -H 'origin: https://ajeno.example' -H 'content-type: application/json' -X POST "$B/api/grados" -d '{}' | head -c 120)"

rm -f "$J" "$J2"
