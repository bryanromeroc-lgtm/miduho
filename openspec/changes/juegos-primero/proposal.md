## Why

MIDUHO tiene 75 actividades, casi todas de 5.°, y solo una de 1.° (`la-ruta-de-las-palabras`). El barrido de referentes del 2026-11-07 (`docs/investigacion/catalogo-juegos/`) dejó **35 juegos de 1.°** para 20 DBA o referentes de ciclo, con su adaptación propuesta. En 1.° muchos niños todavía no leen: lo que más pesa en esos referentes es el **audio**, que dice la consigna, nombra las opciones, celebra y acompaña. Por eso, antes de adaptar cada juego, hay que **capturar todo el audio de la página de referencia** (voces, efectos, canciones y música) y usarlo en la adaptación. El usuario declara que tiene los permisos de uso. Este cambio construye los 35 juegos por fases con el flujo `/crear-juego-referencia` y agrega el paso de captura sonora, que pasa a ser obligatorio en ese flujo.

## What Changes

- **Paso nuevo y obligatorio en el flujo de referencia: captura sonora.** Una herramienta (`tools/captura-audio/`) abre la página de referencia en un Chrome aislado y sigue los `iframe` hasta el autor real. Descarga todo el audio que la página carga o declara, corta los *sprites* de audio en pistas y deja un **inventario** con estos datos de cada pista: origen, huella, duración, rol (voz, efecto, música o ambiente), momento en que suena, transcripción y estado de la licencia. El audio se guarda en `content/referencias/<slug>/audio/`, fuera de git. Se usa para el análisis y también en la plataforma.
- **Registro de licencias del audio desplegado.** Cada audio de `public/audio/` queda trazado hasta su origen en un `LICENCIAS.md`. Para el audio de terceros se usa la declaración de permisos del usuario, con los datos del permiso escrito por adjuntar 🔶. Una prueba verifica la trazabilidad; no bloquea por el permiso.
- **Audio en las actividades.** La consigna, las opciones, las tarjetas, los elementos y las escenas pueden llevar audio grabado. El reproductor muestra «Escuchar». Si no hay grabación, usa la voz del navegador. En 1.° la consigna se lee sola al empezar cada ítem, con control para silenciarla.
- **`golpea` gana un modo «preguntas»**: rondas escritas en el contenido, con opciones de palabra o imagen y audio. Sirve para izquierda/derecha y para «Armi dice» en inglés. **BREAKING:** ninguno, porque el modo de operaciones sigue igual y es el modo por defecto.
- **Cinco tipos nuevos** para 1.°:
  - `valor-posicional`: tablero de decenas y unidades, con laboratorio libre y retos.
  - `balanza`: el signo igual como equivalencia.
  - `respuesta-numerica`: problemas en los que el niño escribe el resultado.
  - `cuadricula-instrucciones`: secuencias de pasos para llevar a un robot a la meta, con un modo inverso.
  - `dilemas`: escenas de convivencia con elección y consecuencia.

  Cada tipo se diseña después de su estudio con REA y su captura sonora, con un punto de visto bueno del usuario antes de construirlo.
- **26 actividades de 1.°**, de redacción e imagen propias, que cubren los 35 referentes en siete asignaturas: Matemáticas, Comprensión lectora, Ciencias naturales, Ciencias sociales, Ética y valores, Inglés y Robótica. Cada una tiene su informe de referencia.
- Se actualizan `/crear-juego-referencia`, la skill `referencia-rea` y `juegos-2d-miduho` para incluir la captura sonora. La línea roja «nada de sus sonidos» se cambia por «audio capturado con permiso declarado y registrado».

## Capabilities

### New Capabilities
- `captura-audio-referencia`: herramienta e inventario de la captura sonora de una página de referencia, adaptación del audio a `public/audio/` y registro de licencias.
- `audio-en-actividades`: audio grabado o sintetizado en la consigna, las opciones, las tarjetas y las escenas; lectura automática en 1.°; validación de las rutas de audio.
- `juegos-primero`: programa de las 26 actividades de 1.°, con su referente, DBA, tipo y criterios de aceptación de cada una (estudio, captura, informe, contenido y verificación).
- `actividad-valor-posicional`: tipo de tablero de decenas y unidades, con laboratorio libre y retos calificados.
- `actividad-balanza`: tipo de balanza de igualdades con sumas y restas.
- `actividad-respuesta-numerica`: tipo de problemas con escritura del resultado.
- `actividad-cuadricula-instrucciones`: tipo de secuencias de pasos en una cuadrícula, en modo directo e inverso.
- `actividad-dilemas`: tipo de escenas con elección y consecuencia para Ética y valores.

### Modified Capabilities
- `actividad-golpea`: se añade el modo «preguntas», con rondas del contenido, opciones de palabra o imagen y audio.

## Impact

- **Nuevo:** `tools/captura-audio/` (CLI Node con `playwright-core`; necesita `ffmpeg` y `ffprobe`; no se despliega).
- **Nuevo:** `content/referencias/<slug>/` (inventario y `LICENCIA.md` versionados; el audio fuera de git, ampliando `.gitignore`).
- `apps/web/src/features/actividades/`:
  - `comun/voz.ts` y una pieza común de audio.
  - Esquemas de los tipos que aceptan `audio`.
  - Cinco carpetas nuevas en `juegos/`.
  - `golpea/`.
  - Registro en `tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts` y `materias/vista/ilustracion-tipo.tsx`.
- `apps/web/curriculo/actividades/<asignatura>/1/`: 26 JSON nuevos.
- `apps/web/public/audio/` y `public/images/juegos/`: recursos con `LICENCIAS.md`.
- `docs/investigacion/`: un informe `referencia-<slug>.md` por referente estudiado y `juegos-primero.md` como tablero del programa. También se actualizan la bóveda (`10-Referentes-actividades/`) y el catálogo JSON (estado de cada referente).
- `.claude/commands/crear-juego-referencia.md` y `.claude/skills/{referencia-rea,juegos-2d-miduho}/SKILL.md`.
- Sin cambios de base de datos. Depende del cambio `actividades-en-clase` solo para enlazar los DBA como referentes en la base. Mientras tanto, el DBA queda en el tablero del programa y en el informe.
