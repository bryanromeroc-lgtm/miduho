# Inc. 2 · Ritmo visual de los cuestionarios

## Alcance y evidencia · 2026-11-14

**Cambio solicitado:** dar a Quiz y Concurso, incluidas las preguntas del material audiovisual asignado, una experiencia visual y animada inspirada en la claridad de Kahoot. Se conserva la identidad MIDUHO y la mecánica de calificación existente.

**Observado en Kahoot:** su [guía de actividades asignadas](https://support.kahoot.com/hc/en-us/articles/360039411334-How-to-assign-a-kahoot-in-web-platform) describe preguntas secuenciales, respuestas en el dispositivo del participante y avance a su ritmo. Su [guía de accesibilidad](https://support.kahoot.com/hc/en-us/articles/115004537447-Does-Kahoot-meet-accessibility-standards) documenta opciones grandes diferenciadas por color y forma, lectura en voz alta, mayor contraste y tiempo ilimitado o temporizador desactivado. Su [guía del acompañante de estudio](https://support.kahoot.com/hc/en-us/articles/36935538278557-How-to-enable-study-buddy-in-the-Kahoot-app) confirma animaciones de acierto y error entre preguntas, pero no publica duraciones ni curvas de movimiento. **Inferido:** las transiciones breves hacen más clara la relación entre elegir, recibir respuesta y avanzar; no se atribuye a Kahoot ningún tiempo exacto de animación.

**Observado en MIDUHO antes del cambio:** `juegos-preguntas.tsx` ya mostraba una pregunta a la vez, progreso, lectura de pregunta y opciones, respuesta inmediata con explicación, avance controlado y un reloj de Concurso que no interrumpe la respuesta. Las opciones eran controles bajos y pálidos, iguales a los de otros juegos; el área visual de respuesta no tenía jerarquía suficiente en la vista audiovisual. La calificación no depende de velocidad, no hay ranking ni datos personales de otros estudiantes.

## Decisión de diseño

| Patrón | Kahoot observado | MIDUHO aplicado |
|---|---|---|
| Respuestas | Opciones grandes, color y forma | Escena morada con pregunta central y tablero de 2 columnas en escritorio y 1 en móvil; cuatro colores de alto contraste, símbolo y texto completo |
| Retroalimentación | Estado visible después de elegir | La opción correcta y la elegida muestran fondo, texto e ícono; la explicación aparece en un aviso legible |
| Movimiento | Animaciones de acierto y error, sin especificación pública de tiempos | Entrada escalonada de pregunta y respuestas; pulso o sacudida al responder; confirmación central transitoria. Sin movimiento con `prefers-reduced-motion: reduce` |
| Tiempo y puntaje | Configurables por modo | Se conserva el ritmo propio de MIDUHO: el reloj de Concurso no corta ni cambia la nota; el Quiz no añade reloj |

La paleta y el movimiento son propuesta propia de MIDUHO. Los símbolos geométricos responden al patrón de accesibilidad documentado por Kahoot; no se copian logotipos, sonidos, mascotas, tipografía ni pantallas. No se introduce competición entre estudiantes. El contenido pedagógico sigue siendo texto HTML.

## Criterios de aceptación

1. Quiz, Concurso y las preguntas del material audiovisual usan el mismo tablero sin alterar la respuesta que se envía ni la calificación.
2. En escritorio las respuestas se disponen en 2 columnas; en móvil en 1, sin desbordamiento. Cada control conserva al menos 44 px de alto y foco visible.
3. Los colores de las cuatro opciones tienen contraste de texto ≥ 4,5:1. Acierto y error se distinguen también por texto e ícono.
4. El efecto de confirmación es breve y desaparece con movimiento reducido. El foco y el aviso para lector de pantalla continúan funcionando.

## Implementación y QA

Archivos: `src/features/actividades/reproductor/juegos-preguntas.tsx`, `reproductor.module.css` y `reproductor.estilos.test.ts`. No hay cambios de esquema ni de API.

**Verificación visual:** en la actividad audiovisual ficticia, a 1440 px la escena ocupa el ancho de lectura y las dos respuestas se distribuyen en dos columnas. A 390 px pasan a una columna y el ancho del documento coincide con el de la ventana, sin scroll horizontal. Se capturó a los 300 ms la confirmación central de un acierto con movimiento normal. Con movimiento reducido, esta capa desaparece y quedan visibles la opción, el ícono y la explicación. También se verificó una respuesta incorrecta y el foco en «Ver resultado». 🔶 Queda pendiente revisión en dispositivos físicos y con lector de pantalla.

**Gate técnico:** `npm run build` pasó; `npm run lint` pasó con una advertencia preexistente de variable sin usar en `scripts/verificar-material-audiovisual.mjs`; `npm test` pasó con 919 pruebas en 89 archivos. La compilación de producción quedó abierta en `localhost:3114` y se verificó la pantalla de preguntas sin errores de consola.
