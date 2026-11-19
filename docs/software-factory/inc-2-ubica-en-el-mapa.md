# Incremento 2 · Juego «Ubica en el mapa» (Armi explora Colombia)

- **Fecha:** 2026-11-07
- **Cambio OpenSpec:** `openspec/changes/tipo-ubica-en-el-mapa/`
- **Referencia funcional:** `docs/investigacion/referencia-mapa-departamentos.md` (Seterra / GeoGuessr, estudiado con REA; solo mecánica, nada copiado).
- **DBA:** SOC-5-01 («Comprende la organización territorial existente en Colombia y las particularidades geográficas de las regiones»; observado en `docs/investigacion/dba/dba-primaria.json`).

## Qué es

Tipo nuevo `mapa`. Armi, la exploradora, nombra un departamento de Colombia y el estudiante lo toca en un mapa SVG propio. Rondas deterministas por semilla y regiones naturales; 2/1/0 puntos por ronda; pista según el error (vecino → dirección; misma región → ánimo y dirección; otra región → región del pedido); revelado tras el segundo fallo; sin reloj. Teclado: Tab entra al mapa (un solo punto de tabulación), flechas al vecino en esa dirección, Enter elige.

## Archivos

| Ruta | Qué |
|---|---|
| `tools/mapas/generar-colombia.mjs` + `README.md` | Natural Earth → `colombia.ts` (reproducible) |
| `apps/web/src/features/actividades/juegos/mapa/colombia.ts` | Geometría generada: 33 unidades, regiones, vecinos, centros (29 KB) |
| `…/mapa/generador.ts` | Rondas, rumbos, `pistaMapa`, `descripcion`, `vecinoEnDireccion`, `zona` |
| `…/mapa/tipo.ts` + `tipo.test.ts` | Esquema, calificación 2/1/0, repaso (17 pruebas) |
| `…/mapa/juego.tsx` + `mapa.module.css` | Interfaz, escena del lanzamiento en 4 tiempos, cámara, poses, foco propio |
| `…/mapa/audio.ts` | Efectos CC0 por Web Audio, programados al ms del impacto |
| Registro | `tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx` (dibujo de la banda: mapa con banderín) |
| `curriculo/actividades/ciencias-sociales/5/armi-explora-colombia.json` | Actividad de ejemplo (10 rondas, las 6 regiones, con fronteras) |

### Recursos

| Ruta | Peso | Origen |
|---|---|---|
| `public/images/juegos/mapa/armi.webp` | 57 KB | Gemini chat (imagen), 2026-11-07, ref. `armi/senala.webp`. Armi con sombrero de explorador, mochila y chincheta de banderín vacío |
| `…/armi-lanza.webp` | 50 KB | Gemini, ref. `armi.webp`; segunda generación (la primera no se leía como lanzamiento); `recortar-pose.py --como armi.webp`. Brazo estirado, manos vacías |
| `…/chincheta.webp` | 9 KB | Gemini, ref. `armi.webp` (estilo). Chincheta roja con banderín vacío |
| `…/mesa.webp` | 85 KB | Gemini, ref. `robots/azotea.webp` (estilo); regenerada para quitar letras en inglés de la brújula. Mesa de exploradora, centro despejado |
| `…/portada.webp` | 59 KB | Gemini, refs. armi, mesa y chincheta; regenerada sin letras en la brújula; franja 3,6:1 a 1200×333. Mapa de fantasía (no es Colombia) |
| `public/audio/juegos/mapa/musica-exploracion.mp3` | 2,7 MB | Gemini (música), 171,5 s, −24 LUFS, fundido 2 s, bucle |
| `public/audio/juegos/mapa/{lanzar,clavar,toque,acierto,error,aparecer}.mp3` | 2–6 KB | Kenney, CC0 1.0 (`LICENCIAS.md`) |

Conversaciones de Gemini: <https://gemini.google.com/app/12c2d9d35db18c02> (y siguientes de la misma sesión). 🔶 Revisar los términos de uso de Gemini para material del colegio.

## Verificación

- `npm test`: 68 archivos, 799 pruebas, todas pasan. `npm run lint` y `npm run build`: sin errores.
- Navegador (página temporal `src/app/prueba.mapa/`, ya borrada): 1920×1080 (Armi 389 px ≈ 36 % del alto; mapa 488×664), 1440×900 y 390×844 (Armi 114 px sobre el océano Pacífico del mapa), sin desplazamiento horizontal.
- Video a 1920×1080, hoja de cuadros recortada entre Armi y el departamento: carga → pose de lanzamiento → la chincheta vuela en arco (4–5 cuadros a 12 fps) → «¡TAC!», anillo y acercamiento → chincheta clavada, etiqueta y Armi en guardia. Fallo: onda tenue y etiqueta tachada. Revelado: rayas, contorno discontinuo y aviso con los límites.
- Teclado: Tab llega al mapa en un paso; flechas recorren vecinos; Enter toca; el foco se dibuja como silueta (halo amarillo + trazo azul noche).
- axe-core 4 (WCAG 2.0/2.1 A y AA) en la pantalla de juego: sin violaciones.
- `prefers-reduced-motion`: sin vuelo, sin cambio de pose ni cámara; la chincheta aparece al instante.
- Ruta real con la cuenta demo de 5.°: la tarjeta muestra la portada en Ciencias Sociales y el juego abre.

## Decisiones y pendientes

- Defectos encontrados y corregidos al verificar: rectángulo de foco por defecto (le ganaba `.pagina :focus-visible`), onda del fallo enorme (`transform-box` ignorado en `<circle>` → se anima `r`), vuelo demasiado corto (250 → 360 ms), confeti común que salía en el clic (ahora en el impacto), consulta de contenedor que no aplicaba sobre la propia escena.
- Hallazgo fuera de alcance: `--fuente-display` y `--fuente-cuerpo` no existen en el proyecto; `golpea` (y otros que las usen) caen a la sans del sistema. Este juego usa `--font-heading` / `--font-sans`. 🔶 Corregir en `golpea` si se aprueba.
- 🔶 Escala 2/1/0 (patrón aprobado); validar con la docente.
- 🔶 Asignación de departamentos a regiones naturales (uno por región).
- 🔶 Nombre accesible de un departamento sin resolver: posición («Departamento 18 de 33, en el centro»), no su nombre, porque es una prueba de ubicación (WCAG 1.1.1, identificación descriptiva). Validar con la docente si un estudiante con baja visión necesita otra modalidad.
- 🔶 Islas muy pequeñas en el recuadro; el área táctil es todo el recuadro.
- 🔶 El usuario debe oír los efectos (elegidos por nombre) y la música en bucle.
- No verificado: lector de pantalla real (solo axe y nombres accesibles), Safari (`offset-path` y `r` en CSS), tableta táctil real.
