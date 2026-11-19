## ADDED Requirements

### Requirement: Presentación «casillas» de ordenar
`ordenar` SHALL admitir `presentacion: "casillas"` con 3 a 12 elementos de ID único, semilla reproducible, pila barajada y una casilla numerada por elemento. SHALL permitir colocar, cambiar y devolver fichas por arrastre, toque y teclado. «Enviar respuestas» SHALL habilitarse con al menos una ficha colocada y aceptar casillas vacías. Habrá un solo envío por partida, sin pistas intermedias. Se revelarán las casillas de la primera a la última con ✓ o ✗ y sonido; al terminar, cada casilla fallada o vacía mostrará la solución. «Volver a jugar» SHALL iniciar otra partida con barajado reproducible.

La presentación SHALL leer el título y la consigna de la actividad compartida. Podrá declarar `escena.fondo` y `escena.personaje` (nombre y poses `reposo`, `senala`, `duda`) con rutas locales `/images/….webp`; sin escena SHALL funcionar sin personaje. Las fichas libres SHALL recomponer la pila, y la solución SHALL quedar dentro de la casilla sin mover las filas. El aviso de una casilla vacía o errónea SHALL nombrar su posición y la solución. El personaje SHALL acompañar el revelado en cuatro tiempos, con movimiento reducido respetado.

La presentación tendrá un solo ítem `orden`, con `puntajeMaximo` igual al número de elementos. Su respuesta SHALL ser un arreglo de exactamente ese número de posiciones, cada una `id | null`. Un ID no podrá aparecer dos veces ni ser ajeno al contenido. Cada posición correcta valdrá un punto; una posición errónea o vacía valdrá cero. La misma función pura SHALL recalificar en servidor a partir del contenido y la respuesta, sin confiar en el contador visual.

#### Scenario: Doce meses
- **WHEN** el contenido declara los doce meses en orden y `presentacion: "casillas"`
- **THEN** aparecen doce fichas y doce destinos numerados; el máximo es 12 puntos

#### Scenario: Envío con vacías
- **WHEN** se coloca al menos una ficha y se envía con otras posiciones vacías
- **THEN** se revelan las doce posiciones en orden, las vacías valen 0 y al final muestran su solución

#### Scenario: Contenido antiguo compatible
- **WHEN** un contenido `ordenar` no declara `presentacion`
- **THEN** conserva la lista de 3 a 8 elementos, la respuesta `string[]` y la calificación anterior de un punto por posición

#### Scenario: Recalificación en servidor
- **WHEN** el servidor recibe una respuesta con longitud errónea, ID duplicado o ID ajeno
- **THEN** la respuesta se rechaza para puntaje y no se acepta el contador del cliente
