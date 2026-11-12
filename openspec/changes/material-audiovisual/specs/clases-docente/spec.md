## ADDED Requirements

### Requirement: Mis clases desde las asignaciones reales
`/clases` SHALL listar las `AsignacionDocente` `ACTIVA` de la docente en el año activo, como asignatura · grupo, conservando el friso visual. MUST NOT mostrar clases, contenidos ni cifras de `@/data/demo`.

#### Scenario: Docente con tres asignaciones
- **WHEN** una docente con tres asignaciones activas abre «Mis clases»
- **THEN** ve exactamente esas tres clases

#### Scenario: Docente sin asignaciones
- **WHEN** una docente sin asignaciones activas abre «Mis clases»
- **THEN** ve un estado vacío que explica que coordinación aún no le asigna clases

### Requirement: Pestaña Actividades de la clase
`/clases/[asignacionDocenteId]` SHALL abrir la clase de esa asignación y su pestaña Actividades SHALL mostrar el botón «Nuevo material audiovisual», la lista de activas (título, cierre y «N de M respondieron») y la de anuladas, con enlace al detalle y al seguimiento de cada una. Las demás pestañas SHALL quedar rotuladas como demostración 🔶. Una asignación ajena o inactiva MUST responder `404`.

#### Scenario: Clase ajena
- **WHEN** una docente abre la URL de una asignación de otra docente
- **THEN** la página responde `404`

#### Scenario: Material creado aparece
- **WHEN** la docente crea un material para la asignatura y el grado de la clase
- **THEN** aparece en la lista de activas de la clase de cada grupo asignado

### Requirement: Accesibilidad de las pantallas docentes
Las pantallas de «Mis clases», la pestaña Actividades, el formulario y el seguimiento MUST cumplir WCAG 2.1 AA: navegación completa por teclado, foco visible, etiquetas en cada campo, errores asociados a su campo y anunciados, contraste ≥ 4.5:1 y tabla de seguimiento con encabezados.

#### Scenario: Error de validación
- **WHEN** la docente envía el formulario con el enlace vacío
- **THEN** el foco va al campo del enlace y el error se anuncia a lectores de pantalla
