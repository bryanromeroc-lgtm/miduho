## Context

El tablero inicial obtiene la guía con `guiaDe(materia.escena)`, pero `VistaMateria` y las rutas de actividades solo transmiten el kit visual. La tarjeta normal pinta `IlustracionTipo` o una portada; el reproductor genérico no recibe la guía. Dieciséis juegos de Matemáticas sí incorporan a Armi en su escena. El tipo `mapa` de Ciencias Sociales y `ruta-palabras` de Comprensión Lectora incorporan a Armi, incluidas poses, portadas y textos. Educación Religiosa usa la escena genérica y no tiene entrada en `GUIAS`. El material docente asignado comparte la vista de materia, pero usa un reproductor distinto.

La auditoría observó 77 archivos curriculares en 11 asignaturas y un material audiovisual docente en la base local. Este cambio debe preservar texto pedagógico HTML, WCAG 2.1 AA, foco visible, español de Colombia y los datos de intentos/calificación. Las guías son personajes originales provisionales, no mascotas institucionales aprobadas 🔶.

## Goals / Non-Goals

**Goals:**
- La guía visible corresponde a la materia en la tarjeta, al abrir la actividad y en el resultado, tanto para práctica libre como para material asignado.
- Resolver las dos escenas con Armi en una materia ajena y cubrir los siete juegos de Matemáticas sin Armi, sin perder sus personajes secundarios ni su mecánica.
- Hacer verificable la cobertura de las asignaturas actuales y detectar futuras publicaciones sin guía.

**Non-Goals:**
- Cambiar el currículo, las preguntas, la calificación, la duración, el audio, los intentos, los permisos o el origen de las actividades.
- Convertir la guía en texto pedagógico, un botón, un asistente conversacional o una identidad oficial del colegio.
- Rediseñar por completo los kits temáticos y la navegación de materias.

## Decisions

### D1. La asignatura es la fuente de identidad

El servidor ya conoce la asignatura y deriva su `escena` antes de renderizar. El contrato de vista incorporará una identidad de guía resuelta desde esa escena; las rutas de práctica libre y asignada pasarán esa identidad al reproductor. `GUIAS` conserva la fuente de datos de nombre, especie y recursos. La misma identidad alimenta «Mis materias», las tarjetas y las actividades. No se infiere el personaje por `tipo`, título, `imagen` ni contenido JSON: esos campos pueden variar o ser editados por la docente.

**Alternativa descartada:** guardar un personaje por actividad en la base o en cada JSON. Duplicaría la asignación y permitiría mezclar, por ejemplo, Armi con Ciencias Sociales.

### D2. Cobertura de Educación Religiosa y asignaturas futuras

Se agregará una escena/guía propia de Educación Religiosa al catálogo de `Escena`, `GUIAS`, kits y tokens, con recursos originales y nombre/especie definidos editorialmente antes de implementar el arte 🔶. No se reutilizará a Ciro ni se llamará «guía» a un ícono genérico. La decoración puede conservar el lenguaje gráfico de MIDUHO; la nueva guía evita atribuir una creencia personal a estudiantes o docentes.

Para una asignatura que aún no tenga guía, la validación del catálogo y la publicación docente fallarán con un mensaje específico. Los datos históricos se auditarán durante la implementación; no se hará una migración de notas o intentos. **Alternativa descartada:** mostrar una guía genérica silenciosa, porque aparenta cumplir la condición sin identidad de materia.

### D3. Presencia común sin tapar el juego

Un componente compartido de guía usará retrato compacto en la tarjeta y junto al encabezado del reproductor; el resultado repetirá la identidad. La tarjeta mantiene un solo enlace/foco y su portada o ilustración propia. El retrato no contiene texto pedagógico; el nombre visible y seleccionable vincula personaje con materia. En escenas con el personaje integrado se evita añadir una segunda figura grande: el indicador común es pequeño y la escena conserva sus poses. En móvil se adapta al espacio sin ocultar la pregunta, el video ni los controles.

