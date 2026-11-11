## ADDED Requirements

### Requirement: Programa de pasos en una cuadrícula
El tipo `cuadricula-instrucciones` SHALL mostrar una cuadrícula de hasta 6×6 con un personaje, una meta y obstáculos opcionales. Los niveles se declaran en el contenido. El estudiante SHALL armar una secuencia con los botones de instrucción «avanzar», «girar a la izquierda» y «girar a la derecha», y en los niveles que lo habiliten también «repetir N veces». Además tendrá los controles «borrar el último», «borrar todo» y «ejecutar». El personaje SHALL ejecutar la secuencia paso a paso, con el paso actual resaltado en la lista y anunciado en `status`.

#### Scenario: Llega a la meta
- **WHEN** la secuencia lleva al personaje a la casilla meta
- **THEN** se anuncia el logro y el nivel queda resuelto

#### Scenario: Choca con un obstáculo
- **WHEN** un «avanzar» lo llevaría a un obstáculo o fuera de la cuadrícula
- **THEN** el personaje se detiene en ese paso, el paso queda marcado y se puede corregir sin borrar todo

### Requirement: Modo inverso
En modo `inverso`, el nivel SHALL mostrar una secuencia ya armada, y el estudiante SHALL elegir en qué casilla termina el personaje, sin ejecutarla antes. Tras responder, la secuencia SHALL ejecutarse para comprobarlo.

#### Scenario: Predicción
- **WHEN** el estudiante elige una casilla y la secuencia termina en otra
- **THEN** la ejecución muestra el recorrido real y el aviso señala el primer paso en que se separó

### Requirement: Orientación con el propio cuerpo
Un nivel SHALL poder usar consignas relativas al personaje («delante», «detrás», «a su izquierda», «a su derecha») en lugar de rumbos, para la actividad de orientación espacial de Ciencias sociales.

#### Scenario: Izquierda del personaje
- **WHEN** el personaje mira hacia abajo y la consigna pide ir a su izquierda
- **THEN** la respuesta correcta es la casilla a la derecha de la pantalla, y la pista lo explica desde el personaje

### Requirement: Calificación por nivel
Cada nivel SHALL valer 2 si se resuelve en la primera ejecución, 1 si se resuelve en la segunda o la tercera, y 0 en otro caso. Tras la tercera ejecución fallida SHALL mostrarse una solución. Los niveles con `maxInstrucciones` SHALL aceptar solo las secuencias que no lo superen, para premiar el uso de «repetir». El estado SHALL ser determinista: la misma secuencia da el mismo recorrido en el cliente y en el servidor.

#### Scenario: Recalificación en el servidor
- **WHEN** el servidor recibe la secuencia enviada para un nivel
- **THEN** la simula y obtiene el mismo resultado que vio el estudiante

### Requirement: Accesible sin arrastre
Todas las instrucciones SHALL ser botones con teclas: flechas para las instrucciones, Retroceso para borrar y Enter para ejecutar. La cuadrícula SHALL describirse en texto para lectores de pantalla (posición del personaje, hacia dónde mira y dónde está la meta). Con `prefers-reduced-motion`, la ejecución SHALL mostrarse paso a paso sin animación de desplazamiento.

#### Scenario: Solo teclado
- **WHEN** el estudiante arma y ejecuta un nivel solo con el teclado
- **THEN** puede resolverlo y oír o leer cada paso
