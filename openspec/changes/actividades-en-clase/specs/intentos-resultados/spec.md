## ADDED Requirements

### Requirement: El estudiante ve solo lo asignado
La vista de materia, «Mis materias» y «Mi agenda» SHALL mostrar al estudiante solo las asignaciones `PUBLICADA` de los grupos con los que tiene asociación vigente y cuya apertura ya pasó. Cada una SHALL indicar su estado: disponible, en curso, hecha (con estrellas), intentos agotados o cerrada. La práctica libre del catálogo completo MUST dejar de existir.

#### Scenario: Antes de la apertura
- **WHEN** el estudiante abre su materia antes de la apertura de una asignación
- **THEN** esa asignación no aparece ni viaja al navegador

#### Scenario: Actividad no asignada
- **WHEN** el estudiante abre la URL de una actividad del catálogo que no está asignada a su grupo
- **THEN** la página responde `404`

#### Scenario: Sin asignaciones
- **WHEN** la docente no ha asignado nada en una materia
- **THEN** la vista dice que aún no hay actividades, sin inventar ninguna

### Requirement: Iniciar un intento
Un estudiante SHALL poder iniciar un intento de una asignación abierta, no anulada y con intentos disponibles. MUST NOT existir más de un intento `EN_CURSO` por estudiante y asignación: iniciar de nuevo SHALL devolver el mismo intento. El contenido entregado SHALL ser el de la versión fijada en la asignación.

#### Scenario: Intentos agotados
- **WHEN** un estudiante con 3 intentos enviados de 3 intenta iniciar otro
- **THEN** la API responde `409` y la pantalla dice que ya usó sus intentos

#### Scenario: Asignación cerrada
- **WHEN** el estudiante intenta iniciar después del cierre
- **THEN** la API responde `409`

### Requirement: Envío y calificación en el servidor
Al terminar el juego, el reproductor SHALL enviar todas las respuestas del intento. El servidor SHALL validar cada respuesta con el esquema del tipo, calificarla con la función pura del tipo sobre la versión del intento, ignorar cualquier puntaje enviado por el cliente, guardar una respuesta por ítem, marcar el intento `ENVIADO` con su puntaje y su porcentaje (0–100, dos decimales) y devolver el resultado con su repaso, todo en una transacción. Reenviar un intento ya enviado SHALL devolver el mismo resultado sin recalcularlo.

#### Scenario: Puntaje enviado por el cliente
- **WHEN** el cliente incluye un campo de puntaje en el envío
- **THEN** el servidor lo ignora y califica con la función del tipo

#### Scenario: Reenvío por red inestable
- **WHEN** la tableta reenvía dos veces el mismo intento
- **THEN** hay un solo intento enviado y ambas respuestas devuelven el mismo resultado

#### Scenario: Ítems sin responder
- **WHEN** el envío no trae respuesta para 2 de 10 ítems
- **THEN** esos ítems cuentan 0, salvo en los tipos que califican solo lo respondido

### Requirement: Resultado por mejor intento
Por estudiante y asignación SHALL existir un resultado igual al mayor porcentaje entre sus intentos `ENVIADO`. En empate gana el primero enviado. El resultado SHALL recalcularse en la misma transacción del envío y guardar qué intento lo produjo. Las asignaciones anuladas o que no cuentan como nota SHALL quedar fuera de las estrellas por materia.

#### Scenario: Un intento peor no baja la nota
- **WHEN** el estudiante saca 90 y después 70
- **THEN** su resultado sigue en 90 y apunta al primer intento

### Requirement: Cierre automático y abandono
Un intento `EN_CURSO` de una asignación vencida SHALL pasar a `ABANDONADO` la próxima vez que se lea esa asignación o ese intento. Un intento `ABANDONADO` MUST NOT consumir intentos ni producir resultado. Un estudiante sin intentos enviados al cierre SHALL figurar como «sin entregar», distinto de 0.

#### Scenario: Juego abandonado
- **WHEN** el estudiante inicia un intento, no lo termina y la asignación cierra
- **THEN** el intento queda `ABANDONADO`, no tiene resultado y no cuenta en sus intentos usados

### Requirement: Experiencia del intento
El reproductor en modo intento SHALL mostrar el número de intento y el máximo («Intento 2 de 3»), y SHALL ofrecer «Jugar otra vez» solo si quedan intentos y la asignación sigue abierta. Si el envío falla por la red, SHALL conservar las respuestas en el navegador y reintentar, avisando al estudiante sin perder su partida.

#### Scenario: Último intento
- **WHEN** el estudiante envía su tercer intento de 3
- **THEN** ve su resultado y no aparece «Jugar otra vez»

#### Scenario: Corte de red al enviar
- **WHEN** la red falla al enviar y vuelve 20 segundos después
- **THEN** el envío se completa sin que el estudiante repita el juego

### Requirement: Desempeño en «Mis materias»
«Mis materias» SHALL mostrar por materia las estrellas del promedio de los mejores intentos que cuentan como nota, el avance (hechas sobre asignadas visibles) y la siguiente actividad abierta sin intento.

#### Scenario: Materia sin resultados
- **WHEN** el estudiante aún no envía ninguna actividad de una materia
- **THEN** el cromo no muestra estrellas ni cifras inventadas

### Requirement: Rapidez sin efecto en la nota
En toda actividad que cuenta como nota, el porcentaje SHALL depender solo de los aciertos, nunca del tiempo, y todo temporizador SHALL poder ampliarse o desactivarse (WCAG 2.2.1).

#### Scenario: Concurso con reloj
- **WHEN** dos estudiantes aciertan las mismas preguntas de un concurso, uno más rápido
- **THEN** ambos obtienen el mismo porcentaje
