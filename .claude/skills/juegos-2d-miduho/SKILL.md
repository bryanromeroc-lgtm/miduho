---
name: juegos-2d-miduho
description: Adaptador de MIDUHO para `game-feel` y `design-game`. Úsalo al crear, pulir o revisar juegos educativos 2D de MIDUHO (tipos en apps/web/src/features/actividades/juegos). Traduce esas dos skills genéricas (pensadas para Phaser/Godot/Unity) a la pila real del proyecto —React 19, CSS Modules, Web Audio— y les impone las reglas duras del colegio y el estándar de calidad aprobado por el usuario (personajes grandes, escenas de acción, poses de ataque, música). Se activa con "juego educativo", "pulir juego", "retroalimentación al acertar/fallar", "juice", "animar juego", "escena de acción", "pose de ataque", "personajes pequeños".
---

# Juegos 2D de MIDUHO con `game-feel` y `design-game`

`game-feel` y `design-game` están instaladas **sin modificar**. Esta skill no las reemplaza: dice cómo leerlas en este proyecto. Si algo de aquí contradice a una de ellas, gana esta skill.

## Estándar aprobado (así quiere el usuario los juegos, 2026-11-04)

Referencias vivas: **Duelo de divisiones** (`juegos/robots/`) para combate y acción, **La entrega de Armi** (`juegos/aventura/`) para historia por escenas. Antes de dar por terminado un juego nuevo o pulido, cumple los cinco puntos:

1. **Personajes protagonistas grandes:** ~⅓ del alto de la pantalla en un PC a pantalla completa (1920×1080), nunca un tamaño fijo pequeño. → «Personajes que escalan».
2. **Cada evento importante es una escena con tiempos**, no un desplazamiento: anticipación → acción → impacto con pausa → recuperación. → «Escenas de acción».
3. **Dos estados por personaje** que actúa (en guardia y en acción), con imágenes propias del mismo personaje. → «Poses».
4. **Cámara y capas:** el mundo (fondo + personajes + efectos) se mueve; el marcador y el texto, no.
5. **Sonido y música en su sitio:** efectos sincronizados con el impacto y música apagable por separado. → tabla de traducción.

Todo sigue sujeto a las reglas duras del final (movimiento reducido, sin destellos rápidos, el error no castiga, texto en HTML).

## Pila real (no es Phaser ni Godot)

Cada tipo de juego vive en `apps/web/src/features/actividades/juegos/<tipo>/`:
`tipo.ts` (esquema Zod + `definirTipo`), `juego.tsx` (componente React), `<tipo>.module.css`, `tipo.test.ts`. Se registra en `tipos/registro.ts`. Lo común está en `juegos/comun/` (`sonido.ts`, `rondas.ts`, `piezas.tsx`, `escena.module.css`, `comun.module.css`, `voz.ts`).

## Traducción de lo que dicen las skills

| Las skills dicen | En MIDUHO |
|---|---|
| `Constants.js`, `EventBus.js`, `src/scenes/` (design-game) | No existen. Valores en variables CSS del módulo (`--robot`, `--alcance`…) o en `DESIGN.md`; eventos = la lógica de `useRondas` (acierto / primer fallo / solución / fin) o el estado del componente (`data-duelo`) |
| «Carga la skill game-designer» (design-game) | No está instalada. Usa `game-feel` para el vocabulario de movimiento, `impeccable` para el diseño visual y `DESIGN.md` como fuente |
| Gráficos procedurales, partículas, tweens | SVG/CSS (`transform`, `opacity`, `filter`, `@keyframes`, `transition`). Sin motor de juegos ni canvas para texto |
| Efectos de sonido | `comun/sonido.ts` (Web Audio: `acierto/error/fin/toque/reloj/impacto`). El sonido del golpe se programa **al mismo ms que el impacto visual** (en el Duelo, 48 % de 2650 ms = 1280 ms) |
| Música | Permitida si el juego la pide (el usuario la aprobó en el Duelo). Pista generada con `gemini-media` (modo música), normalizada a ~−23 LUFS, fundido de 2 s y sin silencio final para el bucle; `<audio loop preload="none">` que arranca al empezar a jugar, volumen ~0,28, botón propio separado del de efectos, pausa con el juego y al ocultar la pestaña |
| Screen shake (trauma) | Solo en el **acierto** y sobre la capa `.camara` (nunca el marcador): un temblor que decae en ~170 ms dentro del keyframe, una sola pasada. En el error, no. Apagado con `prefers-reduced-motion` |
| Partículas | `<Chispas>` (confeti, juegos por rondas) o chispas del impacto (≤ 8 `<i>` con ángulo `--a` y distancia `--d`); no hay emisor ni pool |
| Hit-stop / `time_scale` | Se **simula en el keyframe**: atacante y golpeado mantienen el mismo `transform` durante ~5 % (≈130 ms) en el impacto. Nunca bloqueando la lógica ni con temporizadores |
| Squash & stretch, overshoot («pop») | Sí: `transform: scale()` con salida exponencial (`cubic-bezier(0.25, 1, 0.5, 1)` o `(0.16, 1, 0.3, 1)`); vuelve al reposo. **Sin curvas elásticas** (valores > 1 en el `cubic-bezier`): el hook de impeccable las marca |
| Flash al recibir golpe | Un solo destello por golpe con `filter: brightness()` en el golpeado (no pantalla completa) |
| `npm run build` para verificar | Verifica con `npm run build`, `npm run lint`, `npm test` desde la raíz |

