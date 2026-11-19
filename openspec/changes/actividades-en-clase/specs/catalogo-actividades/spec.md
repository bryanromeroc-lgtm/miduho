## ADDED Requirements

### Requirement: Actividades en la base con origen
Toda actividad SHALL existir en la base con título, instrucción, tema, tipo, asignatura, grado, origen (`CURRICULO` o `DOCENTE`) y estado (`BORRADOR`, `PUBLICADA` o `RETIRADA`). Las de origen `CURRICULO` SHALL tener `slug` único y venir de `curriculo/actividades/`. Las de origen `DOCENTE` SHALL tener autora y no tener `slug`.

#### Scenario: Importación de una actividad del currículo
- **WHEN** se importa `matematicas/5/duelo-de-divisiones.json`
- **THEN** existe una actividad `CURRICULO` `PUBLICADA` con ese `slug`, de Matemáticas de 5.°, con su versión 1

#### Scenario: Quiz de docente sin autora
- **WHEN** se intenta guardar una actividad de origen `DOCENTE` sin autora
- **THEN** la base la rechaza

### Requirement: Alineación obligatoria con referentes
Toda actividad `PUBLICADA` SHALL tener al menos un referente aplicable a su grado. Si el área de su asignatura tiene DBA en el catálogo, al menos uno de sus referentes MUST ser un `DBA` o una `EVIDENCIA`. Si no los tiene, basta un `ESTANDAR` o `INSTITUCIONAL`.

#### Scenario: Actividad de Matemáticas sin DBA
- **WHEN** se importa una actividad de Matemáticas de 5.° que solo declara un Estándar
- **THEN** la importación la rechaza con el motivo

#### Scenario: Actividad de Ética con referente institucional
- **WHEN** se importa una actividad de Ética y Valores de 5.° que declara un Estándar de Competencias Ciudadanas
- **THEN** la importación la acepta

#### Scenario: Las 69 actividades existentes
- **WHEN** corre la prueba del currículo
- **THEN** todas las actividades de 5.° tienen referentes válidos y cada una coincide con al menos un tema de la malla demo de su asignatura

### Requirement: Versiones inmutables
El contenido que se juega SHALL vivir en versiones inmutables. Para las actividades `CURRICULO`, la importación SHALL crear una versión nueva solo si cambia el hash del contenido canónico, y un archivo borrado SHALL dejar la actividad `RETIRADA` sin borrar versiones, asignaciones ni intentos. Una versión existente MUST NOT modificarse ni borrarse.

#### Scenario: Corrección de una actividad del currículo
- **WHEN** se corrige una pregunta de una actividad `CURRICULO` asignada con intentos y se reimporta
- **THEN** se crea la versión 2, y las asignaciones e intentos existentes siguen en la versión 1

#### Scenario: Modificar una versión
- **WHEN** cualquier proceso intenta actualizar o borrar una fila de versiones
- **THEN** la base lo rechaza

### Requirement: Catálogo desde la base
El estudiante, la docente y el reproductor SHALL leer las actividades desde la base y no desde los archivos. Los archivos de `curriculo/` solo SHALL leerse en la importación y en las pruebas.

#### Scenario: Archivo cambiado sin importar
- **WHEN** se edita un archivo de actividad y no se ejecuta la importación
- **THEN** la plataforma sigue mostrando la versión importada
