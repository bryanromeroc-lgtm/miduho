# Referencia funcional: «Clasificación de seres vivos e inertes» (Cokitos → Wordwall)

> Estudio de **mecánica** para la actividad `vivo-o-no-vivo` de 1.° (programa `juegos-primero`, NAT-1-03). No se copió código, imagen, texto, nombre ni personaje; lo capturado con REA y Playwright se borró al terminar. El **audio** se capturó aparte con `tools/captura-audio` y queda fuera de git, con permiso declarado (decisión del usuario del 2026-11-10).

- **Fecha:** 2026-11-10
- **Herramientas:** REA 6.8.0 (`inspect-web-page` sobre un Chrome aislado en el puerto 9333) y Playwright para jugar, medir y ver el revelado; `tools/captura-audio` para el audio.
- **Página observada:** https://www.cokitos.com/clasificacion-de-seres-vivos-e-inertes/ (ficha) → `…/play/` (juego).

## Hallazgo de autoría (observado)

Cokitos **no aloja el juego**. En `…/play/` lo incrusta en un `iframe` de **wordwall.net**: la actividad «Seres Vivos e Inertes» de la plantilla **«Agrupar»** de Wordwall (`templateId` 2, tema «Sunflower»), creada por un usuario de Wordwall cuya identidad no se confirmó 🔶. El motor, los temas, los efectos y la voz son de Wordwall; el contenido (palabras e imágenes) es del autor de la actividad. Cualquier permiso tendría que venir de Wordwall y del autor, no de Cokitos.

## Cómo está construido (observado)

| Aspecto | Qué hay |
|---|---|
| Render | Un solo **canvas** a pantalla completa (motor propio de Wordwall 1.0.8) |
| Datos | Un modelo de contenido JSON con dos grupos y ocho tarjetas por grupo; cada tarjeta tiene texto, imagen y una **voz sintetizada** (TTS es-ES, voz «Abril neural») |
| Tema | «Sunflower»: fondo amarillo, tarjetas de colores con imagen arriba y palabra abajo, ícono de altavoz en cada tarjeta |
| Sonido | ~24 efectos del tema (levantar y soltar tarjeta, acierto y fallo al revelar, intro, menú, fin, récords) + una voz por tarjeta |
| Accesibilidad | Ninguna: todo está pintado en el canvas; no hay teclado ni lector de pantalla. El arrastre es la única forma de jugar |

## Mecánica (observada y medida)

1. **Inicio:** pantalla de título; un toque arranca. Un reloj **cuenta hacia arriba** (no hay tiempo límite).
2. **Pila:** las 16 tarjetas aparecen barajadas en una cuadrícula de 4 × 4 a la izquierda. Cada una muestra una **foto o dibujo**, la **palabra** y un **altavoz**: al tocar el altavoz suena la palabra.
3. **Destinos:** dos columnas con su título («Seres vivos», «Seres inertes») y 8 casillas vacías cada una.
4. **Arrastrar:** se arrastra una tarjeta a cualquier casilla. **No hay retroalimentación al soltar**: una tarjeta mal ubicada se queda donde se dejó, sin sonido de error (medido: «Armario» en Seres vivos y «Persona» en Seres inertes quedaron sin aviso).
5. **«Enviar respuestas»:** se activa desde la primera tarjeta ubicada. Al pulsarlo, el juego **revela una por una** (~0,3 s cada una): ✓ y un «chip» de acierto, o ✗, la tarjeta en gris y un «chip» de fallo. Arriba a la derecha cuenta los aciertos («✓ 4»).
6. **Fin:** música de cierre, puntaje y tiempo, y tabla de récords (*leaderboard*). Se puede reiniciar.

### Contenido (observado en el modelo de la actividad)

- Seres vivos: tortuga, tomate, árbol, cactus, rosa, ballena, persona, seta.
- Seres inertes: armario, piedra, silla, montaña, cama, botella, cacao (dibujado como una bebida en vaso), gafas.
- **Problemas para usarlo como evaluación:** «tomate» (fruto separado de la planta) y «cacao» (la bebida, no la planta) son ambiguos para un niño de 1.°; «cáctus» lleva tilde de más. MIDUHO no usa ítems ambiguos.

