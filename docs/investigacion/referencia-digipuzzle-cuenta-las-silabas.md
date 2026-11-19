# Referencia: «Cuenta las sílabas» de Digipuzzle

## Adaptación aprobada

**Aprobada por el usuario el 2026-11-19.** MIDUHO construye un quiz ilustrado de ocho preguntas para 1.° con dos palabras por longitud silábica: sol, flor, casa, perro, pelota, zapato, mariposa y computador. Las opciones son siempre 1, 2, 3 y 4 en ese orden. La primera respuesta cuenta; el juego revela la correcta y muestra la división escrita en sílabas en la explicación. La consigna es «Mira el dibujo y escucha la palabra. Toca cuántas sílabas tiene». Se reutiliza `seleccion-multiple`, con Bruno, las cuatro pistas de efectos de `parejas` y nueve voces propias generadas con Gemini TTS. 🔶 Las ilustraciones y tres poses de Bruno están encargadas a Claude y aún no se han recibido; sus rutas y textos alternativos ya están definidos en el contenido.


**Fecha del estudio:** 2026-11-19. **Herramientas:** REA 6.9.0 conectado a Chrome aislado (CDP 9333), lectura de los scripts de la página y juego medido con Playwright. **Página observada:** [Cuenta las sílabas](https://www.digipuzzle.net/digipuzzle/kids/puzzles/syllablescount_names_es.htm?language=spanish). **Autoría alojada:** Digipuzzle.net; la página y los scripts del juego están en ese dominio. Se estudió la mecánica; no se incorporan código ni recursos de la referencia.

## Construcción y variantes

| Aspecto | Evidencia observada |
|---|---|
| Render | Cinco capas `canvas` superpuestas, lienzo lógico de 862 × 606. La consigna, la palabra, las opciones y el marcador se dibujan en canvas. |
| Lógica | La página configura la actividad; `puzzles/syllablescount.js` gestiona pregunta y respuestas; `puzzles/fw_005.js` aporta botones, dibujo, aleatoriedad y opciones. `kids/puzzles/init.js` carga el entorno. |
| Contenido | La variante `_names_es` configura una colección ilustrada y 83 entradas en español, de objetos, animales, alimentos, figuras y otras palabras; no es una lista exclusiva de nombres propios. |
| Otras listas | El índice de [lectura de Digipuzzle](https://www.digipuzzle.net/education/reading/) enlaza variantes en inglés de **alimentos** y **animales** (`food/puzzles/syllablescount_names.htm` y `animals/puzzles/syllablescount_names.htm`). El [índice de español](https://www.digipuzzle.net/es/juegoseducativos/espanol/) enlaza esta variante general; también ofrece otros juegos de sílabas con mecánica distinta. 🔶 No se comprobó que no existan otras listas fuera de esos índices. |
| Accesibilidad | Canvas sin texto pedagógico seleccionable ni controles de respuesta semánticos. Se respondió con puntero; 🔶 no se completó una auditoría de teclado o lector de pantalla del original. |

## Mecánica observada y medida

1. Aparece una pregunta a la vez. Arriba se lee una consigna; en el centro hay una tarjeta con la palabra en mayúsculas, un dibujo debajo y cuatro casillas numéricas en fila. A la derecha están ayuda, marcador, «Siguiente» y opciones. El fondo es decorativo.
2. En el modo fácil que fija esta página, las casillas son **1, 2, 3, 4**. El motor admite otro modo: para palabras con tres o cuatro sílabas, el modo normal ofrece 2, 3, 4, 5; para una o dos conserva 1–4. Las respuestas incorrectas no se generan al azar: son los otros números contiguos.
3. Al tocar una casilla errónea, esta pasa a rojo y la palabra muestra sus divisiones con guiones. La misma pregunta permanece y se pueden probar otras casillas sin límite programado. El marcador no cambia. Al tocar la correcta, queda verde, aparece un mensaje de felicitación y se activa «Siguiente». Si hubo algún error previo, la ronda cuenta en el denominador pero no en los aciertos.
4. «Siguiente» requiere pulsación y abre la próxima palabra de inmediato. No hay avance automático ni tiempo límite. El botón de avance se resalta a intervalos de **1 s** mientras espera; el estado de respuesta y el mensaje persistieron tras **1,5 s** de espera. La transición se observó con una pulsación mantenida más de **10 ms**, requisito del botón del motor.
5. El marcador es `aciertos a la primera / palabras resueltas`. A partir de diez palabras resueltas se colorea verde si la proporción alcanza **80 %** y rojo en otro caso. El código no define una meta ni una pantalla de final: la sesión puede continuar indefinidamente.

**Selección de preguntas.** Cada ronda toma un índice aleatorio entre las 83 entradas. El motor evita repetir las últimas **41** elecciones (mitad entera de 83), y después puede reutilizarlas. Se observaron doce rondas seguidas con palabras distintas y marcador de 0/0 a 12/12 al responder bien. 🔶 Esa muestra no permite predecir el orden de una sesión nueva.

## Inventario completo de palabras

Cada fila reproduce el **dato lingüístico** de una entrada, con la división que usa el juego y el número de casillas que acepta como correcto. No se reproducen imágenes ni redacción del referente. La distribución es **3 de una sílaba, 31 de dos, 39 de tres y 10 de cuatro**.

| N.º | División usada en el juego | Sílabas |
|---:|---|---:|
| 1 | le-ón | 2 |
| 2 | ba-na-na | 3 |
| 3 | ji-ra-fa | 3 |
| 4 | pan-ta-lo-nes | 4 |
| 5 | ce-pi-llo | 3 |
| 6 | mo-no | 2 |
| 7 | an-cla | 2 |
| 8 | del-fín | 2 |
| 9 | pin-tor | 2 |
| 10 | ves-ti-do | 3 |
| 11 | lá-piz | 2 |
| 12 | bol-sa | 2 |
| 13 | di-ne-ro | 3 |
| 14 | pia-no | 2 |
| 15 | que-so | 2 |
| 16 | pe-pi-no | 3 |
| 17 | pal-me-ra | 3 |
| 18 | es-tre-lla | 3 |
| 19 | lu-na | 2 |
| 20 | ga-fas | 2 |
| 21 | mú-si-ca | 3 |
| 22 | re-loj | 2 |
| 23 | co-ne-jo | 3 |
| 24 | tam-bor | 2 |
| 25 | tar-ta | 2 |
| 26 | lin-ter-na | 3 |
| 27 | cua-dra-do | 3 |
| 28 | trián-gu-lo | 3 |
| 29 | cir-cu-lo | 3 |
| 30 | bú-ho | 2 |
| 31 | hor-mi-ga | 3 |
| 32 | ti-gre | 2 |
| 33 | mé-di-ca | 3 |
| 34 | me-du-sa | 3 |
| 35 | man-za-na | 3 |
| 36 | pa-ra-guas | 3 |
| 37 | na-ran-ja | 3 |
| 38 | te-lé-fo-no | 4 |
| 39 | ca-rre-ti-lla | 4 |
| 40 | ti-je-ras | 3 |
| 41 | re-ga-de-ra | 4 |
| 42 | e-le-fan-te | 4 |
| 43 | ba-lle-na | 3 |
| 44 | he-la-do | 3 |
| 45 | gu-sa-no | 3 |
| 46 | a-ra-ña | 3 |
| 47 | si-llón | 2 |
| 48 | al-fom-bra | 3 |
| 49 | pi-ra-ta | 3 |
| 50 | ce-re-zas | 3 |
| 51 | mo-li-no | 3 |
| 52 | re-gla | 2 |
| 53 | prin-ce-sa | 3 |
| 54 | gui-ta-rra | 3 |
| 55 | pi-ña | 2 |
| 56 | va-ca | 2 |
| 57 | can-gu-ro | 3 |
| 58 | za-na-ho-ria | 4 |
| 59 | vol-cán | 2 |
| 60 | cho-co-la-te | 4 |
| 61 | di-no-sau-rio | 4 |
| 62 | co-ci-ne-ro | 4 |
| 63 | sol | 1 |
| 64 | pis-ci-na | 3 |
| 65 | flor | 1 |
| 66 | lo-ro | 2 |
| 67 | co-co-dri-lo | 4 |
| 68 | fa-mi-lia | 3 |
| 69 | pe-rro | 2 |
| 70 | ga-to | 2 |
| 71 | pe-lo-ta | 3 |
| 72 | ár-bol | 2 |
| 73 | som-bre-ro | 3 |
| 74 | ca-ba-llo | 3 |
| 75 | ca-sa | 2 |
| 76 | pá-ja-ro | 3 |
| 77 | pez | 1 |
| 78 | cu-be-ta | 3 |
| 79 | cla-vo | 2 |
| 80 | bo-ca | 2 |
| 81 | ve-la | 2 |
| 82 | fue-go | 2 |
| 83 | ra-na | 2 |

### Revisión silábica y vocabulario

La [Ortografía de la lengua española de RAE/ASALE](https://www.rae.es/sites/default/files/1ortografia_espanola_2010.pdf), § 2.2.2, distingue hiato y diptongo; explica que la *h* intercalada no determina por sí sola la división y cita **bú.ho** como hiato. También registra la variación **pia.no / pi.a.no** según el hablante y la zona. La lista se contrastó con esas pautas:

- **Le-ón** (2) y **bú-ho** (2) son hiatos bien contados; **pa-ra-guas** (3), **di-no-sau-rio** (4), **fa-mi-lia** (3) y **za-na-ho-ria** (4) mantienen las secuencias vocálicas en una sílaba conforme a la lectura usual del juego.
- 🔶 **Piano:** el juego solo acepta **pia-no (2)**, pero RAE/ASALE documenta también **pi-a-no (3)** como pronunciación posible. Es un ítem discutible para respuesta única, especialmente si el niño cuenta lo que oye.
- **Círculo:** la separación y el conteo de tres sílabas son correctos, pero el texto fuente escribe `cir-cu-lo` y muestra **CIRCULO**, sin tilde. Debe corregirse si se usa.
- 🔶 **Familia, dinosaurio y zanahoria:** las secuencias con vocal cerrada átona pueden variar en pronunciación según hablante y ritmo; el conteo del referente refleja la pronunciación usual. Conviene comprobar con la docente y con la voz que se vaya a grabar antes de incluirlas en una evaluación de 1.°.
- 🔶 **Tarta, cubeta, gafas, regadera, sillón:** entendibles en distintos contextos, pero pueden tener nombres o referentes cotidianos distintos en Colombia; una imagen sola puede introducir ambigüedad. «Tarta» puede sustituirse por «torta»; «cubeta» por «balde» según el dibujo. **Carro** y **computador** no están en el catálogo original; tampoco aparece «coche».

## Relación con MIDUHO y decisión pendiente

La tarea [3.7 de `juegos-primero`](../../openspec/changes/juegos-primero/tasks.md) anota «Comprensión lectora · LEN-1-05 · quiz con audio en cada opción»; su [spec](../../openspec/changes/juegos-primero/specs/juegos-primero/spec.md) registra `seleccion-multiple`. Es una **previsión de producto**, no una propiedad observada en Digipuzzle.

| Necesidad | Estado actual y propuesta 🔶 |
|---|---|
| Palabra, dibujo, 1–4 | `tipos/preguntas.ts` ya acepta `imagen` y `alt` por pregunta, y cuatro opciones de texto. `reproductor/juegos-preguntas.tsx` presenta una pregunta por vez y opciones táctiles. **Alcanza para un quiz evaluable** con el mismo problema de conteo. |
| Voz | `audio` de la pregunta reproduce el enunciado; `audioOpciones` admite una grabación por opción. Para contar sílabas, **oír la palabra** aporta información directa. Oír «uno», «dos», «tres», «cuatro» ayuda a reconocer los números pero no ayuda a segmentar la palabra; las cuatro voces podrían reutilizarse en todas las preguntas. 🔶 Conviene proponer a la docente si el audio de palabra debe ser automático al iniciar cada ronda y repetible mediante «Escuchar». |
| Respuesta y retroalimentación | El quiz existente toma **solo el primer intento**, revela enseguida la solución y avanza al pulsar «Siguiente». El original deja reintentos ilimitados y revela la división tras el primer fallo. 🔶 Para conservar ese ritmo haría falta cambiar la interacción del reproductor o un componente específico; se propone evaluar si merece la pena. Palmadas o golpes discretos por sílaba al revelar podrían enseñar la segmentación; serían una ampliación, no un requisito del tipo de contenido. |
| Final evaluable | El quiz tiene preguntas fijas y resultado; el original no tiene cierre. El esquema admite **3–12** preguntas. 🔶 Elegir cantidad y equilibrio con la docente. |
| Guía y efectos | El quiz ilustrado de [`emociones-del-recreo`](../../apps/web/curriculo/actividades/etica-y-valores/1/emociones-del-recreo.json) usa `escena`, imágenes y `efectos`. Bruno, guía de Lectura, ya tiene imagen base, pero 🔶 faltan las poses `reposo`, `senala` y `duda` si se elige esa escena. |
| Actividad de sílabas existente | [`la-ruta-de-las-palabras`](../../apps/web/curriculo/actividades/comprension-lectora/1/la-ruta-de-las-palabras.json) usa el tipo `ruta-palabras`: el niño **oye** una palabra de 2–4 sílabas y reconoce su escritura entre tres carriles. No evalúa cuántas sílabas tiene; comparte el uso de palabra hablada. |

### Opciones de contenido para conversar con la docente 🔶

1. **Original depurado:** seleccionar hasta 12 del catálogo, con mezcla equilibrada de 1–4 sílabas; excluir «piano», corregir «círculo» y evitar imágenes o voces dudosas. Conserva más cercanía con el referente, pero hay solo tres monosílabos en toda la lista.
2. **Ocho preguntas:** **sol, pez** (1); **casa, perro** (2); **pelota, banana** (3); **chocolate, teléfono** (4). Dos por longitud; objetos y animales fáciles de ilustrar. 🔶 Confirmar la carga adecuada y el vocabulario con la docente.
3. **Lista propia colombiana:** **sol, flor** (1); **carro, casa** (2); **pelota, mercado** (3); **computador, mariposa** (4). Dos por longitud, con vocabulario local; las ilustraciones y voces serían propias. 🔶 Revisar con la docente que «mercado» se entienda como lugar o compra según la imagen.

En cualquier opción, el texto pedagógico debe ser HTML seleccionable, las imágenes informativas necesitan `alt`, y el resultado no puede depender solo del color o del sonido. Se requieren foco visible, teclado y contraste WCAG 2.1 AA.

## Inventario sonoro

**Referencia: vacío (0 voces, 0 efectos, 0 música).** La [captura sonora de Claude](../../content/referencias/digipuzzle-cuenta-las-silabas/RESUMEN.md) registró cero pistas y cero URL candidatas. REA vio doce recursos de carga (scripts, imágenes y fuente), ninguno de audio; tampoco vio solicitudes de `.mp3`, `.wav` o `.ogg`. `syllablescount.js`, `init.js` y la configuración de la página no invocan `playAudio` ni `fwPlayAudio`, `speechSynthesis` o Web Audio; el motor común sí define funciones de audio, pero esta actividad no las usa. 🔶 La observación de red cubre la carga y la inspección, no demuestra la inexistencia de cualquier recurso inaccesible, aunque coincide con la prueba de interacción y la captura de Claude.

**Recursos existentes en MIDUHO para considerar, sin asignarlos aún:** los grabados de `public/audio/juegos/parejas/` (`acierto`, `fallo`, `fin-ronda`, `fin`) ya se usan en el quiz ilustrado; `agrupar/` y `agrupar-corcho/` ofrecen `inicio`, variantes de `acierto` y `fallo`, `revelar`, `fin`, además de efectos de arrastre que aquí no corresponderían. `casillas/` también tiene `reiniciar`; `cinta/` tiene `entrar`, `centrar` y `salir`. La síntesis Web Audio está en **`juegos/comun/sonido.ts`**, con `acierto`, `error`, `fin`, `toque`, `reloj`, `impacto`; **`juegos/comun/efectos.tsx` es visual** (halo y confeti), no sonoro. 🔶 Para esta actividad se podrían usar sonidos suaves de acierto, fallo y fin de ronda; los golpes por sílaba, si se aprueban, pueden salir de `toque` o de un recurso nuevo. No hay sonido original que adaptar.

**Voces a producir en un paso posterior:** una consigna; una pronunciación natural y clara de **cada palabra elegida** (8 o hasta 12 según la opción); y, si se mantiene el requisito de `audioOpciones`, cuatro voces reutilizables para **«uno», «dos», «tres», «cuatro»**. 🔶 Si se eligiera modo normal haría falta «cinco». Para la retroalimentación hablada, 🔶 decidir si se graba también la división por sílabas o basta el texto y los golpes. No se capturó ni generó audio en este estudio.
