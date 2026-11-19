## ADDED Requirements

### Requirement: Audio opcional en el contenido
El contenido de una actividad SHALL admitir audio grabado opcional en la instrucción (`audioInstruccion`) y, según el tipo, en cada pregunta, opción, tarjeta, elemento o escena (campo `audio`), como ruta bajo `/audio/`. Los tipos que lo admiten en este cambio son: `seleccion-multiple`, `clasificar`, `ordenar`, `emparejar`, `aventura`, `golpea` (modo preguntas) y los cinco tipos nuevos. Un contenido sin audio SHALL seguir siendo válido.

#### Scenario: Quiz con opciones habladas
- **WHEN** un quiz de 1.° declara `audio` en cada opción
- **THEN** el esquema lo acepta y cada opción muestra su botón de escuchar

#### Scenario: Contenido antiguo
- **WHEN** se valida una actividad de 5.° sin campos de audio
- **THEN** sigue siendo válida y se juega igual que antes

### Requirement: Rutas de audio existentes
La prueba del currículo SHALL fallar si una actividad cita una ruta de audio que no existe en `apps/web/public/`.

#### Scenario: Ruta rota
- **WHEN** una actividad cita `/audio/consignas/x.mp3` y el archivo no existe
- **THEN** `curriculo.test.ts` falla nombrando la actividad y la ruta

### Requirement: Botón «Escuchar»
Cada texto con audio SHALL tener un botón «Escuchar» con nombre accesible («Escuchar: <texto>»), objetivo táctil ≥ 44 px, operable con teclado y foco visible. Al sonar un audio SHALL detenerse cualquier otro audio de voz en curso. El texto SHALL estar siempre también escrito: el audio no reemplaza el texto.

#### Scenario: Escuchar una opción
- **WHEN** el estudiante pulsa «Escuchar» en una opción mientras suena la consigna
- **THEN** la consigna se detiene y suena la opción

### Requirement: Respaldo con voz del navegador
Si un texto no tiene audio grabado y el grado de la actividad es 1.° o 2.°, el reproductor SHALL ofrecer «Escuchar» con la voz en español del navegador (`comun/voz.ts`). Si el navegador no tiene voz en español, el botón MUST NOT aparecer y la actividad SHALL jugarse igual.

#### Scenario: Sin grabación en 1.°
- **WHEN** una opción de 1.° no tiene `audio` y el navegador tiene voz es-CO o es-419
- **THEN** «Escuchar» lee la opción con la síntesis

#### Scenario: Navegador sin voz
- **WHEN** no hay voz en español disponible
- **THEN** no se muestra el botón y todo el texto sigue visible

### Requirement: Lectura automática en 1.°
En actividades de 1.°, la consigna de cada ítem SHALL sonar sola al aparecer, después del gesto inicial de «Jugar». SHALL haber un control visible «Leer en voz alta: sí/no» que la desactive y recuerde la preferencia en el dispositivo. La lectura automática MUST NOT superar una pista por ítem ni repetirse sola (WCAG 1.4.2).

#### Scenario: Consigna automática
- **WHEN** un estudiante de 1.° pasa al ítem siguiente con la lectura activada
- **THEN** suena una vez la consigna del ítem

#### Scenario: Lectura desactivada
- **WHEN** el estudiante apaga «Leer en voz alta»
- **THEN** ningún ítem suena solo y el botón «Escuchar» sigue disponible

### Requirement: Voz separada de efectos y música
El audio de voz SHALL controlarse aparte de los efectos y la música: apagar los efectos (`useSonido`) o la música MUST NOT silenciar la voz de la tarea, y la voz SHALL bajar el volumen de la música mientras suena.

#### Scenario: Efectos apagados
- **WHEN** el estudiante apaga los efectos y pulsa «Escuchar»
- **THEN** la voz suena
