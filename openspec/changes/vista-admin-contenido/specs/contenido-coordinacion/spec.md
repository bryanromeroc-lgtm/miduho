## ADDED Requirements

### Requirement: Sección de contenido pedagógico de la coordinadora
La ruta `/admin/contenido` SHALL mostrar a una cuenta con rol `ADMIN` el contenido pedagógico del colegio organizado por **área**, y dentro de cada área por **asignatura**. Las áreas MUST ordenarse por su `orden` y luego por nombre, y las asignaturas por nombre. La autorización MUST verificarse en el servidor en cada petición; una cuenta sin rol `ADMIN` MUST ser redirigida como en el resto de `/admin`.

#### Scenario: Coordinadora
- **WHEN** una cuenta `ADMIN` abre `/admin/contenido`
- **THEN** ve un bloque por cada área del colegio con sus asignaturas

#### Scenario: Docente o estudiante
- **WHEN** una cuenta sin rol `ADMIN` abre `/admin/contenido`
- **THEN** es redirigida a `/cuenta?sinPermiso=1` y no recibe ningún dato del contenido

### Requirement: Matriz asignatura por grado con todos los grados
Cada área SHALL presentar una matriz con una fila por asignatura y una columna por **cada grado del colegio**, ordenados por su `orden`, tenga o no contenido. Cada celda MUST mostrar exactamente uno de tres estados:
- «N actividades» (con el número real del catálogo) cuando la asignatura se dicta en ese grado y tiene actividades;
- «Sin contenido» cuando la asignatura se dicta en ese grado (`AsignaturaGrado`) pero no tiene actividades;
- «No se dicta» cuando la asignatura no está asociada a ese grado.

La matriz MUST NOT mostrar cifras estimadas, de ejemplo ni redondeadas.

#### Scenario: Celda con actividades
- **WHEN** Matemáticas se dicta en 5.° y el catálogo tiene 8 actividades de Matemáticas de 5.°
- **THEN** la celda Matemáticas × 5.° dice «8 actividades»

#### Scenario: Grado sin material
- **WHEN** Matemáticas se dicta en 2.° y no hay actividades de Matemáticas de 2.°
- **THEN** la celda Matemáticas × 2.° dice «Sin contenido» y la columna de 2.° aparece igual

#### Scenario: Asignatura que no se dicta
- **WHEN** una asignatura no está asociada al grado 1.°
- **THEN** la celda dice «No se dicta», con un texto distinto de «Sin contenido»

### Requirement: Entrada a la vista previa desde la matriz
Cada celda con actividades y cada celda «Sin contenido» SHALL ser un enlace a `/admin/contenido/{asignatura}/{grado}`. Las celdas «No se dicta» MUST NOT ser enlaces.

#### Scenario: Abrir una materia
- **WHEN** la coordinadora activa la celda Ciencias Naturales × 5.°
- **THEN** llega a la vista previa de Ciencias Naturales en 5.°

#### Scenario: Celda sin material
- **WHEN** activa una celda «Sin contenido»
- **THEN** llega a la vista previa de esa materia y grado, que muestra su estado vacío

### Requirement: Solo consulta
La sección MUST NOT ofrecer ninguna acción que escriba datos: ni crear, editar o borrar actividades, ni asignarlas, ni modificar la estructura académica. MUST NOT exponer nombres de estudiantes, docentes ni resultados.

#### Scenario: Sin acciones de escritura
- **WHEN** la coordinadora recorre `/admin/contenido` y sus vistas previas
- **THEN** no encuentra botones ni formularios que creen, editen, asignen o borren algo, y ninguna petición de esas pantallas usa un método distinto de `GET`

### Requirement: Accesibilidad de la matriz
Cada matriz SHALL ser una tabla de datos con título del área como `caption`, encabezados de columna por grado y de fila por asignatura. Los enlaces de celda MUST tener un nombre accesible completo (por ejemplo, «Matemáticas, 5.°: 8 actividades»). Los tres estados MUST distinguirse por texto, no solo por color, con contraste de al menos 4.5:1. En anchos menores al de la tabla, el desplazamiento horizontal MUST ocurrir dentro de un contenedor propio, enfocable con teclado y con nombre accesible, sin scroll horizontal de la página.

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla se ubica en la celda Inglés × 5.°
- **THEN** anuncia el grado y la asignatura de esa celda y su estado

#### Scenario: Teléfono
- **WHEN** se abre la sección a 375 px de ancho
- **THEN** la página no tiene scroll horizontal y la tabla se desplaza dentro de su contenedor
