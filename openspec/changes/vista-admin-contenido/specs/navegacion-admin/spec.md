## ADDED Requirements

### Requirement: Menú del contexto de la coordinadora
La navegación del contexto `ADMIN` SHALL ofrecer, en este orden: Dashboard, Contenido, Biblioteca, Laboratorios, Usuarios, Estudiantes, Estructura, Asignaciones y Cuenta. «Contenido» MUST llevar a `/admin/contenido`. El Dashboard SHALL incluir un acceso «Contenido pedagógico» junto a los de las demás secciones. Mostrar un enlace MUST NOT conceder acceso: cada ruta autoriza en el servidor.

#### Scenario: Menú
- **WHEN** una cuenta en contexto `ADMIN` ve el menú
- **THEN** aparecen Dashboard, Contenido, Biblioteca, Laboratorios, Usuarios, Estudiantes, Estructura, Asignaciones y Cuenta, en ese orden

#### Scenario: Acceso desde el Dashboard
- **WHEN** la coordinadora abre `/admin`
- **THEN** ve el acceso «Contenido pedagógico», que lleva a `/admin/contenido`

### Requirement: Laboratorios para la coordinadora, completo
Las rutas `/laboratorios/**` SHALL admitir cuentas con rol `ADMIN`, además de `DOCENTE` y `ESTUDIANTE`. La coordinadora MUST ver todos los mundos, bloques y unidades disponibles, sin bloqueos por progreso, fecha ni grupo, aunque en el futuro los laboratorios incorporen una progresión para el estudiante.

#### Scenario: Entrar
- **WHEN** una cuenta solo `ADMIN` abre `/laboratorios`
- **THEN** ve el cielo con Robótica y Emprendimiento en lugar de ser redirigida a `/cuenta?sinPermiso=1`

#### Scenario: Unidades
- **WHEN** abre cualquier unidad de cualquiera de los dos mundos
- **THEN** la ve completa

### Requirement: Biblioteca en versión docente para la coordinadora
En la Biblioteca, el contexto `ADMIN` SHALL ver el catálogo completo, incluidos los títulos y guías marcados solo para docentes, como la docente.

#### Scenario: Guías
- **WHEN** la coordinadora busca un título marcado solo para docentes
- **THEN** aparece en los resultados

### Requirement: El menú no contradice el contexto
En Biblioteca y Laboratorios, el shell SHALL conservar el contexto guardado de la sesión. Una cuenta `DOCENTE + ADMIN` en contexto `ADMIN` MUST ver el menú de la coordinadora en esas rutas, y en contexto `DOCENTE` el menú de la docente. El resto de rutas de la docente conservan su comportamiento actual.

#### Scenario: Docente y coordinadora en contexto ADMIN
- **WHEN** una cuenta `DOCENTE + ADMIN` con contexto `ADMIN` abre `/laboratorios`
- **THEN** el menú es el de la coordinadora

#### Scenario: Docente y coordinadora en contexto DOCENTE
- **WHEN** la misma cuenta con contexto `DOCENTE` abre `/laboratorios`
- **THEN** el menú es el de la docente
