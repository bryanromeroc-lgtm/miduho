## ADDED Requirements

### Requirement: Tipo de actividad video con preguntas
El registro de tipos SHALL incluir `video-preguntas`, cuyo contenido es un video de YouTube (id de 11 caracteres, inicio y fin opcionales en segundos, con `fin > inicio`) y de 1 a 10 preguntas de selección múltiple con el mismo esquema de pregunta de `seleccion-multiple` (de 2 a 4 opciones, una correcta, explicación opcional). Cada pregunta SHALL valer 1 punto y la nota SHALL ser el porcentaje de aciertos.

#### Scenario: Calificación
- **WHEN** un estudiante responde bien 4 de 5 preguntas
- **THEN** el porcentaje del intento es 80

#### Scenario: Sin preguntas
- **WHEN** la docente intenta guardar un material sin preguntas
- **THEN** el formulario y la API rechazan el contenido

### Requirement: Validación del enlace de YouTube
El servidor SHALL aceptar enlaces de `youtube.com/watch`, `youtu.be`, `youtube.com/shorts`, `youtube.com/embed`, `youtube.com/live`, `m.youtube.com` y `youtube-nocookie.com/embed`; extraer el id del video; y comprobar con oEmbed que existe y se puede incrustar antes de guardar. La consulta MUST enviar solo la URL del video. Otros dominios MUST rechazarse.

#### Scenario: Enlace corto válido
- **WHEN** la docente pega `https://youtu.be/<id>?t=90`
- **THEN** el sistema extrae el id, propone inicio en 90 s y muestra la vista previa

#### Scenario: Video sin permiso de incrustación
- **WHEN** oEmbed responde `401` o `403`
- **THEN** la pantalla dice «Este video no permite verse fuera de YouTube» y no se guarda

#### Scenario: Video inexistente
- **WHEN** oEmbed responde `404`
- **THEN** la pantalla dice «No encontramos ese video; revisa el enlace»

#### Scenario: Otro sitio
- **WHEN** la docente pega un enlace que no es de YouTube
- **THEN** la API responde `400` con «Por ahora solo se aceptan videos de YouTube»

#### Scenario: YouTube no responde
- **WHEN** la comprobación supera los 5 s o falla la red
- **THEN** no se guarda y la pantalla invita a intentar de nuevo

### Requirement: Crear y asignar por asignatura y grado
Una docente SHALL crear un material audiovisual con título, indicaciones opcionales, enlace, preguntas, asignatura y grado, apertura, cierre e intentos. Solo SHALL poder elegir combinaciones de asignatura y grado donde tenga una `AsignacionDocente` `ACTIVA` en el año activo. Al guardar, el sistema SHALL crear en una transacción la actividad, su versión y una asignación por cada grupo de ese grado donde la docente dicta esa asignatura (todos marcados por defecto, al menos uno). Los valores por defecto SHALL ser: abre ahora, cierra al fin del período vigente a las 23:59 hora de Colombia, 3 intentos y cuenta como nota. No hay revisión de coordinación.

#### Scenario: Dos grupos del mismo grado
- **WHEN** una docente que dicta Ciencias Naturales en 5.°A y 5.°B crea un material para Ciencias Naturales · 5.°
- **THEN** se crean dos asignaciones, una por grupo, y los estudiantes de ambos lo ven en su materia

#### Scenario: Grupo que no dicta
- **WHEN** la docente dicta en 5.°A pero no en 5.°B
- **THEN** solo se crea la asignación de 5.°A

#### Scenario: Asignatura ajena
- **WHEN** la docente envía una asignatura o un grado donde no dicta
- **THEN** la API responde `403`

#### Scenario: Aviso sobre datos personales
- **WHEN** la docente abre el formulario
- **THEN** ve un aviso de no escribir datos personales de estudiantes en el título, las indicaciones ni las preguntas

### Requirement: Editar y anular
La autora SHALL poder editar el título, las indicaciones, las fechas y los intentos en cualquier momento, sin bajar los intentos por debajo de los ya usados por algún estudiante. Video y preguntas SHALL ser editables solo mientras no haya intentos `ENVIADO`; al cambiarlos, los intentos `EN_CURSO` MUST pasar a `ABANDONADO`. La autora SHALL poder anular una asignación o todas: lo anulado sale de la vista del estudiante y conserva intentos y resultados. Las demás docentes MUST NOT editar ni anular.

#### Scenario: Cambiar preguntas con respuestas enviadas
- **WHEN** la autora intenta cambiar una pregunta y ya hay un intento enviado
- **THEN** la API responde `409` y la pantalla sugiere anular y crear otro material

#### Scenario: Ampliar el cierre
- **WHEN** la autora mueve el cierre a una fecha posterior dentro del período
- **THEN** la asignación queda abierta hasta la nueva fecha

#### Scenario: Anular
- **WHEN** la autora anula la asignación de 5.°A
- **THEN** los estudiantes de 5.°A dejan de verla y sus resultados se conservan

### Requirement: Seguimiento por estudiante
La autora y las docentes con `AsignacionDocente` `ACTIVA` en el grupo y la asignatura SHALL ver, por grupo, la lista de estudiantes con asociación vigente y, para cada uno: estado (sin empezar, vio el video, en curso, respondió), intentos usados, nota del mejor intento (0–100) y fecha del último envío, más un resumen con cuántos respondieron y el promedio. Después del cierre, quien no envió SHALL figurar «sin entregar», distinto de 0. Ningún estudiante MUST ver datos de otros.

#### Scenario: Vio pero no respondió
- **WHEN** un estudiante marcó «Ya lo vi» y no ha enviado respuestas
- **THEN** figura «vio el video» sin nota

#### Scenario: Docente sin asignación en el grupo
- **WHEN** una docente sin asignación activa en ese grupo pide el seguimiento
- **THEN** la API responde `404`
