#!/usr/bin/env bash
# Smoke de edición y cierre de estructura académica (t_b0aaf4ff, INC1R-07H). Solo datos ficticios.
# Requiere el seed demo (año 2026 ACTIVO con períodos al 100 %) y una base desechable: CIERRA el año 2026.
# Uso: SEED_ADMIN_PASSWORD=<efímera> BASE=http://localhost:3931 bash scripts/smoke-estructura-edicion.sh
set -u
B=${BASE:-http://localhost:3917}
J=$(mktemp)
H='content-type: application/json'
api() { curl -s -b "$J" -H "$H" -H "origin: $B" -X "$1" "$B$2" ${3:+-d "$3"}; }
# json '<expresión JS sobre r>' — lee la respuesta por stdin.
json() { node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);console.log($1)})"; }
error() { json 'r.error ? r.error.code + " · " + r.error.message : "OK"'; }
panel() { curl -s -b "$J" "$B/admin/estructura" | sed 's/<!-- -->//g'; }

echo "sin sesión /admin/estructura -> $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$B/admin/estructura")"
CSRF=$(curl -s -c "$J" -b "$J" "$B/api/auth/csrf" | json 'r.csrfToken')
curl -s -o /dev/null -c "$J" -b "$J" -X POST "$B/api/auth/callback/credentials" \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "correo=${SEED_ADMIN_EMAIL:-admin@miduho.test}" \
  --data-urlencode "contrasena=$SEED_ADMIN_PASSWORD"
echo "sesión ADMIN -> $(curl -s -o /dev/null -w '%{http_code}' -b "$J" "$B/admin/estructura")"
HTML=$(panel)
echo "panel: botón 'Cerrar año' del 2026 -> $(grep -c 'Cerrar año<span class="sr-only"> el año 2026' <<<"$HTML") | campo estado en el alta -> $(grep -c 'name="estado"' <<<"$HTML") | opción CERRADO -> $(grep -c 'value="CERRADO"' <<<"$HTML") | 'Estado inicial' Activo -> $(grep -c 'Estado inicial' <<<"$HTML")"

A=$(api GET "/api/anios-lectivos?q=2026" | json 'r.data[0].id')
echo "POST año CERRADO directo -> $(api POST /api/anios-lectivos '{"anio":2031,"fechaInicio":"2031-01-20","fechaFin":"2031-12-05","estado":"CERRADO"}' | error)"
echo "PATCH año fechaInicio+fechaFin -> $(api PATCH "/api/anios-lectivos/$A" '{"fechaInicio":"2026-01-19","fechaFin":"2026-12-04"}' | json 'r.estado + " " + r.fechaInicio.slice(0,10) + " a " + r.fechaFin.slice(0,10)')"
echo "PATCH año fin antes de períodos -> $(api PATCH "/api/anios-lectivos/$A" '{"fechaFin":"2026-03-01"}' | error)"
P=$(api GET "/api/periodos?anioLectivoId=$A&pageSize=1" | json 'r.data[0].id')
ORIG=$(api GET "/api/periodos/$P")
PP=$(json 'r.ponderacion' <<<"$ORIG"); PN=$(json 'r.nombre' <<<"$ORIG")
echo "PATCH período completo (nombre, orden, fechas, 1 %) -> $(api PATCH "/api/periodos/$P" "$(json 'JSON.stringify({nombre:"Período editado (smoke)",orden:r.orden,fechaInicio:r.fechaInicio.slice(0,10),fechaFin:r.fechaFin.slice(0,10),ponderacion:1})' <<<"$ORIG")" | json 'r.nombre + " · " + r.ponderacion + " %"')"
echo "PATCH cierre con ponderación incompleta -> $(api PATCH "/api/anios-lectivos/$A" '{"estado":"CERRADO"}' | error)"
echo "PATCH período restaurado -> $(api PATCH "/api/periodos/$P" "{\"nombre\":\"$PN\",\"ponderacion\":$PP}" | json 'r.nombre + " · " + r.ponderacion + " %"')"

AR=$(api POST /api/areas '{"nombre":"Área smoke (ficticia)","tipo":"AREA","idioma":"es","orden":null}' | json 'r.id')
echo "PATCH área completa -> $(api PATCH "/api/areas/$AR" '{"nombre":"Área smoke editada","tipo":"ENFOQUE","idioma":"en","orden":7}' | json '[r.nombre,r.tipo,r.idioma,r.orden].join(" · ")')"
GD=$(api POST /api/grados '{"nombre":"Grado smoke","nivel":"PRIMARIA","orden":90}' | json 'r.id')
echo "PATCH grado completo -> $(api PATCH "/api/grados/$GD" '{"nombre":"Grado smoke editado","nivel":"PREESCOLAR","orden":91}' | json '[r.nombre,r.nivel,r.orden].join(" · ")')"
S=$(api POST /api/asignaturas "{\"nombre\":\"Asignatura smoke\",\"areaId\":\"$AR\",\"intensidadHoraria\":null,\"grados\":[]}" | json 'r.id')
echo "PATCH asignatura completa -> $(api PATCH "/api/asignaturas/$S" "{\"nombre\":\"Asignatura smoke editada\",\"areaId\":\"$AR\",\"intensidadHoraria\":2,\"grados\":[{\"gradoId\":\"$GD\",\"intensidad\":3}]}" | json 'r.nombre + " · " + r.intensidadHoraria + " h · grados " + r.grados.map(g=>g.grado.nombre+"="+g.intensidad).join(",")')"
GR=$(api POST /api/grupos "{\"anioLectivoId\":\"$A\",\"gradoId\":\"$GD\",\"identificador\":\"S1\",\"directorId\":null}" | json 'r.id')
echo "PATCH grupo identificador+director null -> $(api PATCH "/api/grupos/$GR" '{"identificador":"S2","directorId":null}' | json 'r.identificador + " · director " + r.director')"
echo "PATCH grupo director inválido -> $(api PATCH "/api/grupos/$GR" "{\"directorId\":\"$AR\"}" | error)"
echo "DELETE grupo de prueba -> $(curl -s -o /dev/null -w '%{http_code}' -b "$J" -H "origin: $B" -X DELETE "$B/api/grupos/$GR")"

echo "PATCH cierre válido -> $(api PATCH "/api/anios-lectivos/$A" '{"estado":"CERRADO"}' | json 'r.estado || r.error.code')"
echo "PATCH período en año cerrado -> $(api PATCH "/api/periodos/$P" '{"nombre":"X"}' | error)"
echo "PATCH reabrir año -> $(api PATCH "/api/anios-lectivos/$A" '{"estado":"ACTIVO"}' | error)"
HTML=$(panel)
echo "panel tras cierre: 'Solo lectura (año cerrado)' -> $(grep -o 'Solo lectura (año cerrado)' <<<"$HTML" | wc -l) | 'Cerrar año' -> $(grep -c 'Cerrar año<span' <<<"$HTML") | estado Cerrado -> $(grep -c 'data-estado="CERRADO"' <<<"$HTML")"

echo "limpieza -> asignatura $(api PATCH "/api/asignaturas/$S" '{"grados":[]}' | json 'r.grados.length') $(curl -s -o /dev/null -w '%{http_code}' -b "$J" -H "origin: $B" -X DELETE "$B/api/asignaturas/$S") · área $(curl -s -o /dev/null -w '%{http_code}' -b "$J" -H "origin: $B" -X DELETE "$B/api/areas/$AR") · grado $(curl -s -o /dev/null -w '%{http_code}' -b "$J" -H "origin: $B" -X DELETE "$B/api/grados/$GD")"
rm -f "$J"
