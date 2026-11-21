# Licencia del audio capturado — phet-comparar-numeros

- **Plataforma:** PhET Interactive Simulations (University of Colorado Boulder)
- **Página observada:** https://phet.colorado.edu/es/simulations/number-compare (simulación HTML5 `number-compare_all.html`, versión `latest` del 2026-11-20)
- **Autoría real (dominio que aloja el juego):** phet.colorado.edu
- **Fecha de captura:** 2026-11-20
- **Estado:** licencia pública: CC BY 4.0 para la versión 1.0.10, con sonidos idénticos; la versión actual es CC BY-NC 4.0

## Licencia pública

- **Licencia:** Creative Commons Atribución 4.0 Internacional (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/. Comprobada el 2026-11-20.
- **La versión actual no sirve:** `latest`, que es la 1.0.15, recompilada el 2026-11-18, ya es **CC BY-NC 4.0** y prohíbe el uso comercial sin licencia. PhET publica con NC todo lo posterior al 2026-03-29 (https://phet.colorado.edu/en/licensing).
- **La versión 1.0.10 sí sirve:** https://phet.colorado.edu/sims/html/number-compare/1.0.10/number-compare_all.html, compilada el 2025-09-03, dice «licensed under Creative Commons Attribution 4.0». Las versiones anteriores al 2026-03-29 siguen con CC BY 4.0 (https://phet.colorado.edu/en/licensing/html).
- **Mismos sonidos:** las 22 pistas `data:audio` de la 1.0.10 son idénticas byte a byte a las capturadas (sha256: 22 de 22; también la 1.0.0 de 2023). El audio adaptado se atribuye a la **versión 1.0.10, CC BY 4.0**.
- **Atribución exigida** (va también en el `LICENCIAS.md` de destino): «Sonidos de "Comparar números" (versión 1.0.10), PhET Interactive Simulations, University of Colorado Boulder, https://phet.colorado.edu, CC BY 4.0».

## Origen de las 22 pistas

Todas están incrustadas en el HTML como `data:audio`, así que no tienen nombre de archivo. El nombre sale del reproductor que se registra justo después de cada pista en el código (`ee.register("…SoundPlayer")`).

| n.º (`data-N`) | id | Reproductor registrado |
|---|---|---|
| 0 | `1f631ab2` | — (probablemente la respuesta al impulso de la reverberación de `tambo`, 1,2 s 🔶) |
| 1 | `74ad4e7b` | — |
| 2 | `4179cc32` | — (casi en silencio, −70 LUFS) |
| 3 | `808c199d` | `checkboxUncheckedSoundPlayer` |
| 4 | `0f4ae1fd` | `pushButtonSoundPlayer` |
| 5 | `2d839a53` | `toggleOffSoundPlayer` |
| 6 | `a7a9c2aa` | `toggleOnSoundPlayer` |
| 7 | `44c48b49` | — |
| 8 | `6bae950b` | — |
| 9 | `7738c0a0` | `generalCloseSoundPlayer` |
| 10 | `9df7b84d` | `generalOpenSoundPlayer` |
| 11 | `e9ab9a1d` | `switchToLeftSoundPlayer` |
| 12 | `b34c6776` | `switchToRightSoundPlayer` |
| 13 | `76aa18b5` | — |
| 14 | `5d0df87e` | `generalBoundaryBoopSoundPlayer` |
| 15 | `ccb75474` | — |
| 16 | `5af990e3` | `ScreenSelectionSoundGenerator` |
| 17 | `cbe8d374` | `pauseSoundPlayer` |
| 18 | `2c22bf1e` | `playSoundPlayer` |
| 19 | `6ef289d7` | — (declarada junto a `CompareModel`: probablemente propia de la simulación 🔶) |
| 20 | `61ad22c5` | `accordionBoxClosedSoundPlayer` |
| 21 | `12d0db87` | `accordionBoxOpenedSoundPlayer` |

🔶 Rol de las pistas sin nombre: por confirmar en el estudio con REA (dónde se usa cada una) y escuchándolas.

Si un titular reclama: cada archivo desplegado está trazado en un `LICENCIAS.md` de `apps/web/public/audio/` con la pista de origen `phet-comparar-numeros#<id>`; se reemplaza por audio propio con el mismo nombre de archivo y el juego no cambia.
