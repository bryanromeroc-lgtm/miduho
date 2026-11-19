## Context

- **Contenido actual.** MIDUHO tiene 75 actividades, casi todas de 5.°. La única de 1.° es `comprension-lectora/1/la-ruta-de-las-palabras.json`. Ya existe la cuenta demo de 1.°: `scripts/demo-primero.ts` crea el grupo 1.°01 y una asignatura por cada carpeta de `curriculo/actividades/`.
- **Catálogo de referentes.** `docs/investigacion/catalogo-juegos/juegos-alineados-dba.json` trae 35 referentes de grado 1 o del ciclo 1-3 (7 plataformas, 20 DBA o referentes). El 87 % de las relaciones juego↔DBA son inferidas 🔶.
- **Flujo aprobado: `/crear-juego-referencia`.** Lo siguieron «El taller de los topos» (`golpea`), «Armi explora Colombia» (`mapa`) y «La ruta de las palabras» (`ruta-palabras`). Va así: REA (solo lectura, todo lo capturado se borra) → diseño con visto bueno → OpenSpec si hay tipo nuevo → construcción (lógica pura primero, recursos Gemini y CC0, registro en 4 lugares, interfaz) → verificación (pruebas, capturas y video, `design-game`, `/impeccable`).
- **Precedente de audio.** «Rodeo de palabras»: el usuario entregó el audio de la referencia, quedó en `content/referencias/rodeo-de-palabras-audio/` fuera de git, y las voces se usan en `public/audio/palabras/` con `LICENCIA.md` «permiso pendiente de adjuntar».
- **Decisión del usuario (2026-11-10).** La captura sonora es **siempre** el primer paso de la adaptación. El audio se usa para analizar y también en la plataforma, porque el usuario declara tener los permisos. Todo va en un solo cambio, por fases.
- **Piezas de audio actuales.** `comun/sonido.ts` (efectos sintetizados y preferencia), `comun/voz.ts` (Web Speech, sin voz grabada), `<tipo>/audio.ts` (Web Audio con búferes, como en `ruta-palabras`).

## Goals / Non-Goals

**Goals:**
- Los 35 referentes de 1.° quedan cubiertos por 26 actividades nuevas, más la existente.
- Cada referente tiene su estudio REA, su captura sonora con inventario y su informe.
- El audio de la referencia se usa en la adaptación, trazado hasta su origen.
- Toda actividad de 1.° se puede seguir sin saber leer: consigna y opciones habladas.
- Se mantienen WCAG 2.1 AA, el estándar de juegos aprobado, la evaluación 2/1/0 recalificable en el servidor y el español de Colombia.

**Non-Goals:**
- Actividades de 2.° a 5.° (los tipos nuevos sirven después, pero no se escribe contenido de esos grados).
- Guardar intentos y notas (llega con `actividades-en-clase`).
- Enlazar los DBA como referentes en la base.
- Una voz sintética propia o un servicio de texto a voz en la nube.
- Copiar código, imágenes o personajes de la referencia: eso sigue prohibido. Lo que cambia es solo el audio.
- Línea de tiempo como tipo propio (ver la decisión 9).

## Decisions

### 1. Un cambio, nueve fases, con puntos de control
Las fases van de 0 a 8 y terminan con un cierre. Su orden:
1. Fase 0: herramienta de captura.
2. Fase 1: audio en actividades, requisito de todo 1.°.
3. Fase 2: lote con tipos existentes. Valida el flujo completo con poco código.
4. Fase 3: `golpea` en modo preguntas.
5. Fases 4–8: tipos nuevos, en orden de prioridad A de Matemáticas (valor posicional, balanza, respuesta numérica), luego Robótica y Sociales (cuadrícula), y al final Ética (dilemas).

Cada tipo nuevo tiene un **punto de control**: tras el estudio REA y la captura se presenta el diseño y se espera el visto bueno. Si el estudio contradice la spec de este cambio, la spec se ajusta aquí mismo, con un delta en `specs/actividad-<tipo>/`, antes de construir.
- *Alternativa:* un cambio por tipo, como pide hoy la fase 2 del comando. Se descartó por decisión del usuario.

### 2. Herramienta `tools/captura-audio/` (Node ESM, fuera de la app)
Es un paquete propio con `playwright-core`, como `tools/flipbook-forge`. Lanza un Chrome limpio con su propio perfil temporal en el scratchpad y nunca se conecta al 9222 de Gemini ni al 9333 de REA. Tiene cuatro subcomandos:
- **`capturar <url> --slug <slug> [--guion <archivo.mjs>] [--manual <segundos>] [--zip <url>]`**
  - Escucha todas las respuestas de red de la página y de sus `iframe`.
  - Inyecta antes de cargar un *script* de observación que registra lo que se intenta reproducir y los *sprites* declarados. Envuelve `HTMLMediaElement.prototype.play`, `Audio`, `AudioContext.prototype.decodeAudioData` y el constructor `Howl` cuando aparece.
  - Busca en los scripts y JSON descargados URL de audio y audios `data:` en base64.
  - Hace como máximo una petición por segundo por dominio, con un User-Agent genérico.
  - `--guion` ejecuta interacciones para que se carguen los audios perezosos: aceptar el aviso de cookies, pulsar «Jugar», acertar y fallar.
  - `--manual` abre el navegador visible durante N segundos para que una persona juegue.
  - `--zip` descarga el paquete sin conexión de Colombia Aprende y extrae su audio.
