## Why

En MIDUHO el rol `ADMIN` lo ejerce **la coordinadora** del colegio (DC-09; decisión del responsable del producto, 2026-11-10). Hoy su vista solo cubre la administración del sistema (usuarios, estructura, asignaciones): no puede abrir las materias, los Laboratorios ni ver la Biblioteca desde su menú, porque el contenido pedagógico se arma desde el grupo de un estudiante y las rutas de contenido solo admiten `DOCENTE` y `ESTUDIANTE`. Una coordinadora que no ve lo que reciben los niños no puede coordinar lo académico.

## What Changes

- Nueva sección **«Contenido pedagógico»** en `/admin`, **solo de consulta**: el contenido del colegio por **área** y por **asignatura**, en una matriz asignatura × **todos los grados** del colegio, con el conteo de actividades de cada celda. Las celdas sin material dicen «Sin contenido» y las de una asignatura que no se dicta en ese grado dicen «No se dicta»; nunca se inventa una cifra.
- **Vista previa de una materia por grado:** desde una celda, la coordinadora abre la **misma vista inmersiva** que ve el estudiante (escena temática, tarjetas de actividad, paginador), armada por asignatura y grado en lugar de por grupo, con una franja visible «Vista previa · {grado}» y sin estrellas, avance ni datos de estudiantes.
- **Actividad en vista previa:** la coordinadora juega cualquier actividad del currículo de esa asignatura y grado; nada se guarda y el resultado lo dice.
- **Biblioteca y Laboratorios en el menú de la coordinadora.** La Biblioteca ya le está permitida (versión docente, con guías); Laboratorios se abre al rol `ADMIN` con todas sus unidades disponibles, sin bloqueos.
- El menú del contexto `ADMIN` pasa a: Dashboard · Contenido · Biblioteca · Laboratorios · Usuarios · Estudiantes · Estructura · Asignaciones · Cuenta.
- Ninguna ruta del estudiante cambia: `/materias/**` sigue siendo exclusiva del estudiante.

## Capabilities

### New Capabilities

- `contenido-coordinacion`: sección «Contenido pedagógico» del contexto `ADMIN`: índice por área, matriz asignatura × grado con conteos y estados vacíos distinguibles, solo lectura y autorizada en el servidor.
- `vista-previa-materia`: vista inmersiva de una asignatura en un grado para la coordinadora y reproductor de actividades en modo vista previa, sin guardar nada ni mostrar datos de estudiantes.
- `navegacion-admin`: menú del contexto `ADMIN` con Contenido, Biblioteca y Laboratorios, y acceso de `ADMIN` a Laboratorios con todas las unidades disponibles.

### Modified Capabilities

(Ninguna. `vista-materia`, `reproductor-actividades` y `tablero-materias` conservan sus requisitos: la vista previa vive en rutas propias de `/admin` y reutiliza sus componentes sin cambiar lo que ve el estudiante.)

## Impact

- **Rutas nuevas:** `src/app/admin/contenido/` (índice por área), `src/app/admin/contenido/[asignatura]/[grado]/` (vista previa de la materia) y `.../actividades/[id]/` (actividad en vista previa). Cubiertas por la familia `ADMIN` de `proxy.ts` y por `exigirRolPagina(["ADMIN"])`.
- **Servidor:** un módulo de consulta para la coordinadora (áreas, asignaturas, grados, `AsignaturaGrado` y conteos del catálogo `curriculo/actividades/`), en `src/server/modules/`, sin escrituras.
- **Interfaz:** `VistaMateria`, `TarjetaActividad` y `Reproductor` reciben un modo vista previa (franja, enlaces bajo `/admin/contenido`, sin estrellas, aviso de que no se guarda). La vista del estudiante no cambia.
- **Navegación y permisos:** `src/lib/navegacion.ts` (menú `ADMIN`; Laboratorios con navegación `ADMIN` para la coordinadora) y `src/server/auth/sesion.ts` / `proxy.ts` (Laboratorios admite `ADMIN`).
- **Relación con `actividades-en-clase`:** cuando ese cambio lleve el catálogo a la base y agregue el modo «vista previa» del `Reproductor`, esta sección leerá de la base sin cambiar su interfaz.
- **Fuera de alcance:** editar actividades, malla curricular o mapa de cobertura; asignar actividades; ver resultados de estudiantes; auditoría de accesos; un rol `COORDINACION` separado (P36 queda respondida: hoy no hace falta).
