# actividad-ruta-palabras Specification

## Purpose
TBD - created by archiving change tipo-ruta-palabras. Update Purpose after archive.
## Requirements
### Requirement: Rondas deterministas por configuración
El tipo `ruta-palabras` SHALL generar sus rondas solo a partir del contenido (`semilla`, `rondas`, `silabas` ∈ {2, 3, 4, "mixtas"}, `ritmo` ∈ {tranquilo, carrera}), de modo que cliente y servidor obtengan las mismas palabras, distractores y carriles.

#### Scenario: Misma configuración, mismas rondas
- **WHEN** se generan las rondas dos veces con el mismo contenido
- **THEN** ambas listas son idénticas en palabras, orden de carteles y carril correcto

#### Scenario: Sílabas pedidas
- **WHEN** `silabas` es 3
- **THEN** las tres palabras de cada ronda tienen tres sílabas

### Requirement: Distractores por error de lectura
Cada ronda SHALL tener tres carteles con palabras distintas: la correcta y dos distractores elegidos con preferencia (1) la misma sílaba inicial y longitud, (2) una sola letra distinta, (3) la misma cantidad de sílabas.

#### Scenario: Palabras distintas
- **WHEN** se genera una ronda
- **THEN** hay exactamente una palabra correcta y no hay palabras repetidas

#### Scenario: Sin repetir la correcta seguido
- **WHEN** hay 10 rondas
- **THEN** la palabra correcta no se repite dentro de 6 rondas seguidas y el carril correcto no es el mismo dos rondas seguidas

### Requirement: Calificación 2/1/0 por ronda
La respuesta de cada ronda SHALL ser la lista de palabras elegidas (máximo 2). La ronda vale 2 si la primera es la correcta, 1 si lo es la segunda y 0 en otro caso.

#### Scenario: Acierto al segundo intento
- **WHEN** la respuesta es `[palabra incorrecta, palabra correcta]`
- **THEN** la calificación es `{ correcta: false, puntaje: 1 }`

#### Scenario: Ronda sin responder
- **WHEN** la ronda no tiene respuesta
- **THEN** vale 0

### Requirement: Juego accesible, con ritmo tranquilo y pausa
Cada cartel SHALL ser un botón con la palabra en HTML, operable con Tab/Enter, con ↑/↓ y Enter para el carril ocupado y con 1, 2 y 3, y SHALL existir un control para mostrar la palabra buscada por escrito (alternativa al audio). El resultado SHALL anunciarse en una región `status`. En ritmo `tranquilo` no SHALL haber contacto automático ni reloj; en `carrera` SHALL haber un botón de pausa que detenga el avance. La escena SHALL ser `aria-hidden` y respetar `prefers-reduced-motion`.

#### Scenario: Elección por teclado
- **WHEN** el estudiante pulsa 2
- **THEN** se registra la elección del cartel del carril central

#### Scenario: Segundo fallo
- **WHEN** el estudiante falla dos veces en una ronda
- **THEN** se señala la palabra correcta, el aviso la dice y se avanza

#### Scenario: Pausa en carrera
- **WHEN** el ritmo es carrera y se pulsa «Pausa»
- **THEN** los carteles dejan de avanzar y no hay contacto automático hasta reanudar

#### Scenario: Alternativa al audio
- **WHEN** el estudiante activa «Mostrar la palabra escrita»
- **THEN** el panel muestra «Busca: <palabra>» en cada ronda y la calificación no cambia

