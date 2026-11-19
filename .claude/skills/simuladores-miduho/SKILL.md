---
name: simuladores-miduho
description: Cómo diseñar simuladores visuales y manipulativos en MIDUHO (laboratorio libre + retos calificados), al estilo de PhET o Toy Theater pero con mecánica, escena y redacción propias. Úsala al crear o revisar un juego donde el estudiante manipula una representación (cortar, pintar, arrastrar, mover un punto, apilar tiras, armar con piezas) y luego resuelve retos que dan estrellas. Se activa con "simulador", "manipulativo", "laboratorio", "como PhET", "tiras de fracciones", "barras equivalentes", "construir una fracción", "parejas de fracciones".
---

# Simuladores visuales y manipulativos en MIDUHO

Un simulador es un juego con **dos partes**: un **laboratorio** donde el estudiante manipula libremente una representación y ve las consecuencias al instante (no da nota), y unos **retos** por rondas que usan esa misma representación y sí dan estrellas. El modelo construido es `taller-fracciones` (`apps/web/src/features/actividades/juegos/fracciones/`): léelo antes de diseñar otro.

Esta skill dice **qué diseñar y por qué**. Cómo construirlo en la pila del proyecto (pantalla completa, juice, imágenes con ChatGPT, portada, presupuesto) está en `juegos-2d-miduho`, que se aplica también aquí. El flujo paso a paso es `/crear-simulador`.

## 1. Lo que se estudió (referentes, 2026-11-02)

Fuentes: las guías para docentes de PhET (McGarry, agosto de 2023, PDF en `phet.colorado.edu/files/teachers-guide/<sim>-html-guide_en.pdf`), las páginas de Toy Theater y el artículo de Podolefsky, Moore y Perkins sobre *implicit scaffolding* (arXiv 1306.6544). Las páginas de las simulaciones de PhET se arman con JavaScript y no traen texto: lo que sigue sale de las guías. 🔶 No se jugó cada simulación por dentro; los detalles finos de sus niveles pueden haber cambiado.

| Referente | Qué enseña | Qué manipula el estudiante | Reto y calificación | En MIDUHO |
|---|---|---|---|---|
| PhET · Fracciones: Intro | Qué significan el número de arriba y el de abajo; la misma fracción en varias formas; fracciones mayores que 1 | Sube y baja numerador y denominador; arrastra piezas; cambia el número de recipientes; ve círculo, barra, recta y otras formas | Pantalla de juego compartida con *Construye una fracción*; niveles a elección | **Hecho:** `taller-fracciones` (laboratorio de 3 formas + retos construir/leer/comparar) |
| PhET · Construye una fracción | Armar una fracción con piezas de distinto tamaño; equivalencias; números mixtos | Saca piezas (1/2, 1/3, 1/4…) y las pone en recipientes que se pueden partir; o arma la fracción con números | 10 niveles; metas que se dan en dibujo o en número; se guardan en cajas de colección; hay varias respuestas válidas | **Falta:** «armar con piezas»: la meta es un valor y la respuesta es una combinación de piezas cuya suma vale eso |
| PhET · Parejas de fracciones | Reconocer fracciones equivalentes en números y en dibujos; fracción impropia y número mixto | Arrastra tarjetas (número o dibujo) a dos platillos de una balanza y comprueba si valen lo mismo | 8 niveles por pantalla (niveles 1–2 menores que 1, 3–6 menores que 2, 7–8 entre 1 y 2); estrellas por nivel; cronómetro apagado por defecto | **Parcial:** el reto «comparar» del taller. Faltaría un tipo «emparejar equivalentes» con varias parejas por ronda |
| Toy Theater · Tiras de fracciones | Equivalencias, comparar denominadores, sumar y restar con tiras | Arrastra tiras (1, 1/2 … 1/12) sobre una tabla de una o dos unidades; lápiz para marcar | Ninguno: exploración libre | **Falta:** laboratorio de tiras apiladas («¿cuántos sextos caben en un tercio?») |
| Toy Theater · Barras equivalentes | Ver que dos fracciones distintas pueden cubrir lo mismo | Dos barras, una sobre otra; cambia numerador y denominador (hasta 24) con manijas o tocando el número | Ninguno; las dos barras se ponen verdes cuando valen lo mismo | **Parcial:** `bocadillo` compara barras recortadas. La señal de «coinciden» se adopta como patrón (con texto, no solo color) |

