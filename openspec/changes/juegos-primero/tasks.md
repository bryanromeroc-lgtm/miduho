## 1. Fase 0 — Proceso y herramienta de captura sonora

- [x] 1.1 Actualizar `.claude/commands/crear-juego-referencia.md`: insertar la «Fase 0.5 — Captura sonora» (obligatoria, siempre) entre REA y el diseño, y cambiar la línea roja de audio por «audio capturado con permiso declarado y registrado»
- [x] 1.2 Actualizar `.claude/skills/referencia-rea/SKILL.md` (línea roja, paso de captura, la captura sonora no se borra) y `.claude/skills/juegos-2d-miduho/SKILL.md` (prioridad del audio de la decisión 8)
- [x] 1.3 Crear `tools/captura-audio/` (`package.json` con `playwright-core`, `README.md`) y comprobar que existan `ffmpeg`, `ffprobe` y, opcionalmente, `whisper`/`faster-whisper` (anotar el resultado en el README)
- [x] 1.4 Subcomando `capturar`: Chrome con perfil temporal, red de la página y de los `iframe`, script de observación (`play`, `Audio`, `decodeAudioData`, `Howl`), URL de audio en scripts y JSON, audio `data:`, una petición por segundo por dominio, `--guion`, `--manual`, `--zip`
- [x] 1.5 Subcomando `inventariar`: sha256 y quitar duplicados, `ffprobe`, sonoridad EBU R128, cortes de sprites, `rol`/`evento` inferidos con `certeza`, transcripción si hay whisper
- [x] 1.6 Subcomandos `adaptar` (normalización −18/−23 LUFS, MP3 mono a 44,1 kHz, línea en `LICENCIAS.md`, campo `uso`) y `resumen` (`RESUMEN.md`)
- [x] 1.7 Pruebas de la lógica pura de la herramienta (detección de URL de audio en texto, lectura de sprites, heurística de rol, quitar duplicados) con `node:test`
- [x] 1.8 Plantilla `LICENCIA.md` de referencia (licencia pública o permiso declarado el 2026-11-10 con los datos del soporte por adjuntar 🔶) y ampliar `.gitignore` con `/content/referencias/**/audio/`
- [ ] 1.9 Guiones por plataforma en `tools/captura-audio/guiones/`: Cokitos (pulsar «Jugar» y seguir el `iframe`), Mundo Primaria (aviso de cookies), Árbol ABC, Digipuzzle, Cristic (Canva/Genially), PhET, Code.org, Toy Theater, Colombia Aprende (`--zip`)
- [x] 1.10 Probar la herramienta de punta a punta con `cokitos-rutinas-diarias` y comprobar que `git status` muestre solo `inventario.json`, `LICENCIA.md` y `RESUMEN.md`
- [x] 1.11 Prueba `apps/web/src/features/actividades/public-audio.test.ts` (todo audio de `public/audio/**` registrado) y ajustar los `LICENCIAS.md` existentes (`golpea`, `mapa`, `robots`, `ruta-palabras`, `palabras`) hasta que pase
- [x] 1.12 Crear el tablero `docs/investigacion/juegos-primero.md` con las 26 actividades, sus DBA, sus referentes y los pasos en «pendiente»

## 2. Fase 1 — Audio en las actividades

- [x] 2.1 Esquemas: `audio?` en pregunta y opción (`tipos/preguntas.ts`), elemento y tarjeta (`tipos/relaciones.ts`), palabra (`tipos/palabras.ts`) y escena (`aventura`); `audioInstruccion?` en el archivo de actividad; pruebas de que el contenido antiguo sigue siendo válido
- [x] 2.2 `curriculo.test.ts`: fallar si una ruta de audio citada no existe en `public/`
- [x] 2.3 `useVozTarea()` en `comun/voz.ts`: un solo canal, grabado antes que síntesis, síntesis solo con grado ≤ 2, evento para bajar la música; pruebas de la lógica de elección de fuente
- [x] 2.4 `comun/escuchar.tsx`: botón «Escuchar» (≥ 44 px, nombre accesible, foco visible) y control «Leer en voz alta: sí/no» con preferencia en `localStorage` dentro de `try/catch`
- [x] 2.5 `ContextoActividad` con el `grado` desde el reproductor; lectura automática de la consigna por ítem en 1.° (una vez, tras «Jugar»)
- [x] 2.6 Integrar «Escuchar» en `seleccion-multiple`, `clasificar`, `ordenar`, `emparejar` y `aventura`; comprobar que apagar efectos o música no silencia la voz
- [ ] 2.7 Verificar con `la-ruta-de-las-palabras` y un quiz de prueba de 1.° (página temporal `src/app/prueba.audio/`, que se borra al terminar); `npm test`, `npm run lint`, `npm run build`

