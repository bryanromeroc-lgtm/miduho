# Referencia: sonidos no lingüísticos y sonidos de las letras

- **Fecha del estudio:** 2026-11-19.
- **Página de referencia:** [Colombia Aprende, lección L_G01_U01_L01](https://www.colombiaaprende.edu.co/contenidos-para-aprender/distincion-entre-sonidos-no-linguisticos-de-los-sonidos-de-las-letras).
- **Método:** REA conectado al Chrome compartido en `127.0.0.1:9333` (`list-browser-targets` e `inspect-web-page`); recorrido con Playwright por las 13 pantallas servidas en `127.0.0.1:8765`; lectura estática de los HTML y de las definiciones y acciones Adobe Edge del paquete sin conexión. Los scripts del paquete solo se ejecutaron dentro del navegador. Los datos de mecánica y respuestas provienen de sus acciones, no de una escucha de los MP3.
- **Autoría observada:** material de la colección «Contenidos para aprender» del Ministerio de Educación Nacional. La pantalla del paquete atribuye seis pistas a autores de Freesound y cuatro del resumen a Freesound/SoundBible; véase la tabla de licencias. 🔶 El permiso de reutilización de cada pista está pendiente de comprobación.

Para el funcionamiento común del visor, navegación y envoltura Adobe Edge, véase [el estudio previo de Colombia Aprende](referencia-colombiaaprende-seres-vivos-inertes.md). Esta lección tiene 13 pantallas HTML, algunas con varias láminas internas. La introducción es video; la actividad 1 y la tarea contienen subcomposiciones. El título general abarca más que la distinción inicial: vocales, consonantes, sílabas y lectura.

## Recorrido de las pantallas

`03_01` significa `L_G01_U01_L01_03_01.html`; la misma convención vale para las otras filas. **Expositivo** significa que hay clic para explorar, escuchar o pasar, pero ninguna respuesta que el paquete califique.

| Pantalla | Consigna, ítems y mecánica observados | Resultado y relación con el núcleo |
|---|---|---|
| `01_00` | Guía del usuario, navegación. | Expositiva. |
| `01_01` | Introducción en video MP4. | Expositiva; sin pista MP3 en el inventario. 🔶 No se transcribió el video. |
| `02_01` | Cuatro objetivos: distinguir expresiones lingüísticas, pronunciar vocales, pronunciar combinaciones y relacionar grafía con pronunciación. | Expositiva. |
| `03_01`, lámina 1 | Se escucha una vocal y se puede tocar la escena de un gato. Audio `A` y maullido `6c19c35b`. | Expositiva. |
| `03_01`, lámina 2 | «Escucha cada sonido y selecciona la imagen que corresponda». Diez botones para escuchar; diez imágenes arrastrables a diez casillas numeradas. Las cinco vocales se mezclan con campanas, oveja, silbato, risa y vaca. La correspondencia es uno a uno, descrita abajo. | **Núcleo cercano**, pero es emparejar sonido e imagen, no clasificar en dos categorías. `Validar` evalúa el conjunto; colorea casillas, muestra imagen de acierto/error y suena `success`/`error`. Tras fallo habilita `Solución` y `Reiniciar`; no se observó límite de reintentos ni nota persistente. |
| `03_02` | «Selecciona una vocal»: tocar una de A, E, I, O, U y escucharla; cinco audios cortos propios `03_02_A01`–`A05` además de los archivos A–U. | Exploración de vocales; sin regla de acierto encontrada. 🔶 La correspondencia exacta de cada `_A0y` con la vocal debe confirmarse oyendo. |
| `03_03` | «Haz clic sobre el icono y pronuncia cada vocal». La acción incluye lanzar un cubo y no carga voces de vocales en esta pantalla; sí referencia `success`/`error`. | Práctica oral de vocales; 🔶 no se encontró reconocimiento de voz ni condición comprobable para evaluar la pronunciación. |
| `03_04` | «Escucha los audios. Luego, arrastra la imagen al recuadro que corresponda». Dos láminas, tres pares por lámina. Imágenes: tijeras, maleta, color; luego reloj, pinturas, cuaderno. Audios `03_04_A01`–`A03` y `A04`–`A06`, respectivamente. | Emparejar palabra/sonido e imagen en el bloque de vocales, no separar clases de sonido. Cada lámina usa `Validar`, `Solución`, `Reiniciar`, marcas de casilla y `success`/`error`; no nota persistente. 🔶 La asociación de cada voz a cada imagen no está escrita como transcripción. |
| `03_05` | «Haz clic en los juguetes que sobresalen» y después en cada juguete. | Exploración de vocales y consonantes; sin respuesta correcta ni MP3 de ítem localizado. |
| `03_06` | «Escucha el audio de cada una de las combinaciones consonante-vocal». Rejilla de sílabas tocables: BA–BU y otras series hasta ZA–ZU, incluyendo QUE, QUI y ÑA–ÑU. | Exploración silábica; no se halló validación. Su audio es la serie de sílabas del inventario, no sonidos ambientales. |
| `03_07` | «Lee y escucha el siguiente texto. Luego, haz clic sobre los iconos». Una narración `03_07_A01`. | Lectura; expositiva. 🔶 El texto de esta lámina está principalmente incrustado en imágenes, por lo que no se pudo transcribir desde HTML. |
| `03_08` | «Escucha el audio del siguiente texto» y lee siete fragmentos de un relato ilustrado. Siete clips `03_08_A01`–`A07`. | Lectura; expositiva. El texto aparece en la definición HTML/Edge, pero 🔶 hay que escuchar los clips para asegurar que correspondan exactamente y en ese orden. |
| `04_01`, lámina 1 | Resumen: toca palabras destacadas y animales; suenan cuatro clips breves `04_01_A01`–`A04` y los sonidos `gato2`, `perros`, `pollitos`, `vaca2`. | **Núcleo conceptual:** muestra palabras frente a sonidos de animales. Es exploración, no clasificación puntuada. |
| `04_01`, lámina 2 | «Escucha el audio. Luego, selecciona la opción correcta». Seis opciones visuales: **gato**, **muuu**, **vaca**, **miau, miau**, **pollitos**, **pío, pío**. La acción marca como verdaderas las casillas 1, 4 y 6; las otras son falsas. | Selección múltiple validada con `success`/`error`, marcas por opción, `Solución` y `Reiniciar`. 🔶 La clave 1/4/6 mezcla el nombre «gato» con dos onomatopeyas y no expresa de manera clara una clasificación lingüístico/no lingüístico; requiere revisión pedagógica y auditiva antes de reutilizarla. |
| `05_01`, lámina 1 | Tarea: oír A, E, I, O, U y escribir la vocal en cinco campos. La clave codificada por campo es `o`, `u`, `i`, `a`, `e`. | Entrada de texto, `Validar`, `Solución`, `Reiniciar`, `success`/`error`. Es tarea de vocales. |
| `05_01`, lámina 2 | Selección/coloreado de letras de palabras, entre ellas las grafías `r m u c é l a g o i`. | Tarea sobre grafías; 🔶 no se observó una validación ni clave en esta subcomposición. |
| `05_01`, lámina 3 | «Escucha el audio del siguiente texto. Luego, completa las palabras con las vocales y consonantes que correspondan». Narración `05_01_A01`; cinco campos con claves `la`, `sa`, `to`, `mo`, `ri`. | Completar texto, `Validar`, `Solución`, `Reiniciar`, `success`/`error`; no es clasificación sonora. |

En las actividades validadas, la respuesta se comprueba al pulsar **Validar**, no después de cada gesto. El paquete enseña una imagen de resultado y permite reiniciar o revelar solución. Las variables de 50 casillas/arrastres que aparecen en algunos archivos son una plantilla; los valores activos son 10 pares en `03_01`, 3+3 en `03_04` y 6 opciones en el resumen. No hay evidencia de calificación registrable, temporizador ni pantalla final de puntaje. 🔶 El contenido de imágenes de resultado y del video no es texto HTML accesible.

### Correspondencias completas de `03_01`

La respuesta de cada casilla es la imagen con el mismo número. Las grafías A–U son imágenes en el paquete; se indican aquí como contenido observado, no como recurso reutilizable.

| Casilla | Sonido del botón | ID | Imagen que se arrastra | Clase semántica |
|---:|---|---|---|---|
| 1 | A | `5bf7b3dc` | A | letra |
| 2 | campanas | `e7c0d860` | campana | no lingüístico |
| 3 | E | `50a0e06d` | E | letra |
| 4 | I | `1aa7fa22` | I | letra |
| 5 | O | `43f5e9b9` | O | letra |
| 6 | oveja | `26662efe` | oveja | no lingüístico |
| 7 | silbato | `96a78dd7` | pito/silbato | no lingüístico |
| 8 | risa | `8119983a` | risa | 🔶 caso límite pedagógico |
| 9 | U | `24da962e` | U | letra |
| 10 | vaca | `44a0599f` | vaca | no lingüístico |

## Inventario sonoro

Fuente de IDs, duración y rutas: [`content/referencias/colombiaaprende-sonidos-y-letras/inventario.json`](../../content/referencias/colombiaaprende-sonidos-y-letras/inventario.json), 150 pistas registradas de 192 archivos de audio presentes en el ZIP. El inventario infiere muchos roles como «efecto» por duración: **A–U y las sílabas son unidades habladas, no efectos de interfaz**. No se capturó ni generó audio en este estudio.

### Evento → pista

| Pantalla/evento | ID de pista | Grado de certeza |
|---|---|---|
| `03_01`/pulsar los diez botones de escucha | diez IDs de la tabla anterior | Observado en los títulos y fuentes de los botones. |
| `03_01`/escena inicial del gato | `6c19c35b`; también A `5bf7b3dc` | Observado en las acciones. |
| `03_02`/vocales | A `5bf7b3dc`, E `50a0e06d`, I `1aa7fa22`, O `43f5e9b9`, U `24da962e`; adicionales `397d5f4f`, `82842b50`, `404a343f`, `4dbb3bdb`, `1da764ed` (`A01`–`A05`) | Fuentes observadas; 🔶 asignación de los cinco adicionales por gesto pendiente. |
| `03_04`/tres audios de cada lámina | lámina 1: `0b946874`, `27f09500`, `0a34d2e6`; lámina 2: `c166298e`, `8f429bf1`, `3b4b150f` | Fuentes observadas; 🔶 palabra hablada exacta y orden visual pendientes de escucha. |
| `03_06`/sílabas | IDs individuales de la serie BA–ZU, QUE, QUI y ÑA–ÑU en `inventario.json` | Observado por nombre de fuente; no pertenecen al núcleo. |
| `03_07`/narración | `7f95bce1` | Fuente observada; 🔶 transcripción pendiente. |
| `03_08`/siete fragmentos | `46398348`, `1f98db3b`, `7f55f0a9`, `872ad138`, `998e1577`, `b0326c06`, `442b3bb7` | Orden nominal A01–A07; 🔶 confirmar correspondencia exacta al escuchar. |
| `04_01`/palabras y animales | A01 `aa1c6345`, A02 `0e72bfc8`, A03 `57e40f21`, A04 `6543d383`; gato `05ffe25f`, perros `8d5c633c`, pollitos `31dcde55`, vaca `687a7f1d` | Acciones observadas; 🔶 el contenido de los cuatro A0y no está transcrito. |
| `05_01`/texto narrado | `484e28e2` | Fuente observada; 🔶 transcripción pendiente. |
| `03_01`, `03_04`, `04_01`, `05_01`/validación correcta | `57ffb8ad` MP3, alternativa `6ed6dfce` OGG | Observado en acciones y fuentes. |
| Mismas actividades/validación incorrecta | `ca9690d4` MP3, alternativa `81772d33` OGG | Observado en acciones y fuentes. |

**Grabaciones `_A0y` con posible voz.** En `03_08`, el HTML contiene siete segmentos visibles de un relato ilustrado, que comienzan con una decisión de salir a caminar y terminan con un atajo por el campo; 🔶 no se atribuye frase a clip sin oírlo. En `03_02`, `03_04`, `04_01`, `03_07` y `05_01` las consignas o palabras visibles solo indican el tema, no una transcripción comprobable de los MP3; quedan 🔶. Los cuatro `04_01_A0y` duran menos de un segundo y podrían ser palabras u onomatopeyas, pero no se les asigna texto inventado.

### Sonidos no lingüísticos y procedencia

La duración procede del inventario; los nombres/autores proceden de los créditos embebidos en las pantallas o del nombre de archivo. «Campanas» está clasificado por la lección como otro sonido; el inventario lo marcó erróneamente como música de fondo 🔶.

| Pantalla | Sonido | ID | Duración | Archivo/acreditación declarada en el paquete |
|---|---|---|---:|---|
| `03_01` | maullido | `6c19c35b` | 1,596 s | `110011__tuberatanka__cat-meow`, Freesound, tuberatanka |
| `03_01` | oveja | `26662efe` | 2,979 s | `34538__erdie__sheep`, Freesound, Erdie |
| `03_01` | vaca | `44a0599f` | 3,579 s | `58277__benboncan__cow`, Freesound, Benboncan |
| `03_01` | silbato | `96a78dd7` | 0,944 s | `161662__connersaw8__coach-whistle`, Freesound, connersaw8 |
| `03_01` | risa | `8119983a` | 2,562 s | `152912__fmaudio__female-short-laugh-02`, Freesound, fmaudio |
| `03_01` | campanas | `e7c0d860` | 8,213 s | `121797__boss-music__bells`, Freesound, BOSS MUSIC |
| `04_01` | gato | `05ffe25f` | 5,120 s | `gato2`, SoundBible, atribución en la pantalla: Mr Smith |
| `04_01` | perros | `8d5c633c` | 7,549 s | `perros`, SoundBible, atribución en la pantalla: Ca9 |
| `04_01` | pollitos | `31dcde55` | 6,631 s | `pollitos`, Freesound 150298, GB01 |
| `04_01` | vaca | `687a7f1d` | 2,064 s | `vaca2`, SoundBible, Mike Koenig |

🔶 Los créditos de pantalla no prueban que cada pista tenga la misma licencia. Claude debe comprobar las fichas originales de Freesound y SoundBible y cualquier permiso aplicable al uso previsto. El paquete incluye un aviso Creative Commons BY-NC-SA 3.0 España para la pantalla; su alcance sobre pistas de terceros queda por confirmar.

## Lectura para MIDUHO, sin decisión de diseño

**Conclusión observada:** la lección no presenta un tablero de dos cestas llamado «sonidos de letras» y «otros sonidos». Su ejercicio más parecido es `03_01`: escuchar diez sonidos mezclados y emparejarlos con diez imágenes. `04_01` explicita la diferencia entre palabras y sonidos animales y propone selección múltiple, aunque la clave codificada de su última lámina necesita revisión. Las pantallas `03_02`–`03_08` y la tarea trabajan principalmente vocales, sílabas y lectura.

**Comparación técnica.** `clasificar` en [`relaciones.ts`](../../apps/web/src/features/actividades/tipos/relaciones.ts) ya admite dos categorías, 4–16 elementos, `audio` por elemento y presentación `tablero`; la calificación registra la primera ubicación. El tablero de [`juegos/agrupar`](../../apps/web/src/features/actividades/juegos/agrupar/tablero.tsx) muestra todas las tarjetas, permite tocar/arrastrar, enviar y revelar. El tema `girasol` o `corcho` cambia la apariencia y efectos. [`juegos/parejas`](../../apps/web/src/features/actividades/juegos/parejas/tablero.tsx) representa una relación de pares, más próxima al ejercicio `03_01`, pero la modalidad `parejas` de `clasificar` exige dos categorías, imagen y pareja para cada elemento. El quiz ilustrado de `cuenta-las-silabas` muestra la pauta de consigna breve, imagen y voz para 1.°; su respuesta por opciones no equivale al emparejamiento de diez sonidos.

**¿Alcanza `clasificar` con `audio`?** Para la **habilidad de separar dos clases**, sí como modelo de datos y calificación, sujeto a elegir el contenido y la presentación. Para reproducir `03_01` exactamente, no: esa pantalla evalúa diez correspondencias sonido→imagen, no dos categorías. Además, el tablero actual imprime `t.texto` dentro de la tarjeta y usa ese texto como nombre accesible, y deja el botón `<Escuchar>` separado; por eso una tarjeta «solo sonido» no está representada hoy sin revelar el contenido en la vista. Haría falta una presentación controlada para el audio protagonista, un botón grande integrado, repetición libre, estados de carga/error de audio, foco visible y operación completa por teclado/tacto. 🔶 En audio solo, una alternativa accesible equivalente debe definirse con la docente: una transcripción opcional puede dar la respuesta, pero ocultarla a usuarios que la necesitan tampoco cumple acceso equivalente. El resultado y las categorías deben estar en texto HTML, nunca solo en imagen/color/sonido.

### Juicios pedagógicos por confirmar 🔶

- 🔶 Probar con docentes los rótulos **«sonidos de letras»** y **«otros sonidos»** para niños de 6 años. «Lingüístico/no lingüístico» sirve para el informe docente, no necesariamente para la interfaz infantil.
- 🔶 Elegir 8–12 ítems de duración corta y reconocibles con altavoz escolar: vocales A–U y, por ejemplo, oveja, vaca, silbato, campanas o maullido. Revisar volumen, silencios y confusiones por escucha.
- 🔶 La risa es una vocalización humana con intención comunicativa posible. Como «no lingüística» puede generar discusión; proponer excluirla de una evaluación binaria hasta que la docente fije el criterio. Las onomatopeyas escritas («muuu», «miau») son palabras que **representan** sonidos y no equivalen al sonido grabado: también requieren criterio explícito.
- 🔶 Decidir si mezclar vocales con sílabas. Las sílabas aparecen más tarde en la lección y añaden una segunda habilidad; para el primer juego podría bastar A–U, pero lo debe validar la docente.
- 🔶 No adoptar la clave 1/4/6 del resumen como verdad pedagógica sin escuchar la consigna y revisar el objetivo de esa lámina.

Este documento registra evidencia para el Encargo 1. No define todavía contenido final, diseño, imágenes, voces ni implementación de `sonidos-y-letras`.

## Adaptación aprobada

**Aprobado por el usuario el 2026-11-19.** MIDUHO usa `clasificar` con presentación `tablero` y tema girasol para separar diez audios en «Sonidos de letras» y «Otros sonidos». Se conservan las vocales A, E, I, O, U y cinco sonidos de campanas, oveja, silbato, vaca y gato. La risa se excluye por el caso límite descrito arriba. El maullido procede de la escena del gato de la lección. Las tarjetas ocultan nombre e imagen hasta abrir «Ver pista» o revelar; cada pista es opcional y no resta puntos. Bruno usa las tres poses existentes. El error de la lección suena por tarjeta mal ubicada al revelar; el éxito, al terminar la validación. Los demás efectos son los del tablero girasol.

**Implementación:** el JSON `apps/web/curriculo/actividades/comprension-lectora/1/sonidos-y-letras.json` lleva todo el contenido. `tarjetas`, `simbolo` y `efectos` son campos genéricos del esquema; sin ellos los tableros existentes conservan su comportamiento. La primera ubicación enviada de cada elemento vale un punto. La consigna se lee automáticamente en 1.° y permite síntesis del navegador si no hay MP3.

Las cinco imágenes de los otros sonidos y la portada fueron entregadas por Claude/Gemini en el worktree durante la construcción (1024×768 y 1280×720, respectivamente). 🔶 Gemini TTS informó falta de cupo en los modelos disponibles el 2026-11-19; no se generó `audioInstruccion`.
