# Referencia funcional: pasado y presente (Mundo Primaria)

> Estudio de la mecánica para `antes-y-ahora` · Ciencias sociales · 1.° · SOC-1-03. Fecha: 2026-11-17. Se usó REA 6.9.0 y Playwright conectado al Chrome con ventana que ya estaba abierto en `127.0.0.1:9333`. No se copió código ni material visual. 🔶 La exploración visual no llegó al final de los tres juegos; el HTML servido del Juego 3 permitió comprobar los seis pares y el cierre declarado. Los límites de la observación visual se detallan abajo.

## Fuente, acceso y construcción

- Página observada: <https://www.mundoprimaria.com/juegos-educativos/soc-hue-1-2>. El encabezado y el pie atribuyen el contenido a Mundo Primaria / Gesfomedia; los archivos del juego salen de `www.mundoprimaria.com/juegos-premium/`. El inventario sonoro fue filtrado a recursos de Mundo Primaria.
- Tras pulsar «ACEPTAR TODO», la página mostró tres botones: Juego 1 → `10061`, Juego 2 → `10068`, Juego 3 → `10070`. No se pagó ni se inició sesión.
- La interacción visible usa elementos HTML y fondos PNG, con clases de interacción `true_or_false_pairs`, `click` y `drag_and_drop`. En el Juego 3 se observó `ui-draggable` de jQuery UI. Los enunciados e ilustraciones de las rondas están dibujados en PNG; MIDUHO debe expresar toda pregunta como texto HTML seleccionable.
- Los tres juegos muestran contador `1 / 6`. El orden inicial de las rondas cambió al recargar Juego 1; no se puede afirmar que los seis enunciados aparezcan en orden fijo.

## Mecánica observada

| Juego | Ruta | Tipo que corresponde en MIDUHO | Disposición y acción observadas | Alcance comprobado |
|---|---|---|---|---|
| 1 | `10061` | `seleccion-multiple` (verdadero/falso) | Un enunciado por pantalla; tarjetas «VERDADERO» y «FALSO»; selección seguida de «CORREGIR». | Inicio y selección de la primera ronda. El contador muestra seis rondas. 🔶 No se verificaron corrección, avance ni cierre. |
| 2 | `10068` | Otro: selección de varios elementos por ronda | Seis ilustraciones en cuadrícula 3×2; instrucción inicial: marcar las cosas usadas cuando se era más pequeño. | Inicio de la primera ronda y contador de seis. 🔶 No se verificaron envío, aciertos ni cierre. |
| 3 | `10070` | `clasificar` | Dos recuadros verticales («PASADO», «PRESENTE») y dos objetos ilustrados para arrastrar. | Primera ronda completa; al ubicar ambas piezas se vio `2 / 6`. 🔶 No se llegó al cierre. |

En el Juego 3, la primera pareja observada fue **plancha antigua → pasado** y **plancha eléctrica → presente**. Al llevar la eléctrica a «Pasado», volvió a su posición inicial. Al poner cada plancha en su recuadro correcto, ambas quedaron en los recuadros y avanzó la ronda. No se observó un botón «Corregir» en esta modalidad. La captura `juego3-intento-fallido.png` muestra el intento equivocado durante el arrastre; 🔶 no prueba el aspecto final de la retroalimentación.

En el Juego 1 se vieron, en recargas distintas, «El pasado se refiere a las cosas que han sucedido antes.» (**verdadero**) y «El futuro se refiere a las cosas que suceden ahora.» (**falso**). La respuesta se infiere del contenido y de la clase de la opción correcta en el documento; 🔶 la pantalla de corrección no se pudo conservar. En el Juego 2 se vieron lavadora, automóvil, bicicleta infantil, cometa, sonajero y biberón. 🔶 No se verificó en pantalla qué conjunto acepta el juego.

## Límite de la observación

Durante los clics y arrastres, Playwright arrojó repetidamente `Execution context was destroyed, most likely because of a navigation`. En otros intentos `page.goto(...?path=juegos-premium/10061)` superó 30 s esperando `domcontentloaded`, aunque después el documento terminaba mostrando `1 / 6`. Un anuncio intersticial añadió `#google_vignette` a la URL; otros anuncios ocuparon la parte inferior del tablero. Al consultar el DOM durante algunas transiciones, `#levels_info` y `.level_container` no existían; tras reconectar aparecían de nuevo. Un intento automatizado de continuar desde `2 / 6` en Juego 3 terminó con `STOP 2 { n: NaN, ... objects: [] }` tras veinte consultas durante diez segundos, aunque una conexión posterior volvió a encontrar `2 / 6`. El Chrome existente quedó abierto.

El 17 de noviembre se instaló `context.route("**/*", …)` **antes** de volver a navegar a `?path=juegos-premium/10070`: se permitieron solo hosts `*.mundoprimaria.com`. La navegación completó, pero `#levels_info` quedó vacío y únicamente apareció `#level_container_6` con clase `visibility-hidden`; ese contenedor contiene el enlace «VOLVER A JUGAR», pero es una plantilla de cierre oculta, no una pantalla final observada. Un segundo intento permitió además `cdn.opencmp.net` y `fonts.googleapis.com` (CMP y fuentes); el resultado fue el mismo. Se bloquearon `cdntrf.com`, `pagead2.googlesyndication.com`, `www.googletagmanager.com`, `static.cloudflareinsights.com` y dos solicitudes a `d2wu036mkcz52n.cloudfront.net` cuya función no se comprobó 🔶. Ningún dominio adicional fue necesario para que cargara el documento principal; permitir CMP y fuentes no hizo iniciar el tablero. El Chrome con ventana quedó abierto.