## Piezas de «juice» ya construidas (úsalas antes de escribir otras)

Todas son ligeras: CSS de una sola pasada, sin bucle de animación, sin canvas ni librerías, con `prefers-reduced-motion` apagándolas.

| Qué | Dónde | Equivale en `game-feel` |
|---|---|---|
| Armi entra, salta al acertar y duda al fallar | `comun/piezas.tsx` + `comun.module.css` (`data-pose`) | squash & stretch + overshoot (patrón 3) |
| Armi entra caminando y sale caminando al cambiar de escena | `aventura/aventura.module.css` (`llega`, `camina`) + `caminar()` en `aventura/juego.tsx` | transición con anticipación |
| Banderín de la guirnalda «pega un saltito» al cerrar la ronda | `comun.module.css` (`banderin`) | pop con easing |
| Halo + confeti (12 piezas al acertar a la primera, 5 si se acierta corrigiendo; en el error, ninguno) | `comun/efectos.tsx` (`useReaccion`, `<Chispas>`), `efectos.module.css`, datos puros en `confeti.ts` | paquete de feedback por importancia (patrón 4) |
| Combate completo: aura de carga, líneas de velocidad, estrella, anillo, chispas, «¡PUM!», cámara con temblor, poses de ataque | `robots/juego.tsx` + `robots/robots.module.css` | patrones 1–4 juntos |
| Sonido `acierto/error/fin/toque/impacto` | `comun/sonido.ts` | capa de audio |

`useRondas` ya devuelve `reaccion`; para sumar la celebración a un juego nuevo por rondas basta `<Chispas reaccion={reaccion} />` como primer hijo de `e.escena`. Los juegos que no usan `useRondas` (corrector, jarras, bocadillo, porcentaje, division, operaciones) aún no la llevan: para añadirla, llamar `useReaccion()` y `disparar("acierto" | "corregida")` donde ya suena `acierto`.

**Presupuesto de peso:** ≤ 12 elementos de efecto por evento, solo `transform`/`opacity`/`filter`, sin dependencias nuevas. Microrreacciones ≤ ~900 ms; una **escena de acción** puede durar hasta ~2,7 s si el componente ya espera ese tiempo entre rondas (no alargues la espera sin decirlo). Cada imagen de personaje o pose ≤ ~200 KB en `.webp`.

## Personajes que escalan

- Tamaño en una variable de la escena, con `container-type: inline-size`:
  `--robot: clamp(120px, min(24cqw, 40dvh), 460px)`; posición con `--margen: 3cqw` y `--suelo: 4%`. Nada de `max-height: 210px` ni anchos en px fijos.
- El `<Image>` del personaje con `sizes="(max-width: 650px) 40vw, 460px"` (o el tamaño máximo real) para que no se vea borroso al crecer.
- Si el personaje comparte fila con un globo de texto, limítalo también por el ancho: `height: clamp(110px, min(33dvh, 46vw), 420px)` (Armi). Si no, en el teléfono aplasta la pregunta a una palabra por línea.
- Ponle sombra en el suelo (`::after` con `blur`) para que pise el escenario y no flote.
- Texto y botones también crecen en pantalla grande (`clamp(…, …vw, …)` con máximos de ~1,5–2,3 rem), con botones de respuesta de `clamp(64px, 9dvh, 100px)` de alto.
- Móvil (≤ 650 px): `--robot: 37cqw` y el resto igual; las mismas animaciones sirven porque las distancias se calculan con las variables.

