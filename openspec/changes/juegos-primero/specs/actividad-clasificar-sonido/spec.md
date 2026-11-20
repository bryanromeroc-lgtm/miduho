# actividad-clasificar-sonido

## ADDED Requirements

### Requirement: Tarjeta de solo sonido en tablero
El contenido de `clasificar` SHALL aceptar `tarjetas: "sonido"` solo con presentación `tablero` y audio en cada elemento. El tablero SHALL mostrar «Sonido N», numerado según la posición barajada, sin imagen ni nombre antes de abrir la pista o revelar. Activar la tarjeta SHALL reproducir su audio y seleccionarla; SHALL permitir volver a escucharla y ubicarla con toque, arrastre o teclado.

#### Scenario: Escuchar y clasificar
Dado un tablero con diez elementos de sonido, al empezar se ven diez botones «Sonido N». Al activar uno suena su audio y queda seleccionado. Al activar una cesta, se ubica allí sin mostrar su identidad.

### Requirement: Pista accesible sin penalización
Cada tarjeta SHALL ofrecer un botón «Ver pista del sonido N» con `aria-expanded`. Al abrirlo SHALL mostrar imagen o símbolo y nombre en texto HTML. Abrir o cerrar la pista SHALL conservar la respuesta y el puntaje.

#### Scenario: Abrir pista
Dada una tarjeta sin revelar, al activar «Ver pista» se muestra su nombre y su imagen o símbolo; el botón indica expansión. Se puede cerrar y volver a escuchar.

### Requirement: Efectos por evento
El contenido SHALL aceptar `efectos` opcionales para inicio, levantar, soltar, acierto, fallo, revelar y fin, con ruta o lista de rutas. Cada evento definido SHALL sustituir solo ese sonido del tema; los demás SHALL conservar los sonidos del tema.

#### Scenario: Error y fin personalizados
Con `fallo` y `fin` definidos, cada tarjeta incorrecta reproduce el fallo al revelarse y la validación final reproduce fin; los demás eventos conservan los sonidos girasol.

### Requirement: Compatibilidad del tablero existente
Sin `tarjetas`, `simbolo` ni `efectos`, el tablero SHALL conservar la presentación, sonidos, controles y calificación anteriores.

#### Scenario: Juegos existentes
`vivo-o-no-vivo` y `como-se-siente` siguen usando sus temas, tarjetas visibles y efectos previos.
