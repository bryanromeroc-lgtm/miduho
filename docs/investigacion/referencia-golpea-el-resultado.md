# Referencia funcional: juego de «golpear el resultado» (sumas y restas hasta 100)

> Estudio de **mecánica** para diseñar un juego propio de MIDUHO. No se copió código, arte, sonido, nombre ni personajes; el material capturado durante el análisis se borró al terminar. Regla dura 2 de `AGENTS.md`.

- **Fecha:** 2026-11-04
- **Herramienta:** REA 6.8.0 (`rea-agents`, CLI, sin `setup`) por CDP sobre un Chrome aislado; Playwright solo para jugar rondas y medir tiempos.
- **Página observada:** cokitos.com («Golpear al zombie: sumas y restas hasta 100»).

## Hallazgo de autoría (observado)

Cokitos **no aloja el juego**: lo incrusta en un `iframe` desde **digipuzzle.net** (`minigames/whackamole/…`). El juego es de Digipuzzle, un sitio de terceros con publicidad y licencia propia. Cualquier permiso para usar sus recursos tendría que venir de Digipuzzle, no de Cokitos.

## Cómo está construido (observado con REA)

| Aspecto | Qué hay |
|---|---|
| Render | **Canvas 2D**, cinco lienzos apilados (fondo, juego, superior, superposición, ayuda), resolución lógica 862×606 escalada por CSS |
| Motor | Sin motor de juegos: un *framework* propio del sitio (~240 KB) + jQuery 1.8.2 + Howler.js para audio |
| Juego | Un solo script (~37 KB) que registra *callbacks* en el framework (iniciar, dibujar, clic, opciones) |
| Variantes | El mismo script sirve varios **temas** (topos, marmotas, zombis, trolls) y **tipos** (sumas hasta 10/20/100, tablas, alfabeto, palabras, preguntas); la página fija tema y tipo con dos variables |
| Recursos por tema | 11 imágenes (fondo, hueco atrás/adelante, personaje normal/contento/golpeado, estrellas, martillo, tablero, dos barras de marcador) |
| Sonido | Un solo MP3 con 4 cortes: aparecer (1,5 s), acierto (1,5 s), error (1,5 s), fin (5 s) |
| Animación | Un `setInterval` de 20 ms que mueve personajes y redibuja |
| Accesibilidad | Ninguna: todo el texto (operación, números, marcador) está pintado en el canvas; sin teclado, sin lector de pantalla |

## Mecánica (observada y medida)

1. **Pregunta:** una operación en el tablero superior (p. ej. «51 − 5»).
2. **Diez huecos** en tres filas (3-4-3). En cada ronda salen **7 u 8** personajes al azar, cada uno con un número en un cartel; uno es la respuesta.
3. **Subida:** todos suben a la vez, 120 px en ~0,8 s. **No se esconden ni hay reloj**: se quedan arriba hasta que se acierte.
4. **Clic en un incorrecto:** cae un martillo con estrellas (~0,8 s), el personaje cambia a cara golpeada y su número se pone rojo; ya no se puede volver a tocar. Suma 1 al contador de errores. La ronda **sigue**: el estudiante vuelve a intentar.
5. **Clic en el correcto:** cara contenta, número verde, sonido de acierto, +1 punto. Pausa de 0,8 s, todos bajan (~0,5 s) y sale la siguiente operación (~2,1 s por transición).
6. **Fin:** no hay número de rondas; el juego acaba a los **10 errores** acumulados («Fin del juego») y se reinicia con el botón de avanzar.
7. **Opciones (engranaje):** rango (hasta 10 / 20 / 100), operaciones (+, −, ambas), «permitir llevadas» (solo en algunos idiomas).

### Cómo genera las operaciones (inferido de la lógica)

- Hasta 100: resultados entre 10 y 100; minuendo/sumandos al azar, se descarta lo que se salga del rango.
- Con llevadas activadas, ~60 % de las operaciones **obligan** a llevar (suma de unidades > 10) o a desagrupar (resta de unidades negativa).
- No repite el mismo **resultado** en las últimas 6 rondas.
- **Distractores = errores típicos:** respuesta ±1, ±2, ±10, ±20, más dos números al azar del rango; sin duplicados. Ejemplo medido: 80 − 4 → 76 con 74, 75, 77, 78, 66, 96.

Ese diseño de distractores es lo pedagógicamente valioso: el ±1/±2 atrapa el conteo descuidado y el ±10/±20 la llevada o el préstamo olvidados.

## Qué le falta para evaluar (y que MIDUHO debe añadir)

| Original | Para MIDUHO 🔶 propuesto |
|---|---|
| Sin fin por rondas; termina por errores | N rondas fijas (la docente elige), nota en estrellas |
| Sin registro por ítem | Cada ronda es un ítem con `itemId`, respuesta guardada y calificación en servidor |
| Operación al azar en cada carga | Operaciones **deterministas** a partir de la configuración + semilla, para que el servidor recalifique lo mismo que vio el estudiante |
| Errores ilimitados por ronda | 2 puntos al primer golpe, 1 al segundo; tras el segundo fallo se muestra la solución y se pasa (el error enseña, no castiga) |
| Solo ratón, texto en canvas | Números y operación en HTML; cada personaje es un `<button>`; teclado (Tab/Enter y teclas 1–0 por hueco); `role="status"` para el resultado |
| Martillo sobre el incorrecto | Escena de acción en 4 tiempos en el **acierto**; fallo en versión suave (sin temblor) |
| Sin modo calmado | «Sin límite de tiempo» es el comportamiento base; si se añade reloj, es opcional y pausable |

## Lo que se conserva tal cual (mecánica, no expresión)

Cuadrícula 3-4-3, 7–8 opciones, subida conjunta, el personaje queda fuera tras el error, distractores por error típico, no repetir resultados recientes, rangos 10/20/100, +/−, llevadas.

## Lo que se hace propio

Tema, personajes, escenario, nombre, textos, sonidos (CC0 con licencia registrada), música (Gemini), código (React 19 + CSS Modules, sin canvas para texto).
