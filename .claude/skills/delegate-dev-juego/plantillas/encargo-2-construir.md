# Encargo 2 — Construir «<título>»: `<tipo>` + <presentación>

Usa la skill `.agents/skills/juego-referencia-codex/SKILL.md` y `.claude/skills/juegos-2d-miduho/SKILL.md` (estándar aprobado: personaje ~⅓ del alto de la escena, escena en 4 tiempos, poses sincronizadas). El usuario YA aprobó el diseño (<fecha>): construye. Tu informe: `docs/investigacion/referencia-<juego>.md`.

## Qué aprobó el usuario
1. <Presentación: reutilizar / variante / nueva, y cómo debe jugar>.
2. <Categorías o estructura, con sus nombres exactos>.
3. <Contenido: lista exacta de ítems con su categoría o respuesta>. `explicacion` corta de 1.°, español de Colombia, sin nombres de niños.
4. Calificación: <la existente del tipo, sin cambios / la aprobada>.

## Contratos
- **Esquema:** <campos nuevos, todos opcionales y genéricos>. Pruébalos en `tipos/tipos.test.ts`. El contenido antiguo sigue siendo válido.
- **Audio (ya adaptado por Claude):** `/audio/juegos/<carpeta>/` → <archivos por evento>. No inventes efectos que el original no tiene.
- **Imágenes (Claude las genera; úsalas como contrato aunque aún no existan):** `/images/juegos/<juego>/` → <lista>, `<guia>-{reposo,senala,duda}.webp` (lienzo común, fondo transparente), `portada.webp`. Texto pedagógico en HTML, nunca dentro de imágenes; `alt=""` si el texto ya está en el mismo botón.
- **Escena con <Guía>:** `escena` opcional con la forma de `juegos/comun/escena.ts`. Guía grande, sin tapar piezas ni controles; reducido o fuera en teléfono. `reposo` en juego, `senala` al acertar, `duda` al fallar, sincronizadas con el efecto. `prefers-reduced-motion` sin desplazamientos.
- **Lectura automática de la consigna en 1.°** (`useLecturaAutomatica`, vía `ContextoActividad`) cuando hay escena; «Escuchar» en cada pieza (con `lectura` si el texto tiene «/a»).
- **Voces (las generas tú, con Gemini TTS):** sigue `/home/bryan/Documentos/DEVS/miduho/.claude/skills/voces-gemini/SKILL.md` (voz `es-419-tutor-3`). Escribe primero el JSON y luego corre, siempre con `bash -ic` (tu entorno no hereda la clave; nunca la imprimas): `bash -ic "node /home/bryan/Documentos/DEVS/miduho/tools/voz-gemini/voz.mjs actividad <ruta absoluta del JSON en el worktree> --solo instruccion,<ids> --sin-respaldo"` (`--sin-respaldo`: solo la voz aprobada; sin él cae en otro modelo con otra voz, como pasó en zoo-de-silabas). Prueba antes con `--simular`. <Qué voces generar y cuáles reutilizar>. Si el cupo se acaba en todos los modelos, no inventes otra vía: déjalo anotado. En la entrega: cada frase, archivo, modelo y voz.
- **Actividad:** `apps/web/curriculo/actividades/<asignatura>/1/<juego>.json` (título, grado 1, tema con el DBA, instrucción corta para 1.°, `imagen` = portada). Registra la actividad donde se registren las demás.
- **OpenSpec:** delta `openspec/changes/juegos-primero/specs/<capacidad>/spec.md` (ADDED con escenarios, incluido «sin el campo nuevo se comporta como antes»), `proposal.md`, fila de `specs/juegos-primero/spec.md`. En el informe, sección «Adaptación aprobada».

## Cláusulas fijas (no las quites)
- **Genérico:** nada del contenido (nombres, categorías, guía) en el código. Todo comportamiento nuevo depende de datos genéricos (p. ej. `escena.personaje`), nunca de un valor concreto (`tema === "x"`, `slug === "y"`). Sin el campo nuevo, los juegos existentes que comparten presentación se ven, suenan y juegan **exactamente igual**.
- Reutiliza, no dupliques: si algo de otro tablero sirve tal cual, extráelo a `juegos/comun/` sin cambiar su comportamiento. Reglas del reproductor en `reproductor/reglas.ts` (con pruebas); «Jugar otra vez» igual para todos.
- Barajado: un solo flujo `generador(semilla)`; nada de `barajar(x, \`${semilla}:${id}\`)` por elemento (sale sesgado).
- **No toques `apps/web/prisma/seed.ts`** ni scripts de demo (la cuenta de 1.° la prepara Claude). No marques la tarea en `tasks.md` ni toques `docs/investigacion/juegos-primero.md`. No commit.

## Al terminar
- `npx vitest run src/features/actividades` (en `apps/web`), `npm run lint` y `npm run build` (raíz del worktree). Las de integración las corre Claude.
- Página temporal `apps/web/src/app/prueba.<x>/page.tsx` (carpeta con punto) que renderice la actividad con el reproductor (y, si comparte presentación, la anterior con `?juego=<otra>`). NO la borres. Servidor en `apps/web`, puerto 3124, `localhost`.
- Capturas a 1920×1080, 1440×900 y 390×844 en `<scratchpad>/codex-<juego>/capturas/` (inicio, a medias, acierto/fallo o revelado, final) y una de control del juego que comparte presentación. Una partida completa solo con teclado.
- Apaga tu servidor **por PID** (nunca `pkill -f`/`pgrep -f` con un patrón que aparezca en tu propio comando).
- Entrega en `<scratchpad>/codex-<juego>/entrega-2.md` (formato de la skill).
