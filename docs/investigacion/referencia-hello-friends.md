# Referencia: «Greetings» para `hello-friends`

**Estudio:** 20 de noviembre de 2026. **Actividad prevista:** Inglés, 1.°, ING-1-04. **Fuente:** [Cristic](https://www.cristic.com/greetings/) enlaza el [juego real de Árbol ABC](https://arbolabcgames.top/E37ABC/), cuya pestaña se titula «Greetings Exploratory». Cristic es el directorio, no la autoría del juego. **Método:** REA 6.10.1 sobre Chrome aislado en CDP 9333; lectura de los scripts cargados y del atlas de globos; partida completa y cronometraje con Playwright en otro Chrome. Las capturas, el atlas y los scripts de análisis se eliminaron del scratchpad al cerrar el estudio.

## Construcción y alcance

| Aspecto | Evidencia observada |
|---|---|
| Presentación | Un lienzo Phaser 2 con menú, escena de parque, dos personajes, perro, globos y cierre. Las seis frases son recortes gráficos `sentence00`–`sentence05`, no texto HTML. El DOM no expone esas frases como texto accesible. |
| Entrada | El puntero toca los personajes. La mano del personaje habilitado aparece y cambia de tamaño en bucle; solo ese personaje activa el siguiente globo. |
| Audio | Dos archivos con marcas internas: uno de voces y otro de música/efectos. `SentenceManager` asigna seis recortes de frase a seis marcas de voz en orden distinto al orden físico del audio. |
| Evaluación | No hay opciones, distractores, pregunta de comprobación, error ni calificación de comprensión. `trackingObj.correctAnswer()` se llama al terminar cada frase, independientemente de una respuesta. |
| Accesibilidad del referente | Interacción y texto dentro del lienzo; no se observó alternativa de teclado ni texto seleccionable. La mano parpadeante comunica qué tocar solo visualmente. |

No repito el análisis del motor de Árbol ABC documentado en [«Zoo sílabas»](referencia-arbolabc-zoo-silabas.md). Aquí importa el ciclo específico de diálogo.

## Secuencia exacta

El menú pronuncia el título y después muestra «Jugar». Al entrar, comienza la música y aparecen los personajes; la niña queda disponible tras aproximadamente **1,4 s**. Cada toque aceptado reproduce `btnClick`, retira la mano durante **0,6 s**, abre el globo durante **0,4 s** y comienza la voz mientras la frase aparece en **0,3 s**. Tras la voz espera **0,5 s** antes de iniciar el siguiente turno. La siguiente mano queda habilitada aproximadamente **1,4 s** después del cambio de frase. No hay límite de tiempo para tocar.

Las transcripciones siguientes son **texto observado en las imágenes del referente, solo para analizar la secuencia**; no son contenido aprobado para MIDUHO. Los nombres pertenecen a personajes del juego original y no representan datos de estudiantes.

| Turno | Habla | Globo observado | Marca de voz / ID de Claude | Voz, duración declarada | Toque → cambio de turno, medido |
|---|---|---|---|---:|---:|
| 1 | Niña | “Good morning, my name is Teresa.” | `sentence2` / `7fdc7204-sentence2` | 2,301 s | 3,84 s |
| 2 | Niño | “Hi my name is Christian. Nice to meet you.” | `sentence4` / `7fdc7204-sentence4` | 3,500 s | 5,04 s |
| 3 | Niña | “Hello Chhristian, what is your dog’s name?” | `sentence1` / `7fdc7204-sentence1` | 2,513 s | 4,04 s |
| 4 | Niño | “My dog’s name is Perry.” | `sentence5` / `7fdc7204-sentence5` | 2,000 s | 4,54 s, incluye perro |
| 5 | Niña | “Good bye Christian and Perry.” | `sentence3` / `7fdc7204-sentence3` | 1,877 s | 3,40 s |
| 6 | Niño | “Good bye Teresa.” | `sentence6` / `7fdc7204-sentence6` | 1,526 s | 4,35 s hasta «End» |

El cuarto turno interrumpe la espera normal: el perro se mueve, aparecen marcas visuales de ladrido y `pet` suena dos veces; el bucle de animación avanza al quinto turno tras cinco pulsos de **0,3 s**. Los tiempos medidos son una partida en Chrome y pueden variar por cuadros y carga. La duración de los cortes MP3 en el inventario de Claude es ligeramente mayor que la marca usada por Phaser; la tabla emplea la **duración declarada por el juego**. Los cuatro primeros turnos y el quinto se desbloquean solo con la señal visual de la mano; tocar al otro personaje no avanza ni produce error. No se exige hablar, leer en voz alta, seleccionar significado ni responder una pregunta.

Tras la sexta voz y una pausa de 0,5 s, `EndAnimation` revela en círculo una pantalla final. El avance del círculo depende de cuadros, no de un temporizador fijo; en la partida el sexto toque tardó **4,35 s** en llevar a «End». La música se detiene al salir del nivel y vuelve a iniciarse en el cierre. La pantalla muestra una felicitación gráfica y un botón de repetir; este vuelve directamente al nivel. No presenta resultados ni una puntuación al estudiante.

## Inventario sonoro

Claude ya capturó [el inventario](../../content/referencias/arbolabc-greetings/inventario.json) y su [resumen](../../content/referencias/arbolabc-greetings/RESUMEN.md): **13 entradas**, de las cuales dos son archivos fuente completos y once son cortes (siete voces, tres efectos y música). Las asociaciones siguientes se comprobaron en las llamadas del juego; el contenido audible, acento y calidad quedan 🔶 por escuchar. No se capturó audio en este estudio.

| Evento | ID de pista de Claude | Base |
|---|---|---|
| Apertura del menú: voz del título | `7fdc7204-title` | `Menu.create` reproduce `title`. 🔶 Transcripción audible por escuchar. |
| «Jugar» para entrar al nivel | `1856467a-btnNavigation` | `Menu` reproduce `btnNavigation`. |
| Nivel en curso; también pantalla final | `1856467a-backgroundMusic` | `Level.create` y `End.create` inician el bucle; la transición detiene el primero. No suena en el menú según las llamadas leídas. |
| Tocar a la niña o al niño habilitado | `1856467a-btnClick` | `selectGirl` y `selectBoy`; seis activaciones en la partida. Tocar al personaje inactivo no llama un efecto. |
| Frases de los turnos 1–6 | `7fdc7204-sentence2`, `7fdc7204-sentence4`, `7fdc7204-sentence1`, `7fdc7204-sentence5`, `7fdc7204-sentence3`, `7fdc7204-sentence6` | Orden de `SentenceManager`; cada voz se inicia cuando se abre su globo. 🔶 Comprobar auditivamente que cada voz coincide con el texto gráfico. |
| Perro tras el turno 4 | `1856467a-pet` dos veces | `animateDog`, después de que termina la cuarta voz. |
| Repetir | **Sin efecto identificado** | `ReplayButton` solo invoca la vuelta al nivel; no llama `playFx`. |
| Contenedores de cortes, sin evento propio | `7fdc7204` (voces), `1856467a` (efectos) | Son los archivos completos usados para cortar las pistas anteriores. |

🔶 El campo de licencia del inventario todavía contiene un marcador sin completar; Claude debe confirmar el permiso y la revisión auditiva antes de cualquier uso en MIDUHO. El audio original no se adaptó ni copió a `apps/web/` en este paso.

## Contraste con MIDUHO

El [programa de juegos de 1.°](../../openspec/changes/juegos-primero/specs/juegos-primero/spec.md) anota `hello-friends` como `seleccion-multiple`, pero eso describe una **posible adaptación evaluable**, no el original. La sospecha del encargo se confirma: el referente es una exploración lineal de escucha y toque. El tipo no queda descartado para MIDUHO; falta escoger qué comprensión medir.

| Tipo actual | Qué ya permite | Qué no resuelve por sí solo |
|---|---|---|
| `seleccion-multiple` | De 3 a 12 preguntas, 2–4 opciones, voz de pregunta y opciones, ilustración informativa con `alt`, imágenes de opciones, escena con guía, calificación por respuesta, teclado y lectura automática en 1.°. | No tiene una conversación continua con turnos de dos personajes, mano indicadora y transición de globo. Una pregunta convencional cambia el ritmo del referente. |
| `emparejar` | Pares con voz a ambos lados; presentación en columnas o cinta. Califica cada asociación. | No narra el diálogo ni ofrece una escena de dos personajes que se respondan. Las frases largas y los pares de saludos/despedidas podrían ser ambiguos. |
| `aventura` | Progresión narrada por escenas, preguntas y cierre; puede conservar una secuencia de relato. | Su contrato actual está especializado en lugares, objetos y secuencia de otra actividad. Reutilizarlo aquí requeriría cambiar el contrato y la presentación. |

Para publicar una actividad, el catálogo lee `apps/web/curriculo/actividades/<asignatura>/<grado>/<slug>.json`, valida el esquema general y el tipo, y agrupa por asignatura y grado. Hoy `ingles/` solo tiene archivos de **5.°**. En una fase posterior haría falta `ingles/1/hello-friends.json` con `slug`, `titulo`, `tipo`, `grado: 1`, `instruccion`, `tema` y `contenido` válido, más el audio y las imágenes accesibles que se decidan. `catalogo.de("Inglés", 1)` lo mostraría en la asignatura del grupo y `catalogo.una(...)` permitiría abrirlo por slug; los archivos inválidos quedan fuera y aparecen en `errores()`. La guía de Inglés registrada es **Maca, la guacamaya**. En este encargo no se creó el archivo.

## Opciones para la fase de diseño 🔶

1. **Escuchar y elegir quién habló.** Mantener dos personajes y seis turnos; tras cada voz, ofrecer dos botones accesibles con sus imágenes y nombres genéricos de rol. **Ventaja:** conserva la alternancia y exige atención auditiva; cabe en `seleccion-multiple`. **Límite:** si la escena acaba de señalar quién habla con la mano, la respuesta se revela visualmente. Habría que ocultar o separar ese indicio en el momento de evaluar, lo que cambia el ritmo.
2. **Escuchar y elegir la escena o intención.** Tras un saludo, una presentación o una despedida, escoger entre 2–3 escenas ilustradas; mantener el diálogo como introducción y luego preguntar. **Ventaja:** evalúa significado y evita que la identidad del hablante dé la respuesta; aprovecha el quiz ilustrado. **Límite:** varias frases mezclan funciones (“Hi” + presentación + cortesía), así que ilustraciones e ítems necesitan validación docente para evitar dos respuestas plausibles.
3. **Escuchar y completar la respuesta del diálogo.** El personaje habla y el estudiante escoge cuál de dos respuestas corresponde antes de que el otro conteste. **Ventaja:** preserva la forma de conversación y evalúa uso en contexto. **Límite:** exige un diseño de turnos no disponible en la presentación actual; las voces originales solo cubren las seis frases observadas y cualquier respuesta alternativa necesitaría audio propio. Podría requerir una presentación nueva sobre un tipo de calificación existente.

🔶 **Juicios pedagógicos por confirmar con la docente:** para 1.° convendría decidir si el objetivo ING-1-04 incluye solo reconocer *hello*, *hi*, *good morning* y *goodbye*, o también presentarse, preguntar por una mascota y decir *nice to meet you*. Las frases 2, 3 y 5 pueden ser largas para lectores iniciales. El referente usa las grafías “Good bye” y “Chhristian” en un globo; la voz y la pronunciación exacta aún no se comprobaron auditivamente. No convertir esas grafías ni nombres del referente en material propio sin revisión. Las opciones de imagen deben representar una sola respuesta inequívoca. Para WCAG 2.1 AA, cualquier adaptación necesita frases en HTML seleccionable, foco visible, botones utilizables con teclado, contraste de 4.5:1, `alt` informativo y una señal textual además de la mano animada; el audio debe poder repetirse.

La mecánica reconocible para estudiar en la siguiente fase es **diálogo por turnos, gesto breve para abrir el globo, voz ligada a cada intervención y cierre con repetición**. Los personajes, escenas, ilustraciones, textos de enseñanza y código serán propios. No se eligió ninguna de las tres opciones en este estudio.

## Adaptación aprobada (2026-11-21)

El usuario aprobó la opción 3: «escuchar y completar la respuesta del diálogo». Cinco turnos de `seleccion-multiple` con dos respuestas por turno y un punto por primera elección. Teresa y Christian son personajes ficticios del referente; Perry es el perro de Christian. Maca acompaña como guía de Inglés. La actividad conserva las seis voces originales y los efectos de toque, jugar, perro y música ya adaptados por Claude. Acierto, fallo y fin usan los efectos del quiz ilustrado. 🔶 La voz del título (`titulo.mp3`, «Greetings» según el inventario) y la consigna sin grabación deben escucharse en revisión.

El contrato agrega `presentacion: "dialogo"`, `dialogo.hablantes` (dos, izquierda y derecha, con `acompanante` opcional), `preguntas[].hablante`, `preguntas[].alResponder` opcional, `musica`, `audioTitulo`, `efectoToque` y `efectoJugar`. Todos son campos genéricos. El esquema exige que el hablante exista y que cada frase y opción tenga audio. El barajado usa el flujo existente `ordenesPreguntas(generador(semilla))`. La calificación y el repaso de `seleccion-multiple` no cambian. La presentación anterior se activa cuando no hay `dialogo`.

La secuencia muestra el globo del enunciado en HTML, lo lee al abrir el primer turno y permite repetirlo; tras elegir, marca el resultado, Maca cambia de pose, muestra la frase correcta en el globo del otro hablante y reproduce su voz. Esa frase pasa a ser el enunciado del turno siguiente sin nueva reproducción automática. El efecto del perro se declara en la pregunta cuyo resultado es «My dog's name is Perry.»: dos ladridos y movimiento breve. Música y efectos tienen controles independientes de la voz; la música baja durante la voz. Sin reloj. 🔶 La pertinencia de las frases largas para 1.° sigue por revisar con la docente.

**QA de la adaptación:** 224 pruebas de actividades y 19 de catálogo aprobadas; compilación y lint sin errores. La pantalla temporal `prueba.hello` permitió una partida completa con teclado (4/5) en tres tamaños sin desborde horizontal; se capturaron además `emociones-del-recreo` y `cuenta-las-silabas` como controles de la presentación anterior. El título intenta sonar al abrir; si el navegador impide la reproducción automática, queda el botón de escucha y la consigna usa `useLecturaAutomatica` en 1.°.
