## Context

- **Reemplaza a `fundacion-actividades`** (diseñado, 0/30 tareas, sin código). Se conservan sus decisiones de versiones inmutables, asignación ligada a `AsignacionDocente`, cierre automático perezoso, mejor intento y calificación en el servidor. Cambian el lugar de los referentes (base, no git), el origen de las actividades (también docentes) y el alcance (incluye la interfaz).
- **Observado en el código:**
  - El catálogo se lee del disco en cada consulta (`src/server/modules/curriculo/catalogo.ts`) y se valida con `leerActividad` (`src/features/actividades/tipos/registro.ts`). Las actividades no tienen referentes ni período, solo `tema` en texto.
  - El contrato `DefinicionTipoActividad` (`tipos/contrato.ts`) tiene `items`, `calificar` y `repaso`, y `calificarIntento` es puro. No tiene `paraEstudiante`.
  - Hay 24 tipos con reproductor. Cada juego recibe el contenido completo y entrega **todas** las respuestas al final con `alTerminar(respuestas)`; no hay callback por ítem.
  - El reproductor califica en el cliente (práctica libre); los puertos de `materias` (`actividadesSinFuente`, `desempenoSinFuente`) esperan una fuente real.
  - «Mis clases» (`src/app/clases/**`) usa `@/data/demo`. La pestaña «Actividades» existe pero está vacía.
  - El modelo académico ya tiene `Periodo` con fechas, `AsignacionDocente` (docente × asignatura × grupo × año) y `AsociacionEstudianteGrupo`.
- Las 11 asignaturas de 5.° y sus áreas (nombres de la Ley 115) están en `scripts/demo-quinto.ts`.
- Solo existen tres roles: `ADMIN` (también coordinador, DC-09), `DOCENTE` y `ESTUDIANTE`.

## Goals / Non-Goals

**Goals:**
- Que la docente asigne cualquier actividad de su catálogo y cree quizzes en minutos, desde su clase.
- Que el estudiante vea solo lo asignado y que su resultado quede guardado y calificado por el servidor.
- Un modelo que no haya que rehacer cuando lleguen la pantalla del coordinador, la escala del SIEE y los resultados de la docente.
- Datos de demostración de 5.° creíbles y rotulados: nada se presenta como la malla real del colegio.

**Non-Goals:**
- Tabla de resultados y resumen por DBA para la docente (los datos se guardan; la vista va en el cambio siguiente).
- Pantalla del coordinador para crear o editar la malla.
- Escala del SIEE, ponderaciones y nota del período.
- Imágenes en las preguntas de las docentes.
- Guardado por ítem, reanudación entre dispositivos y salas en vivo.
- Proyección segura (`paraEstudiante`) de los 24 tipos (ver D7).

## Decisions

### D1. Referentes y malla en la base, semilla en git
```
apps/web/curriculo/
├─ referentes/<area>.json          DBA (con evidencias), Estándares, institucionales
├─ malla-demo/5/<asignatura>.json  malla de demostración: período → eje → tema
└─ actividades/<asignatura>/<grado>/<slug>.json   (ya existe)
```
`npm run curriculo:importar` lo vuelca todo en una transacción y en orden: referentes → malla → actividades.
- **Referentes:** `ReferenteCurricular(codigo único, tipo DBA|EVIDENCIA|ESTANDAR|INSTITUCIONAL, areaId, gradoDesde, gradoHasta, enunciado, fuente, padreId?)`. Las evidencias son hijas de su DBA (`padreId`). Los DBA y Estándares se transcriben **literal** con la URL del documento del MEN; `fuente` es obligatoria. Las áreas sin DBA ni Estándar del MEN (Artística, Educación Física, Religiosa, Emprendimiento) usan referentes `INSTITUCIONAL` redactados por nosotros y marcados como demo.
- **Malla:** `Malla(asignaturaId, gradoId, anioLectivoId, origen DEMO|INSTITUCIONAL)` → `ElementoMalla(periodoOrden 1–4, eje, tema, desempenoSaber, desempenoHacer, desempenoSer, orden)` → `ElementoMallaReferente`. La semilla crea mallas `DEMO` para el año activo.
- **Por qué tablas y no constantes:** la pantalla del coordinador escribirá en estas mismas tablas, sin migrar las actividades ya etiquetadas.
- *Alternativa:* constantes en TypeScript. Descartada: obliga a migrar las referencias después.

