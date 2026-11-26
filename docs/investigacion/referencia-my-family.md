# Referencia: «Meet Christian's Family» para `my-family`

**Estudio:** 25 de noviembre de 2026. **Actividad prevista:** Inglés · 1.° · ING-1-04 · tarea 3.14. **Fuentes:** [página de Árbol ABC](https://arbolabc.com/vocabulario-en-ingles/conoce-la-familia-christian) y [juego real E38ABC](https://arbolabcgames.top/E38ABC/). El juego se sirve desde el dominio de Árbol ABC; la página editorial le atribuye la actividad a Árbol ABC. **Método:** REA 6.10.1 y Chrome aislado en CDP 9333; lectura de los estados, prefabs y atlas mediante REA y `curl`; partida completa instrumentada con Playwright en otro Chrome. Las imágenes y scripts se usaron solo para analizar y se borraron del scratchpad al cerrar. El sonido ya estaba capturado por Claude: [inventario](../../content/referencias/arbolabc-my-family/inventario.json) y [resumen](../../content/referencias/arbolabc-my-family/RESUMEN.md). No se capturó audio en este estudio.

## Construcción y diferencia frente al motor conocido

Es Phaser 2 sobre un solo `canvas`, con atlas gráficos para oraciones y personajes; no hay texto pedagógico HTML seleccionable ni alternativa de teclado observada. El funcionamiento común del motor y su carga ya están documentados en [«Hello friends»](referencia-hello-friends.md) y [«Zoo de sílabas»](referencia-arbolabc-zoo-silabas.md). Aquí cambian `SentenceManager`, las dos tarjetas de `Card`, la retroalimentación, los tres tokens y el audio específico. El título, las ocho oraciones y el cierre están incrustados en imágenes. La voz se programa por marcador del sprite sonoro, no por una frase de texto del DOM.

**La mecánica observada es selección entre dos imágenes por oración, no emparejar.** En cada turno se lee/oye una oración y se toca uno de dos retratos: el correcto y un distractor. No se unen columnas, no se arrastra y no se clasifican elementos. La ficha `emparejar con audio` del [programa](../../openspec/changes/juegos-primero/tasks.md) describe una intención de adaptación, no el juego fuente.

## Ítems y distractores

El atlas muestra exactamente estas ocho oraciones. `SentenceManager` asigna una imagen correcta y un conjunto de siete imágenes equivocadas a cada una. En pantalla hay **dos tarjetas simultáneas** por turno, a aproximadamente 30 % y 70 % del ancho, ambas centradas a 35 % del alto; la oración queda abajo. El distractor visible se extrae al azar de los otros siete, incluida la imagen colectiva de familia, y la respuesta correcta se coloca al azar a izquierda o derecha. Por eso no hay una pareja fija de distractores por ítem.

| ID del atlas | Oración visible en inglés | Imagen correcta / rol | Distractores posibles (siempre se muestra uno) | Voz asociada |
|---|---|---|---|---|
| `sentence00` | “Hi! my name is Christian.” | `character04`, niño narrador | madre, padre, hermana bebé, abuela, abuelo, perro o grupo familiar | `character` |
| `sentence01` | “She is my mom.” | `character00`, madre | narrador, padre, hermana bebé, abuela, abuelo, perro o grupo familiar | `mom` |
| `sentence02` | “He is my dad.” | `character02`, padre | narrador, madre, hermana bebé, abuela, abuelo, perro o grupo familiar | `dad` |
| `sentence03` | “She is my baby sister.” | `character05`, hermana bebé | narrador, madre, padre, abuela, abuelo, perro o grupo familiar | `babySister` |
| `sentence04` | “She is my grandmother.” | `character03`, abuela | narrador, madre, padre, hermana bebé, abuelo, perro o grupo familiar | `grandmother` |
| `sentence05` | “He is my grandfather.” | `character01`, abuelo | narrador, madre, padre, hermana bebé, abuela, perro o grupo familiar | `grandfather` |
| `sentence06` | “This is my dog.” | `character06`, perro | narrador, madre, padre, hermana bebé, abuela, abuelo o grupo familiar | `pet00`; `pet01` después del acierto |
| `sentence07` | “This is my family.” | `character07`, grupo familiar | narrador, madre, padre, hermana bebé, abuela, abuelo o perro | `family` |

Los roles de la tabla se identifican por la relación entre oración e imagen del atlas; las **palabras audibles exactas** de cada pista quedan 🔶 por escuchar. Las ocho oraciones aparecen una vez por partida. `SentenceManager` mezcla la lista completa con Fisher–Yates usando `Math.random` al iniciar el nivel; una segunda partida dio otro orden. Los umbrales de tokens se aplican a **posiciones 2, 5 y 8 del orden mezclado**, no a grupos temáticos, aunque las variables internas se llamen `level1/2/3`. También cambia el fondo después del quinto acierto. En la partida comprobada salieron `sentence03`, `06`, `04`, `01`, `00`, `02`, `07`, `05`; los distractores visibles fueron, respectivamente, madre, madre, madre, abuelo, madre, madre, madre y madre. Esa concentración fortuita no es una regla: el código sortea entre siete candidatos.

## Secuencia, tiempos y error

1. El menú reproduce `title` (marca de **3,10 s**); entonces aparece «Jugar» con fundido de **350 ms**. Al pulsarlo suena `btnNavigation` y se abre el nivel.
2. En el nivel arranca la música de fondo y la voz `prompt` (**4,181 s** declarados). Las dos tarjetas aparecen enseguida con fundido de **350 ms**. La primera oración aparece y se pronuncia al terminar `prompt`, cerca de **4,18 s**; el toque se habilita cerca de **5,18 s**. No hay límite de tiempo.
3. Cualquier toque aceptado produce `btnSelection`. Si se elige el distractor, su retrato oscila brevemente (de −5° a +5°, dos ciclos de **60 ms**) y suena `effectError` (**0,891 s**). Tras ese efecto se habilita de nuevo el toque; permanecen la misma oración, el mismo distractor y la misma posición. En la partida, el reintento llegó **0,90 s** después. No se observa una penalización visible ni un contador de fallos; el seguimiento del motor incrementa un contador únicamente en `correctAnswer()`. 🔶 Ese seguimiento externo no equivale a una nota pedagógica verificable.
4. Al acertar, el retrato correcto se mueve al centro en **350 ms**, el otro se oculta en **350 ms** y suena `effectCorrect` (**1,609 s**). Si la oración era la del perro, a continuación suena `pet01` (**0,682 s**), con una pausa adicional de **0,5 s**. En los aciertos 2, 5 y 8 suena `effectTokens` (**2,5 s**) y se revela uno de tres iconos en la esquina superior derecha. Luego suena una de cuatro felicitaciones elegida al azar; tras **1 s** cambia la oración. La nueva oración tarda **350 ms** en sustituir a la anterior. El siguiente toque se habilita **1,5 s** después del cambio programado. En la partida, el intervalo entre toques correctos ordinarios fue aproximadamente **4,8–5,2 s**, y con token **7,6–8,4 s**.
5. Tras el octavo acierto y el tercer token, el cierre se revela con una máscara circular que crece **20 unidades por cuadro**, luego se detiene la música del nivel y abre la pantalla final. Allí suenan `finalMusic` y `finalPrompt`; hay un botón de repetir que reinicia el nivel completo y mezcla de nuevo los ítems. La pantalla muestra «muy bien!» como parte de una imagen. No muestra porcentaje, estrellas de calificación ni desglose de errores. Los tres iconos funcionan como hitos de progreso, no como premio por precisión: incluso tras un fallo y reintento se obtienen.

Los tiempos de audio son los marcadores del juego, no la duración redondeada de los MP3 de Claude. Las medidas de partida incluyen variación de cuadros y carga. El juego permite reintentos ilimitados; no revela la solución automáticamente.

## Nombres propios y alcance de los datos

**Observado:** «Christian» aparece en el título gráfico inglés, en `sentence00` y en el título de la página; la voz `character` se dispara con `sentence00` y `title` con el título. 🔶 Falta escuchar esas voces para asegurar si ambas pronuncian el nombre. El perro aparece sin nombre en este juego. «Teresa» figura en la información editorial de Árbol ABC sobre la familia de la autora, según la página citada en el encargo; **no aparece entre los ocho ítems ni en las imágenes de personajes examinadas**. 🔶 Esa información editorial no permite determinar la edad actual ni el carácter ficticio o real de los personajes. Por la regla de MIDUHO sobre datos de menores, ninguna adaptación debería trasladar los nombres personales del referente. **Propuesta sin decisión:** reemplazar el narrador por «I» o «my brother» según la actividad que se escoja; describir los demás por roles. Las pistas `character` y posiblemente `title` no servirían si conservan el nombre: su reutilización requiere escucha y decisión sobre voz propia.

## Inventario sonoro

El inventario de Claude contiene **26 entradas: tres archivos originales y 23 cortes**. Esta tabla enlaza **evento → ID del corte** según las llamadas del juego. La asociación de llamada es observada; el contenido audible y la licencia documental siguen 🔶. Los tres archivos originales (`022ed13e`, `9eb2de00`, `0d4631f8`) son contenedores, sin evento independiente.

| Evento del juego | ID de pista de Claude | Relación con texto / momento |
|---|---|---|
| Menú: título | `9eb2de00-title` | Acompaña el gráfico “Meet Christian's Family”. 🔶 Verificar voz y nombre audible. |
| «Jugar» | `022ed13e-btnNavigation` | Al pulsar el botón del menú; repetir desde el final no llama esta pista. |
| Música durante el nivel | `022ed13e-backgroundMusic` | Bucle al entrar; se detiene antes del cierre. |
| Consigna inicial | `9eb2de00-prompt` | Suena antes de la primera oración; **no hay consigna textual en el canvas**. La página editorial da «haz clic en el miembro de la familia de Christian que corresponde a la oración en inglés». 🔶 No afirmar que la voz dice literalmente eso sin escucharla. |
| Mostrar y leer cada oración | `9eb2de00-character`, `9eb2de00-mom`, `9eb2de00-dad`, `9eb2de00-babySister`, `9eb2de00-grandmother`, `9eb2de00-grandfather`, `9eb2de00-pet00`, `9eb2de00-family` | En el orden barajado de la tabla de ítems. `character` corresponde al texto “Hi! my name is Christian.”; `family` a “This is my family.” La voz arranca cuando aparece la oración. 🔶 Las transcripciones exactas y el nombre audible requieren escucha. |
| Tocar cualquiera de las dos tarjetas | `022ed13e-btnSelection` | Antes del efecto de acierto o error. |
| Acierto | `022ed13e-effectCorrect` | Se reproduce al centrar la imagen correcta. |
| Oración del perro, después de acertar | `9eb2de00-pet01` | Segundo marcador del ítem, **después** de `effectCorrect`; `pet00` es la voz asociada a “This is my dog.” al aparecer la oración. 🔶 Confirmar por escucha si `pet01` es ladrido. |
| Error | `022ed13e-effectError` | Oscilación y reintento de la misma pareja. |
| Token tras los aciertos 2, 5 y 8 | `022ed13e-effectTokens` | Un corte por cada revelado de icono. |
| Felicitación tras cada acierto | `0d4631f8-congratulate0`, `0d4631f8-congratulate1`, `0d4631f8-congratulate2`, `0d4631f8-congratulate3` | Una variante aleatoria por acierto, después del efecto de acierto y, si corresponde, del token. 🔶 Contenido audible por escuchar. |
| Pantalla final | `022ed13e-finalMusic` y `9eb2de00-finalPrompt` | Música en bucle y voz al abrir el cierre. El gráfico dice «muy bien!», pero 🔶 falta confirmar si `finalPrompt` pronuncia esas palabras. |

La licencia del inventario conserva el marcador por completar; el [resumen sonoro](../../content/referencias/arbolabc-my-family/RESUMEN.md) registra permiso declarado y soporte escrito pendiente 🔶. Ninguna pista se adaptó ni se copió a `apps/web/` en este encargo.

## Contraste con MIDUHO y opciones para la fase de diseño 🔶

| Presentación existente | Qué ya resuelve | Distancia respecto del referente |
|---|---|---|
| `seleccion-multiple` con `imagenesOpciones` (quiz ilustrado de `emociones-del-recreo`) | Pregunta con voz, dos opciones posibles, una imagen por botón, barajado por semilla, respuesta y calificación; Maca cabe en `escena.personaje`. | Es la correspondencia funcional más cercana. La versión común revela la correcta de inmediato, puntúa el primer intento y espera «Siguiente»; el referente conserva la misma pareja tras un error y avanza solo tras acertar. Necesitaría una escena familiar y voz por oración, y decidir cómo representar el reintento sin perder el registro evaluable. |
| `emparejar` en columnas o `cinta` | Relaciona texto/voz con imagen o texto, admite reintento y guarda primer intento. | Columnas muestra varias parejas simultáneas; `cinta` presenta tarjetas con imagen frente a fichas de texto. Ninguna reproduce las **dos personas candidatas por oración** ni la escena de familia. Para usarlo habría que cambiar deliberadamente la mecánica. |
| `dialogo` de `hello-friends` | Dos hablantes, globos HTML, voz, música y guía. | Modela conversación alternada entre dos hablantes, no elegir un miembro de un conjunto familiar. El contrato exige dos interlocutores con audio de respuestas. |
| `clasificar` | Piezas con imagen, categorías, voz y evaluación. | Requiere categorías estables; aquí una oración identifica un rol único entre retratos. Convertir roles en categorías cambiaría la tarea. |

El juego fuente **no es un `emparejar`**, por lo que la tarea 3.14 necesita una decisión posterior sobre el tipo de MIDUHO. En cualquier alternativa se requieren imágenes propias que representen roles sin nombres, una escena familiar coherente, Maca como guía, oraciones en HTML seleccionable, botones con foco visible y teclado, texto alternativo informativo, contraste ≥ 4,5:1 y control para repetir cada voz. Las voces originales que incluyan el nombre no se pueden aprovechar sin resolver esa incompatibilidad. No se ha diseñado ni construido la adaptación.

1. **Quiz ilustrado de dos retratos por ronda.** Mantiene lo más reconocible: oración, dos personas posibles, acierto que centra la respuesta y reintento tras error. 🔶 Requiere decidir cómo registrar primer intento y qué pistas ofrecer; podría necesitar una presentación específica sobre `seleccion-multiple`.
2. **Quiz ilustrado con escena familiar fija.** La escena muestra al grupo y se elige entre dos recortes o botones vinculados a sus integrantes. 🔶 Facilita contexto, pero el grupo completo podría revelar visualmente algunas respuestas y complicar la claridad en teléfono.
3. **Emparejar voz y rol en cinta o columnas.** Usa el tipo previsto en OpenSpec y permite varias asociaciones; una imagen por rol y voz de la oración. 🔶 Se aleja de la secuencia de dos opciones del referente; la voz larga y la imagen colectiva requieren validar qué se considera una pareja inequívoca.

**Juicios pedagógicos por confirmar 🔶:** el referente usa *mom*/*dad* y *grandmother*/*grandfather*, mezcla registros que conviene revisar frente a *mother*/*father* y *grandma*/*grandpa* para 1.°; *baby sister* agrega edad y parentesco en una sola expresión; incluir al perro como «miembro de la familia» puede ser valioso o desviar el objetivo ING-1-04; una sola composición de madre, padre y dos hijos no debe presentarse como modelo único de familia. La instrucción en español colombiano debería nombrar «integrante de la familia» o «persona de la familia», y tratar a la mascota por separado si se conserva. Debe decidirlo la docente, junto con la longitud de las oraciones y el uso de *my* en primera persona.

## Adaptación aprobada (25 de noviembre de 2026)

**Aprobado por el usuario:** quiz ilustrado `seleccion-multiple` con siete oraciones en inglés, dos retratos por pregunta y etiquetas de significado en español. Se omitió la oración de presentación personal y la voz del título. La primera elección da 1 punto si es correcta; el fallo revela la solución y requiere «Siguiente», según la calificación actual. Las preguntas y posiciones de opciones se mezclan con una semilla por partida.

**Construido:** `my-family.json` usa la presentación común de `emociones-del-recreo`, con `imagenesOpciones`, voz grabada por oración, efectos y música de la referencia, guía Maca con tres poses y consigna grabada con Gemini TTS. Se añadió soporte genérico para mostrar `escena.personaje` sin `imagen` de situación y música opcional con control independiente. El texto pedagógico y las etiquetas permanecen en HTML. Sin los campos opcionales, la presentación anterior conserva su flujo.

**Verificado:** se recibieron las siete ilustraciones cuadradas y la portada 16:9. Los retratos y Maca se revisaron en las capturas de 1920×1080, 1440×900 y 390×844; las dos opciones caben a 390×844 sin desborde horizontal. Se comprobó el control visual de `emociones-del-recreo` y `cuenta-las-silabas`. **Por confirmar 🔶:** los términos de uso de la voz Gemini y el soporte escrito de la licencia del audio de referencia antes de desplegar.
