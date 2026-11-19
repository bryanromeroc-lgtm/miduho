## Why

Ciencias Sociales de 5.° pide reconocer la organización territorial de Colombia en el mapa (DBA **SOC-5-01**: «Comprende la organización territorial existente en Colombia y las particularidades geográficas de las regiones»; evidencia: «las reconoce a partir de la lectura de mapas»). Hoy MIDUHO solo tiene «Departamentos y capitales» (emparejar), sin mapa. Los juegos de «haz clic en el departamento» de sitios de terceros funcionan muy bien para memorizar la ubicación, pero no evalúan, no son accesibles y usan recursos ajenos. Se estudió uno con REA (`docs/investigacion/referencia-mapa-departamentos.md`) y se reproduce su **mecánica** con geometría de dominio público, código, arte y redacción propios.

## What Changes

- Nuevo tipo de actividad **`mapa`** («Ubica en el mapa»): el juego nombra un departamento de Colombia y el estudiante lo toca en un mapa SVG propio (33 unidades: 32 departamentos y Bogotá D. C.; San Andrés y Providencia en un recuadro insular).
- Rondas **deterministas** por semilla desde la configuración (`semilla`, `rondas`, `regiones`, `fronteras`); la docente configura, no escribe ítems.
- Calificación por ronda: **2** puntos al primer toque, **1** al segundo, **0** después; tras el segundo fallo se señala el departamento correcto y se avanza.
- **Pista según el error**: si tocó un vecino, en qué dirección está; si tocó uno de la misma región, que va bien y hacia dónde; si tocó otra región, en qué región está el pedido. Al fallar se ve el nombre del departamento tocado (aprende cuál era).
- El mapa conserva lo aprendido: cada departamento resuelto queda con su nombre, una chincheta y un color según cuánto costó.
- Escena de acción en cuatro tiempos: Armi, la exploradora, lanza la chincheta y la clava en el departamento (acierto completo); en el fallo, versión suave sin temblor. Música apagable y efectos CC0.
- Accesible: departamentos operables con teclado (Tab, flechas para ir al vecino en esa dirección, Enter), consigna y resultado en HTML con `role="status"`, sin reloj.
- Actividad de ejemplo en `curriculo/actividades/ciencias-sociales/5/`.

## Capabilities

### New Capabilities
- `actividad-mapa`: generación de rondas, calificación, pistas, repaso y comportamiento del juego «Ubica en el mapa».

### Modified Capabilities
<!-- Ninguna: el tipo se suma al registro existente sin cambiar sus requisitos. -->

## Impact

- `apps/web/src/features/actividades/juegos/mapa/` (nuevo: `colombia.ts` con la geometría, `generador.ts`, `tipo.ts`, pruebas, `juego.tsx`, CSS, `audio.ts`).
- `tools/mapas/` (nuevo): script reproducible que genera `colombia.ts` desde Natural Earth (dominio público) con mapshaper vía `npx` (no es dependencia del proyecto).
- Registro en `tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx`.
- Recursos en `public/images/juegos/mapa/` (Gemini) y `public/audio/juegos/mapa/` (música Gemini + efectos CC0, con `LICENCIAS.md`).
- Sin dependencias nuevas ni cambios de base de datos.