## 3. Fase 2 — Lote con tipos existentes (15 actividades)

Para **cada** actividad: (a) REA de cada referente e informe `docs/investigacion/referencia-<slug>.md`; (b) captura sonora, inventario y «Inventario sonoro» en el informe; (c) diseño corto y visto bueno del usuario; (d) imágenes Gemini y audio adaptado con `LICENCIAS.md`; (e) JSON en `curriculo/actividades/<asignatura>/1/`; (f) verificación y fila del tablero al día.

- [x] 3.1 `vivo-o-no-vivo` (Ciencias naturales · NAT-1-03 · clasificar): Mundo Primaria natu-svi-1-1, Cokitos seres vivos e inertes, Colombia Aprende
- [x] 3.2 `rutinas-del-dia` (antes `mi-dia-en-orden`; Ciencias sociales · SOC-1-03 · `emparejar` con presentación `cinta`): Cokitos rutinas diarias. La referencia relaciona imagen con acción, no ordena (visto bueno del usuario, 2026-11-10). 18 tarjetas, solo los efectos de la referencia, sin voces; registro `docs/software-factory/inc-3-juegos-primero-rutinas-del-dia.md`
- [x] 3.3 `los-meses-del-anio` («Los meses en su lugar»; Ciencias sociales · SOC-1-03 · `ordenar` con presentación nueva `casillas`, delta `specs/actividad-ordenar-casillas/`): Cokitos meses del año (Wordwall «Orden correcto»). Un solo envío y 1 punto por casilla, como el original y como `agrupar` (visto bueno del usuario, 2026-11-17). Primer juego con el reparto Claude (audio y supervisión) / Codex (REA y construcción); solo efectos de la referencia, sin voces; registro `docs/software-factory/inc-3-juegos-primero-los-meses-del-anio.md`
- [x] 3.4 `antes-y-ahora` («Antes y ahora»; Ciencias sociales · SOC-1-03 · `clasificar` con presentación nueva `parejas`, delta `specs/actividad-clasificar-parejas/`): Mundo Primaria soc-hue-1-2, Juego 3 (6 parejas antiguo/actual que se arrastran a Pasado/Presente). El usuario eligió la presentación por parejas y los 6 objetos del original, válidos también en Colombia (2026-11-17); calificación existente de `clasificar` (primera ubicación, 1 punto por objeto); solo los 4 efectos de la referencia, sin voces; registro `docs/software-factory/inc-3-juegos-primero-antes-y-ahora.md`
- [x] 3.5 `como-se-siente` («¿Cómo se siente?»; Ética y valores · CIU-1a3-CP · `clasificar` con presentación `tablero` + `tema: "corcho"` y `escena` opcionales, delta `specs/actividad-clasificar-tablero-temas/`): Cokitos clasificar emociones (Wordwall «Agrupar», la misma plantilla de `vivo-o-no-vivo`, tema corcho). El usuario eligió reutilizar el tablero con tema corcho y Ciro, categorías «agradables/desagradables» y 12 emociones claras (de las 20 del original) con la cara de Ciro (2026-11-17); 15 efectos de corcho, sin voces; registro `docs/software-factory/inc-3-juegos-primero-como-se-siente.md`
- [x] 3.6 `emociones-del-recreo` («Emociones del recreo»; Ética y valores · CIU-1a3-CP · `seleccion-multiple` con imagen por pregunta y por opción, `escena` con Ciro y `efectos` opcionales, delta `specs/actividad-quiz-ilustrado/`): Mundo Primaria natu-seh-1-4 (Juego 1 «foto + emoción» como mecánica, tocando en vez de arrastrar; el Juego 2 verdadero/falso se descartó). El usuario eligió 6 situaciones de recreo nuevas con 3 emociones de `como-se-siente` cada una (2026-11-18); 4 efectos de la referencia (los de `parejas`); primeras voces generadas por Codex con Gemini TTS (consigna + 6 enunciados, `es-419-tutor-3`), opciones con las voces existentes; registro `docs/software-factory/inc-3-juegos-primero-emociones-del-recreo.md`
- [x] 3.7 `cuenta-las-silabas` («Cuenta las sílabas»; Comprensión lectora · LEN-1-05 · `seleccion-multiple` ilustrado con Bruno y `barajarOpciones: false`, delta `specs/actividad-quiz-ilustrado/`): Digipuzzle cuenta las sílabas (mudo; 83 palabras, reintentos y sin final). El usuario eligió el quiz existente con la separación silábica en la explicación, 8 palabras colombianas (sol, flor, casa, perro, pelota, zapato, mariposa, computador) y voz de la palabra en lugar de audio en cada opción (2026-11-19); efectos del quiz ilustrado; 9 voces generadas por Codex con Gemini TTS; registro `docs/software-factory/inc-3-juegos-primero-cuenta-las-silabas.md`
- [x] 3.8 `separa-las-silabas` («Separa las sílabas»; Comprensión lectora · LEN-1-05 · tipo nuevo `separar` «tocar para cortar», delta `specs/actividad-separar/`): Cokitos separar sílabas → Genmagic «Separa sílabas» (se insertan guiones en la palabra; casi mudo). `ordenar` no evalúa límites, así que el usuario eligió un tipo nuevo de huecos tocables entre letras (sin hueco dentro de ch, ll, rr), las 10 palabras propuestas del banco del original (gato, vaca, mesa, mano, gallina, jirafa, naranja, elefante, cocodrilo, camiseta), un intento por palabra con revelado y voces + efectos del quiz ilustrado (2026-11-19); guía Bruno con las poses de `cuenta-las-silabas`; 20 voces generadas por Codex con Gemini TTS (falta `camiseta` por sílabas 🔶); registro `docs/software-factory/inc-3-juegos-primero-separa-las-silabas.md`
- [x] 3.9 `sonidos-y-letras` («Sonidos y letras»; Comprensión lectora · LEN-1-05 · `clasificar` + `tablero` con los campos genéricos nuevos `tarjetas: "sonido"`, `simbolo` y `efectos` por evento, delta `specs/actividad-clasificar-sonido/`): Colombia Aprende L_G01_U01_L01 (paquete .zip; el ejercicio 03_01 empareja 10 sonidos con su imagen). El usuario eligió clasificar en dos grupos «Sonidos de letras» / «Otros sonidos» con tarjetas de solo sonido y botón «Ver pista» como alternativa accesible, y los 10 sonidos originales sin la risa (A, E, I, O, U · campanas, oveja, silbato, vaca, gato) (2026-11-19); efectos `error`/`success` de la lección en `fallo`/`fin`; guía Bruno; consigna sin voz Gemini por cupo 🔶; registro `docs/software-factory/inc-3-juegos-primero-sonidos-y-letras.md`
- [x] 3.10 `zoo-de-silabas` («Zoo de sílabas»; Comprensión lectora · LEN-1-06 · tipo nuevo `formar` —no `emparejar`: el original ordena sílabas en huecos—, delta `specs/actividad-formar/`): Cristic enlaza al juego Phaser de Árbol ABC `arbolabcgames.top/F37A/` (perrito que recorre un camino y ordena las sílabas de 30 animales). El usuario eligió formar palabras por ronda, 10 animales (ga·to, va·ca, pa·to, pe·rro, o·so · co·ne·jo, ji·ra·fa, tor·tu·ga, ca·ba·llo, o·ve·ja), reintento con punto al primer intento y Bruno recorriendo el zoo (2026-11-19); 8 cortes del audio original por evento; 8 voces nuevas con `es-419-tutor-3` (regeneradas el 2026-11-20; antes respaldo `Sulafat`), falta escucharlas 🔶; registro `docs/software-factory/inc-3-juegos-primero-zoo-de-silabas.md`
- [x] 3.11 `cuento-de-la-quebrada` («La piedra que cantaba»; Comprensión lectora · LEN-1-04 · `aventura` generalizada con campos opcionales —sin `carga`, `imagen`/`alt` por escena, `escena.personaje`, `efectos`, `secuencia` final calificada—, delta `specs/actividad-aventura-cuento/`): referencias Mundo Primaria `9908` (reconocer el cuento por la imagen), Colombia Aprende L_G01_U04_L05 (leer, ordenar inicio-nudo-desenlace, preguntar acciones); Árbol ABC «Zoológico» descartado (es de sílabas). El usuario eligió aventura + ordenar la trama al final, el relato propio «La piedra que cantaba» (mirla, Bruno, Madremonte amable, ranita) con texto aprobado y los efectos de Mundo Primaria + `success` del MEN (2026-11-20); «La entrega de Armi» sin cambios; 9 voces Gemini `es-419-tutor-3` conectadas el 2026-11-20 (campo nuevo `audioInicio`), falta escucharlas 🔶; registro `docs/software-factory/inc-3-juegos-primero-cuento-de-la-quebrada.md`
- [x] 3.12 `comparar-numeros` («Comparar números»; Matemáticas · MAT-1-03 · tipo nuevo `taller-comparar` —simulador: laboratorio + retos, no `seleccion-multiple`—, delta `specs/actividad-taller-comparar/`): PhET «Comparar números» es exploración libre sin retos (0–20, objetos, marco de diez, signo y frase al instante). El usuario eligió explorar + 10 retos (7 leer la relación, 3 construir una cantidad con varias respuestas válidas), rango 0–20, palabra y símbolo juntos sin «cocodrilo» y objetos colombianos (mangos, mariposas, ranas, arepas) con Armi (2026-11-20). Audio: 6 efectos de PhET **versión 1.0.10 (CC BY 4.0)**, porque la actual es CC BY-NC 4.0 y los sonidos son idénticos; acierto/error/avanzar/fin de Mundo Primaria. 3 voces de relación pendientes por cupo 🔶; primera actividad de Matemáticas de 1.° (añadida a `demo-primero`); registro `docs/software-factory/inc-3-juegos-primero-comparar-numeros.md`
- [ ] 3.13 `hello-friends` (Inglés · ING-1-04 · quiz con audio): Cristic greetings
- [ ] 3.14 `my-family` (Inglés · ING-1-04 · emparejar con audio): Árbol ABC la familia, con roles y sin nombres de personas
- [ ] 3.15 `greetings` (Inglés · ING-1-01 · emparejar con audio): Árbol ABC saludos
- [ ] 3.16 Recorrido de las 15 con la cuenta `demo-primero` (solo teclado), capturas a 1920×1080, 1440×900 y 390×844, registro `docs/software-factory/inc-3-juegos-primero-fase-2.md` y pedir al usuario que escuche las voces