**Patrones que comparten todos** (y que MIDUHO adopta):
1. La representación **responde al instante** a cada cambio: se ve la causa y el efecto.
2. **Varias representaciones enlazadas** de la misma cantidad (número, palabras, dibujo, recta), cambiando a la vez.
3. **Poco texto**: etiquetas cortas junto al objeto, sin instrucciones largas. Según las guías, los estudiantes las usan bien sin indicaciones.
4. **Laboratorio primero, retos después**, y la docente asigna niveles según su meta.
5. El reto se resuelve **con la misma herramienta** del laboratorio, no con otra pantalla distinta.

**Lo que MIDUHO no adopta:** el cronómetro, las estrellas por nivel con «mejor puntaje», los niveles a elección libre (aquí la docente asigna una actividad y las rondas ya van de lo fácil a lo difícil) y el arrastre como única forma de interactuar.

## 2. Principios de diseño (andamiaje implícito)

El artículo de PhET llama *andamiaje implícito* a guiar sin que el estudiante se sienta guiado: lo hacen el diseño de la herramienta, sus límites, sus señales y su respuesta, no un texto que dice qué hacer. En MIDUHO se traduce así:

| Principio | Qué es | Cómo se hizo en `taller-fracciones` |
|---|---|---|
| **Alcance corto** | 1 a 3 metas de aprendizaje concretas, no un tema entero | «Arriba se cuenta lo que se toma; abajo, en cuántas partes iguales se corta la unidad», en tres formas |
| **Secuencia** | Cada parte agrega complejidad o afloja un límite | Laboratorio → retos; las rondas pasan de fracción propia a fracción mayor que 1 y luego a equivalencias |
| **Estado inicial** | Se abre con algo interesante y fácil de leer, no vacío | Se abre en 3/4 ya pintado, no en 0/1 |
| **Primera interacción obvia** | La primera acción se nota por color, tamaño y posición, no por un texto | Las partes se pueden tocar y los botones − / + son grandes y están junto a la figura |
| **Representaciones enlazadas** | Se relacionan por cercanía, por color y porque cambian al mismo tiempo | Número grande + palabras («tres cuartos») + «es menos de 1 entero» + 3 figuras |
| **Retroalimentación inmediata** | Toda acción tiene respuesta visible (y sonido corto): si no la hay, el niño cree que no pasó nada | Pintar suena a «toque» y la lectura cambia en vivo (`aria-live`) |
| **Restricciones productivas** | Los rangos acotan lo explorable a lo que enseña | Hasta 8 partes y 3 unidades; siempre aparece una unidad vacía de más para seguir pintando |
| **Casos que iluminan** | Los extremos que el niño va a probar enseñan algo | 4/4 = 1 entero; 0 pintadas; 5/4 obliga a pasar a la segunda unidad |
| **Bajo riesgo** | Todo se deshace fácil; no hay forma de «romperlo» | Tocar una parte pintada despinta desde ahí; − y + se devuelven |
| **Retos intrínsecos** | El reto se resuelve usando la herramienta, no adivinando | Construir pide manipular la figura; leer y comparar piden mirarla |

## 3. Anatomía de un simulador en MIDUHO

Archivos (los mismos de cualquier tipo, ver `juegos-2d-miduho`): `tipo.ts` (esquema, calificación, diagnóstico y textos puros), `tipo.test.ts`, `figura.tsx` (la representación en SVG propio, sin estado), `juego.tsx` (laboratorio + retos) y `<tipo>.module.css`.

