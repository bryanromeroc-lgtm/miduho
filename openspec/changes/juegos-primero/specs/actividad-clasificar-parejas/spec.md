## ADDED Requirements

### Requirement: Presentación «parejas» de clasificar
`clasificar` SHALL admitir `presentacion: "parejas"` con dos categorías, de 4 a 12 elementos en número par, y una imagen por elemento. Cada `pareja` SHALL agrupar exactamente dos elementos, uno por categoría. El orden de rondas y de piezas SHALL depender de la semilla reproducible. Las dos categorías SHALL permanecer visibles como destinos en cada ronda.

Las piezas SHALL poder colocarse por arrastre, toque y teclado. Una ubicación incorrecta SHALL devolver la pieza a su origen; una correcta SHALL dejarla en su destino. La primera ubicación de cada elemento SHALL quedar como respuesta del ítem y no cambiará al corregir. Tras dos fallos seguidos de una misma pieza, esta SHALL colocarse automáticamente en la categoría correcta y mostrar su explicación cuando exista. Al colocar las dos piezas, SHALL sonar `fin-ronda` y avanzar automáticamente; tras la última ronda SHALL sonar `fin` y mostrarse el resultado con «Volver a jugar». No habrá «Corregir», reloj ni ranking.

La presentación SHALL usar, cuando existan, la escena y las tres poses del personaje, con cuatro tiempos de reacción al acierto y una duda suave al fallo. En 1.° SHALL leer automáticamente la consigna una vez y ofrecer «Escuchar» en cada pieza. El resultado SHALL anunciarse con `role="status"`, conservar foco visible y respetar movimiento reducido. La calificación SHALL conservar la regla existente de `clasificar`: un punto por elemento si la primera ubicación fue su categoría.

#### Scenario: Primera ubicación errónea
- **WHEN** una pieza se lleva primero a la categoría equivocada y después a la correcta
- **THEN** vuelve tras el primer fallo, termina en su destino al corregir y su respuesta conserva la categoría equivocada

#### Scenario: Dos fallos de una pieza
- **WHEN** una pieza se lleva dos veces seguidas a la categoría equivocada
- **THEN** se coloca sola en su destino y se muestra su explicación si existe

#### Scenario: Fin de las seis rondas
- **WHEN** los doce objetos de seis parejas están correctamente colocados
- **THEN** se reproduce el fin y aparece el resultado con opción de volver a jugar; la nota se calcula sobre doce primeras ubicaciones

#### Scenario: Contenido anterior
- **WHEN** una actividad `clasificar` no declara `presentacion: "parejas"`
- **THEN** conserva su presentación y calificación previas
