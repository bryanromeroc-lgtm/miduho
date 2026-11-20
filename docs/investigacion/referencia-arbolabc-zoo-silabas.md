# Referencia: «Zoo sílabas»

**Estudio:** 19 de noviembre de 2026. **Actividad prevista:** `zoo-de-silabas`, Comprensión lectora, 1.°, LEN-1-06. **Evidencia:** inspección REA 6.9.0 de la pestaña abierta en Chrome (CDP 9333), lectura de scripts cargados y una partida parcial observada con Playwright conectado a esa misma pestaña. El [directorio Cristic](https://www.cristic.com/zoo-silabas/) describe «ordenando las sílabas» y enlaza al [juego de Árbol ABC](https://arbolabcgames.top/F37A/); Cristic no es el autor del juego. El título interno de la pestaña es «Turronsiviris».

## Construcción y alcance de la observación

| Aspecto | Hallazgo | Base |
|---|---|---|
| Interfaz | Phaser 2, lienzo de 1280 × 720, física Arcade; pantalla y texto pedagógico dentro del lienzo. REA halló un único nodo `Canvas` sin texto accesible del juego. | REA + scripts |
| Audio | Dos sprites: efectos/música y voz, con marcas de tiempo. Música de fondo en bucle al entrar al nivel. | `AudioManager.js`, inventario de Claude |
| Persistencia | `localStorage` guarda álbum, último nivel desbloqueado y mayor cantidad de galletas. | `LocalData.js` |
| Accesibilidad | La interacción de las sílabas usa arrastre de sprites; no se observó alternativa de teclado ni texto HTML accesible. | REA + `DialogQuestion.js` |
| Alcance de prueba | Se recorrió el nivel 1 hasta la primera pregunta; se completó una respuesta incorrecta y luego la correcta. El resto del recorrido y el cierre se describen a partir del código, no como observación jugada. | Playwright + scripts |

## Ciclo y mecánica

1. El menú baraja por separado las listas de animales de dos y tres sílabas y las guarda. Hay **ocho niveles de trayecto**, desbloqueados en secuencia. Los niveles 1–5 (índices 0–4) usan dos sílabas y piden **2, 2, 3, 4 y 4 animales**; los niveles 6–8 usan tres sílabas y piden **5, 5 y 5**. Suman 15 preguntas por grupo, igual que los 15 animales activos de cada banco. El índice de cada banco avanza solo al acertar. La baraja se hace al abrir el menú; no hay selección aleatoria nueva en cada parada.
2. Tras elegir nivel, el perrito corre automáticamente hacia la meta. Se puede tocar para saltar hasta dos veces antes de volver a pisar; el código fija velocidad horizontal de 300 unidades/s en carrera y salto, impulso vertical de −700 y gravedad. El nivel 1 tiene cinco tramos de 1280 unidades; los demás usan nueve. Hay disposiciones de plataformas elegidas aleatoriamente y galletas en posiciones con rangos aleatorios. 🔶 La duración real de cada trayecto varía con los saltos, caídas y pausas; no hay reloj regresivo observado. Sin interrupción, 6400/300 ≈ 21 s y 11520/300 ≈ 38 s son solo estimaciones geométricas.
3. Al llegar a la meta se abre un diálogo oscuro sobre el recorrido. Se ve la **imagen del animal**, una consigna para formar su nombre, tantas **fichas de sílaba como huecos** (dos o tres) y ningún distractor adicional. Las dos sílabas aparecen invertidas siempre. Las tres se barajan y, si quedan en orden correcto, se sustituyen por otra permutación. Se **arrastra cada ficha a un hueco específico**; una ficha suelta fuera de un hueco o sobre uno ocupado no se coloca. La validación ocurre automáticamente al llenarlos todos, comparando la palabra concatenada. No es tocar en orden ni escoger entre opciones.
4. En la prueba, «to» y «ga» se arrastraron a dos huecos para el animal `gato`: la composición incorrecta mantuvo el mismo diálogo, sonó el efecto de error, las fichas oscilaron y regresaron a su lugar. El código espera 1 s antes de iniciar el regreso y anima 500 ms; el muestreo confirmó que a ~1,9 s las fichas volvían a estar disponibles. **No consume corazones, no limita reintentos, no muestra la solución ni cambia de animal.** La función de escena «Incorrecto» existe, pero no es llamada por esta validación.
5. Con `ga` + `to`, el código espera 500 ms y abre la pantalla de acierto: muestra la palabra formada, reproduce ovación y ofrece «Continuar». La prueba confirmó el avance del contador de preguntas, manteniendo los tres corazones y el mismo conteo de galletas. Al continuar se plantea el siguiente animal. 🔶 La duración que el estudiante permanece en la pantalla de acierto depende de cuándo pulse el botón.
6. Al completar las preguntas del nivel, aparece el álbum de stickers; cada animal acertado se añade una sola vez y el álbum persiste entre partidas. Después se celebra el nivel con confeti, carrera, ladrido y una voz, y se desbloquea el siguiente. En el nivel 8 se llega a la pantalla de álbum final y luego a una tabla de puntuación que muestra **galletas actuales y mejor marca**. El texto del código afirma que se completó el álbum, aunque el álbum depende de los aciertos realmente registrados. 🔶 El cierre completo no se jugó en la sesión.

**Corazones, huesos y galletas.** El trayecto muestra tres corazones. Caer en huecos u obstáculos quita uno, suena un efecto de pérdida y devuelve al perrito al último apoyo: el código espera 0,5 s, lo mueve durante 1,2 s y espera 2 s antes de reanudar. La condición de pérdida se evalúa en la siguiente colisión después de llegar a cero (en la práctica, hasta cuatro choques contando el final); abre «Inténtalo de nuevo» y vuelve a selección de nivel. Los objetos llamados `bones` en el código se dibujan como galletas; recoger uno suma **una unidad al marcador**, con animación y sonido. El mejor resultado es la mayor cantidad de galletas, no el número de palabras correctas. No se observó un premio independiente para «huesos» frente a «galletas».

## Banco de animales

Transcripción de los datos silábicos del programa como **datos de análisis**, sin copiar recursos visuales ni código. «Inactivo» significa que la línea está comentada y no entra en la baraja.

| Dos sílabas, activos (15) | Separación |
|---|---|
| burro | bu · rro |
| cebra | ce · bra |
| cerdo | cer · do |
| foca | fo · ca |
| gallo | ga · llo |
| gato | ga · to |
| león | le · ón |
| loro | lo · ro |
| mosca | mos · ca |
| oso | o · so |
| pato | pa · to |
| perro | pe · rro |
| pulpo | pul · po |
| vaca | va · ca |
| zorro | zo · rro |

| Tres sílabas, activos (15) | Separación |
|---|---|
| abeja | a · be · ja |
| ardilla | ar · di · lla |
| avestruz | a · ves · truz |
| ballena | ba · lle · na |
| caballo | ca · ba · llo |
| cangrejo | can · gre · jo |
| conejo | co · ne · jo |
| flamenco | fla · men · co |
| gallina | ga · lli · na |
| jirafa | ji · ra · fa |
| medusa | me · du · sa |
| oveja | o · ve · ja |
| pingüino | pin · güi · no |
| pollito | po · lli · to |
| tortuga | tor · tu · ga |

| Tres sílabas, inactivos en el código (4) | Separación escrita allí |
|---|---|
| buitre | bu · i · tre |
| koala | ko · a · la |
| venado | ve · na · do |
| zorrillo | zo · rri · llo |

🔶 La línea de `buitre` representa tres piezas, pero esa separación no corresponde a su pronunciación usual en dos sílabas (`bui · tre`); no tomarla como modelo pedagógico.

## Ajuste frente a MIDUHO

**Conclusión sobre el tablero:** descartar `emparejar` como tipo de esta actividad. La evidencia del juego y la descripción de Cristic señalan **ordenar sílabas para componer una palabra**. `separar` evalúa el proceso inverso: muestra una palabra completa y pide marcar límites. La guía de Comprensión lectora en MIDUHO es **Bruno**, oso de anteojos; ya hay poses en `public/images/juegos/cuenta-las-silabas/`.

| Opción 🔶 | Lo que ya aporta | Lo que falta o se sacrifica |
|---|---|---|
| Extender `ordenar` con una ronda por animal y 2–3 casillas | `juegos/casillas/` ya permite arrastrar, tocar o usar teclado; muestra sílabas como texto HTML y tiene `Escuchar` por ficha. Es la base funcional más cercana. | Hoy exige **mínimo tres elementos**, maneja un solo orden por actividad y un envío global con revelado; habría que admitir dos sílabas, imagen por ronda, voz de palabra, validación por animal, reintentos y escena de recorrido con Bruno. |
| Componer un juego específico de sílabas sobre lógica compartida de casillas | Permite conservar la imagen, las piezas a la vista, el diálogo por parada y un registro evaluable por palabra, sin forzar el contrato de un orden largo. | Más código y pruebas; hay que definir cómo calificar intentos y si el recorrido tiene peligro real. |
| Adaptar `emparejar` (`cinta` o `parejas`) | Ya asocia imagen y texto, con teclado y, en `parejas`, audio por ficha. | Empareja una imagen con una opción o relaciona pares; no construye la palabra en huecos posicionales. Para reproducir la mecánica requeriría una transformación mayor. `separar` tampoco sirve sin invertir su objetivo. |

En cualquiera de las rutas habría que definir **escena de recorrido con Bruno**, ficha textual por sílaba, voz o botón «Escuchar» para la palabra completa, efectos por tema y una respuesta que el servidor pueda recalificar. El referente no proporciona voces por animal: el sprite de voz solo contiene cinco marcas generales. WCAG 2.1 AA exige texto HTML seleccionable, contraste comprobado, `alt` para el animal, foco visible, teclado y alternativa al gesto de arrastre; el referente no lo cumple en su lienzo.

## Criterios para decidir con la docente 🔶

- 🔶 **Vocabulario en Colombia:** `cerdo` es la palabra escrita en el banco; `marrano` puede ser familiar en algunas casas, pero cambia la longitud silábica y no tiene ficha en el original. Confirmar si conviene mantener `cerdo` y nombrar `marrano` solo como sinónimo oral. Revisar familiaridad de `avestruz`, `flamenco` y `koala` (este último está inactivo); una imagen ayuda, pero no garantiza reconocimiento.
- 🔶 **Dificultad fonológica:** `le · ón` es un hiato con tilde y puede requerir explicación; `pingüino` requiere conservar la diéresis. `buitre` está comentado y su división en el código es problemática.
- 🔶 **Extensión:** proponer entre **6 y 12 animales** por partida para 1.°, frente a los 30 repartidos en ocho niveles del original. Confirmar duración con la docente.
- 🔶 **Progresión:** opción A, primero dos sílabas y luego tres; opción B, mezcla gradual. Confirmar si la evaluación debe distinguir niveles.
- 🔶 **Distractores:** el original no los tiene. Añadirlos cambiaría la tarea de ordenar a seleccionar y aumentaría carga; confirmar si se desea alguna pieza extra y con qué propósito pedagógico.

## Inventario sonoro

Claude capturó **24 pistas** en `content/referencias/arbolabc-zoo-silabas/` (dos sprites completos y 22 cortes). Esta tabla relaciona las marcas con llamadas efectivas del juego; un nombre de pista por sí solo **no prueba uso**. Los IDs remiten a `inventario.json`. No se escuchó ni transcribió audio en este encargo.

| Evento o estado en el juego | ID del corte | Evidencia y límite |
|---|---|---|
| Música en bucle durante el nivel | `3ad942b4-backgroundMusic` | `Level.create` → `playMusicBackground`; se detiene al salir. |
| Menú: voz de título | `0c267e3a-title` | `Menu.create` → `playVoice("title")`. 🔶 Contenido literal y acento por escuchar; el título interno no permite transcribirla. |
| Entrar desde menú / continuar / volver de pérdida / pasar al álbum y tabla | `3ad942b4-btnNavigation` | `GameButtons`, diálogos y colisión → `playFx`. |
| Elegir un nivel | `3ad942b4-btnSelection` | `OptionsLevel.goToLevel`. |
| Saltar durante la carrera | `3ad942b4-turronJump` | `Objects.jumpTurron`. |
| Recoger galleta | `3ad942b4-effectCookies` | `CollisionObjects.collisionBone`. |
| Composición silábica errónea; pantalla de derrota por trayecto | `3ad942b4-effectError` | `DialogQuestion.validateAnswer`; `CollisionObjects.contactLose`. |
| Composición correcta | `3ad942b4-ovation` | `DialogSolutionQuestion.createSceneCorrect`. 🔶 El nombre sugiere ovación; comprobar al escuchar. |
| Caída o choque del personaje | `3ad942b4-turronLose` | `CollisionObjects.contactLose`. |
| Celebración al acabar un nivel: ladrido/acción | `3ad942b4-turronCorrect` | `WorldLevel.animationEndLevel`. |
| Celebración al acabar un nivel: voz | `0c267e3a-congratulate1` | `WorldLevel.animationEndLevel` después de la animación del ladrido. 🔶 Palabras exactas y acento por escuchar. |
| Sprite completo de efectos, contenedor de los cortes | `3ad942b4` | Archivo fuente; no es un evento independiente. |
| Sprite completo de voz, contenedor de los cortes | `0c267e3a` | Archivo fuente; no es un evento independiente. |
| Marcas presentes sin llamada activa localizada | `3ad942b4-titleFx`, `3ad942b4-btnStart`, `3ad942b4-btnPlayAgain`, `3ad942b4-effectTokens`, `3ad942b4-popUpAgain`, `3ad942b4-stickers`, `3ad942b4-turronRunning`, `3ad942b4-effectHeart` | 🔶 Disponibles en el sprite, pero no atribuirles un evento; `popUpAgain` figura solo en una línea comentada. |
| Voces presentes sin llamada activa localizada | `0c267e3a-prompt1`, `0c267e3a-prompt2`, `0c267e3a-prompt3` | 🔶 No se puede transcribir ni asociar a la consigna por el nombre. |

**Voces:** las cinco marcas son `title`, `prompt1`, `prompt2`, `prompt3` y `congratulate1`. El código muestra consignas escritas y mensajes de celebración, pero no enlaza literalmente esas frases a cada corte; por eso las cinco transcripciones quedan 🔶 pendientes de escucha, incluso las dos marcas usadas. 🔶 No se puede afirmar si la voz tiene acento de España, colombiano o latinoamericano por el dominio de Árbol ABC. No hay pistas de voz con el nombre de cada animal. La música y los efectos también requieren revisión auditiva antes de una adaptación. El permiso o licencia aplicable al audio queda 🔶 sujeto al registro de Claude.

## Qué conservar y qué resolver después

La forma mecánica reconocible es una **imagen por parada, sílabas barajadas a la vista, huecos ordenados, reintento inmediato y álbum tras completar un tramo**. El escenario, las imágenes, el personaje, los textos, el código y los nombres de la referencia no pasan a MIDUHO. 🔶 Para convertirlo en evaluación faltan rondas y respuestas reproducibles, regla de puntaje por palabra e intento, retroalimentación pedagógica y una salida accesible del recorrido. Estas son decisiones para la fase de diseño, no definiciones tomadas en este estudio.

## Adaptación aprobada

**Aprobada por el usuario el 19 de noviembre de 2026.** MIDUHO usa un tipo nuevo `formar`: diez animales en orden fijo (cinco de dos sílabas y cinco de tres), una imagen y voz por ronda, fichas HTML barajadas, huecos ordenados y validación automática. Si la composición falla, se reintenta sin límite; el resultado conserva el primer intento para la calificación. Bruno recorre diez paradas sin peligros ni coleccionables. Hay alternativas de toque y teclado, movimiento reducido y música optativa. La felicitación grabada del referente se reproduce sin transcribirla (🔶 contenido literal por confirmar).
