## ADDED Requirements

### Requirement: Actividad de docente con una versión
El sistema SHALL guardar cada actividad creada por una docente como una `Actividad` de origen `DOCENTE`, con su autora, asignatura y grado, y una única `VersionActividad` número 1 con el tipo, la versión de esquema, el contenido validado por el esquema del tipo y el puntaje máximo. La base MUST rechazar una actividad `DOCENTE` sin autora.

#### Scenario: Contenido inválido
- **WHEN** se intenta crear una actividad cuyo contenido no cumple el esquema de su tipo
- **THEN** no se guarda nada y la API responde `400` con los errores del esquema

#### Scenario: Actividad sin autora
- **WHEN** se inserta directamente en la base una actividad `DOCENTE` sin `autorId`
- **THEN** la base rechaza la fila por la restricción `CHECK`

### Requirement: La versión no cambia después de la primera respuesta
La base MUST impedir cambiar o borrar una `VersionActividad` que tenga al menos un intento `ENVIADO`.

#### Scenario: Cambiar una versión con respuestas
- **WHEN** se intenta actualizar el contenido de una versión con un intento enviado
- **THEN** el trigger rechaza la operación

#### Scenario: Cambiar una versión sin respuestas
- **WHEN** se actualiza el contenido de una versión sin intentos enviados
- **THEN** la base acepta el cambio

### Requirement: Asignación a grupos
Una `AsignacionActividad` SHALL unir una versión con un grupo, la `AsignacionDocente` que la respalda y un período, con apertura, cierre, máximo de intentos y si cuenta como nota. MUST cumplirse: `cierraEn > abreEn`, `maxIntentos` entre 1 y 5, cierre dentro del período, y una `AsignacionDocente` `ACTIVA` de la misma asignatura y grupo. MUST NOT existir dos asignaciones `PUBLICADA` de la misma versión al mismo grupo.

#### Scenario: Doble envío del formulario
- **WHEN** llega dos veces la misma asignación para el mismo grupo
- **THEN** solo existe una asignación `PUBLICADA` y la segunda petición responde `409`

#### Scenario: Grupo de otra docente
- **WHEN** una docente intenta asignar a un grupo donde no tiene asignación docente activa en esa asignatura
- **THEN** la API responde `403` y no se crea nada

#### Scenario: Cierre fuera del período
- **WHEN** la fecha de cierre cae después del fin del período
- **THEN** la API responde `400`

### Requirement: Intento único en curso
Un estudiante con asociación vigente al grupo SHALL poder iniciar un intento de una asignación `PUBLICADA` y abierta mientras le queden intentos. MUST NOT existir más de un intento `EN_CURSO` por estudiante y asignación: iniciar de nuevo SHALL devolver el mismo intento.

#### Scenario: Retomar
- **WHEN** el estudiante inicia un intento teniendo uno `EN_CURSO`
- **THEN** recibe ese mismo intento

#### Scenario: Intentos agotados
- **WHEN** un estudiante con 3 intentos enviados de 3 intenta iniciar otro
- **THEN** la API responde `409`

#### Scenario: Fuera de fechas
- **WHEN** el estudiante intenta iniciar antes de la apertura o después del cierre
- **THEN** la API responde `409`

#### Scenario: Estudiante de otro grupo
- **WHEN** un estudiante sin asociación vigente al grupo intenta iniciar
- **THEN** la API responde `404`

### Requirement: Calificación en el servidor y mejor intento
Al enviar, el servidor SHALL validar cada respuesta con el esquema del tipo, calificar con `calificarIntento` sobre la versión de la asignación, ignorar cualquier puntaje del cliente, guardar una `RespuestaItem` por ítem, marcar el intento `ENVIADO` con su puntaje y su porcentaje (0–100, dos decimales) y recalcular `ResultadoActividad` con el mejor porcentaje (en empate, el primero), todo en una transacción. Reenviar un intento ya enviado SHALL devolver el mismo resultado sin recalcularlo.

#### Scenario: Puntaje falsificado
- **WHEN** el cliente envía un campo `puntaje: 100` junto con respuestas incorrectas
- **THEN** el servidor ignora ese campo y guarda el porcentaje calculado

#### Scenario: Mejor intento
- **WHEN** el estudiante obtiene 60 en el primer intento y 80 en el segundo
- **THEN** su resultado es 80 y apunta al segundo intento

#### Scenario: Reenvío
- **WHEN** el cliente reenvía un intento ya `ENVIADO`
- **THEN** recibe el mismo resultado y no se crean respuestas nuevas

### Requirement: Cierre perezoso
Antes de leer asignaciones o intentos, el sistema SHALL pasar a `ABANDONADO` los intentos `EN_CURSO` de asignaciones vencidas. Un intento `ABANDONADO` MUST NOT consumir intento ni producir resultado.

#### Scenario: Vence con intento abierto
- **WHEN** pasa el cierre con un intento `EN_CURSO` y luego alguien consulta la asignación
- **THEN** el intento queda `ABANDONADO` y el estudiante sin envíos figura «sin entregar»
