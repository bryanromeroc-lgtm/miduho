# Referencia funcional: «Diferencias entre seres vivos y materia inerte» (Mundo Primaria, 1.º)

> Estudio de **mecánica** para la actividad `vivo-o-no-vivo` de 1.° (programa `juegos-primero`, NAT-1-03). No se copió código, imagen, texto, nombre ni personaje; lo capturado se borró al terminar. El **audio** se capturó aparte con `tools/captura-audio`, fuera de git, con permiso declarado (decisión del usuario del 2026-11-10).

- **Fecha:** 2026-11-10
- **Herramientas:** Playwright con un Chrome aislado (lectura del documento del juego); `tools/captura-audio` con el guion `guiones/mundo-primaria.mjs`.
- **Página observada:** https://www.mundoprimaria.com/juegos-educativos/natu-svi-1-1

## Hallazgo de autoría y acceso (observado)

- El juego es de **Mundo Primaria** y se sirve desde su propio dominio (`?path=juegos-premium/9019`). Currículo de **España** (1.º de Primaria, `og:locale es_ES`).
- La página exige un **muro de consentimiento**: «Aceptar todo» (publicidad con seguimiento, 258 socios) o «Rechazar y pagar». Un colegio no debería poner ese muro delante de niños de 6 años: es otra razón para adaptar y no enlazar.
- Con el navegador automático, tras aceptar, **el juego no terminó de cargar** (se queda en el cargador). La mecánica se describe desde el documento del juego y la ficha, **no se jugó** 🔶.

## Cómo está construido (observado en el documento del juego)

| Aspecto | Qué hay |
|---|---|
| Render | HTML con jQuery 1.10 y **jQuery UI** (arrastrar y soltar: `draggable`/`droppable`) |
| Niveles | **Dos juegos** («Juego 1», «Juego 2») en pestañas; el primero declara **4 niveles** en orden aleatorio, cada uno con 4 respuestas (`levelResults`) |
| Ritmo | 2 s de pausa entre niveles |
| Sonido | 4 efectos de retroalimentación: correcto, error, fin de nivel y fin del juego |
| Retroalimentación | Inmediata por respuesta, según la ficha («Cada respuesta recibe feedback inmediato… se pueden repetir») |
| Accesibilidad | Arrastre como única interacción (inferido de jQuery UI) 🔶 |

## Mecánica (inferida del código y de la ficha) 🔶

1. El niño arrastra cada elemento a su grupo (ser vivo / materia inerte).
2. Cada suelta suena: «correcto» o «error» (inmediato).
3. Al completar las 4 respuestas de un nivel suena «fin de nivel» y, a los 2 s, sale el siguiente.
4. Tras los 4 niveles suena «fin del juego».
5. Lo que trabaja (ficha): las características que diferencian a los seres vivos de los inertes: **nacen, crecen, se reproducen y mueren**.

## Qué le falta para evaluar y cómo lo resuelve MIDUHO

| Original | MIDUHO 🔶 |
|---|---|
| Muro de cookies o pago | Sin publicidad ni seguimiento |
| Arrastre | Tocar y elegir, con teclado |
| Currículo de España | Ítems del entorno de Madrid, Cundinamarca; DBA NAT-1-03 |
| No dice *por qué* | Cada acierto o error dice la razón con la función vital («la gallina nace, crece y se alimenta») |

## Qué se conserva y qué se hace propio

- **Se conserva:** retroalimentación inmediata con sonido distinto para acierto y error; tandas cortas (4 elementos por nivel) — en MIDUHO, 10 tarjetas en una sola tanda.
- **Propio:** todo lo demás.

## Inventario sonoro

Captura: `content/referencias/mundoprimaria-seres-vivos-1/` (audio fuera de git).

| id | Rol | Evento (inferido del código) | Duración |
|---|---|---|---|
| `37a2061a` | efecto | acierto (`ok.mp3`) | 0,14 s |
| `5893ccb7` | efecto | error (`error.mp3`) | 0,14 s |
| `ba6b6c82` | efecto | fin de nivel | 0,53 s |
| `ca93af0d` | efecto | fin del juego | 0,66 s |

- `ok` y `error` duran 0,14 s: demasiado cortos para medir su sonoridad (EBU R128 necesita 0,4 s) y quizá sean casi silencio 🔶 — por escuchar.
- **No capturado:** las voces o sonidos de cada nivel, si los hay, porque el juego no cargó en el navegador automático. Para completarlo: `node src/cli.mjs capturar … --manual 120` con una persona jugando 🔶.
- **Uso propuesto:** ninguno de estos cuatro como primera opción (los del tema de Wordwall son más claros y los efectos ya existentes de MIDUHO son CC0); quedan de respaldo 🔶.