## Qué le falta para evaluar y cómo lo resuelve MIDUHO

| Original | MIDUHO 🔶 |
|---|---|
| Sin retroalimentación hasta «Enviar»: el niño de 1.° no sabe si va bien | Retroalimentación **inmediata** por tarjeta (como el tipo `clasificar`), con el porqué en una frase |
| Solo arrastrar (excluye teclado y motricidad fina) | Tocar la tarjeta y luego la cesta, o teclas; sin arrastre (WCAG 2.5.7) |
| Se puede «Enviar» con casillas vacías | Cada tarjeta se ubica una vez; la calificación cuenta la **primera** ubicación |
| Reloj y tabla de récords (presión y comparación) | Sin reloj ni ranking; estrellas al final |
| Ítems ambiguos (tomate, cacao) | Ítems inequívocos del entorno colombiano, revisados contra NAT-1-03 |
| Texto en canvas | Texto en HTML, seleccionable, con imagen + `alt` |

## Qué se conserva (mecánica) y qué se hace propio

- **Se conserva:** dos grupos; tarjetas con **imagen + palabra + altavoz**; escuchar la palabra antes de decidir; revelado con ✓/✗ y sonido distinto para acierto y fallo; música de cierre.
- **Propio:** la redacción, las imágenes (ilustraciones propias), los ítems (fauna, flora y objetos de Madrid, Cundinamarca), el personaje guía y la interfaz.

## Inventario sonoro

Captura: `content/referencias/cokitos-seres-vivos-e-inertes/` (`inventario.json`, `RESUMEN.md`, `LICENCIA.md`; audio fuera de git).

| Rol | Pistas | Notas |
|---|---|---|
| Voz | 16 | Una por tarjeta, TTS es-ES («Abril neural»). La palabra que dice cada una sale del modelo de contenido (`certeza: metadatos del juego`), no se ha oído 🔶 |
| Efecto | 19 | Levantar (5) y soltar (5) tarjeta, acierto (3 «chip minor») y fallo (3 «chip fail») al revelar, menú, reinicio, silencio de desbloqueo |
| Fin / cierre | 4 | Juego terminado, récords, tiempo agotado, revelado (rol sin confirmar 🔶) |
| Desconocido | 1 | `test1.mp3`: prueba del motor (no suena en el juego) |

**Qué se usará en la adaptación (propuesta, pendiente de visto bueno):**

- **Voces:** solo sirven si la palabra coincide con un ítem de MIDUHO **y** el acento sirve (es-ES). Coinciden: *tortuga*, *árbol*, *piedra*, *silla*, *montaña*, *botella*, *cama*. Hay que escucharlas: «árbol», «piedra» o «montaña» en voz de España suenan casi igual que en Colombia, pero lo confirma una persona 🔶. Las demás palabras de MIDUHO quedan con la síntesis del navegador.
- **Efectos:** el «chip» de acierto y el de fallo encajan con la escena de clasificar (sonido distinto al ubicar bien o mal).
- **Música:** ninguna en bucle; el cierre («juego terminado») podría sonar al ver el resultado 🔶.

## Adaptación construida (2026-11-10)

Tras ver la primera versión (una tarjeta a la vez), el usuario pidió que se pareciera al original y que usara sus audios. Quedó el tablero «Agrupar» de MIDUHO (`juegos/agrupar/`): misma disposición y mecánica (pila de tarjetas con altavoz, columnas con casillas, arrastrar, «Enviar respuestas», revelado uno por uno con ✓/✗), las 15 voces originales (todas menos «cacao») y 15 efectos del tema. Ilustraciones, código y redacción son propios. Se conservan de MIDUHO: tocar o usar teclado además de arrastrar, «Enviar» solo con todas ubicadas, sin reloj ni récords.
