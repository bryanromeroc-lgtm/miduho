# Skills de terceros (instalación local, fuera de git)

Se copian a `.claude/skills/` pero están en `.gitignore`. 🔶 Sin validar en MIDUHO; léanse antes de usar.

| Skill(s) | Origen | Licencia | Uso previsto |
|---|---|---|---|
| `a11y-audit` | github.com/snapsynapse/skill-a11y-audit | MIT | Auditoría WCAG 2.1 AA (regla dura 3). Dependencias sin instalar: `a11y-audit/deps` (axe-core, puppeteer). |
| `k12-lesson-plan-creation`, `k12-lesson-differentiation` | github.com/anthropics/k12-teacher-skills | Apache 2.0 | Planes de clase y versiones por niveles. Usan estándares de EE. UU. (Learning Commons): adaptar a DBA/EBC del MEN. No se instaló su `.mcp.json` de terceros. |
| `adaptive-hint-sequence-designer`, `progressive-hint-ladder`, `productive-failure-*`, `formative-assessment-*`, `spaced-practice-scheduler` | github.com/GarethManning/education-agent-skills v3.1.0 | CC BY-SA 4.0 | Pistas, fracaso productivo, evaluación formativa. **No copiar sus textos al repo** (atribución + compartir igual). `spaced-practice-scheduler` exige historial por estudiante: 🔶 no usar aún (regla 1, matrícula fuera de alcance). |
| `game-feel` | github.com/gamedev-skills/awesome-gamedev-agent-skills (`skills/disciplines/game-feel`) | Apache 2.0 | Retroalimentación («juice») de acciones. Ejemplos en Godot/Unity: se leen vía `juegos-2d-miduho`. |
| `design-game` | github.com/opusgamelabs/game-creator (`skills/design-game`) | MIT (README y SKILL; `package.json` dice ISC) | Auditoría visual de un juego existente. Pensada para Phaser: se lee vía `juegos-2d-miduho`. |

`juegos-2d-miduho` es propia de MIDUHO y sí se versiona: adapta las dos anteriores sin modificarlas.

Referencia (no es skill, no se instala): GamED-AI (MIT) clonado en `~/Documentos/DEVS/referencias/GamED-AI`.


`/crear-juego` (en `.claude/commands/crear-juego.md`) es propio y versionado: orquesta estas skills con el adaptador `juegos-2d-miduho`.

`simuladores-miduho` (skill) y `/crear-simulador` (comando) también son propios y versionados: diseño de simuladores con laboratorio y retos, a partir del estudio de PhET y Toy Theater.