## 4. Fase 3 — `golpea` en modo preguntas

- [ ] 4.1 REA y captura sonora de Cokitos «izquierda y derecha con el mono» y de Mundo Primaria «Simón dice»; informes; punto de control con el usuario
- [ ] 4.2 Esquema con unión por `modo` (`operaciones` por defecto con `z.preprocess`), generador de huecos por semilla, respuesta por índices, calificación 2/1/0 y `pista`; pruebas, incluida la de que `el-taller-de-los-topos` genera las mismas rondas que antes
- [ ] 4.3 Interfaz: cartel con texto o imagen (`alt`), consigna hablada por ronda, tecla `R` y «Escuchar otra vez», topos golpeables mientras suena la consigna
- [ ] 4.4 Actividades `izquierda-o-derecha` (Ciencias sociales · SOC-1-01) y `armi-says` (Inglés · ING-1-01), con imágenes y audio
- [ ] 4.5 Verificación (pruebas, capturas, video de acierto y fallo, tabla de `design-game`) y tablero al día

## 5. Fase 4 — Tipo `valor-posicional`

- [ ] 5.1 REA y captura sonora: Cokitos valor posicional, Toy Theater base ten blocks, Árbol ABC componer y descomponer hasta 10, PhET Haz un Diez; informes
- [ ] 5.2 Punto de control: diseño (laboratorio, retos `construir`/`leer`/`componer10`, escena, audio) y visto bueno; delta de la spec si cambia algo
- [ ] 5.3 `generador.ts`, `tipo.ts` y `tipo.test.ts` (determinismo, agrupar y desagrupar, calificación 2/1/0, pistas por decenas y unidades invertidas, ±10, ±1, descomposiciones distintas)
- [ ] 5.4 Registro en los 4 lugares e interfaz `juego.tsx` + CSS (tablero, botones, número en palabras con audio, laboratorio y retos, `/impeccable`)
- [ ] 5.5 Recursos (Gemini y audio adaptado) y actividades `cajas-de-diez` (MAT-1-03) y `el-diez-se-arma` (MAT-1-02)
- [ ] 5.6 Verificación completa y tablero al día

