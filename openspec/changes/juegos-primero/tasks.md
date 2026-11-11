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
- [ ] 1.10 Probar la herramienta de punta a punta con `cokitos-rutinas-diarias` y comprobar que `git status` muestre solo `inventario.json`, `LICENCIA.md` y `RESUMEN.md`
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
- [ ] 3.2 `mi-dia-en-orden` (Ciencias sociales · SOC-1-03 · ordenar): Cokitos rutinas diarias
- [ ] 3.3 `los-meses-del-anio` (Ciencias sociales · SOC-1-03 · ordenar): Cokitos meses del año
- [ ] 3.4 `antes-y-ahora` (Ciencias sociales · SOC-1-03 · clasificar): Mundo Primaria soc-hue-1-2, con contexto de un municipio colombiano
- [ ] 3.5 `como-se-siente` (Ética y valores · CIU-1a3-CP · clasificar): Cokitos clasificar emociones
- [ ] 3.6 `emociones-del-recreo` (Ética y valores · CIU-1a3-CP · quiz): Mundo Primaria natu-seh-1-4
- [ ] 3.7 `cuenta-las-silabas` (Comprensión lectora · LEN-1-05 · quiz con audio en cada opción): Digipuzzle cuenta las sílabas
- [ ] 3.8 `separa-las-silabas` (Comprensión lectora · LEN-1-05 · ordenar con audio de la palabra): Cokitos separar sílabas
- [ ] 3.9 `sonidos-y-letras` (Comprensión lectora · LEN-1-05 · clasificar con audio en cada elemento): Colombia Aprende (paquete .zip)
- [ ] 3.10 `zoo-de-silabas` (Comprensión lectora · LEN-1-06 · emparejar): Cristic zoo sílabas
- [ ] 3.11 `cuento-de-la-quebrada` (Comprensión lectora · LEN-1-04 · aventura narrada): Mundo Primaria cuentos tradicionales, Árbol ABC Zoológico, Colombia Aprende lectura de cuentos; relato propio de tradición colombiana
- [ ] 3.12 `comparar-numeros` (Matemáticas · MAT-1-03 · quiz): PhET Comparar Números (atribución CC BY 4.0)
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
