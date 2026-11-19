---
name: delegate-dev-juego
description: Proceso delegado para desarrollar juegos educativos de MIDUHO desde una referencia web. Claude captura el audio, genera las imágenes con Gemini, supervisa y cierra; Codex estudia la referencia con REA y construye. Úsala cuando el usuario diga "sigamos con el siguiente juego", "mismo reparto", "delega en Codex", "delegate-dev-juego" o pida un juego del programa juegos-primero (tareas 3.x de openspec/changes/juegos-primero/tasks.md).
---

# Desarrollo delegado de juegos (Claude supervisa, Codex construye)

Reparto aprobado por el usuario el 2026-11-17 y probado en `los-meses-del-anio`, `antes-y-ahora` y `como-se-siente`. El flujo de fondo (fases, reglas del audio, estándar de juegos) está en `.claude/commands/crear-juego-referencia.md`. Esta skill dice **quién hace cada fase y cómo se delega**.

| Quién | Hace |
|---|---|
| **Claude** | Leer la tarea, capturar el audio, decidir con el usuario, adaptar el audio, generar imágenes con Gemini, escribir los encargos, revisar el diff y las capturas, verificar (pruebas con PostgreSQL y una partida en el navegador) y cerrar |
| **Codex** (CLI) | Estudio con REA, informe, construcción (esquema, lógica + pruebas, interfaz, JSON, delta OpenSpec), **voces con Gemini TTS** (skill `voces-gemini`, desde 2026-11-18) y correcciones. Su papel está en `.agents/skills/juego-referencia-codex/SKILL.md` |
| **Gemini** | Imágenes. Las pide Claude (`.claude/skills/gemini-media/`) |
| **Usuario** | Elige el diseño y el contenido, escucha el audio, valida y decide los commits |

## Reglas que no se negocian

- **No lances Codex ni empieces otro juego sin que el usuario lo pida.** «Sigamos con el siguiente» autoriza ese juego completo, con el mismo reparto; nada más.
- **Commit y push solo si el usuario lo pide**, y solo con archivos propios: hay sesiones paralelas. Separa los commits por juego.
- **El personaje del juego es la guía de su asignatura** (`apps/web/src/lib/guias.ts`): Sociales → Andi, Ética → Ciro, Naturales → Dora, Lectura → Bruno, Matemáticas → Armi, Inglés → Maca, Robótica → Tito.
- Aplican las reglas duras de `AGENTS.md`: sin datos de menores, WCAG 2.1 AA, 🔶 en lo no confirmado y español de Colombia.
- **Claude supervisa, no reescribe.** Si algo está mal, devuélvelo a Codex en un encargo de correcciones. Arreglar algo menor por tu cuenta está bien, pero dilo.
- Da avances cortos al usuario entre fases.

## Preparación (una vez por rama de juegos)

- Trabaja en un worktree (p. ej. `../miduho-meses`, rama `feat/juego-…`). Para `node_modules`, usa `cp -al` desde el repo principal: Turbopack rechaza los enlaces simbólicos.
- Scratchpad por juego: `<scratchpad>/codex-<juego>/`, con los encargos, las entregas, los registros, `capturas/`, `gemini/`, `recursos.md` y `jugar.cjs`.
- Lanzar Codex siempre **en segundo plano**, con el encargo por stdin:
  ```bash
  /usr/lib/chatgpt/resources/codex exec --skip-git-repo-check -s workspace-write \
    -c sandbox_workspace_write.network_access=true --add-dir /tmp/claude-1000 \
    -C <worktree> - < <scratchpad>/codex-<juego>/encargo-N-<paso>.md > <scratchpad>/codex-<juego>/codex-N.log 2>&1
  ```
  No consultes su salida mientras corre: el aviso de fin llega solo. Luego lee `entrega-N.md`.
- El sandbox de Codex **no llega al PostgreSQL** (:5433). Las pruebas de integración las corre Claude.

## Fases

### 0. Leer la tarea (Claude)
- Busca la fila en `openspec/changes/juegos-primero/tasks.md` y en el tablero `docs/investigacion/juegos-primero.md`.
- Toma la URL de la referencia de `docs/investigacion/catalogo-juegos/juegos-alineados-dba.json` (busca por título).
- Mira qué hay ya en `apps/web/curriculo/actividades/<asignatura>/1/` y en `apps/web/src/features/actividades/juegos/`.
- **Si es Wordwall (Cokitos lo incrusta), lee el `templateId` del `iframe`.** Puede que la presentación ya exista y el trabajo sea solo un tema y una escena:

  | `templateId` | Plantilla | Presentación en MIDUHO |
  |---|---|---|
  | 2 | «Agrupar» | `clasificar` + `tablero` (`juegos/agrupar/`, temas `girasol` y `corcho`) |
  | 46 | Cinta con fichas | `emparejar` + `cinta` (`juegos/cinta/`) |
  | 50 | «Orden correcto» | `ordenar` + `casillas` (`juegos/casillas/`) |

