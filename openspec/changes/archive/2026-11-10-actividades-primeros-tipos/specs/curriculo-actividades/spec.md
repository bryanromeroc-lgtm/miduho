## ADDED Requirements

### Requirement: Archivos de actividad validados
Cada archivo `curriculo/actividades/<asignatura>/<grado>/<slug>.json` SHALL validarse con el esquema general y el de su tipo; el slug MUST coincidir con el archivo y ser único, y el grado con la carpeta. Un archivo inválido MUST NOT llegar al catálogo.

#### Scenario: Respuesta fuera de rango
- **WHEN** una pregunta marca como correcta una opción que no existe
- **THEN** el archivo queda fuera y la prueba del currículo falla con el error

### Requirement: Práctica libre en la vista de materia
Mientras no existan asignaciones de la docente, la vista de materia SHALL listar el currículo de la asignatura y del grado del grupo como actividades disponibles, sin límite de intentos, y la tarjeta MUST decir «Práctica libre».

#### Scenario: Estudiante de 5.°
- **WHEN** un estudiante de 5.° abre una de sus materias
- **THEN** ve sus cinco actividades «Para jugar», cada una con su tipo y «Práctica libre»
