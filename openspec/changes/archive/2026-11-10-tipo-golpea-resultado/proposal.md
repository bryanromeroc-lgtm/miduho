## Why

Las docentes quieren juegos de cálculo mental tan ágiles como los que encuentran en sitios de terceros, pero que **evalúen** (rondas, nota, repaso) y sean accesibles. Al adaptar juegos «a ojo» siempre faltan detalles de la mecánica; por eso esta vez se estudió una referencia con REA (`docs/investigacion/referencia-golpea-el-resultado.md`) y se reproduce su mecánica con recursos, código y redacción propios.

## What Changes

- Nuevo tipo de actividad **`golpea`** («Golpea el resultado»): en un taller, 7 u 8 topos robot asoman de una cuadrícula de 10 huecos (3-4-3) con un número cada uno; el estudiante golpea el que tiene el resultado de la operación.
- Operaciones de suma y resta generadas de forma **determinista** desde la configuración de la actividad (semilla, rango 10/20/100, operaciones, llevadas, número de rondas), con **distractores por error típico** (±1, ±2, ±10, ±20 y dos al azar del rango) y sin repetir resultados recientes.
- Calificación por ronda: **2** puntos al primer golpe, **1** al segundo, **0** después; tras el segundo fallo se muestra la solución y se avanza.
- Juego en pantalla completa con escena de acción en cuatro tiempos (mazo mecánico + topo con dos poses), fallo en versión suave, música apagable y efectos de sonido CC0 con licencia registrada.
- Accesible: cada topo es un botón HTML, teclas 1–0 por hueco, resultado en `role="status"`, sin reloj.
- Actividad de ejemplo «El taller de los topos» en `curriculo/actividades/matematicas/5/`.

## Capabilities

### New Capabilities
- `actividad-golpea`: generación de rondas, calificación, repaso y comportamiento del juego «Golpea el resultado».

### Modified Capabilities
<!-- Ninguna: el tipo se suma al registro existente sin cambiar sus requisitos. -->

## Impact

- `apps/web/src/features/actividades/juegos/golpea/` (nuevo: `tipo.ts`, `generador.ts`, pruebas, `juego.tsx`, CSS).
- Registro en `tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx`.
- Recursos en `public/images/juegos/golpea/` (Gemini) y `public/audio/juegos/golpea/` (música Gemini + efectos CC0, con `LICENCIAS.md`).
- Sin dependencias nuevas ni cambios de base de datos.
