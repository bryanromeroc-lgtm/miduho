---
name: "Crear juego historia"
description: Crea una aventura educativa por escenas (historia + preguntas de selección múltiple + ilustraciones de Codex) con el tipo «aventura» de MIDUHO
category: Workflow
tags: [juegos, actividades, historia, aventura, ilustraciones]
argument-hint: "<tema y grado, p. ej. multiplicación de decimales para 5.°, con Armi llevando naranjas>"
---

Crea una **aventura educativa** para la plataforma MIDUHO a partir de este pedido:

> $ARGUMENTS

Una aventura es una historia a pantalla completa: un personaje (por defecto **Armi**, la armadilla) lleva una carga por lugares distintos; cada lugar tiene su ilustración, un problema y una pregunta de **selección múltiple**. Responder bien entrega la carga y avanza la historia; el error no frena nada (pista → segundo intento → respuesta explicada).

Las reglas duras de `AGENTS.md` mandan sobre todo: sin datos personales de menores (nada de nombres de personas, ni «de ejemplo»), sin copiar contenido protegido, WCAG 2.1 AA, marcar con 🔶 lo no confirmado, español de Colombia. Lee antes `.claude/skills/juegos-2d-miduho/SKILL.md` (adaptador y reglas de juice) y, como **modelo de formato y no de contenido**, `apps/web/src/features/actividades/juegos/aventura/tipo.ts` y `apps/web/curriculo/actividades/matematicas/5/la-entrega-de-armi.json`. No copies sus escenas, textos ni números.

## Fase 1 — Analizar (solo lectura)

1. **Pedido:** asignatura, grado, tema y objetivo de aprendizaje. Si falta grado o tema, pregunta una sola vez; lo demás se decide y se declara (personaje, carga, lugares).
2. **Qué ya existe:** el tipo `aventura` ya está hecho; esto es **solo contenido** (un JSON + ilustraciones). Revisa `apps/web/curriculo/actividades/<asignatura>/<grado>/` para no repetir tema ni historia, y `apps/web/public/images/juegos/aventura/` para reutilizar lugares.
3. **Pedagogía** (`progressive-hint-ladder`, `formative-assessment-loop-designer` si conviene): por cada escena define el **error común**, la **pista que orienta sin dar la respuesta** y la **explicación que enseña**. Ordena las escenas de más fácil a más difícil.
4. **Guion de la historia** (tabla): escena · lugar · qué pasa · pregunta · respuesta correcta · error común que cubre cada distractor · carga que se entrega · dibujo de apoyo (`visual` o `muestra`).
5. **Resumen corto** con: historia en una frase, personaje y carga, escenas, qué enseña cada error y lo que queda 🔶. Continúa sin esperar visto bueno si solo es contenido; **pide visto bueno** si hace falta tocar el tipo (ver 3C).

## Fase 2 — Especificar

No uses OpenSpec para contenido nuevo. Si hay que ampliar el tipo (nuevo lugar u objeto), declara el cambio en el resumen; es pequeño y va con pruebas.

## Fase 3 — Construir

**A. Historia y números (primero, sin interfaz).** Reglas del guion:
- 4 a 10 escenas; cada una con **una sola idea** y 2–4 opciones. Los distractores son errores comunes reales (operar al revés, usar el número equivocado, olvidar un paso), no opciones absurdas. Varía la posición de la correcta.
- `correcta` es el índice (desde 0). `pista` orienta; `explicacion` muestra el procedimiento.
- `carga.inicio` y `entrega` por escena: la suma de entregas ≤ inicio. Lo que queda debe tener sentido en la historia (si se entrega 1/4 de 48, ya no hay 48).
- Si la respuesta sale de partir un total en partes iguales, agrega `visual` ({ objeto, total, den, usos }; el total divisible entre `den` y las partes resaltadas menores que `den`). Si solo hay que mostrar una pila de objetos, usa `muestra`. Los dibujos de apoyo aparecen desde el inicio (juntos) y se parten al corregir.
- Redacción propia, tono cálido, lugares y objetos colombianos, **sin nombres de personas**. Las opciones que parecen fracción («1/3») se dibujan en vertical automáticamente.
- `inicio` presenta el encargo; `final` cierra la historia sea cual sea el resultado (sin repetir el título «¡Entrega completa!» que la interfaz ya pone).

**Estándar aprobado del tipo (ya está construido; no lo rompas):** Armi a ~⅓ del alto en un PC (`height: clamp(110px, min(33dvh, 46vw), 420px)`, limitada también por el ancho para no aplastar el globo en el teléfono), con sombra en el suelo; Armi entra caminando a cada lugar y sale caminando al tocar «Seguir el camino» (`caminar()` en `aventura/juego.tsx`); textos y respuestas crecen en pantalla grande. Si la historia necesita a otro personaje o una pose nueva de Armi (p. ej. entregando, cargando), genérala con `gemini-media` usando la pose actual como `--ref` y encájala con `tools/gemini-media/recortar-pose.py --como <pose actual>` (sección «Poses» del adaptador).

