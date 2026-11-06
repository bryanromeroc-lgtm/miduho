# Referencia funcional: carrera de tres carriles para elegir la palabra que se oye

> Estudio de **mecánica** para diseñar un juego propio de MIDUHO. No se copió código, arte, sonido, nombre ni personajes; el material capturado durante el análisis se borró al terminar. Regla dura 2 de `AGENTS.md`.
> Los audios que usará MIDUHO **no salen de este análisis**: los entregó el usuario aparte (ver «Audios» al final).

- **Fecha:** 2026-11-05
- **Herramienta:** REA 6.8.0 (`rea-agents`, CLI, sin `setup`) por CDP sobre un Chrome aislado (puerto 9333); Playwright en un Chrome limpio solo para jugar y medir tiempos.
- **Página observada:** arbolabc.com, sección «Lectores emergentes», juego «Rodeo de palabras».

## Hallazgo de autoría (observado / por confirmar)

La página de arbolabc.com **incrusta** el juego desde otro dominio, `arbolabcgames.top` (carpeta del juego `L31B`). Es decir, el portal y el servidor de juegos pertenecen al mismo entorno, pero **quién desarrolló y quién tiene los derechos del juego no está dicho en la página** 🔶. Los personajes (un grupo de niños y animales con nombre propio, animados con Spine) y la voz son parte de esa propiedad. Cualquier permiso tendría que venir del titular de Árbol ABC.

## Cómo está construido (observado con REA)

| Aspecto | Qué hay |
|---|---|
| Render | **Canvas 2D** de Phaser (versión 2), lienzo lógico 1920×1080 con tres tamaños de recursos (XL, L, M, S) según el ancho de la ventana |
| Animación de personajes | Spine (esqueletos con animaciones `idle`, `walk`, `mistake`, `turbo`, `podium`) |
| Otras librerías | jQuery 1.11 y un script de seguimiento de uso |
| Estructura | Cinco estados: arranque, menú, selección de personaje, precarga, nivel y final |
| Palabras | Tres listas de datos (bisílabas ≈ 50, trisílabas ≈ 55, tetrasílabas ≈ 34) y tres posiciones fijas de botón |
| Sonido | Tres «atlas» de audio con cortes `[inicio, duración]`: efectos y música (~77 s), voces de instrucción (5 frases) y voces de palabras (~170 s, más de un centenar de palabras) |
| Accesibilidad | Ninguna: el texto de las palabras está pintado en el canvas; se juega solo con el ratón; no hay teclado ni lector de pantalla |

## Mecánica (observada y medida)

1. **Entrada (~5 s):** los tres corredores caen a su carril; suena una frase de instrucción; una cuenta regresiva de cuatro números (cada ~0,7 s) y arranca la música. El jugador va en el carril del centro.
2. **Tres carriles** (izquierda, centro, derecha). El jugador se mueve con el **ratón**: si el puntero está en el 34 % izquierdo de la pantalla va al carril izquierdo, en el 35–65 % al central y en el 66 % derecho al carril derecho. El cambio de carril dura 0,1 s.
3. **Cada pregunta** (medido: una cada **9,0 s**): aparecen tres carteles con una palabra cada uno, debajo de la pantalla, y **suben a la vez** a unos 185 px/s (3 px por cuadro). A los **1,5 s** una voz dice la palabra correcta. El cartel llega a la fila del jugador unos 6 s después de aparecer, o sea, unos 4 s después de oír la palabra.
4. **Contacto:** el primer cartel que toca al jugador decide. No hay botón de «elegir»: es el carril donde está parado en ese momento.
   - **Acierto:** suena un sonido corto, +1 punto y +1 casilla de «turbo».
   - **Error:** suena otro sonido, el personaje hace una animación de tropiezo (~1,2 s), –1 punto (no baja de 0), el turbo se vacía.
