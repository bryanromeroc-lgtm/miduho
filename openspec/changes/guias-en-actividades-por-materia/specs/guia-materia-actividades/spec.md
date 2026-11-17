## ADDED Requirements

### Requirement: Una guía verificable por materia con actividades
Cada asignatura que publique actividades SHALL resolver una guía original de MIDUHO a partir de la identidad de la asignatura. La guía MUST ser la misma en «Mis materias», la vista de materia, las tarjetas, el reproductor y el resultado. La resolución MUST NOT depender del tipo, título, portada ni contenido de una actividad. Una asignatura sin guía MUST NOT publicar nuevas actividades y MUST recibir un error de validación explícito.

#### Scenario: Materia con guía
- **WHEN** se consulta una actividad de Ciencias Sociales
- **THEN** la identidad resuelta es Andi y no Armi, independientemente del tipo de actividad

#### Scenario: Publicación docente sin guía
- **WHEN** una docente intenta publicar material para una asignatura que no tiene guía definida
- **THEN** la publicación se rechaza con un error que identifica la falta de guía y no se crea una asignación

### Requirement: Educación Religiosa tiene una guía propia
Educación Religiosa SHALL tener una escena y una guía original propias, con nombre, especie e imagen definidos antes de publicar el cambio. La interfaz MUST NOT atribuirle la guía de Ética ni una guía genérica silenciosa. La guía SHALL acompañar sus cinco actividades curriculares actuales.

#### Scenario: Estudiante abre Educación Religiosa
- **WHEN** el estudiante entra a Educación Religiosa y abre cualquiera de sus actividades
- **THEN** ve la misma guía propia en la materia, la tarjeta y la actividad

### Requirement: Guía accesible y secundaria al contenido
La presencia visual de la guía SHALL conservar preguntas, instrucciones, video y resultados como texto HTML legible. La imagen decorativa SHALL usar `alt=""` cuando su nombre visible aparezca junto a ella; si la imagen aporta información que el texto no expresa, SHALL tener texto alternativo equivalente. La guía MUST NOT crear un control de foco adicional. En escritorio y móvil MUST conservarse contraste WCAG 2.1 AA, foco visible y ausencia de desbordamiento horizontal.

#### Scenario: Recorrido con teclado
- **WHEN** el estudiante recorre una tarjeta y luego el juego con Tab
- **THEN** la tarjeta mantiene un solo foco y la guía no agrega una parada de tabulación

#### Scenario: Pantalla pequeña
- **WHEN** la actividad se muestra a 360 px de ancho
- **THEN** la guía no tapa la consigna, las respuestas, el video ni el botón principal

### Requirement: Continuidad en material asignado
El material audiovisual asignado SHALL mostrar la guía de su asignatura en la tarjeta, la pantalla de video y preguntas, y el resultado. La guía MUST NOT cambiar el requisito «Ya lo vi», las respuestas, los intentos ni la nota.

#### Scenario: Material de Comprensión Lectora
- **WHEN** el estudiante abre y termina un material audiovisual asignado a Comprensión Lectora
- **THEN** Bruno aparece como guía en la actividad y el resultado, mientras la calificación permanece igual
