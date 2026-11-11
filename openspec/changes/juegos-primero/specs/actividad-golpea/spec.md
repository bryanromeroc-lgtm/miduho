## MODIFIED Requirements

### Requirement: Rondas deterministas por configuración
El tipo `golpea` SHALL tener dos modos, `operaciones` (por defecto, el actual) y `preguntas`. En modo `operaciones`, SHALL generar la lista de rondas solo a partir del contenido de la actividad (`semilla`, `rondas`, `rango` ∈ {10, 20, 100}, `operaciones` ⊆ {suma, resta} no vacío, `llevadas`). En modo `preguntas`, las rondas SHALL salir de la lista `preguntas` del contenido, y la `semilla` SHALL fijar solo el hueco de cada opción. En ambos modos, cliente y servidor SHALL obtener exactamente las mismas rondas, opciones y huecos. Un contenido sin `modo` SHALL leerse como `operaciones`.

#### Scenario: Misma configuración, mismas rondas
- **WHEN** se generan las rondas dos veces con el mismo contenido
- **THEN** ambas listas son idénticas en operación, resultado, opciones y orden

#### Scenario: Resultados dentro del rango
- **WHEN** el rango es 100
- **THEN** cada resultado y cada opción está entre 1 y 100 y ningún operando es negativo

#### Scenario: Contenido existente
- **WHEN** se valida `el-taller-de-los-topos.json`, que no tiene `modo`
- **THEN** se juega en modo `operaciones` con las mismas rondas que antes del cambio

## ADDED Requirements

### Requirement: Modo preguntas
En modo `preguntas`, cada pregunta del contenido SHALL tener:
- `consigna`: texto, con `audio` opcional;
- de 2 a 8 `opciones`, cada una con `texto` o `imagen` (con `alt`) y `audio` opcional;
- exactamente una opción `correcta`.

La respuesta de una ronda SHALL ser la lista de índices de opción golpeados (máximo 2), y SHALL calificarse 2/1/0 igual que en modo `operaciones`. Tras el segundo fallo SHALL revelarse la opción correcta. Las pistas de error SHALL salir del campo `pista` opcional de la pregunta.

#### Scenario: Izquierda y derecha
- **WHEN** la consigna es «Golpea el topo que está a la izquierda del árbol» y el estudiante golpea primero el de la derecha y luego el correcto
- **THEN** la ronda vale 1 y el aviso muestra la `pista` de la pregunta

#### Scenario: Opción con imagen
- **WHEN** una opción solo tiene `imagen`
- **THEN** su botón tiene como nombre accesible el `alt` de la imagen

### Requirement: Audio en modo preguntas
En modo `preguntas`, la consigna SHALL sonar al empezar cada ronda en las actividades de 1.° (`audio-en-actividades`). La tecla `R` y un botón «Escuchar otra vez» SHALL repetirla. Mientras suena la consigna, los topos SHALL quedar visibles y golpeables: el audio no bloquea la respuesta.

#### Scenario: Armi says
- **WHEN** la ronda de inglés dice «Touch the red pencil»
- **THEN** la consigna suena sin traducción, el texto en inglés queda escrito y la tecla R la repite
