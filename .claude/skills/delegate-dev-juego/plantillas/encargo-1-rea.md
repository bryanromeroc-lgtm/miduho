# Encargo 1 — Estudio con REA: «<título del referente>» (<juego>, tarea 3.N)

Usa la skill `.agents/skills/juego-referencia-codex/SKILL.md` (léela primero, y lo que ella manda leer).

## Contexto
- Actividad MIDUHO: `<juego>` · <Asignatura> · grado 1 · <DBA> · tipo previsto `<tipo>` (confírmalo o descártalo con evidencia).
- Personaje: <Guía>, <especie> (guía de <Asignatura> en `apps/web/src/lib/guias.ts`).
- Referente: <URL del portal> → juego real: <URL del iframe / juego> (plantilla, tema).
- <Si ya existe una presentación de la misma plantilla:> **Es la misma plantilla que <juego anterior>** (informe `docs/investigacion/referencia-<anterior>.md`, código `apps/web/src/features/actividades/juegos/<carpeta>/`). Céntrate en **qué cambia**: tema, contenido, voces, tiempos. No repitas lo comprobado: cítalo.
- La captura sonora YA está hecha por Claude: `content/referencias/<slug>/` (inventario.json, RESUMEN.md). Úsala para nombrar en qué evento suena cada efecto. No captures audio.

## Qué hacer (SOLO este paso)
1. Estudia el juego con REA siguiendo `.claude/skills/referencia-rea/SKILL.md`. Trabaja en `<scratchpad>/codex-<juego>/rea/` (instala REA ahí; Chrome aislado en el puerto 9333; nunca el 9222). Borra lo capturado al terminar.
2. Identifica: los ítems completos (texto, imagen, categoría o respuesta correcta), la disposición, la mecánica y los tiempos, la retroalimentación, y la tabla evento → id de pista del inventario.
3. Compara con el tipo y las presentaciones de MIDUHO (`apps/web/src/features/actividades/tipos/`, `juegos/`): ¿alcanza lo existente? ¿Qué faltaría (sonidos por tema, escena con el guía, voz)?
4. Anota con 🔶 los juicios pedagógicos para 1.° (terminología, ítems ambiguos, vocabulario colombiano). No decidas: propón.
5. Escribe el informe `docs/investigacion/referencia-<juego>.md` con palabras propias, con la sección «Inventario sonoro».

## No hagas
- No diseñes ni construyas. No toques `apps/web/`. No captures audio. No commit.

## Entrega
Escribe tu entrega (formato de la skill) en `<scratchpad>/codex-<juego>/entrega-1.md` y termina. Si REA o Chrome no arrancan, NO improvises otro método: escribe el error exacto y termina.
