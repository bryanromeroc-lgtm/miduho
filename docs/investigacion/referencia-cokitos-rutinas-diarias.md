# Referencia funcional: «Rutinas diarias» (Cokitos → Wordwall)

> Estudio de **mecánica** para la actividad `mi-dia-en-orden` de 1.° (programa `juegos-primero`, SOC-1-03). No se copió código, imagen, texto, nombre ni personaje; lo capturado con REA y Playwright se borró al terminar. El **audio** se capturó aparte con `tools/captura-audio` y queda fuera de git, con permiso declarado (decisión del usuario del 2026-11-10).

- **Fecha:** 2026-11-10
- **Herramientas:** REA 6.8.0 (`inspect-web-page` sobre un Chrome aislado en el puerto 9333), Playwright para jugar y medir, `tools/captura-audio` para el audio.
- **Página observada:** https://www.cokitos.com/juego-de-rutinas-diarias/ → `…/play/`.

## Hallazgo de autoría (observado)

Cokitos **no aloja el juego**: lo incrusta desde **wordwall.net** (actividad «Rutinas Diarias», plantilla de Wordwall con cinta y fichas —`templateId` 46—, tema de corcho `cork2`, motor 1.0.8, de un usuario de Wordwall cuya identidad no se confirmó 🔶). Motor, tema y efectos son de Wordwall; las imágenes y las 18 frases son del autor de la actividad.

## Hallazgo importante: **no es de ordenar**

El nombre de la actividad de MIDUHO («mi día en orden», tipo `ordenar`) venía de la ficha, pero lo que se juega es **relacionar una imagen con la acción que muestra**. Nunca se pide poner las rutinas en secuencia. Es una mecánica de «quiz de relacionar» (imagen → ficha de texto), parecida a `emparejar` pero de una pareja a la vez.

## Cómo está construido (observado)

| Aspecto | Qué hay |
|---|---|
| Render | Un solo **canvas** a pantalla completa; los datos vienen del motor, no hay texto en el DOM |
| Contenido | 18 acciones de la rutina diaria (ficha de texto) y, para cada una, una imagen |
| Tema | Corcho: una cuerda de rayas rojas arriba; la imagen cuelga de una pinza en forma de tarjeta (color y pinza cambian en cada vuelta); las 18 fichas son notas adhesivas de colores con chinche, en 2 filas de 9 |
| Accesibilidad | Ninguna: no hay teclado, ni lector, ni alternativa al toque |

## Mecánica (observada y medida)

1. **Inicio:** pantalla con las fichas desvaneciéndose y un reloj que **cuenta hacia arriba** (0:00). Un toque inicia.
2. **Entrada (~5 s):** las 18 fichas aparecen desordenadas en la parte baja y, cuando están, el aviso pasa de «¡ADELANTE!» a **«Toca la ficha que coincida»**. Arriba a la derecha: **3 corazones** y un contador de aciertos (✓ 0).
3. **Tarjeta:** una tarjeta con una imagen cuelga de la cuerda, en el centro.
4. **Tocar una ficha:**
   - **Acierto:** «¡Correcto!», ✓ sobre la tarjeta y sobre la ficha, el contador sube, las demás fichas se atenúan y **la ficha acertada sale del tablero** (queda un hueco; las otras no se mueven). La tarjeta se desliza fuera por la izquierda y entra la siguiente por la derecha. Ciclo de ~6 s.
   - **Fallo:** «¡Incorrecto!», ✗ sobre la tarjeta y sobre la ficha tocada, se pierde un corazón. Las fichas se atenúan; **la ficha tocada se queda** y la tarjeta cambia por otra. Si la tarjeta fallada vuelve más tarde, **no se comprobó** 🔶.
5. **Fin:** al quedarse sin corazones (o al terminar las tarjetas 🔶 no se llegó a ver) aparece «Partida finalizada» con puntuación y tiempo, y las opciones **Tabla de clasificación**, **Mostrar respuestas** y **Volver a empezar**.
6. **Orden de las fichas:** distinto en cada partida (barajado); dentro de una partida, fijo.

