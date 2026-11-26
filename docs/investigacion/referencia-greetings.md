# Referencia: «Hello and goodbye» para `greetings`

**Estudio:** 25 de noviembre de 2026 (Colombia). **Actividad prevista:** Inglés · 1.° · ING-1-01 · tarea 3.15. **Fuentes:** [ficha de Árbol ABC](https://arbolabc.com/vocabulario-en-ingles/hello-good-bye), [juego E35ABC](https://arbolabcgames.top/E35ABC/), [inventario sonoro de Claude](../../content/referencias/arbolabc-hello-goodbye/inventario.json). **Método:** REA 6.10.1 en Chrome aislado, CDP 9333; inspección de scripts y atlas, lectura de la lógica, y recorrido completo con Playwright sobre ese Chrome. Los datos gráficos y de código del análisis se borraron del scratchpad al cerrar. No se capturó audio. La ficha editorial aportada en el encargo dice que Lulú lleva al estudiante de safari. La pestaña del juego identifica «Rainbow Tree Inc - English Book - Hello and Goodbye»; el juego se sirve desde `arbolabcgames.top`. 🔶 Ese título y el dominio no bastan para resolver la titularidad de los recursos.

## Qué cambia respecto del motor ya estudiado

El motor Phaser 2 y la carga de atlas son los mismos descritos en [«Hello friends»](referencia-hello-friends.md) y [«My family»](referencia-my-family.md). Aquí la actividad es un **libro lineal de cinco páginas**. Cada página tiene dos momentos consecutivos: llegada y despedida. Hay un único animal por página, el mismo en ambos momentos; no se barajan páginas ni aparecen distractores. El carro cruza la foto del animal, el libro muestra una frase en un sprite gráfico y la voz correspondiente. Un icono de mano señala la flecha para avanzar cuando termina la voz. También se puede retroceder con la flecha izquierda y ajustar el volumen. No se observó texto pedagógico HTML, alternativa de teclado ni control de repetición de una frase.

| Página fija | Foto y frase al llegar | Frase al salir | Sonido del animal |
|---|---|---|---|
| 1 | Gorila · “Hello gorilla.” | “Goodbye gorilla.” | `animal1` |
| 2 | Guepardo · “Hello cheetah.” | “Goodbye cheetah.” | `animal2` |
| 3 | Elefante · “Hello elephant.” | “Goodbye elephant.” | `animal3` |
| 4 | Jirafa · “Hello giraffe.” | “Goodbye giraffe.” | `animal4` |
| 5 | Cebra · “Hello zebra.” | “Goodbye zebra.” | `animal5` |

El orden y las frases se verificaron en `book.pages` y en los diez fotogramas de texto del atlas; las fotos de los cinco animales se inspeccionaron. Los sonidos `animal1`…`animal5` siguen el orden de las cinco páginas. El valor `goodbaySound` del código es una errata en el identificador, no una palabra mostrada.

**Lulú:** la ficha editorial la nombra en la descripción del safari. En el juego se ve un ave roja caricaturesca con una flor que conduce el carro, por lo que **se infiere** que es Lulú 🔶; no es una persona ni uno de los cinco animales fotografiados. Su nombre no aparece en las diez frases, el título del atlas ni los scripts examinados. 🔶 La ficha editorial no pudo leerse como texto renderizado desde el sitio en esta sesión; la identificación por nombre depende de la descripción proporcionada en el encargo. MIDUHO usaría a Maca, la guacamaya guía de Inglés, sin trasladar ese personaje.

## Recorrido, tiempos y evaluación

1. El menú muestra la portada, reproduce `title` y ofrece una flecha de inicio. Al tocarla suena `btnClick` y empieza la primera página.
2. En cada llegada suena música de fondo desde la primera página y el motor del carro (`carMove`). El carro espera **1,0 s** y avanza durante **2,0 s** hasta detenerse; frena (`carBrake`), toca la bocina (`carHorn` solo en llegada), espera **0,6 s** y pronuncia “Hello” más el animal (`h*`). La frase entra en **1,5 s** y se colorea alrededor de **0,4 s** después de comenzar la voz. Al terminar la voz aparece la mano y se habilita avanzar. Tiempo hasta poder avanzar: aproximadamente **5–6 s** desde abrir la página, según la pista y los cuadros.
3. El primer toque en la flecha derecha suena `btnNavigation` y mueve el carro durante **3,8 s** dentro de la misma foto. Suena el animal (`animal*`), la frase de llegada se desvanece en **1,5 s** y aparece la despedida tras una espera de **1,0 s** y otro fundido de **1,5 s**. Al frenar suena `carBrake`, espera **0,6 s** y pronuncia “Goodbye” más el animal (`g*`); no hay bocina. Tras la voz vuelve la mano y se habilita la flecha. Tiempo hasta poder avanzar: alrededor de **6–7 s** desde el toque.
4. El segundo toque derecho suena `btnNavigation`, hace salir el carro y, después de **2,2 s**, abre la siguiente página, que repite la llegada. La navegación es manual, sin reloj ni presión de tiempo. El recorrido con Playwright comprobó las cinco páginas y ambos momentos; los tiempos anteriores son de las duraciones y esperas declaradas en la lógica, redondeados al comportamiento visible. 🔶 No se hizo una medición audiovisual cuadro por cuadro de cada transición.
5. Tras la despedida de la cebra, la misma salida conduce a una hoja final con el carro y “The End”. La hoja aparece tras **1,0 s** de espera y **1,5 s** de fundido; `theEnd` suena **1,2 s** después de entrar. Al terminar esa voz se habilita una flecha circular para repetir, que usa `btnClick` y vuelve al menú. La partida observada llegó a esa pantalla.

**No hay decisión correcta/incorrecta.** El estudiante solo inicia, avanza, retrocede o ajusta volumen. No hay pregunta, distractor, rechazo, pista, penalización ni nota. `trackingObj.correctAnswer()` se llama automáticamente al pronunciar el saludo de llegada, sin comprobar una respuesta del estudiante; por tanto, el seguimiento interno no constituye evaluación. El tipo `emparejar con audio` de la tarea 3.15 es una intención de MIDUHO, **no** la mecánica del referente.

## Inventario sonoro

El [resumen de Claude](../../content/referencias/arbolabc-hello-goodbye/RESUMEN.md) registra **25 entradas: 2 archivos fuente y 23 cortes**. Los dos originales son contenedores, no eventos adicionales. La tabla vincula las llamadas del juego con los IDs de los cortes. Los roles «error» que el inventario asignó por inferencia a `animal1`…`animal5` se corrigen aquí: el código los dispara durante la salida del carro, sin error posible. **`h*` corresponde a hello y `g*` a goodbye**, por las llamadas `playHelloPrompt`/`playGoodbyePrompt` y su relación con el texto visible. 🔶 El contenido fonético exacto, el acento y la calidad de cada corte requieren escucha humana; los IDs y las frases gráficas no sustituyen una transcripción.

| Evento | ID de pista del inventario |
|---|---|
| Portada: voz del título | `4ef323f1-title` |
| Empezar y repetir desde el final | `f2fcf41d-btnClick` |
| Música durante el libro | `f2fcf41d-backgroundMusic` |
| Avanzar o retroceder | `f2fcf41d-btnNavigation` |
| Carro en movimiento, llegada, despedida y salida | `f2fcf41d-carMove` |
| Cada parada | `f2fcf41d-carBrake` |
| Parada de llegada, antes de “Hello” | `f2fcf41d-carHorn` |
| Gorila: llegada / despedida / sonido del animal | `4ef323f1-hGrilla` / `4ef323f1-gGrilla` / `f2fcf41d-animal1` |
| Guepardo: llegada / despedida / sonido del animal | `4ef323f1-hCheeta` / `4ef323f1-gCheeta` / `f2fcf41d-animal2` |
| Elefante: llegada / despedida / sonido del animal | `4ef323f1-hElephant` / `4ef323f1-gElephant` / `f2fcf41d-animal3` |
| Jirafa: llegada / despedida / sonido del animal | `4ef323f1-hGiraffe` / `4ef323f1-gGiraffe` / `f2fcf41d-animal4` |
| Cebra: llegada / despedida / sonido del animal | `4ef323f1-hZebra` / `4ef323f1-gZebra` / `f2fcf41d-animal5` |
| Hoja final: voz | `4ef323f1-theEnd` |

Las pistas de voz están **asociadas** a frases que incluyen el nombre inglés del animal, no solo a la palabra *hello* o *goodbye*. 🔶 Sin escuchar los diez cortes no se puede asegurar que cada voz pronuncie el nombre ni que sirva tal cual. Si se conservaran los cinco animales y esas frases, la relación pista–ítem es coherente; si se cambia a fauna colombiana o a saludos sin nombre de animal, estas voces no cubrirían el nuevo texto. No se adaptó ninguna pista en este encargo. La licencia del inventario registra permiso declarado y soporte escrito pendiente 🔶.

## Encaje en MIDUHO: opciones para diseñar después 🔶

| Presentación existente | Encaje y límite |
|---|---|
| `seleccion-multiple` ilustrado | Admite dos imágenes por pregunta, voz, música, guía Maca sin imagen de situación y `barajarPreguntas`. Es la base más directa para una respuesta evaluable por turno. El acierto y el fallo actuales revelan la solución tras la primera elección y requieren «Siguiente», distinto del libro sin respuestas. |
| `dialogo` de `hello-friends` | Resuelve turnos de dos hablantes con voz; aquí habla un solo viajero al animal, sin respuesta de este. Dos interlocutores obligatorios falsearían la escena. |
| `emparejar` en columnas o `cinta` | Permite audio y pares, pero el objetivo hello/goodbye ofrece solo **dos significados repetidos** para diez momentos; el esquema exige valores de derecha únicos. Emparejar voz con cinco fotos mediría sobre todo nombres de animales. `cinta` añade una imagen por tarjeta, pero no resuelve esa ambigüedad. Se descarta como ajuste directo del objetivo ING-1-01. |
| `clasificar` (incluida presentación `parejas`) | Dos categorías Hello/Goodbye y tarjetas ilustradas de llegada/salida caben en el contrato existente; `parejas` admite una imagen de cada categoría por ronda. Exige escenas propias inequívocas: una foto estática del animal no distingue llegada de despedida. |
| `aventura` | Puede sostener el recorrido del safari con Maca, pero el recorrido lineal por sí solo no aporta una decisión evaluable. Habría que añadir preguntas o clasificación existentes. |

**Tres propuestas, ninguna elegida:**

1. **Escuchar y elegir llegada o despedida:** una pregunta de `seleccion-multiple` por voz; dos escenas ilustradas del mismo encuentro, carro que se acerca o se aleja. Conserva el ritmo voz–elección. Límite: hay que probar que la dirección se entienda sin depender solo del movimiento, y que el nombre del animal en la voz no distraiga del saludo.
2. **Clasificar escenas en Hello/Goodbye:** cinco pares de imágenes, uno de encuentro y otro de salida por animal, en `clasificar` con dos categorías. Permite comparar la misma situación en dos momentos y calificar diez decisiones. Límite: se pierde el paso narrativo de libro y el audio por tarjeta necesita una forma clara de repetirse.
3. **Quiz ilustrado después de cada página:** Maca acompaña un relato breve de llegada y salida; tras cada uno se elige entre dos frases visibles y audibles, “Hello …” / “Goodbye …”. Usa `seleccion-multiple` y conserva más del orden del libro. Límite: son diez turnos, con lectura adicional para 1.° y una transición de escena que la presentación genérica no ofrece por sí sola.

🔶 **Decisiones pedagógicas para la docente:** confirmar si el criterio es «decir hello cuando alguien llega y goodbye cuando se va» y si la distinción debe hacerse por escucha, por imagen o por ambas; decidir si cinco animales de safari ayudan al objetivo de saludos o si conviene fauna colombiana, sabiendo que cambiar animales deja sin correspondencia las voces originales; decidir si introducir *hi*/*bye* amplía demasiado el vocabulario frente al par *hello*/*goodbye*; y validar una consigna breve en español de Colombia, por ejemplo «Escucha y elige si Maca saluda al llegar o se despide al salir». La expresión y las ilustraciones finales serían propias de MIDUHO. Cualquier adaptación requiere frases HTML seleccionables, audio repetible, foco visible, teclado, alternativas textuales a la dirección del carro, contraste ≥ 4,5:1 y `alt` informativo en las escenas que determinan la respuesta.

## Adaptación aprobada

**Aprobada por el usuario el 25 de noviembre de 2026.** La actividad «Hello and goodbye» usa el quiz ilustrado existente de `seleccion-multiple`: diez preguntas, una por voz original de llegada o despedida de los cinco animales del referente. La pregunta muestra al animal, presenta la frase inglesa como texto HTML con voz repetible y ofrece dos escenas de respuesta, «Llega» y «Se va», con el carro de Maca. Las preguntas y las dos opciones se barajan con el flujo por semilla existente. Se obtiene un punto solo por la primera elección; el fallo revela la respuesta y permite avanzar. La calificación y el resumen son los del reproductor existente.

La nueva regla visual es genérica: dos opciones con imagen completa se muestran en tarjetas grandes incluso cuando hay imagen de situación. Los cuestionarios con tres o más opciones, o con alguna imagen de opción ausente, mantienen su disposición anterior. Maca reutiliza sus poses de reposo, señalamiento y duda; el reproductor sincroniza anticipación, acción, impacto y recuperación con los efectos grabados. La música tiene control propio. El texto pedagógico, las respuestas y el aviso son HTML; la imagen del animal tiene `alt` informativo en español y las imágenes de opciones tienen `alt=""` porque la etiqueta del botón da la respuesta.

**Audio contratado:** diez voces adaptadas por Claude en `/audio/actividades/greetings/`, música y fin de ronda de `greetings`, y acierto, fallo y fin de `parejas`. La consigna usa voz Gemini `es-419-tutor-3` generada solo para esta actividad. 🔶 La escucha humana de las voces y los términos de uso de la voz Gemini siguen por confirmar. **Imágenes contratadas a Gemini:** cinco situaciones de 1024×768 (`gorila`, `guepardo`, `elefante`, `jirafa`, `cebra`), opciones cuadradas de 512×512 (`llega`, `se-va`) y portada de 1280×720, todas WebP en `/images/juegos/greetings/`. Entregadas por Gemini el 25 de noviembre de 2026; se comprobaron las ocho dimensiones y se revisaron visualmente las ocho ilustraciones.
