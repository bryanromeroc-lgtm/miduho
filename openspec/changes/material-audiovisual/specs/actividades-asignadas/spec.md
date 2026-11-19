## ADDED Requirements

### Requirement: Lo asignado en la vista de materia
La vista de materia del estudiante SHALL mostrar primero las asignaciones `PUBLICADA` de su grupo en esa asignatura con apertura ya pasada, cada una con su estado (disponible, en curso, hecha con estrellas del mejor resultado, intentos agotados o cerrada) y su cierre, y después la práctica libre que existe hoy. Lo que aún no abre o está anulado MUST NOT aparecer ni viajar al navegador.

#### Scenario: Material nuevo
- **WHEN** la docente asigna un material audiovisual a 5.°A en Ciencias Naturales
- **THEN** un estudiante de 5.°A lo ve primero en su vista de Ciencias Naturales, marcado como disponible

#### Scenario: Antes de la apertura
- **WHEN** el estudiante abre su materia antes de la apertura
- **THEN** la asignación no aparece

#### Scenario: Asignación ajena
- **WHEN** un estudiante abre `/materias/[asignatura]/asignadas/[asignacionId]` de un grupo que no es el suyo
- **THEN** la página responde `404`

### Requirement: Ver el video dentro de MIDUHO
La página de la asignación SHALL mostrar las indicaciones como texto y el video incrustado desde `youtube-nocookie.com`, con subtítulos activados por defecto, sin videos de otros canales al terminar (`rel=0`), con el inicio y el fin elegidos por la docente, en un contenedor responsive y con un `title` descriptivo. MUST NOT cargar el script de la API IFrame. Si el video no carga, SHALL ofrecer un enlace para abrirlo en YouTube.

#### Scenario: Teléfono
- **WHEN** el estudiante abre la actividad en una pantalla de 360 px de ancho
- **THEN** el video ocupa el ancho disponible en proporción 16:9, sin desplazamiento horizontal

### Requirement: «Ya lo vi» desbloquea las preguntas
Las preguntas SHALL mostrarse solo después de que el estudiante pulse «Ya lo vi», que el servidor registra en el intento. Al desbloquearse, el foco SHALL pasar a la primera pregunta y un aviso `aria-live` SHALL anunciarlo. El video SHALL seguir disponible mientras responde. El servidor MUST rechazar con `409` el envío de un intento sin «Ya lo vi».

#### Scenario: Desbloqueo
- **WHEN** el estudiante pulsa «Ya lo vi»
- **THEN** aparecen las preguntas, el foco va a la primera y se anuncia «Ya puedes responder»

#### Scenario: Envío sin ver
- **WHEN** se envía al servidor un intento sin «Ya lo vi» registrado
- **THEN** la API responde `409` y no se califica

### Requirement: Resultado y nuevos intentos
Al enviar, el estudiante SHALL ver su resultado calculado por el servidor (porcentaje y estrellas), el repaso de cada pregunta con la respuesta correcta y la explicación si existe, y «Intento N de M». SHALL poder intentar de nuevo solo si le quedan intentos y la asignación sigue abierta. Si el envío falla por red, el cliente SHALL guardar las respuestas en `sessionStorage` y reintentar.

#### Scenario: Último intento
- **WHEN** el estudiante envía su tercer intento de tres
- **THEN** ve su resultado sin la opción de intentar de nuevo, y la tarjeta queda «hecha» con su mejor nota

#### Scenario: Corte de red al enviar
- **WHEN** la red falla al enviar
- **THEN** las respuestas no se pierden y el envío se reintenta al volver la conexión
