## ADDED Requirements

### Requirement: Balanza de igualdades
El tipo `balanza` SHALL mostrar dos platillos con expresiones de suma o resta hasta 20. La balanza SHALL inclinarse hacia el lado de mayor valor y quedar nivelada solo cuando ambos lados valen lo mismo. La inclinación SHALL anunciarse también en texto: «pesa más la izquierda», «pesa más la derecha» o «está en equilibrio». El signo igual SHALL presentarse como «vale lo mismo que».

#### Scenario: Equilibrio
- **WHEN** el lado izquierdo es 3 + 4 y el derecho es 5 + 2
- **THEN** la balanza queda nivelada y se anuncia «está en equilibrio»

### Requirement: Retos para completar la igualdad
Los retos SHALL generarse de forma determinista por `semilla` en tres formas: `a + ? = c`, `a + b = ? + d` y `? − b = c`. El estudiante SHALL elegir la caja o el número entre opciones tocando primero la caja y luego el platillo, o escribirlo con el teclado. La balanza SHALL reaccionar a cada intento antes de comprobar.

#### Scenario: Igualdad con faltante a la derecha
- **WHEN** el reto es 4 + 3 = ? + 5 y el estudiante pone 2
- **THEN** la balanza se nivela y el reto se puede comprobar como correcto

#### Scenario: Error de «da»
- **WHEN** en 4 + 3 = ? + 5 el estudiante pone 7, como si el igual significara «da»
- **THEN** la balanza se inclina y la pista recuerda que los dos lados deben valer lo mismo

### Requirement: Calificación 2/1/0
Cada reto SHALL valer 2 al primer «Comprobar» correcto, 1 al segundo y 0 en otro caso. Tras el segundo fallo SHALL mostrarse la solución con la balanza nivelada. El laboratorio libre del principio no SHALL calificarse.

#### Scenario: Segundo intento
- **WHEN** el estudiante falla una vez y acierta después
- **THEN** el reto vale 1