**B. Ilustraciones con Codex o Gemini** (detalles comunes, pantalla completa y portada en la sección «Pantalla completa, imágenes y portada» del adaptador `juegos-2d-miduho`; con Gemini, pasa como `--ref` una escena existente para mantener el estilo). Reutiliza primero los lugares existentes: `gallinero`, `tienda`, `puente`, `panaderia`, `mercado`, `salon`, `plaza`. Para un lugar nuevo, genera la imagen con el CLI de ChatGPT/Codex (el usuario ya autorizó este servicio; no envíes datos personales):
- Binario: `/usr/lib/chatgpt/resources/codex` (no está en el PATH). Trabaja en el directorio de scratchpad, no dentro del repo.
- **El prompt va por stdin**: `-i` acepta varios archivos y se traga el prompt si lo pasas como argumento.
  ```bash
  printf "%s" "<prompt>" | /usr/lib/chatgpt/resources/codex exec --skip-git-repo-check -s workspace-write -C "$(pwd)" -i ref-estilo.png - > lugar.log 2>&1
  ```
  `ref-estilo.png` es una escena ya existente convertida a PNG (solo como referencia de estilo). Lanza varios en paralelo, cada uno en su subshell: `(cd "$DIR" && ./gen.sh ... &)`.
- Prompt: ilustración horizontal 16:9, dibujo plano de caricatura, contornos oscuros gruesos, colores vivos y cálidos, igual al estilo de la referencia; escena descrita; **sin personas, animales, texto, letras, números ni logotipos**; elementos decorativos en bordes y tercio superior, **centro y parte baja despejados** (encima va la interfaz); que guarde `<lugar>.png` en el directorio actual.
- Revisa cada imagen mirándola (Read) antes de usarla. Conviértela a `apps/web/public/images/juegos/aventura/<lugar>.webp` (1600×900, calidad 80, con PIL). Una imagen distinta por escena.
- Si Codex falla, dilo y deja el degradado de respaldo; no inventes que hay imagen.

**C. Si el lugar u objeto es nuevo (cambio pequeño del tipo).** Añádelo a `LUGARES` / `OBJETOS` en `juegos/aventura/tipo.ts`, dibuja el objeto en `juegos/aventura/objetos.tsx`, y agrega su degradado de respaldo en `ESCENARIOS` (y en `EXTERIORES` si es al aire libre) de `juegos/aventura/juego.tsx`. Acompáñalo con prueba en `tipo.test.ts`.

**D. Contenido.** `apps/web/curriculo/actividades/<asignatura>/<grado>/<slug>.json` con `tipo: "aventura"`, `instruccion` dicha al estudiante y `tema` en palabras propias.

**E. Pruebas.** Copia el patrón de `juegos/aventura/contenido.test.ts`: valida el archivo con `leerActividad`, comprueba que la opción correcta de cada escena coincide con una **tabla de respuestas esperadas calculada aparte** del JSON, y que la carga se entrega completa (`cargaRestante`).

**F. La tarjeta en la vista de la materia.** No hay que hacer nada: toda actividad `aventura` sale como sticker destacado (`TIPOS_DESTACADOS`). Limitación conocida 🔶: el sticker dibuja siempre a Armi con la carreta de huevos sobre el gallinero y **todavía no lee el campo `imagen`** de portada; si la historia es de otra carga, dilo en el cierre y propón parametrizar el sticker con una portada generada con ChatGPT.

## Fase 4 — Revisar

1. **Ver la historia completa.** No hay cuenta de estudiante a mano y los intentos fallidos bloquean el acceso 15 min: **no pruebes contraseñas**. Crea una página temporal pública bajo `apps/web/src/app/login/prueba-<slug>/page.tsx` (el proxy deja pasar `/login/*`) que monte `<Reproductor>` con el JSON, recórrela con `playwright-core` headless (`/opt/google/chrome/chrome`, `--no-sandbox`) a 1920×1080, 1366×768 y 390×844 contra el servidor de desarrollo que ya corra, falla una respuesta a propósito para ver la pista, mira las capturas y **borra la página temporal**. El juego se ve en pantalla completa (barra con «Salir del juego»): comprueba que Armi se ve grande en 1920, que la pregunta no queda en una columna estrecha en 390, que nada se sale de la pantalla a 1366×768, que no hay desplazamiento horizontal y que no hay errores de consola. Para ver la caminata entre lugares, graba video (sección «Verificar el movimiento» del adaptador).
2. **Accesibilidad:** `/a11y-audit` si hay dependencias; si no, revisión manual: contraste ≥ 4.5:1, teclado, foco visible, información nunca solo en color o animación, texto pedagógico en HTML, imágenes decorativas `aria-hidden`.
3. **`design-game`** (vía adaptador) solo si se pide: tabla de puntajes; aplica solo mejoras que quepan en el presupuesto y no toquen la calificación.
4. **Verificación** desde la raíz: `npm run build`, `npm run lint`, `npm test` (necesita `docker compose -f docker-compose.dev.yml up -d`). Reporta los resultados tal como salgan.

## Cierre

Entrega: la historia en una frase, archivos creados y modificados, imágenes generadas (y cuáles se reutilizaron), resultado de cada verificación, lo que quedó 🔶 y lo que **no** se pudo comprobar (cuenta de estudiante real, a11y con herramienta, etc.). **No hagas commit ni push** salvo que se pida.
