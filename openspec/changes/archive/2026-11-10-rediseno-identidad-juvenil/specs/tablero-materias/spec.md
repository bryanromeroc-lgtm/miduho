## ADDED Requirements

### Requirement: Inicio del estudiante como tablero de materias
Cuando el contexto de la sesión es ESTUDIANTE, la ruta `/` SHALL mostrar «Mis materias»: un tablero con un cromo por cada asignatura asignada a su grupo, un avatar posado sobre el cromo elegido y un panel lateral con la materia elegida. El inicio del estudiante MUST NOT mostrar el friso del día ni la clase de ahora.

#### Scenario: Estudiante entra al inicio
- **WHEN** un estudiante con asociación activa a un grupo abre `/`
- **THEN** ve «Mis materias» con un cromo por cada asignatura de su grupo, con la primera elegida

#### Scenario: Estudiante sin grupo
- **WHEN** un estudiante sin asociación activa abre `/`
- **THEN** ve el tablero vacío con el mensaje «Aún no tienes un grupo asignado. Pídele ayuda a tu docente.»

### Requirement: Asignaturas del grupo, con datos reales
Los cromos SHALL corresponder a las asignaturas distintas con `AsignacionDocente` ACTIVA para el grupo del estudiante en el año lectivo vigente, ordenadas por `Area.orden` y luego por nombre. El servicio MUST excluir las asignaturas de otros grupos, MUST NOT exponer datos de otros estudiantes y MUST NOT exponer nombres de docentes.

#### Scenario: Solo lo del grupo
- **WHEN** el grupo 1°-01 tiene 10 asignaturas activas y el 1°-02 tiene otras
- **THEN** el tablero de un estudiante de 1°-01 muestra exactamente sus 10 asignaturas

#### Scenario: Asignación inactiva
- **WHEN** una asignación pasa a INACTIVA
- **THEN** su asignatura deja de aparecer si no tiene otra asignación activa en el grupo

### Requirement: Una pantalla sin scroll
En anchos de al menos 900 px y altos de al menos 640 px, «Mis materias» SHALL caber completo en el viewport, sin scroll vertical ni horizontal. Los cromos se distribuyen en una cuadrícula de 5 columnas por 2 filas, con hasta 10 por página. Con más de 10 asignaturas, el tablero SHALL paginar con botones «Anteriores» y «Siguientes» y un indicador de página. 🔶 Paginación por confirmar.

#### Scenario: Escritorio y tableta horizontal
- **WHEN** se abre el tablero a 1440×900, 1280×800 y 1024×768
- **THEN** `document.scrollingElement.scrollHeight` es igual al alto del viewport y todos los cromos de la página son visibles completos, incluido el personaje que sobresale

#### Scenario: Catorce asignaturas
- **WHEN** el grupo tiene 14 asignaturas
- **THEN** la primera página muestra 10 cromos y «Siguientes» lleva a una segunda página con 4

### Requirement: Anatomía del cromo
Cada cromo SHALL tener, de arriba abajo:
- **Marco** en el color de la materia, con contorno, bisel interior y relieve.
- **Ventana de escena**, con fondo de rayos en el tono de la materia y suelo.
- **Ilustración propia de la materia**, cuyo elemento más alto sobresale por encima del marco.
- **Placa con el nombre** de la asignatura, encajada entre la escena y la información, en texto real sobre color sólido.
- **Bloque de información** (ver el requisito de datos opcionales).
- **Botón redondo de jugar** de al menos 48×48 px.

El nombre MUST NOT superponerse a la ilustración.

#### Scenario: Escena por asignatura
- **WHEN** una asignatura coincide con una escena de la tabla de escenas (por ejemplo, «Matemáticas»)
- **THEN** su cromo muestra esa ilustración

#### Scenario: Asignatura sin escena propia
- **WHEN** una asignatura no coincide con ninguna escena
- **THEN** su cromo usa la escena genérica de su área y su nombre en la placa

### Requirement: Datos opcionales del cromo, sin cifras inventadas
El cromo SHALL recibir un `ResumenMateria` con estos campos opcionales:
- `sigue` (título de la siguiente actividad o recurso);
- `avance` (hechas y total);
- `estrellas` (0 a 3);
- `nuevo` (booleano);
- `conMaterial` (booleano o desconocido).

Cada parte del bloque de información SHALL mostrarse solo cuando su campo tiene valor:
- **«Sigue con {título}»** cuando existe `sigue`;
- **barra de avance** con texto «{hechas}/{total}» cuando existe `avance`;
- **estrellas** cuando existe `estrellas`.

