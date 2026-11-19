## ADDED Requirements

### Requirement: Vista previa de una materia por grado
La ruta `/admin/contenido/[asignatura]/[grado]` SHALL mostrar a una cuenta `ADMIN` la vista de esa asignatura con las actividades del currículo de ese grado, donde `[grado]` es el orden del grado. Si la asignatura o el grado no existen, o la asignatura no se dicta en ese grado, MUST responder 404. Una cuenta sin rol `ADMIN` MUST ser redirigida como en el resto de `/admin`.

#### Scenario: Materia de un grado
- **WHEN** la coordinadora abre `/admin/contenido/{matemáticas}/5`
- **THEN** ve la vista de Matemáticas con las actividades de 5.° del catálogo

#### Scenario: No se dicta
- **WHEN** abre una asignatura en un grado al que no está asociada
- **THEN** recibe 404

### Requirement: Misma vista que el estudiante, rotulada
La vista previa SHALL usar la misma composición de la vista de materia del estudiante: escena y decoración temática, encabezado plano, cuadrícula de hasta 6 tarjetas por página y paginador, con el mismo comportamiento sin scroll a 1440×900, 1280×800 y 1024×768. MUST mostrar una franja visible con el texto «Vista previa · {grado}» y, en el encabezado, «Volver a Contenido», que lleva a `/admin/contenido`.

#### Scenario: Franja visible
- **WHEN** la coordinadora abre la vista previa de Inglés en 5.°
- **THEN** ve el mundo de Inglés y una franja con el texto seleccionable «Vista previa · 5.°»

#### Scenario: Volver
- **WHEN** pulsa «Volver a Contenido»
- **THEN** regresa a `/admin/contenido`

### Requirement: Sin datos de estudiantes en la vista previa
Las tarjetas de la vista previa SHALL aparecer como disponibles y MUST NOT mostrar estrellas, intentos, avance, fechas de apertura o cierre, ni datos de ningún estudiante o grupo. Si la materia no tiene actividades en ese grado, SHALL mostrar el estado vacío de la escena con el texto «Aún no hay actividades para {grado}».

#### Scenario: Tarjetas limpias
- **WHEN** la vista previa lista las actividades de Matemáticas de 5.°
- **THEN** ninguna tarjeta muestra estrellas, intentos ni fechas

#### Scenario: Grado sin material
- **WHEN** abre una materia en un grado donde se dicta pero no hay actividades
- **THEN** ve la escena de la materia con «Aún no hay actividades para {grado}», sin tarjetas ni paginador

### Requirement: Actividad en vista previa
La ruta `/admin/contenido/[asignatura]/[grado]/actividades/[id]` SHALL permitir a la coordinadora jugar la actividad `id` del currículo de esa asignatura y grado, dentro del mundo de la materia y con el mismo reproductor del estudiante. Nada MUST guardarse: ni intentos ni respuestas. La pantalla de resultado MUST decir «Vista previa: este resultado no se guarda». Si el `id` no pertenece a esa asignatura y grado, MUST responder 404.

#### Scenario: Jugar
- **WHEN** la coordinadora abre una actividad de Ciencias Sociales de 5.° y la termina
- **THEN** ve el resultado con estrellas y repaso, y el aviso «Vista previa: este resultado no se guarda»

#### Scenario: Actividad ajena
- **WHEN** abre un `id` que no está en el currículo de esa asignatura y grado
- **THEN** recibe 404

#### Scenario: Volver a la materia
- **WHEN** sale de la actividad
- **THEN** vuelve a `/admin/contenido/[asignatura]/[grado]`, no a la vista del estudiante

### Requirement: La vista del estudiante no cambia
Las rutas `/materias/**` MUST conservar su comportamiento y su contrato actuales: siguen siendo exclusivas del contexto `ESTUDIANTE` y no muestran la franja de vista previa.

#### Scenario: Estudiante
- **WHEN** un estudiante abre `/materias/{id}` de su grupo
- **THEN** ve su vista sin franja de vista previa y con «Volver a Mis materias»

#### Scenario: Coordinadora en la ruta del estudiante
- **WHEN** una cuenta `ADMIN` sin rol de estudiante abre `/materias/{id}`
- **THEN** no ve la vista del estudiante
