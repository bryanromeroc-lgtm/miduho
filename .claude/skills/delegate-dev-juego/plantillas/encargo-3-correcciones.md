# Encargo 3 — Correcciones de supervisión (ronda 1): <juego>

Usa la skill `.agents/skills/juego-referencia-codex/SKILL.md`. Claude revisó tu diff, corrió `npm test` completo (<N> pruebas en verde, con PostgreSQL) y <jugó / revisó tus capturas>. Funciona y no debes romper: <lista concreta de lo que está bien>. Corrige:

1. **<Problema>** (<archivo>): <qué pasa, por qué está mal, qué se espera>. <Prueba que debe acompañar el arreglo>.
2. …

(Una corrección por punto, con el criterio de aceptación. Si revertiste algo, dilo y explica por qué: «Revertí X. No lo vuelvas a tocar.»)

## Al terminar
- `npx vitest run src/features/actividades` (en apps/web), `npm run lint`, `npm run build` (raíz). No borres la página temporal.
- Capturas nuevas en `<scratchpad>/codex-<juego>/capturas-2/` (las vistas afectadas, más la de control). Partida con teclado. Apaga tu servidor por PID.
- Entrega en `<scratchpad>/codex-<juego>/entrega-3.md`. No commit.
