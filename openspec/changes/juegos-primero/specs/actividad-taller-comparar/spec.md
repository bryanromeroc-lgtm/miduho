## ADDED Requirements

### Requirement: Laboratorio de comparación libre
El tipo `taller-comparar` SHALL mostrar dos colecciones entre 0 y 20 en marcos de diez, con contador y objeto seleccionable por lado. La lectura en palabras y símbolos SHALL actualizarse de inmediato. El laboratorio SHALL iniciar en 3 y 5, admitir reinicio y no calificar.

#### Scenario: Explorar sin nota
- **WHEN** se cambian cantidades u objetos en el laboratorio
- **THEN** cambian los marcos y la lectura sin llamar a `alTerminar`

#### Scenario: Límites
- **WHEN** un contador está en 0 o 20
- **THEN** el control indica el límite y no permite salir del rango

### Requirement: Retos de leer y construir
El taller SHALL presentar entre 4 y 10 retos en orden fijo, con un punto por primera respuesta. En `leer` se elige la relación de izquierda a derecha; en `construir` se ajusta la derecha y se comprueba la relación pedida.

#### Scenario: Varias respuestas válidas
- **WHEN** un reto pide que la derecha sea mayor que 11
- **THEN** cualquier entero de 12 a 20 es correcto

#### Scenario: Primer intento y ayuda
- **WHEN** falla la primera respuesta
- **THEN** se registra para la nota, se muestra una pista y se permite otro intento
- **WHEN** falla otra vez
- **THEN** se revela la solución y se permite seguir