Por ese límite, **no hay tiempos fiables de retroalimentación ni prueba visual del reintento o la pantalla final**. La lista completa de ítems y sus respuestas se obtuvo después del HTML servido del Juego 3. El documento del Juego 1 contiene una imagen «VOLVER A JUGAR» para su pantalla final, pero esa pantalla no se alcanzó 🔶. Las capturas comprobadas están en el scratchpad `codex-antes/rea/capturas/`; faltan capturas verificadas de acierto y final para cada juego 🔶.

## Comparación con MIDUHO

| Referente | Estado actual de MIDUHO | Decisión para `antes-y-ahora` |
|---|---|---|
| Juego 1: verdadero/falso con una oración por ronda | `tipos/preguntas.ts` admite dos opciones en `seleccion-multiple`; el quiz actual presenta una pregunta a la vez, muestra la correcta y una explicación. | Sirve como repaso verbal. El contenido y los botones ya son texto HTML; la presentación es distinta de las tarjetas del referente. |
| Juego 2: marcar varias de seis imágenes | El quiz actual registra una opción por pregunta. `clasificar` registra una categoría por elemento. | 🔶 Haría falta definir una respuesta de selección múltiple por ronda si se eligiera este juego. No conviene asumir que el tipo actual lo reproduce. |
| Juego 3: dos imágenes hacia «Pasado» / «Presente», con devolución inmediata del error | `clasificar` admite dos categorías, imágenes y `presentacion: "una-a-una"` o `"tablero"`. La primera muestra una pieza por vez; `juegos/agrupar` muestra todas las tarjetas y corrige juntas al enviarlas. `juegos/casillas` implementa `ordenar`: sus destinos son posiciones de secuencia, no categorías. | **Preferir `clasificar`** para la actividad: dos categorías, Pasado y Presente. Para que juegue como el Juego 3 observado, habría que añadir a este tipo una presentación por parejas: dos ilustraciones visibles por ronda, destinos fijos para ambas categorías, rechazo inmediato de cada ubicación equivocada, permanencia de la acertada y avance automático tras colocar las dos. No hace falta un tipo nuevo ni reutilizar `casillas`; `agrupar` ya resuelve la clasificación curricular, pero muestra todas las piezas y posterga la corrección hasta «Enviar respuestas». 🔶 Los tiempos exactos y el cierre quedan sin verificar. |

La etiqueta previa «Línea de tiempo» del catálogo no describe ninguna de las tres mecánicas observadas. Tampoco se observó una tarea de `ordenar`; la ficha pública menciona orden cronológico, pero los tableros vistos fueron verdadero/falso, selección y clasificación.

## Pares del Juego 3 leídos del HTML servido

En el HTML servido de `10070`, cada recuadro declara su categoría con `data-accept`. **PASADO** es el recuadro superior, rojo/rosado; **PRESENTE** es el inferior, turquesa. Las seis rondas contienen un objeto por categoría. La interfaz baraja su orden y las posiciones de las dos piezas.

| Ronda lógica | PASADO (`data-accept`) | PRESENTE (`data-accept`) |
|---|---|---|
| Locomotora | Locomotora de vapor | Tren moderno |
| Computador | Computador antiguo | Computador portátil |
| Plancha | Plancha de carbón | Plancha eléctrica |
| Televisor | Televisor de tubo | Televisor de pantalla plana |
| Teléfono | Teléfono de disco | Teléfono de teclas |
| Automóvil | Automóvil antiguo | Camioneta |

Los nombres en el contenido de MIDUHO usan vocabulario corto de Colombia; el emparejamiento y las categorías siguen los objetos del referente. La evaluación aprobada para MIDUHO conserva `clasificar`: **un punto por objeto si la primera ubicación es su categoría**, máximo 12. Tras dos fallos de una pieza, se autocoloca para evitar el atasco. 🔶 Este apoyo es una adaptación MIDUHO, no una conducta observada en el original.

## Inventario sonoro

Inventario recibido: `content/referencias/mundoprimaria-antes-y-ahora/inventario.json`. Claude comprobó por SHA-256 que **los Juegos 1 (`10061`), 2 (`10068`) y 3 (`10070`) sirven los mismos cuatro efectos** desde sus respectivas rutas `img/sounds/`. No se capturó ni adaptó audio en este encargo.

| Evento | Pista compartida | Evidencia |
|---|---|---|
| Acierto | `ok.mp3` · `37a2061a` | Correspondencia SHA-256 comprobada por Claude; en el Juego 3 se observó la petición de red tras un arrastre correcto. 🔶 No se midió cada acierto de los tres juegos. |
| Fallo | `error.mp3` · `5893ccb7` | Correspondencia SHA-256 comprobada por Claude; 🔶 no se registró el disparo durante el juego. |
| Fin de nivel | `level_end.mp3` · `ba6b6c82` | Correspondencia SHA-256 comprobada por Claude; 🔶 evento no observado. |
| Fin de juego | `game_end.mp3` · `ca93af0d` | Correspondencia SHA-256 comprobada por Claude; 🔶 evento no observado. |

La URL `https://www.mundoprimaria.com/juegos-premium/10070/img/sounds/ok.mp3`, registrada en el intento previo, corresponde al **mismo** efecto `37a2061a` del inventario, no a una pista nueva.
