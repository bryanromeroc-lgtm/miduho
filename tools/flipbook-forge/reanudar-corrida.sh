#!/usr/bin/env bash
# Reanuda la conversión del catálogo si se interrumpió (apagado, batería…).
# Sin --forzar: los libros que ya tienen libro.json están completos y se saltan;
# el que quedó a medias no tiene libro.json todavía y se rehace entero.
set -uo pipefail
cd "$(dirname "$0")"
SOLO=$(paste -sd, corrida-restante.txt)
DP=los-arrullos-de-jaamo,patas-de-armadillo-dientes-de-raton,tiki-tiki-tai-libro,una-morena-en-la-ronda,putunkaa-serruma-duermete-pajarito,tortuguita-veni-baila-libro
exec systemd-inhibit --what=sleep:idle --who=flipbook-forge --why="Convirtiendo el catálogo de Maguaré" \
  node src/lote.js convertir --solo "$SOLO" --doble-plana "$DP"
