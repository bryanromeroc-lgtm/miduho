## ADDED Requirements

### Requirement: Formar palabras por rondas
El tipo `formar` SHALL presentar una imagen, sílabas como texto HTML y el mismo número de huecos ordenados por ítem. SHALL comprobar automáticamente al llenar los huecos.

#### Scenario: Barajado siempre distinto del orden correcto
- GIVEN un elemento de dos a seis sílabas
- WHEN comienza una partida con semilla
- THEN las fichas usan un único flujo aleatorio para toda la partida y nunca aparecen en el orden de la palabra

#### Scenario: Reintento y primer intento
- WHEN la composición es incorrecta
- THEN las fichas regresan y se puede reintentar sin límite
- AND la respuesta registrada conserva únicamente el primer orden completo
- AND el servidor otorga un punto solo si ese orden es correcto

#### Scenario: Uso con teclado
- WHEN el estudiante usa Tab, Enter o Espacio
- THEN puede colocar y retirar fichas sin arrastrarlas

#### Scenario: Movimiento reducido
- GIVEN la preferencia de movimiento reducido
- WHEN avanza a la siguiente ronda
- THEN cambia de parada sin desplazamiento animado

#### Scenario: Sin escena
- GIVEN contenido sin `escena`
- WHEN se juega
- THEN se muestran las rondas y controles sin personaje ni recorrido
