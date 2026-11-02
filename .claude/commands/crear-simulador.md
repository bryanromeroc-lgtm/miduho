---
name: "Crear simulador"
description: Estudia un simulador visual o manipulativo de referencia (PhET, Toy Theater…) y crea en MIDUHO uno propio con laboratorio libre y retos calificados
category: Workflow
tags: [juegos, actividades, simuladores, skills]
argument-hint: "<tema y grado, y opcionalmente enlaces de referencia, p. ej. fracciones equivalentes 4.° https://toytheater.com/equivalent-fraction-bars/>"
---

Crea un simulador educativo (laboratorio + retos) para MIDUHO a partir de este pedido:

> $ARGUMENTS

Antes de empezar lee, en este orden:
1. `.claude/skills/simuladores-miduho/SKILL.md`: qué diseñar (principios, anatomía, retos, calificación, error que enseña).
2. `.claude/skills/juegos-2d-miduho/SKILL.md`: cómo construirlo en la pila del proyecto (pantalla completa, juice, imágenes con ChatGPT, portada, presupuesto).
3. El modelo hecho: `apps/web/src/features/actividades/juegos/fracciones/` (`tipo.ts`, `figura.tsx`, `juego.tsx`).

Las reglas duras de `AGENTS.md` mandan sobre todo: sin datos personales de menores, **sin copiar contenido protegido** (del referente solo el objetivo y la mecánica genérica), WCAG 2.1 AA, 🔶 en lo no confirmado y español de Colombia. No hagas commit ni push salvo que se pida.

## Fase 0 — Estudiar el referente (solo lectura)

Si el pedido trae enlaces, estúdialos; si no, busca 1 o 2 referentes públicos del tema.
- **PhET:** la página de la simulación no trae texto (se arma con JavaScript). Lee la guía para docentes: descarga `https://phet.colorado.edu/files/teachers-guide/<sim>-html-guide_en.pdf` al scratchpad y extráela con `pdftotext -layout`.
- **Toy Theater y similares:** WebFetch de la página.
- Anota: qué enseña, qué manipula el estudiante, qué representaciones enlaza, qué rangos tiene, si hay retos y cómo los califica. Marca 🔶 lo que no pudiste ver por dentro.
- Revisa la tabla «Lo que se estudió» de la skill: si el referente ya está, no lo repitas.

## Fase 1 — Analizar y diseñar (no se crea código)

1. **Pedido:** asignatura, grado, tema y 1–3 metas. Si falta el grado o el tema, pregunta una sola vez.
2. **¿Ya existe?** Revisa `tipos/registro.ts`, `juegos/` y `curriculo/actividades/<asignatura>/<grado>/`. Prefiere **extender un tipo con un reto nuevo** o **reutilizarlo con otro JSON** antes que crear uno.
3. **Ficha del simulador**, con los apartados 2 a 5 de la skill:
   - metas y error típico del tema (apóyate en `progressive-hint-ladder` y `productive-failure-protocol`);
   - representaciones enlazadas y su lectura (número, palabras, dibujo);
   - controles del laboratorio, rangos, estado inicial y casos que iluminan;
   - retos elegidos del catálogo, cómo se califica cada uno y qué respuesta se acepta;
   - diagnósticos con su pista y la solución del segundo fallo;
   - la alternativa con teclado y botones de cada gesto.
4. **Entrega la ficha y espera visto bueno** si crea un tipo nuevo o cambia uno existente. Si es solo contenido nuevo, declara la decisión y sigue.

## Fase 2 — Especificar

Tipo nuevo o cambio de arquitectura: `/opsx:propose`, salvo que el usuario pida saltarlo. Solo contenido: no hace falta.

## Fase 3 — Construir

**A. Lógica y pruebas primero** (`tipo.ts` + `tipo.test.ts`): esquema Zod con `refine` (una sola opción correcta, sin repetidas, dentro de rangos), `items`, `calificar`, `repaso`, `diagnosticar` y textos puros (`enPalabras`, `describirFigura`). Una prueba por regla de aceptación y por diagnóstico. El pulido no toca esto.

**B. Registro** en los cuatro lugares de `/crear-juego` (registro, reproductor, `reglas.ts` en `PRIMERA_RESPUESTA` e ilustración de respaldo).

**C. La figura** (`figura.tsx`): SVG propio y puro, `role="img"` con `aria-label`, `onCambiar` opcional, partes tocables sin foco.

**D. El juego** (`juego.tsx` + CSS), con `/impeccable` para lo visual: selector Laboratorio / Retos con `aria-pressed` y ambas partes montadas; laboratorio con lectura en vivo, contadores accesibles y rejilla que aprovecha la pantalla completa; retos con `Armi`, `Guirnalda`, `Aviso`, `Chispas`, foco en el enunciado y pista → segundo intento → solución.

**E. Imágenes y contenido:** fondo de la escena (si lo necesita) y **portada** con ChatGPT según el adaptador. JSON en `apps/web/curriculo/actividades/<asignatura>/<grado>/<slug>.json` con `"imagen"`, la instrucción al estudiante y de 4 a 10 rondas que vayan de lo fácil a lo difícil.

**F. Juice** según el adaptador (2–3 canales, presupuesto, `prefers-reduced-motion`).

## Fase 4 — Revisar

1. **Lista de chequeo** de la skill, punto por punto; di cuáles no se cumplen.
2. `design-game` (vía adaptador) y revisión de accesibilidad (`/a11y-audit` o manual: contraste, teclado, foco, nada solo en color, texto en HTML, objetivos de 44 px).
3. Desde la raíz: `npm run build`, `npm run lint`, `npm test`. Reporta lo que salga.
4. Verlo funcionando (memoria `verificar-juego-en-navegador`) a 1440×900 y 390×844: laboratorio, una ronda de cada reto con acierto y con fallo, «Salir del juego» y la portada en la tarjeta. Si no se pudo ver, dilo.

## Cierre

Entrega: referente estudiado y qué se tomó de él, archivos creados, imágenes generadas, resultado de cada verificación, lo 🔶 (errores típicos y metas por confirmar con la docente) y lo que no se pudo comprobar. Si el referente es nuevo, agrégalo a la tabla «Lo que se estudió» de la skill. Sugiere 2 o 3 preguntas para que la docente converse con el grupo después del laboratorio (solo en el mensaje, no en el juego).
