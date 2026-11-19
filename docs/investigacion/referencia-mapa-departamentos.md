# Referencia funcional: juego de «hacer clic en el departamento» sobre un mapa

> Estudio de **mecánica** para diseñar un juego propio de MIDUHO. No se copió código, mapa, banderas, imágenes, sonidos, nombre ni textos; el material capturado durante el análisis se borró al terminar. Regla dura 2 de `AGENTS.md`.

- **Fecha:** 2026-11-07
- **Herramienta:** REA 6.8.0 (`rea-agents`, CLI, sin `setup`) por CDP sobre un Chrome aislado (puerto 9333); Playwright solo para jugar y medir.
- **Página observada:** Seterra, «Colombia: Departamentos» (`geoguessr.com/es/vgp/3274`).

## Autoría real (observado)

El juego es de **Seterra**, un sitio de cuestionarios geográficos que hoy pertenece a **GeoGuessr** y se sirve desde su dominio (aplicación Next.js propia, con publicidad y cuenta de usuario opcional). No es un juego incrustado de un tercero distinto. El mapa, las banderas de cada departamento, el texto de curiosidades, las fuentes y los sonidos son suyos o de quienes les dieron licencia; **ninguno se reutiliza**. Para usar cualquiera de esos recursos haría falta permiso escrito de GeoGuessr (si alguien lo tiene, que entregue los originales con una licencia, y se tratan como material licenciado).

## Cómo está construido (observado con REA)

| Aspecto | Qué hay |
|---|---|
| Render | **SVG en el DOM** (`viewBox 0 0 900 700`): un `<path>` por departamento con identificador tipo `CO-ANT`, más un punto para la isla. No es canvas |
| Framework | Next.js (React) con el estado del juego en un reductor (acciones: adivinar con clic, adivinar escribiendo, saltar, rendirse, reiniciar) |
| Modos | **Pin** (clic en el mapa), Pin difícil, Pin sin fronteras, Pin difícil sin fronteras, **Type** (escribir el nombre), Type fácil, y otros («Más») |
| Pista visual | Cada pregunta muestra una imagen del departamento (su bandera) junto al nombre pedido |
| Sonido | Dos efectos cortos, «correcto» e «incorrecto» (en el modo de escribir fácil no suena el de error) |
| Accesibilidad | El mapa es SVG sin nombre accesible por departamento ni teclado propio; hay una región de alerta, pero el juego depende del clic. Debajo hay una lista de texto con los 33 nombres |

## Mecánica (observada y medida)

1. **Inicio:** botón «Comenzar cuestionario». Marcador a la izquierda (`aciertos / 33` y un porcentaje), la consigna al centro («Haz clic en <nombre>») con su imagen, un botón de **saltar**, el reloj a la derecha (00:00 contando hacia arriba) y una **X** para salir.
2. **Orden:** las 33 preguntas salen en **orden aleatorio distinto cada vez** (no hay semilla); el juego precalcula cuál es la siguiente.
3. **Clic en un departamento equivocado:** aparece un rótulo sobre el departamento tocado con su nombre (~1,5–2 s, se desvanece). No hay penalización visible: la pregunta sigue abierta y se puede intentar otra vez sin límite. El departamento tocado **sí se puede volver a tocar**.
4. **Pista tras varios fallos:** cuando los intentos de esa pregunta pasan de 2 (es decir, **desde el tercer fallo**) aparece un **círculo que se expande** alrededor del departamento correcto durante ~2 s y el departamento se marca; el estudiante puede seguir intentando.
5. **Clic en el correcto:** el departamento se rellena y muestra su nombre, con un círculo que se expande, y **la siguiente pregunta aparece de inmediato** (la medida entre acierto y nueva consigna fue < 100 ms: sin pausa).
6. **Color final según intentos:** los aciertos a la primera quedan en un tono claro; los que costaron más intentos quedan en **amarillo** (observado con 3 intentos) y en **rojo** (observado con 7). El tono de los intentos intermedios no se observó. 🔶
7. **Marcador:** el porcentaje equivale a **aciertos ÷ clics totales** (observado: 9 aciertos tras 6 fallos iniciales y ningún otro fallo = 60 %). Los fallos no restan «vidas».
8. **Fin:** al responder las 33 se acaba (`FINISHED_GAME`); «rendirse» suma un intento a las pendientes y termina. Existe una repetición solo con las que no se acertaron a la primera. La pantalla de resultados no se observó completa. 🔶
9. **Teclado:** el botón de saltar anuncia el atajo Alt+S. El resto no es operable con teclado.

### Lo que no hay (inferido)

- **No hay rondas fijas ni nota calificada**; el objetivo es acertar todo, sin límite de intentos.
- **No hay distractores**: en el modo clic, las «opciones» son los 33 departamentos y el error depende de dónde toque el estudiante. La parte pedagógica potente es qué *rótulo* ve al fallar (aprende cuál tocó).
- Las 33 unidades pedidas incluyen a San Andrés y Providencia, que está dibujada como un punto fuera del continente (en el mapa, esquina superior izquierda).

## Qué le falta para evaluar (y que MIDUHO debe añadir)

| Original | Para MIDUHO 🔶 propuesto |
|---|---|
| 33 preguntas, orden aleatorio sin semilla | N rondas fijas (la docente elige), **orden determinista por semilla**, para que el servidor recalifique lo mismo que vio el estudiante |
| Intentos ilimitados; % de precisión | Calificación 2/1/0: acierto a la primera, acierto al segundo intento, y tras el segundo fallo se revela y se avanza |
| Pista visual a partir del 3.er fallo | Pista **según el error** (vecino, región natural, mismo lado del mapa) desde el primer fallo, y revelado al segundo |
| Sin registro por ítem | Cada ronda es un ítem con `itemId` y respuesta guardada; se califica en el servidor |
| Mapa SVG sin nombres accesibles, solo ratón | Cada departamento es un `<button>`/`role="button"` con `aria-label`; teclado (Tab y flechas por vecindad), `role="status"` para el resultado, y **lista de apoyo** con los nombres |
| Reloj ascendente siempre visible | **Sin reloj** (la mecánica no lo exige) |
| Pista visual con la bandera del departamento | Sin banderas (recurso ajeno); la consigna es texto en HTML |
| Modos con y sin fronteras | Opciones de la docente: con fronteras (base), sin fronteras (difícil) 🔶 |

## Lo que se conserva tal cual (mecánica, no expresión)

Consigna con el nombre → clic en el departamento correcto del mapa; 33 unidades; fallo muestra el nombre del departamento tocado; tras varios fallos se señala el correcto; el color final del departamento refleja cuánto costó; San Andrés y Providencia como punto aparte; modos con y sin fronteras.

## Lo que se hace propio

Mapa (geometría de una fuente abierta con licencia registrada, simplificada por MIDUHO), personajes y escena, nombre, textos y pistas, sonidos (CC0 con licencia registrada), música (Gemini), código (React 19 + CSS Modules, SVG propio en el DOM, sin texto en imágenes).
