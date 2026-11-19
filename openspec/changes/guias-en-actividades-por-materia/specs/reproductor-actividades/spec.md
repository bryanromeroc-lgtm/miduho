## ADDED Requirements

### Requirement: La guía acompaña el juego y el resultado
La ruta de práctica libre SHALL mostrar el nombre y retrato de la guía de la asignatura junto al encabezado del juego y en el resultado. Los tipos que ya muestran a la guía en la escena MUST conservar una sola presencia protagonista dentro del tablero. La guía MUST NOT alterar generación de rondas, entradas, pistas, audio, puntuación o repaso.

#### Scenario: Tipo genérico de Matemáticas
- **WHEN** el estudiante abre «¿Primo o compuesto?» y termina la actividad
- **THEN** Armi aparece como guía en el juego y el resultado sin cambiar las respuestas ni la nota

#### Scenario: Juego con personajes secundarios
- **WHEN** el estudiante abre «Duelo de divisiones» o «El taller de los topos»
- **THEN** Armi identifica la materia y los robots o topos siguen siendo elementos de la mecánica, sin atribuirles la función de guía

#### Scenario: Juego con guía integrada
- **WHEN** el estudiante abre «La entrega de Armi»
- **THEN** Armi sigue protagonizando la escena y la identidad compacta no duplica una segunda figura grande
