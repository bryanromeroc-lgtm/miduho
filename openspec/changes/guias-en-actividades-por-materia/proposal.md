## Why

La materia presenta una guía, pero esa identidad se pierde al recorrer y abrir la mayoría de sus actividades. La auditoría local encontró 76 de 77 tarjetas curriculares sin la guía correcta, 59 juegos sin ella, dos juegos protagonizados por Armi dentro de materias de Bruno y Andi, y Educación Religiosa sin guía definida; también falta Bruno en el material audiovisual de demostración. El estudiante debe reconocer a la misma guía durante todo el recorrido de su materia.

## What Changes

- Mostrar la guía de la materia en cada tarjeta curricular y asignada, y durante cada actividad y su resultado, sin reemplazar el contenido pedagógico ni agregar focos innecesarios.
- Resolver la guía desde la asignatura de la ruta, no desde el tipo de juego ni desde una portada opcional; cubrir todas las asignaturas con actividades, incluida Educación Religiosa mediante una guía original aún por definir 🔶.
- Sustituir a Armi por Andi en «Armi explora Colombia» y por Bruno en «La ruta de las palabras», en portada, escena, textos y recursos de accesibilidad; conservar mecánica, contenido curricular y calificación.
- Incorporar a Armi de forma coherente en las siete actividades de Matemáticas donde hoy no aparece; los robots y topos pueden conservarse como elementos del juego, sin ocupar el papel de guía.
- Validar el catálogo y las rutas con pruebas para detectar guías ausentes o ajenas antes de publicar nuevas actividades.

## Capabilities

### New Capabilities

- `guia-materia-actividades`: identidad de la guía por asignatura y continuidad en tarjetas, actividad asignada, juego y resultado, con cobertura explícita de materias sin guía actual.

### Modified Capabilities

- `tarjeta-actividad-materia`: cada tarjeta debe mostrar la guía correcta junto al contenido visual de su actividad.
- `reproductor-actividades`: cada juego y su resultado deben conservar la guía de la materia sin alterar la interacción ni la calificación.
- `curriculo-actividades`: la validación del catálogo debe detectar referencias a una guía ajena y falta de guía para la materia.
- `actividad-mapa`: la experiencia de Ciencias Sociales debe estar protagonizada por Andi en vez de Armi.
- `actividad-ruta-palabras`: la experiencia de Comprensión Lectora debe estar protagonizada por Bruno en vez de Armi.

## Impact

- **Interfaz:** `src/features/materias/vista/`, `src/features/actividades/reproductor/`, `src/features/actividades/asignadas/` y escenas especiales de mapa y ruta de palabras; las rutas de `src/app/materias/` transmiten la identidad de la materia.
- **Contenido y recursos:** `src/lib/guias.ts`, `curriculo/actividades/`, portadas y poses originales bajo `public/images/`; Educación Religiosa requiere definición editorial de una guía propia 🔶.
- **QA:** pruebas de cobertura por asignatura y de las dos escenas corregidas, navegación por teclado, contraste, texto alternativo y movimiento reducido en escritorio y móvil.
- **Datos y contratos:** no se prevén migraciones ni cambios de rutas o cuerpos de API; publicar material para una asignatura sin guía pasará a rechazarse con un error de validación. Intentos, notas y permisos no cambian.
