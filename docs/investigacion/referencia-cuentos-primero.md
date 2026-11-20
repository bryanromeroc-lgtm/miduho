# Referencias para `cuento-de-la-quebrada` · Comprensión lectora · 1.° · LEN-1-04

Estudio del 20 de noviembre de 2026. **Observado**: inspección de tres páginas con REA 6.9.0 conectado al Chrome existente en `127.0.0.1:9333`; lectura del HTML servido de Mundo Primaria y del paquete local `L_G01_U04_L05` de Colombia Aprende. Las pruebas visuales incompletas se indican con 🔶. Se describen reglas e ítems con palabras propias; el relato de MIDUHO será original.

## 1. Mundo Primaria: «Los cuentos tradicionales»

[Página](https://www.mundoprimaria.com/juegos-educativos/lengua-lit-1-3) · juego `juegos-premium/9908`. El portal se atribuye a Mundo Primaria/Gesfomedia y el motor y los recursos vienen del mismo dominio; no se identificó un autor externo. La carga, el motor HTML/jQuery, las rondas aleatorias y las recargas por anuncios ya están documentados en [«antes y ahora»](referencia-mundoprimaria-antes-y-ahora.md) y [«emociones y sentimientos»](referencia-mundoprimaria-emociones-y-sentimientos.md). Aquí se anotan las diferencias. La ventana no permitió recorrer el juego con fiabilidad; se leyó el HTML servido, que incluye las seis rondas y su `data-accept`. No se bloquearon anuncios, pues en el precedente eso impedía iniciar el tablero. 🔶 No se midió el cierre en pantalla.

**Estructura y mecánica observadas en el documento.** No hay lectura ni narración previa del cuento. Cada ronda muestra un dibujo pequeño de un cuento, una pregunta sobre a qué cuento corresponde y tres rótulos para pulsar. `data-accept` señala un único rótulo correcto. El contador tiene seis rondas y `levelsOrder` las baraja. Un error marca el rótulo y suena; se puede elegir otro. El código desactiva el rótulo pulsado, acepta el correcto y avanza automáticamente unos 2 s después; la última ronda lleva a una pantalla de «volver a jugar». No hay puntaje numérico visible en los niveles. 🔶 La animación y el cierre no se comprobaron mediante una partida completa. El enunciado y las opciones están dentro de PNG: no son texto pedagógico seleccionable.

| ID | Dibujo descrito | Opciones (títulos) | Aceptada por `data-accept` | Elemento evaluado |
|---|---|---|---|---|
| `54204` | Grupo ante un castillo, con león y figuras de un viaje fantástico. | Caperucita Roja · Hansel y Gretel · El mago de Oz | El mago de Oz | Reconocer cuento por personajes/ambientación |
| `54205` | Personaje dormido en cama, acompañado por otra figura. | La bella durmiente · Blancanieves · Cenicienta | La bella durmiente | Reconocer personaje/escena |
| `54206` | Personajes de un mundo fantástico, entre ellos un conejo. | Alicia en el país de las maravillas · El mago de Oz · Blancanieves | Alicia en el país de las maravillas | Reconocer personajes/ambientación |
| `54207` | Tres cerditos y un lobo. | El gato con botas · Los tres cerditos · El mago de Oz | Los tres cerditos | Reconocer personajes |
| `54208` | Niño pequeño viajero con sombrero y botas. | Alicia en el país de las maravillas · Pinocho · Pulgarcito | Pinocho | Reconocer personaje |
| `54209` | Niño sobre una embarcación pequeña. | El sastrecillo valiente · Pinocho · Pulgarcito | Pulgarcito | Reconocer personaje |

Los dibujos son pistas visuales, no escenas de una historia contada en el juego. **Ninguna ronda evalúa de manera directa lugar, inicio, nudo, desenlace ni secuencia**; tampoco hay actividad final de ordenar. Esto contradice la descripción inicial del encargo y limita el valor de `9908` como modelo curricular. La mecánica transferible es **imagen + pregunta + tres respuestas + corrección inmediata + avance**.

## 2. Colombia Aprende: «Lectura de cuentos»

[Página del MEN](https://www.colombiaaprende.edu.co/contenidos-para-aprender/lectura-de-cuentos) · paquete `L_G01_U04_L05`, descargado previamente por Claude y servido en el visor local. REA inspeccionó el visor y sus marcos. Es contenido de Colombia Aprende; la actividad de lectura incluye el cuento **«Rulos» de Margarita Mainé**, con crédito editorial dentro del paquete, además de alusiones y fragmentos de cuentos tradicionales. No debe trasladarse ese relato a MIDUHO. La estructura del visor común está en [«sonidos y letras»](referencia-colombiaaprende-sonidos-y-letras.md).

**Secuencia observada en el paquete:** introducción con trabalenguas y personajes → objetivos de aprendizaje → video del cuento «Los rulos» → práctica de entonación con fragmentos de Caperucita Roja y Los tres cerditos → tono de voz → ordenar la trama de dos cuentos conocidos → lectura completa de «Rulos» → preguntas sobre estados de ánimo y acciones → socialización → preguntas abiertas sobre Caperucita → resumen de inicio, nudo y desenlace → tarea con Hansel y Gretel. Por tanto, **se lee/escucha antes de responder**, aunque el curso alterna otras prácticas de lectura. No es una pregunta por cada escena del cuento «Rulos».

### Inventario de actividades e ítems

Las preguntas se resumen para evitar reproducir la redacción o el cuento. «🔶» significa que el paquete muestra la consigna, pero no fija una respuesta automática o no se recorrió su pantalla final.

| Módulo | Ítems observados, opciones y respuesta | Imagen y elemento narrativo | Interacción / corrección |
|---|---|---|---|
| `03_02` Entonación | Dos fragmentos: Caperucita y uno de Los tres cerditos. Se escucha y se imita la lectura; no hay opciones ni respuesta única. | Texto y audio; voz/expresividad, no secuencia. | Reproducir el fragmento y leer. |
| `03_04/03_01` Trama de Caperucita | Tres imágenes se asocian a **inicio, nudo, desenlace**, una por casilla. Se ve: salida de la casa hacia la abuela → encuentro de la abuela con el lobo → reunión final de personajes en casa. El código acepta `Drag_1`→`Drop_1`, `Drag_2`→`Drop_2`, `Drag_3`→`Drop_3`. | Tres viñetas; secuencia y partes de la trama. | Arrastrar las tres etiquetas, «validar», marca verde/roja, efecto, opción de ver solución/reiniciar. |
| `03_04/03_02` Trama de Los tres cerditos | Mismo patrón de tres casillas. Viñetas: los cerditos ante sus casas → el lobo derriba una casa → los cerditos protegidos en la casa de ladrillo. Respuesta esperada: inicio → nudo → desenlace. | Tres viñetas; secuencia y partes de la trama. | Mismo patrón de envío conjunto. 🔶 No se cronometró el reintento. |
| `03_05` Lectura | Presenta íntegro «Rulos», atribuido a Margarita Mainé. No tiene pregunta en esa pantalla. | Texto narrativo; personajes, lugar familiar, conflicto y cierre. | Lectura previa a `03_06`. |
| `03_06` Estado de ánimo | Tres frases para elegir entre dos palabras cada una: un personaje con el gorro mojado, una adulta cuyo pelo se encrespa y otra figura que celebra parecerse a su familia. Banco visible: triste/asustado, preocupada/enojada, feliz/tranquila. El código declara claves `1,2,1`; 🔶 la correspondencia exacta de cada clave con el orden visual de los pares no se verificó jugando. | Tres retratos; inferencia de emoción y personaje a partir del cuento. | Radios y validación; 🔶 cierre y puntaje no comprobados. |
| `03_07` Acciones | Tres preguntas sobre «Rulos», representadas como tarjetas: qué hizo una adulta para alisarse el pelo (compró una plancha), quién usa hebillas (su hermana adulta), qué hace la niña para intentar formar un rulo (enrosca el pelo con el dedo). Otras dos pantallas preguntan qué hizo cada cerdito y por qué uno se siente así; son respuestas abiertas con imágenes. | Tarjetas ilustradas y escena de cerditos; acciones de personajes e inferencia emocional. | Se pulsa la imagen para revelar una respuesta en las tarjetas; las preguntas abiertas son para conversación. No se observó puntaje. |
| `03_08` Socialización | Tres preguntas abiertas sobre Caperucita: cómo empieza, qué ocurre con la abuela y cómo se siente la protagonista al final. Sin opciones ni clave digital. | Recuerdo del cuento; inicio, nudo, desenlace y emoción. | Conversar y escribir en el cuaderno; sin corrección automática. |
| `04_01` Resumen | Un personaje del cuento de los cerditos explica inicio, nudo y desenlace con ilustraciones. No son ítems calificados. | Estructura narrativa. | Avance por páginas. |
| `05_01` Tarea | Tras leer Hansel y Gretel: identificar a qué parte de la trama corresponde un fragmento (opciones inicio/nudo/desenlace; 🔶 el fragmento no quedó verificado), recordar cómo evitan perderse (piedras o migas, según el momento del cuento; 🔶 texto concreto no confirmado) e inferir un estado de ánimo ante la bruja (🔶 respuesta abierta). | Trama, acción e inferencia. | Trabajo posterior; 🔶 calificación y cierre no observados. |

En el ejercicio de arrastre, el código compara tres destinos, muestra una respuesta correcta/incorrecta durante aproximadamente 2,5 s y habilita reinicio; tras fallo ofrece solución. Esa cifra proviene del código de interacción, **no** de una medición visual. El visor no muestra un puntaje global en los materiales examinados 🔶. La parte valiosa para `LEN-1-04` es leer primero, ordenar tres momentos y luego preguntar por acción y emoción del personaje.

## 3. Árbol ABC: «Zoológico»

[Página observada](https://arbolabc.com/lectores-emergentes/zoologico). REA inspeccionó la página React sin registro ni pago. El texto público del propio sitio la titula **«Zoológico: sílabas»** y explica que se ordenan sílabas para formar nombres de animales mientras un perro recoge huesos y esquiva obstáculos. Declara como objetivos reconocer sílabas y formar palabras. La autoría visible del portal es Rainbow Tree Inc./Paola Artmann; 🔶 la autoría del minijuego incrustado no se aisló. La zona del juego no entregó preguntas de cuento accesibles en la inspección.

**Descarte para este encargo:** no se observa lectura narrada página a página, resaltado del texto ni preguntas de comprensión al final. No hay ítems de personaje, lugar o trama que inventariar; opciones, respuestas, reintentos, puntaje y final del minijuego quedan 🔶 sin observar. La página permite ver un botón «Más grande» y volver, pero su descripción solo sustenta una mecánica de sílabas. No se registró ni se pagó.

## Comparación con MIDUHO y decisión de tipo

El [catálogo del programa](../../openspec/changes/juegos-primero/tasks.md) prevé `aventura`, pero eso es una **intención**, no una validación del encaje técnico. El [tipo actual](../../apps/web/src/features/actividades/juegos/aventura/tipo.ts) exige `carga`, `entrega`, `lugar` dentro de siete `LUGARES` fijos y usa `OBJETOS` y `visual`/`muestra` orientados al reparto; la [interfaz](../../apps/web/src/features/actividades/juegos/aventura/juego.tsx) muestra a Armi y su carreta y fija textos de entrega. Su ejemplo es [«La entrega de Armi»](../../apps/web/curriculo/actividades/matematicas/5/la-entrega-de-armi.json). Aunque admite `narracion`, `pregunta`, `opciones`, `pista`, `explicacion` y `audio` por escena, **no sirve sin cambios para un cuento con Bruno**.

`ordenar` con `casillas` ya evalúa una secuencia de tres imágenes con un envío, revelado por posición y teclado ([spec](../../openspec/changes/juegos-primero/specs/actividad-ordenar-casillas/spec.md)). `seleccion-multiple` ya admite imagen por pregunta, `alt`, imágenes por opción, audio y efectos; [«Cuenta las sílabas»](../../apps/web/curriculo/actividades/comprension-lectora/1/cuenta-las-silabas.json) demuestra a Bruno en el quiz ilustrado. Ninguno de esos tipos presenta por sí solo una historia con voz e ilustración distinta **por escena**.

| Opción propuesta | Ventajas | Costes y límites |
|---|---|
| **A. Generalizar `aventura`** con una variante narrativa (`fondo` por escena, guía Bruno, narración grabada, `visual` y carga opcionales, textos de avance genéricos). | Conserva el ciclo de escena, dos intentos, pista y explicación; coincide con la intención de historia interactiva. | Hay que separar la carreta y las reglas matemáticas sin alterar `la-entrega-de-armi`, actualizar esquema, interfaz y pruebas; una sola pregunta por escena puede interrumpir la lectura cada 2–3 frases. |
| **B. Tipo nuevo `cuento`**: lectura por escenas ilustradas y narradas, luego bloque de comprensión; posible pregunta intercalada configurable. | Modelo narrativo limpio y control del ritmo de lectura; admite una actividad final de secuencia integrada. | Más código y registro; debe reutilizar controles, voz, foco y calificación para no duplicar componentes. |
| **C. Quiz ilustrado existente**, con una imagen por pregunta y Bruno. | Menor cambio y evaluación ya disponible. | Reduce el cuento a preguntas; requeriría una lectura previa fuera del quiz y no da avance narrativo ni voz/ilustración por escena. |

**Conclusión técnica observada/inferida:** `aventura` **se confirma solo como familia de experiencia** (historia a pantalla completa), **se descarta como tipo listo para cargar el JSON del cuento**. La decisión entre A y B queda 🔶 para el paso de diseño. Por la referencia del MEN, **sí conviene proponer** una actividad final de ordenar tres momentos ilustrados y etiquetados como inicio, nudo y desenlace; Mundo Primaria `9908` **no** la tiene. 🔶 Su valor pedagógico y la cantidad de preguntas por escena o al final requieren revisión docente. Toda narración y pregunta deberá ser texto HTML seleccionable además de audio, con controles de reproducción, subtítulos/transcripción, `alt` útil, teclado, foco visible, contraste ≥4.5:1 y sin información que dependa solo del sonido o del color.

## Argumentos originales para elegir, no decididos

Cada opción plantea seis escenas cortas (dos frases por escena) y seis preguntas. Son **sinopsis propuestas**, no guion final ni texto tomado de las referencias. Las respuestas esperadas ayudan a juzgar si cada pregunta es literal o inferencial. 🔶 Una docente y, para las figuras de tradición oral, una revisión cultural deberían validar dificultad y tratamiento antes de escribir el cuento.

### Opción 1: «La piedra que cantaba»

**Personajes:** Bruno como guía y personaje, una mirla y una Madremonte amable. **Lugar:** quebrada junto a un bosque andino. **Inicio:** la quebrada suena distinto. **Nudo:** una piedra tapa parte del agua y los animales no saben por dónde pasa. **Desenlace:** observan, despejan el paso con cuidado y vuelve el sonido. 🔶 La Madremonte tiene versiones diversas en la tradición; presentarla como cuidadora amable y sin susto es una reinterpretación que debe validarse.

| Escena | Tramo propuesto (dos frases cortas) | Pregunta y respuesta esperada |
|---|---|---|
| 1 | La mirla llega a la quebrada al amanecer. El agua canta entre las piedras. | ¿Dónde llega la mirla? → A la quebrada (literal, lugar). |
| 2 | Bruno escucha un sonido muy suave. La mirla mira el agua y nota que baja poco. | ¿Qué cambió en el sonido? → Se volvió suave (literal, inicio). |
| 3 | Una piedra grande tapa un lado del paso. El agua busca otro camino. | ¿Qué tapa el paso? → Una piedra (literal, nudo). |
| 4 | La Madremonte les pide mirar antes de mover nada. Los animales ven una ranita junto a la piedra. | ¿Por qué miran antes de moverla? → Para cuidar a la ranita (inferencial, acción). |
| 5 | La ranita salta a un lugar seguro. Entre todos apartan ramas pequeñas y el agua pasa. | ¿Qué hicieron primero: mover las ramas o esperar a la ranita? → Esperaron a la ranita (literal, secuencia). |
| 6 | La quebrada vuelve a sonar fuerte. La mirla canta desde una rama. | ¿Cómo termina la historia? → El agua vuelve a pasar y sonar (literal, desenlace). |

### Opción 2: «El camino de las hojas»

**Personajes:** Bruno como guía y personaje, un colibrí, una danta de montaña y un Mohán amable. **Lugar:** sendero de una quebrada andina. **Inicio:** hojas de colores flotan. **Nudo:** el colibrí no sabe de dónde vienen y cree que una planta necesita ayuda. **Desenlace:** siguen las hojas, encuentran un árbol sano y comprenden que las hojas caen de forma natural. 🔶 El Mohán también tiene versiones inquietantes; su uso para 6 años y la fidelidad cultural requieren validación. Se puede sustituir por un animal si conviene.

| Escena | Tramo propuesto (dos frases cortas) | Pregunta y respuesta esperada |
|---|---|---|
| 1 | Un colibrí ve una hoja amarilla sobre el agua. Bruno lo acompaña por la orilla. | ¿Qué ve el colibrí? → Una hoja amarilla (literal, inicio). |
| 2 | Llegan más hojas y flotan río abajo. El colibrí pregunta de qué árbol vienen. | ¿Qué quiere saber? → De qué árbol vienen (literal, personaje). |
| 3 | La danta mira las ramas cercanas, pero no ve hojas amarillas. Los tres siguen la quebrada. | ¿Por qué siguen caminando? → Para encontrar el árbol (inferencial, nudo). |
| 4 | El Mohán les muestra una curva del agua. Allí hay muchas hojas juntas. | ¿Dónde están las hojas juntas? → En una curva de la quebrada (literal, lugar). |
| 5 | Encuentran un árbol alto junto a la curva. Algunas hojas caen despacio y otras siguen verdes. | ¿Qué encuentran antes de volver? → El árbol (literal, secuencia). |
| 6 | El colibrí comprende que el árbol está bien. Mira una hoja viajar y vuelve contento. | ¿Por qué se alegra al final? → Porque el árbol está bien (inferencial, desenlace). |

🔶 En ambas sinopsis, la plausibilidad de especies en esa quebrada y la lectura de emociones deben revisarse con la docente. Las preguntas inferenciales se apoyan en hechos explícitos para que no haya respuestas arbitrarias. Ninguna figura ni menor corresponde a una persona real.

## Inventario sonoro

Inventarios ya capturados por Claude: [`mundoprimaria-cuentos-tradicionales`](../../content/referencias/mundoprimaria-cuentos-tradicionales/inventario.json) y [`colombiaaprende-lectura-de-cuentos`](../../content/referencias/colombiaaprende-lectura-de-cuentos/inventario.json). **No se capturó, escuchó ni adaptó audio en este estudio.** Los IDs identifican pistas de referencia, no archivos listos para MIDUHO. Los eventos asignados por nombre y código son inferidos 🔶 cuando no hubo partida escuchada.

| Referencia | Evento de la interfaz | ID | Evidencia / límite |
|---|---|---|---|
| Mundo Primaria | Respuesta aceptada | `37a2061a` (`ok.mp3`) | Declaración y llamada `playerPlay('ok')`; 🔶 no escuchado. |
| Mundo Primaria | Respuesta rechazada | `5893ccb7` (`error.mp3`) | Declaración y llamada `playerPlay('error')`; 🔶 no escuchado. |
| Mundo Primaria | Avance tras ronda | `ba6b6c82` (`level_end.mp3`) | Declaración del motor; 🔶 no medido en partida. |
| Mundo Primaria | Cierre de seis rondas | `ca93af0d` (`game_end.mp3`) | Declaración del motor; 🔶 no observado en pantalla. |
| Colombia Aprende | Repetición oral del trabalenguas inicial | `c87e897a` (`…A01.mp3`) | El archivo aparece en las composiciones de introducción y el texto del trabalenguas está en el paquete. 🔶 No se puede confirmar que la grabación diga solo ese texto; transcripción literal pendiente de escucha. |
| Colombia Aprende | Escuchar fragmento de Caperucita | `0a0d13b6` (`…03_02_A01.mp3`) | El módulo `03_02` presenta dos fragmentos y dos audios. 🔶 La asignación A01→Caperucita se infiere del orden; el texto visible corresponde a una advertencia sobre el bosque, pero la transcripción exacta no se puede verificar sin escuchar. |
| Colombia Aprende | Escuchar fragmento de los cerditos | `7948b63a` (`…03_02_A02.mp3`) | Mismo módulo; 🔶 A02→cerditos inferido del orden. El texto visible describe la seguridad del personaje en su casa; transcripción literal pendiente de escucha. |
| Colombia Aprende | Validación incorrecta en ordenar trama | `ca9690d4` (`error.mp3`) o `81772d33` (`error.ogg`) | Dos formatos del mismo evento en las composiciones; el código reproduce `error`. 🔶 Diferencia acústica no escuchada. |
| Colombia Aprende | Validación correcta en ordenar trama | `57ffb8ad` (`success.mp3`) o `6ed6dfce` (`success.ogg`) | Dos formatos del mismo evento; el código reproduce `success`. 🔶 Diferencia acústica no escuchada. |
| Árbol ABC | — | — | No existe captura sonora entregada para esta referencia; la página observada no aporta un cuento ni eventos de comprensión. |

El paquete contiene más archivos sonoros que los siete del inventario de Claude; esta tabla se limita a **las pistas capturadas**. No hay música capturada en esos inventarios. Para un cuento propio harán falta narración nueva por escena y, si se decide, voces de preguntas; esas voces no pueden reutilizar los fragmentos ajenos porque el texto será diferente. 🔶 Licencia/uso de cualquier efecto de referencia debe comprobarse en su registro antes de adaptación posterior.

## Adaptación aprobada

El usuario aprobó el 2026-11-20 «La piedra que cantaba» como aventura narrada de 1.°: seis escenas con narración y pregunta de tres opciones, retroalimentación en dos intentos y un cierre que ordena tres momentos en Inicio, Nudo y Desenlace. El texto de narración, preguntas y opciones se incorporó literalmente al JSON de la actividad. Bruno guía con poses de reposo, acierto y duda; el relato y las opciones siguen en HTML seleccionable. La secuencia añade un séptimo ítem calificable por el primer envío. «La entrega de Armi» conserva su contenido y su interfaz clásica mediante los campos opcionales del tipo.

🔶 Las ilustraciones de las seis escenas y la portada están pendientes de Claude/Gemini. Sus rutas y textos alternativos ya están declarados en la actividad. 🔶 Las voces Gemini `es-419-tutor-3` están pendientes por agotamiento de cuota del modelo aprobado; el navegador ofrece síntesis mientras tanto. 🔶 La revisión docente y cultural de la Madremonte sigue pendiente antes del despliegue.