### D2. La actividad se alinea con referentes, no con la malla
`ActividadReferente(actividadId, referenteId)`. El catálogo de la docente se ordena con la unión **malla → referentes → actividades**: una actividad aparece bajo cada tema cuyos referentes comparte. Las que no coinciden con ningún tema van a «Otras de tu grado».
- **Regla de alineación:** si el área tiene DBA en el catálogo, la actividad declara al menos un `DBA` o `EVIDENCIA` de su grado. Si no, declara al menos un referente (`ESTANDAR` o `INSTITUCIONAL`) aplicable a su grado.
- En el editor, la docente elige primero el **tema de la malla**; eso precarga los referentes del tema y ella ajusta los DBA. Se guardan los referentes, no el tema.
- *Alternativa:* `elementoMallaId` en la actividad. Descartada: la malla cambia cada año y es del colegio; el referente no (RN-58).

### D3. Una tabla `Actividad` con dos orígenes
```
Actividad (id, slug?, titulo, instruccion, tema, tipo, asignaturaId, gradoId,
           origen CURRICULO|DOCENTE, autorId?, estado BORRADOR|PUBLICADA|RETIRADA,
           contenidoBorrador jsonb?, duplicadaDeId?, creadoEn, actualizadoEn)
  ├─ ActividadReferente
  └─ VersionActividad (actividadId, numero, tipo, versionEsquema, contenido jsonb,
                       puntajeMaximo, hash)            — inmutable (trigger)
```
- **CURRICULO:** `slug` único y estado `PUBLICADA` o `RETIRADA`. La importación crea una versión nueva solo si cambia el hash (SHA-256 del JSON canónico). Un archivo borrado pasa a `RETIRADA`.
- **DOCENTE:** sin `slug`, con `autorId`. Mientras es editable, el contenido vive en `contenidoBorrador`. La **primera asignación** congela `VersionActividad` número 1 dentro de la misma transacción. Desde ahí, editar responde `409`. Nunca tiene versión 2 (decisión de producto).
- `CHECK`: `origen = 'DOCENTE'` exige `autorId` y prohíbe `slug`; `origen = 'CURRICULO'` exige `slug`.
- El índice `(asignaturaId, gradoId, estado)` sirve al catálogo y a la compartición.

### D4. Compartición y permisos de los quizzes
- **Ve** un quiz `PUBLICADA` de docente toda docente con una `AsignacionDocente` `ACTIVA` de esa asignatura en un grupo de ese grado, en el año activo. Un `BORRADOR` solo lo ve su autora.
- **Edita, publica y borra** solo la autora, mientras tenga esa asignación activa. Si la pierde, el quiz sigue compartido pero queda sin quien lo edite 🔶.
- **Duplica** cualquier docente que pueda verlo, o una actividad `CURRICULO` de tipo `seleccion-multiple`, `concurso` o `completar`. La copia es un `BORRADOR` suyo con `duplicadaDeId` y los mismos referentes.
- **Borrar:** si ninguna asignación del quiz tiene intentos, se borra junto con sus asignaciones vacías (también las de colegas, que dejan de verla). Si alguna tiene intentos, pasa a `RETIRADA`: sale del catálogo, no admite asignaciones nuevas, las asignaciones abiertas siguen hasta su cierre y las notas se conservan.
- `ADMIN` puede retirar cualquier quiz de docente por la API (sin pantalla en este cambio).
- Lo ajeno responde `404`, para no revelar que existe.

