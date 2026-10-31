## ADDED Requirements

### Requirement: Referentes curriculares
El sistema SHALL mantener un catálogo de referentes curriculares. Cada referente tiene `codigo` único, `tipo` (`DBA`, `ESTANDAR` o `INSTITUCIONAL`), área, grado inicial y grado final (iguales para los DBA, que van por grado; distintos para los Estándares, que van por conjunto de grados, por ejemplo 1.° a 3.°), enunciado y fuente. Los enunciados SHALL citar su fuente oficial (MEN) y MUST NOT inventarse.

#### Scenario: DBA de un grado
- **WHEN** se importa un referente `DBA` de Matemáticas para 2.°
- **THEN** queda con grado inicial y final iguales a 2.° y su fuente registrada

#### Scenario: Estándar por conjunto de grados
- **WHEN** se consulta qué referentes aplican a una actividad de 3.° de Ciencias Naturales
- **THEN** aparecen los DBA de 3.° y los Estándares cuyo rango de grados incluye 3.°

### Requirement: Catálogo de actividades en archivos versionados
Las actividades SHALL definirse como archivos JSON en `curriculo/actividades/<asignatura>/<grado>/<slug>.json`, versionados en git. Cada archivo MUST declarar `slug` único, `titulo`, asignatura, grado, período sugerido, `tipo`, `versionEsquema`, códigos de referentes (al menos uno) y `contenido`. Las docentes MUST NOT poder crear ni editar actividades desde la plataforma.

#### Scenario: Actividad sin referente
- **WHEN** se importa una actividad que no declara ningún referente curricular
- **THEN** la importación la rechaza con un mensaje que nombra el archivo

#### Scenario: Referente inexistente o de otro grado
- **WHEN** una actividad de 1.° declara un referente cuyo rango de grados no incluye 1.°
- **THEN** la importación la rechaza

### Requirement: Importación idempotente
El comando `npm run curriculo:importar` SHALL validar todos los archivos contra el esquema general y contra el esquema del `tipo` declarado, y SHALL importar todo o nada en una transacción. Importar dos veces el mismo contenido MUST NOT crear registros nuevos.

#### Scenario: Archivo inválido
- **WHEN** un solo archivo no cumple el esquema de su tipo
- **THEN** no se importa ningún archivo y el comando lista cada error con archivo y ruta del campo

#### Scenario: Tipo no registrado
- **WHEN** una actividad declara un `tipo` que no existe en el registro de tipos
- **THEN** la importación la rechaza

#### Scenario: Reimportación sin cambios
- **WHEN** se ejecuta la importación dos veces sin cambiar archivos
- **THEN** la segunda ejecución informa 0 actividades nuevas y 0 versiones nuevas

### Requirement: Versiones inmutables
Cada cambio en el contenido de una actividad SHALL crear una `VersionActividad` nueva, identificada por el hash del contenido normalizado. Una versión existente MUST NOT modificarse ni borrarse. Retirar una actividad del catálogo SHALL marcarla como `RETIRADA` sin borrar sus versiones, asignaciones ni intentos.

#### Scenario: Corrección de una pregunta
- **WHEN** se corrige el texto de un ítem y se reimporta
- **THEN** se crea la versión 2, y las asignaciones e intentos existentes siguen apuntando a la versión 1

#### Scenario: Archivo eliminado
- **WHEN** se borra del repositorio el archivo de una actividad que ya tiene intentos y se reimporta
- **THEN** la actividad queda `RETIRADA`, deja de ofrecerse para nuevas asignaciones y sus resultados se conservan
