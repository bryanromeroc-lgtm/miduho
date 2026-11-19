## Context

- **No hay actividades en la base.** El catálogo vive en `apps/web/curriculo/actividades/` y el estudiante lo juega como práctica libre: `actividadesDeCatalogo` en `src/server/modules/materias/puertos.ts` lo expone a la vista de materia y nada se guarda.
- **La vista de materia está lista para datos reales.** Lee `PuertoActividadesDeMateria.deMateria()` y pinta `ActividadResumen[]` (estado, intentos, apertura, cierre, `href`), sin conocer la fuente.
- **Los tipos ya califican.** `seleccion-multiple` (`tipos/preguntas.ts`) define la pregunta con Zod (2–4 opciones, `correcta`, `explicacion` opcional) y `calificarIntento` (`tipos/contrato.ts`) califica un intento completo con una función pura.
- **La docente no tiene pantallas reales.** `src/app/clases/page.tsx` y `src/app/clases/[clase]/page.tsx` leen `HOY` de `@/data/demo`. Las asignaciones reales existen en `AsignacionDocente` (docente · asignatura · grupo · año, `ACTIVA`) y los estudiantes en `AsociacionEstudianteGrupo` (vigente si `finEn` es null).
- **`actividades-en-clase`** (sin implementar) ya diseñó este núcleo (D3, D6, D7, D8). Este cambio toma de allí lo mínimo, con los mismos nombres, para no crear un segundo modelo.
- Restricciones: WCAG 2.1 AA, sin datos reales de menores (seed y pruebas con datos ficticios rotulados), español de Colombia, Next.js 16 (leer `node_modules/next/dist/docs/` antes de escribir rutas).

## Goals / Non-Goals

**Goals:**
- Núcleo `Actividad → VersionActividad → AsignacionActividad → IntentoActividad → ResultadoActividad`, independiente del tipo y reutilizable por los juegos y los quizzes.
- Tipo `video-preguntas` completo de punta a punta: crear, asignar por asignatura y grado, ver, responder, calificar en el servidor y hacer seguimiento.
- «Mis clases» y la pestaña Actividades de la clase con datos reales.

**Non-Goals:**
- Asignar juegos del catálogo, quizzes sueltos, importar el currículo a la base, referentes y malla.
- Compartir o duplicar material entre docentes.
- Medir cuánto del video se reprodujo (API IFrame de YouTube).
- Retirar la práctica libre, cambiar «Mis materias» (estrellas y avance) o la agenda.
- Planillas de notas por período y escala del SIEE.

## Decisions

### D1. El núcleo de `actividades-en-clase`, recortado
```
Actividad (id, titulo, instruccion?, tipo, asignaturaId, gradoId,
           origen DOCENTE, autorId, estado PUBLICADA|RETIRADA,
           creadoEn, actualizadoEn)
  └─ VersionActividad (actividadId, numero=1, tipo, versionEsquema,
                       contenido jsonb, puntajeMaximo, hash)
       └─ AsignacionActividad (versionActividadId, asignacionDocenteId, grupoId,
                               periodoId, abreEn, cierraEn, maxIntentos,
                               cuentaComoNota, estado PUBLICADA|ANULADA, creadoPorId)
            ├─ IntentoActividad (asignacionId, estudianteId, numero,
            │                    estado EN_CURSO|ENVIADO|ABANDONADO,
            │                    vioVideoEn?, iniciadoEn, enviadoEn?,
            │                    puntaje?, porcentaje?)
            │    └─ RespuestaItem (intentoId, itemId, respuesta jsonb, correcta, puntaje)
            └─ ResultadoActividad (asignacionId, estudianteId, mejorIntentoId, porcentaje)
```
- Nombres de tablas y columnas iguales a D3, D6 y D7 de `actividades-en-clase`. Allí se agregarán después `slug`, el origen `CURRICULO`, `contenidoBorrador`, `duplicadaDeId` y los referentes, con migraciones aditivas.
- El `enum OrigenActividad` se crea con `CURRICULO` y `DOCENTE`, pero un `CHECK` exige `origen = 'DOCENTE'` y `autorId` no nulo mientras no exista la importación.
- `vioVideoEn` es propio de este tipo; vive en el intento porque «Ya lo vi» se marca por intento. 🔶 Alternativa: guardarlo como `RespuestaItem` especial. Se descarta porque mezclaría un hecho sin puntaje con la calificación.
- **Alternativa descartada:** una tabla propia `MaterialAudiovisual`. Es más rápida hoy, pero obliga a unificar dos sistemas de asignación y notas cuando lleguen los quizzes y los juegos.

