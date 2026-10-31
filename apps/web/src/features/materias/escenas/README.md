# Escenas y avatares de «Mis materias» — procedencia

Todo lo que hay en `sprite.ts` es **ilustración vectorial de autoría propia** del proyecto MIDUHO. No se generó con IA, no se calcó y no viene de bancos de imágenes.

| Pieza | Id del sprite | Origen |
|---|---|---|
| 10 escenas de materia (lectura, matemáticas, naturales, inglés, robótica, emprendimiento, ética, artística, física, sociales) | `escena-<materia>` | Dibujadas a mano en SVG para la maqueta aprobada v11 del 2026-10-31 (`openspec/changes/rediseno-identidad-juvenil/referencia/maqueta-mis-materias.dc.html`) y migradas aquí sin cambios de dibujo. Solo cambiaron los ids (`o-*` → `escena-*`) y la clase del engranaje (`gira` → `escena-gira`). |
| Escena genérica (mochila, lápiz y estrella) | `escena-generica` | Dibujada para este cambio, en el mismo estilo, para asignaturas sin escena propia. |
| 4 avatares: Casita, Pino, Gota de río y Sol | `avatar-<nombre>` | Personajes originales derivados del escudo del colegio (la casa, el pino, el río y el sol) y de su paisaje. **Provisionales** hasta que el colegio los apruebe. |

## Reglas

- Colores tomados de las rampas del escudo y de la tinta de contorno `#1b2440`. Los literales viven aquí porque son ilustración.
- Estilo sticker: contorno de tinta, plano, con brillos y sombras; sin 3D ni emoji.
- Ningún personaje, logo ni dibujo de las plataformas de referencia (Lingokids, Khan Academy Kids, Duolingo ABC, Smile and Learn, Smartick, «Phonic Zoom»). Inglés usa un loro y globos de diálogo, no banderas de otros países.
- Son decorativas: se pintan con `aria-hidden="true"`. Ningún texto pedagógico vive dentro de una escena.
- El escudo (`public/images/escudo-colegio.jpg`) es la marca institucional y no forma parte de este sprite.