## Generación (inferido)

- Una tarjeta por acción; las 18 fichas son siempre las mismas y todas son distractores de las demás. La dificultad está en que **hay acciones cercanas** (despertar/vestirse/hacer la cama, desayunar/cenar/poner la mesa, hacer tareas de la escuela/ayudar en tareas de casa).
- No hay pista alguna tras el fallo.

## Qué le falta para evaluar y cómo lo resuelve MIDUHO 🔶

| Original | MIDUHO 🔶 |
|---|---|
| Solo tocar un canvas; sin teclado ni lector | Fichas y tarjeta en HTML (botones, foco visible, teclado) con `alt` de la imagen |
| 3 corazones, reloj y tabla de clasificación | Sin reloj ni ranking; los errores no «matan» la partida: 2 intentos por tarjeta; la nota cuenta la **primera** ficha tocada (1/0 por tarjeta, como `emparejar`; no 2/1/0, para no cambiar el contrato del tipo) |
| Sin pista | Pista tras el primer fallo («es algo que se hace por la noche…»), y revelado de la solución tras el segundo |
| 18 fichas todas a la vez (carga alta para 1.°) | Se conservan las 18 (decisión del usuario del 2026-11-10); la ficha acertada sale, así que la carga baja sola |
| Fichas con solo texto | Igual: solo texto y los efectos de la referencia, sin voces (decisión del usuario). El texto es HTML y el lector de pantalla lo lee |

## Qué se conserva (mecánica) y qué se hace propio

- **Se conserva:** la tarjeta con imagen colgada de una cuerda, las fichas de texto en el tablero, tocar la ficha que coincide, retroalimentación inmediata ✓/✗, la ficha acertada sale, la tarjeta pasa de derecha a izquierda, y el cierre con puntaje y «Mostrar respuestas».
- **Propio:** ilustraciones (personajes ficticios de MIDUHO), frases y su redacción, la escena (🔶 un tablero propio, no de corcho idéntico), código e interfaz.

## Inventario sonoro

Captura: `content/referencias/cokitos-rutinas-diarias/` (`inventario.json`, `RESUMEN.md`, `LICENCIA.md`; audio fuera de git). **No hay voces por ficha** (el juego no habla): la única pista de «voz» (`data-0.mp3`, 0,17 s) es un desbloqueo de audio sin contenido.

| Rol | Pistas | Para qué evento (inferido por el nombre del archivo 🔶) |
|---|---|---|
| Efecto de acierto | 4 | `chipminor1…4`: ficha acertada |
| Efecto de fallo | 3 | `chipfail1…3`: ficha equivocada |
| Efecto de tarjeta | 6 | `conveyoritemactivate1…3` (tocar o activar), `appear`, `centered`, `leave` (la tarjeta entra, se centra y sale) |
| Inicio / reinicio / menú | 3 | `gameintro`, `gamerestart`, `menu` |
| Cierre | 5 | `gamesuccessful`, `gameunsuccessful`, `leaderboards`, `gamereveal`, `gametimesup` |
| Reloj | 3 | `clockgo`, `clocktick1`, `clocktick2` (no se usan: MIDUHO no tiene reloj) |
| Desconocido | 1 | `test1.mp3` (prueba del motor) |

**Se usará (propuesta, pendiente de visto bueno):** acierto y fallo (variantes turnadas), movimiento de la tarjeta (entrar/salir), inicio y cierre. **Se usó (2026-11-10):** `chipminor1–3` → `acierto-1…3`, `chipfail1–3` → `fallo-1…3`, `conveyoritemappear` → `entrar`, `conveyoritemcentered` → `centrar`, `conveyoritemleave` → `salir`, `gameintro` → `inicio`, `gamesuccessful` → `fin`. **No se usó:** reloj, ránking, menú, reinicio. **Sin voces** (decisión del usuario: «los efectos de sonido no más»). Claude no oye: todo queda en «por escuchar».
