## Why

Hoy las actividades de MIDUHO son **práctica libre**. El estudiante ve todo el catálogo de su grado, no se guarda nada y la docente no participa: no puede asignar los juegos a sus grupos ni crear sus propias preguntas. El producto promete que **el contenido ya está en la clase** y que las actividades **cuentan como nota** alineadas con la malla y los DBA (DC-05, DC-09). Para cumplirlo, el catálogo tiene que vivir en la base, la docente tiene que poder asignar y crear quizzes, y el estudiante tiene que hacer solo lo asignado, con intentos guardados y calificados en el servidor.

Este cambio **reemplaza a `fundacion-actividades`**: hereda su modelo (versiones, asignación, intentos, mejor intento) y le suma el lado docente, los quizzes de las docentes y una malla de demostración de 5.°.

Decisiones tomadas con el responsable del producto (2026-11-03):
- Todo en base de datos. El catálogo del equipo sigue escribiéndose en git y se **importa**.
- La docente asigna juegos y quizzes, y **crea quizzes** (Quiz, Concurso, Completar) para sus asignaturas y grados.
- Un quiz de una docente se **comparte** con las docentes de la misma **asignatura y grado**. Solo la autora lo edita; las demás lo usan o lo **duplican**. No hay aprobación previa.
- **Una sola versión** por quiz de docente: se edita hasta su primera asignación; después, si quedó mal, se borra y se crea otro.
- Solo texto en las preguntas (sin imágenes) en esta versión.
- Malla y DBA **provisionales**: tablas reales, llenadas con una semilla de demostración de 5.° (DBA del MEN transcritos literal para Matemáticas, Lenguaje, Naturales, Sociales e Inglés, y una malla demo de 4 períodos para las 11 asignaturas).
- El DBA es obligatorio si el área lo tiene; si no, el tema de la malla aporta el referente.
- Al asignar, por defecto: 3 intentos, cuenta como nota, cierre al fin del período.
- La práctica libre **desaparece**: el estudiante solo ve lo asignado.
- La entrada de la docente es la pestaña **Actividades** de su clase («Mis clases» → asignatura · grupo).

## What Changes

- **Referentes y malla en la base:** catálogo de referentes curriculares (DBA con sus evidencias, Estándares y referentes institucionales) y malla institucional (asignatura × grado × año → período → eje → tema, con desempeños). Se llenan con una **semilla de demostración de 5.°** versionada en git y rotulada como demo.
- **Catálogo de actividades en la base:** `Actividad` con origen `CURRICULO` (importada desde `curriculo/actividades/`, con versiones por hash) u `DOCENTE` (autora, alcance asignatura + grado, una sola versión). Toda actividad declara al menos un referente. Las 69 actividades de 5.° se etiquetan.
- **Quizzes de la docente:** crear, editar (hasta la primera asignación), vista previa, duplicar (del catálogo o de colegas), publicar y borrar o retirar. El editor sirve para `seleccion-multiple`, `concurso` y `completar`, solo texto, y valida con el mismo esquema Zod del tipo.
- **Asignación:** la docente asigna una actividad de su catálogo a uno o varios de sus grupos, con apertura, cierre, intentos y si cuenta como nota.
- **Intentos y resultados:** el estudiante inicia un intento de lo asignado, envía sus respuestas y el **servidor califica** con la función pura del tipo. El resultado es el mejor intento en porcentaje 0–100, con estrellas para el estudiante.
- **Lado docente con datos reales:** «Mis clases» y la pantalla de la clase pasan a leer las asignaciones docentes. La pestaña Actividades muestra el catálogo, lo asignado y los quizzes propios.
- **Lado estudiante:** la vista de materia, «Mis materias» (estrellas y avance) y «Mi agenda» leen lo asignado. **BREAKING:** se retira la práctica libre.
- Se **retira** el cambio `fundacion-actividades` (sin implementar); su contenido útil queda aquí.

## Capabilities

### New Capabilities

- `referentes-y-malla`: catálogo de referentes del MEN e institucionales, malla institucional por período y semilla de demostración de 5.°.
- `catalogo-actividades`: actividades en la base con origen, alineación obligatoria con referentes, importación idempotente desde git y versiones inmutables.
- `quizzes-docente`: creación, edición, vista previa, duplicado, publicación, compartición por asignatura y grado, y borrado o retiro de quizzes de docentes.
- `asignacion-actividades`: catálogo de la docente ordenado por la malla, asignación a sus grupos, edición y anulación, y la pestaña Actividades de la clase.
- `intentos-resultados`: ciclo del intento, calificación en el servidor, mejor intento, cierre automático y la experiencia del estudiante con lo asignado.

### Modified Capabilities

(Ninguna: `openspec/specs/` no tiene especificaciones archivadas.)

## Impact

- **Base de datos:** modelos nuevos `ReferenteCurricular`, `Malla`, `ElementoMalla`, `ElementoMallaReferente`, `Actividad`, `ActividadReferente`, `VersionActividad`, `AsignacionActividad`, `IntentoActividad`, `RespuestaItem` y `ResultadoActividad`, en una migración con restricciones SQL (`CHECK`, índices parciales y trigger de inmutabilidad).
- **Contenido:** `apps/web/curriculo/referentes/` (DBA de 5.°, Estándares 4.°–5.° y referentes institucionales), `apps/web/curriculo/malla-demo/5/`, y referentes añadidos a las 69 actividades existentes.
- **Servidor:** `src/server/modules/curriculo/` (importación, referentes, malla), `src/server/modules/actividades/` nuevo (catálogo, quizzes, asignación, intentos), adaptadores reales de `src/server/modules/materias/puertos.ts`, `scripts/importar-curriculo.ts` y Route Handlers en `src/app/api/actividades/**`.
- **Interfaz:** `src/app/clases/**` pasa de `@/data/demo` a datos reales (pestaña Actividades, asignar, editor de quizzes); `Reproductor` con modos «intento» y «vista previa» en lugar de práctica libre; vista de materia, «Mis materias» y agenda con datos reales.
- **Operación:** `deploy/deploy.sh` ejecuta la importación del currículo después de `migrate`; `scripts/demo-quinto.ts` crea asignaciones de ejemplo.
- **Fuera de alcance:** tabla de resultados y desempeño por DBA para la docente (los datos se guardan desde ya), pantalla del coordinador para editar la malla, conversión a la escala del SIEE, imágenes en quizzes, guardado por ítem y reanudación entre dispositivos, salas en vivo.
