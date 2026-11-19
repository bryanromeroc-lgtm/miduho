## ADDED Requirements

### Requirement: Rondas deterministas por configuración
El tipo `golpea` SHALL generar la lista de rondas solo a partir del contenido de la actividad (`semilla`, `rondas`, `rango` ∈ {10, 20, 100}, `operaciones` ⊆ {suma, resta} no vacío, `llevadas`), de modo que cliente y servidor obtengan exactamente las mismas operaciones y opciones.

#### Scenario: Misma configuración, mismas rondas
- **WHEN** se generan las rondas dos veces con el mismo contenido
- **THEN** ambas listas son idénticas en operación, resultado, opciones y orden

#### Scenario: Resultados dentro del rango
- **WHEN** el rango es 100
- **THEN** cada resultado y cada opción está entre 1 y 100 y ningún operando es negativo

### Requirement: Opciones con distractores por error típico
Cada ronda SHALL ofrecer 7 u 8 opciones distintas: la respuesta y distractores tomados primero de respuesta ±1, ±2, ±10, ±20 (±5 en lugar de ±20 en rangos 10 y 20) y dos valores al azar del rango, descartando los que salgan del rango.

#### Scenario: Una sola respuesta correcta
- **WHEN** se genera una ronda
- **THEN** exactamente una opción es igual al resultado y no hay opciones repetidas

#### Scenario: Huecos de la cuadrícula
- **WHEN** se genera una ronda
- **THEN** cada opción ocupa un hueco distinto entre 0 y 9

### Requirement: Llevadas y sin repeticiones recientes
Con `llevadas: false` ninguna suma SHALL requerir llevar ni ninguna resta desagrupar; con `llevadas: true` al menos la mitad de las rondas de rango 20 o 100 SHALL requerirlo. Un resultado no SHALL repetirse dentro de 6 rondas seguidas cuando el rango lo permita.

#### Scenario: Sin llevadas
- **WHEN** `llevadas` es falso y el rango es 100
- **THEN** en cada suma la suma de las unidades es menor que 10 y en cada resta las unidades del minuendo son mayores o iguales que las del sustraendo

### Requirement: Calificación 2/1/0 por ronda
La respuesta de cada ronda SHALL ser la lista de valores golpeados (máximo 2). La ronda vale 2 si el primer valor es el resultado, 1 si lo es el segundo y 0 en otro caso.

#### Scenario: Acierto al segundo golpe
- **WHEN** la respuesta es `[valor incorrecto, resultado]`
- **THEN** la calificación es `{ correcta: false, puntaje: 1 }`

#### Scenario: Ronda sin responder
- **WHEN** la ronda no tiene respuesta
- **THEN** vale 0

### Requirement: Juego accesible y sin presión de tiempo
El juego SHALL mostrar la operación y los números en HTML, cada topo SHALL ser un botón operable con Tab/Enter y con las teclas 1–0, el resultado de cada golpe SHALL anunciarse en una región `status`, y no SHALL haber reloj. La escena decorativa SHALL ser `aria-hidden` y respetar `prefers-reduced-motion`.

#### Scenario: Golpe por teclado
- **WHEN** el estudiante pulsa la tecla del hueco de un topo visible
- **THEN** se registra el golpe como si hubiera hecho clic

#### Scenario: Segundo fallo
- **WHEN** el estudiante falla dos veces en una ronda
- **THEN** se marca la respuesta correcta, el aviso la dice en palabras y se avanza a la siguiente ronda