## 6. Fase 5 — Tipo `balanza`

- [ ] 6.1 REA y captura sonora: PhET Explorador de Igualdades: Intro y Cokitos math box balance; informes
- [ ] 6.2 Punto de control: diseño y visto bueno; delta de la spec si cambia algo
- [ ] 6.3 Lógica y pruebas (formas `a + ? = c`, `a + b = ? + d`, `? − b = c`; inclinación; pista del error «da»; 2/1/0)
- [ ] 6.4 Registro, interfaz (tocar caja → platillo, entrada por teclado, inclinación también en texto) y recursos
- [ ] 6.5 Actividad `la-balanza-justa` (MAT-1-09), verificación y tablero

## 7. Fase 6 — Tipo `respuesta-numerica`

- [ ] 7.1 REA y captura sonora: Mundo Primaria mates-prob-1-4; informe
- [ ] 7.2 Punto de control: diseño y visto bueno; delta de la spec si cambia algo
- [ ] 7.3 Lógica y pruebas (2/1/0, `errores` declarados con pista, revelado con la operación)
- [ ] 7.4 Registro, interfaz (teclado en pantalla 0–9, teclado físico, etiqueta visible, `status`) y recursos
- [ ] 7.5 Actividad `la-tienda-escolar` (MAT-1-02, pesos colombianos), verificación y tablero

