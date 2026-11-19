---
name: "Crear juego"
description: Flujo completo para analizar y crear un juego educativo 2D en MIDUHO, con las skills de pedagogía, juice, diseño y accesibilidad
category: Workflow
tags: [juegos, actividades, skills]
argument-hint: "<descripción del juego, p. ej. un juego de fracciones para 4.°>"
---

Crea un juego educativo 2D para la plataforma MIDUHO a partir de este pedido:

> $ARGUMENTS

Sigue las fases **en orden**. No saltes a escribir código sin haber pasado por las fases 1 y 2. Las reglas duras de `AGENTS.md` mandan sobre todo lo demás: sin datos personales de menores, sin copiar contenido protegido, WCAG 2.1 AA, marcar con 🔶 lo no confirmado, español de Colombia.

Si el pedido es un **simulador o manipulativo** (laboratorio libre + retos, al estilo de PhET o Toy Theater), usa `/crear-simulador` en su lugar.

Antes de empezar, lee `.claude/skills/juegos-2d-miduho/SKILL.md` (adaptador: pila real, piezas ya hechas, presupuesto de peso y el **estándar aprobado**). Las skills `game-feel` y `design-game` se leen **a través de ese adaptador**; si algo choca, gana el adaptador.

**Estándar de calidad aprobado por el usuario** (referencias: Duelo de divisiones y La entrega de Armi): personajes protagonistas de ~⅓ del alto en un PC a pantalla completa; cada evento importante contado como escena en cuatro tiempos (anticipación → acción → impacto con pausa → recuperación); dos poses por personaje que actúa (en guardia y en acción); cámara que mueve el mundo pero no el marcador; efectos sincronizados con el impacto y música apagable aparte si el juego la lleva. Un juego que no cumpla esto no está terminado.

## Fase 1 — Analizar (solo lectura, no se crea nada)

1. **Pedido:** extrae asignatura, grado, tema y objetivo de aprendizaje. Si falta algo imprescindible (grado o tema), pregunta una sola vez; lo demás se decide con criterio y se declara.
2. **Qué ya existe:** revisa `apps/web/src/features/actividades/tipos/registro.ts` y `juegos/` para ver los 21 tipos. **Prefiere reutilizar un tipo existente con contenido nuevo** (solo un JSON). Solo se crea un tipo nuevo si ninguno sirve; justifica por qué.
3. **Actividades vecinas:** mira `apps/web/curriculo/actividades/<asignatura>/<grado>/` para no repetir tema y copiar el formato de redacción, de ítems y de explicaciones.
4. **Pedagogía** (skills `progressive-hint-ladder`, `formative-assessment-loop-designer`, `productive-failure-protocol` según convenga): define el error común del tema, la pista que enseña y qué mide cada ronda. Solo para este paso; no generes planes de clase.
5. **Entrega un resumen corto y espera visto bueno** si el cambio crea un tipo nuevo. Si solo es contenido en un tipo existente, continúa y declara la decisión.

El resumen incluye: decisión (reutilizar o tipo nuevo), mecánica en una frase, rondas, cómo se califica, qué enseña el error, **qué personajes hay y cuál es la escena de acción de cada evento** (qué hace cada uno al acertar y al fallar, y qué pose nueva necesita), y qué queda 🔶.

## Fase 2 — Especificar

- **Tipo nuevo o cambio de arquitectura:** usa el flujo OpenSpec (`/opsx:propose`) antes de implementar.
- **Solo contenido nuevo:** no hace falta OpenSpec.

## Fase 3 — Construir

**A. Lógica primero (ni juice ni CSS todavía).** Si hay tipo nuevo, crea `apps/web/src/features/actividades/juegos/<tipo>/` con `tipo.ts` (esquema Zod + `definirTipo`, como `sello/tipo.ts`) y `tipo.test.ts` junto a él. Esa lógica de calificación **no la toca el pulido**.

