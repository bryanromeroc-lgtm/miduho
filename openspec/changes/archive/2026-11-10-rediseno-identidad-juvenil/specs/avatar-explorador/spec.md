## ADDED Requirements

### Requirement: Personajes originales
MIDUHO SHALL ofrecer cuatro avatares originales en SVG, derivados del escudo y del paisaje del colegio: Casita (la casa del escudo), Pino, Gota de río y Sol. Los avatares MUST NOT parecerse a personajes de las plataformas de referencia ni de terceros. MUST usar solo colores de las rampas del escudo, y SHALL figurar como provisionales en PRODUCT.md y DESIGN.md hasta que el colegio los apruebe. El escudo, no un avatar, SHALL identificar a la institución en el encabezado y en el ingreso.

#### Scenario: Procedencia
- **WHEN** se revisan los archivos de los avatares
- **THEN** cada uno es un SVG creado en el proyecto, con un registro de procedencia que indica autoría propia y el escudo como fuente

### Requirement: Elección del avatar
El estudiante SHALL poder elegir su avatar desde «Mi explorador». Los cuatro avatares SHALL ser `<button>` con `aria-label` («Avatar Pino») y `aria-pressed`, cada uno con su nombre visible debajo. Sin elección previa, el avatar por defecto es Casita.

#### Scenario: Cambiar de avatar
- **WHEN** el estudiante pulsa «Avatar Sol»
- **THEN** el botón queda presionado y el avatar del tablero pasa a Sol

### Requirement: Persistencia en la cuenta
La elección SHALL guardarse en `Usuario.avatar` mediante una acción de servidor que solo actúa sobre la cuenta de la sesión y solo con contexto ESTUDIANTE. MUST validar el valor contra el enum `AvatarExplorador`. La elección SHALL conservarse entre dispositivos, porque las tabletas del colegio son compartidas.

#### Scenario: Otro dispositivo
- **WHEN** el estudiante elige Pino en una tableta e ingresa luego desde un computador
- **THEN** su tablero muestra a Pino

#### Scenario: Valor inválido o cuenta ajena
- **WHEN** la acción recibe un valor fuera del enum, o se invoca sin sesión de estudiante
- **THEN** se rechaza sin modificar ningún usuario

### Requirement: Salto al cromo elegido
El avatar SHALL posarse sobre la esquina superior del cromo elegido. Al elegir otro cromo, SHALL saltar hasta él en una curva con rebote de como máximo 650 ms, y flotar suavemente mientras reposa. Con `prefers-reduced-motion: reduce`, SHALL aparecer directamente sobre el cromo, sin flotar.

#### Scenario: Elegir otra materia
- **WHEN** el avatar está sobre «Inglés» y el estudiante elige «Robótica»
- **THEN** el avatar salta y queda sobre el cromo de Robótica

#### Scenario: Movimiento reducido
- **WHEN** el sistema pide reducir el movimiento y el estudiante elige «Matemáticas»
- **THEN** el avatar aparece sobre Matemáticas sin animación

### Requirement: Avatar decorativo para tecnologías de apoyo
El avatar del tablero SHALL ser decorativo (`aria-hidden="true"`) y MUST NOT capturar clics ni foco. La selección la comunican el cromo (`aria-pressed`) y el panel (`aria-live`).

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla recorre el tablero
- **THEN** no anuncia el avatar, y sí anuncia los cromos y el panel
