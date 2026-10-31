## ADDED Requirements

### Requirement: Inicio y reanudación de intentos
Un estudiante SHALL poder iniciar un intento de una asignación visible si está abierta (entre apertura y cierre), no está anulada y no ha agotado su máximo de intentos. Un estudiante MUST NOT tener más de un intento `EN_CURSO` por asignación: si ya tiene uno, iniciar SHALL devolver ese mismo intento con sus respuestas guardadas.

#### Scenario: Reanudar en otro dispositivo
- **WHEN** un estudiante responde 3 ítems en una tableta, la cierra y abre la actividad en un computador
- **THEN** continúa el mismo intento con esos 3 ítems ya respondidos

#### Scenario: Intentos agotados
- **WHEN** un estudiante con máximo de 2 intentos y 2 enviados intenta iniciar otro
- **THEN** la API responde `409` con el motivo

#### Scenario: Asignación cerrada
- **WHEN** un estudiante intenta iniciar después de la fecha de cierre
- **THEN** la API responde `409` y no se crea el intento

### Requirement: Guardado de cada respuesta
Cada respuesta a un ítem SHALL guardarse en el servidor en el momento en que el estudiante la da, junto con la respuesta tal como la envió, el resultado calificado (acierto y puntaje), el tiempo empleado en el ítem y la fecha. Responder de nuevo el mismo ítem mientras el intento está `EN_CURSO` SHALL reemplazar la respuesta anterior y sumar 1 a su contador de cambios. El envío de una respuesta MUST ser idempotente.

#### Scenario: Reintento de red
- **WHEN** la tableta pierde conexión y reenvía dos veces la misma respuesta al mismo ítem
- **THEN** queda una sola respuesta para ese ítem

#### Scenario: Respuesta a un intento enviado
- **WHEN** se intenta responder un ítem de un intento ya `ENVIADO`
- **THEN** la API responde `409` y la respuesta guardada no cambia

### Requirement: Envío y cierre automático
El estudiante SHALL poder enviar un intento `EN_CURSO`, que pasa a `ENVIADO` con su puntaje, porcentaje y duración. Un intento que sigue `EN_CURSO` al llegar la fecha de cierre SHALL cerrarse automáticamente como `ENVIADO` con las respuestas que tenga, a más tardar la próxima vez que se lea esa asignación o ese intento.

#### Scenario: Envío
- **WHEN** el estudiante envía un intento con 8 de 10 ítems correctos, del mismo puntaje
- **THEN** el intento queda `ENVIADO` con porcentaje 80,00

#### Scenario: Cierre con intento abierto
- **WHEN** un intento queda `EN_CURSO` después de la fecha de cierre y la docente consulta los resultados
- **THEN** el intento aparece `ENVIADO`, calificado con las respuestas guardadas y marcado como cerrado automáticamente

### Requirement: Resultado por mejor intento
Por cada estudiante y asignación SHALL existir un resultado igual al **mayor porcentaje** entre sus intentos `ENVIADO`. Si hay empate, gana el intento enviado primero. El resultado SHALL guardar qué intento lo produjo y SHALL recalcularse en la misma transacción en que se envía o cierra un intento. Las asignaciones `ANULADA` o marcadas para no contar como nota SHALL quedar excluidas de las consultas de nota.

#### Scenario: Un intento peor no baja la nota
- **WHEN** un estudiante saca 90 en el primer intento y 70 en el segundo
- **THEN** su resultado sigue en 90 y apunta al primer intento

#### Scenario: Sin intentos enviados
- **WHEN** un estudiante no envió ningún intento antes del cierre
- **THEN** no tiene resultado, y la consulta de la docente lo muestra como «sin entregar», distinto de 0

### Requirement: Resultado expresado en porcentaje
El resultado SHALL expresarse como porcentaje de 0 a 100 con dos decimales. El sistema MUST NOT convertirlo a la escala del SIEE ni a desempeños (Superior, Alto, Básico, Bajo) hasta que esa escala se configure en un cambio posterior.

#### Scenario: Consulta de la docente
- **WHEN** la docente consulta los resultados de una asignación
- **THEN** ve por estudiante el porcentaje, el número de intentos y la fecha del mejor intento, sin etiqueta de desempeño

### Requirement: Consulta de resultados y resumen por referente
La docente SHALL poder consultar los resultados de sus asignaciones por grupo y período, y un resumen por referente curricular con el porcentaje promedio de aciertos de los ítems de las actividades alineadas con cada referente. Un estudiante SHALL ver solo sus propios intentos y resultados. Los ítems sin referente propio SHALL heredar los referentes de su actividad.

#### Scenario: Resumen por DBA
- **WHEN** la docente pide el resumen del período 2 de su grupo
- **THEN** obtiene, por cada DBA trabajado, el porcentaje promedio de aciertos y cuántos estudiantes tienen intentos enviados

#### Scenario: Estudiante consulta otro estudiante
- **WHEN** un estudiante pide los resultados de otro estudiante
- **THEN** la API responde `404`

### Requirement: Rendimiento del guardado
Guardar una respuesta SHALL responder en menos de 300 ms en p95 con 250 estudiantes respondiendo a la vez, para que el guardado inmediato no frene el juego.

#### Scenario: Carga simultánea
- **WHEN** la prueba de carga simula 250 estudiantes respondiendo un ítem cada 5 segundos durante 10 minutos
- **THEN** el p95 del guardado de respuestas es menor que 300 ms y no hay errores de unicidad