### D5. Editor: el esquema del tipo es la única regla
El formulario arma el `contenido` y lo valida en el cliente con `definicion.esquemaContenido` (Zod se importa en el cliente). El servidor vuelve a validar con el mismo esquema antes de guardar. No se escriben reglas paralelas.
- **Tipos editables:** `seleccion-multiple` (con un atajo «Verdadero o falso» de 2 opciones), `concurso` (más `segundos`) y `completar`. Se cambia de tipo entre Quiz y Concurso sin perder las preguntas.
- **Texto plano:** los campos se guardan sin HTML y se muestran como texto en React. Los límites salen del esquema: de 3 a 12 preguntas, de 2 a 4 opciones, sin opciones repetidas.
- **Autoguardado** del borrador (con debounce) y una **vista previa** con el reproductor en modo `vista-previa`, que califica en el cliente y no guarda.
- **Aviso fijo** junto al editor: «No escribas nombres ni datos de estudiantes» (regla dura 1).
- El `itemId` se genera en el servidor (`p1…pN`) y es estable dentro de la versión.

### D6. Asignación
`AsignacionActividad(versionActividadId, asignacionDocenteId, grupoId, periodoId, abreEn, cierraEn, maxIntentos, cuentaComoNota, estado PUBLICADA|ANULADA, creadoPorId)`.
- Asignar a varios grupos crea una asignación por grupo, en una sola transacción.
- La actividad del catálogo `CURRICULO` se asigna con su **última versión**. La de docente congela su versión (D3).
- **Por defecto:** abre ahora, cierra al fin del período vigente (23:59 en hora de Colombia), 3 intentos y cuenta como nota.
- **Reglas:** `AsignacionDocente` `ACTIVA` de la misma asignatura y grupo, grado coincidente, período del año del grupo, `cierraEn` dentro del período y `cierraEn > abreEn` (`CHECK`).
- **Edición:** fechas e intentos se pueden cambiar siempre (sin bajar los intentos por debajo de los ya usados); período solo sin intentos (`409`). Anular conserva los intentos y saca la asignación de la vista del estudiante y de la nota.
- No se puede asignar dos veces la misma actividad al mismo grupo en el mismo período mientras la primera esté `PUBLICADA` (índice único parcial). Así se evitan duplicados por doble clic.

### D7. Intentos: envío al final, calificación en el servidor
Los juegos ya entregan todas las respuestas al terminar. Cambiar los 24 juegos a guardado por ítem no cabe en este cambio, así que:
1. `POST /api/actividades/asignaciones/:id/intentos` crea o devuelve el intento `EN_CURSO` (único por índice parcial) y entrega el contenido de **la versión de la asignación**.
2. El juego corre igual que hoy. Al terminar, el reproductor hace `POST /api/actividades/intentos/:id/envio` con el mapa de respuestas.
3. El servidor valida cada respuesta con `esquemaRespuesta`, califica con `calificarIntento` (ignora cualquier puntaje del cliente), guarda un `RespuestaItem` por ítem, cierra el intento y recalcula `ResultadoActividad` (mejor intento; en empate, el primero), todo en una transacción. Devuelve el `ResultadoIntento` para la pantalla de resultado.
4. **Idempotencia:** reenviar un intento ya `ENVIADO` devuelve el mismo resultado sin recalcular. El cliente guarda en `sessionStorage` las respuestas pendientes y reintenta con espera creciente si la red falla.
- **Opción `soloRespondidos`** (juego de robots): se guarda por tipo en el registro, no en el reproductor, para que el servidor la aplique igual.
- **Contenido en el cliente:** el juego recibe el contenido completo, con soluciones, como hoy. La nota no se puede falsificar porque califica el servidor, pero un estudiante con herramientas de desarrollo podría leer respuestas. Se acepta para primaria y se documenta 🔶. La proyección `paraEstudiante` queda para un cambio que adapte los juegos a calificación por ítem.
- *Alternativa:* guardado por ítem (D8 de `fundacion-actividades`). Se aplaza: exige reescribir los 24 juegos.

