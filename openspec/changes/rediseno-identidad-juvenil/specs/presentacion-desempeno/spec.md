## ADDED Requirements

### Requirement: Estrellas a partir del porcentaje
La interfaz SHALL representar resultados con 0 a 3 estrellas, calculadas por una función pura a partir de un porcentaje (0–100) entregado por `fundacion-actividades`. Umbrales provisionales:
- 0 estrellas sin intentos enviados;
- 1 estrella por debajo de 60 %;
- 2 estrellas desde 60 %;
- 3 estrellas desde 90 %.

Los umbrales SHALL vivir en un único módulo configurable, marcados 🔶 hasta que el colegio entregue el SIEE. Las estrellas MUST NOT presentarse como la nota oficial.

#### Scenario: Conversión
- **WHEN** el porcentaje es 59.99, 60, 89.99 o 90
- **THEN** la función devuelve 1, 2, 2 y 3 estrellas, respectivamente

### Requirement: Resumen de desempeño por materia
Para cada asignatura, el servidor SHALL calcular, a partir de `fundacion-actividades`:
- **estrellas:** promedio de los porcentajes de los mejores intentos en las actividades que cuentan como nota, convertido con la misma función;
- **avance:** actividades con al menos un intento enviado frente a las asignadas abiertas o cerradas;
- **sigue:** título de la primera actividad asignada y abierta sin intento enviado, ordenada por fecha de cierre.

Sin datos, cada campo SHALL ser nulo, y el cromo y la cabecera lo omiten. El total «mis estrellas» del encabezado SHALL ser la suma de las estrellas de sus materias en el período vigente, y se oculta si no hay datos.

#### Scenario: Sin datos
- **WHEN** la API de resultados no está disponible
- **THEN** los campos son nulos, los cromos omiten estrellas, avance y «Sigue con», y el encabezado no muestra el total

#### Scenario: Siguiente actividad
- **WHEN** hay dos actividades abiertas sin intento, con cierres el 12 y el 15 de septiembre
- **THEN** `sigue` es la que cierra el 12

### Requirement: Tarjeta de actividad con intentos
La tarjeta de actividad SHALL mostrar el nombre, el área, las estrellas del mejor intento y los intentos usados frente al máximo (3 por defecto). Esos datos SHALL tener también una forma textual accesible («2 de 3 estrellas · 1 intento disponible»).

#### Scenario: Intentos agotados
- **WHEN** el estudiante usó los 3 intentos
- **THEN** la tarjeta dice «Sin intentos disponibles» y deshabilita «Empezar», con la razón visible

### Requirement: Pantalla de resultado
Al terminar un intento, la interfaz SHALL mostrar:
- las estrellas de ese intento;
- si mejoró el mejor resultado;
- los intentos restantes;
- las acciones «Intentar de nuevo» (si quedan intentos) y «Volver a mis materias».

Cuando el intento mejora el resultado, el avatar del estudiante SHALL aparecer celebrando. Si la materia alcanza 3 estrellas, la pantalla SHALL anunciar que su cromo ahora brilla.

#### Scenario: Intento que no mejora
- **WHEN** el nuevo intento obtiene menos estrellas que el mejor anterior
- **THEN** la pantalla muestra el resultado y aclara que se conserva el mejor, sin mensaje de fracaso

### Requirement: Sin comparación entre estudiantes
La presentación del desempeño MUST NOT incluir clasificaciones, posiciones ni comparaciones entre estudiantes en ninguna vista del estudiante.

#### Scenario: Vista del estudiante
- **WHEN** un estudiante ve sus materias, sus actividades o un resultado
- **THEN** solo ve su propio desempeño

### Requirement: Componentes de presentación puros
Los componentes de desempeño y el cromo SHALL recibir sus datos por props y MUST NOT importar nada de `src/server/`. Las vistas de muestra para revisión SHALL usar datos ficticios, sin nombres de menores, rotulados «Ejemplo».

#### Scenario: Vista de muestra
- **WHEN** se abre la vista de muestra de los componentes
- **THEN** cada dato está rotulado «Ejemplo» y ninguno corresponde a una persona real
