## Why

La plataforma tiene que servir, además de los libros, actividades didácticas digitales (juegos, cuestionarios tipo concurso a ritmo propio, emparejar, ordenar…) que refuercen lo visto en clase y **cuenten como nota**. Si el modelo de actividades, intentos y resultados no se define bien desde el inicio, después no se pueden recuperar las respuestas que no se guardaron, no se puede saber qué DBA está débil y cada tipo de juego nuevo obliga a rehacer la calificación. Este cambio construye esa base, todavía sin implementar ningún tipo de juego.

Decisiones tomadas con el operador (2026-10-30):
- Las actividades cuentan como nota, y cuenta el **mejor intento**.
- Se guarda cada respuesta de cada intento.
- Toda actividad está alineada con grado, asignatura, período y referentes curriculares (DBA / Estándares).
- El equipo de desarrollo crea las actividades a partir de la malla curricular; las docentes no las editan, solo las **asignan** a sus grupos.
- Dispositivos: tabletas y computadores. Ingreso con usuario y contraseña, como hoy.
- Un solo colegio. La escala del SIEE se define más adelante.
- Sin salas en vivo por ahora.

## What Changes

- **Referentes curriculares**: catálogo de DBA, Estándares Básicos de Competencias y referentes institucionales, por área y grado (o rango de grados), para etiquetar actividades.
- **Catálogo de actividades como contenido versionado en git**: archivos JSON por asignatura y grado, validados con Zod e importados a la base con un comando idempotente. Cada cambio de contenido crea una **versión inmutable** nueva.
- **Motor de actividades**: contrato `DefinicionTipoActividad` (esquema de contenido, esquema de respuesta, ítems, vista segura para el estudiante sin soluciones, calificación por ítem en el servidor) y un registro de tipos. Se **definen** los tipos planeados, pero no se implementa ninguno: solo existe un tipo de prueba dentro de las pruebas.
- **Asignación**: la docente asigna una actividad del catálogo de su asignatura y grado a un grupo suyo, con apertura, cierre, máximo de intentos y si cuenta como nota.
- **Intentos y resultados**: ciclo del intento (en curso → enviado, con cierre automático al vencer), guardado de cada respuesta por ítem con autoguardado, resultado por estudiante y asignación tomado del mejor intento, expresado en **porcentaje (0–100)**, y resumen de desempeño por referente curricular.
- API (Route Handlers) con permisos por rol para asignar, listar, iniciar intentos, responder y enviar.

## Capabilities

### New Capabilities

- `curriculo-alineacion`: referentes curriculares, catálogo de actividades en archivos versionados, importación idempotente y versiones inmutables.
- `motor-actividades`: contrato de tipos de actividad, registro, vista segura para el estudiante, calificación en el servidor y catálogo de tipos planeados.
- `asignacion-actividades`: asignación de actividades por la docente a sus grupos, con ventana, intentos y regla de nota.
- `intentos-resultados`: ciclo de vida del intento, respuestas por ítem, resultado por mejor intento en porcentaje y resumen por referente.

### Modified Capabilities

(Ninguna: `openspec/specs/` aún no tiene especificaciones.)

## Impact

- **Depende de `preparar-despliegue-produccion`** (PostgreSQL con `jsonb`).
- `apps/web/prisma/schema.prisma`: modelos nuevos `ReferenteCurricular`, `Actividad`, `VersionActividad`, `ActividadReferente`, `AsignacionActividad`, `IntentoActividad`, `RespuestaItem`, `ResultadoActividad`, con una migración.
- Código nuevo: `src/server/modules/actividades/` (servicio, reglas, esquemas), `src/server/modules/curriculo/`, `src/features/actividades/tipos/` (contrato y registro), `src/app/api/actividades/**`, `scripts/importar-curriculo.ts`.
- Contenido nuevo versionado: `curriculo/` en la raíz del repositorio (referentes y actividades en JSON). Los medios pesados de las actividades (imágenes, audio) siguen el mismo camino que los libros: fuera de git, servidos por el proxy.
- `deploy/deploy.sh`: paso de importación del currículo después de las migraciones.
- Fuera de alcance: interfaces de usuario (pantalla de asignación, «mis actividades», reproductor), tipos de juego concretos, salas en vivo y conversión a la escala del SIEE. Van en cambios posteriores.
