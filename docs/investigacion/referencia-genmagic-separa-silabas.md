# Referencia: separar sílabas en palabras (Genmagic)

**Fecha del estudio:** 2026-11-19. **Herramientas:** REA 6.9.0 con Chrome aislado en CDP 9333, lectura de la lógica declarada y una partida con Playwright. **Entrada:** [Cokitos](https://www.cokitos.com/separar-silabas-en-las-palabras/). **Juego observado:** [Genmagic](https://genmagic.net/lengua/separasilabas/#!/NewPage1); Cokitos lo incrusta. La portada del juego atribuye la obra a Roger Rey, Fernando Romero y Josep Mª Llobet. Se documentan hechos de la mecánica y datos lingüísticos, sin incorporar código ni recursos visuales.

## Construcción y disposición

| Aspecto | Observación |
|---|---|
| Motor | NeoApp sobre AngularJS; componentes DOM, CSS y Bootstrap. Hay dos páginas internas: portada y ejercicio. No es Wordwall. |
| Lienzo | Maqueta fija de 1024 × 600 escalada para encajar en la ventana. En la captura de 1280 × 800 aparece un marco sobre una fotografía de fondo. |
| Portada | Título, atribución, información e «Iniciar». |
| Ejercicio | Menú de tres actividades arriba a la izquierda; intentos, aciertos y reloj arriba a la derecha; consigna en una banda; campo de texto grande con la palabra sin divisiones en el centro; historial abajo a la izquierda; opción minúscula/mayúscula y botones «Comprobar» y «Ejercicio Nuevo» abajo. Hay un botón para volver. Las imágenes `correcto.png` e `incorrect.png` se superponen al comprobar. |
| Accesibilidad observada | El campo sí es texto HTML seleccionable y editable. Las imágenes de resultado tienen `alt=""`; la señal de acierto o error también consta en el historial textual. 🔶 No se hizo una auditoría completa de teclado, lector de pantalla ni contraste de la referencia. |

## Mecánica observada y medida

1. Al pulsar «Iniciar» se carga **una palabra completa, sin guiones**, en un campo de texto. La consigna pide insertar `-` entre sílabas. No se arrastran sílabas, no se reordenan piezas y no se toca entre letras sobre una imagen. La persona edita el campo con teclado y pulsa «Comprobar».
2. La comprobación compara el texto editado con la división almacenada, sin distinguir mayúsculas y minúsculas. No normaliza otras diferencias: espacios, guiones u ortografía distintos dan error. La opción minúscula/mayúscula cambia cómo se presenta la próxima palabra; el texto de la respuesta sigue siendo editable.
3. Una respuesta incorrecta incrementó «Intentos» de 0 a 1, dejó «Aciertos» en 0, añadió una línea `INCORRECTO` al historial y activó la imagen de error. La palabra permaneció editable. Se corrigió en la misma ronda: «Intentos» pasó a 2, «Aciertos» a 1, apareció `CORRECTO` y la imagen de acierto. La imagen se mostró durante la observación a los 400 ms del error y al segundo del acierto; no hubo avance automático.
4. Volver a comprobar el mismo acierto no sumó otra vez. «Ejercicio Nuevo» cargó de inmediato otra palabra y retiró las imágenes, pero conservó el historial y el marcador (2 intentos, 1 acierto). No se observó límite de intentos; la lógica tampoco contiene uno.
5. El reloj visible subió de `00:00` a `00:01` y `00:02` durante la partida. Mide tiempo transcurrido con actualización de 1 s, sin cuenta regresiva, penalización ni condición de finalización. No hay pantalla final ni puntaje por partida: el marcador acumula aciertos y comprobaciones hasta salir o reiniciar al entrar de nuevo. 🔶 No se midió el comportamiento tras horas de uso.

## Generación y bancos completos

La opción inicial es **actividad 1**. Cada «Ejercicio Nuevo» o cambio de actividad reconstruye el banco elegido y extrae **un índice uniforme aleatorio** entre `0` y `n−1`. Por tanto hay **una entrada por ronda**, sin número fijo de rondas, sin barajar una cola y **sin memoria de repetidos**: una entrada puede reaparecer. El contador auxiliar `n` se pone a cero al reconstruir el banco, pero no participa en la elección. No hay distractores.

Las divisiones de abajo son **datos del referente**, no una selección pedagógica aprobada. Se conservan aquí para identificar el banco; la redacción y el material de MIDUHO deberán ser propios.

### Actividad 1: 70 palabras sencillas

- Ca-sa, Pe-rro, Co-che, Ma-ña-na, Ca-mi-se-ta, Na-dar, Mú-si-ca, Va-ca, Le-ón, Ba-ño.
- Ga-to, Pá-ja-ro, E-le-fan-te, Mo-no, Es-tre-llas, Ji-ra-fa, Doc-to-ra, Cu-le-bra, Ti-gre, Pu-ma.
- Ga-lli-na, Go-ri-la, Ra-tón, Á-gui-la, Co-co-dri-lo, To-ro, Hu-ma-no, Ca-ba-llo, Ce-bra, Ca-ra.
- Na-riz, Bra-zo, Plá-ta-no, Ma-no, Ca-be-za, O-re-jas, De-do, Ca-be-llo, O-jo, Ro-di-lla.
- Es-tó-ma-go, Gar-gan-ta, Cos-ti-lla, Bi-go-te, Bar-ba, U-ña, Bo-ca, Me-sa, Si-lla, Or-de-na-dor.
- Bo-lí-gra-fo, Li-bre-ta, Te-le-vi-sor, Bom-bi-lla, Li-bro, Re-gla, Co-ci-na, Te-cho, Pa-red, Te-ne-dor.
- Cu-cha-ra, Pla-to, Na-ran-ja, Li-món, Fre-sa, Man-za-na, Le-chu-ga, Pu-ré, Car-ne, Pan-ta-lón.

Distribución según los guiones almacenados: 34 de dos sílabas, 29 de tres y 7 de cuatro. 🔶 «Sencillas» es el rótulo de Genmagic, no una evaluación docente de idoneidad.

### Actividad 2: 49 entradas con diptongos, hiatos y otras palabras

- Ha-cí-a, Tí-o, Ha-cia, His-to-ria, Cui-dar, Am-bi-guo, Bue-no, Pa-ra-guas, Guar-dar, Ciu-da-des.
- Tiun-fo, Cue-va, Rei-no, Vio-lín, Vio-len-cia, Oi-go, A-cei-te, Au-to-pis-ta, Bai-le, Ai-re.
- Lour-des, A-fei-tar, Pei-na-do, Rue-da, Fue-go, Cuer-das, A-hor-ca-do, A-ho-rrar, Bú-ho, Co-he-te.
- To-a-lla, Al-de-a, Ca-ó-ti-co, A-ca-e-ci-da, A-é-re-o, Po-e-ta, Tri-ne-o, Ba-te-rí-a, Ba-úl, Ma-íz.
- Bio-gra-fí-a, San-dí-a, Cre-er, Co-or-di-nar, Zo-o-ló-gi-co, De-se-a-rí-a, U-ru-guay, Guau, Buey.

Distribución según la división almacenada: 2 de una sílaba, 20 de dos, 17 de tres, 7 de cuatro y 3 de cinco. Hay al menos una errata visible en el banco (`Tiun-fo`) y entradas cuya división o pertinencia requieren revisión docente 🔶.

### Actividad 3: 36 frases

Es un banco separado de **36 oraciones**, no palabras aisladas. La interacción sigue siendo insertar guiones en el texto completo. No se reproducen aquí las oraciones porque incluyen nombres personales y redacción del referente. Se contó cada entrada en la lógica; esta actividad no se eligió para la propuesta de palabras de 1.°.

## Inventario sonoro

Fuente: `content/referencias/cokitos-separar-silabas/{inventario.json,RESUMEN.md}`, captura ya hecha por Claude. Hay **una pista**, `2f96d334`, de 0,19 s, declarada como `data:audio/wav` en `main.js`; no se capturó música ni una voz por palabra. El inventario la llama «voz», pero **su rol no está confirmado por escucha 🔶**. La lógica define un método genérico que podría reproducir esa pista, pero **no lo invoca** desde los controladores de portada, comprobación, palabra nueva ni cambio de actividad. Tampoco se invocan las otras utilidades de sonido o síntesis de voz desde esos eventos. Por tanto, no hay evidencia de que esta pista suene durante la partida.

| Evento | ID de pista observado | Estado |
|---|---|---|
| Iniciar / cargar palabra | Ninguno | Sin llamada en la lógica específica; el inventario no contiene audio de palabra. |
| Comprobar: acierto | Ninguno | Imagen `correcto.png` y registro textual; sin llamada de audio. |
| Comprobar: fallo | Ninguno | Imagen `incorrect.png` y registro textual; sin llamada de audio. |
| Ejercicio nuevo / cambiar actividad / salir | Ninguno | Sin llamada de audio. |
| Utilidad genérica de sonido del motor | `2f96d334` | Declarada, sin evento de esta actividad asociado. 🔶 Confirmar por escucha qué contiene la pista antes de decidir cualquier uso. |

No hay voz de la palabra en el referente. La idea de «ordenar con audio de la palabra» queda **descartada como descripción de la mecánica original**. Una voz por palabra, consigna y efectos serían recursos adicionales de MIDUHO, sujetos al siguiente encargo. Aquí no se adaptó ni generó audio.

## Relación con MIDUHO y alcance de la propuesta

| Pieza existente | Comparación con la referencia |
|---|---|
| `ordenar`, presentación predeterminada | Mueve elementos de una lista con botones subir/bajar y califica posiciones. No representa insertar cortes en una palabra continua. |
| `ordenar`, presentación `casillas` | Coloca fichas en casillas y revela aciertos por posición. Sirve para ordenar sílabas **ya separadas**, una tarea distinta de determinar los límites silábicos. |
| `ruta-palabras` | Reconoce por oído una palabra entre tres carteles y tiene banco de 2–4 sílabas. No pide separar sílabas. Su banco y función de voz podrían orientar contenido, pero su interacción no encaja. |
| `tipos/palabras.ts` | Implementa sopa de letras y palabra secreta; no contiene segmentación silábica. |

**Conclusión del estudio:** `ordenar` no alcanza para reproducir la mecánica real ni su calificación. 🔶 Para una adaptación fiel habría que evaluar las **posiciones de corte** dentro de la palabra, con una interfaz de edición o toque entre letras y una vía de teclado accesible. Es una necesidad de tipo o presentación por decidir en el siguiente paso; este informe no la diseña. También faltarían una escena propia con **Bruno** (guía de Comprensión lectora), voz de cada palabra, ilustración informativa por palabra y efectos de respuesta si se aprueban. El referente no ofrece esas voces ni esas ilustraciones por palabra. El texto y los límites deben permanecer como HTML seleccionable, con foco visible y retroalimentación textual.

## Filtro pedagógico para 1.° — propuesta, no decisión 🔶

🔶 Se propone excluir españolismos como «coche», «ordenador» y «bolígrafo»; palabras con hiato o diptongo que adelantan otra dificultad (por ejemplo `le-ón`, `a-é-re-o`, `ba-úl`, `ma-íz`), vocabulario abstracto o menos ilustrable, y la actividad de frases. 🔶 La errata `Tiun-fo` y otras segmentaciones deben cotejarse antes de reutilizar cualquier entrada. La docente debe validar el grado y el vocabulario.

🔶 **Lista corta propuesta, 10 palabras concretas e ilustrables:** `ga-to`, `va-ca`, `me-sa`, `ma-no` (2); `ga-lli-na`, `ji-ra-fa`, `na-ran-ja` (3); `e-le-fan-te`, `co-co-dri-lo`, `ca-mi-se-ta` (4). Todas están en la actividad 1, son comprensibles en español de Colombia y no repiten las ocho de `cuenta-las-silabas` (sol, flor, casa, perro, pelota, zapato, mariposa, computador). Las divisiones indicadas son las del referente; su selección y progresión quedan por confirmar 🔶.

Se conserva como objeto de estudio la secuencia de **palabra continua → inserción de límites → comprobar → corregir o pedir otra**, con una palabra visible a la vez. Recursos, personaje, interfaz, texto y evaluación de MIDUHO quedan para el encargo de diseño.

## Adaptación aprobada

**Aprobada por el usuario el 2026-11-19.** MIDUHO usa una palabra completa y una ilustración por ronda. El estudiante toca los huecos entre letras para marcar cortes; el teclado ofrece Tab, flechas, Enter y Espacio. Se califican los límites exactos una sola vez y se revela la separación correcta con explicación. El banco aprobado consta de diez palabras, de `ga-to` a `ca-mi-se-ta`, en orden. Bruno usa las poses existentes de «Cuenta las sílabas». La consigna y cada palabra tienen voz Gemini; los efectos son los del quiz ilustrado. Las once imágenes nuevas se incorporaron y se verificaron visualmente (diez de 1024×768 y portada de 1280×720). 🔶 La escucha de las voces y los términos de uso de Gemini quedan por confirmar antes de publicar.
