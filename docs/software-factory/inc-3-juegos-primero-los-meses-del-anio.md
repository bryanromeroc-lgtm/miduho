# Juegos de 1.° · «Los meses en su lugar» (tarea 3.3 de `juegos-primero`)

- **Fecha:** 2026-11-17
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.3; delta nuevo `specs/actividad-ordenar-casillas/`)
- **Referencia funcional:** `docs/investigacion/referencia-cokitos-meses-del-anio.md` (Cokitos → Wordwall, plantilla «Orden correcto», tema «chalk»; mecánica estudiada con REA; nada copiado)
- **Captura sonora:** `content/referencias/cokitos-meses-del-anio/` (`inventario.json`, `LICENCIA.md`, `RESUMEN.md`; audio fuera de git)
- **Personaje:** Andi, el cóndor, guía de Ciencias sociales (regla del usuario: el personaje del juego es la guía de su asignatura)

## Piloto del reparto Claude / Codex

Primer juego construido con el reparto aprobado por el usuario el 2026-11-17:

| Quién | Qué hizo |
|---|---|
| Claude | Captura sonora, `LICENCIA.md`, tabla audio → evento, adaptación de 16 efectos, imágenes con Gemini, supervisión (revisión del diff, partida en navegador, capturas, reglas duras), cierre |
| Codex (CLI, `codex exec`) | Estudio con REA e informe, propuesta de diseño, delta de spec, lógica + pruebas, interfaz, contenido; una ronda de correcciones |
| Usuario | Visto bueno del diseño y de la calificación |

Codex recibe un encargo por paso y lee la skill `.agents/skills/juego-referencia-codex/SKILL.md`, que remite a las skills de `.claude/`. Funcionó: REA con Chrome aislado desde el sandbox de Codex (con `-c sandbox_workspace_write.network_access=true`). Lecciones:

- El worktree necesita `node_modules` **reales** (copia con enlaces duros `cp -al`): Turbopack rechaza un `node_modules` enlazado fuera de la raíz.
- El sandbox de Codex no alcanza el PostgreSQL de desarrollo (`EPERM 127.0.0.1:5433`): las pruebas de integración las corre Claude.
- La primera construcción de Codex dejó contenido de la actividad fijo en un componente genérico y el personaje en miniatura; la revisión en navegador lo detectó y una ronda lo corrigió.

## Qué es

Tipo existente `ordenar` con la presentación nueva **`casillas`**: pila de 12 fichas (2 × 6) y 12 casillas numeradas (1.°–6.° / 7.°–12.°) sobre una pizarra. Se coloca sin corrección, «Enviar respuestas» (habilitado desde una ficha, como el original) revela casilla por casilla con ✓/✗ y su efecto, y al final muestra la solución en las falladas o vacías. Andi celebra cada acierto (4 tiempos, pose «señala») y duda con suavidad en los fallos.

## Lo que se añadió para evaluar

| Original | MIDUHO |
|---|---|
| Canvas sin teclado ni lector | Botones HTML, foco visible, tocar o teclado además de arrastrar, `role="status"` |
| Reloj ascendente y ránking | Sin reloj ni ránking |
| Puntaje sobre 12 | Igual: 1 punto por casilla, vacías 0, **un solo envío** (decisión del usuario 2026-11-17, como `agrupar`). Respuesta `id \| null` por casilla; el servidor rechaza longitud errónea, ids repetidos o ajenos |
| Sin voz | Consigna leída sola en 1.° y «Escuchar» por ficha con la síntesis del navegador («voz por grabar» 🔶) |

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/tipos/relaciones.ts` | `ordenar` como unión: sin `presentacion` sigue 3–8, `string[]`; `casillas` admite 3–12, `semilla`, `escena` opcional (fondo y poses) y respuesta con `null` |
| `…/tipos/contrato.ts` | `validarRespuesta?` opcional por tipo, usado por `calificarIntento` |
| `…/juegos/casillas/logica.ts` + `logica.test.ts` | Colocar, devolver, barajar por semilla, orden de revelado |
| `…/juegos/casillas/tablero.tsx` + `casillas.module.css` | Interfaz genérica (nada de los meses en el código) |
| `…/juegos/comun/escuchar.tsx`, `…/reproductor/reproductor.tsx` | `ContextoActividad` lleva además `instruccion` y `audioInstruccion` (opcionales) para la lectura automática |
| `…/reproductor/juegos-relaciones.tsx` | `Ordenar` despacha a `TableroCasillas` si `presentacion === "casillas"` |
| `apps/web/curriculo/actividades/ciencias-sociales/1/los-meses-del-anio.json` | La actividad (SOC-1-03) |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/los-meses-del-anio/andi-{reposo,senala,duda}.webp` (1498×1776, 94–128 KB) | Gemini chat (imagen), 2026-11-17, conversación https://gemini.google.com/app/17e91f47eb88eb63. Reposo con `guias/sociales.webp` como referencia; las otras dos con el reposo; recorte `recortar-pose.py --como` |
| `…/fondo-pizarra.webp` (1920 px, 28 KB) | Gemini, tablero vacío propio (no el tema de Wordwall) |
| `…/portada.webp` (1280 px, 67 KB) | Gemini; muestra 16 fichas en blanco, no 12 (decorativa) 🔶 |
| `public/audio/juegos/casillas/*.mp3` (16) | Efectos de la referencia con `captura-audio adaptar`: inicio, levantar ×3, soltar ×3, revelar, acierto ×3, fallo ×3, fin, reiniciar. Trazados en `LICENCIAS.md` (permiso declarado 2026-11-10; soporte escrito por adjuntar 🔶) |

## Verificación (2026-11-17)

- `npm test`: 90 archivos, 922 pruebas en verde (con el PostgreSQL de desarrollo). `npm run lint`: 0 errores (1 advertencia previa ajena). `npm run build`: compila.
- Partida completa **solo con teclado** en página temporal (borrada): 10/12 en el juego y en la recalificación, sin errores de consola. Capturas a 1920×1080, 1440×900 y 390×844 antes y después de la ronda de correcciones.

## Pendiente 🔶

- Escuchar los 16 efectos (la asociación efecto → evento es inferida por nombre y secuencia).
- Recorrido con la cuenta `demo-primero` (no se tocaron cuentas en este piloto).
- Voz grabada de la consigna y de los meses (hoy, síntesis del navegador).
- Soporte escrito del permiso de Wordwall; términos de uso de Gemini para material del colegio.
