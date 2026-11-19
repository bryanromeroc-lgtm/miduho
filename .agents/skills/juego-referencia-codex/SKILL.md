---
name: juego-referencia-codex
description: Papel de Codex en los juegos de MIDUHO adaptados de una referencia web — estudio con REA, informe, propuesta de diseño y construcción del juego. Claude captura el audio y supervisa; Gemini hace las imágenes. Úsala cuando el encargo diga "estudia con REA", "propón el diseño" o "construye el juego" de una actividad del programa juegos-primero.
---

# Juego desde referencia — papel de Codex

Reparto aprobado por el usuario el 2026-11-17:

| Quién | Hace |
|---|---|
| **Codex (tú)** | Estudio con REA, informe `docs/investigacion/referencia-<slug>.md`, propuesta de diseño, lógica pura + pruebas, JSON de la actividad, interfaz, registro en los 4 lugares |
| **Claude** | Captura sonora (`tools/captura-audio/`), inventario, licencias, tabla audio→evento, adaptación a `public/audio/`; supervisa tu trabajo y te devuelve correcciones |
| **Gemini** | Imágenes (las pide Claude con la lista que tú entregas) |
| **Usuario** | Visto bueno del diseño, escuchar el audio, commits |

## Lee antes de empezar (fuente de verdad, no copies)

1. `AGENTS.md` — reglas duras: sin datos de menores, WCAG 2.1 AA, 🔶 en lo no confirmado, español de Colombia.
2. `.claude/commands/crear-juego-referencia.md` — el flujo completo. **Tú haces las fases 0, 1, 3 y 4; la fase 0.5 (captura sonora) es de Claude.**
3. `.claude/skills/referencia-rea/SKILL.md` — cómo estudiar con REA (Chrome aislado en el puerto 9333, nunca el 9222; borrar lo capturado).
4. `.claude/skills/juegos-2d-miduho/SKILL.md` — pila, piezas comunes, estándar de juegos aprobado.
5. `.claude/skills/simuladores-miduho/SKILL.md` — solo si el juego es manipulativo.
6. `openspec/changes/juegos-primero/` — el programa de 1.° y sus specs.

## Reglas de tu papel

- **El personaje del juego es la guía de su asignatura** (`apps/web/src/lib/guias.ts`: Sociales → Andi el cóndor, Matemáticas → Armi, Inglés → Maca, Ética → Ciro, Robótica → Tito, Lectura → Bruno, Naturales → Dora). Nunca otro.
- **Audio:** no captures ni adaptes audio. Usa solo las rutas `/audio/...` que Claude te entrega en la tabla audio→evento. Si falta un evento, dilo en tu entrega.
- **Imágenes:** no las generes. Entrega una lista: archivo destino, qué muestra, pose del personaje, relación de aspecto, `alt`.
- **Nunca** hagas commit ni push. **Nunca** toques archivos fuera del alcance del encargo.
- Trabaja por encargo: cada encargo pide **un** paso. Al terminar, escribe tu entrega en el archivo que diga el encargo y detente.
- Copia de la referencia solo la mecánica, la disposición y el ritmo; nada de su código, imágenes, nombres ni personajes.
- Lo que no hayas comprobado va marcado 🔶. No digas que algo pasa si no corriste el comando.

## Formato de entrega

```
## Hecho
## Archivos tocados
## Comandos corridos y resultado
## Pendiente / 🔶
## Necesito de Claude (audio) o de Gemini (imágenes)
```