### 1. Captura sonora (Claude, siempre)
- Herramienta: `tools/captura-audio/` (ver su README).
  ```bash
  cd tools/captura-audio && node src/cli.mjs capturar "<URL>" --slug <plataforma>-<juego> --guion guiones/<plataforma>.mjs
  node src/cli.mjs inventariar <slug> && node src/cli.mjs resumen <slug>
  ```
- Completa `content/referencias/<slug>/LICENCIA.md`. Puedes copiar la de una captura anterior de la misma plataforma, p. ej. `cokitos-meses-del-anio`.
- Marca lo que no es del juego. En Wordwall, `test1.mp3` y `data-0.mp3` son del motor.
- **Mundo Primaria:**
  - La captura trae unas 58 pistas de anuncios. Filtra `audio/captura.json` a `mundoprimaria.com` y vuelve a inventariar; `inventariar` reconstruye desde ese archivo.
  - Corrige `autor_dominio`.
  - Si hay varios juegos en la página, compara los efectos por sha256.

### 2. Estudio con REA (Codex) → plantilla `plantillas/encargo-1-rea.md`
- Un solo paso: estudio e informe `docs/investigacion/referencia-<juego>.md`. Codex no construye ni captura audio.
- Pide los ítems completos del original, la tabla evento → id de pista y la comparación con la presentación existente. También juicios pedagógicos marcados 🔶, sin decidir.
- **Mundo Primaria:**
  - No carga sin interfaz. Abre tú un Chrome con ventana en el 9333, con el entorno limpio de `tools/gemini-media/abrir-chrome.sh` (`env -u GTK_PATH -u GIO_MODULE_DIR …`), lanzado con `setsid nohup`, y dile a Codex que se conecte por CDP.
  - «Aceptar todo» está dentro de un `iframe` del CMP.
  - Los anuncios recargan la página, y bloquearlos impide que el juego arranque. **Lee el HTML servido** (`…/juegos-educativos/<id>?path=juegos-premium/<n>`): trae todas las rondas y `data-accept` por recuadro.

### 3. Decisiones con el usuario (Claude)
- Con el informe, pregunta con AskUserQuestion, con 2–4 opciones y la recomendada primero:
  - la presentación: reutilizar la existente, añadirle una variante o crear una nueva;
  - el contenido: el del original, depurado o reducido;
  - los nombres de las categorías;
  - las imágenes y quién aparece en ellas.
- **Si cambias el contenido, muestra la lista final y espera el visto bueno antes de construir.**
- Criterios para 1.°:
  - pocas tarjetas (6–12), cada una con imagen y «Escuchar»;
  - nada ambiguo sin contexto;
  - lenguaje socioemocional actual, p. ej. «agradables/desagradables» y no «positivas/negativas»;
  - vocabulario colombiano (enojado, no enfadado; carro, computador).

### 4. Recursos (Claude), en paralelo con la construcción
- **Audio:**
  ```bash
  node src/cli.mjs adaptar <slug> <id…> --destino apps/web/public/audio/juegos/<carpeta> --nombre a.mp3,b.mp3,…
  ```
  Si la presentación ya existe, usa una carpeta propia del tema con **los mismos nombres de archivo** que la original. Así el contrato no cambia.
- **Imágenes con Gemini** (`node tools/gemini-media/gemini.cjs generar --modo imagen --prompt-file p.txt --ref <ref> --salida x.jpg`, Chrome en el 9222):
  1. Guía en reposo, de cuerpo entero sobre blanco, con `images/guias/<asignatura>.webp` como referencia. Describe sus rasgos en el prompt y pide «sin objetos».
  2. Poses `senala` y `duda`, con el reposo como referencia. Recórtalas en un lienzo común:
     ```bash
     python3 tools/gemini-media/recortar-pose.py pose.jpg <dest>/<guia>-<pose>.webp --como <dest>/<guia>-reposo.webp
     ```
  3. Elementos: **dos por generación** (2:1, separados por blanco). Córtalos por la mitad, recorta lo blanco, céntralos en un cuadrado de 320×320 y guárdalos en webp. Revísalos todos en una hoja de contacto antes de seguir.
  4. Portada 16:9 a 1280 px, sin texto.
  5. Anota en `recursos.md` cada archivo con la URL de su conversación de Gemini.
  - Rutas: `apps/web/public/images/juegos/<juego>/`. Pásalas a Codex como contrato aunque todavía no existan.

### 5. Construcción (Codex) → plantilla `plantillas/encargo-2-construir.md`
- El encargo lleva lo que aprobó el usuario, los contratos (esquema, rutas de audio e imagen, escena, JSON) y lo que hay que reutilizar.
- Incluye siempre las cláusulas fijas de la plantilla. Sin ellas, Codex vuelve a cometer los mismos errores:
  - todo genérico, dependiente de datos;
  - no tocar el seed;
  - no marcar la tarea;
  - página temporal en carpeta con punto;
  - puerto 3124 en `localhost`;
  - apagar el servidor por PID;
  - no hacer commit.

