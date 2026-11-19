# Referencia funcional: emociones y sentimientos (Mundo Primaria)

> Estudio para `emociones-del-recreo` · Ética y valores · 1.° · CIU-1a3-CP. Fecha: 2026-11-18. Observado con REA 6.9.0 y Playwright conectado por CDP al Chrome existente en `127.0.0.1:9333`; seis rondas por juego verificadas en el HTML servido. Los enunciados de abajo son **paráfrasis**, no material para copiar. 🔶 Los tiempos exactos y la pantalla final no se pudieron medir de forma fiable por las recargas publicitarias.

## Fuente, autoría y método

La [página del referente](https://www.mundoprimaria.com/juegos-educativos/natu-seh-1-4) ofrece **dos** botones: Juego 1 (`9033`) y Juego 2 (`9034`). El pie atribuye el portal a Gesfomedia; el motor, los estilos y los recursos de ambos juegos se sirven desde `mundoprimaria.com/juegos-premium/`. No se observó un proveedor externo del juego. La estructura, la carga de rondas y el problema de los anuncios se documentaron antes en [el informe «antes y ahora»](referencia-mundoprimaria-antes-y-ahora.md); aquí solo se registran las diferencias de contenido y mecánica.

REA inspeccionó la página abierta. El HTML de cada variante contiene `levelsOrder` y `htmlLevels` con **las seis rondas completas**, aunque el DOM visible carga pocas a la vez. Se contrastaron `data-accept` y `radio-correct` con los PNG de cada ronda y las opciones. La interfaz usa HTML para las piezas interactivas, jQuery/jQuery UI para el arrastre del Juego 1 y fondos PNG para **todo el enunciado y las fotografías**. Los textos de esos fondos no son seleccionables. El Juego 2 usa controles tipo radio ocultos y tarjetas ilustradas; un enlace con imagen sirve de botón de corrección. El orden de `levelsOrder` no coincide con el orden numérico de los identificadores y cambió entre cargas; las tablas se ordenan por identificador lógico, no por aparición.

## Mecánicas, disposición y ritmo

| Variante | Disposición y acción observadas | Juicio para el quiz |
|---|---|---|
| Juego 1 · `9033` | Fotografía a la izquierda, oración con hueco al centro y tres palabras en fila inferior. Se arrastra la palabra que nombra la expresión hacia el único recuadro (`data-accept`). La opción incorrecta no satisface ese recuadro. Contador de seis rondas y pantalla de «volver a jugar» declarada en el HTML. | **No** es un quiz de pulsar una opción: es completar mediante arrastre. `seleccion-multiple` solo cubriría el conocimiento, no la mecánica. |
| Juego 2 · `9034` | Una afirmación grande en la mitad superior; dos tarjetas «Falso» y «Verdadero» debajo, selección y control «Corregir». El radio marcado como correcto varía según la afirmación. Contador `1 / 6` observado. | **Sí** corresponde al quiz binario de `seleccion-multiple`. Es la referencia mecánica más cercana para 1.°. |

No se encontró reloj ni límite de respuesta en la interfaz o en los niveles declarados. En el Juego 2 se observó la selección y el paso del contador a `2 / 6` después de corregir una respuesta; también se cargó la ronda siguiente. 🔶 Una recarga publicitaria interrumpió el intento de recorrer las seis pantallas: no hay medida fiable en milisegundos de selección → marca → avance, ni comprobación visual de reintento, fallo o cierre. Los niveles declaran imágenes de acierto/error y sonidos para corrección; la ejecución de todos los eventos queda por confirmar. La pantalla final está en el documento, pero no se vio activada.

## Inventario de ítems: Juego 1

La consigna pide observar una foto y completar la emoción. Cada fila tiene **una** respuesta aceptada, indicada por `data-accept`; las otras dos palabras son distractores. Se describe la foto sin reutilizarla.

| Ronda | Fotografía descrita | Enunciado propio equivalente | Opciones visibles | Aceptada |
|---|---|---|---|---|
| `50008` | Menor asomándose por papel roto, ojos y boca abiertos. | Identificar la expresión de quien aparece. | sorpresa · asco · enfado | sorpresa |
| `50009` | Menor con brazos cruzados y ceño fruncido. | Identificar la expresión de quien aparece. | enfado · alegría · miedo | enfado |
| `50010` | Menor sentado sobre un balón, cabeza baja. | Identificar la expresión de quien aparece. | tristeza · enfado · sorpresa | tristeza |
| `50011` | Menor con vaso de leche, ojos cerrados y gesto de rechazo. | Identificar la expresión de quien aparece. | asco · miedo · alegría | asco |
| `50012` | Tres menores sonriendo y abrazándose, dos con pulgar arriba. | Identificar la emoción compartida del grupo. | alegría · sorpresa · tristeza | alegría |
| `50013` | Dos menores abrazados; uno mira con ojos y boca muy abiertos. | Identificar la expresión de la figura principal. | miedo · tristeza · alegría | miedo |

🔶 Las fotos `50008` y `50013` admiten lecturas distintas sin una situación: ojos y boca abiertos pueden expresar sorpresa o miedo. La de `50011` puede indicar asco o disgusto por sabor. El primer caso tampoco prueba una emoción interior a partir del rostro. Es un juicio pedagógico, no un cambio decidido.

## Inventario de ítems: Juego 2

No hay foto de situación en estas rondas: la afirmación misma está rasterizada en el fondo. Las dos opciones son siempre **Falso / Verdadero**; la clase `radio-correct` y la imagen asociada verifican la respuesta.

| Ronda | Afirmación parafraseada | Imagen | Opciones | Correcta |
|---|---|---|---|---|
| `50014` | Romperse un juguete causaría asco. | Solo texto sobre fondo gris. | Falso · Verdadero | Falso |
| `50015` | Encontrar por casualidad a un amigo causaría miedo. | Solo texto sobre fondo gris. | Falso · Verdadero | Falso |
| `50016` | Una comida desagradable causaría enojo. | Solo texto sobre fondo gris. | Falso · Verdadero | Falso |
| `50017` | Recibir un regalo inesperado causaría sorpresa. | Solo texto sobre fondo gris. | Falso · Verdadero | Verdadero |
| `50018` | Una película de fantasmas causaría miedo. | Solo texto sobre fondo gris. | Falso · Verdadero | Verdadero |
| `50019` | No sentirse escuchado causaría enojo. | Solo texto sobre fondo gris. | Falso · Verdadero | Verdadero |

🔶 Varias afirmaciones tratan una respuesta emocional como universal. Una película puede divertir o asustar; un encuentro casual puede sorprender; un alimento puede causar asco sin enojo; la pérdida de un juguete puede generar tristeza o enojo. Estas frases son especialmente frágiles como evaluación binaria en 1.°.

## Encaje con MIDUHO y recursos existentes

La tarea `3.6` de `openspec/changes/juegos-primero/tasks.md` y su spec proponen `seleccion-multiple`. **Confirmado para el Juego 2**, descartado como descripción mecánica del Juego 1. `tipos/preguntas.ts` ya admite dos opciones, respuesta correcta y explicación por pregunta; `reproductor/juegos-preguntas.tsx` presenta una pregunta por pantalla, baraja opciones, califica la primera elección, anuncia la solución, ofrece «Siguiente» y usa texto HTML. El reproductor ya muestra «Escuchar» para la consigna y el enunciado y, si existen rutas, para cada opción. No hace falta un tipo nuevo para una versión verbal de verdadero/falso.

| Necesidad si se conserva la forma de la referencia | Estado actual / faltante |
|---|---|
| Enunciado como texto accesible | Ya existe. Hay que redactar contenido propio, con contraste y foco; nunca rasterizarlo. |
| Fotografía o ilustración **por pregunta** del Juego 1 | El esquema `Pregunta` no tiene `imagen` ni `alt`; el quiz tampoco presenta una. Habría que ampliar ambos si se elige esa variante. |
| Imagen por opción | Tampoco hay campo ni presentación; no se necesita para las dos opciones verbales del Juego 2. |
| Ciro en escena y poses | El quiz actual no tiene escena ni poses. `como-se-siente` ya ofrece `ciro-reposo.webp`, `ciro-senala.webp` y `ciro-duda.webp`; 🔶 habría que verificar si su encuadre sirve en el quiz. |
| Efectos por evento | El quiz actual no está cableado a estas cuatro pistas grabadas. En una fase posterior haría falta mapearlas sin duplicar efectos del reproductor. |

`como-se-siente.json` usa **clasificar** con doce emociones e imágenes propias. Se pueden reaprovechar sus ilustraciones y voces de **feliz, tranquilo, orgulloso, agradecido, seguro, entusiasmado, triste, enojado, asustado, preocupado, avergonzado y celoso** cuando una opción o un apoyo visual diga exactamente esa palabra. Las voces se encuentran en `/audio/actividades/como-se-siente/`; sus imágenes en `/images/juegos/como-se-siente/`. La consigna grabada de esa actividad habla de llevar emociones a grupos y pulsar «Enviar respuestas», de modo que **no sirve** para este quiz. «Alegría», «sorpresa», «asco» y «miedo» del referente no tienen archivo homónimo; «feliz»/«alegría» y «asustado»/«miedo» no son audios intercambiables para una lectura literal. La portada existente identifica el juego anterior, no esta actividad. Ciro es la guía de Ética y valores según `src/lib/guias.ts`.

## Juicios pedagógicos y opciones de contenido 🔶

Todo lo siguiente está **propuesto, no decidido**. Usar «emociones agradables/desagradables» cuando haga falta clasificar su vivencia, evitando «positivas/negativas». Preferir **enojado** a «enfadado» en español de Colombia. Dar contexto antes de atribuir una emoción a un rostro y no convertir una reacción posible en la única reacción válida. Situar el aprendizaje en un recreo de colegio colombiano con roles («un compañero», «una compañera», «el grupo»), sin inventar nombres de menores.

1. **Original depurado:** conservar seis preguntas binarias del Juego 2, reescritas para que cada afirmación tenga una situación clara y una única respuesta defendible; mantener la disposición de dos tarjetas.
2. **Selección reducida:** elegir de seis a ocho preguntas de reconocimiento y convivencia, mezclando las tres afirmaciones menos ambiguas con situaciones nuevas y explicaciones breves. El esquema actual permite hasta doce.
3. **Recreo reescrito:** seis a ocho escenas breves de recreo en Madrid, Cundinamarca, con Ciro y opciones emocionales verbalizadas; conserva el ritmo de una pregunta por pantalla, pero el contenido es propio y permite evaluar empatía y contexto. 🔶 Si cada escena requiere ilustración informativa, habrá que añadir `imagen` y `alt` por pregunta.

## Inventario sonoro

Fuente: `content/referencias/mundoprimaria-emociones-y-sentimientos/{inventario.json,RESUMEN.md}` de Claude. Son **cuatro efectos** idénticos por SHA-256 a los de «antes y ahora», ya disponibles en `/audio/juegos/parejas/`; no se capturó ni adaptó audio aquí. El inventario etiqueta algunos eventos como inferidos, incluido un segundo «acierto» que el nombre del archivo revela como error; la tabla usa la función que declaran las rutas `ok`, `error`, `level_end` y `game_end`. 🔶 El disparo exacto de cada pista en ambos juegos no se comprobó auditivamente ni en todas las transiciones.

| Evento | ID del inventario | Ruta ya adaptada | Evidencia y límite |
|---|---|---|---|
| Corregir un acierto / pieza correcta | `37a2061a` | `/audio/juegos/parejas/acierto.mp3` | `ok.mp3` y marcador de corrección `64140.mp3`; la petición de red apareció tras jugar. |
| Corregir un fallo / pieza incorrecta | `5893ccb7` | `/audio/juegos/parejas/fallo.mp3` | `error.mp3` y marcador `64141.mp3`; 🔶 activación puntual no medida. |
| Cerrar una ronda | `ba6b6c82` | `/audio/juegos/parejas/fin-ronda.mp3` | `level_end.mp3`; 🔶 activación puntual no medida. |
| Terminar las seis rondas | `ca93af0d` | `/audio/juegos/parejas/fin.mp3` | `game_end.mp3`; 🔶 cierre no alcanzado visualmente. |

El inventario tiene **cero voces y cero música**. 🔶 La ausencia significa que no se capturaron pistas de esas clases; no demuestra que sea imposible que el sitio reproduzca una voz o música mediante otra carga. En los niveles inspeccionados no se encontraron referencias a voces ni bucles musicales. Para una versión MIDUHO harían falta grabaciones de: **consigna** del quiz, **seis a ocho enunciados** según el contenido elegido y las **dos opciones** «Verdadero»/«Falso» (o cada opción emocional si se adopta la tercera propuesta). Si se mostrara texto explicativo, convendría inventariarlo también para voz. De `como-se-siente` solo están listas las **doce etiquetas emocionales** citadas; no hay voz reutilizable de la nueva consigna ni de enunciados de recreo. No se generan voces en este encargo.

## Límites y alcance

Se verificaron los 12 ítems y sus respuestas en el HTML/PNG servidos, la disposición inicial de ambos juegos y el contador del segundo. 🔶 No se obtuvo una secuencia completa de seis rondas ni tiempos de animación/retroalimentación confiables: los anuncios recargaron el contexto durante la interacción. Las capturas temporales de REA, el HTML y los PNG de análisis se borraron al cerrar el estudio; el perfil de Chrome del usuario quedó abierto. No se copiaron código, textos, fotos ni personajes al proyecto.

## Adaptación aprobada

El usuario aprobó el 2026-11-18 «Emociones del recreo»: seis situaciones propias de recreo, una ilustración informativa por pregunta y tres caras de emociones como opciones. Se toca una opción, la primera elección cuenta y aparece una explicación en texto HTML. Ciro guía la escena con poses de reposo, señalar y duda. Se reutilizan las caras y voces de opciones de «¿Cómo se siente?»; siete frases nuevas (consigna y enunciados) ya están grabadas con `gemini-3.8-flash-tts`, voz `es-419-tutor-3`, en `/audio/actividades/emociones-del-recreo/`. Los cuatro efectos grabados vienen de `/audio/juegos/parejas/`. Claude entregó las seis ilustraciones de situaciones y la portada en `/images/juegos/emociones-del-recreo/`. La adaptación usa `seleccion-multiple` con `imagen`, `alt`, `imagenesOpciones`, `escena` y `efectos` opcionales; el detalle está en `specs/actividad-quiz-ilustrado/`. 🔶 La validación pedagógica docente de atribuir una emoción a cada escena sigue pendiente.
