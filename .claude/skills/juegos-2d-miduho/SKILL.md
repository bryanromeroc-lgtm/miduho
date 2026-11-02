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
| Squash & stretch, overshoot («pop») | Sí: `transform: scale()` con salida exponencial (`cubic-bezier(0.25, 1, 0.5, 1)` o `(0.16, 1, 0.3, 1)`); vuelve al reposo. **Sin curvas elásticas** (valores > 1 en el `cubic-bezier`): el hook de impeccable las marca |
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

## Pantalla completa, imágenes con ChatGPT y portada

Tres reglas que aplican a **todo juego nuevo o pulido** (pedido del usuario, 2026-11-02):

**1. El juego se juega en pantalla completa.** El reproductor (`reproductor/reproductor.tsx`) ya cubre toda la ventana: capa fija con barra superior («Salir del juego» → vuelve a la vista de la materia, título y tipo), instrucción y aviso debajo, y la mesa hasta 1400 px de ancho. Lo que le toca al juego:
- Usar el ancho y el alto disponibles: nada de anchos fijos estrechos (`width: 820px`, `max-width` pequeños en la mesa del juego). Rejillas que repartan el espacio (`repeat(2, minmax(0, 1fr))` y una columna bajo ~720 px) en vez de `auto-fit` con ítems que abarcan toda la fila (dejan columnas vacías).
- Las escenas usan `escena.module.css`, que ya crece con el alto (`max(460px, 64dvh)`); medir con `cqi` dentro de la escena.
- No crear otro botón de salida ni cambiar la barra: es compartida por todos los juegos. Si un juego necesita algo distinto ahí, se propone primero.
- Verificar a **1440×900** y **390×844**: sin desplazamiento horizontal, la acción principal de cada ronda visible o a un desplazamiento corto, y «Salir del juego» lleva de vuelta a la materia.

**2. Las imágenes se generan con ChatGPT (Codex CLI).** El usuario autorizó el servicio; no se envían datos personales.
- Binario `/usr/lib/chatgpt/resources/codex` (no está en el PATH). Trabajar en el scratchpad, nunca dentro del repo. **El prompt va por stdin** (`-i` se traga el argumento):
  ```bash
  printf "%s" "$(cat prompt.txt)" | /usr/lib/chatgpt/resources/codex exec --skip-git-repo-check -s workspace-write -C "$DIR" -i ref-estilo.png - > gen.log 2>&1
  ```
  Tarda 2–4 min; lanzarlo en segundo plano (`( … &)`) y seguir trabajando; esperar con un bucle `until [ -f "$DIR/<nombre>.png" ]`.
- `ref-estilo.png`: una imagen ya publicada del proyecto convertida a PNG (p. ej. `public/images/juegos/fracciones/taller.webp`), solo como referencia de estilo.
- Estilo fijo en el prompt: dibujo plano de caricatura, contornos gruesos azul marino, colores vivos y cálidos, «exactamente en el estilo de la referencia». **Sin personas, sin texto, sin letras, sin números, sin logotipos**; sin animales salvo que se pida a Armi expresamente.
- Mirar cada imagen (Read) antes de usarla. Si Codex falla, decirlo y dejar el respaldo (degradado o dibujo SVG); nunca afirmar que hay imagen.
- Convertir con PIL a `.webp` calidad 80 en `apps/web/public/images/juegos/<tipo>/`.

**3. Cada actividad nueva lleva imagen de portada** en su tarjeta de la vista de la materia.
- Campo opcional `"imagen": "/images/juegos/<tipo>/portada.webp"` en el JSON de la actividad (esquema en `tipos/registro.ts`; solo rutas `/images/….webp`). La tarjeta plana (`materias/vista/tarjeta-plana.tsx`) la muestra con `alt=""`, porque el título ya nombra la actividad; sin imagen, cae al dibujo de `ilustracion-tipo.tsx`, que se sigue haciendo para cada tipo nuevo.
- Prompt de portada: escena que **represente el contenido** del juego (los objetos con los que se juega, grandes y centrados), objetos legibles, buen margen. La banda de la tarjeta es muy panorámica: recortar la franja central del PNG a ~**3,6:1** y guardar a **1200×333**; revisar en la vista que lo importante no quede cortado.
- Una portada distinta por actividad cuando dos actividades del mismo tipo cuenten cosas distintas (`portada-<slug>.webp`).
- 🔶 Las aventuras salen como sticker destacado (`tarjeta-destacada.tsx`) y todavía **no** leen `imagen`.

## Simuladores (laboratorio + retos)

Si el juego es un simulador o manipulativo, el diseño (principios, retos, calificación, error que enseña) está en `simuladores-miduho`; esta skill sigue mandando en la construcción.

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
3. Generar el fondo de la escena y la portada con ChatGPT, y verificar en pantalla completa (sección de arriba).
4. Revisar con `design-game` (auditoría) y con `/impeccable`.
5. `/a11y-audit` y `npm test`.
