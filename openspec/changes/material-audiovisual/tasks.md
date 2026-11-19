## 1. Modelo de datos

- [x] 1.1 Leer `apps/web/node_modules/next/dist/docs/` (rutas, Route Handlers, Server Actions) y la convención de módulos de `src/server/modules/academico` antes de escribir código
- [x] 1.2 Añadir a `schema.prisma` `Actividad`, `VersionActividad`, `AsignacionActividad`, `IntentoActividad` (con `vioVideoEn`), `RespuestaItem` y `ResultadoActividad`, con sus enums (`OrigenActividad`, `EstadoActividad`, `EstadoAsignacionActividad`, `EstadoIntento`), relaciones e índices, con los nombres de `actividades-en-clase` (design D1)
- [x] 1.3 Generar la migración y añadir a mano: `CHECK` de origen `DOCENTE` con autora, `CHECK` de `cierraEn > abreEn`, `maxIntentos` 1–5 y porcentaje 0–100; índice único parcial de un intento `EN_CURSO` por estudiante y asignación; índice único parcial de asignación `PUBLICADA` por versión y grupo; trigger que impide `UPDATE`/`DELETE` de `versiones_actividad` con intentos `ENVIADO`
- [x] 1.4 Pruebas de integración de cada restricción SQL y del trigger (`tests/integracion/`)

## 2. Tipo `video-preguntas`

- [x] 2.1 Crear `src/features/actividades/tipos/video.ts`: esquema del video (proveedor, id de 11 caracteres, inicio, fin, `tituloOriginal`) y de 1 a 10 preguntas con el esquema de pregunta de `seleccion-multiple` sin audio; reutilizar `items`, `calificar` y `repaso` (design D2)
- [x] 2.2 Registrarlo en `tipos/registro.ts` y en `nombreTipo` («Material audiovisual»)
- [x] 2.3 Pruebas: contenido válido e inválido (sin preguntas, `fin <= inicio`, id mal formado) y calificación de 4 de 5 = 80

## 3. Enlace de YouTube

- [x] 3.1 `src/server/modules/actividades/youtube.ts`: `extraerVideo(url)` pura (watch, youtu.be, shorts, embed, live, m., nocookie, `t=`/`start=`; rechaza otros dominios)
- [x] 3.2 `comprobarVideo(id, http)` con oEmbed, tiempo límite de 5 s y mapeo de `200`/`401`/`403`/`404`/error de red a resultados de dominio; el cliente HTTP es inyectable
- [x] 3.3 Pruebas de ambas funciones sin salir a internet

## 4. Servicio de actividades

- [x] 4.1 Crear `src/server/modules/actividades/` (`servicio.ts`, `esquemas.ts`, `index.ts`) con `crearServicioActividades(db, { http, reloj })`
- [x] 4.2 `opcionesDeCreacion(docenteId)`: combinaciones de asignatura y grado con sus grupos donde la docente tiene `AsignacionDocente ACTIVA` en el año activo, más el período vigente y su fin
- [x] 4.3 `crearMaterial(docenteId, datos)`: valida contenido y permisos, comprueba el video y crea actividad, versión 1 y una asignación por grupo marcado en una transacción, con los valores por defecto (design D4)
- [x] 4.4 `editarMaterial` y `editarAsignacion`: reglas de D5 (fechas, intentos no menores a los usados, contenido solo sin intentos enviados; abandona los `EN_CURSO` al cambiar el contenido)
- [x] 4.5 `anularAsignacion` (una o todas) conservando intentos y resultados
- [x] 4.6 `cerrarVencidos` perezoso, llamado al inicio de cada lectura de asignaciones o intentos
- [x] 4.7 `iniciarIntento`, `marcarVisto` (idempotente) y `enviarIntento` (exige visto, califica con `calificarIntento`, guarda `RespuestaItem`, recalcula `ResultadoActividad`, idempotente al reenviar), cada uno en su transacción
- [x] 4.8 `seguimiento(docenteId, actividadId)`: por grupo, estudiantes con asociación vigente, estado, intentos, mejor nota, último envío, «sin entregar» después del cierre y el resumen (design D10)
- [x] 4.9 Pruebas de integración de cada escenario de `nucleo-actividades` y `material-audiovisual` (docente ajena `403`/`404`, doble envío `409`, cierre fuera del período, intentos agotados, envío sin visto, mejor intento, puntaje falsificado, reenvío, edición con respuestas `409`, anulación)

