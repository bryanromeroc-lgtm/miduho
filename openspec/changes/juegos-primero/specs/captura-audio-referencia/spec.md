## ADDED Requirements

### Requirement: Captura sonora obligatoria antes de adaptar
Todo juego que se adapte desde una página de referencia SHALL pasar por la captura sonora antes del diseño de la adaptación. La captura SHALL ejecutarse también cuando la referencia no tenga audio, para que quede la constancia de que se buscó. El flujo `/crear-juego-referencia` SHALL incluirla como fase obligatoria entre el estudio con REA y el diseño.

#### Scenario: Referencia con audio
- **WHEN** se inicia la adaptación de un referente de 1.° del programa
- **THEN** existe `content/referencias/<slug>/audio/inventario.json` antes de presentar la propuesta de diseño al usuario

#### Scenario: Referencia sin audio
- **WHEN** la página de referencia (por ejemplo, una lección de Colombia Aprende) no carga ni declara audio
- **THEN** el inventario existe con la lista de pistas vacía, la fecha de la captura y la nota «sin audio observado»

### Requirement: Herramienta de captura
La herramienta `tools/captura-audio` SHALL abrir la URL de referencia en un Chrome aislado, que nunca sea el del puerto 9222. SHALL seguir los `iframe` hasta el documento que aloja el juego y registrar su dominio como autoría real. SHALL descargar cada audio que la página cargue por red (respuestas `audio/*` o con extensión `.mp3`, `.ogg`, `.wav`, `.m4a`, `.webm`, `.aac`) y cada URL de audio declarada en sus scripts o en sus JSON de configuración aunque no se haya cargado. SHALL hacer como máximo una petición por segundo a cada dominio y no SHALL iniciar sesión.

#### Scenario: Juego incrustado de otro dominio
- **WHEN** la página de Cokitos incrusta el juego en un `iframe` de digipuzzle.net
- **THEN** el inventario registra `pagina` = la URL de Cokitos, `autor_dominio` = digipuzzle.net, y descarga los audios del documento del `iframe`

#### Scenario: Audio declarado y no cargado
- **WHEN** un script declara la URL de un audio que solo se pide al ganar
- **THEN** la herramienta lo descarga igual y lo marca `origen_deteccion: "script"`

#### Scenario: Audio repetido
- **WHEN** dos URL entregan el mismo archivo
- **THEN** se guarda una sola copia (misma `sha256`) y el inventario lista las dos URL

### Requirement: Cortes de sprites de audio
Cuando la página defina un *sprite* de audio (un archivo con cortes `[inicio, duración]`, como en Howler.js), la herramienta SHALL conservar el archivo completo y SHALL producir una pista por corte, con el nombre del corte y sus tiempos.

#### Scenario: Atlas con cuatro cortes
- **WHEN** el juego usa un solo MP3 con los cortes «aparecer», «acierto», «error» y «fin»
- **THEN** quedan el original y cuatro pistas en `cortes/`, cada una con `sprite: { atlas, inicio_ms, duracion_ms }` en el inventario

### Requirement: Inventario sonoro
Cada pista SHALL quedar en `inventario.json` con: `id`, `archivo`, `urls`, `pagina`, `autor_dominio`, `sha256`, `mime`, `duracion_s`, `canales`, `frecuencia_hz`, `sonoridad_lufs`, `rol` ∈ {voz, efecto, musica, ambiente, desconocido}, `evento` (cuándo suena en el juego), `transcripcion`, `licencia` y `uso` (dónde se usa en MIDUHO). El `rol` y el `evento` inferidos SHALL llevar `certeza: "inferido"` hasta que una persona los confirme. Una voz sin transcripción confirmada SHALL tener `transcripcion: null`.

#### Scenario: Rol inferido
- **WHEN** una pista de 0,4 s suena al acertar según la lógica del juego
- **THEN** queda con `rol: "efecto"`, `evento: "acierto"` y `certeza: "inferido"`

