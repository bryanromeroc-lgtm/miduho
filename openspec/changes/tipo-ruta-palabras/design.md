## Context

Mecánica estudiada con REA: tres carriles, carteles que se acercan, voz a los 1,5 s, el contacto decide, pista tras errores, impulso tras aciertos seguidos. MIDUHO ya tiene el contrato de tipos, `useRondas` (error que enseña) y la escena de acción de `golpea/` y `robots/`.

## Goals / Non-Goals

**Goals:** misma sensación de juego; evaluable y recalificable en servidor; estándar aprobado (personaje ~⅓ del alto, escena en 4 tiempos, poses, cámara, música aparte); WCAG 2.1 AA.

**Non-Goals:** rivales, podio y desbloqueo de personajes de la referencia; otras variantes del audio (números, artículos); guardar intentos (llega con 5.2).

## Decisions

1. **Banco de palabras propio (`palabras.ts`)** con las palabras que tienen audio: `{ palabra, silabas, audio }`. La docente configura sílabas (2, 3, 4 o mixtas ascendentes); no escribe ítems. Las sílabas se declaran a mano (no se infieren). Se excluyen artículos y palabras sueltas sin sentido léxico (el, la, los, al, mis, que, un, una).
2. **Generador puro** con `generador()` de `contrato.ts`; la semilla viene del contenido y del ritmo (cada ritmo da su propio juego). Distractores en orden de preferencia: (1) misma sílaba inicial y misma longitud, (2) una sola letra distinta, (3) misma cantidad de sílabas. La palabra correcta no se repite en 6 rondas, y el carril correcto no se repite seguido (como la referencia).
3. **Respuesta = lista de hasta 2 carriles/palabras tocadas** (palabras, no carriles: el carril depende de la ronda). `useRondas` guarda solo la primera; el juego lleva su registro y lo entrega al terminar.
4. **Carteles como `<button>`** en tres carriles **horizontales** (Armi se ve de lado; los carteles llegan por la derecha y Armi se invierte con CSS para mirar a la derecha). Armi cambia de carril con ↑/↓ o al elegir un cartel; Enter/Espacio elige el carril ocupado; 1/2/3 eligen directo. Se puede elegir desde que el cartel ha avanzado el 30 %. Alternativa canvas → descartada (texto en HTML, regla 3).
5. **Ritmo:** el avance de los carteles lo mueve un bucle `requestAnimationFrame` pausable que escribe una variable CSS (`--p`) en el contenedor (sin re-render por cuadro). En *tranquilo* los carteles llegan en ~2 s y esperan. En *carrera* llegan en ~6 s; al llegar a Armi, contacto automático con el carril ocupado. Tras el primer fallo de una ronda, los dos carteles restantes esperan (sin contacto automático).
6. **Escena de acierto (~1700 ms, `data-escena="acierto"`):** Armi se agacha y se inclina (anticipación) → se lanza hacia el cartel con la pose de impulso → impacto con pausa de ~130 ms: el cartel se abre en estrella y chispas, «¡PLAF!», temblor de `.camara` → recuperación. **Fallo (~900 ms):** Armi duda (pose mareada), el cartel se apaga y queda tachado; sin temblor.
7. **Poses de Armi:** en bicicleta (guardia), impulso (acción/celebración) y mareado (fallo suave), con Gemini usando la guardia como `--ref` y encajadas con `recortar-pose.py`. Cartel vacío, fondo y portada con Gemini; el texto va en HTML.
8. **Alternativa al audio (WCAG 1.2.1):** botón «Mostrar la palabra escrita» que escribe la palabra buscada en el panel. Es decisión del estudiante o la docente; 🔶 validar si afecta la evaluación.
9. **Audio:** voces de palabras = archivos entregados, convertidos a MP3 mono normalizado, uno por palabra, cargados con `Audio`/Web Audio al comenzar la ronda. Efectos de impacto/acierto/error CC0 (Kenney) con `LICENCIAS.md`; música propia con Gemini en botón aparte. Las frases de `voces/` no se usan hasta que alguien las escuche 🔶; las instrucciones van escritas.
10. **Registro** en los cuatro lugares; `reglas.ts`: «primera respuesta cuenta».

## Risks / Trade-offs

- [Licencia de las voces pendiente] → `LICENCIA.md` en estado pendiente, dicho en el cierre; no se publican fuera de pruebas hasta adjuntar el soporte.
- [Autoplay de audio bloqueado] → la voz se pide desde el gesto de «Jugar» y con el botón «Escuchar otra vez».
- [Armi en bicicleta no sale igual entre poses] → una regeneración; si no, pose resuelta con CSS y declarada.
- [Voz sintetizada vs grabada] → la lectura de la palabra es la grabada entregada; no se usa síntesis.

## Open Questions

- 🔶 Grado (1.°) y asignatura (Comprensión lectora): validar con la docente.
- 🔶 Lo que dicen `prompt1–3`, `promptFinal` y `title`.
- 🔶 Ritmo por defecto «tranquilo».