## 5. API

- [x] 5.1 Route Handlers delgados en `src/app/api/actividades/**` según la tabla de design D11, con `http-acceso.ts` para rol y sesión y `ErrorDominio` para las respuestas
- [x] 5.2 Pruebas de acceso: estudiante en rutas de docente, docente en rutas de estudiante, sin sesión

## 6. Lado docente

- [x] 6.1 Usar la skill impeccable (fase adecuada) para diseñar «Mis clases», la pestaña Actividades, el formulario y el seguimiento, partiendo del friso actual
- [x] 6.2 `/clases` con las `AsignacionDocente ACTIVA` reales y estado vacío; quitar `@/data/demo` de esa lista
- [x] 6.3 `/clases/[asignacionDocenteId]` con `404` para ajenas o inactivas; pestaña Actividades real (activas con «N de M respondieron», anuladas, botón «Nuevo material audiovisual»); demás pestañas rotuladas como demostración 🔶
- [x] 6.4 `/clases/[id]/material/nuevo`: formulario con enlace y vista previa (comprobación), título, indicaciones, inicio y fin opcionales, editor de preguntas (agregar, quitar, reordenar, marcar la correcta, explicación), asignatura y grado, grupos marcados, apertura, cierre, intentos y aviso de datos personales
- [x] 6.5 `/clases/[id]/material/[actividadId]`: edición con el bloqueo de video y preguntas explicado, anulación con confirmación y tabla de seguimiento por grupo
- [x] 6.6 Pruebas de componentes del formulario (errores asociados y foco) y de la tabla de seguimiento

## 7. Lado del estudiante

- [x] 7.1 Adaptador `actividadesAsignadas(db)` de `PuertoActividadesDeMateria` y `combinar(asignadas, catalogo)`, con asignadas primero; conectarlo donde hoy se usa `actividadesDeCatalogo` (design D8)
- [x] 7.2 Conversión de porcentaje a estrellas en `@/lib/materias` (reutilizar si existe) con pruebas
- [x] 7.3 Ruta `/materias/[asignatura]/asignadas/[asignacionId]` con `404` para ajenas, por abrir o anuladas
- [x] 7.4 Componente del reproductor de video (iframe de `youtube-nocookie` con los parámetros de D7, contenedor 16:9, `title`, enlace de respaldo), diseñado con impeccable
- [x] 7.5 Flujo de la actividad: indicaciones → video → «Ya lo vi» (foco y `aria-live`) → preguntas con el componente existente → envío con respaldo en `sessionStorage` y reintento → resultado con repaso e «Intento N de M»
- [x] 7.6 Pruebas del adaptador (orden, estados, sin lo que no abre ni lo anulado) y del flujo (preguntas ocultas antes de «Ya lo vi», sin «intentar de nuevo» en el último intento)

## 8. Datos de demostración y documentación

- [x] 8.1 Asegurar en el seed que la docente demo tiene `AsignacionDocente` en un grado con estudiantes ficticios (sin inventar datos personales nuevos de menores; usar los rótulos ficticios existentes)
- [x] 8.2 `scripts/demo-material.ts <url>`: crea un material de ejemplo con la URL que se le pase
- [x] 8.3 Documentar en `docs/operacion.md` la dependencia de YouTube (oEmbed e iframe), qué controla y qué no (sugeridos, anuncios) y que la docente responde por el video
- [x] 8.4 Actualizar `design.md` y `tasks.md` de `actividades-en-clase` para que partan de este núcleo (tablas y tipo ya creados)

## 9. Verificación

- [x] 9.1 Prueba de punta a punta en el navegador: la docente crea un material para dos grupos, un estudiante lo ve en su materia, marca «Ya lo vi», responde y la docente ve su nota en el seguimiento
- [x] 9.2 Auditoría de accesibilidad (skill a11y-audit) de las pantallas nuevas: teclado, foco, contraste y 360 px de ancho
- [x] 9.3 `npm run build`, `npm run lint` y `npm test` sin errores