5. **Turbo:** con 3 aciertos seguidos el jugador acelera 2 s (el fondo corre a 30 en vez de 8) y los otros corredores salen de la pantalla.
6. **Ayuda tras fallar:** con 3 errores acumulados (cada acierto resta uno) aparece un **sombrero** sobre el cartel correcto hasta que sale de pantalla.
7. **Posición:** los dos acompañantes son decorado. Según el puntaje el jugador va atrás (< 3 puntos), en medio (3 a 9) o al frente (> 9); esa posición solo cambia el dibujo.
8. **Fin:** tras **12 preguntas** (~110 s) llega una meta y un podio. Estrellas: 1 con menos de 4 puntos, 2 con 4 a 9 y 3 con más de 9. Tres estrellas «desbloquean» un personaje. Una voz cierra y aparece el botón de repetir.

## Generación (inferido de la lógica)

- Cada pregunta toma las **tres palabras al azar** de la lista de su nivel y elige cuál es la correcta al azar, **sin repetir carril consecutivo**.
- **Nivel por puntos:** hasta 3 puntos usa bisílabas (letra grande); después trisílabas (letra mediana). Las tetrasílabas están en el código, pero por una condición mal escrita (`> 3 || < 6` siempre se cumple) **nunca se alcanzan** (inferido; no vimos ninguna en 12 preguntas).
- **Distractores:** palabras cualesquiera del mismo nivel; **no están pensadas** como error típico. Muestra medida: «leche / sopa / rama», «solo / chile / ocho», «rata / coco / lupa».
- No se evita repetir la misma palabra en preguntas cercanas.
- Hay muchas más palabras con voz (artículos, números, otros términos) que las que usa esta variante: el audio es compartido con otros juegos del portal.

## Qué le falta para evaluar (y que MIDUHO debe añadir)

| Original | Para MIDUHO 🔶 propuesto |
|---|---|
| Palabras al azar en cada carga | Rondas **deterministas** por semilla y configuración, para que el servidor recalifique lo mismo que vio el estudiante |
| Distractores sin criterio | Distractores por **error de lectura típico**: misma sílaba inicial, una sola letra distinta (casa/cama/cara), misma longitud |
| Solo un contacto por pregunta | Primer acierto 2 puntos, segundo 1, y tras el segundo fallo se revela la palabra (el error enseña) |
| Puntos que suben y bajan; podio | Nota por rondas (suma de 2/1/0). Sin posiciones ni comparación entre niños |
| Se maneja solo con el ratón; texto en el canvas | Botones HTML con la palabra, teclas ←/→ y Enter, `role="status"`, pausa; la palabra siempre también escrita |
| Reloj implícito (los carteles suben) | Ritmo configurable: «tranquilo» (los carteles esperan) y «carrera» (como la referencia), ambos pausables |
| El audio es el único soporte | Botón «Escuchar otra vez» y la palabra escrita visible para el lector que aún no decodifica |

## Lo que se conserva tal cual (mecánica, no expresión)

Tres carriles; un cartel con palabra por carril; los carteles suben a la vez; la voz dice la palabra tras un breve momento; el contacto decide; el jugador cambia de carril con una acción simple; pistas tras errores seguidos; recompensa por aciertos seguidos; niveles de bisílabas a tetrasílabas; 12 preguntas.

## Lo que se hace propio

Tema, personajes y escenario (MIDUHO), nombre, textos, código (React 19 + CSS Modules, sin canvas para texto), efectos (CC0 con licencia registrada), música (Gemini) y todo el dibujo.

## Audios (material entregado por el usuario, licencia por confirmar 🔶)

El usuario entregó en `content/referencias/rodeo-de-palabras-audio/` los audios de la referencia: `palabras/` (155 palabras, un archivo cada una), `voces/` (5 frases de instrucción), `fx/` (efectos y dos músicas) y los tres «atlas» completos. **No salen de este análisis**: se tratan como material con licencia **pendiente de adjuntar** (mismo trato que `content/biblioteca/LICENCIA.md`). Mientras falte el permiso escrito del titular, no se publican fuera del entorno de pruebas. Claude no los oye: lo que dice cada frase de instrucción está 🔶 por confirmar escuchándolos.