### 5b. Voces (Codex, dentro del encargo de construcción)
- Codex lee `/home/bryan/Documentos/DEVS/miduho/.claude/skills/voces-gemini/SKILL.md` y corre la herramienta del repo principal con el JSON del worktree: `bash -ic "node /home/bryan/Documentos/DEVS/miduho/tools/voz-gemini/voz.mjs actividad <json> [--simular] --solo instruccion,<ids>"`. Su sandbox filtra variables con `KEY`: la clave solo llega con `bash -ic`. Nunca la imprime.
- Lanza Codex con `--add-dir /home/bryan/.cache/miduho-voz` (estado del cupo).
- Si las opciones reutilizan voces existentes, `--solo` y `audioOpciones` a mano; si no, la herramienta genera todo.
- En la entrega: frases, modelo y voz de cada una. Claude no oye el audio: el usuario escucha.

### 6. Supervisión (Claude) → plantilla `plantillas/encargo-3-correcciones.md`
Revisa el diff (`git diff`, `git status`) y las capturas de Codex, y busca:
- **Comportamiento atado a un caso:** `tema === "corcho"`, textos del juego en el componente, nombres de categorías dentro del código. Lo nuevo debe depender de datos genéricos, p. ej. `escena.personaje`.
- **Arreglos sueltos en el reproductor:** las reglas van en `reproductor/reglas.ts` y «Jugar otra vez» es igual para todos.
- **Barajados por subsemilla** (`barajar(x, \`${semilla}:${id}\`)`): con semillas casi iguales salen sesgados. Usa un solo `generador(semilla)` y una prueba de reparto.
- **Cambios fuera de alcance:** `prisma/seed.ts`, juegos ajenos, archivos de otras sesiones. Reviértelos si el diff es todo de Codex.
- **Accesibilidad:** `alt` que repite el texto del mismo botón («Feliz Feliz»); contraste; foco.
- **Teléfono (390×844):** el guía no debe tapar controles; las palabras no se parten; no hay desborde horizontal.
- **Imágenes:** que tengan tamaño suficiente para quien aún no lee.
- **Que lo anterior no cambie:** pide una captura de control del juego que comparte la presentación.

Devuelve todo en **un** encargo de correcciones numerado. Por lo general basta una ronda.

### 7. Verificación (Claude)
1. `npm test` en el worktree, con el PostgreSQL de desarrollo arriba (`docker compose -f docker-compose.dev.yml up -d`).
2. Partida en el navegador con `playwright-core` (`tools/captura-audio/node_modules`), un guion `jugar.cjs` y el servidor en 3124 sobre la página temporal:
   - haz dos fallos a propósito y comprueba el puntaje esperado;
   - comprueba las poses del guía (`img[data-pose][data-visible]`);
   - comprueba que no haya imágenes rotas ni errores de consola;
   - el `aria-pressed` de los botones de sonido y voz no es de las piezas: fíltralo.
3. **Apaga el servidor por PID en una llamada aparte** (`ss -ltnp | grep 3124` y luego `kill <pid>`). Nunca uses `pkill -f` ni `pgrep -f` con un patrón que aparezca en el mismo comando: matan tu propia shell (exit 144).
4. Borra la página temporal (`apps/web/src/app/prueba.<x>/`) y `apps/web/.next/dev`.
5. Corre `npm run lint` y `npm run build`.

### 8. Cierre (Claude)
- Marca `[x]` en la tarea de `tasks.md`, con una nota de lo que decidió el usuario y el registro.
- Pon la fila del tablero en «hecho», con sus 🔶.
- Escribe el registro `docs/software-factory/inc-3-juegos-primero-<juego>.md` desde `plantillas/registro-incremento.md`.
- **Asignatura nueva en 1.°:** añádela a la lista fija `ASIGNATURAS` de `apps/web/scripts/demo-primero.ts`. Ese script no lee `prisma/asignaturas-curriculo.ts`. Luego córrelo con `npx tsx scripts/demo-primero.ts`, que regenera e imprime la contraseña de `estudiante.primero@miduho.test`.
- Guarda las lecciones nuevas en la memoria `reparto-claude-codex-juegos`.
- Informe al usuario:
  - qué se construyó;
  - la verificación con cifras;
  - qué corregiste de Codex;
  - los pendientes 🔶: escuchar los efectos, el recorrido con `demo-primero`, la validación docente, las voces por grabar y el soporte del permiso.
- Pregunta si hace commit (separado por juego) y si sigue con el próximo juego.

## Mostrar los juegos al usuario
- Corre `npx tsx scripts/demo-primero.ts` desde el worktree.
- Levanta `npx next dev -p 3000` en `<worktree>/apps/web`, en segundo plano; `AUTH_URL` espera el 3000.
- Cuentas:
  - estudiante de 1.° (los juegos están en «Mis materias» → «Para jugar»), con la contraseña que imprime el script;
  - admin `admin@miduho.test`, con `SEED_ADMIN_PASSWORD` del `.env` del repo principal.
- Antes de dar las cuentas, comprueba el ingreso con Playwright.
