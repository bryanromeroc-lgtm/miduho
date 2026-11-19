## Context

Mecánica estudiada con REA en `docs/investigacion/referencia-mapa-departamentos.md`: consigna «toca X», mapa SVG con 33 unidades, al fallar se ve el nombre de lo tocado, tras varios fallos se señala el correcto, color final por intentos, isla en recuadro, modos con y sin fronteras, sin distractores (el error es dónde toca el estudiante). MIDUHO ya tiene el contrato de tipos (`tipos/contrato.ts`), `useRondas` con «error que enseña» y el modelo aprobado de adaptación (`juegos/golpea/`).

## Goals / Non-Goals

**Goals:** misma sensación de juego que la referencia; evaluable y recalificable en servidor; estándar aprobado (personaje ~⅓ del alto, escena en 4 tiempos, dos poses, cámara, música aparte); WCAG 2.1 AA; geometría con licencia clara.

**Non-Goals:** otros mapas (países, capitales, ríos) — el esquema deja `mapa` como literal para sumarlos después; modo «escribir el nombre»; reloj o porcentaje de precisión; banderas de los departamentos; guardar intentos (llega con 5.2).

## Decisions

1. **Geometría propia desde Natural Earth** (Admin 1, 1:10m, v5.1.1, dominio público). `tools/mapas/generar-colombia.mjs` filtra Colombia, corrige el código de Bogotá (`CO-DC`), descarta la unidad sin departamento (`CO-X01`), calcula vecinos con la geometría completa (bordes compartidos), simplifica, proyecta (equirectangular con corrección por coseno de la latitud; en el trópico la deformación es mínima) a un `viewBox` fijo y escribe `juegos/mapa/colombia.ts` (id, nombre, región, `d`, centro para la etiqueta, vecinos). San Andrés y Providencia van en un recuadro arriba a la izquierda, a otra escala, como en los atlas escolares. Alternativas: GADM (licencia no comercial) y el MGN del DANE (datos abiertos, más pesado) → Natural Earth por licencia y peso.
2. **Regiones naturales** (Caribe, Andina, Pacífica, Orinoquía, Amazonía, Insular): un departamento pertenece a **una sola** región para el juego (Pacífica = Chocó, Valle del Cauca, Cauca y Nariño). 🔶 Varios departamentos abarcan dos regiones; validar la asignación con la docente.
3. **Generador puro** con `generador()` de `contrato.ts`: filtra por regiones, mezcla con la semilla y toma `rondas` departamentos distintos. El esquema rechaza más rondas que departamentos disponibles.
4. **Respuesta = arreglo de hasta 2 ids** de departamento (`CO-ANT`…); 2/1/0 como `golpea`. `useRondas` guarda solo el primero; el juego lleva su registro de intentos y lo entrega en `alTerminar`.
5. **Pista pura `pistaMapa(objetivo, tocado)`** con los vecinos y los centros: vecino → «está al <dirección> de <tocado>»; misma región → «vas bien, también es de la región <R>; busca más al <dirección>»; otra región → «<tocado> es de la región <R1>; el que buscas está en la región <R2>, más al <dirección>». La dirección se toma del ángulo entre centros (ocho rumbos); para el recuadro insular, «en el mar Caribe, en el recuadro de las islas».
6. **Mapa como SVG en el DOM**: cada departamento es un `<path>` con `role="button"`, `tabIndex`, `aria-label` y manejo de Enter/Espacio. Flechas: `vecinoEnDireccion()` (puro) elige el centro más cercano en ese rumbo. Las unidades muy pequeñas (Bogotá, Quindío, Atlántico, San Andrés) llevan un círculo transparente que amplía el área táctil. Alternativa canvas → descartada (texto en HTML, teclado, lector).
7. **Nombre accesible sin regalar la respuesta**: es una prueba de ubicación (WCAG 1.1.1 admite «identificación descriptiva» en pruebas). Un departamento sin resolver se anuncia por su posición («Departamento del noroeste, 7 de 33»); al resolverse, por su nombre. La consigna y el resultado están en texto. 🔶 Validar con la docente si un estudiante con baja visión necesita otra modalidad.
8. **Escena de acción** (`data-lanza="acierto|fallo"` en la escena): acierto 1800 ms — lectura (el departamento tocado se resalta) → carga (Armi se agacha) → acción (pose de lanzamiento; la chincheta vuela en arco hasta el centro del departamento) → impacto con pausa ~130 ms (se clava; anillo, ≤ 8 chispas, «¡ZAS!» decorativo, temblor de la `.camara` con origen en el departamento) → recuperación (el departamento se pinta y sube su nombre; Armi vuelve a la guardia). Fallo 950 ms suave: el departamento tocado se ilumina tenue y muestra su nombre, Armi ladea la cabeza; sin temblor ni onomatopeya. Sonido al ms del impacto con Web Audio.
9. **Poses**: Armi exploradora en guardia (con la chincheta) y en lanzamiento (manos vacías; la chincheta voladora es una imagen aparte), generadas con Gemini usando a Armi como `--ref` y encajadas con `recortar-pose.py`.
10. **Audio**: música de exploración con Gemini (bucle, ~−23 LUFS, botón propio). Efectos CC0 de Kenney (lanzar, clavar, acierto, error, aparecer) con `LICENCIAS.md`; si la descarga falla, la síntesis de `comun/sonido.ts`.
11. **Registro** en los cuatro lugares; `reglas.ts` incluye `mapa` en «primera respuesta cuenta».

## Risks / Trade-offs

- [El mapa necesita espacio y Armi ~⅓ del alto compite con él] → Armi a la izquierda, sobre el océano Pacífico del propio `viewBox` en pantallas angostas; en el teléfono Armi más pequeña. Se mide en 1920×1080.
- [Departamentos diminutos difíciles de tocar en el teléfono] → área táctil ampliada y teclado; 🔶 el zoom del mapa queda fuera de alcance.
- [La simplificación deforma límites] → simplificación moderada (conserva vecindad calculada antes de simplificar); se compara visualmente con un mapa oficial.

## Open Questions

- 🔶 Escala 2/1/0 (patrón aprobado); validar con la docente.
- 🔶 Asignación de cada departamento a una región natural.
- 🔶 Rondas por defecto (10 de 33) en la actividad de ejemplo.
