## ADDED Requirements

### Requirement: Catálogo del programa de 1.°
El programa SHALL construir las 26 actividades de la tabla y SHALL mantener la actividad existente `la-ruta-de-las-palabras`, que cubre «Sílabas encantadas». Juntas cubren los 35 referentes de 1.° de `juegos-alineados-dba.json`. Los nombres y slugs de la tabla son de trabajo: el título definitivo se escribe en la fase de diseño, y en el slug la «ñ» se escribe «ni».

| Fase | Slug (de trabajo) | Asignatura | DBA / referente | Tipo | Referentes del catálogo |
|---|---|---|---|---|---|
| 2 | `vivo-o-no-vivo` | Ciencias naturales | NAT-1-03 | `clasificar` | Mundo Primaria natu-svi-1-1 · Cokitos clasificación de seres vivos e inertes · Colombia Aprende «¿En qué se diferencian…?» |
| 2 | `mi-dia-en-orden` | Ciencias sociales | SOC-1-03 | `ordenar` | Cokitos rutinas diarias |
| 2 | `los-meses-del-anio` | Ciencias sociales | SOC-1-03 | `ordenar` | Cokitos ordenar los meses del año |
| 2 | `antes-y-ahora` | Ciencias sociales | SOC-1-03 | `clasificar` | Mundo Primaria soc-hue-1-2 (pasado y presente) |
| 2 | `como-se-siente` | Ética y valores | CIU-1a3-CP | `clasificar` | Cokitos clasificar emociones positivas y negativas |
| 2 | `emociones-del-recreo` | Ética y valores | CIU-1a3-CP | `seleccion-multiple` | Mundo Primaria natu-seh-1-4 |
| 2 | `cuenta-las-silabas` | Comprensión lectora | LEN-1-05 | `seleccion-multiple` | Digipuzzle cuenta las sílabas |
| 2 | `separa-las-silabas` | Comprensión lectora | LEN-1-05 | `ordenar` | Cokitos separar sílabas en las palabras |
| 2 | `sonidos-y-letras` | Comprensión lectora | LEN-1-05 | `clasificar` | Colombia Aprende sonidos no lingüísticos y de las letras |
| 2 | `zoo-de-silabas` | Comprensión lectora | LEN-1-06 | `emparejar` | Cristic zoo sílabas |
| 2 | `cuento-de-la-quebrada` | Comprensión lectora | LEN-1-04 | `aventura` | Mundo Primaria cuentos tradicionales · Árbol ABC Zoológico · Colombia Aprende lectura de cuentos |
| 2 | `comparar-numeros` | Matemáticas | MAT-1-03 | `seleccion-multiple` | PhET Comparar Números |
| 2 | `hello-friends` | Inglés | ING-1-04 | `seleccion-multiple` | Cristic greetings |
| 2 | `my-family` | Inglés | ING-1-04 | `emparejar` | Árbol ABC la familia en inglés |
| 2 | `greetings` | Inglés | ING-1-01 | `emparejar` | Árbol ABC saludos en inglés |
| 3 | `izquierda-o-derecha` | Ciencias sociales | SOC-1-01 | `golpea` (preguntas) | Cokitos atención izquierda y derecha con el mono |
| 3 | `armi-says` | Inglés | ING-1-01 | `golpea` (preguntas) | Mundo Primaria Simón dice |
| 4 | `cajas-de-diez` | Matemáticas | MAT-1-03 | `valor-posicional` | Cokitos valor posicional unidades y decenas · Toy Theater base ten blocks |
| 4 | `el-diez-se-arma` | Matemáticas | MAT-1-02 | `valor-posicional` | Árbol ABC componer y descomponer hasta 10 · PhET Haz un Diez |
| 5 | `la-balanza-justa` | Matemáticas | MAT-1-09 | `balanza` | PhET Explorador de Igualdades: Intro · Cokitos math box balance |
| 6 | `la-tienda-escolar` | Matemáticas | MAT-1-02 | `respuesta-numerica` | Mundo Primaria mates-prob-1-4 |
| 7 | `el-robot-a-la-meta` | Robótica | TEC-1a3-SP | `cuadricula-instrucciones` | Cokitos programación para niños · Code.org curso 1 |
| 7 | `a-donde-va-el-robot` | Robótica | TEC-1a3-SP | `cuadricula-instrucciones` (inverso) | Cokitos programación inversa |
| 7 | `delante-y-detras` | Ciencias sociales | SOC-1-01 | `cuadricula-instrucciones` | Mundo Primaria mat-geo-1-1 (orientación espacial) |
| 8 | `detectives-de-emociones` | Ética y valores | CIU-1a3-CP | `dilemas` | Cristic detectives emocionales |
| 8 | `todos-jugamos` | Ética y valores | CIU-1a3-PI | `dilemas` | Toy Theater feelings cards |

