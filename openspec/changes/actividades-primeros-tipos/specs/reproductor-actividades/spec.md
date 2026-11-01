## ADDED Requirements

### Requirement: Jugar una actividad de la materia
La ruta `/materias/[asignatura]/actividades/[id]` SHALL mostrar al estudiante la actividad `id` del currículo de esa asignatura y del grado de su grupo, dentro del mundo plano de la materia. Si la asignatura no es de su grupo o la actividad no es de su grado, MUST responder 404.

#### Scenario: Actividad de su grado
- **WHEN** un estudiante de 5.° abre una actividad de 5.° de una asignatura de su grupo
- **THEN** ve el juego con el título, el tipo y la instrucción

#### Scenario: Actividad ajena
- **WHEN** abre un `id` que no está en el currículo de su asignatura y grado
- **THEN** recibe 404

### Requirement: Interacción accesible
Ningún tipo MUST exigir arrastrar. Acierto y error MUST comunicarse con texto e ícono, no solo con color, y anunciarse en una región `status`. El reloj del concurso MUST NOT cortar la respuesta.

#### Scenario: Error en emparejar
- **WHEN** el estudiante une dos tarjetas que no son pareja
- **THEN** se anuncia «Esas dos no van juntas» y puede seguir intentando

### Requirement: Resultado y repaso
Al terminar SHALL mostrarse estrellas (`estrellasDe` del porcentaje), la cifra de aciertos y un repaso con la respuesta correcta de cada ítem, sin hablar de fracaso ni comparar con otros. MUST indicar que el resultado no se guarda mientras sea práctica libre.

#### Scenario: Todo correcto
- **WHEN** responde bien todas las preguntas de un quiz
- **THEN** ve «¡Excelente!», tres estrellas y «Acertaste N de N»
