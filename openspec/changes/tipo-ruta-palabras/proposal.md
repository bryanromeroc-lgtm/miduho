## Why

Las docentes de primero necesitan práctica de **lectura de palabras** que evalúe (rondas, nota, repaso) y sea accesible. Se estudió con REA un juego de referencia de tres carriles donde se oye una palabra y se elige su cartel (`docs/investigacion/referencia-rodeo-de-palabras.md`) y se reproduce su **mecánica** con recursos, código y redacción propios. Los audios de las palabras los entregó el colegio (licencia escrita por adjuntar 🔶).

## What Changes

- Nuevo tipo de actividad **`ruta-palabras`** («La ruta de las palabras»): Armi recorre en bicicleta un camino de tres carriles (horizontales); llegan por la derecha tres carteles con una palabra cada uno; una voz dice la palabra y el estudiante elige el carril del cartel correcto.
- Rondas **deterministas** desde la configuración (semilla, rondas, sílabas, ritmo), con **distractores por error de lectura** (misma sílaba inicial y longitud; una sola letra distinta; misma cantidad de sílabas) y sin repetir la palabra en rondas cercanas.
- Calificación por ronda: **2** puntos al primer contacto, **1** al segundo, **0** después; tras el segundo fallo se señala la palabra y se avanza.
- Ritmo **tranquilo** (carteles que esperan, se elige con clic/teclas) o **carrera** (como la referencia: contacto automático con el carril ocupado; pausable).
- Escena de acierto en cuatro tiempos (Armi se impulsa y atraviesa el cartel) y fallo en versión suave; racha de tres aciertos = impulso.
- Voz de cada palabra con los audios entregados (convertidos a MP3), botón «Escuchar otra vez»; la palabra siempre se puede leer en el cartel.
- Accesible: carteles `<button>`, ↑/↓ + Enter y teclas 1–3, `role="status"`, pausa, sin reloj en modo tranquilo y un botón «Mostrar la palabra escrita» como alternativa al audio para quien no puede oír.
- Actividad de ejemplo «La ruta de las palabras» en `curriculo/actividades/comprension-lectora/1/` 🔶.

## Capabilities

### New Capabilities
- `actividad-ruta-palabras`: generación de rondas, calificación, repaso y comportamiento del juego.

### Modified Capabilities
<!-- Ninguna -->

## Impact

- `apps/web/src/features/actividades/juegos/ruta-palabras/` (nuevo).
- Registro en `tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx`.
- Recursos en `public/images/juegos/ruta-palabras/` (Gemini), `public/audio/juegos/ruta-palabras/` (efectos CC0, música Gemini) y `public/audio/palabras/` (voces entregadas, con `LICENCIA.md` pendiente).
- Sin dependencias nuevas ni cambios de base de datos.
