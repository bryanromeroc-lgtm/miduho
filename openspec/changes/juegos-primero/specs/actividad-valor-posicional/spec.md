## ADDED Requirements

### Requirement: Tablero de decenas y unidades
El tipo `valor-posicional` SHALL mostrar un tablero con una columna de decenas y otra de unidades, para cantidades de 0 a 99. Tendrá botones «+1», «−1», «+10» y «−10», «Agrupar 10 unidades en una decena» y «Desagrupar una decena», además de la lectura del número en cifras y en palabras. Ninguna acción MUST exigir arrastrar.

#### Scenario: Agrupar
- **WHEN** el tablero tiene 12 unidades y el estudiante pulsa «Agrupar»
- **THEN** queda 1 decena más y 2 unidades, el número sigue siendo el mismo y se anuncia en `status`

#### Scenario: Agrupar sin diez unidades
- **WHEN** hay menos de 10 unidades
- **THEN** «Agrupar» está deshabilitado y su nombre accesible explica por qué

### Requirement: Laboratorio libre y retos
La actividad SHALL empezar con un laboratorio libre, que no se califica, y seguir con retos calificados, según el patrón de `simuladores-miduho`. Hay tres clases de reto:
- `construir`: armar el número dictado;
- `leer`: escribir el número que muestra el tablero;
- `componer10`: encontrar una pareja que sume 10.

El contenido SHALL elegir las clases, el rango y el número de retos. Los retos SHALL generarse de forma determinista por `semilla`.

#### Scenario: Retos deterministas
- **WHEN** se generan los retos dos veces con el mismo contenido
- **THEN** son idénticos

#### Scenario: Componer 10
- **WHEN** el reto es `componer10` con 7 unidades a la vista
- **THEN** se acierta al dejar 3 unidades más, y no repetir una descomposición ya usada cuenta como evidencia distinta

### Requirement: Calificación con error que enseña
Cada reto SHALL valer 2 si se resuelve al primer «Comprobar», 1 si se resuelve al segundo y 0 en otro caso. Tras el segundo fallo SHALL mostrarse la solución en el tablero. La pista SHALL depender del error: decenas y unidades invertidas, o diferencia de 10, o diferencia de 1.

#### Scenario: Decenas y unidades invertidas
- **WHEN** el reto es construir 42 y el estudiante arma 24
- **THEN** la pista dice que revise cuántas decenas pide el número

### Requirement: Audio del número
Cada cambio del tablero SHALL poder escucharse: el número en palabras, con audio grabado o síntesis. El dictado del reto `construir` SHALL ser audio y texto a la vez.

#### Scenario: Dictado
- **WHEN** empieza un reto `construir` en 1.°
- **THEN** suena el número dictado y también se ve escrito en cifras
