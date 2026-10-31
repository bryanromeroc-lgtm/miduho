## ADDED Requirements

### Requirement: Alcance del rediseño
La nueva identidad visual SHALL aplicarse a todas las superficies de MIDUHO excepto Laboratorios: inicio (del estudiante y de la docente), ingreso y recuperación de contraseña, Mis clases y la vista de clase, Biblioteca y su lector, Agenda, Mi curso, Cuenta, Administración, y el encabezado y la navegación compartidos. Las rutas `/laboratorios/**` y `/emprendimiento`, el bloque de estilos `.cosmos` y `actividad.module.css` MUST NOT cambiar su apariencia.

#### Scenario: Laboratorios sin cambios
- **WHEN** se comparan capturas de `/laboratorios`, `/laboratorios?mundo=emprendimiento` y una ruta de unidad, tomadas antes y después del cambio, a 1440 px y 390 px
- **THEN** no hay diferencias de píxeles más allá del contenido dinámico

#### Scenario: Elementos retirados
- **WHEN** se renderiza cualquier superficie dentro del alcance
- **THEN** no aparecen el oso, el castillo, el paisaje anterior del encabezado ni recursos de `public/images/portal`

### Requirement: Paleta derivada del escudo
Los colores SHALL derivarse del escudo del colegio: azul cielo `#00adef`, verde pino `#01a451`, lima `#a6ce39`, naranja puerta `#ec8856`, durazno `#ffcfbe`, celeste `#c5e0e7`, amarillo de acento `#ffc21a` y la tinta de contorno `#1b2440`. Cada color SHALL expresarse como una rampa de tonos fija en tokens, y los componentes MUST NOT usar colores fuera de las rampas, salvo dentro de las ilustraciones SVG. Cada área curricular SHALL tener una familia propia y su nombre visible como texto.

#### Scenario: Sin colores sueltos
- **WHEN** se buscan colores literales en los estilos de las superficies rediseñadas
- **THEN** todos referencian tokens, excepto dentro de los archivos de ilustración

### Requirement: Contraste y accesibilidad
Toda combinación de texto y fondo SHALL cumplir WCAG 2.1 AA (4.5:1 en texto normal; 3:1 en texto grande y en componentes). El foco SHALL ser visible en todos los controles. La interfaz MUST ser operable por teclado y lector de pantalla, y ningún texto pedagógico MUST entregarse como imagen.

#### Scenario: Pares de tokens verificados
- **WHEN** se ejecuta la prueba de contraste de los pares texto/fondo declarados
- **THEN** todos alcanzan el umbral que les corresponde; texto blanco sobre `#00adef` o sobre `#01a451` hace fallar la prueba

#### Scenario: Navegación por teclado
- **WHEN** una persona recorre una superficie solo con teclado
- **THEN** alcanza todos los controles en orden lógico y ve un indicador de foco de al menos 3:1

### Requirement: Tipografía
La interfaz SHALL usar Baloo 2 para títulos, carteles y botones, y Atkinson Hyperlegible Next para el cuerpo y el contenido pedagógico, ambas servidas con `next/font`. El cuerpo de lectura MUST tener al menos 16 px de tamaño base, y la jerarquía SHALL marcarse con peso y caja.

#### Scenario: Glifos del español
- **WHEN** se renderiza «¿Año pequeño? ¡Ñandú!» en títulos y en cuerpo
- **THEN** ningún carácter cae en una fuente de respaldo

### Requirement: Estilo sticker
Los controles e ilustraciones SHALL compartir un mismo lenguaje:
- **Contorno:** 3 px en tinta `#1b2440`.
- **Relieve:** sombra interior inferior y sombra exterior desplazada; al presionar un control, este se hunde.
- **Ilustraciones:** planas con brillos y sombras. MUST NOT ser 3D ni emoji, y MUST NOT usar personajes, logos ni dibujos de las referencias. Las ilustraciones decorativas llevan `aria-hidden="true"`.

#### Scenario: Botón presionado
- **WHEN** una persona presiona un botón principal
- **THEN** el botón se hunde y pierde su sombra exterior; con `prefers-reduced-motion` el cambio es instantáneo

### Requirement: Vocabulario de estado cerrado
Los estados de clase y de materia SHALL tomarse de un conjunto cerrado: ahora, programada, lista, hecha y sin material. Cada estado MUST tener su propia marca (icono o forma) y su texto, además del color.

#### Scenario: Estado en escala de grises
- **WHEN** una materia sin material se ve en escala de grises
- **THEN** su estado sigue siendo identificable por la marca y el texto

### Requirement: Inicio de la docente
El inicio de la docente SHALL conservar su estructura actual (saludo, clase de ahora, mundos, franja de estado y friso del día), con los tokens, la tipografía y los componentes de la nueva identidad. 🔶 Estructura por confirmar con el operador.

#### Scenario: Docente entra al inicio
- **WHEN** una persona con contexto DOCENTE abre `/`
- **THEN** ve su friso del día con la nueva identidad, no el mapa del estudiante

### Requirement: Movimiento reducible
Las transiciones de interfaz SHALL durar como máximo 400 ms; el salto del avatar, como máximo 650 ms. Los bucles permitidos son el flotar del avatar, el destello de un cromo dominado, el latido de «¡Nuevo!» y el giro lento de un engranaje. Con `prefers-reduced-motion: reduce` no hay desplazamientos, bucles, giros ni destellos: solo cambios de opacidad o cambios instantáneos.

#### Scenario: Movimiento reducido
- **WHEN** el sistema operativo pide reducir el movimiento
- **THEN** ninguna animación traslada, escala, gira ni repite elementos
