## ADDED Requirements

### Requirement: Presentación opcional de diálogo para selección múltiple
El sistema SHALL admitir `presentacion: "dialogo"` y un bloque `dialogo` de dos hablantes con identificadores únicos, nombre, imagen, texto alternativo y lados distintos. Cada pregunta SHALL indicar un hablante registrado y contar con grabación del enunciado y de cada opción. El otro hablante responde. El sistema SHALL rechazar datos incompletos.

#### Scenario: Diálogo válido
- **WHEN** una actividad de `seleccion-multiple` incluye dos hablantes, cinco preguntas con `hablante`, `audio` y `audioOpciones`
- **THEN** el catálogo la admite y cada pregunta conserva un punto máximo y la calificación por la primera respuesta

#### Scenario: Datos inválidos
- **WHEN** una pregunta cita un hablante ajeno o carece de grabación de una opción
- **THEN** el catálogo rechaza la actividad con un error de validación

### Requirement: Conversación accesible y continua
El sistema SHALL mostrar cada frase en globo HTML con nombre de hablante, ofrecer dos opciones reproducibles por audio y revelar la respuesta correcta con voz en ambos resultados. La respuesta revelada SHALL convertirse en el enunciado visible del siguiente turno sin reproducirse de nuevo automáticamente. La escena, música, guía y efecto del acompañante SHALL depender solo de datos opcionales. El audio podrá repetirse; no habrá límite de tiempo. El sistema SHALL permitir teclado y movimiento reducido.

#### Scenario: Acierto y fallo
- **WHEN** el estudiante elige una respuesta
- **THEN** se registra esa primera elección, se indica el resultado en texto, se muestra la respuesta correcta en el globo del otro hablante y suena su grabación

#### Scenario: Efecto de acompañante
- **WHEN** una pregunta incluye `alResponder` con un efecto y repeticiones
- **THEN** el sistema lo reproduce después de la voz de respuesta y anima el acompañante si así se declara

#### Scenario: Quiz anterior sin diálogo
- **WHEN** una actividad de `seleccion-multiple` omite `presentacion` y `dialogo`
- **THEN** conserva la presentación, sonidos y flujo de juego existentes
