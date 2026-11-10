## ADDED Requirements

### Requirement: Ruta de la vista de materia
La ruta `/materias/[asignatura]` SHALL mostrar a un estudiante la vista completa de una asignatura de su grupo. El servicio MUST verificar que la asignatura tenga `AsignacionDocente` ACTIVA para el grupo activo del estudiante en el año lectivo vigente; si no, la ruta MUST responder 404. La ruta MUST NOT estar disponible para otros contextos y MUST NOT exponer nombres de docentes ni datos de otros estudiantes.

#### Scenario: Asignatura del grupo
- **WHEN** un estudiante abre `/materias/{id}` de una asignatura activa de su grupo
- **THEN** ve la vista de esa materia con su nombre en la cabecera

#### Scenario: Asignatura ajena
- **WHEN** un estudiante abre `/materias/{id}` de una asignatura que no es de su grupo
- **THEN** recibe 404

#### Scenario: Contexto docente
- **WHEN** una docente abre `/materias/{id}`
- **THEN** recibe 404

### Requirement: Composición a pantalla completa sin panel lateral
La vista SHALL ocupar todo el viewport, con un encabezado flat propio (escudo, wordmark, «Volver a Mis materias», cuenta) en lugar del shell sticker, cabecera temática, cuadrícula centrada de tarjetas de actividad y paginador. La vista MUST NOT incluir panel lateral ni barra lateral. En anchos de al menos 900 px y altos de al menos 640 px MUST caber sin scroll vertical ni horizontal.

#### Scenario: Escritorio y tableta
- **WHEN** se abre la vista a 1440×900, 1280×800 y 1024×768
- **THEN** `document.scrollingElement.scrollHeight` es igual al alto del viewport y no existe ningún elemento `aside` ni navegación lateral

#### Scenario: Pantalla pequeña
- **WHEN** el viewport mide menos de 900 px de ancho
- **THEN** la cuadrícula pasa a dos columnas (hasta 600 px: una) con scroll vertical normal y sin scroll horizontal

### Requirement: Cuadrícula y paginación de actividades
La cuadrícula SHALL mostrar hasta 6 tarjetas por página (3 columnas por 2 filas en escritorio). Con más de 6 actividades SHALL haber botones «Anteriores» y «Siguientes» con indicador «Página X de Y».

#### Scenario: Ocho actividades
- **WHEN** la materia tiene 8 actividades
- **THEN** la primera página muestra 6 y «Siguientes» lleva a una segunda con 2

#### Scenario: Orden
- **WHEN** hay actividades en distintos estados
- **THEN** aparecen primero las disponibles con cierre más próximo, luego en curso, por abrir, hechas y cerradas

### Requirement: Estados sin datos
La vista MUST NOT mostrar actividades de ejemplo con datos reales. Si la fuente de actividades no está conectada o no hay asignaciones, SHALL mostrar un estado vacío con la escena de la materia y el texto «Tu docente aún no ha asignado actividades». Si la asignatura no tiene contenido, SHALL indicar «Esta materia está en preparación».

#### Scenario: Sin actividades
- **WHEN** la lista de actividades es nula o vacía
- **THEN** se muestra el estado vacío, sin tarjetas ni paginador

#### Scenario: Muestra rotulada
- **WHEN** se abre `/muestras/materia` fuera de producción
- **THEN** se ven actividades ficticias sin nombres de personas y un rótulo visible «Datos de ejemplo»

### Requirement: Navegación de entrada y salida
El botón «Entrar a {materia}» de «Mis materias» SHALL llevar a `/materias/[asignatura]`. La vista SHALL ofrecer «Volver a Mis materias», que regresa a `/` con la misma materia elegida.

#### Scenario: Ida y vuelta
- **WHEN** el estudiante entra a Matemáticas y pulsa «Volver a Mis materias»
- **THEN** vuelve al tablero con el cromo de Matemáticas elegido

### Requirement: Accesibilidad de la vista
La vista SHALL ser operable por teclado en orden lógico (volver, tarjetas, paginador), con foco visible, un único `h1` con el nombre de la materia, la cuadrícula como lista, y todo texto seleccionable. Las animaciones MUST detenerse con `prefers-reduced-motion`.

#### Scenario: Teclado
- **WHEN** el estudiante navega solo con Tab
- **THEN** recorre «Volver», cada tarjeta habilitada y el paginador, con foco visible en cada paso

#### Scenario: Movimiento reducido
- **WHEN** el sistema pide movimiento reducido
- **THEN** no hay entradas escalonadas ni elementos flotantes animados
