## ADDED Requirements

### Requirement: Rondas deterministas por configuración
El tipo `mapa` SHALL generar la lista de rondas solo a partir del contenido de la actividad (`mapa` = `colombia-departamentos`, `semilla`, `rondas`, `regiones` ⊆ {caribe, andina, pacifica, orinoquia, amazonia, insular} no vacío, `fronteras`), de modo que cliente y servidor obtengan exactamente los mismos departamentos en el mismo orden.

#### Scenario: Misma configuración, mismas rondas
- **WHEN** se generan las rondas dos veces con el mismo contenido
- **THEN** ambas listas son idénticas en departamentos y orden

#### Scenario: Sin repetir y dentro de las regiones
- **WHEN** se generan las rondas
- **THEN** ningún departamento se repite y todos pertenecen a las regiones elegidas

#### Scenario: Más rondas que departamentos
- **WHEN** `rondas` es mayor que el número de departamentos de las regiones elegidas
- **THEN** el contenido no es válido

### Requirement: Geometría completa y con licencia
El mapa SHALL incluir las 33 unidades (32 departamentos y Bogotá D. C.) con nombre en español de Colombia, región natural, trazado SVG, centro y vecinos, generados desde una fuente de dominio público registrada en el repositorio.

#### Scenario: Vecindad simétrica
- **WHEN** un departamento A lista a B como vecino
- **THEN** B lista a A como vecino

### Requirement: Calificación 2/1/0 por ronda
La respuesta de cada ronda SHALL ser la lista de departamentos tocados (máximo 2). La ronda vale 2 si el primero es el pedido, 1 si lo es el segundo y 0 en otro caso.

#### Scenario: Acierto al segundo toque
- **WHEN** la respuesta es `[otro departamento, departamento pedido]`
- **THEN** la calificación es `{ correcta: false, puntaje: 1 }`

#### Scenario: Ronda sin responder
- **WHEN** la ronda no tiene respuesta
- **THEN** vale 0

### Requirement: Pista según el error
Al tocar un departamento equivocado el juego SHALL mostrar su nombre y una pista que dependa de la relación con el pedido: vecino (dirección desde el tocado), misma región (dirección) u otra región (nombre de la región del pedido y dirección).

#### Scenario: Toca un vecino
- **WHEN** se pide Caldas y se toca Antioquia
- **THEN** la pista dice que Caldas está al sur de Antioquia

#### Scenario: Toca otra región
- **WHEN** se pide Amazonas y se toca La Guajira
- **THEN** la pista nombra la región Amazonía

### Requirement: Juego accesible y sin presión de tiempo
La consigna y el resultado SHALL estar en HTML, cada departamento SHALL ser operable con Tab y Enter o Espacio, las flechas SHALL mover el foco al departamento más cercano en esa dirección, el resultado de cada toque SHALL anunciarse en una región `status`, y no SHALL haber reloj. Un departamento sin resolver no SHALL anunciar su nombre. Los efectos SHALL respetar `prefers-reduced-motion`.

#### Scenario: Toque por teclado
- **WHEN** el estudiante enfoca un departamento y pulsa Enter
- **THEN** se registra el toque como si hubiera hecho clic

#### Scenario: Segundo fallo
- **WHEN** el estudiante falla dos veces en una ronda
- **THEN** se señala el departamento pedido, el aviso lo dice en palabras y se avanza a la siguiente ronda