Sin ningún dato, el bloque SHALL decir «Toca jugar para entrar». MUST NOT mostrarse ningún valor de ejemplo en producción.

#### Scenario: Sin API de actividades
- **WHEN** `fundacion-actividades` aún no entrega resultados
- **THEN** los cromos no muestran estrellas, barra ni «Sigue con», y dicen «Toca jugar para entrar»

#### Scenario: Con progreso
- **WHEN** el resumen trae `avance = {hechas: 4, total: 6}`, `estrellas = 2` y `sigue = "Caperucita Roja"`
- **THEN** el cromo muestra «Sigue con Caperucita Roja», una barra al 67 % con «4/6» y 2 de 3 estrellas

### Requirement: Estados del cromo
El cromo SHALL expresar estos estados, cada uno con marca y texto además del color:
- **Elegido:** anillo amarillo y elevación, con `aria-pressed="true"`.
- **Dominada** (`estrellas` = 3): destello que recorre la escena.
- **Con material nuevo** (`nuevo`): etiqueta «¡Nuevo!» en la esquina.
- **En preparación** (`conMaterial` = falso): escena desaturada, el texto «Tu docente está preparando el material» y sin botón de jugar.

Cuando `conMaterial` es desconocido, el cromo SHALL mostrarse normal.

#### Scenario: Materia sin material
- **WHEN** el resumen indica `conMaterial = false`
- **THEN** la escena se ve apagada, aparece «Tu docente está preparando el material» y no hay botón de jugar

#### Scenario: Materia dominada
- **WHEN** el resumen indica 3 estrellas
- **THEN** la escena muestra el destello; con `prefers-reduced-motion` el destello no se anima

### Requirement: Interacción accesible del cromo
Cada cromo SHALL tener dos controles reales y separados:
- un `<button>` que cubre el cromo y lo elige, con `aria-pressed` y un `aria-label` con el nombre, las estrellas (si hay) y lo siguiente (si hay);
- un enlace «Entrar a {asignatura}» en el botón de jugar, que navega a la vista de clase de esa asignatura en su grupo.

Al elegir un cromo, el panel lateral SHALL anunciar la materia mediante una región `aria-live="polite"`.

#### Scenario: Elegir con teclado
- **WHEN** el estudiante llega con Tab al cromo «Matemáticas» y pulsa Enter
- **THEN** el cromo queda presionado, el avatar salta a él y el panel anuncia «Matemáticas»

#### Scenario: Entrar con un toque
- **WHEN** el estudiante toca el botón de jugar de «Inglés»
- **THEN** navega directamente a la vista de clase de Inglés

### Requirement: Panel de la materia elegida
El panel lateral SHALL mostrar:
- «Mi explorador», con la elección de avatar;
- la materia elegida: área, nombre en su color, descripción breve, cifras (si existen), estrellas (si existen) y el botón principal «Entrar a {asignatura}».

#### Scenario: Cambio de materia
- **WHEN** el estudiante elige «Ciencias naturales»
- **THEN** el panel muestra «Ciencias naturales» y su botón dice «Entrar a Ciencias naturales»

### Requirement: Fondo sereno
El fondo del tablero SHALL ser una sabana en tonos lavados (cielo pálido, sol tenue, cerros y colinas de baja saturación), sin elementos animados, para que el color fuerte quede solo en los cromos.

#### Scenario: Jerarquía de color
- **WHEN** se mide la saturación media del fondo del tablero frente a la de los marcos de los cromos
- **THEN** el fondo tiene menor saturación que cualquier marco de cromo

### Requirement: Adaptación a móvil
En anchos menores de 900 px, los cromos SHALL apilarse en 2 columnas (1 columna por debajo de 420 px). El panel de la materia pasa a una hoja inferior y se permite el scroll vertical. 🔶 Por confirmar con el operador.

#### Scenario: Teléfono
- **WHEN** se abre el tablero a 390 px de ancho
- **THEN** los cromos aparecen en una columna, sin scroll horizontal, con el botón de jugar de al menos 48 px

### Requirement: Rendimiento
Escenas, rayos y fondo SHALL ser SVG propio, sin imágenes raster de escena. La carga inicial de `/` para un estudiante MUST cumplir el presupuesto de 2 s del proyecto en la red del colegio.

#### Scenario: Sin raster de escena
- **WHEN** se inspeccionan las peticiones de `/` en contexto ESTUDIANTE
- **THEN** solo se descargan el escudo y las fuentes como recursos gráficos