- **`figura.tsx` es pura**: recibe el estado (`n`, `d`, `unidades`…) y un `onCambiar` opcional. Sin `onCambiar` solo se muestra (para leer, comparar o en las opciones). La misma figura sirve para el laboratorio y para los retos, y eso hace que el reto se resuelva con la misma herramienta.
- **Laboratorio** (`<section>` con su `h2`): lectura grande arriba (número + palabras + comparación con la unidad), controles accesibles (contadores − / + con `<output aria-live>`), las representaciones en una rejilla de 2 columnas que se hace de una bajo 720 px, y el botón «Empezar los retos». **No llama a `alTerminar` ni guarda nada.**
- **Selector Laboratorio / Retos** con `aria-pressed`. **Las dos partes quedan montadas** (`hidden`): volver al laboratorio a probar no borra el reto en curso.
- **Retos**: una ronda a la vez, con un enunciado que recibe el foco al cambiar de ronda (`useFocoAlCambiar`), Armi con su pose (`senala` / `celebra` / `piensa`), `Guirnalda` de progreso, `Aviso` con la retroalimentación, `Chispas` al acertar y `Avanzar`. Si la respuesta es un valor simple, usa `useRondas`. Si es compuesta (`{n, d}`, una opción, una lista de piezas), replica su flujo a mano, como hace `taller-fracciones`.
- **Texto pedagógico puro en `tipo.ts`**: `enPalabras`, `describirFigura` (lo que oye el lector de pantalla) y `nombreForma`. Se prueban con Vitest.

## 4. Retos y calificación (la nota)

Cómo llega a estrellas: `items()` declara un ítem por ronda con su `puntajeMaximo`. `calificarIntento` (`tipos/contrato.ts`) valida cada respuesta con `esquemaRespuesta`; la que falta o no cumple el esquema vale 0. Luego suma y saca el porcentaje, y `estrellasDe` lo convierte: 90 % o más da 3 estrellas, 60 % o más da 2 y lo demás da 1 (nunca 0 a un intento enviado). 🔶 Umbrales provisionales hasta que el colegio entregue su SIEE. Hoy el reproductor no guarda el resultado: es práctica. La misma calificación correrá en el servidor cuando existan los intentos.

Reglas fijas:
- **El laboratorio no califica.** Solo los retos.
- **Cuenta la primera respuesta** de cada ronda. Registra el tipo en `reproductor/reglas.ts` (`PRIMERA_RESPUESTA`) para que el aviso de reglas lo diga.
- **1 punto por ronda**, salvo que la ronda tenga partes que se juzgan aparte (como `bocadillo`, que da 3: denominador común y dos numeradores).
- **Qué se acepta se decide por reto y se escribe en el comentario de `tipo.ts`.** Un reto de construir con las partes fijadas exige la fracción exacta (3/4, no 6/8). Leer o escribir aceptan una equivalente (2/4 por 1/2). Armar con piezas acepta **cualquier** combinación que valga la meta: varias respuestas válidas, como en *Construye una fracción*.
- **El contenido se valida al cargar** con `refine` de Zod: exactamente una opción correcta, opciones sin repetir, valores dentro de los rangos del laboratorio, y entre 4 y 10 rondas.
- `repaso()` dice qué se pedía y cuál era la solución en palabras del niño, para la tabla del resultado.

**Catálogo de retos** (elige 2 o 3 por simulador; se mezclan en una misma lista de rondas):

| Reto | El estudiante… | Respuesta | Mide |
|---|---|---|---|
| Construir | arma la cantidad pedida en la figura | estado de la figura | representar desde el símbolo |
| Leer | escribe lo que muestra la figura | número escrito (teclado de casillas) | interpretar la representación |
| Comparar / emparejar | elige entre figuras la que vale lo mismo | índice de opción | equivalencia entre formas |
| Ubicar | pone el punto en la recta | posición | recta numérica, orden |
| Ordenar | ordena de menor a mayor | lista | comparación de magnitudes |
| Armar con piezas | combina piezas hasta valer la meta | lista de piezas | equivalencia y suma |
| Completar | escribe el número que falta (3/4 = □/8) | número | equivalencia simbólica |

## 5. El error que enseña

Patrón de todos los juegos (`useRondas`): **si falla, una pista que nombra el error sin dar la respuesta y otro intento; si vuelve a fallar, la solución con su explicación.** En un simulador la pista tiene que **mandar a mirar la representación**, no repetir la regla.

