## ADDED Requirements

### Requirement: Escenas con elección y consecuencia
El tipo `dilemas` SHALL presentar una secuencia de escenas declaradas en el contenido. Cada escena tiene ilustración con `alt`, narración en texto con `audio` opcional y de 2 a 4 opciones de acción. Cada opción SHALL llevar a una escena de consecuencia que muestre cómo se siente cada personaje. Los personajes SHALL ser ficticios y MUST NOT tener nombres de personas reales del colegio.

#### Scenario: Elegir una acción
- **WHEN** el estudiante elige «Invitarlo a jugar» en la escena del recreo
- **THEN** ve la consecuencia, con la emoción del personaje dicha en palabras y en la ilustración

### Requirement: Clasificación de respuestas sin castigo
Cada opción SHALL clasificarse en el contenido como `asertiva`, `pasiva` o `agresiva`. En las escenas de reconocimiento, la clasificación será `correcta` o `incorrecta`. Una opción no asertiva SHALL mostrar su consecuencia y luego invitar a probar otra, sin mensajes de fracaso, castigo ni sonidos de error fuertes.

#### Scenario: Respuesta agresiva
- **WHEN** el estudiante elige empujar al compañero
- **THEN** ve la consecuencia, se le pregunta cómo se siente el otro personaje y puede volver a elegir

### Requirement: Detectar la emoción
Una escena SHALL poder pedir que se identifique la emoción de un personaje entre opciones, con imagen y palabra, antes de elegir cómo ayudar.

#### Scenario: Detective de emociones
- **WHEN** la escena muestra a un personaje que perdió su juguete
- **THEN** el estudiante elige primero «triste» entre varias emociones y después cómo ayudarlo

### Requirement: Calificación
Cada escena calificable SHALL valer 2 si la primera elección es asertiva o correcta, 1 si lo es la segunda y 0 en otro caso. El repaso SHALL mostrar, para cada escena, la opción asertiva y por qué ayuda. La narración de 1.° SHALL sonar sola según `audio-en-actividades`.

#### Scenario: Repaso
- **WHEN** termina la actividad
- **THEN** el repaso lista cada escena con la respuesta asertiva y una frase de por qué ayuda
