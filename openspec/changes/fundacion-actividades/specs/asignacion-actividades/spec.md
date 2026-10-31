## ADDED Requirements

### Requirement: La docente asigna actividades del catálogo
Un usuario con rol `DOCENTE` SHALL poder asignar una actividad `ACTIVA` a un grupo solo si tiene una `AsignacionDocente` `ACTIVA` para la misma asignatura y ese grupo en el año lectivo vigente, y si el grado de la actividad coincide con el del grupo. La asignación SHALL fijar la versión vigente de la actividad en ese momento.

#### Scenario: Asignación válida
- **WHEN** una docente de Matemáticas de 2.°-01 asigna una actividad de Matemáticas de 2.° a ese grupo
- **THEN** se crea la asignación con la versión vigente de la actividad

#### Scenario: Grupo ajeno
- **WHEN** una docente intenta asignar a un grupo o asignatura donde no tiene asignación activa
- **THEN** la API responde `403` y no se crea nada

#### Scenario: Grado distinto
- **WHEN** una docente intenta asignar a un grupo de 3.° una actividad de 2.°
- **THEN** la API responde `422` con el motivo

### Requirement: Parámetros de la asignación
Cada asignación SHALL tener fecha de apertura, fecha de cierre posterior a la apertura, período académico, máximo de intentos (entero ≥ 1, o sin límite) y si cuenta como nota (por defecto, sí). El período MUST pertenecer al año lectivo del grupo, y la fecha de cierre MUST caer dentro de ese período.

#### Scenario: Cierre fuera del período
- **WHEN** se asigna con una fecha de cierre posterior al fin del período elegido
- **THEN** la API responde `422`

#### Scenario: Valores por defecto
- **WHEN** se asigna sin indicar máximo de intentos ni si cuenta como nota
- **THEN** la asignación queda con intentos sin límite y contando como nota

### Requirement: Edición y anulación de asignaciones
La docente SHALL poder cambiar las fechas y el máximo de intentos de sus asignaciones. Solo SHALL poder cambiar la versión de la actividad o el período mientras no exista ningún intento. Anular una asignación SHALL marcarla `ANULADA`, sacarla de la vista de los estudiantes y de la nota, y conservar sus intentos.

#### Scenario: Cambio de versión con intentos
- **WHEN** la docente intenta pasar a la versión 2 una asignación que ya tiene intentos
- **THEN** la API responde `409` y la asignación sigue en la versión 1

#### Scenario: Anulación
- **WHEN** la docente anula una asignación con intentos
- **THEN** los estudiantes dejan de verla, su resultado deja de contar como nota y los intentos siguen en la base

### Requirement: Visibilidad para el estudiante
Un estudiante SHALL ver solo las asignaciones `PUBLICADA` de los grupos con los que tiene asociación vigente, a partir de su fecha de apertura. La lista SHALL indicar el estado de cada una: pendiente, en curso, enviada, cerrada, y cuántos intentos le quedan.

#### Scenario: Antes de la apertura
- **WHEN** un estudiante consulta sus actividades antes de la fecha de apertura de una asignación
- **THEN** esa asignación no aparece

#### Scenario: Estudiante de otro grupo
- **WHEN** un estudiante pide una asignación de un grupo al que no pertenece
- **THEN** la API responde `404`

### Requirement: Consulta del catálogo por la docente
La docente SHALL poder listar las actividades `ACTIVA` de las asignaturas y grados donde tiene asignación activa, filtrando por período sugerido y por referente curricular.

#### Scenario: Filtro por referente
- **WHEN** la docente filtra su catálogo por un DBA
- **THEN** solo aparecen actividades alineadas con ese DBA y de sus asignaturas y grados
