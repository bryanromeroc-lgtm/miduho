#!/usr/bin/env bash
# Alinea los 5 libros cuyos pliegos no cruzan enteros.
#
# El desfase viene de que el lector muestra la portada sola y empareja el
# resto 2-3, 4-5…: si antes del primer pliego hay dos hojas sueltas, cada
# pliego se parte entre dos pantallas.
#
# Hay dos remedios y NO son intercambiables: depende de qué haya en la
# página 2 de cada PDF, que se revisó una por una.
set -euo pipefail
cd "$(dirname "$0")"

# Su página 2 es una guarda editorial: sobra, se quita.
node src/lote.js convertir --solo palabra-ultima --forzar --omitir-libro palabra-ultima:2

# Su página 2 es contenido del libro —el poema, un epígrafe, la dedicatoria
# de «Los héroes» a César Álvarez—, así que se alinea con una hoja vacía
# tras la portada y no se pierde nada.
L=saltarines,la-muneca-negra,los-heroes-que-vencieron-todo-menos-el-miedo,pijarana-pijarana-teje-los-versos-la-arana
node src/lote.js convertir --forzar --solo "$L" --hoja-en-blanco "$L"