## Escenas de acción (patrón del Duelo)

Un evento importante (un golpe, una entrega, un salto) se cuenta en **cuatro tiempos** dentro de una sola animación de duración fija, disparada por un atributo (`data-duelo="acierto" | "fallo"`):

| Tiempo | % de 2650 ms | Qué pasa |
|---|---|---|
| Lectura | 0–22 % | El tablero marca la respuesta y se retira; el mensaje de resultado entra (≈20–27 %) y se queda casi 2 s |
| Carga (anticipación) | 22–38 % | Quien actúa retrocede, se aplasta (`scale(.9, 1.08)`), se inclina y aparece su aura detrás |
| Acción | 38–48 % | Se lanza estirado (`scale(1.16, .9)`) hasta `--alcance` = `100cqw - 2·margen - 2·robot + 5cqw`; aparecen líneas de velocidad (`repeating-conic-gradient` con máscara radial) y la cámara se acerca |
| Impacto | 48–55 % | Ambos quietos ~130 ms (hit-stop), estrella (`clip-path`), anillo, ≤ 8 chispas, onomatopeya decorativa («¡PUM!», `aria-hidden`), un destello en el golpeado y el temblor de cámara; suena `impacto` |
| Recuperación | 55–100 % | El golpeado sale despedido y se recompone; el atacante regresa; todo vuelve al reposo |

- **La cámara** es una capa (`.camara`) con fondo propio, personajes y efectos; su `transform-origin` apunta al punto de choque. El marcador, el tablero y el mensaje viven fuera de ella.
- **Acierto con todo, fallo en versión suave**: en el fallo no hay temblor ni onomatopeya, la estrella es más pequeña y las líneas, tenues. El error no castiga.
- `z-index: 1` en cada personaje para que el aura y la sombra (`z-index: -1`) queden detrás del personaje pero delante del fondo; el impacto en `z-index: 2`.
- La información nunca depende de la escena: el resultado está escrito en el mensaje (`role="status"`) y en el tablero; la arena es `aria-hidden`.

## Poses: dos estados por personaje

Cada personaje que actúa tiene su imagen **en guardia** (la de siempre) y otra **en acción** (ataque, lanzamiento, celebración), del mismo personaje.

1. **Generar** la pose con `gemini-media` (modo imagen) pasando la imagen actual del personaje como `--ref`. Prompt: «Usa EXACTAMENTE el mismo personaje…» + descripción de colores y rasgos + la pose **con dirección explícita** (quien está a la izquierda golpea «hacia la DERECHA de la imagen», el de la derecha «hacia la IZQUIERDA») + «fondo blanco totalmente liso y plano, sin sombra en el suelo, sin efectos ni líneas de movimiento» + «Sin texto, sin letras, sin logotipos, sin personas.»
2. **Mirar** la imagen (Read): mismo personaje, misma paleta, dirección correcta. Si no, una sola regeneración.
3. **Recortar y encajar** con la herramienta del repo, que quita el fondo blanco conectado al borde y coloca la pose en el mismo lienzo, altura y suelo que la pose en guardia (así no salta al cambiar):
   ```bash
   python3 tools/gemini-media/recortar-pose.py "$SCRATCH/pose.jpg" apps/web/public/images/juegos/<tipo>/<personaje>-ataque.webp --como apps/web/public/images/juegos/<tipo>/<personaje>.webp
   ```
4. **Montar** las dos imágenes en el mismo contenedor: la de guardia dentro de `<span className={s.poseNormal}>` (así su animación de entrada no se reinicia) y la de acción encima con `position: absolute; bottom: 0; opacity: 0`. Ambas llevan los mismos atributos de color (`data-color`, `data-rival`) para que el `hue-rotate` las tiña igual.
5. **Cambiar** de estado con dos animaciones casi instantáneas sincronizadas con la escena: la pose de acción aparece al lanzarse (≈33 %) y se va al regresar (≈72 %).
   ```css
   @keyframes poseAtaque { 0%, 33% { opacity: 0; } 33.5%, 72% { opacity: 1; } 72.5%, 100% { opacity: 0; } }
   @keyframes poseNormal { 0%, 33% { opacity: 1; } 33.5%, 72% { opacity: 0; } 72.5%, 100% { opacity: 1; } }
   ```
