> Fases entregables (design, Risks): **A** = grupos 1–3 (base, semilla e importación; nada cambia para los usuarios) · **B** = grupos 4–7 (asignar e intentos; se retira la práctica libre) · **C** = grupos 8–9 (editor de quizzes) · grupo 10 = cierre.

## 1. Modelo de datos (fase A)

- [ ] 1.1 Añadir a `schema.prisma` `ReferenteCurricular`, `Malla`, `ElementoMalla`, `ElementoMallaReferente`, `Actividad`, `ActividadReferente`, `VersionActividad`, `AsignacionActividad`, `IntentoActividad`, `RespuestaItem` y `ResultadoActividad`, con enums, relaciones e índices (design D1, D3, D6, D7)
- [ ] 1.2 Generar la migración y añadir a mano: `CHECK` de origen (`DOCENTE` exige autora y no tiene slug; `CURRICULO` exige slug), `CHECK` de fechas, intentos y porcentaje, índice único parcial de un intento `EN_CURSO`, índice único parcial de asignación `PUBLICADA` por actividad, grupo y período, y trigger que impide `UPDATE`/`DELETE` en `versiones_actividad`
- [ ] 1.3 Pruebas de integración de cada restricción SQL

## 2. Semilla curricular de 5.° (fase A)

- [ ] 2.1 Esquemas Zod de archivo de referentes y de malla en `src/server/modules/curriculo/esquemas.ts`; ampliar `esquemaArchivoActividad` con `referentes: string[]` (mínimo 1)
- [ ] 2.2 Transcribir literal, con URL de fuente, los DBA de 5.° y sus evidencias de Matemáticas, Lenguaje, Ciencias Naturales, Ciencias Sociales e Inglés en `curriculo/referentes/` (no parafrasear ni inventar)
- [ ] 2.3 Transcribir los Estándares del ciclo 4.°–5.° que cite la malla demo, incluidos los de Competencias Ciudadanas para Ética, y redactar referentes `INSTITUCIONAL` de demostración para Robótica (componentes de las Orientaciones T&I 2022), Emprendimiento, Artística, Educación Física y Religiosa
- [ ] 2.4 Escribir la malla demo de 5.° en `curriculo/malla-demo/5/`: 11 asignaturas × 4 períodos, con ejes oficiales por área, temas tomados de la Malla orientativa MEN de la bóveda, desempeños de saber, hacer y ser, y referentes por tema
- [ ] 2.5 Etiquetar las 69 actividades de `curriculo/actividades/` con sus referentes
- [ ] 2.6 🔶 Dejar anotado en `docs/` que la semilla debe revisarla una docente de 5.° antes de mostrarla al colegio

## 3. Importación y catálogo en la base (fase A)

- [ ] 3.1 `scripts/importar-curriculo.ts` (`npm run curriculo:importar`): referentes → malla del año activo → actividades, en una transacción; validación general, por tipo y de alineación (DBA obligatorio si el área lo tiene; referentes del grado); hash canónico; versión nueva solo si cambia; `RETIRADA` para archivos borrados; resumen de lo creado
- [ ] 3.2 Pruebas: archivo inválido (no importa nada), referente sin fuente, referente de otro grado, actividad de Matemáticas sin DBA, reimportación sin cambios (0 nuevos), corrección (versión 2) y retiro con intentos
- [ ] 3.3 Prueba del currículo: las 69 actividades importan y cada una coincide con al menos un tema de la malla demo
- [ ] 3.4 Añadir el registro de `soloRespondidos` por tipo en `tipos/registro.ts`, para que cliente y servidor califiquen igual (design D7)
- [ ] 3.5 Llamar la importación desde el seed de desarrollo, la base plantilla de pruebas y `deploy/deploy.sh` (después de `migrate`)

## 4. Servicio de actividades (fase B)

- [ ] 4.1 Crear `src/server/modules/actividades/` (`servicio.ts`, `reglas.ts`, `esquemas.ts`, `index.ts`) con `crearServicioActividades(db)`, según la convención de `academico`
- [ ] 4.2 Catálogo de la docente: actividades `PUBLICADA` de la asignatura y el grado de su asignación (colegio, colegas y propias, más sus borradores), agrupadas por período y tema de la malla según los referentes compartidos, con «Otras de tu grado» y filtros de período, tema, referente, tipo y origen
- [ ] 4.3 Asignar a uno o varios grupos en una transacción: reglas de D6, valores por defecto (3 intentos, cuenta como nota, cierre al fin del período a las 23:59 hora de Colombia) y congelar la versión del quiz de docente en su primera asignación
- [ ] 4.4 Editar (fechas e intentos sin bajar de los usados; período solo sin intentos → `409`) y anular conservando intentos
- [ ] 4.5 Intentos: `iniciarORetomar` (único `EN_CURSO`), `enviar` (validar, calificar con `calificarIntento`, `RespuestaItem` por ítem, porcentaje y recálculo del mejor intento, idempotente) y `cerrarVencidos` (perezoso, pasa a `ABANDONADO`)
- [ ] 4.6 Consultas del estudiante: «mis actividades» por materia con estado e intentos restantes, y desempeño por materia (estrellas, avance, «Sigue con»)
- [ ] 4.7 Pruebas del servicio: grupo ajeno (`403`), grado distinto (`422`), cierre fuera del período, asignación repetida (`409`), intentos agotados, asignación cerrada, reenvío idempotente, puntaje del cliente ignorado, mejor intento que no baja, empate, abandono que no consume intento y anulación

## 5. API (fase B)