- **`inventariar <slug>`**
  - Calcula sha256 (para quitar duplicados), mime, duración, canales y frecuencia con `ffprobe`, y la sonoridad con `ffmpeg -af ebur128`.
  - Corta los sprites a `cortes/`.
  - Propone `rol` y `evento` a partir del nombre, la duración, si suena en bucle y dónde lo invoca el código. Todo queda con `certeza: "inferido"`.
  - Si hay `faster-whisper` o `whisper` instalados, transcribe las voces en español sin conexión con `certeza: "transcripción automática"`. Si no, deja `null` 🔶.
- **`adaptar <slug> <id…> --destino <carpeta> [--nombre …]`**: normaliza (`loudnorm` −18/−23 LUFS, mono a 44,1 kHz, recorta el silencio), escribe la línea de `LICENCIAS.md` y anota `uso`.
- **`resumen <slug>`**: genera `RESUMEN.md`.

*Alternativa:* hacerlo dentro de REA. Se descartó porque REA borra lo capturado y su CLI no descarga medios. La captura sonora es un paso aparte y persistente.

### 3. Estructura en disco y git
```
content/referencias/<slug>/
  inventario.json   LICENCIA.md   RESUMEN.md      ← versionados
  audio/originales/  audio/cortes/                ← fuera de git
```
`.gitignore` se amplía con `/content/referencias/**/audio/`, sin quitar la regla `*.ogg` actual. La carpeta `rodeo-de-palabras-audio/` se deja como está y se documenta como precedente; no se migra.

El slug de la referencia es `<plataforma>-<juego>`, por ejemplo `cokitos-rutinas-diarias`. Así varias actividades pueden compartir referente sin duplicar la captura.

### 4. Licencia: declarar y trazar, sin bloquear
- `LICENCIA.md` por referencia, desde una plantilla, con estos datos:
  - plataforma y autoría real;
  - la licencia pública si existe (PhET CC BY 4.0, Blockly Apache-2.0, GCompris GPL-3.0, Code.org 🔶);
  - si no la hay, «permiso declarado por el usuario el 2026-11-10», con los datos del soporte escrito por adjuntar 🔶.
- La prueba `public-audio.test.ts`, en `apps/web/src/features/actividades/`, exige que cada audio de `public/audio/**` esté nombrado en un `LICENCIAS.md` o `LICENCIA.md` de su carpeta o de una carpeta superior. Basta un nombre de archivo o un patrón glob. La prueba no mira el permiso.
- Hay que ajustar los `LICENCIAS.md` de `golpea/`, `mapa/`, `robots/`, `ruta-palabras/` y `palabras/` si no listan cada archivo.

### 5. Audio en el contenido y el reproductor
- **Esquemas.** Se añade el campo `audio?: rutaAudio` (cadena que empieza por `/audio/`) a pregunta y opción (`tipos/preguntas.ts`), a elemento y tarjeta (`tipos/relaciones.ts`), a palabra (`tipos/palabras.ts`) y a escena (`juegos/aventura`). Se añade `audioInstruccion?` en el archivo de actividad, junto a `instruccion`.
- **Validación.** `curriculo.test.ts` comprueba que cada ruta de audio exista en `public/`.
- **Pieza común.** `comun/escuchar.tsx` (el botón) y `useVozTarea()` en `comun/voz.ts`:
  - un solo canal de voz: reproducir uno detiene el anterior;
  - `HTMLAudioElement` para lo grabado;
  - respaldo con `speechSynthesis` solo si `grado ≤ 2`;
  - emite un evento para bajar la música mientras suena;
  - la preferencia «Leer en voz alta» se guarda en `localStorage` dentro de `try/catch` y vale «sí» por defecto en 1.°.
