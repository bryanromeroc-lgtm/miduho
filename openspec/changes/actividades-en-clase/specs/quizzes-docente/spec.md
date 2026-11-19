## ADDED Requirements

### Requirement: La docente crea quizzes para sus asignaturas y grados
Un usuario `DOCENTE` SHALL poder crear actividades de tipo `seleccion-multiple`, `concurso` o `completar` solo para una asignatura y un grado en los que tenga una `AsignacionDocente` `ACTIVA` en el año activo. El quiz nace como `BORRADOR` y su autora es quien lo crea.

#### Scenario: Creación válida
- **WHEN** una docente de Matemáticas de 5.°-01 crea un quiz de Matemáticas de 5.°
- **THEN** queda un `BORRADOR` de origen `DOCENTE` con ella como autora

#### Scenario: Asignatura ajena
- **WHEN** esa docente intenta crear un quiz de Inglés de 5.° sin tener esa asignación
- **THEN** la API responde `403` y no se crea nada

### Requirement: Contenido validado con el esquema del tipo
El contenido de un quiz SHALL validarse con el esquema Zod de su tipo, en el editor y otra vez en el servidor. Los textos SHALL guardarse como texto plano. El quiz MUST NOT admitir imágenes en esta versión.

#### Scenario: Pocas preguntas
- **WHEN** la docente intenta publicar un quiz con 2 preguntas
- **THEN** el editor muestra el error junto al campo y el servidor responde `422` si se le envía igual

#### Scenario: HTML en un enunciado
- **WHEN** un enunciado contiene `<script>`
- **THEN** se guarda y se muestra como texto literal, sin ejecutarse

### Requirement: Alineación al crear
Para publicar un quiz, la docente SHALL elegir un tema de la malla de su asignatura y grado, que precarga sus referentes. Si el área tiene DBA, el quiz MUST quedar con al menos un `DBA` o `EVIDENCIA`. El quiz guarda referentes, no el tema.

#### Scenario: Quiz de Ciencias Naturales sin DBA
- **WHEN** la docente quita todos los DBA de un quiz de Ciencias Naturales e intenta publicarlo
- **THEN** la publicación se rechaza indicando que falta un DBA

### Requirement: Vista previa
La docente SHALL poder jugar su quiz, o cualquier actividad de su catálogo, en el reproductor en modo vista previa, sin crear intentos ni resultados.

#### Scenario: Vista previa de un borrador
- **WHEN** la docente abre la vista previa de un borrador y lo responde
- **THEN** ve el resultado y el repaso, y no se guarda ningún intento

### Requirement: Compartir con la misma asignatura y grado
Un quiz `PUBLICADA` SHALL aparecer en el catálogo de toda docente con una `AsignacionDocente` `ACTIVA` de esa asignatura en un grupo de ese grado. Un `BORRADOR` SHALL ser visible solo para su autora. Lo que una docente no puede ver SHALL responder `404`.

#### Scenario: Colega del mismo grado
- **WHEN** la docente de Matemáticas de 5.°-02 abre su catálogo
- **THEN** ve el quiz publicado por la docente de Matemáticas de 5.°-01, marcado como de una colega

#### Scenario: Borrador ajeno
- **WHEN** una colega pide un borrador de otra docente
- **THEN** la API responde `404`

### Requirement: Una sola versión, editable hasta la primera asignación
Solo la autora SHALL editar su quiz, y solo mientras ninguna asignación lo use. La primera asignación SHALL congelar su única versión. Desde entonces, editar MUST responder `409`. Un quiz de docente MUST NOT tener más de una versión.

#### Scenario: Edición antes de asignar
- **WHEN** la autora corrige una opción de un quiz publicado que nadie ha asignado
- **THEN** el cambio se guarda y lo verán las colegas

#### Scenario: Edición después de asignar
- **WHEN** una colega asigna el quiz y luego la autora intenta editarlo
- **THEN** la API responde `409` y el editor ofrece duplicarlo

#### Scenario: Colega intenta editar
- **WHEN** una colega intenta editar un quiz que no es suyo
- **THEN** la API responde `404`

### Requirement: Duplicar
Una docente SHALL poder duplicar como `BORRADOR` propio cualquier quiz que pueda ver y cualquier actividad `CURRICULO` de tipo `seleccion-multiple`, `concurso` o `completar` de su catálogo. La copia conserva los referentes y registra de qué actividad viene.

#### Scenario: Duplicar del catálogo del colegio
- **WHEN** la docente duplica la actividad del currículo «¿Qué harías tú?»
- **THEN** obtiene un borrador suyo con las mismas preguntas y referentes, que puede editar

### Requirement: Borrar o retirar
La autora SHALL poder borrar su quiz. Si ninguna asignación del quiz tiene intentos, el quiz y sus asignaciones SHALL borrarse. Si alguna tiene intentos, el quiz SHALL pasar a `RETIRADA`: sale del catálogo, no admite asignaciones nuevas, las asignaciones abiertas siguen hasta su cierre y se conservan intentos y resultados. Un `ADMIN` SHALL poder retirar cualquier quiz de docente.

#### Scenario: Borrar sin intentos
- **WHEN** la autora borra un quiz asignado a dos grupos donde nadie lo ha jugado
- **THEN** el quiz y las dos asignaciones desaparecen

#### Scenario: Borrar con notas
- **WHEN** la autora borra un quiz que tres estudiantes ya enviaron
- **THEN** el quiz queda `RETIRADA`, sigue abierto para ese grupo hasta su cierre y las notas se conservan

### Requirement: Aviso de datos personales
El editor SHALL mostrar de forma permanente que no se deben escribir nombres ni datos de estudiantes.

#### Scenario: Abrir el editor
- **WHEN** la docente abre el editor de un quiz
- **THEN** el aviso es visible y lo anuncia el lector de pantalla
