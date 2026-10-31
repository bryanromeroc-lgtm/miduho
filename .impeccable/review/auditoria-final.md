# Auditoría final y crítica — rediseño identidad juvenil (tareas 13.1 y 13.2)

Fecha: 2026-10-31 · Evidencia: pasada automática en navegador (mismo script que la auditoría de partida), recorrido con teclado, medición de carga y recursos, y capturas en `.impeccable/review/` (`mis-materias-*.png`, `desktop.png`, `mobile.png`, `mis-materias/muestra-desempeno.png`).

## 13.1 · Auditoría técnica

| # | Dimensión | Partida | Final | Hallazgo clave |
|---|---|---|---|---|
| 1 | Accesibilidad | 3 | 4 | Foco visible con 3:1 o más en cada superficie; un solo `h1` y `main`; sin controles sin nombre |
| 2 | Rendimiento | 2 | 4 | `/` del estudiante: solo el escudo y las fuentes como recursos gráficos; `load` en 291 ms en local |
| 3 | Responsive | 3 | 4 | Una pantalla desde 900×640; sin scroll horizontal a 390 px en ninguna superficie; objetivos ≥44 px |
| 4 | Theming | 1 | 4 | Una sola fuente de tokens; sin literales en las superficies rediseñadas; contraste verificado por prueba |
| 5 | Integridad | 2 | 4 | El estudiante tiene su propio inicio; sin oso, castillo, Twemoji ni raster de escena |
| **Total** | | **11/20** | **20/20** | |

### Verificado

- **Contraste:** 43 pares texto/fondo pasan AA en `contraste.test.ts`; el blanco sobre `#00adef` y sobre `#01a451` falla, como exige la spec. La pasada automática marca las placas, pero es un falso positivo conocido (D5): el texto es blanco con 5 px de contorno de tinta, que la herramienta no ve.
- **Foco:** amarillo sobre la noche (9.5:1) y tinta sobre papel, sabana y paneles (13.7:1).
  - *Corregido en esta pasada:* el token `--color-foco` se resolvía en `:root` y dejaba un foco tinta sobre la noche y otro amarillo sobre el tablero (1.6:1).
- **Teclado:** el orden sigue la lectura: saltar al contenido, marca, menú, cuenta, cada cromo (elegir → jugar), avatares y «Entrar a…». Enter sobre un cromo lo elige, el panel lo anuncia (`aria-live`) y el avatar salta.
- **Lector de pantalla:**
  - el avatar del tablero, las escenas y el fondo son decorativos (`aria-hidden`);
  - cada cromo es un `h2` con un botón que tiene nombre (asignatura, estrellas y lo siguiente);
  - las estrellas tienen su forma textual («2 de 3 estrellas»).
- **Movimiento reducido:**
  - el salto, el flotar, el latido, el destello y el giro se apagan;
  - el avatar aparece directamente sobre el cromo;
  - los botones cambian sin desplazarse.
- **Objetivos táctiles:** botón de jugar de 54 px y menú móvil de 56 px.
  - *Corregido en esta pasada:* «Leer el libro» de la Biblioteca pasó de 40 a 44 px.
- **Carga:** solo hay una medición local; falta medir en la red del colegio (presupuesto: 2 s) 🔶.

## 13.2 · Crítica frente a la maqueta v11 y los referentes

**Fidelidad:**

| Elemento de la maqueta | En lo construido |
|---|---|
| Encabezado de juego, tablero 5×2 sobre la sabana | Igual |
| Cromo (marco con bisel, rayos, personaje que sobresale, placa, información, jugar) | Igual |
| Avatar que salta | Igual |
| Panel con «Mi explorador» y la materia elegida | Igual |

Las diferencias son deliberadas y verdaderas:
- **Estrellas, avance y «Sigue con»:** no aparecen, porque aún no hay fuente de datos. El cromo dice «Toca jugar para entrar».
- **Total de estrellas y cifras del panel:** se ocultan sin datos.
- **Rótulo «Ejemplo»:** sale de producción y vive en `/muestras/desempeno`.
- **Botón de ayuda:** se retiró, porque no hay a dónde llevarlo.
- **Cintas de Robótica y Sociales:** se aclararon para alcanzar AA.

**Anti-copia:**
- Las 10 escenas, la genérica y los 4 avatares son SVG propios (ver el README de procedencia).
- No aparecen personajes, logos ni composiciones de Lingokids, Khan Academy Kids, Duolingo ABC, Smile and Learn, Smartick ni «Phonic Zoom».
- Inglés usa un loro con globos de diálogo, sin banderas extranjeras.
- Sociales usa la bandera de Colombia, propia del contexto del colegio.

**Riesgos que quedan** 🔶:
1. Sin datos de progreso, los cromos se parecen entre sí. La escena carga la identidad, pero la promesa de «coleccionar» se cumple solo cuando llegue `fundacion-actividades`.
2. A 900–1023 px la invitación se acorta a «Toca jugar» y la cuenta se reduce a su avatar.
3. El destino del botón de jugar es provisional mientras la vista de clase siga con datos de demostración.
