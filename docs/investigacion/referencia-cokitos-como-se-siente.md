# Referencia funcional: clasificar emociones (Cokitos → Wordwall)

> Estudio de la actividad `como-se-siente` (Ética y valores, 1.°, CIU-1a3-CP), realizado el 2026-11-17 con REA 6.9.0 en Chrome aislado (puerto 9333) y una sesión de Playwright para jugar y medir. Se documentan hechos del referente; no se incorpora su código ni sus recursos. Las capturas temporales de REA y Playwright se borraron al terminar.

## Alcance y autoría

[Cokitos](https://www.cokitos.com/clasificar-emociones-positivas-y-negativas/) incrusta [esta actividad de Wordwall](https://wordwall.net/es/embed/f69faaef3401479ea08bda9b1f7f5ad2?themeId=43&templateId=2). El motor, el tema y los sonidos proceden de Wordwall; el contenido pertenece a quien creó allí la actividad (identificador de autor `8217281`; identidad no verificada 🔶). Es la misma plantilla «Agrupar» (`templateId=2`) que se estudió para `vivo-o-no-vivo`; la mecánica base y sus límites de accesibilidad están en [el informe anterior](referencia-cokitos-seres-vivos-e-inertes.md). Aquí se registran las diferencias y se corrige lo que una prueba directa permite precisar.

## Qué cambia en construcción y disposición

| Aspecto | Observado en esta actividad | Comparación con `vivo-o-no-vivo` |
|---|---|---|
| Motor | Wordwall 1.0.8, un canvas; contenido en un modelo JSON separado | Misma plantilla y motor |
| Tema | `themeId=43`, «Cork»: fondo de corcho; contorno blanco de tiza alrededor de la pila; notas rectangulares de colores con tipografía manuscrita; destinos delineados como casillas blancas sobre el corcho | Sustituye «Sunflower», su fondo amarillo y tarjetas con foto/dibujo |
| Distribución a 1440 × 900 | Pila arriba, 20 notas barajadas en cinco columnas y cuatro filas; debajo, «Positivo» a la izquierda y «Negativo» a la derecha, cada uno con diez casillas (3 + 3 + 3 + 1); botón «Enviar respuestas» abajo al centro | La mecánica es igual, pero en este tema y cantidad la pila ocupa la franja superior y los destinos la inferior; no corresponde a la disposición izquierda/derecha descrita en el informe anterior |
| Formato de tarjeta | Solo texto; sin imagen, emoji ni botón de altavoz | Las 16 tarjetas de seres vivos sí tenían imagen, palabra y voz |
| Sonido de tarjeta | En el modelo JSON, las 20 tarjetas tienen `sound: null`; no apareció altavoz en pantalla ni petición de voz por tarjeta | Corrige cualquier supuesto de reutilizar aquí las voces del juego anterior: esta actividad carece de ellas |
| Accesibilidad | El texto de juego está dibujado en canvas; la lista jugable no aparece como controles semánticos | Misma limitación |

El orden de las notas cambia al empezar. Los colores decorativos no codifican la categoría: en una misma categoría hay notas de varios colores.

## Contenido completo observado

Fuente: modelo de contenido servido por Wordwall para este identificador de actividad. **Todos** los ítems son palabras o frases breves; `image: null` y `sound: null` en cada uno. Tampoco hay emoji.

| Categoría exacta | Tarjetas exactas (10) |
|---|---|
| **Positivo** | Feliz · Contento/a · Tranquilo/a · Orgulloso/a · Agradecido/a · Amable · Emocionado/a · Querido/a · Alegre · Esperanzado/a |
| **Negativo** | Triste · Enfadado/a · Cansado/a · Asustado/a · Avergonzado/a · Celoso/a · Preocupado/a · Decepcionado/a · Nervioso/a · Solo/a |

No hay generación de preguntas ni distractores: es un conjunto fijo de 20 notas que se baraja al iniciar. Cada destino dispone de diez lugares; el color de cada nota no señala la respuesta.

## Mecánica y tiempos

1. Pantalla negra de inicio con título y un botón grande «Iniciar». Al pulsarlo, aparece el tablero y un reloj ascendente `0:00`; no se observó cuenta regresiva. La pausa está abajo a la izquierda; volumen y pantalla completa, abajo a la derecha.
2. Se arrastra una nota desde la pila superior a cualquier casilla de una de las dos categorías. La nota se quita de la pila, las restantes se reacomodan y el destino se llena. No se revela si quedó bien o mal al soltar. El tema reproduce variantes de levantar y soltar nota.
3. «Enviar respuestas» se habilita tras colocar **una sola nota**. La prueba lo pulsó con 19 notas aún en la pila: se aceptó, se revisó la nota colocada y el resultado fue `1/20`. Esto confirma el comportamiento del informe anterior y precisa que las omitidas cuentan dentro del total.
4. Tras enviar, las notas de la pila se atenúan; aparece una marca ✓ o ✗ sobre cada nota colocada y el contador de aciertos arriba a la derecha. En la prueba de una nota, la marca ya era visible en la captura tomada aproximadamente un segundo después de pulsar. El informe anterior midió ~0,3 s por nota en el revelado de 16 tarjetas; **no se volvió a medir la cadencia de 20 notas** 🔶. El tablero MIDUHO usa 420 ms por nota, una decisión propia.
5. El cierre muestra puntuación sobre 20, tiempo empleado, tabla de clasificación, «Mostrar respuestas» y «Volver a empezar». La prueba parcial mostró 5,2 s como tiempo de juego. No hay un límite de tiempo observable en la partida ensayada; la pista `gametimesup` existe en el tema para otras configuraciones 🔶.

La secuencia de inicio, arrastre, envío, revelado y cierre coincide con `vivo-o-no-vivo` y su [informe](referencia-cokitos-seres-vivos-e-inertes.md). La diferencia funcional comprobada es la presentación de texto puro, 20 piezas y diez casillas por grupo.

## Inventario sonoro

Claude capturó `content/referencias/cokitos-como-se-siente/` (`inventario.json`, `RESUMEN.md`) antes de este estudio. La tabla vincula **evento → identificador de pista capturada** según los nombres y el mapa `audios.json` del tema Wordwall; la escucha humana de las pistas queda pendiente 🔶. Las variantes de cada evento se seleccionan entre las pistas de su fila, no suenan todas en cada acción.

| Evento | ID de pista del inventario | Evidencia / límite |
|---|---|---|
| Inicio de partida | `fa352c82` (`corkgameintro`) | Tipo `Intro` del tema |
| Levantar una nota | `875ad9c5`, `8405db5d`, `38e93a5a`, `3263faf0`, `4c38df8e` (`corkpickup1–5`) | Tipo `TilePickup` |
| Soltar una nota | `55d21e8c`, `c16801e3`, `9265a10d`, `0e25c4c0`, `19f7f8fe` (`corkdrop1–5`) | Tipo `TileDrop` |
| Pulsar «Enviar respuestas» / comenzar revelado | `1dbe5c92` (`corkgamereveal`) | Tipo `RevealAnswers` |
| Cada acierto durante el revelado | `d14f092c`, `fffe01a1`, `000946de` (`corkchipminorfast1–3`) | Tipo `FastCorrect` |
| Cada fallo durante el revelado | `2434c4ac`, `f56d3370`, `42d08b5e` (`corkchipfailfast1–3`) | Tipo `FastIncorrect` |
| Abrir o elegir opción de menú | `b4848ae0` (`corkmenu`) | Tipo `Menu`; el disparo concreto dentro del menú no se midió 🔶 |
| Cierre de partida completada | `ba8f4bc5` (`corkgamesuccessful`) | Tipo `GameCompleted`; también aplicó al cierre parcial de la prueba |
| Abrir tabla de clasificación | `9e48495f` (`corkleaderboards`) | Tipo `Leaderboard`; asignación por mapa del tema, sin accionar esa opción 🔶 |
| Reiniciar | `44d9916c` (`corkgamerestart`) | Tipo `Restart`; asignación por mapa del tema, sin accionar esa opción 🔶 |
| Agotarse el tiempo, si una configuración lo habilita | `8acb4adc` (`corkgametimesup`) | Tipo `TimesUp`; no ocurrió en la partida observada 🔶 |

Son **23 efectos `cork*`** en el inventario. `93eb48d1` (`test1.mp3`) es una prueba del motor y `23061693` (`data-0.mp3`) es un recurso embebido de 0,168 s: ninguno corresponde a una voz de tarjeta; el rol «voz» de este último es una inferencia del inventario, no evidencia de habla en el juego. El tema declara una pista de fondo en su configuración general, pero **no se cargó ni se capturó** en esta sesión; no se puede afirmar que esta actividad la reproduzca 🔶. No se capturó audio nuevo aquí.

## Encaje con MIDUHO: `clasificar` + `presentacion: "tablero"`

La estructura y las reglas de `juegos/agrupar/` sirven como base: categorías con cupos, pila barajada, arrastre, selección y teclado, envío y revelado con marcas. El contenido de texto puro ya es admisible porque `imagen` y `audio` son opcionales. Haría falta **adaptar la presentación**, no crear otro tipo de juego:

| Diferencia | Estado actual / propuesta para un encargo posterior |
|---|---|
| Tema y disposición | El tablero existente fija fondo amarillo «Sunflower», tarjetas con espacio para imagen y pila izquierda con destinos a la derecha. 🔶 Proponer una variante visual propia inspirada en la disposición superior/inferior de corcho, sin copiar sus recursos, con espacio suficiente para 20 notas y texto legible en teléfono. |
| Sonidos | `tablero.tsx` fija `/audio/juegos/agrupar/` en `SONIDOS`; esas pistas son del tema anterior. 🔶 Permitir un conjunto de efectos por actividad o tema para asociar los eventos a los `cork*` inventariados, con trazabilidad de licencia. |
| Guía de asignatura | El tablero no acepta `escena` ni personaje. `casillas` y `parejas` ya emplean `juegos/comun/escena.ts`. 🔶 Incorporar a **Ciro, el chigüiro** para Ética y valores con escena y reacción, sin ocultar notas ni destinos. |
| Voz y lectura | La referencia no tiene voz de tarjeta; MIDUHO debe mantener escucha accesible en 1.° mediante su componente existente, aunque no haya pista original por palabra. 🔶 Definir texto de lectura y validarlo con docente. |
| Envío y evaluación | Wordwall deja enviar con omisiones y usa tiempo/ranking. MIDUHO exige todas las notas ubicadas antes de enviar y no usa reloj ni clasificación; el tablero ya implementa estas decisiones. |
| Accesibilidad | El tablero MIDUHO usa HTML, teclado, foco y estados anunciados; comprobar contraste de la eventual variante de colores y que el texto no quede dentro de imágenes. |

## Juicios pedagógicos pendientes 🔶

- 🔶 Proponer a la docente categorías como «agradables» y «desagradables» o lenguaje equivalente: «positivas/negativas» puede sugerir que sentir tristeza, miedo o enojo está mal. No se cambia la clasificación sin validación curricular.
- 🔶 «Amable» describe una conducta o rasgo, «querido/a» una relación o experiencia y «solo/a» una situación; no son emociones con el mismo sentido que «feliz» o «triste». «Cansado/a» es también un estado corporal. Pedir revisión antes de convertirlos en ítems evaluables.
- 🔶 «Nervioso/a» y «emocionado/a» pueden sentirse agradables o desagradables según el contexto; una categoría fija sin escena puede resultar ambigua para 1.°. «Orgulloso/a» y «celoso/a» también se benefician de contexto.
- 🔶 Revisar vocabulario colombiano y lectura inicial: «enfadado/a», «decepcionado/a», «esperanzado/a» y las formas con barra pueden requerir reformulación o apoyo oral. La referencia no ofrece voz por tarjeta.

No se decide aún el contenido final, el tema MIDUHO ni la escena. Este paso es solo el estudio.

## Adaptación aprobada (2026-11-17)

El usuario aprobó reutilizar `clasificar` con `presentacion: "tablero"`, variante visual propia de corcho, efectos capturados del tema Cork y Ciro como guía. Las categorías son «Emociones agradables» y «Emociones desagradables». Son 12 tarjetas con ilustración de Ciro, nombre en HTML, botón «Escuchar» mediante síntesis del navegador y una explicación breve en primera persona. La partida conserva la ubicación de todas las tarjetas antes del envío, el revelado una por una, la calificación de `clasificar` y la ausencia de reloj y ranking. La variante girasol sigue por omisión para `vivo-o-no-vivo`. 🔶 La selección de emociones y sus categorías requieren validación docente; algunas dependen del contexto. 🔶 La voz sintetizada reemplaza voces aún por grabar.
