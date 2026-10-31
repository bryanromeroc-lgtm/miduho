## ADDED Requirements

### Requirement: Contrato de tipo de actividad
Cada tipo de actividad SHALL implementar el contrato `DefinicionTipoActividad`, que declara: identificador `tipo`, `versionEsquema`, esquema Zod del contenido, esquema Zod de la respuesta a un ítem, una función que lista los ítems calificables con su puntaje máximo, una función que proyecta el contenido para el estudiante y una función pura que califica la respuesta a un ítem. Los tipos SHALL registrarse en un registro único, y el motor MUST NOT conocer detalles de ningún tipo concreto.

#### Scenario: Registro de un tipo
- **WHEN** se registra un tipo que cumple el contrato
- **THEN** la importación y el motor de intentos pueden usarlo sin cambiar su código

#### Scenario: Tipo duplicado
- **WHEN** se registran dos tipos con el mismo identificador y la misma `versionEsquema`
- **THEN** el registro falla al iniciar

### Requirement: Vista segura para el estudiante
El contenido que recibe el navegador de un estudiante SHALL salir de la proyección del tipo y MUST NOT incluir soluciones, claves de respuesta ni retroalimentación de acierto antes de que el ítem se califique.

#### Scenario: Contenido sin soluciones
- **WHEN** un estudiante pide el contenido de una actividad asignada
- **THEN** la respuesta no contiene ningún campo de solución definido por el tipo, y una prueba lo verifica para cada tipo registrado

### Requirement: Calificación en el servidor
La calificación SHALL ejecutarse solo en el servidor, con la versión exacta de la actividad del intento. El puntaje de un ítem MUST estar entre 0 y su puntaje máximo. El puntaje del intento SHALL ser la suma de los puntajes de sus ítems, y el porcentaje SHALL ser `puntaje / puntajeMaximo × 100`, redondeado a dos decimales.

#### Scenario: Puntaje enviado por el cliente
- **WHEN** el cliente envía una respuesta con un campo de puntaje o de acierto
- **THEN** el servidor lo ignora y calcula el puntaje con la función del tipo

#### Scenario: Ítems sin responder
- **WHEN** se envía un intento con ítems sin respuesta
- **THEN** esos ítems cuentan 0 y el porcentaje se calcula sobre el puntaje máximo total

### Requirement: Puntos de juego separados de la nota
Los puntos de juego que otorgue un tipo (por rapidez, rachas o similares) SHALL guardarse aparte y MUST NOT entrar en el porcentaje que cuenta como nota, que solo mide aciertos.

#### Scenario: Cuestionario tipo concurso
- **WHEN** dos estudiantes aciertan las mismas preguntas, uno más rápido que el otro
- **THEN** ambos obtienen el mismo porcentaje y solo difieren sus puntos de juego

### Requirement: Catálogo de tipos planeados
El diseño SHALL documentar los tipos planeados con su forma de contenido, de respuesta y de calificación: `seleccion-multiple` (incluye verdadero o falso), `emparejar`, `ordenar`, `clasificar`, `completar`, `memoria` y `concurso` (cuestionario de selección múltiple a ritmo propio, con temporizador por pregunta y puntos de juego). En este cambio MUST NOT implementarse ninguno: el único tipo registrado es uno de prueba que solo existe en las pruebas automatizadas.

#### Scenario: Registro en producción
- **WHEN** la app arranca en producción tras este cambio
- **THEN** el registro de tipos está vacío y la importación rechaza cualquier actividad con un mensaje que indica que el tipo no está implementado

### Requirement: Requisitos para los tipos futuros
Todo tipo que se implemente después SHALL cumplir WCAG 2.1 AA: operable con teclado y con toque, sin depender solo del color ni del arrastre (debe haber una alternativa por selección), con texto seleccionable y alternativa textual en las imágenes informativas. Si tiene temporizador, SHALL permitir ampliarlo o desactivarlo. SHALL funcionar en tabletas y computadores desde 768 px de ancho, y SHALL permitir instrucciones en audio para los grados en los que la lectura aún no es fluida.

#### Scenario: Criterio de aceptación de un tipo nuevo
- **WHEN** se propone implementar un tipo del catálogo
- **THEN** su cambio incluye pruebas de proyección segura, de calificación y una revisión con axe sin violaciones
