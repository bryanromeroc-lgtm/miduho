## ADDED Requirements

### Requirement: Orden de opciones configurable
El contenido de `seleccion-multiple` y `concurso` SHALL admitir `barajarOpciones: false` para conservar el orden escrito de las opciones durante toda la partida.

#### Scenario: Opciones en orden fijo
- **WHEN** el contenido establece `barajarOpciones: false`
- **THEN** cada pregunta presenta sus opciones en el orden del contenido, con la misma calificación por índice.

#### Scenario: Campo ausente
- **WHEN** el contenido omite `barajarOpciones`
- **THEN** las opciones se barajan con la semilla como antes.

### Requirement: Quiz ilustrado opcional
El contenido de `seleccion-multiple` y `concurso` SHALL admitir una escena compartida y efectos grabados opcionales. Cada pregunta SHALL poder tener una imagen informativa con `alt` obligatorio y una lista de imágenes de opciones alineada con las opciones, con `null` para opciones sin imagen.

#### Scenario: Pregunta con situación y caras
- **WHEN** una pregunta tiene `imagen`, `alt` e `imagenesOpciones`
- **THEN** el reproductor muestra la situación grande con su descripción accesible y cada imagen de opción decorativa junto a su texto HTML y botón «Escuchar» si tiene audio.

#### Scenario: Guía y efectos
- **WHEN** el contenido trae `escena.personaje` y `efectos`
- **THEN** el personaje usa reposo durante la elección, señala al acertar y duda al fallar, y los efectos grabados se sincronizan con la reacción y el avance.

#### Scenario: Sin campos nuevos
- **WHEN** una actividad anterior omite imagen, imágenes de opciones, escena y efectos
- **THEN** el quiz conserva su presentación, sonido, interacción y calificación anteriores.

#### Scenario: Accesibilidad y calificación
- **WHEN** se juega con teclado y se selecciona una opción
- **THEN** se registra la primera elección, se anuncia la explicación como texto y se puede avanzar sin usar puntero.