- [ ] 5.1 Route Handlers delgados de docente: `catalogo`, `actividades/:id`, `asignaciones` (`POST`, `GET`, `PATCH`, `DELETE`), `referentes` y `malla`, con `http-acceso.ts`, y `404` para lo ajeno
- [ ] 5.2 Route Handlers de estudiante: `mias`, `asignaciones/:id/intentos` y `intentos/:id/envio`
- [ ] 5.3 Pruebas HTTP de `401`/`403`/`404`/`409`/`422` por ruta

## 6. Lado estudiante (fase B)

- [ ] 6.1 Adaptadores reales de `PuertoActividadesDeMateria` y `PuertoDesempeno` en `src/server/modules/materias/`; la agenda usa la misma consulta
- [ ] 6.2 La ruta `/materias/[asignatura]/actividades/[id]` pasa a usar el id de la asignación: inicia o retoma el intento en el servidor y responde `404` si no es suya
- [ ] 6.3 Reproductor con modos `intento` y `vista-previa`: en `intento` envía al servidor, muestra el resultado devuelto, «Intento N de M» y «Jugar otra vez» solo si quedan intentos; respaldo en `sessionStorage` y reintento con espera creciente si falla el envío
- [ ] 6.4 Retirar la práctica libre: textos de `reglas.ts`, lectura del catálogo por disco en `materias/index.ts` y `actividadDeSesion`; conservar `/muestras`
- [ ] 6.5 `scripts/demo-quinto.ts` crea asignaciones de ejemplo en las 11 materias para la cuenta demo

## 7. Lado docente: clase y asignación (fase B)

- [ ] 7.1 Usar la skill impeccable para dar forma a la pestaña Actividades y al diálogo «Asignar…» (catálogo por la malla, asignadas, mis quizzes), con el rótulo «Malla de demostración»
- [ ] 7.2 `/clases` lista las `AsignacionDocente` `ACTIVA` reales; `/clases/[clase]` usa el `asignacionDocenteId` y responde `404` si es ajena; las otras pestañas quedan como están, rotuladas 🔶
- [ ] 7.3 Pestaña Actividades: «Asignadas» por período con estado, editar y anular; «Catálogo» con filtros, vista previa y «Asignar…»
- [ ] 7.4 Diálogo «Asignar…»: grupos de la docente del mismo grado y asignatura, período, apertura, cierre, intentos y si cuenta como nota, con valores por defecto y errores junto a cada campo
- [ ] 7.5 Vista previa de cualquier actividad del catálogo con el reproductor en modo `vista-previa`

## 8. Quizzes de la docente: servidor (fase C)

- [ ] 8.1 Servicio: crear `BORRADOR` (asignatura y grado con asignación activa), editar mientras ninguna asignación lo use (`409` después), publicar (validación del tipo y de la alineación), duplicar (de colegas o del currículo, solo los tres tipos de preguntas), borrar sin intentos o retirar con intentos, y retiro por `ADMIN`
- [ ] 8.2 Visibilidad: borrador solo para la autora; publicado para las docentes de la misma asignatura y grado; lo ajeno responde `404`
- [ ] 8.3 Saneamiento a texto plano e `itemId` generados en el servidor (`p1…pN`)
- [ ] 8.4 Route Handlers `quizzes` (`POST`, `PATCH`, `DELETE`), `quizzes/:id/publicacion`, `actividades/:id/duplicado` y `quizzes/:id/retiro`
- [ ] 8.5 Pruebas: asignatura ajena, colega no edita, edición después de asignar (`409`), publicar sin DBA en área con DBA, menos de 3 preguntas (`422`), HTML como texto, duplicado del currículo, borrar sin intentos (asignaciones de colegas incluidas) y retirar con intentos

## 9. Quizzes de la docente: editor (fase C)

- [ ] 9.1 Usar la skill impeccable para dar forma al editor
- [ ] 9.2 Editor en `/clases/[clase]/quizzes/nuevo` y `/clases/[clase]/quizzes/[actividadId]`: datos generales, tipo (Quiz con atajo Verdadero o falso, Concurso con segundos, Completar), tema de la malla que precarga referentes, selector de DBA, y preguntas para agregar, reordenar y borrar, marcando la correcta y la explicación
- [ ] 9.3 Validación en el cliente con `esquemaContenido` del tipo, errores junto a cada campo, autoguardado del borrador con debounce y aviso permanente de datos personales
- [ ] 9.4 «Mis quizzes» en la pestaña Actividades: borradores y publicados, con vista previa, publicar, duplicar y borrar (el diálogo dice en cuántos grupos está asignado)
- [ ] 9.5 Accesibilidad del editor: teclado completo (reordenar sin arrastre), etiquetas, foco visible y revisión con axe sin violaciones

## 10. Verificación y cierre

- [ ] 10.1 E2E: la docente crea un quiz, lo publica y lo asigna; el estudiante lo ve en su materia y su agenda, lo juega dos veces y queda el mejor intento; una colega del mismo grado lo ve y lo duplica
- [ ] 10.2 Ampliar el escenario k6 con 250 estudiantes enviando intentos: p95 < 500 ms y sin errores de unicidad
- [ ] 10.3 `npm run build`, `npm run lint` y `npm test` en verde
- [ ] 10.4 Actualizar `docs/arquitectura-backend.md`, `docs/modelo-de-entidades.md` y `docs/actividades/tipos.md`; registrar en la bóveda (Estado-de-la-construccion, Decisiones-de-construccion) que `actividades-en-clase` reemplaza a `fundacion-actividades`