#### Scenario: Voz sin oír
- **WHEN** se captura una voz que nadie ha escuchado todavía
- **THEN** su `transcripcion` es `null` y el resumen la lista en «por escuchar» 🔶

### Requirement: Almacenamiento fuera de git
Los audios capturados SHALL vivir en `content/referencias/<slug>/audio/` (`originales/` y `cortes/`) y MUST NOT versionarse. `inventario.json`, `LICENCIA.md` y `RESUMEN.md` de cada referencia SHALL versionarse. A diferencia de los artefactos de REA, la captura sonora MUST NOT borrarse al terminar el informe.

#### Scenario: Estado de git tras capturar
- **WHEN** se captura una referencia y se corre `git status`
- **THEN** aparecen solo `inventario.json`, `LICENCIA.md` y `RESUMEN.md`; ningún archivo de audio

### Requirement: Licencia declarada por fuente
Cada carpeta `content/referencias/<slug>/` SHALL tener un `LICENCIA.md` con: plataforma, autor real, fecha de captura, la licencia pública si existe (por ejemplo CC BY 4.0 de PhET, con la atribución exigida) y, para el audio sin licencia abierta, la **declaración de permiso del usuario** (fecha y alcance) con los datos del soporte escrito por adjuntar 🔶. Que falte el soporte escrito MUST NOT impedir el uso.

#### Scenario: Licencia abierta
- **WHEN** se captura un simulador de PhET
- **THEN** `LICENCIA.md` registra CC BY 4.0 y el texto de atribución que irá en el `LICENCIAS.md` de destino

#### Scenario: Permiso declarado
- **WHEN** se captura un juego de Mundo Primaria
- **THEN** `LICENCIA.md` registra «permiso declarado por el usuario el <fecha>» y la lista de datos del soporte escrito por adjuntar

### Requirement: Adaptación al destino
El comando `adaptar` SHALL copiar las pistas elegidas a `apps/web/public/audio/...` en MP3 mono a 44,1 kHz, sin silencio inicial y normalizadas: −18 LUFS para voces y efectos, y −23 LUFS para música en bucle. SHALL añadir una línea por archivo en el `LICENCIAS.md` de la carpeta de destino, con la pista de origen (`<slug>#<id>`), la URL, la autoría y el estado de la licencia. Además SHALL anotar el destino en el campo `uso` del inventario.

#### Scenario: Efecto adaptado
- **WHEN** se adapta la pista «acierto» de una referencia al juego `golpea`
- **THEN** existe `public/audio/juegos/golpea/<nombre>.mp3` normalizado, su línea en `LICENCIAS.md` y la ruta en `uso` del inventario

### Requirement: Trazabilidad de todo el audio desplegado
Una prueba de Vitest SHALL recorrer `apps/web/public/audio/` y fallar si un archivo de audio no aparece en el `LICENCIAS.md` (o `LICENCIA.md`) de su carpeta o de una carpeta superior. El fallo SHALL indicar el origen, ya sea propio, Gemini, CC0 o una referencia. La prueba MUST NOT exigir el soporte escrito del permiso.

#### Scenario: Audio sin registro
- **WHEN** alguien añade `public/audio/juegos/x/nuevo.mp3` sin línea en `LICENCIAS.md`
- **THEN** `npm test` falla nombrando el archivo

### Requirement: Resumen para el informe
La herramienta SHALL escribir un `RESUMEN.md` con el conteo por rol, la duración total, las voces por escuchar y la autoría. El informe `docs/investigacion/referencia-<slug>.md` SHALL incluir una sección «Inventario sonoro» basada en ese resumen, que diga qué audio se usará en la adaptación y qué se completará con recursos propios.

#### Scenario: Informe con inventario
- **WHEN** se termina el informe de un referente del programa
- **THEN** contiene la sección «Inventario sonoro» con las pistas que se usan y las que faltan
