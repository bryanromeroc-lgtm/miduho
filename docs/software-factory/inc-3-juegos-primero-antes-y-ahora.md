# Juegos de 1.° · «Antes y ahora» (tarea 3.4 de `juegos-primero`)

- **Fecha:** 2026-11-17
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.4; delta nuevo `specs/actividad-clasificar-parejas/`)
- **Referencia funcional:** `docs/investigacion/referencia-mundoprimaria-antes-y-ahora.md` (Mundo Primaria soc-hue-1-2, Juego 3 «pasado / presente»; mecánica estudiada con REA y leída del HTML servido; nada copiado)
- **Captura sonora:** `content/referencias/mundoprimaria-antes-y-ahora/` (`inventario.json`, `LICENCIA.md`, `RESUMEN.md`; audio fuera de git)
- **Personaje:** Andi, el cóndor, guía de Ciencias sociales

## Reparto Claude / Codex (segundo juego)

| Quién | Qué hizo |
|---|---|
| Claude | Captura sonora (filtró 58 pistas de anuncios), comprobación por sha256 de que los tres juegos comparten 4 efectos, diagnóstico de por qué el juego no cargaba, lectura de las 6 rondas del HTML servido, adaptación de audio, 12 objetos y portada con Gemini, supervisión (diff, 3 partidas en navegador, simulación del barajado), cierre |
| Codex (CLI) | Estudio con REA (3 encargos: el juego no cargaba headless, luego lo recargaban los anuncios), informe, presentación `parejas` (esquema, lógica + pruebas, interfaz, reglas), contenido, delta de spec; una ronda de correcciones |
| Usuario | Presentación por parejas y los 6 objetos del original |

Lecciones:

- **Mundo Primaria no carga en Chrome sin interfaz.** Con ventana sí, pero desde VS Code Chrome se cae (GLib) salvo con el entorno limpio de `tools/gemini-media/abrir-chrome.sh`. Claude abre ese Chrome en el 9333 y Codex se conecta por CDP. «Aceptar todo» está dentro de un `iframe` del CMP.
- **Los anuncios recargan la página** (intersticial `#google_vignette`) y bloquearlos impide que el juego arranque. Lo que resolvió el estudio fue leer el HTML servido: cada recuadro declara qué pieza acepta (`data-accept`) y las 6 rondas vienen completas.
- **La captura sonora de Mundo Primaria trae audio de anuncios** (adaptedmind): se filtra `audio/captura.json` a `mundoprimaria.com` antes de inventariar, y se corrige `autor_dominio`.
- **Barajar con semillas casi iguales no es azar:** barajar cada pareja con `${semilla}:${id}` dejaba el objeto antiguo primero en las 6 rondas en las partidas 1–3 (primer número del generador correlacionado). Corregido con un solo flujo del generador y una prueba de reparto. Se simuló el mismo patrón en el quiz (`${semilla}:${pregunta}`, 2–4 opciones, 100 partidas): reparto normal, sin sesgo apreciable. Los demás juegos que barajan por subsemilla no se midieron 🔶.

## Qué es

Tipo existente `clasificar` con la presentación nueva **`parejas`**: 6 rondas; en cada una, dos objetos (uno antiguo y uno actual) y dos recuadros fijos, PASADO arriba y PRESENTE abajo, como el original. La pieza mal puesta vuelve a su sitio (efecto `fallo`, Andi duda), la bien puesta se queda (efecto `acierto`, Andi señala, 4 tiempos) y al quedar las dos pasa de ronda (`fin-ronda`); al final, `fin` y el resultado del reproductor.

## Lo que se añadió para evaluar

| Original | MIDUHO |
|---|---|
| Solo arrastrar, sin teclado ni lector | Botones HTML: arrastrar, tocar pieza y recuadro, o solo teclado; foco visible; `role="status"` |
| Sin puntaje | Calificación existente de `clasificar`: 1 punto por objeto si su **primera** ubicación es la correcta, sobre 12; las correcciones no cuentan |
| Se puede fallar sin fin | Tras dos fallos seguidos con la misma pieza, se coloca sola con su explicación |
| Sin voz | Consigna leída sola en 1.° y «Escuchar» en cada pieza con la síntesis del navegador («voz por grabar» 🔶) |
| Orden fijo de las piezas | Rondas barajadas por semilla y orientación repartida (3 rondas con cada categoría primero) |

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/tipos/relaciones.ts` (+ `tipos.test.ts`) | `clasificar` admite `presentacion: "parejas"`: 2 categorías, elementos pares con `imagen` y `pareja`, `escena` opcional |
| `…/juegos/parejas/{logica.ts, logica.test.ts, tablero.tsx, parejas.module.css}` | Lógica pura (rondas, ubicar, primera ubicación, autocolocación) e interfaz genérica |
| `…/juegos/comun/escena.ts` | Tipo de escena compartido con `casillas` (sin cambio funcional) |
| `…/reproductor/{reglas.ts, reglas.test.ts, reproductor.tsx, juegos-relaciones.tsx}` | Reglas «la primera ubicación cuenta» por presentación; despacho a `TableroParejas` |
| `apps/web/curriculo/actividades/ciencias-sociales/1/antes-y-ahora.json` | La actividad (SOC-1-03) |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/antes-y-ahora/<objeto>.webp` ×12 (320×320, 5–20 KB) | Gemini chat (imagen), 2026-11-17: 6 generaciones de dos objetos lado a lado con `vivo-o-no-vivo/cama.webp` como referencia de estilo, cortadas y recortadas. Última conversación: https://gemini.google.com/app/b0ce12dd9078b1b5 (las otras cinco sin URL registrada 🔶) |
| `…/portada.webp` (1280×714, 92 KB) | Gemini, referencias `andi-reposo` + hoja de objetos: https://gemini.google.com/app/233d757086124b65 |
| `…/andi-{reposo,senala,duda}.webp` | Copia de `los-meses-del-anio/` |
| `public/audio/juegos/parejas/{acierto,fallo,fin-ronda,fin}.mp3` | Efectos de la referencia (`ok`, `error`, `level_end`, `game_end`, iguales en los tres juegos por sha256) con `captura-audio adaptar`; trazados en `LICENCIAS.md` (permiso declarado 2026-11-10; soporte escrito por adjuntar 🔶) |

## Verificación (2026-11-17)

- `npm test`: 91 archivos, 928 pruebas en verde (con el PostgreSQL de desarrollo). `npm run lint`: 0 errores (1 advertencia previa ajena). `npm run build`: compila (página temporal borrada antes).
- Tres partidas en navegador (página temporal, borrada) tocando pieza y recuadro: 10/12 con dos fallos a propósito, poses `duda`/`senala` sincronizadas, todas las imágenes cargadas, sin errores de consola; tras la corrección, el orden de las piezas varía. Codex además jugó solo con teclado y tomó capturas a 1920×1080, 1440×900 y 390×844.

## Pendiente 🔶

- Escuchar los 4 efectos (la asociación evento → efecto sale del nombre del archivo y de la petición de red observada en el Juego 3).
- Recorrido con la cuenta `demo-primero`.
- Voz grabada de la consigna y de los objetos (hoy, síntesis del navegador).
- Soporte escrito del permiso de Mundo Primaria; URL de cinco conversaciones de Gemini.