6. Con `prefers-reduced-motion` no hay cambio de pose: se queda en guardia.
7. Registrar el origen de cada pose en el doc del incremento (ruta, peso, fecha, referencia, 🔶 términos de uso de Gemini).

## Pantalla completa, imágenes y portada

Reglas que aplican a **todo juego nuevo o pulido** (pedido del usuario, 2026-11-02, ampliado 2026-11-04):

**1. El juego se juega en pantalla completa.** El reproductor (`reproductor/reproductor.tsx`) ya cubre toda la ventana: capa fija con barra superior («Salir del juego» → vuelve a la vista de la materia, título y tipo), instrucción y aviso debajo, y la mesa hasta 1400 px de ancho. Lo que le toca al juego:
- Usar el ancho y el alto disponibles: nada de anchos fijos estrechos (`width: 820px`, `max-width` pequeños en la mesa del juego). Rejillas que repartan el espacio (`repeat(2, minmax(0, 1fr))` y una columna bajo ~720 px) en vez de `auto-fit` con ítems que abarcan toda la fila (dejan columnas vacías).
- Las escenas usan `escena.module.css`, que ya crece con el alto (`max(460px, 64dvh)`); medir con `cqi`/`cqw` dentro de la escena.
- No crear otro botón de salida ni cambiar la barra: es compartida por todos los juegos. Si un juego necesita algo distinto ahí, se propone primero.
- Verificar a **1920×1080**, **1440×900** y **390×844**: personajes de ~⅓ del alto en 1920, sin desplazamiento horizontal, la acción principal de cada ronda visible o a un desplazamiento corto, y «Salir del juego» lleva de vuelta a la materia.

**2. Las imágenes se generan con Gemini (`gemini-media`) o con ChatGPT (Codex CLI).** El usuario autorizó ambos servicios; no se envían datos personales.
- **Gemini primero** cuando la imagen debe coincidir con personajes o escenarios que ya existen (poses, escenas nuevas del mismo juego, intro): se le pasan las imágenes del juego como `--ref`. Ver `.claude/skills/gemini-media/SKILL.md`.
- **Codex** sigue sirviendo para fondos y portadas nuevas: binario `/usr/lib/chatgpt/resources/codex` (no está en el PATH), trabajando en el scratchpad. **El prompt va por stdin** (`-i` se traga el argumento):
  ```bash
  printf "%s" "$(cat prompt.txt)" | /usr/lib/chatgpt/resources/codex exec --skip-git-repo-check -s workspace-write -C "$DIR" -i ref-estilo.png - > gen.log 2>&1
  ```
  Tarda 2–4 min; lanzarlo en segundo plano y esperar con `until [ -f "$DIR/<nombre>.png" ]`. `ref-estilo.png` = una imagen ya publicada del proyecto convertida a PNG.
- Estilo fijo en el prompt: caricatura con contornos definidos, colores vivos y cálidos, «exactamente en el estilo de la referencia». **Sin personas, sin texto, sin letras, sin números, sin logotipos**; sin animales salvo que se pida a Armi expresamente.
- Mirar cada imagen (Read) antes de usarla. Si el servicio falla, decirlo y dejar el respaldo (degradado o dibujo SVG); nunca afirmar que hay imagen.
- Convertir a `.webp` (calidad 80–82) en `apps/web/public/images/juegos/<tipo>/`.

**3. Cada actividad nueva lleva imagen de portada** en su tarjeta de la vista de la materia.
- Campo opcional `"imagen": "/images/juegos/<tipo>/portada.webp"` en el JSON de la actividad (esquema en `tipos/registro.ts`; solo rutas `/images/….webp`). La tarjeta plana (`materias/vista/tarjeta-plana.tsx`) la muestra con `alt=""`, porque el título ya nombra la actividad; sin imagen, cae al dibujo de `ilustracion-tipo.tsx`, que se sigue haciendo para cada tipo nuevo.
- Prompt de portada: escena que **represente el contenido** del juego (los personajes y objetos con los que se juega, grandes y centrados), buen margen. La banda de la tarjeta es muy panorámica: recortar la franja central a ~**3,6:1** y guardar a **1200×333**; revisar en la vista que lo importante no quede cortado.
- Una portada distinta por actividad cuando dos actividades del mismo tipo cuenten cosas distintas (`portada-<slug>.webp`).
- 🔶 Las aventuras salen como sticker destacado (`tarjeta-destacada.tsx`) y todavía **no** leen `imagen`.

