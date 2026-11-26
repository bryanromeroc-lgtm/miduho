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

### Requirement: Música opcional en el quiz ilustrado
La presentación ilustrada de `seleccion-multiple` SHALL admitir `musica`, con un control independiente de los efectos y la voz.

#### Scenario: Música durante la partida
- **WHEN** el contenido trae `musica` y se pulsa «Jugar»
- **THEN** la pista se reproduce en bucle a volumen bajo, baja mientras habla la voz y el botón «Música: sí/no» expresa el estado con `aria-pressed`.

#### Scenario: Pausa y cierre
- **WHEN** la pestaña se oculta o la partida termina
- **THEN** la música se pausa y solo se reanuda al volver a la pestaña si sigue activada y la partida continúa.

#### Scenario: Sin música
- **WHEN** el contenido omite `musica`
- **THEN** el quiz comienza y suena exactamente como antes, sin pantalla «Jugar» ni control de música.

### Requirement: Guía sin imagen de situación
La presentación ilustrada SHALL mostrar `escena.personaje` aunque una pregunta no tenga `imagen`, con pose de reposo durante la elección, de señalar al acertar y de duda al fallar.

#### Scenario: Dos retratos y guía
- **WHEN** una pregunta tiene dos `imagenesOpciones`, no tiene `imagen` y el contenido incluye `escena.personaje`
- **THEN** la guía sigue visible en escritorio y teléfono sin tapar los botones, y las opciones conservan texto HTML y nombre accesible.

#### Scenario: Situación existente
- **WHEN** una pregunta sí tiene `imagen`
- **THEN** conserva la distribución y el tamaño de guía anteriores.

### Requirement: Orden opcional de preguntas por semilla
`seleccion-multiple` SHALL admitir `barajarPreguntas: true` para mezclar los turnos de forma reproducible con el mismo generador que mezcla las opciones.

#### Scenario: Orden barajado
- **WHEN** `barajarPreguntas` es verdadero
- **THEN** todas las preguntas aparecen una vez y se califican con su `id` e índice original de respuesta.

#### Scenario: Orden anterior
- **WHEN** el campo falta
- **THEN** el orden de preguntas y el flujo previo de barajado de opciones permanecen iguales.

### Requirement: Opciones ilustradas grandes junto a una situación
Cuando una pregunta de `seleccion-multiple` tiene dos opciones o menos y todas tienen imagen, el reproductor SHALL presentar las opciones como dos tarjetas grandes en columnas, también si la pregunta tiene imagen de situación. La imagen de la situación conserva su `alt` informativo; las imágenes de las opciones son decorativas porque sus botones tienen etiquetas HTML.

#### Scenario: Dos escenas de respuesta y una situación
- **WHEN** la pregunta muestra una situación y las dos opciones tienen imagen
- **THEN** las dos escenas se ven como tarjetas grandes en columnas, con imágenes de al menos aproximadamente 220 px a 1440×900, y se adaptan al teléfono sin desborde horizontal.

#### Scenario: Presentación anterior
- **WHEN** hay tres o más opciones, o falta la imagen de alguna opción
- **THEN** se conserva la distribución anterior de situación, opciones y guía.
