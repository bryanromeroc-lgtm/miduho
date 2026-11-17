## ADDED Requirements

### Requirement: La tarjeta muestra la guía de la asignatura
Cada tarjeta curricular o asignada SHALL mostrar la imagen y el nombre de la guía resuelta para su asignatura, además de la portada o ilustración de la actividad. La guía MUST NOT cambiar el título, estado, desempeño, acción ni el único destino de foco de la tarjeta. Una portada que represente una guía distinta MUST reemplazarse antes de publicar la actividad.

#### Scenario: Tarjeta normal de Ciencias Naturales
- **WHEN** la vista de Ciencias Naturales muestra una actividad sin portada
- **THEN** la tarjeta muestra a Dora y conserva la ilustración temática del tipo

#### Scenario: Tarjeta con portada
- **WHEN** una actividad tiene portada propia
- **THEN** la tarjeta muestra la guía correcta y la portada no representa a una guía de otra materia

#### Scenario: Tarjeta audiovisual asignada
- **WHEN** Comprensión Lectora muestra el material audiovisual de la docente
- **THEN** la tarjeta muestra a Bruno y conserva su estado e información de intentos

#### Scenario: Tarjeta destacada de Matemáticas
- **WHEN** aparece «La entrega de Armi»
- **THEN** conserva a Armi sin una figura grande duplicada y mantiene un solo enlace accesible