## Verificar el movimiento

- Capturas fijas con `playwright-core` (Chrome sin interfaz, cuenta demo o página temporal; ver la memoria «verificar juego en navegador») a 1920×1080, 1440×900 y 390×844.
- **Para las escenas de acción, graba video**: `browser.newContext({ recordVideo: { dir, size: { width: 960, height: 540 } } })`, juega un acierto y un fallo, y saca una hoja de cuadros con ffmpeg (`-vf "fps=8,scale=320:-1,tile=6x5"`). Revisa que se vean los cuatro tiempos y el cambio de pose.
- **No confíes en congelar** animaciones con `getAnimations()` + `currentTime` para capturas: en Chrome sin interfaz el estilo calculado cambia pero el cuadro pintado puede quedar viejo.
- Claude no oye: pídele al usuario que confirme que el sonido del impacto coincide con el choque y que la música suena bien en el bucle.

## Simuladores (laboratorio + retos)

Si el juego es un simulador o manipulativo, el diseño (principios, retos, calificación, error que enseña) está en `simuladores-miduho`; esta skill sigue mandando en la construcción.

## Juego a partir de una referencia web

Si el juego reproduce la mecánica de otro (Cokitos, Digipuzzle…), estúdialo primero con REA según `referencia-rea` y sigue `/crear-juego-referencia` (modelo aprobado: `juegos/golpea/`). Solo se reproduce la mecánica; esta skill sigue mandando en la construcción.

## Qué usar de cada skill

- **`game-feel`**: capas breves de retroalimentación por evento (sonido + movimiento + color), easing en vez de movimiento lineal, juice proporcional a la importancia, que siempre vuelva al reposo. Sus patrones 1–4 están traducidos arriba (temblor, hit-stop, squash & stretch, paquete por importancia).
- **`design-game`**: su Paso 1 (auditar) y Paso 2 (tabla de puntajes 1–5) sirven para revisar un juego ya hecho; suma a su tabla una fila «Tamaño de personajes en 1920×1080» y otra «Escena de acción / poses». En el Paso 3 **no implementes sin que se elijan las mejoras** (salvo que el usuario pida arreglar directamente), y no toques la lógica de calificación (`tipo.ts`, `reglas.ts`).
- **`gemini-media`**: poses, escenas y música coherentes con lo que ya existe.
- **`impeccable`** y **`a11y-audit`**: revisión visual y de accesibilidad antes de cerrar.

## Reglas duras que mandan sobre todo lo anterior

1. **Movimiento:** todo efecto tiene bloque `@media (prefers-reduced-motion: reduce)` (como `escena.module.css`) y la información nunca viaja solo en la animación (WCAG 2.1 AA).
2. **Destello:** nada parpadea más de 3 veces por segundo (WCAG 2.3.1). Un destello por golpe en el personaje, nunca flash blanco de pantalla completa.
3. **El error no castiga.** Tono grave y amable, versión suave de la escena, sin sacudidas ni rojo agresivo; la ronda enseña (pista, segundo intento, solución). 🔶 Criterio pedagógico propuesto; confirmar con la docente.
4. **Sin marcadores que comparen niños.** La presión de tiempo solo donde la mecánica la tiene por diseño (Duelo: reloj de 15 s, pausable). 🔶 Propuesto.
5. **Texto pedagógico siempre en HTML**, seleccionable y con contraste ≥ 4.5:1 (mensajes sobre la escena con fondo propio). `alt=""` en decorativos, `alt` en informativos. Foco visible y teclado.
6. **Contenido propio y datos ficticios**: sin nombres reales, sin copiar escenas, personajes ni textos de otras plataformas ni de los ejemplos de estas skills.
7. **Español de Colombia** en toda cadena visible.

## Flujo sugerido

1. Definir el tipo (esquema Zod y calificación) **antes** del pulido; ese código no lo toca el pulido.
2. Escenario y personajes escalables (`--robot`, `cqw`, `dvh`) y la cámara como capa.
3. Escenas de acción por evento en cuatro tiempos; acierto completo, fallo suave; sonido en el ms del impacto.
4. Poses en acción con `gemini-media` + `recortar-pose.py`; fondo, portada (y música si aplica).
5. Verificar en pantalla completa con capturas y video (sección «Verificar el movimiento»).
6. Revisar con `design-game` (auditoría) y con `/impeccable`; `/a11y-audit`; `npm run build`, `npm run lint`, `npm test`.
