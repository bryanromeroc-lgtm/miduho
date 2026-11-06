## Context

Mecánica estudiada con REA en `docs/investigacion/referencia-golpea-el-resultado.md` (cuadrícula 3-4-3, 7–8 opciones, distractores por error típico, sin reloj, el topo golpeado queda fuera). MIDUHO ya tiene el contrato de tipos (`tipos/contrato.ts`), el flujo por rondas con «error que enseña» (`comun/rondas.ts`) y la referencia de escena de acción (`juegos/robots/`).

## Goals / Non-Goals

**Goals:** misma sensación de juego que la referencia; evaluable y recalificable en servidor; estándar aprobado (personajes ~⅓ del alto, escena en 4 tiempos, dos poses, cámara, música aparte); WCAG 2.1 AA.

**Non-Goals:** modos de alfabeto, palabras o tablas de la referencia; reloj o vidas; marcador comparativo; guardar intentos (llega con 5.2).

## Decisions

1. **Generador puro `generador.ts`** con `generador(semilla)` de `contrato.ts` (mulberry32). Alternativa: guardar las operaciones en el JSON → descartada; la docente configura, no escribe 10 operaciones. La semilla viene del contenido (no de la partida) para que el servidor recalifique igual, como `robots-divisiones`.
2. **Respuesta = arreglo de hasta 2 enteros**. `useRondas` guarda solo el primer valor; el juego mantiene su propio registro de intentos por ronda y lo entrega en `alTerminar`. Se reutiliza `useRondas` para estados, guirnalda, sonido y confeti.
3. **Topos como `<button>` en una rejilla absoluta** sobre la escena (posiciones en % del contenedor, escalado con `cqw`). Alternativa canvas → descartada por accesibilidad y por la regla de texto en HTML.
4. **Escena de acción**: atributo `data-golpe="acierto|fallo"` en el hueco golpeado. Acierto (≈1,6 s): mazo se alza (anticipación) → cae (acción) → hit-stop + estrella + chispas + «¡TOC!» + temblor de `.camara` (impacto) → topo pasa a pose contenta y todos bajan (recuperación). Fallo (≈0,9 s): mazo cae suave, topo mareado se hunde un poco, número tachado; sin temblor. Sonido del golpe programado al ms del impacto.
5. **Poses**: topo normal (asomado con cartel) y topo contento / topo mareado, generados con Gemini usando el topo base como `--ref` y encajados con `recortar-pose.py`. Mazo mecánico como imagen aparte.
6. **Audio**: música de taller con Gemini (bucle, ~−23 LUFS, botón propio). Efectos de golpe/acierto/error/aparecer de un paquete CC0 (Kenney), recortados a `.mp3`/`.ogg` cortos y documentados en `public/audio/juegos/golpea/LICENCIAS.md`; si la descarga falla, se usa la síntesis de `comun/sonido.ts`.
7. **Registro** en los cuatro lugares; `reglas.ts` incluye `golpea` en «primera respuesta cuenta» (el texto de reglas aplica: corregir enseña).

## Risks / Trade-offs

- [Gemini no mantiene al topo igual entre poses] → una regeneración; si persiste, la pose se resuelve con CSS (inclinación + ojos) y se declara.
- [Topos grandes en 10 huecos no caben a ⅓ del alto] → el ⅓ se aplica al mazo/topo golpeado en la escena; en la cuadrícula el topo usa `min(15cqw, 20dvh)`. Se declara como excepción justificada del estándar.
- [Descarga CC0 bloqueada] → respaldo sintetizado, dicho en el cierre.

## Open Questions

- 🔶 Escala 2/1/0 confirmada por el usuario; validar con la docente.
- 🔶 Grado: la actividad de ejemplo va en 5.° (cálculo mental) porque la demo usa 5.°; versión 2.°/3.° con otro JSON.
