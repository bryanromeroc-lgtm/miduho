# Referencia funcional: «Ordenar los meses del año» (Cokitos → Wordwall)

> Estudio de la **mecánica** para `los-meses-del-anio` (Ciencias sociales, 1.°, SOC-1-03). El audio procede del inventario previo de Claude; no se volvió a capturar. Las observaciones de REA y las capturas de pantalla se borraron al cerrar el estudio. Este informe no incorpora código ni recursos del referente.

- **Fecha:** 2026-11-17.
- **Herramientas:** REA 6.9.0 en Chrome aislado (CDP, puerto 9333) y Playwright para jugar y medir.
- **Páginas:** [ficha de Cokitos](https://www.cokitos.com/ordenar-los-meses-del-ano/) y [juego incrustado de Wordwall](https://wordwall.net/es/embed/5695a5e7f5954f169c38f6c5b0acbc84?themeId=44&templateId=50).

## Autoría y tipo (observado)

Cokitos remite a una actividad de **Wordwall**. El motor, la plantilla **«Orden correcto»** (`templateId=50`) y el tema de pizarra **«chalk»** (`themeId=44`) pertenecen a Wordwall; el contenido de la actividad pertenece a quien la publicó allí. El identificador interno de autor aparece en los metadatos, pero su identidad y permiso sobre el contenido no se confirmaron 🔶. La ficha prevista como tipo `ordenar` **sí corresponde a lo jugado**: se llevan meses mezclados a doce posiciones numeradas para reconstruir la secuencia anual.

## Cómo está construido (observado)

| Aspecto | Hallazgo |
|---|---|
| Render | Un único `canvas` para el juego; los nombres de los meses no figuran como texto accesible en el DOM. Motor propio de Wordwall 1.0.8. |
| Datos | Doce fichas de texto, una por mes, sin imágenes de contenido ni distractores adicionales. La secuencia solución es fija; la pila cambia de orden al reiniciar. |
| Pantalla | Fondo de pizarra. A la izquierda, pila de 2 columnas × 6 filas. A la derecha, doce casillas vacías numeradas, en dos columnas: 1.°–6.° y 7.°–12.°. Abajo, «Enviar respuestas»; arriba, cronómetro ascendente. |
| Interacción | Arrastrar una ficha desde la pila a una casilla. Al colocarla desaparece de la pila y la pila se recompone. La comprobación se hace al enviar. |
| Accesibilidad | El árbol accesible solo expone el `canvas` y el enlace de Wordwall. No se observó alternativa de teclado o lector para las fichas 🔶. |

## Mecánica observada y medida

1. **Portada:** título, instrucción de arrastrar y botón de inicio. Al iniciarlo aparecen las doce casillas; las fichas llegan con una transición de entrada de aproximadamente **5 s**. El contador empieza en 0:00 y **sube**. No se observó límite de tiempo 🔶.
2. **Colocación:** se levanta una ficha, se arrastra a una casilla numerada y se suelta. La ficha queda allí sin ✓, ✗ ni pista. La pila ocupa los huecos que van quedando. Probé «Abril» en 1.°: el juego lo aceptó provisionalmente y activó «Enviar respuestas».
3. **Envío anticipado:** el botón se habilita con **una sola ficha colocada**. Al pulsarlo con once casillas vacías, la partida terminó con **0/12**. Por tanto, el referente no exige completar el tablero antes de comprobar.
4. **Revelado:** tras enviar, el tablero se atenúa y marca lo colocado. «Abril» en 1.° recibió una ✗ roja; en otra partida, «Enero» en 1.° y «Febrero» en 2.° recibieron ✓ verdes y el contador pasó a 2. Las marcas aparecieron progresivamente; en el muestreo de dos aciertos, ambas estaban visibles hacia **1,6 s** desde el clic. Con una sola ficha, el cierre llegó aproximadamente **4–5 s** después del envío. Estas son medidas de interfaz con capturas cada ~0,4–0,5 s, no constantes extraídas del motor.
5. **Cierre y consulta:** «Juego completado» muestra puntuación sobre 12 y tiempo. Ofrece tabla de clasificación, «Mostrar respuestas» y reinicio. «Mostrar respuestas» abre dos vistas: **«Mis respuestas»**, con casillas vacías y marcas, y **«Respuestas correctas»**, con los doce meses en su posición. En el ensayo de una ficha equivocada, la puntuación fue 0/12.

### Ítems y generación

La actividad contiene únicamente los doce meses: enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre y diciembre. La solución sigue ese orden. La pila de la segunda partida apareció en un orden distinto al de la primera: **barajado al reiniciar (observado)**. No se necesita inferir distractores: cada ficha es uno de los doce elementos de la respuesta. 🔶 No se comprobó una regla para evitar barajados casi correctos ni una semilla reproducible.

## Retroalimentación y evaluación

| Referente observado | Brecha para evaluar con 2/1/0 🔶 |
|---|---|
| Acepta cualquier mes en una casilla y corrige al enviar; cada posición correcta suma 1 de 12. | Para distinguir 2 (primer intento), 1 (tras una pista) y 0 (tras dos fallos), hay que guardar los **intentos por posición o por decisión**. El puntaje final por posición del referente no contiene ese historial. |
| No da pista al equivocarse mientras se ordena. | Haría falta una pista basada en la secuencia (mes anterior/siguiente) después del primer fallo y mostrar la solución tras el segundo. Es una posibilidad pedagógica, no una decisión de diseño en este encargo. |
| Permite enviar con casillas vacías. | La calificación debe definir explícitamente qué vale una casilla vacía y cuándo termina la oportunidad; en la partida observada contó como 0. |
| Usa reloj ascendente y tabla de clasificación. | Un registro de aprendizaje necesitaría resultado por ítem y evitar comparaciones entre estudiantes. 🔶 El tratamiento del reloj corresponde al diseño posterior. |
| Todo el texto pedagógico vive en `canvas` y la interacción observada fue arrastrar. | MIDUHO exige texto HTML, foco visible, teclado y una alternativa de toque sin arrastre para cumplir WCAG 2.1 AA. |

## Encaje con MIDUHO (código revisado, sin modificar)

`tipos/relaciones.ts` ya registra `ordenar`: recibe una secuencia y puntúa **una parte por posición exacta**. Su esquema admite de **3 a 8 elementos** y crea un solo ítem (`orden`) con máximo igual a la longitud. La vista `reproductor/juegos-relaciones.tsx` muestra una **lista vertical** que se reordena con «Subir»/«Bajar», botón «Comprobar el orden» y marcas inmediatas para todas las filas. Esa lógica confirma que el concepto curricular encaja, pero **no alcanza para verse y jugarse como las doce fichas en pila + doce destinos del referente**. Tampoco admite doce meses, arrastre de fichas a casillas, envío con posiciones vacías, revelado progresivo ni historial de intentos para 2/1/0.

Las presentaciones `juegos/cinta` y `juegos/agrupar` muestran que el proyecto ya sabe construir tableros propios: `cinta` tiene portada, sonidos y transición de tarjetas, pero su mecánica es **emparejar una tarjeta con una ficha**; `agrupar` tiene pila, arrastre, alternativa por toque/teclado, «Enviar respuestas» y revelado por pasos, pero sus destinos son **categorías con cupos**, no posiciones 1.°–12.° Su estructura de interacción y revelado puede informar el trabajo posterior, sin cambiar el tipo de esta actividad. 🔶 La decisión entre ampliar `ordenar` con otra presentación o crear un tipo separado corresponde al siguiente encargo.

## Inventario sonoro

Fuente: `content/referencias/cokitos-meses-del-anio/{inventario.json,RESUMEN.md}`. Claude capturó **24 pistas**; no hay música en bucle identificada. La tabla vincula el evento observado con nombres del inventario. **La asociación precisa de cada reproducción es inferida por los nombres y el momento visual, no verificada por escucha ni por traza del mezclador 🔶.** Algunas pistas están precargadas y podrían no sonar durante esta actividad.

| Evento de la interfaz | Pista del inventario | Estado |
|---|---|---|
| Iniciar la partida | `chalkgameintro.ogg` | Inferido 🔶; la pista consta como «inicio». |
| Levantar una ficha | `chalktilepickup1–3.ogg` | Inferido 🔶; tres variantes. |
| Soltar una ficha en casilla | `chalktiledrop1–4.ogg` | Inferido 🔶; cuatro archivos distintos (el quinto URL repite el primero). |
| Pulsar «Enviar respuestas» / comenzar revelado | `chalkreveal.ogg` | Inferido 🔶. |
| Revelar una posición correcta | `chalkchipminorfast1–4.ogg` | Inferido 🔶; variantes de marca de acierto. |
| Revelar una posición equivocada | `chalkchipfailfast1–3.ogg` | Inferido 🔶; variantes de marca de fallo. |
| Cerrar el juego | `chalkgamesuccessful.ogg` | Inferido 🔶; se descargó al cierre, incluso con 0/12. «Successful» parece nombrar la finalización, no un puntaje perfecto. |
| Volver a empezar | `chalkgamerestart.ogg` | Inferido 🔶. |
| Entrar a menú / opción discreta | `chalkgamemenu.ogg`, `chalkgamemenusubtle.ogg` | Evento exacto sin confirmar 🔶. |
| Abrir tabla de clasificación | `chalkleaderboards.ogg` | Inferido 🔶; esa opción no se abrió en el ensayo. |
| Agotarse el tiempo | `chalktimeout.ogg` | Pista disponible; no se observó tiempo límite ni su reproducción 🔶. |
| Prueba del motor / desbloqueo breve | `test1.mp3`, `data-0.mp3` | No se asocian a una acción pedagógica; contenido por escuchar 🔶. |

## Qué se conserva y qué queda propio

Como referencia mecánica quedan la pila visible de doce fichas, las doce posiciones numeradas, la colocación libre, el envío y la revelación de cada casilla. MIDUHO tendrá que redactar su propia interfaz, usar recursos visuales propios y a **Andi, el cóndor**, guía de Ciencias sociales. El texto de los meses deberá ser seleccionable, legible y operable por teclado. Este encargo **solo documenta** la referencia; no fija aún la adaptación visual ni su implementación.
