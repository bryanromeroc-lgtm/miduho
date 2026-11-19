## ADDED Requirements

### Requirement: Catálogo de referentes curriculares
El sistema SHALL mantener en la base un catálogo de referentes curriculares. Cada referente tiene `codigo` único, `tipo` (`DBA`, `EVIDENCIA`, `ESTANDAR` o `INSTITUCIONAL`), área, grado inicial y grado final, enunciado y fuente. Una `EVIDENCIA` SHALL pertenecer a un `DBA` de su misma área y grado. Los enunciados de `DBA`, `EVIDENCIA` y `ESTANDAR` SHALL transcribirse literal del documento del MEN que cita su fuente, y MUST NOT inventarse ni parafrasearse.

#### Scenario: DBA con evidencias
- **WHEN** se importa un DBA de Matemáticas de 5.° con tres evidencias
- **THEN** quedan un referente `DBA` con grado inicial y final 5 y tres referentes `EVIDENCIA` hijos de él, todos con fuente

#### Scenario: Referente sin fuente
- **WHEN** un archivo de referentes declara un DBA sin fuente
- **THEN** la importación lo rechaza nombrando el archivo y el código

#### Scenario: Estándar por ciclo
- **WHEN** se consultan los referentes aplicables a 5.° de Ciencias Naturales
- **THEN** aparecen los DBA de 5.° y los Estándares cuyo rango de grados incluye 5.°

### Requirement: Malla institucional por período
El sistema SHALL guardar mallas por asignatura, grado y año lectivo, con origen `DEMO` o `INSTITUCIONAL`. Cada malla tiene elementos con número de período, eje, tema, desempeños de saber, hacer y ser, y orden. Cada elemento SHALL referenciar al menos un referente del catálogo aplicable a su área y grado.

#### Scenario: Elemento con referente de otro grado
- **WHEN** la semilla declara un tema de 5.° que cita un DBA de 3.°
- **THEN** la importación lo rechaza

#### Scenario: Una malla por asignatura, grado y año
- **WHEN** se importa dos veces la malla demo de Matemáticas de 5.° para el mismo año
- **THEN** existe una sola malla y sus elementos no se duplican

### Requirement: Semilla de demostración de 5.°
El repositorio SHALL incluir una semilla de 5.° con: los DBA y sus evidencias de Matemáticas, Lenguaje, Ciencias Naturales, Ciencias Sociales e Inglés; los Estándares del ciclo 4.°–5.° que cite la malla; referentes `INSTITUCIONAL` de demostración para las áreas sin DBA; y una malla `DEMO` de 4 períodos para las 11 asignaturas de 5.°. Toda interfaz que muestre una malla `DEMO` SHALL rotularla como «Malla de demostración».

#### Scenario: Carga en un entorno nuevo
- **WHEN** se ejecuta la importación del currículo sobre una base recién migrada con el año activo creado
- **THEN** existen 11 mallas `DEMO` de 5.°, cada una con temas en los 4 períodos

#### Scenario: Rótulo en el catálogo
- **WHEN** una docente abre el catálogo ordenado por la malla demo
- **THEN** la pantalla dice que es una malla de demostración

### Requirement: Importación del currículo
El comando `npm run curriculo:importar` SHALL validar e importar referentes, mallas y actividades del currículo en ese orden, todo o nada, en una sola transacción. Importar dos veces el mismo contenido MUST NOT crear registros nuevos.

#### Scenario: Error en un archivo
- **WHEN** un solo archivo de referentes, malla o actividad es inválido
- **THEN** no se importa nada y el comando lista cada error con su archivo y su campo

#### Scenario: Reimportación
- **WHEN** se ejecuta la importación dos veces sin cambios
- **THEN** la segunda informa 0 referentes, 0 elementos de malla, 0 actividades y 0 versiones nuevas
