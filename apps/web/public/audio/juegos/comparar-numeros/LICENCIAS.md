# Sonidos de esta carpeta

## Audio de referencias

Adaptado con `tools/captura-audio adaptar` (MP3 mono 44,1 kHz, normalizado). Cada fila remite a `content/referencias/<slug>/inventario.json` y a su `LICENCIA.md`.

| Archivo | Pista de origen | URL | Autoría | Licencia |
|---|---|---|---|---|
| `cambiar.mp3` | `phet-comparar-numeros#5d0df87e` | data:audio/mpeg (en https://phet.colorado.edu/sims/html/number-compare/1.0.10/number-compare_all.html) | phet.colorado.edu | CC BY 4.0, versión 1.0.10 |
| `limite.mp3` | `phet-comparar-numeros#76aa18b5` | data:audio/mpeg (en https://phet.colorado.edu/sims/html/number-compare/1.0.10/number-compare_all.html) | phet.colorado.edu | CC BY 4.0, versión 1.0.10 |
| `elegir.mp3` | `phet-comparar-numeros#74ad4e7b` | data:audio/mpeg (en https://phet.colorado.edu/sims/html/number-compare/1.0.10/number-compare_all.html) | phet.colorado.edu | CC BY 4.0, versión 1.0.10 |
| `boton.mp3` | `phet-comparar-numeros#0f4ae1fd` | data:audio/mpeg (en https://phet.colorado.edu/sims/html/number-compare/1.0.10/number-compare_all.html) | phet.colorado.edu | CC BY 4.0, versión 1.0.10 |
| `reiniciar.mp3` | `phet-comparar-numeros#6ef289d7` | data:audio/mpeg (en https://phet.colorado.edu/sims/html/number-compare/1.0.10/number-compare_all.html) | phet.colorado.edu | CC BY 4.0, versión 1.0.10 |
| `retos.mp3` | `phet-comparar-numeros#5af990e3` | data:audio/mpeg (en https://phet.colorado.edu/sims/html/number-compare/1.0.10/number-compare_all.html) | phet.colorado.edu | CC BY 4.0, versión 1.0.10 |
| `acierto.mp3` | `mundoprimaria-cuentos-tradicionales#37a2061a` (copia de `/audio/juegos/cuento-de-la-quebrada/acierto.mp3`) | https://www.mundoprimaria.com/juegos-premium/9908/img/sounds/ok.mp3 | mundoprimaria.com | Permiso declarado por el usuario (2026-11-10); soporte escrito por adjuntar 🔶 |
| `error.mp3` | `mundoprimaria-cuentos-tradicionales#5893ccb7` (copia de `…/cuento-de-la-quebrada/error.mp3`) | https://www.mundoprimaria.com/juegos-premium/9908/img/sounds/error.mp3 | mundoprimaria.com | Permiso declarado por el usuario (2026-11-10); soporte escrito por adjuntar 🔶 |
| `avanzar.mp3` | `mundoprimaria-cuentos-tradicionales#ba6b6c82` (copia de `…/cuento-de-la-quebrada/avanzar.mp3`) | https://www.mundoprimaria.com/juegos-premium/9908/img/sounds/level_end.mp3 | mundoprimaria.com | Permiso declarado por el usuario (2026-11-10); soporte escrito por adjuntar 🔶 |
| `fin.mp3` | `mundoprimaria-cuentos-tradicionales#ca93af0d` (copia de `…/cuento-de-la-quebrada/fin.mp3`) | https://www.mundoprimaria.com/juegos-premium/9908/img/sounds/game_end.mp3 | mundoprimaria.com | Permiso declarado por el usuario (2026-11-10); soporte escrito por adjuntar 🔶 |

## Uso por evento

| Archivo | Evento en el juego | Uso en PhET |
|---|---|---|
| `cambiar.mp3` | Subir o bajar un contador (− / +) | `generalSoftClickSoundPlayer` |
| `limite.mp3` | Intentar pasar de 0 o de 20 | `generalBoundaryBoopSoundPlayer` |
| `elegir.mp3` | Elegir una relación o un objeto | Botón de radio (`multiSelectionSoundPlayerFactory`) |
| `boton.mp3` | Pulsar «Comprobar» | `pushButtonSoundPlayer` |
| `reiniciar.mp3` | «Volver a empezar» en el laboratorio | `resetAllSoundPlayer` |
| `retos.mp3` | Pasar del laboratorio a los retos | `ScreenSelectionSoundGenerator` |
| `acierto.mp3`, `error.mp3`, `avanzar.mp3`, `fin.mp3` | Acierto, error, siguiente reto y fin | PhET no los tiene, porque no tiene retos |

## Atribución (CC BY 4.0)

Sonidos de «Comparar números» (versión 1.0.10), PhET Interactive Simulations, University of Colorado Boulder, https://phet.colorado.edu, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Adaptados: recodificados a MP3 mono y normalizados a −18 LUFS. La versión actual de la simulación (1.0.15) es CC BY-NC 4.0, pero estos sonidos son idénticos byte a byte a los de la 1.0.10. Detalle en `content/referencias/phet-comparar-numeros/LICENCIA.md`.

🔶 Falta escucharlos.
