## ADDED Requirements

### Requirement: Estilo 2D flat
Toda la decoración de la vista de materia SHALL ser vectorial 2D plana, de autoría propia, con rellenos de color sólidos. MUST NOT usar efectos 3D, relieves, sombras, texturas realistas ni contornos negros gruesos. El contraste visual MUST resolverse con planos de color y espacio.

#### Scenario: Sin efectos prohibidos
- **WHEN** se analizan los estilos y SVG de la vista
- **THEN** no hay `box-shadow`, `drop-shadow`, filtros de volumen, degradados que simulen relieve ni trazos de tinta oscura

### Requirement: Un kit temático por materia
Cada una de las materias (lectura, matemáticas, naturales, inglés, robótica, emprendimiento, ética, artística, física, sociales) SHALL tener un kit con: fondo pastel, marcas de agua, cabecera, utilería (clip, cinta y chinche) y marco de tarjeta, más al menos 3 elementos sueltos, todos alusivos a esa materia según la tabla de `design.md` D4. Una materia sin coincidencia SHALL usar el kit `generica` de útiles escolares.

#### Scenario: Matemáticas
- **WHEN** se abre una materia de matemáticas
- **THEN** la cabecera usa regla, escuadra, compás y números; los clips, cintas y chinches son de papel cuadriculado y fichas numéricas; los marcos tienen marcas de regla; y no aparece ningún elemento de otra materia

#### Scenario: Ciencias naturales
- **WHEN** se abre una materia de ciencias naturales
- **THEN** se ven tubos de ensayo, lupa y hojas, y los marcos son de hojas y gotas

#### Scenario: Materia desconocida
- **WHEN** el nombre de la asignatura no coincide con ningún kit
- **THEN** se usa el kit genérico escolar

### Requirement: Temática estricta
Ningún elemento decorativo MUST pertenecer a otra materia ni a una temática genérica sin relación (bosques, madera, paisajes). Los catálogos de kits SHALL ser verificables por prueba: ningún id de elemento se comparte entre kits, salvo los del kit genérico.

#### Scenario: Catálogo
- **WHEN** corre la prueba de kits
- **THEN** cada kit declara al menos 3 sueltos, 3 marcas y los 3 tipos de utilería, y no hay ids repetidos entre kits

### Requirement: Fondo pastel con marcas de agua
El fondo SHALL ser un tono pastel neutro y claro de la materia (croma OKLCH ≤ 0.03), decorado únicamente con marcas de agua de símbolos de la materia con opacidad ≤ 0.12 y desaturadas, sin imágenes raster. El fondo MUST NOT competir con el texto: el texto va siempre sobre un plano sólido.

#### Scenario: Marcas sutiles
- **WHEN** se mide la capa de marcas
- **THEN** su opacidad es ≤ 0.12 y está marcada `aria-hidden` con `pointer-events: none`

### Requirement: Accesibilidad de la decoración
La decoración SHALL ser `aria-hidden` o `alt=""`. Los pares de texto sobre planos de tarjeta, cabecera y chips MUST tener contraste ≥ 4.5:1 en todos los kits, verificado por prueba. Los elementos sueltos MUST NOT tapar texto ni controles.

#### Scenario: Contraste
- **WHEN** corre la prueba de contraste
- **THEN** todos los pares texto/fondo de los 11 kits cumplen 4.5:1

### Requirement: Sin copia de referentes
La decoración MUST NOT reproducir la mascota, escenas, texto ni identidad de la imagen de referencia ni de otras plataformas, ni usar banderas o íconos de otros países como cliché.

#### Scenario: Revisión anti-copia
- **WHEN** se ejecuta `/impeccable critique`
- **THEN** el informe no reporta similitudes con la referencia