**B. Registro** (solo si hay tipo nuevo). Los cuatro lugares:
1. `tipos/registro.ts` → importar y añadir a `DEFINICIONES`.
2. `reproductor/reproductor.tsx` → `dynamic(...)` del juego y entrada en el mapa de juegos.
3. `reproductor/reglas.ts` → añadir el tipo a la lista.
4. `materias/vista/ilustracion-tipo.tsx` → ilustración de respaldo de la tarjeta.

**C. Interfaz.** `juego.tsx` + `<tipo>.module.css`, reutilizando `juegos/comun/` (`useRondas`, `Armi`, `Guirnalda`, `Controles`, `escena.module.css`, `teclado`, `fraccion` si aplica). Ayúdate de `/impeccable` para decisiones visuales (regla del proyecto: toda UI pasa por impeccable). **El juego se juega en pantalla completa**: el reproductor ya pone la barra con «Salir del juego»; el juego debe aprovechar el ancho y el alto (sin anchos fijos estrechos). Los personajes escalan con variables (`--robot: clamp(120px, min(24cqw, 40dvh), 460px)`, ver «Personajes que escalan») y el mundo va dentro de una capa `.camara`. Reglas en las secciones «Personajes que escalan» y «Pantalla completa, imágenes y portada» del adaptador.

**D. Imágenes.** Con `gemini-media` (pasando como `--ref` las imágenes ya existentes del juego) o con Codex (comando en el adaptador): el fondo de la escena si el juego lo necesita, **los personajes y su pose en acción** (recortada y encajada con `tools/gemini-media/recortar-pose.py --como <pose en guardia>`) y **siempre la portada** de la actividad: `public/images/juegos/<tipo>/portada.webp`, recortada a ~3,6:1 (1200×333). Mira cada imagen antes de usarla; si el servicio falla, dilo. Si el juego lleva música, genérala con `gemini-media` (modo música) y trátala como dice la tabla del adaptador.

**E. Contenido.** JSON en `apps/web/curriculo/actividades/<asignatura>/<grado>/<slug>.json`, con datos ficticios, redacción propia, la instrucción dicha al estudiante y `"imagen"` apuntando a la portada.

**F. Juice y escenas de acción** con `game-feel` por medio del adaptador: cada evento importante en cuatro tiempos (sección «Escenas de acción»), con el cambio de pose («Poses: dos estados por personaje»), acierto completo y fallo suave, y el sonido programado en el ms del impacto. Conecta `<Chispas reaccion={reaccion} />` si el juego usa `useRondas`. Respeta el presupuesto: ≤ 12 elementos por evento, solo `transform`/`opacity`/`filter`, sin dependencias nuevas, `prefers-reduced-motion` en todo efecto. Parte del código de `juegos/robots/` en vez de reinventarlo.

## Fase 4 — Revisar

1. **`design-game`** (vía adaptador): auditoría con tabla de puntajes sobre el juego nuevo. Muestra la tabla; aplica solo mejoras que quepan en el presupuesto y no toquen la calificación.
2. **`/a11y-audit`** si las dependencias están instaladas; si no, revisión manual de: contraste ≥ 4.5:1, teclado, foco visible, `alt`, nada de información solo en color o animación, texto pedagógico en HTML.
3. **Verificación** desde la raíz: `npm run build`, `npm run lint`, `npm test` (necesita `docker compose -f docker-compose.dev.yml up -d`). Reporta los resultados tal como salgan; si algo falla, dilo.
4. **Verlo funcionando** con `/run` si es posible: a 1920×1080, 1440×900 y 390×844, personajes de ~⅓ del alto en 1920, juego en pantalla completa sin desplazamiento horizontal, «Salir del juego» vuelve a la materia, y la tarjeta muestra la portada sin recortar lo importante. **Graba video** de un acierto y un fallo y revisa la hoja de cuadros (sección «Verificar el movimiento» del adaptador): deben verse los cuatro tiempos y el cambio de pose. Pide al usuario que confirme el sonido. Si no se pudo ver, dilo.

## Cierre

Entrega: qué se creó (archivos), qué se reutilizó, qué imágenes se generaron, resultado de cada verificación, lo que quedó 🔶 y lo que no se pudo comprobar. **No hagas commit ni push** salvo que se pida.