### D2. Tipo `video-preguntas`
```ts
contenido = {
  video: { proveedor: "youtube", id: /^[A-Za-z0-9_-]{11}$/, inicio?: seg, fin?: seg },
  preguntas: Pregunta[]   // el mismo esquema de seleccion-multiple, sin audio
}
respuesta por ítem = índice de opción (igual que seleccion-multiple)
```
- Se registra en `tipos/registro.ts` con `items`, `calificar` y `repaso` reutilizados de `tipoPreguntas`. `puntajeMaximo` = número de preguntas.
- **Límites:** de 1 a 10 preguntas 🔶 (el quiz exige 3–12; un video corto puede tener una sola pregunta) y de 2 a 4 opciones. `fin > inicio` si ambos existen.
- Los `id` de las preguntas los genera el editor (`p1`, `p2`…); la docente no los ve.
- El título del video que devuelve oEmbed se guarda en el contenido (`video.tituloOriginal`) para el `title` del iframe, pero el título de la actividad lo escribe la docente.

### D3. Validación del enlace en el servidor (`modules/actividades/youtube.ts`)
1. **Extraer el id** de `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`, `youtube.com/live/`, `m.youtube.com` y `youtube-nocookie.com/embed/`. También se lee `t=`/`start=` como inicio sugerido. Es una función pura con pruebas.
2. **Comprobar con oEmbed** (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json`), con un tiempo límite de 5 s:
   - `200`: se acepta y se guarda `tituloOriginal`.
   - `401` o `403`: «Este video no permite verse fuera de YouTube».
   - `404`: «No encontramos ese video; revisa el enlace».
   - Error de red: «No pudimos comprobar el video; intenta de nuevo». 🔶 Se rechaza en lugar de guardar sin comprobar, para no asignar videos rotos.
3. La consulta solo envía la URL del video, sin datos de personas. El cliente HTTP se inyecta para que las pruebas no salgan a internet.
- Una **vista previa** en el formulario usa la misma ruta (`POST /api/actividades/video/comprobacion`) para mostrar el video antes de guardar.

### D4. Crear = publicar y asignar, en una transacción
La docente no tiene borradores en este cambio: el formulario crea la actividad y la asigna de una vez.
- **Asignatura y grado:** el formulario solo ofrece las combinaciones en las que la docente tiene al menos una `AsignacionDocente ACTIVA` del año activo. Al guardar se crea una `AsignacionActividad` por cada grupo de ese grado con `AsignacionDocente ACTIVA` de la docente en esa asignatura. Si dicta en 5.°A y no en 5.°B, solo llega a 5.°A.
- Se marcan todos los grupos por defecto y la docente puede desmarcar alguno 🔶, con al menos uno. Así cubre el caso de un grupo que va atrasado.
- **Período:** el período vigente del año activo; la fecha de cierre debe caer dentro de él.
- **Valores por defecto:** abre ahora, cierra al fin del período (23:59, hora de Colombia), 3 intentos (de 1 a 5) y `cuentaComoNota = true`. Para este tipo siempre cuenta como nota; el formulario no ofrece la opción.
- **Sin duplicados:** el índice único parcial `(versionActividadId, grupoId)` con `estado = 'PUBLICADA'` evita el doble clic.
- **Identidad del material (aclaración del responsable, 2026-11-11):** se pueden crear materiales distintos o parecidos con el mismo video. Solo se rechaza con `409` un envío idéntico: misma autora, título, indicaciones, id e intervalo del video, preguntas, asignatura, grado, grupos, fechas explícitas e intentos. La actividad guarda una `huellaCreacion` única calculada sobre esos campos normalizados. El índice parcial de asignación sigue protegiendo la repetición de una versión en un grupo; la huella protege el doble envío del formulario que crea versiones nuevas.

### D5. Edición y anulación
- **Siempre editables:** título, indicaciones, apertura y cierre (dentro del período, sin dejarlo antes de ahora si ya hay intentos) e intentos (nunca por debajo de los ya usados por algún estudiante).
- **Video y preguntas:** editables mientras no exista ningún `IntentoActividad ENVIADO` de ninguna de sus asignaciones. Se reemplaza el `contenido` de la versión 1, y los intentos `EN_CURSO` pasan a `ABANDONADO` para que nadie responda preguntas viejas. Con intentos enviados, la API responde `409` y la pantalla lo explica: «Ya hay respuestas; anula esta actividad y crea otra».
- **Trigger** `versiones_actividad`: impide `UPDATE` y `DELETE` si existe un intento `ENVIADO` que la use. Es la misma idea de la inmutabilidad de `actividades-en-clase`, aplicada desde la primera respuesta.
- **Anular** (por asignación o todas a la vez): `estado = ANULADA`. Se conservan intentos y resultados; desaparece de la vista del estudiante y del seguimiento activo, y se muestra en «Anuladas».

### D6. Intento con «Ya lo vi»
```
POST /api/actividades/asignaciones/:id/intentos   → crea o devuelve el EN_CURSO
POST /api/actividades/intentos/:id/visto          → fija vioVideoEn (idempotente)
POST /api/actividades/intentos/:id/envio          → califica y cierra
```
- **Iniciar** exige una asignación `PUBLICADA` y abierta (`abreEn <= ahora < cierraEn`), asociación vigente del estudiante con el grupo e intentos enviados menores que `maxIntentos`. El índice único parcial garantiza un solo `EN_CURSO` por estudiante y asignación.
- **«Ya lo vi»** es la palabra del estudiante: no se mide la reproducción (decisión de producto). La nota sale de las preguntas.
- **Envío:** exige `vioVideoEn`, o responde `409`. Valida con `esquemaRespuesta`, califica con `calificarIntento` (ignora cualquier puntaje del cliente), guarda un `RespuestaItem` por pregunta, marca `ENVIADO` y recalcula `ResultadoActividad` (mejor porcentaje; en empate, el primero), todo en una transacción. Reenviar un intento ya enviado devuelve el mismo resultado.
- **Cierre perezoso** (D8 de `actividades-en-clase`): cada lectura pasa primero los `EN_CURSO` vencidos a `ABANDONADO`, que no consume intento.
- **Las respuestas viajan al cliente**, como en los juegos (D7 de `actividades-en-clase`). Se acepta en primaria y se documenta 🔶.

### D7. Reproductor del video (cliente)
- `<iframe>` a `https://www.youtube-nocookie.com/embed/<id>` con `rel=0`, `cc_load_policy=1`, `cc_lang_pref=es`, `hl=es`, `playsinline=1`, `start` y `end`. Lleva `title="Video: <título>"`, `allow="encrypted-media; picture-in-picture; fullscreen"`, `referrerpolicy="strict-origin-when-cross-origin"` y `loading="lazy"`. Va en un contenedor 16:9 responsive.
- **Sin el script de la API IFrame:** no hace falta, porque no se mide la reproducción. Así no se carga JavaScript de terceros en la página.
- **Flujo en una sola página:** indicaciones (texto) → video → botón «Ya lo vi» → preguntas, una por pantalla con el componente de preguntas existente → resultado con repaso y explicaciones. El video sigue disponible arriba mientras responde.
- **Accesibilidad:** indicaciones y preguntas como texto seleccionable, botón con foco visible, la sección de preguntas recibe el foco al desbloquearse y un aviso `aria-live` anuncia «Ya puedes responder». Se hace con la skill impeccable.
- Si el iframe no carga (por ejemplo, la red del colegio bloquea YouTube), se muestra un enlace «Abrir el video en YouTube» y el estudiante igual puede marcar «Ya lo vi».

### D8. Lado del estudiante
- **Adaptador real** `actividadesAsignadas(db)` de `PuertoActividadesDeMateria`: asignaciones `PUBLICADA` del grupo y la asignatura, con `abreEn <= ahora`, con estado disponible, en curso, hecha (con estrellas del mejor resultado), intentos agotados o cerrada. El `href` es `/materias/[asignatura]/asignadas/[asignacionId]`.
- **Composición:** `combinar(asignadas, actividadesDeCatalogo)`: primero lo asignado, después la práctica libre, sin tocar la vista. Si no hay ninguna de las dos, la vista dice «Aún no hay actividades».
- **Estrellas:** se reutiliza la conversión de porcentaje a estrellas de `@/lib/materias`, si existe; si no, se agrega allí como función pura con pruebas.
- **Ruta nueva** `/materias/[asignatura]/asignadas/[asignacionId]`: si es ajena, por abrir o anulada, responde `404`. La ruta de práctica libre (`/actividades/[id]`) no cambia.

### D9. Lado docente
```
/clases                              sus AsignacionDocente ACTIVA del año activo (asignatura · grupo)
/clases/[asignacionDocenteId]        pestaña Actividades real; las demás pestañas, demo rotulada 🔶
   ├─ [Nuevo material audiovisual]
   ├─ Activas      título · grupo · cierre · «12 de 25 respondieron»
   └─ Anuladas
/clases/[id]/material/nuevo          formulario (D3, D4)
/clases/[id]/material/[actividadId]  editar (D5) y seguimiento (D10)
```
- `[clase]` pasa del id de demo al `asignacionDocenteId`; si es ajena o inactiva, responde `404`.
- La lista de «Mis clases» conserva el friso visual actual y cambia la fuente. Los datos que la demo inventaba (contenidos, ranuras) se omiten o se rotulan 🔶; no se inventan cifras.

### D10. Seguimiento por estudiante
- Una tabla por grupo con los estudiantes de asociación vigente, en orden alfabético por apellido. Columnas: estado (sin empezar · vio el video · en curso · respondió), intentos usados, nota del mejor intento (0–100) y fecha del último envío. Después del cierre, quien no envió figura «sin entregar», no 0.
- Resumen arriba: «12 de 25 respondieron · promedio 78».
- Solo la autora y las docentes con `AsignacionDocente ACTIVA` en ese grupo y asignatura lo ven. Ningún estudiante ve datos de otros.
- 🔶 No hay exportación en este cambio.

### D11. API
| Método y ruta | Rol | Uso |
|---|---|---|
| `POST /api/actividades/video/comprobacion` | DOCENTE | Validar el enlace y devolver id y título (D3) |
| `POST /api/actividades/material` | DOCENTE | Crear y asignar (D4) |
| `PATCH /api/actividades/material/:actividadId` | DOCENTE (autora) | Editar (D5) |
| `PATCH`/`DELETE /api/actividades/asignaciones/:id` | DOCENTE (autora) | Cambiar fechas e intentos, o anular |
| `GET /api/actividades/material/:actividadId/seguimiento` | DOCENTE | Seguimiento (D10) |
| `POST /api/actividades/asignaciones/:id/intentos` | ESTUDIANTE | Iniciar o retomar |
| `POST /api/actividades/intentos/:id/visto` | ESTUDIANTE | «Ya lo vi» |
| `POST /api/actividades/intentos/:id/envio` | ESTUDIANTE | Enviar y calificar |

Las páginas del servidor llaman al servicio directamente. Los Route Handlers son delgados y pasan por `http-acceso.ts`. Errores de dominio con `ErrorDominio`, `conflicto` y `noEncontrado` de `src/server/errores.ts`.

## Risks / Trade-offs

- [«Ya lo vi» sin ver el video] → La nota viene de las preguntas, no del clic. Si las docentes lo piden, la medición con la API IFrame queda para un cambio posterior.
- [YouTube muestra sugeridos o anuncios] → `youtube-nocookie` y `rel=0` lo reducen sin eliminarlo. La docente responde por el video (decisión de producto); se documenta en `docs/operacion.md`.
- [La red del colegio bloquea YouTube] → Enlace de respaldo para abrirlo en YouTube. 🔶 Verificarlo en la red real del colegio.
- [Un video deja de estar disponible después de asignarlo] → El iframe muestra el error de YouTube y la docente puede editar el video mientras no haya respuestas, o anular y crear otro.
- [Datos de menores en enunciados o indicaciones] → Aviso visible en el formulario, como en el editor de quizzes de `actividades-en-clase`. No se puede impedir del todo.
- [«Mis clases» pasa de demo a datos reales] → Cambian la lista y la pestaña Actividades. Las otras pestañas quedan con la demo rotulada; la docente demo necesita asignaciones docentes en el seed.
- [Divergencia con `actividades-en-clase`] → Mismos nombres y reglas. Una tarea de este cambio actualiza su `design.md` y su `tasks.md` para que parta de este núcleo.
- [Privacidad: el iframe conecta el navegador del estudiante con Google] → `youtube-nocookie` no deja cookies hasta reproducir. 🔶 Confirmar con el colegio que esto cabe en su política de tratamiento de datos (Ley 1581).

## Migration Plan

1. Migración aditiva con las seis tablas, enums, `CHECK`, índices parciales y el trigger. No toca tablas existentes.
2. Seed de desarrollo: asegurar que la docente demo tenga `AsignacionDocente` en un grado con estudiantes ficticios. No se crean videos en el seed; un script opcional `scripts/demo-material.ts <url>` crea uno con la URL que se le pase.
3. Desplegar. La práctica libre sigue igual y lo asignado aparece primero.
4. **Vuelta atrás:** revertir el código devuelve la vista anterior; las tablas nuevas no afectan nada existente.

## Open Questions

- 🔶 ¿De 1 a 10 preguntas está bien, o se exige un mínimo de 3, como en el quiz?
- 🔶 ¿La docente puede desmarcar grupos del grado al asignar, o va siempre a todos?
- 🔶 ¿Las otras pestañas de la clase se ocultan o siguen con la demo rotulada?
- 🔶 ¿YouTube es accesible desde la red del colegio y desde las tabletas de los estudiantes?
- 🔶 ¿El tratamiento de datos del colegio cubre el uso de YouTube incrustado?
