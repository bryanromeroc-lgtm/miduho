## Why

La interfaz actual de MIDUHO se percibe **infantil**: oso en 3D con castillo, paisaje de colinas, emojis decorativos, Nunito 850 y colores terrosos sobre crema. La audiencia que ahora manda es el **estudiante de 6 a 10 años**, y para él ese lenguaje dice "para bebés". Además, el inicio no le muestra lo que es suyo: sus materias.

Después de explorar referentes (Lingokids, Khan Academy Kids, Duolingo ABC, Smile and Learn, Smartick, el proyecto de Behance «Phonic Zoom» y láminas de "ruta del conocimiento") y de iterar la maqueta, el operador aprobó la versión final: el artifact «MIDUHO · Inicio en modo juego», v11, del 2026-10-31, con la fuente en `referencia/maqueta-mis-materias.dc.html`. En ella, el inicio del estudiante es **«Mis materias»**: un tablero en una sola pantalla con un **cromo coleccionable por materia**, un **avatar** elegido por él que salta a la materia que toca, y un panel con la materia elegida.

El diseño de los cromos se apoya en una investigación breve de patrones para apps infantiles:
- el arte del personaje va primero;
- el progreso y la recompensa propios se ven;
- se entra con un toque y con objetivos grandes;
- se usa poco texto, con un solo propósito por elemento.

Decisiones tomadas con el operador (2026-10-31):
- Manda el estudiante. Su inicio es «Mis materias»: una sola pantalla, sin scroll en escritorio y tableta.
- El tablero muestra **todas las asignaturas asignadas a su grupo**. El friso y la «clase de ahora» salen del inicio del estudiante.
- **Cromos**, no tarjetas genéricas:
  - fondo de rayos en el color de la materia;
  - personaje que se sale del marco;
  - placa con el nombre;
  - «Sigue con…», barra de avance, estrellas y botón de jugar;
  - estados con significado: brillo al dominarla, «¡Nuevo!» y «en preparación».
- **Fondo del tablero sereno:** sabana en tonos lavados. El color fuerte lo llevan solo los cromos.
- El estudiante **elige un avatar**, que salta a la materia seleccionada.
- Identidad derivada del **escudo del colegio**, en estilo sticker: contorno oscuro, relieve y brillos.
- **Laboratorios no se toca**, ni su universo espacial (`.cosmos`).
- Estrellas como presentación del desempeño. La nota (mejor de 3 intentos) la calcula `fundacion-actividades`. Sin ranking ni comparación entre estudiantes.
- Ilustración vectorial de autoría propia: no hay generación de imágenes disponible y no se copia nada de las referencias.
- **Nada de cifras inventadas:** si un dato del cromo no tiene fuente real todavía, no se muestra.

## What Changes

- **Nuevo inicio del estudiante, «Mis materias»** (ruta `/` con contexto ESTUDIANTE):
  - tablero de cromos, uno por asignatura del grupo;
  - el avatar se posa sobre el cromo elegido;
  - panel lateral con «Mi explorador» y la materia elegida (descripción, cifras si existen, estrellas y botón «Entrar a {asignatura}»).
- **Cromo de materia** como componente reutilizable, con sus estados: normal, elegido, dominada (3 estrellas, con brillo), con material nuevo, en preparación (sin material) y sin datos de progreso.
- **Avatar explorador:** cuatro personajes originales derivados del escudo y del paisaje (Casita, Pino, Gota de río, Sol). La elección se guarda en la cuenta.
- **Nueva identidad visual** en todas las superficies salvo Laboratorios:
  - tokens del escudo con AA verificado;
  - Baloo 2 + Atkinson Hyperlegible Next;
  - estilo sticker;
  - encabezado con wordmark MIDUHO en colores del escudo.
- **Se retiran** el oso 3D, el castillo, el paisaje del encabezado, los Twemoji y las escenas raster. **BREAKING (visual y de estructura):** cambia el inicio del estudiante y la apariencia del resto. El inicio de la docente conserva su estructura (friso) con la nueva identidad. 🔶
- **Menú del estudiante:** «Hoy» pasa a llamarse «Mis materias». Biblioteca, Laboratorios y Agenda se mantienen; «Mis clases» sale de su menú. 🔶
- **Presentación del desempeño:** estrellas de 0 a 3 por materia y por actividad, tarjeta de intentos (máximo 3) y pantalla de resultado, alimentadas por `fundacion-actividades` cuando exista su API.
- **DESIGN.md se reescribe** desde lo construido. PRODUCT.md se actualiza: escudo entregado, estudiante como audiencia principal, avatares provisionales.

## Capabilities

### New Capabilities

- `identidad-visual`: sistema visual de MIDUHO fuera de Laboratorios. Cubre tokens del escudo, tipografía, estilo sticker, controles, estados, fondo sereno, accesibilidad y aislamiento de Laboratorios.
- `tablero-materias`: inicio del estudiante como tablero de cromos de sus asignaturas. Cubre composición en una pantalla, anatomía y estados del cromo, panel de la materia y adaptación a móvil.
- `avatar-explorador`: personajes elegibles, persistencia de la elección y salto al cromo elegido.
- `presentacion-desempeno`: estrellas, avance, intentos y resultado. Solo presentación, sin cálculo de nota y sin comparación entre estudiantes.

### Modified Capabilities

(Ninguna: `openspec/specs/` aún no tiene especificaciones.)

## Impact

- **Datos:** `apps/web/prisma/schema.prisma` agrega el enum `AvatarExplorador` y la columna opcional `Usuario.avatar`, con su migración. Es una preferencia de presentación, no un dato personal.
- **Backend:** `src/server/modules/materias/`:
  - servicio que lista las asignaturas activas del grupo del estudiante (`AsociacionEstudianteGrupo` + `AsignacionDocente`, año lectivo vigente) y arma un `ResumenMateria` por asignatura, con campos opcionales para progreso, siguiente actividad, material y novedades;
  - acción de servidor para guardar el avatar.
- **UI nueva:** `src/features/materias/` (tablero, cromo, escenas SVG, panel) y `src/components/avatar/`. `app/page.tsx` decide por contexto: ESTUDIANTE ve «Mis materias»; DOCENTE, su inicio con la nueva identidad.
- **Estilos:**
  - `src/styles/globals.css` (tokens, sin tocar `.cosmos`) y `src/styles/shell.css`;
  - `app/inicio.module.css`, Biblioteca y sus módulos.
- **Navegación:** `src/lib/navegacion.ts` («Mis materias», menú del estudiante) y sus pruebas.
- **Tipografía:** `app/layout.tsx` (Baloo 2 y Atkinson Hyperlegible Next vía `next/font`).
- **Recursos:** se retiran de uso `public/images/portal/*`, `public/images/dashboard/*` y `aventura-lectora*`. Se usa `public/images/escudo-colegio.jpg`.
- **Sin cambios:** `app/laboratorios/**`, `app/emprendimiento`, `.cosmos` y `actividad.module.css`.
- **Relación con otros cambios:**
  - depende de `fundacion-actividades` solo para estrellas, avance y «Sigue con», sin bloquearlo ni modificarlo;
  - «¡Nuevo!» y «en preparación» dependen de que exista el contenido asociado a la clase. Hasta entonces, esos estados no se muestran.