- **Grado.** El reproductor pasa el `grado` de la actividad por un contexto (`ContextoActividad`) para que cada tipo sepa si lee solo.
- *Alternativa:* hacer un tipo «quiz con audio» aparte. Se descartó porque el audio es una capacidad de todos los tipos (ya estaba así en `Mecanicas-de-juego.md` #16).

### 6. `golpea` con modo preguntas
- El esquema pasa a ser una unión discriminada por `modo`, con `operaciones` por defecto vía `z.preprocess`. Así `el-taller-de-los-topos.json` no cambia.
- En modo `preguntas`:
  - la respuesta es la lista de índices de opción;
  - la `semilla` reparte las opciones en los 10 huecos;
  - el cartel del topo admite una imagen con `alt`.
- Si la imagen no se lee a ⅓ del alto, el cartel crece y se declara la excepción, como ya se hizo con los topos.

### 7. Tipos nuevos con el contrato actual
Los tipos nuevos son `valor-posicional`, `balanza`, `respuesta-numerica`, `cuadricula-instrucciones` y `dilemas`. Cada uno vive en `juegos/<tipo>/` con `generador.ts` (si genera), `tipo.ts`, `tipo.test.ts`, `juego.tsx` y CSS Module, y se registra en los 4 lugares.
- **Simuladores** (`valor-posicional`, `balanza`): siguen `simuladores-miduho`, con laboratorio libre sin nota y retos calificados.
- **`cuadricula-instrucciones`:** tiene un simulador puro `ejecutar(nivel, secuencia)` que comparten el cliente y `calificar`.
- **`dilemas`:** reutiliza las piezas de escena de `aventura`, pero tiene su propio esquema de ramas y clasificación.
- En todos, la calificación es 2/1/0 con error que enseña. En la cuadrícula, la ventana es de tres ejecuciones.

### 8. Prioridad del audio en cada actividad
1. Voz capturada que diga exactamente el texto de MIDUHO, en español de Colombia o neutro.
2. Voz propia grabada, si el colegio la entrega.
3. Síntesis del navegador.

Para los efectos y la música, primero el audio capturado que encaje con la escena y luego Kenney CC0 o Gemini. Claude no oye el audio: toda elección de voz se basa en la transcripción y queda «por escuchar» hasta que el usuario lo confirme.

### 9. Ajustes al catálogo
- «Línea de tiempo» (Mundo Primaria pasado y presente) se hace como `clasificar` «antes / ahora».
- «Haz un Diez» entra como reto `componer10` de `valor-posicional`.
- «Emparejar + audio», «Quiz + audio» y «Aventura + audio» no son tipos nuevos, sino la capacidad `audio-en-actividades`.
- «Sílabas encantadas» queda cubierta por `la-ruta-de-las-palabras`.
- Las dos referencias de `TEC-1a3-SP` de secuencia directa (Cokitos y Code.org) se juntan en una actividad.

### 10. Seguimiento
- `docs/investigacion/juegos-primero.md` es el tablero: una fila por actividad con el estado de cada paso.
- En la bóveda se actualizan `Juegos-alineados-DBA.md` y `Mecanicas-de-juego.md`, que todavía marca «Mapa interactivo 🆕» aunque ya existe.
- En el catálogo JSON se añade el campo `estado_miduho` por referente.
- Cada fase cierra con su registro en `docs/software-factory/inc-<n>-juegos-primero-fase-<k>.md`.

## Risks / Trade-offs

- **Permiso declarado, no adjuntado.** Si un titular reclama, el audio de terceros está en producción. → Cada archivo queda trazado a su origen en `LICENCIAS.md`, así que se puede reemplazar por archivo sin tocar el juego (mismo nombre). El tablero lista qué audios son de terceros.
- **Voces de España** (acento o vocabulario) en una plataforma que exige español de Colombia (regla 4). → Se filtran por transcripción, se usan solo si el texto coincide y el usuario las escucha. Si no sirven, queda la síntesis.
- **Claude no oye.** Rol, evento y transcripción inferidos pueden estar mal. → Quedan con `certeza` y una lista «por escuchar» en cada `RESUMEN.md`. El cierre de cada fase pide al usuario que escuche.
- **Muros y anuncios.** Mundo Primaria pide aceptar cookies o pagar; Cokitos carga anuncios; Cristic aloja en Canva o Genially. → Hay guiones por plataforma y modo `--manual`. Si algo no se captura, queda dicho en el inventario («no capturable») y se usa audio propio.
- **Tamaño del despliegue.** Cientos de MP3 en `public/audio/` engordan la imagen de Heroku. → Se usa MP3 mono normalizado. Si `public/audio` pasa de ~50 MB 🔶, se evalúa servirlo desde R2 como las páginas de los libros (fuera de este cambio).
- **Volumen.** 26 actividades y 5 tipos es mucho trabajo. → Las fases se pueden cerrar por separado. Cada una deja la plataforma estable (build, lint y test en verde) y el tablero al día.
- **La spec de un tipo puede no coincidir con su referencia.** → Punto de control y delta de la spec antes de construir (decisión 1).
- **`whisper` no instalado.** → Transcripción `null` y escucha humana. No bloquea.

## Open Questions

- 🔶 ¿El colegio puede grabar voces propias (consignas de 1.°) si una voz capturada no sirve?
- 🔶 Los datos del permiso escrito de cada plataforma: quién lo concede, alcance y vigencia.
- 🔶 ¿Se mantiene «Armi» como guía en 1.° o conviene un personaje más infantil? Hay que validarlo con la docente.
- 🔶 ¿La lectura automática debe venir activada por defecto también en 2.°?
- 🔶 Umbral de tamaño de `public/audio` para pasar a almacenamiento de objetos.