**Alternativa descartada:** añadir un personaje distinto a cada componente de juego. Haría 20 implementaciones y dejaría sin cobertura a nuevos tipos o material docente.

### D4. Dos sustituciones narrativas completas

El juego de mapa usará a Andi y la ruta de palabras a Bruno. Se reemplazan portadas, poses, nombres de clases/recursos que codifiquen a Armi cuando afecten mantenimiento, instrucciones, mensajes y `aria-label`/texto alternativo informativo. Los movimientos actuales se adaptan a la silueta y acciones de cada guía; se conservan posiciones de interacción, ritmo, pausas, foco, estado `status` y `prefers-reduced-motion`. La calificación y los generadores de rondas permanecen intactos. Las ilustraciones se crean como recursos originales del proyecto y se verifica su procedencia.

El título y el slug curricular de «Armi explora Colombia» pasan a «Andi explora Colombia» / `andi-explora-colombia`. La ruta anterior se resolverá hacia la nueva actividad solo dentro de Ciencias Sociales para conservar enlaces existentes; no se duplica la actividad en el catálogo.

**Alternativa descartada:** añadir un retrato de Andi o Bruno encima de una escena que sigue protagonizada por Armi. Dejaría dos guías contradictorias en una misma actividad.

### D5. Cobertura de Matemáticas y guardia automatizada

Los cinco tipos genéricos de Matemáticas reciben a Armi desde el componente compartido. «Duelo de divisiones» y «El taller de los topos» conservan robots y topos como piezas del juego, mientras el encabezado y el resultado identifican a Armi como guía. Una prueba de inventario recorre los JSON curriculares, resuelve la asignatura y su guía, y detecta referencias/recursos a una guía de otra materia. Pruebas de componente cubren tarjeta normal, destacada, reproductor, video asignado y resultado; pruebas específicas verifican la narrativa y los recursos de mapa/ruta.

**Alternativa descartada:** inspección manual solo al final. La causa está en componentes compartidos y puede reaparecer cuando se agreguen actividades.

## Risks / Trade-offs

- [La guía compacta compite con títulos largos o video] → Tamaño contenido, diseño adaptable y revisión a 360, 390 y 1440 px; el texto pedagógico conserva prioridad visual.
- [Nueva guía de Educación Religiosa sin acuerdo editorial] → Mantener nombre, especie y arte como decisión pendiente 🔶 hasta cerrar la revisión de producto; no publicar una mascota improvisada.
- [Cambio de silueta rompe animaciones de mapa/ruta] → Recursos con dimensiones y puntos de anclaje verificados en navegador, además de alternativa de movimiento reducido.
- [Actividades docentes antiguas de otra base usan asignaturas sin guía] → Auditoría de datos antes de activar la validación de publicación; los intentos históricos se conservan.
- [La guía se anuncia de forma repetitiva] → Una etiqueta textual breve por pantalla y retratos decorativos con `alt=""` cuando el nombre ya aparece junto a ellos.

## Migration Plan

1. Cerrar la identidad editorial de Educación Religiosa y crear sus recursos originales.
2. Agregar la identidad compartida a vistas y reproductores, manteniendo el contrato de notas intacto.
3. Reemplazar por completo las dos escenas con guía ajena y actualizar sus archivos curriculares.
4. Ejecutar el inventario automatizado, pruebas de componentes, `npm run lint`, `npm run build`, `npm test` y QA visual/accesible en navegador.
5. Publicar junto con los recursos estáticos. Si se revierte, volver al código y arte anteriores; no hay migración de base que deshacer.

## Open Questions

- 🔶 Nombre, especie y dirección gráfica finales de la guía de Educación Religiosa: requieren revisión editorial antes de crear el arte. La especificación sí fija que debe ser propia y estar resuelta antes de dar el cambio por implementado.
