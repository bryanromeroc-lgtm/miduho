## ADDED Requirements

### Requirement: Anatomía de la tarjeta
Cada tarjeta SHALL mostrar una ilustración plana de la actividad en el kit de la materia, el título (máximo 2 líneas, nombre completo en el nombre accesible), un chip de estado, las estrellas con el texto de intentos («2 de 3 estrellas · 1 intento disponible») y un botón de acción. Todo el texto MUST ser texto real. La tarjeta MUST ser un único enlace con un solo destino de foco.

#### Scenario: Título largo
- **WHEN** el título supera dos líneas
- **THEN** se recorta con puntos suspensivos y el nombre accesible conserva el título completo

#### Scenario: Un solo foco
- **WHEN** el usuario recorre con Tab
- **THEN** cada tarjeta recibe un único foco

### Requirement: Estados y acción
La tarjeta SHALL reflejar el estado real de la actividad y su acción:
- `disponible`: «Jugar».
- `enCurso`: «Continuar».
- `hecha` con intentos disponibles: «Repetir para mejorar».
- `hecha` sin intentos: «Ver resultado».
- `porAbrir`: deshabilitada, «Abre el {fecha}».
- `cerrada`: «Ver resultado» si hubo intento; si no, «Cerrada».

Un estado nunca MUST comunicarse solo por color.

#### Scenario: Disponible
- **WHEN** la actividad está disponible y sin intentos
- **THEN** la tarjeta dice «Jugar» y «3 intentos disponibles»

#### Scenario: Por abrir
- **WHEN** la actividad aún no abre
- **THEN** la tarjeta no es un enlace activo, está marcada `aria-disabled` y muestra su fecha de apertura

#### Scenario: Intentos agotados
- **WHEN** el estudiante usó 3 de 3 intentos
- **THEN** la acción es «Ver resultado» y se muestra «Sin intentos disponibles»

### Requirement: Presentación del desempeño
Las estrellas SHALL provenir de la nota del mejor intento ya calculada por `fundacion-actividades`; la vista MUST NOT calcular notas ni comparar con otros estudiantes. Si no hay intento, SHALL decir «Sin intentos todavía».

#### Scenario: Sin intentos
- **WHEN** no hay intentos
- **THEN** no se muestran estrellas llenas y se lee «Sin intentos todavía»

### Requirement: Destino de la actividad
La tarjeta habilitada SHALL llevar a `/materias/[asignatura]/actividades/[id]`. Mientras el reproductor no exista, esa ruta MUST mostrar «Esta actividad se abre pronto» con un botón para volver, sin error 500. 🔶

#### Scenario: Reproductor ausente
- **WHEN** el estudiante abre la actividad
- **THEN** ve el mensaje de apertura próxima y puede volver a la materia

### Requirement: Objetivos táctiles y estilo plano
La tarjeta MUST medir al menos 44×44 px en su zona accionable y SHALL usar planos de color sin sombra, relieve ni contorno oscuro.

#### Scenario: Estilo plano
- **WHEN** se revisa el CSS de la vista
- **THEN** no contiene `box-shadow`, `drop-shadow` ni bordes de tinta oscura