### D8. Cierre automático perezoso y abandono
Toda lectura de asignaciones o intentos llama primero a `cerrarVencidos`. Un intento `EN_CURSO` con la asignación vencida pasa a `ABANDONADO`: como el guardado es al final, no tiene respuestas. `ABANDONADO` **no consume** intento ni produce resultado. Al vencer, el estudiante sin intentos enviados queda «sin entregar», distinto de 0.

### D9. Experiencia del estudiante
- `PuertoActividadesDeMateria` real: asignaciones `PUBLICADA` de su grupo con `abreEn <= ahora`. El estado se calcula así: por abrir (no se envía al cliente), disponible, en curso, hecha (con estrellas del mejor intento), intentos agotados y cerrada.
- `PuertoDesempeno` real: estrellas por materia (promedio de mejores intentos que cuentan como nota), avance y «Sigue con».
- La agenda usa la misma consulta.
- La ruta `/materias/[asignatura]/actividades/[id]` pasa a usar el **id de la asignación**. El reproductor en modo `intento` muestra «Intento 2 de 3» y ofrece «Jugar otra vez» solo si quedan intentos.
- Se retira el texto de «Práctica libre» de `reglas.ts`. La ruta `/muestras` con datos ficticios rotulados se conserva.

### D10. Lado docente
```
/clases                          sus AsignacionDocente ACTIVA (asignatura · grupo)
/clases/[asignacionDocenteId]    pestaña Actividades (las otras pestañas no cambian 🔶)
   ├─ Asignadas      lista por período con estado y fechas · editar / anular
   ├─ Catálogo       por período → tema de la malla demo → actividades (juegos y quizzes)
   │                 filtros: período, tema, DBA, tipo, origen (colegio / colegas / míos)
   │                 [Vista previa] [Asignar…] [Duplicar] (solo los tipos de preguntas)
   └─ Mis quizzes    borradores y publicados · [Crear quiz]
/clases/[id]/quizzes/nuevo · /clases/[id]/quizzes/[actividadId]   editor
```
- «Asignar…» abre un diálogo: grupos de la docente del mismo grado y asignatura (marcado el actual), período, apertura, cierre, intentos y si cuenta como nota, con los valores por defecto de D6.
- Las pantallas se diseñan con la skill impeccable (regla del proyecto), con WCAG 2.1 AA, teclado y foco visible.
- El `[clase]` pasa del id demo al `asignacionDocenteId`. Lo ajeno responde `404`.

### D11. API

| Método y ruta | Rol | Uso |
|---|---|---|
| `GET /api/actividades/catalogo?asignacionDocenteId&periodo&tema&referente&tipo&origen` | DOCENTE | Catálogo ordenado por la malla |
| `GET /api/actividades/:id` | DOCENTE | Detalle y contenido para la vista previa |
| `POST /api/actividades/quizzes` · `PATCH`/`DELETE …/:id` | DOCENTE | Crear, editar borrador o publicado sin asignar, borrar o retirar |
| `POST /api/actividades/quizzes/:id/publicacion` | DOCENTE | Publicar un borrador |
| `POST /api/actividades/:id/duplicado` | DOCENTE | Duplicar como borrador propio |
| `POST /api/actividades/quizzes/:id/retiro` | ADMIN | Retirar cualquier quiz de docente |
| `POST /api/actividades/asignaciones` · `PATCH`/`DELETE …/:id` | DOCENTE | Asignar a uno o varios grupos, editar, anular |
| `GET /api/actividades/asignaciones?asignacionDocenteId&periodoId` | DOCENTE | Sus asignaciones |
| `GET /api/actividades/referentes?asignaturaId&gradoId` · `GET /api/actividades/malla?…` | DOCENTE | Para el editor y los filtros |
| `GET /api/actividades/mias` | ESTUDIANTE | Lo asignado con su estado |
| `POST /api/actividades/asignaciones/:id/intentos` | ESTUDIANTE | Iniciar o retomar |
| `POST /api/actividades/intentos/:id/envio` | ESTUDIANTE | Enviar y calificar |

