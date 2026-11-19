# Incremento 2 · Juego «Golpea el resultado» (El taller de los topos)

- **Fecha:** 2026-11-05
- **Cambio OpenSpec:** `openspec/changes/tipo-golpea-resultado/`
- **Referencia funcional:** `docs/investigacion/referencia-golpea-el-resultado.md` (mecánica estudiada con REA; nada copiado).

## Qué es

Tipo nuevo `golpea`. Topos robot asoman de una cuadrícula de 10 escotillas (3-4-3) con un número; el estudiante golpea el del resultado de una suma o resta. Rondas deterministas por semilla, distractores por error típico (±1, ±2, ±10, ±20 o ±5), 2/1/0 puntos por ronda, sin reloj, teclas 1–9 y 0.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/juegos/golpea/generador.ts` | Rondas, llevadas, distractores, huecos |
| `…/golpea/tipo.ts` + `tipo.test.ts` | Esquema, calificación 2/1/0, repaso (14 pruebas) |
| `…/golpea/juego.tsx` + `golpea.module.css` | Interfaz, escena del mazo en 4 tiempos, cámara, poses |
| `…/golpea/audio.ts` | Efectos CC0 por Web Audio, programados al ms del impacto |
| `…/comun/rondas.ts` | Opción `efectosPropios` (compatible; por defecto igual que antes) |
| `curriculo/actividades/matematicas/5/el-taller-de-los-topos.json` | Actividad de ejemplo (10 rondas, hasta 100, + y −, con llevadas) |

### Recursos

| Ruta | Peso | Origen |
|---|---|---|
| `public/images/juegos/golpea/topo.webp` | 51 KB | Gemini chat (imagen), 2026-11-05, ref. `robots/robot.webp` (estilo). Topo robot con cartel vacío |
| `…/topo-contento.webp` | 46 KB | Gemini, ref. topo; recortado con `recortar-pose.py --como topo.webp`. Celebra con el cartel arriba |
| `…/topo-mareado.webp` | 50 KB | Gemini, ref. topo; mismo recorte. Ojos en espiral, amable |
| `…/mazo.webp` | 38 KB | Gemini, ref. `robots/robot.webp`. Mazo de juguete |
| `…/taller.webp` | 225 KB | Gemini, ref. `robots/azotea.webp`. Interior del taller |
| `…/portada.webp` | 94 KB | Gemini, refs. topo, mazo y taller; franja 3,6:1 a 1200×333 |
| `public/audio/juegos/golpea/musica-taller.mp3` | 1,7 MB | Gemini (música), 104 s, −24 LUFS, fundido 2 s, bucle |
| `public/audio/juegos/golpea/{golpe,golpecito,acierto,error,aparecer}.mp3` | 2–6 KB | Kenney, CC0 1.0 (`LICENCIAS.md`) |

🔶 Revisar los términos de uso de Gemini para material del colegio.

## Verificación

- `npm test`: 66 archivos, 769 pruebas, todas pasan. `npm run lint` y `npm run build`: sin errores.
- Navegador (página temporal, ya borrada): 1920×1080, 1440×900 y 390×844 sin desplazamiento horizontal; video del acierto y del fallo revisado cuadro a cuadro (mazo: impulso → caída → impacto congelado con estrella y «¡TOC!» → pose contenta; fallo suave con pose mareada y tachado).

## Decisiones y pendientes

- 🔶 Con 10 escotillas el topo mide ~19 % del alto en 1920×1080 (no ⅓): excepción del estándar; la cámara se acerca 12 % al golpeado.
- 🔶 Escala 2/1/0 aprobada por el usuario; validar con la docente.
- 🔶 Grado: la actividad va en 5.° (cálculo mental) porque la demo usa 5.°; para 2.°/3.° basta otro JSON con `rango` 20 o 100.
- 🔶 El usuario debe oír los efectos (elegidos por nombre) y la música en bucle.
- No verificado: la tarjeta con la portada en la vista de la materia (requiere sesión).
