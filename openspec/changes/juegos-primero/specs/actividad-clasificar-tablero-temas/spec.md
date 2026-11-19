# Delta: temas del tablero de clasificar

## ADDED Requirements

### Requirement: Tema visual y sonoro opcional
El contenido de `clasificar` MAY incluir `tema: "girasol" | "corcho"` en la presentación `tablero`. El tablero MUST escoger tanto los estilos como la carpeta de efectos del tema.

#### Scenario: Sin tema se ve como antes
- **GIVEN** una actividad de tablero sin `tema`
- **WHEN** se abre y juega
- **THEN** conserva disposición, colores, efectos y mecánica girasol existentes

#### Scenario: Corcho
- **GIVEN** `tema: "corcho"`
- **WHEN** se abre y juega
- **THEN** la pila aparece sobre los grupos, las notas muestran imagen y palabra, y se oyen los efectos de `agrupar-corcho`

### Requirement: Escena opcional del tablero
El contenido MAY incluir `escena` con la forma compartida (`fondo`, `personaje.nombre`, `reposo`, `senala`, `duda`). La guía MUST quedar fuera de los controles y usar `reposo` al jugar, `senala` en aciertos, `duda` en fallos y al final `senala` solo si hay más aciertos que fallos. La reacción MUST sincronizar pose y efecto en cuatro tiempos; MUST respetar movimiento reducido.

#### Scenario: Tablero sin escena
- **GIVEN** una actividad sin `escena`
- **WHEN** se juega
- **THEN** no se muestra guía y todos los controles siguen operativos

### Requirement: Lectura oral alternativa
Cada elemento de `clasificar` MAY incluir `lectura`. Si existe, «Escuchar» MUST pronunciarla; la palabra visible y la calificación MUST seguir usando `texto`. En 1.° la consigna MUST leerse automáticamente según la preferencia compartida.

#### Scenario: Forma con barra
- **GIVEN** `texto: "Tranquilo/a"` y `lectura: "tranquilo o tranquila"`
- **WHEN** se activa «Escuchar»
- **THEN** se pronuncia la lectura alternativa y la tarjeta continúa mostrando «Tranquilo/a»