Las páginas del servidor llaman al servicio directamente. Los Route Handlers son delgados y pasan por `http-acceso.ts`.

### D12. Semilla de demostración de 5.°
- **DBA del MEN de 5.°**, literales con fuente, para Matemáticas, Lenguaje (Comprensión Lectora), Ciencias Naturales, Ciencias Sociales e Inglés, cada uno con sus evidencias.
- **Estándares** del ciclo 4.°–5.° que citan los temas de la malla demo, y Competencias Ciudadanas para Ética.
- **Institucionales demo** (redacción propia): Robótica (cuatro componentes de las Orientaciones de Tecnología e Informática 2022), Emprendimiento, Artística, Educación Física y Religiosa.
- **Malla demo:** 11 asignaturas × 4 períodos, con ejes oficiales por área (p. ej., Matemáticas: numérico-variacional, geométrico-métrico, aleatorio), temas tomados de la Malla orientativa MEN de la bóveda y desempeños en saber, hacer y ser. Las pantallas que la muestran dicen «Malla de demostración».
- Las 69 actividades de 5.° se etiquetan con sus referentes, y cada una debe caer bajo al menos un tema de la malla demo (lo verifica una prueba).

## Risks / Trade-offs

- [El cambio es grande] → Se construye en tres fases entregables (ver `tasks.md`): A) base, semilla e importación; B) asignar e intentos, con el estudiante real; C) editor de quizzes.
- [Soluciones visibles en el navegador (D7)] → La nota no se falsifica porque califica el servidor. Lectura de respuestas: riesgo bajo en primaria, documentado. Se resuelve con `paraEstudiante` cuando los juegos califiquen por ítem.
- [Sin guardado por ítem, un corte de red al final pierde la partida] → Respaldo en `sessionStorage` y reintento del envío. Un intento abandonado no consume intentos.
- [Transcripción de DBA con errores] → Cada referente lleva la URL de su fuente; una docente o el responsable revisa la semilla antes de mostrarla al colegio 🔶.
- [Malla demo confundida con la real] → Origen `DEMO` en la base y rótulo visible en el catálogo; la reemplaza la pantalla del coordinador.
- [Borrar un quiz afecta a colegas] → Solo se borra de verdad si no hay intentos. En otro caso se retira y nada se pierde. El diálogo de borrado dice cuántos grupos lo tienen asignado.
- [La docente asigna pero no ve resultados] → Limitación conocida del alcance. Los datos se guardan y la vista llega en el cambio siguiente.
- [Datos de menores en un enunciado] → Aviso visible en el editor, retiro por `ADMIN` y registro de autora. No se puede impedir del todo.
- [«Mis clases» pasa de demo a datos reales] → Solo cambia la fuente de la lista y la pestaña Actividades; las otras pestañas se dejan como están, rotuladas 🔶.

## Migration Plan

1. Migración con las tablas nuevas, sin tocar las existentes.
2. `npm run curriculo:importar` en desarrollo, en las pruebas y en `deploy.sh` (después de `migrate`).
3. Desplegar las fases A, B y C en orden. La fase B retira la práctica libre; hasta entonces sigue como hoy.
4. `scripts/demo-quinto.ts` crea asignaciones de ejemplo para que la cuenta demo no quede vacía.
5. **Vuelta atrás:** revertir el código de la fase B devuelve la práctica libre (lee el catálogo desde los archivos). Las tablas nuevas no afectan nada existente.

## Open Questions

- 🔶 Si la autora pierde su asignación docente, ¿alguien hereda la edición de sus quizzes? Hoy quedan compartidos y sin editora.
- 🔶 ¿Las otras pestañas de la clase (Contenidos, Planeación, Notas, Estudiantes) se ocultan mientras no tengan datos reales, o siguen con la demo rotulada?
- 🔶 Revisión de la semilla de DBA y de la malla demo por una docente de 5.°.