- `diagnosticar(ronda, respuesta)` en `tipo.ts` reconoce los errores típicos en orden; gana el primero que encaje. Cada diagnóstico tiene su prueba.
- Errores típicos de fracciones, ya implementados o pendientes. 🔶 Lista propuesta; confirmar con la docente:
  - escribe abajo las partes sin pintar en vez de todas (3/1 por 3/4);
  - pone numerador y denominador al revés (4/3 por 3/4);
  - en la recta cuenta rayitas en vez de saltos (3/5 por 3/4);
  - cree que la del mismo numerador vale lo mismo;
  - cree que un denominador más grande es una fracción más grande (1/8 > 1/4);
  - acepta partes que no son iguales como cuartos;
  - suma numeradores y denominadores (1/2 + 1/3 = 2/5).
- Pista y solución dicen el número **y** lo nombran en palabras («3/4, tres cuartos»). Si se acepta una equivalente, se dice: «También se escribe 6/8».
- Antes de un tema nuevo, usa `progressive-hint-ladder` y `productive-failure-protocol` para hallar los errores y redactar las pistas (no copies sus textos).

## 6. Accesibilidad propia de los manipulativos

Además de las reglas de `juegos-2d-miduho`:
- **Ninguna acción es solo arrastre o solo un toque en el SVG.** Todo lo que se hace con el puntero tiene un control equivalente con botón y teclado (contadores − / +, teclado de casillas). Por eso las zonas tocables del SVG no reciben foco y la figura es una imagen con su `aria-label` (`describirFigura`).
- **Lo pintado se distingue de lo vacío por color (≥ 3:1 contra el papel) y por el número escrito al lado.** «Coinciden» no es solo verde: también lo dice un texto («Valen lo mismo»).
- Objetivos táctiles de 44 px o más, también en 390 px. La sopa de letras y las barras de fracciones ya fallaron ahí antes (vault: hallazgo UX P1).
- Las lecturas que cambian van en `aria-live="polite"`, sin anunciar cada píxel de un arrastre.

## 7. Contenido propio (regla dura 2)

- Del referente se toma **solo el objetivo de aprendizaje y la mecánica genérica**: cortar, pintar, arrastrar o emparejar son prácticas comunes de la enseñanza de fracciones. **No se copian** nombres, escenas, colores, iconos, textos, niveles ni la disposición de pantalla de PhET o de Toy Theater.
- El comentario de cabecera de `tipo.ts` nombra el referente («objetivo tomado de la simulación pública…; la mecánica, la escena y la redacción son propias de MIDUHO»). En la interfaz no se nombra.
- La escena es de MIDUHO: el taller, el mercado o la finca, con Armi y su paleta.

## 8. Más allá de las fracciones

La misma anatomía sirve para cualquier tema donde manipular una representación enseña:

| Tema (Matemáticas primaria) | Representaciones enlazadas | Laboratorio | Retos |
|---|---|---|---|
| Decimales | barra de 10/100 partes, recta, número | cambiar décimas y centésimas | construir, leer, ubicar |
| Área y perímetro | cuadrícula, número de cuadritos, borde | pintar cuadritos | figura con área y perímetro dados |
| Equivalencia de fracciones | dos tiras apiladas, números | cambiar cada fracción | completar, emparejar |
| Ecuaciones sencillas | balanza, expresión | poner y quitar pesas | encontrar el valor que equilibra |
| Plano cartesiano | cuadrícula, par ordenado | mover el punto | ubicar, leer |

Antes de crear un tipo nuevo, revisa si basta con extender uno que ya existe con un reto más (p. ej. «emparejar» o «ubicar» en `taller-fracciones`).

## Lista de chequeo del diseño

- [ ] 1–3 metas escritas y alineadas al grado (🔶 DBA a confirmar con la docente).
- [ ] Representaciones enlazadas que cambian juntas; lectura en número **y** en palabras.
- [ ] Estado inicial interesante, primera acción obvia, todo reversible.
- [ ] Rangos que acotan lo que enseña, y casos extremos que iluminan.
- [ ] Laboratorio sin nota; retos con la misma figura; ambas partes montadas.
- [ ] Qué respuesta se acepta, decidido y documentado por reto; `refine` del contenido.
- [ ] `diagnosticar` con los errores típicos, cada uno con prueba; pista → segundo intento → solución.
- [ ] Alternativa con teclado y botones a todo gesto; nada dicho solo con color.
- [ ] Pantalla completa, portada e imágenes según `juegos-2d-miduho`.