## 8. Fase 7 — Tipo `cuadricula-instrucciones`

- [ ] 8.1 REA y captura sonora: Cokitos programación para niños, Code.org curso 1, Cokitos programación inversa, Mundo Primaria mat-geo-1-1; informes
- [ ] 8.2 Punto de control: diseño (directo, inverso, consignas relativas al personaje, `repetir`, `maxInstrucciones`) y visto bueno
- [ ] 8.3 Simulador puro `ejecutar(nivel, secuencia)` y pruebas (meta, choque, fuera de la cuadrícula, giros, repetir, límite de instrucciones, inverso, izquierda relativa al personaje, ventana de tres ejecuciones)
- [ ] 8.4 Registro, interfaz (botones con flechas y teclas, lista de pasos resaltada, descripción en texto de la cuadrícula, movimiento reducido) y recursos con el personaje robot y escena de llegada
- [ ] 8.5 Actividades `el-robot-a-la-meta` (Robótica · TEC-1a3-SP), `a-donde-va-el-robot` (Robótica · TEC-1a3-SP, inverso) y `delante-y-detras` (Ciencias sociales · SOC-1-01)
- [ ] 8.6 Verificación completa y tablero

## 9. Fase 8 — Tipo `dilemas`

- [ ] 9.1 REA y captura sonora: Cristic detectives emocionales y Toy Theater feelings cards; informes
- [ ] 9.2 Punto de control: diseño (escenas, ramas, detectar la emoción, clasificación asertiva/pasiva/agresiva, sin castigo) y visto bueno
- [ ] 9.3 Lógica y pruebas (ramas, 2/1/0, repaso con la opción asertiva y el porqué), reutilizando piezas de `aventura`
- [ ] 9.4 Registro, interfaz con narración automática en 1.° y recursos (ilustraciones de escenas con personajes ficticios)
- [ ] 9.5 Actividades `detectives-de-emociones` (CIU-1a3-CP) y `todos-jugamos` (CIU-1a3-PI), verificación y tablero

## 10. Cierre

- [ ] 10.1 Comprobar la cobertura: los 35 referentes de 1.° de `juegos-alineados-dba.json` cubiertos por una actividad; añadir `estado_miduho` a cada referente del JSON
- [ ] 10.2 Actualizar la bóveda: `Juegos-alineados-DBA.md` (estado de cada referente de 1.°), `Mecanicas-de-juego.md` (mapa ya existe; tipos nuevos construidos), `Estado-de-la-construccion.md`
- [ ] 10.3 Actualizar `docs/actividades/tipos.md` (tipos nuevos, audio en actividades, conteo de actividades) y el README del catálogo (137 URL distintas)
- [ ] 10.4 `npm test`, `npm run lint` y `npm run build` desde la raíz, con el PostgreSQL de desarrollo arriba; registrar el resultado
- [ ] 10.5 Recorrido final con `demo-primero` por las siete asignaturas de 1.° y lista para el usuario: audios por escuchar, permisos por adjuntar 🔶, lo no comprobado
