---
name: juegos-2d-miduho
description: Adaptador de MIDUHO para `game-feel` y `design-game`. Úsalo al crear, pulir o revisar juegos educativos 2D de MIDUHO (tipos en apps/web/src/features/actividades/juegos). Traduce esas dos skills genéricas (pensadas para Phaser/Godot/Unity) a la pila real del proyecto —React 19, CSS Modules, Web Audio— y les impone las reglas duras del colegio. Se activa con "juego educativo", "pulir juego", "retroalimentación al acertar/fallar", "juice", "animar juego".
---

# Juegos 2D de MIDUHO con `game-feel` y `design-game`

`game-feel` y `design-game` están instaladas **sin modificar**. Esta skill no las reemplaza: dice cómo leerlas en este proyecto. Si algo de aquí contradice a una de ellas, gana esta skill.

## Pila real (no es Phaser ni Godot)

Cada tipo de juego vive en `apps/web/src/features/actividades/juegos/<tipo>/`:
`tipo.ts` (esquema Zod + `definirTipo`), `juego.tsx` (componente React), `<tipo>.module.css`, `tipo.test.ts`. Se registra en `tipos/registro.ts`. Lo común está en `juegos/comun/` (`sonido.ts`, `rondas.ts`, `piezas.tsx`, `escena.module.css`, `comun.module.css`, `voz.ts`).

## Traducción de lo que dicen las skills

| Las skills dicen | En MIDUHO |
|---|---|
| `Constants.js`, `EventBus.js`, `src/scenes/` (design-game) | No existen. Valores en variables CSS del módulo o en `DESIGN.md`; eventos = la lógica de `useRondas` (acierto / primer fallo / solución / fin) |
| «Carga la skill game-designer» (design-game) | No está instalada. Usa `game-feel` para el vocabulario de movimiento, `impeccable` para el diseño visual y `DESIGN.md` como fuente |
| Gráficos procedurales, partículas, tweens | SVG/CSS (`transform`, `opacity`, `@keyframes`, `transition`). Sin motor de juegos ni canvas para texto |
| Audio sintetizado (siguiente paso de design-game: chiptune) | Ya existe `comun/sonido.ts` (Web Audio, efectos `acierto/error/fin/toque`). Reutilízalo; no agregues música ni librerías de audio |
| Screen shake (trauma) | Por defecto **no**: el error no se sacude. Si algún juego lo justifica, `transform` sutil en la escena, una sola pasada y apagado con `prefers-reduced-motion` |
| Partículas | `<Chispas>` (confeti de pocas piezas, CSS); no hay emisor ni pool |
| Hit-stop / `time_scale` | **No aplica** (no hay bucle de simulación). No lo simules con bloqueos |
| Squash & stretch, overshoot («pop») | Sí: `transform: scale()` con `cubic-bezier` de rebote suave; vuelve al reposo |
| `npm run build` para verificar | Verifica con `npm run build`, `npm run lint`, `npm test` desde la raíz |

## Piezas de «juice» ya construidas (úsalas antes de escribir otras)

Todas viven en `juegos/comun/` y son ligeras: CSS de una sola pasada (`transform`/`opacity`/`scale`), sin bucle de animación, sin canvas ni librerías, con `prefers-reduced-motion` apagándolas.

| Qué | Dónde | Equivale en `game-feel` |
|---|---|---|
| Armi entra, salta al acertar y duda al fallar | `piezas.tsx` + `comun.module.css` (`data-pose`) | squash & stretch + overshoot (patrón 3) |
| Banderín de la guirnalda «pega un saltito» al cerrar la ronda | `comun.module.css` (`banderin`) | pop con easing |
| Halo + confeti (12 piezas al acertar a la primera, 5 si se acierta corrigiendo; en el error, ninguno) | `efectos.tsx` (`useReaccion`, `<Chispas>`), `efectos.module.css`, datos puros en `confeti.ts` | paquete de feedback por importancia (patrón 4) |
| Sonido `acierto/error/fin/toque` | `sonido.ts` | capa de audio |

`useRondas` ya devuelve `reaccion`; para sumar la celebración a un juego nuevo por rondas basta `<Chispas reaccion={reaccion} />` como primer hijo de `e.escena`. Los juegos que no usan `useRondas` (corrector, jarras, bocadillo, porcentaje, division, operaciones) aún no la llevan: para añadirla, llamar `useReaccion()` y `disparar("acierto" | "corregida")` donde ya suena `acierto`.

**Presupuesto de peso:** ≤ 12 elementos de efecto por evento, solo `transform`/`opacity`, duración ≤ ~900 ms, sin dependencias nuevas. Si una mejora de `design-game` o `game-feel` necesita más que eso, se rechaza o se simplifica.

## Qué usar de cada skill

- **`game-feel`**: capas breves de retroalimentación por evento (sonido + movimiento + color), easing en vez de movimiento lineal, juice proporcional a la importancia, que siempre vuelva al reposo.
- **`design-game`**: su Paso 1 (auditar) y Paso 2 (tabla de puntajes 1–5) sirven para revisar un juego ya hecho. En el Paso 3 **no implementes sin que se elijan las mejoras**, y no toques la lógica de calificación (`tipo.ts`, `reglas.ts`).

## Reglas duras que mandan sobre ambas

1. **Movimiento:** todo efecto tiene bloque `@media (prefers-reduced-motion: reduce)` (como `escena.module.css`) y la información nunca viaja solo en la animación (WCAG 2.1 AA).
2. **Destello:** nada parpadea más de 3 veces por segundo (WCAG 2.3.1). Prohibido el flash blanco de pantalla completa que sugiere `game-feel`.
3. **El error no castiga.** Tono grave y amable, sin sacudidas fuertes ni rojo agresivo; la ronda enseña (patrón de `useRondas`: pista, segundo intento, solución). 🔶 Criterio pedagógico propuesto; confirmar con la docente.
4. **Sin presión de tiempo** ni marcadores que comparen niños. 🔶 Propuesto.
5. **Texto pedagógico siempre en HTML**, seleccionable y con contraste ≥ 4.5:1. `alt=""` en decorativos, `alt` en informativos. Foco visible y teclado.
6. **Contenido propio y datos ficticios**: sin nombres reales, sin copiar escenas, personajes ni textos de otras plataformas ni de los ejemplos de estas skills.
7. **Español de Colombia** en toda cadena visible.

## Flujo sugerido

1. Definir el tipo (esquema Zod y calificación) **antes** del pulido; ese código no lo toca el pulido.
2. Aplicar `game-feel` por evento, empezando con 2–3 canales (sonido + movimiento + color).
3. Revisar con `design-game` (auditoría) y con `/impeccable`.
4. `/a11y-audit` y `npm test`.
