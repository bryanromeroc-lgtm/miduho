## Why

La vista de materia (`vistas-de-materia`) ya muestra las actividades de cada asignatura, pero no había ninguna actividad ni un lugar para jugarla: «Jugar» abría «Esta actividad se abre pronto». El operador pidió (2026-10-31) unas cinco actividades por materia, entre juegos y cuestionarios, **ya jugables**, y que se investigara qué otros tipos aplican a una plataforma de primaria como esta.

`fundacion-actividades` definió el contrato de tipos (D3), el catálogo planeado (D4) y el currículo en git (D1), y dejó la UI para este cambio. Su modelo de datos (asignaciones, intentos, resultados) aún no existe.

## What Changes

- **Nueve tipos implementados** con el contrato de D3 (esquemas Zod y calificación pura por ítem): los siete de D4 más `sopa-letras` y `palabra-secreta`, añadidos por la investigación (`docs/actividades/tipos.md`).
- **Reproductor** en `/materias/[asignatura]/actividades/[id]`: el mismo mundo plano de la materia, un juego por tipo, resultado con estrellas y repaso de respuestas.
- **55 actividades de 5.°** (cinco por asignatura) en `apps/web/curriculo/actividades/`, de redacción propia, validadas por prueba.
- **Práctica libre** 🔶: mientras no existan las asignaciones de la docente, la vista de materia muestra el currículo de la asignatura y el grado del grupo «para jugar», sin límite de intentos, y nada se guarda. La pantalla lo dice.
- La tarjeta admite `intentosMax: null` (práctica libre) y dice el tipo de juego.

## Capabilities

### New Capabilities
- `reproductor-actividades`: jugar una actividad de la materia y ver su resultado.
- `curriculo-actividades`: archivos de actividad en git, validados y servidos por asignatura y grado.

### Modified Capabilities
- `tarjeta-actividad-materia` (`vistas-de-materia`): estado de práctica libre.

## Impact

- `apps/web/src/features/actividades/{tipos,reproductor}/`, `apps/web/src/server/modules/curriculo/`, adaptador `actividadesDeCatalogo` en `materias/puertos.ts`.
- `next.config.ts`: `outputFileTracingIncludes` lleva `curriculo/**/*.json` a la salida standalone.
- Sin migraciones. Al llegar `fundacion-actividades` 5.8, el adaptador de práctica libre se reemplaza por el de «mis actividades» y la calificación pasa al servidor.
