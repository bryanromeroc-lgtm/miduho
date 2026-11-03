## ADDED Requirements

### Requirement: Mis clases con datos reales
«Mis clases» SHALL listar las `AsignacionDocente` `ACTIVA` de la docente en el año activo (asignatura · grupo), y la pantalla de la clase SHALL identificarse por esa asignación. Una asignación ajena SHALL responder `404`.

#### Scenario: Docente con dos clases
- **WHEN** una docente con Matemáticas en 5.°-01 y en 5.°-02 abre «Mis clases»
- **THEN** ve esas dos clases y ninguna otra

#### Scenario: Clase ajena
- **WHEN** una docente abre la URL de la clase de otra docente
- **THEN** la página responde `404`

### Requirement: Catálogo de la docente ordenado por la malla
La pestaña Actividades de la clase SHALL mostrar las actividades `PUBLICADA` de la asignatura y el grado de la clase (del colegio, de colegas y propias), agrupadas por período y tema de la malla según los referentes compartidos. Las que no coincidan con ningún tema SHALL aparecer en «Otras de tu grado». SHALL poder filtrarse por período, tema, DBA, tipo y origen.

#### Scenario: Agrupación por tema
- **WHEN** una actividad comparte un DBA con un tema del período 2
- **THEN** aparece bajo ese tema en el período 2

#### Scenario: Filtro por origen
- **WHEN** la docente filtra «De colegas»
- **THEN** solo ve quizzes publicados por otras docentes de su asignatura y grado

### Requirement: Asignar a uno o varios grupos
La docente SHALL poder asignar una actividad de su catálogo a uno o varios de sus grupos de la misma asignatura y grado, con período, apertura, cierre, máximo de intentos y si cuenta como nota. Por defecto SHALL abrir de inmediato, cerrar al fin del período vigente a las 23:59 hora de Colombia, permitir 3 intentos y contar como nota. La asignación SHALL fijar la versión que se juega.

#### Scenario: Asignación con valores por defecto
- **WHEN** la docente asigna una actividad a 5.°-01 sin cambiar nada en el diálogo
- **THEN** se crea la asignación con 3 intentos, cuenta como nota y cierre al fin del período vigente

#### Scenario: Dos grupos a la vez
- **WHEN** la docente asigna la actividad a 5.°-01 y 5.°-02
- **THEN** se crean dos asignaciones en una sola operación

#### Scenario: Grupo ajeno
- **WHEN** la petición incluye un grupo donde la docente no tiene esa asignatura
- **THEN** la API responde `403` y no se crea ninguna asignación

#### Scenario: Cierre fuera del período
- **WHEN** el cierre elegido es posterior al fin del período
- **THEN** la API responde `422`

#### Scenario: Asignación repetida
- **WHEN** la docente asigna dos veces la misma actividad al mismo grupo y período
- **THEN** la segunda responde `409` y queda una sola asignación

### Requirement: Editar y anular asignaciones
La docente SHALL poder cambiar fechas e intentos de sus asignaciones, sin bajar los intentos por debajo de los ya usados por algún estudiante. SHALL poder cambiar el período solo mientras no haya intentos. Anular SHALL sacar la asignación de la vista del estudiante y de la nota, conservando sus intentos.

#### Scenario: Ampliar el cierre
- **WHEN** la docente amplía el cierre de una asignación con intentos, dentro del período
- **THEN** el cambio se guarda y los estudiantes pueden seguir jugando

#### Scenario: Anular con intentos
- **WHEN** la docente anula una asignación que ya tiene intentos
- **THEN** los estudiantes dejan de verla y los intentos siguen en la base

### Requirement: Lista de asignadas
La pestaña Actividades SHALL listar las asignaciones de la clase por período, con título, tipo, apertura, cierre, intentos, si cuenta como nota y estado (por abrir, abierta, cerrada, anulada).

#### Scenario: Asignación por abrir
- **WHEN** la docente programa una actividad para la próxima semana
- **THEN** aparece en la lista como «por abrir», con su fecha de apertura
