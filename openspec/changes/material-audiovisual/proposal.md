## Why

Hoy la docente no puede asignar nada a sus estudiantes ni ponerles nota desde MIDUHO: no existen en la base las actividades, las asignaciones, los intentos ni los resultados, y «Mis clases» sigue siendo una maqueta. La primera necesidad concreta del colegio es que la docente asigne **videos de YouTube con preguntas** y que la nota salga de las respuestas. Este cambio construye esa base desde cero y la estrena con ese tipo de actividad.

Decisiones tomadas con el responsable del producto (2026-11-11):
- La docente crea la actividad «Material audiovisual»: enlace de YouTube, título, indicaciones y **preguntas de selección múltiple** que ella misma escribe.
- Elige **asignatura y grado**; la actividad llega a todos sus grupos de esa asignatura en ese grado.
- **Cuenta como nota.** El estudiante ve el video, marca «Ya lo vi» y responde; la nota es el porcentaje de aciertos.
- **Sin revisión de coordinación.** La docente publica directo y responde por que el video sea apto para niños.
- La docente ve qué estudiantes ya hicieron la actividad y su nota.
- Se construye el **núcleo** del modelo de `actividades-en-clase` (actividad, versión, asignación, intento, resultado) para que los juegos y los quizzes se sumen después sin un segundo sistema de notas.

## What Changes

- **Núcleo de actividades en la base:** `Actividad` (por ahora solo de origen `DOCENTE`), `VersionActividad`, `AsignacionActividad`, `IntentoActividad`, `RespuestaItem` y `ResultadoActividad`, con reglas de integridad en SQL. Compatibles con el diseño de `actividades-en-clase`.
- **Tipo nuevo `video-preguntas`** en el registro de tipos: contenido = video de YouTube (id, inicio y fin opcionales) + preguntas con el mismo esquema de `seleccion-multiple`; se califica con `calificarIntento`.
- **Creación por la docente:** formulario con enlace, título, indicaciones, preguntas, asignatura + grado, apertura, cierre e intentos. El servidor valida el enlace (extrae el id y comprueba con oEmbed que el video existe y se puede incrustar).
- **Edición y anulación:** fechas, título e indicaciones siempre; video y preguntas solo mientras ningún estudiante haya enviado respuestas. Anular saca la actividad de la vista del estudiante y conserva lo hecho.
- **Experiencia del estudiante:** la actividad aparece en la vista de su materia; ve el video dentro de MIDUHO (`youtube-nocookie`, subtítulos), marca «Ya lo vi», responde y ve su resultado. 3 intentos por defecto; cuenta el mejor.
- **Seguimiento de la docente:** por grupo, cada estudiante con su estado (sin empezar, vio el video, respondió) y su nota.
- **«Mis clases» con datos reales:** la lista sale de las `AsignacionDocente` activas de la docente, y la pestaña **Actividades** de la clase es real. Las demás pestañas quedan como están, rotuladas 🔶.
- La **práctica libre** del catálogo sigue igual: este cambio no la retira. Lo asignado aparece junto a ella, primero.

## Capabilities

### New Capabilities

- `nucleo-actividades`: actividades, versiones, asignación a grupos, intentos, calificación en el servidor y mejor intento, independientes del tipo.
- `material-audiovisual`: creación, validación del enlace de YouTube, preguntas, edición, anulación y seguimiento por estudiante del tipo `video-preguntas`.
- `clases-docente`: «Mis clases» desde las asignaciones docentes reales y la pestaña Actividades de la clase.
- `actividades-asignadas`: lo asignado en la vista de materia del estudiante, el reproductor del video con «Ya lo vi», las preguntas y el resultado.

### Modified Capabilities

(Ninguna: `openspec/specs/` no tiene especificaciones archivadas.)

## Impact

- **Base de datos:** migración nueva con seis tablas, `CHECK`, índices parciales y un trigger que impide cambiar una versión con intentos enviados. No toca tablas existentes.
- **Servidor:** `src/server/modules/actividades/` nuevo (actividades, asignación, intentos, seguimiento, `youtube.ts`), adaptador real de `PuertoActividadesDeMateria` en `src/server/modules/materias/puertos.ts`, Route Handlers en `src/app/api/actividades/**`.
- **Tipos:** `src/features/actividades/tipos/video.ts` y su registro.
- **Interfaz:** `src/app/clases/**` pasa de `@/data/demo` a datos reales; formulario y seguimiento del material; ruta nueva del estudiante `/materias/[asignatura]/asignadas/[asignacionId]`. Las pantallas se hacen con la skill impeccable.
- **Red externa:** el servidor consulta `youtube.com/oembed` al guardar (solo la URL del video, sin datos de personas); el navegador del estudiante carga el iframe de `youtube-nocookie.com`.
- **`actividades-en-clase`:** se ajusta después para construir sobre este núcleo en lugar de crearlo (tarea incluida).
- **Fuera de alcance:** juegos asignados, quizzes sueltos, malla y DBA obligatorios, compartir el material con colegas, retirar la práctica libre, medir cuánto del video se reprodujo, videos que no sean de YouTube, reportes de notas por período y conversión a la escala del SIEE.
