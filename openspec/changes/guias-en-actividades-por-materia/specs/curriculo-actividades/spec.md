## ADDED Requirements

### Requirement: El catálogo verifica la guía de cada asignatura
La validación del catálogo SHALL recorrer todas las actividades curriculares y comprobar que su asignatura tiene guía definida. También SHALL detectar referencias visibles y recursos de una guía ajena en título, instrucción, narración, portada y escena específica. Una actividad que incumpla MUST hacer fallar la verificación antes de su publicación.

#### Scenario: Materia sin guía
- **WHEN** un archivo curricular pertenece a una asignatura sin guía
- **THEN** la verificación falla e identifica asignatura y archivo

#### Scenario: Guía ajena en contenido
- **WHEN** una actividad de Ciencias Sociales nombra a Armi como guía o usa una portada con Armi
- **THEN** la verificación falla e identifica la actividad y la referencia incompatible

#### Scenario: Personaje secundario
- **WHEN** «Duelo de divisiones» incluye robots y la asignatura Matemáticas tiene a Armi como guía
- **THEN** la verificación permite los robots como personajes de juego y exige la presencia de Armi en la experiencia
