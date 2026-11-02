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

Antes de empezar, lee `.claude/skills/juegos-2d-miduho/SKILL.md` (adaptador: pila real, piezas ya hechas, presupuesto de peso). Las skills `game-feel` y `design-game` se leen **a través de ese adaptador**; si algo choca, gana el adaptador.

## Fase 1 — Analizar (solo lectura, no se crea nada)

1. **Pedido:** extrae asignatura, grado, tema y objetivo de aprendizaje. Si falta algo imprescindible (grado o tema), pregunta una sola vez; lo demás se decide con criterio y se declara.
2. **Qué ya existe:** revisa `apps/web/src/features/actividades/tipos/registro.ts` y `juegos/` para ver los 21 tipos. **Prefiere reutilizar un tipo existente con contenido nuevo** (solo un JSON). Solo se crea un tipo nuevo si ninguno sirve; justifica por qué.
3. **Actividades vecinas:** mira `apps/web/curriculo/actividades/<asignatura>/<grado>/` para no repetir tema y copiar el formato de redacción, de ítems y de explicaciones.
4. **Pedagogía** (skills `progressive-hint-ladder`, `formative-assessment-loop-designer`, `productive-failure-protocol` según convenga): define el error común del tema, la pista que enseña y qué mide cada ronda. Solo para este paso; no generes planes de clase.
5. **Entrega un resumen corto y espera visto bueno** si el cambio crea un tipo nuevo. Si solo es contenido en un tipo existente, continúa y declara la decisión.

El resumen incluye: decisión (reutilizar o tipo nuevo), mecánica en una frase, rondas, cómo se califica, qué enseña el error y qué queda 🔶.

## Fase 2 — Especificar

- **Tipo nuevo o cambio de arquitectura:** usa el flujo OpenSpec (`/opsx:propose`) antes de implementar.
- **Solo contenido nuevo:** no hace falta OpenSpec.

## Fase 3 — Construir

**A. Lógica primero (ni juice ni CSS todavía).** Si hay tipo nuevo, crea `apps/web/src/features/actividades/juegos/<tipo>/` con `tipo.ts` (esquema Zod + `definirTipo`, como `sello/tipo.ts`) y `tipo.test.ts` junto a él. Esa lógica de calificación **no la toca el pulido**.

**B. Registro** (solo si hay tipo nuevo). Los cuatro lugares:
1. `tipos/registro.ts` → importar y añadir a `DEFINICIONES`.
2. `reproductor/reproductor.tsx` → `dynamic(...)` del juego y entrada en el mapa de juegos.
3. `reproductor/reglas.ts` → añadir el tipo a la lista.
4. `materias/vista/ilustracion-tipo.tsx` → ilustración de la tarjeta.

**C. Interfaz.** `juego.tsx` + `<tipo>.module.css`, reutilizando `juegos/comun/` (`useRondas`, `Armi`, `Guirnalda`, `Controles`, `escena.module.css`, `teclado`, `fraccion` si aplica). Ayúdate de `/impeccable` para decisiones visuales (regla del proyecto: toda UI pasa por impeccable).

**D. Contenido.** JSON en `apps/web/curriculo/actividades/<asignatura>/<grado>/<slug>.json`, con datos ficticios, redacción propia y la instrucción dicha al estudiante.

**E. Juice** con `game-feel` por medio del adaptador: empieza con 2–3 canales (sonido + movimiento + color); conecta `<Chispas reaccion={reaccion} />` si el juego usa `useRondas`. Respeta el presupuesto: ≤ 12 elementos, solo `transform`/`opacity`, sin dependencias nuevas, `prefers-reduced-motion` en todo efecto.

## Fase 4 — Revisar

1. **`design-game`** (vía adaptador): auditoría con tabla de puntajes sobre el juego nuevo. Muestra la tabla; aplica solo mejoras que quepan en el presupuesto y no toquen la calificación.
2. **`/a11y-audit`** si las dependencias están instaladas; si no, revisión manual de: contraste ≥ 4.5:1, teclado, foco visible, `alt`, nada de información solo en color o animación, texto pedagógico en HTML.
3. **Verificación** desde la raíz: `npm run build`, `npm run lint`, `npm test` (necesita `docker compose -f docker-compose.dev.yml up -d`). Reporta los resultados tal como salgan; si algo falla, dilo.
4. **Verlo funcionando** con `/run` si es posible; si no se pudo ver, dilo.

## Cierre

Entrega: qué se creó (archivos), qué se reutilizó, resultado de cada verificación, lo que quedó 🔶 y lo que no se pudo comprobar. **No hagas commit ni push** salvo que se pida.
