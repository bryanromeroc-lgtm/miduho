## ADDED Requirements

### Requirement: Aventura narrada opcional
El tipo `aventura` SHALL aceptar un cuento sin `carga`, con narración, pregunta de tres opciones, pista, segundo intento y explicación. La primera respuesta de cada escena SHALL determinar su punto.

#### Scenario: Cuento sin carga
- **WHEN** una aventura omite `carga` y las escenas declaran `imagen` y `alt`
- **THEN** el juego muestra el relato y las preguntas sin carreta ni textos de reparto

#### Scenario: Guía de la escena
- **WHEN** el contenido declara `escena.personaje` con poses
- **THEN** ese personaje guía las escenas y cambia de pose al acertar o fallar

#### Scenario: Imagen por escena
- **WHEN** una escena declara `imagen`
- **THEN** su ilustración se muestra con texto alternativo, y `lugar` puede omitirse

### Requirement: Secuencia final calificable
La secuencia opcional SHALL ordenar tres dibujos en casillas rotuladas, aceptar toque, arrastre y teclado, y registrar solo el primer envío para su punto. Tras un error SHALL ofrecer pista y segundo intento; tras dos errores SHALL revelar el orden y continuar.

#### Scenario: Secuencia final
- **WHEN** se envía el orden correcto en el primer intento
- **THEN** el servidor califica un punto adicional a los de las escenas

### Requirement: Compatibilidad de la aventura existente

#### Scenario: La entrega de Armi se comporta como antes
- **WHEN** el contenido omite los campos nuevos
- **THEN** La entrega de Armi se ve, suena, juega y califica exactamente como antes