#### Scenario: Cobertura completa
- **WHEN** se cruza la tabla con los referentes de grado 1 y 1-3 de `juegos-alineados-dba.json`
- **THEN** cada uno de los 35 referentes aparece en al menos una actividad (o en `la-ruta-de-las-palabras`)

### Requirement: Flujo por actividad
Cada actividad SHALL seguir, en orden:
1. el estudio de cada referente con REA y su informe `docs/investigacion/referencia-<slug>.md`;
2. la captura sonora (`captura-audio-referencia`);
3. el diseño de la adaptación con la mecánica de la referencia, lo que se añade para evaluar y el audio que se usa;
4. la construcción;
5. la verificación.

Si una actividad combina varios referentes, cada uno SHALL estudiarse y capturarse por separado. Las lecciones de Colombia Aprende SHALL tratarse como fuente de ítems y contexto oficial, aunque no sean juegos.

#### Scenario: Actividad con tres referentes
- **WHEN** se construye `vivo-o-no-vivo`
- **THEN** existen tres inventarios sonoros y un informe por referente, y el diseño dice qué toma de cada uno

### Requirement: Contenido de 1.° propio y colombiano
Cada actividad SHALL guardarse en `apps/web/curriculo/actividades/<asignatura>/1/<slug>.json` con `grado: 1`. El texto, los personajes, los escenarios y las imágenes SHALL ser propios, en español de Colombia y con contexto colombiano. Cuando el referente siga el currículo de España, SHALL cambiarse el vocabulario («ordenador» → «computador», euros → pesos, estaciones → temporadas de lluvia y sequía). Ningún texto ni audio MUST nombrar a personas reales ni usar datos de niños. Los personajes son guías ficticios de MIDUHO.

#### Scenario: Referente de España
- **WHEN** el referente de `antes-y-ahora` usa ejemplos de España
- **THEN** la actividad de MIDUHO usa objetos y lugares de un municipio colombiano

#### Scenario: Voz con variante de España
- **WHEN** una voz capturada dice una palabra que no es de uso en Colombia
- **THEN** no se usa esa pista para esa consigna y se reemplaza por voz propia o síntesis, registrándolo en el informe

### Requirement: Audio en toda actividad de 1.°
Cada actividad de 1.° SHALL tener audio en la consigna y en las opciones. Se usa primero el audio capturado del referente, si dice lo mismo que el texto de MIDUHO; si no, voz propia grabada; y si no hay, la síntesis del navegador. Los efectos y la música SHALL tomarse del audio capturado cuando encajen con la escena; si no, de Kenney CC0 o de Gemini.

#### Scenario: Consigna sin pista equivalente
- **WHEN** ninguna voz capturada dice la consigna que escribió MIDUHO
- **THEN** la consigna queda sin `audioInstruccion` y suena con la síntesis, y el tablero del programa la lista como «voz por grabar» 🔶

### Requirement: Tablero del programa
`docs/investigacion/juegos-primero.md` SHALL listar las 26 actividades con:
- su DBA y sus referentes;
- el estado de cada paso del flujo: estudio, captura, diseño, construcción y verificación;
- los audios usados y sus licencias;
- lo que queda 🔶.

Al terminar cada fase, SHALL actualizarse también la bóveda (`10-Referentes-actividades/Juegos-alineados-DBA.md`) con el estado de cada referente.

#### Scenario: Fase terminada
- **WHEN** termina la fase 2
- **THEN** el tablero marca las 15 actividades como verificadas o dice qué falta en cada una

### Requirement: Verificación de cada actividad
Cada actividad SHALL pasar `npm test`, `npm run lint` y `npm run build`. Además SHALL tener:
- capturas a 1920×1080, 1440×900 y 390×844;
- un recorrido con la cuenta demo de 1.° (`scripts/demo-primero.ts`) en el que aparezca en «Mis materias» y se juegue completa con el teclado;
- la tabla de `design-game` cuando el tipo tenga escena.

Si el usuario no ha escuchado el audio, SHALL quedar marcado «por escuchar» en el tablero.

#### Scenario: Recorrido con la demo de 1.°
- **WHEN** se entra con el estudiante demo de 1.° a Ciencias naturales
- **THEN** aparece `vivo-o-no-vivo` y se puede completar solo con el teclado hasta ver el resultado
