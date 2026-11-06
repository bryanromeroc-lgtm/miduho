# Incremento 2 · Juego «La ruta de las palabras»

- **Fecha:** 2026-11-05
- **Cambio OpenSpec:** `openspec/changes/tipo-ruta-palabras/`
- **Referencia funcional:** `docs/investigacion/referencia-rodeo-de-palabras.md` (mecánica estudiada con REA; nada de código, arte, nombre ni personajes).
- **Voces:** reutilizadas a pedido del usuario desde los audios que entregó; **licencia escrita pendiente** (ver más abajo).

## Qué es

Tipo nuevo `ruta-palabras`. Armi va en bicicleta por un camino de tres carriles; llegan tres carteles con una palabra y una voz dice una de ellas; se elige el cartel que la tiene escrita. Rondas deterministas por semilla, distractores por error de lectura, 2/1/0 puntos por ronda, dos ritmos («tranquilo» sin reloj y «carrera» como la referencia, con pausa), teclas 1–3 y ↑/↓ + Enter.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/juegos/ruta-palabras/palabras.ts` | Banco de 143 palabras (2, 3 y 4 sílabas, declaradas a mano) con su voz |
| `…/generador.ts` | Rondas deterministas, distractores por parecido, pista según el error |
| `…/tipo.ts` + `tipo.test.ts` | Esquema, calificación 2/1/0, repaso (13 pruebas) |
| `…/juego.tsx` + `ruta-palabras.module.css` | Interfaz, bucle de avance pausable, escena en 4 tiempos, cámara, poses |
| `…/audio.ts` | Efectos CC0 por Web Audio al ms del impacto; voz de palabras con `Audio` |
| `curriculo/actividades/comprension-lectora/1/la-ruta-de-las-palabras.json` | Actividad de ejemplo (1.°, 10 rondas, sílabas mixtas, ritmo tranquilo) |
| `.gitignore` | Se ignoran los `.ogg` de `content/referencias/` (audios de trabajo con licencia pendiente) |

### Recursos

| Ruta | Peso | Origen |
|---|---|---|
| `public/images/juegos/ruta-palabras/armi.webp` | 64 KB | Gemini chat (imagen), 2026-11-05, ref. `armi/senala.webp`. Armi en bicicleta |
| `…/armi-impulso.webp` | 63 KB | Gemini, ref. `armi.webp`; `recortar-pose.py --como`. Puño en alto |
| `…/armi-mareado.webp` | 61 KB | Gemini, ref. `armi.webp`; mismo recorte. Duda, se rasca la cabeza |
| `…/cartel.webp` | 11 KB | Gemini, ref. `armi/senala.webp` (estilo). Cartel vacío; se limpió una franja blanca del borde derecho por código |
| `…/fondo.webp` | 69 KB | Gemini (segundo intento: el primer prompt lo rechazó), camino liso de sabana |
| `…/portada.webp` | 60 KB | Gemini, refs. Armi y cartel; franja 3,6:1 a 1200×333 |
| `public/audio/juegos/ruta-palabras/musica-ruta.mp3` | 2,5 MB | Gemini (música), 174,5 s, −24 LUFS, fundido 2 s, bucle |
| `…/{golpe,golpecito,acierto,error,aparecer}.mp3` | 2–6 KB | Kenney, CC0 1.0 (los mismos de `golpea/`; `LICENCIAS.md`) |
| `public/audio/palabras/<clave>.mp3` (143) | 1,6 MB | Voces entregadas por el usuario (Árbol ABC), convertidas a MP3 mono −18 LUFS. **Licencia pendiente** (`LICENCIA.md`) |

🔶 Revisar los términos de uso de Gemini para material del colegio.

### Lo que no se usó de los audios entregados

- `voces/` (5 frases de instrucción): no se pueden oír desde aquí; lo que dicen está 🔶. Las instrucciones van escritas.
- `fx/`: incluye relinchos de caballo que no encajan con el tema; se usaron efectos CC0.
- Las dos músicas del paquete: se usó música propia (Gemini).
- `words.ogg`, `voiceAudio.ogg`, `fxAudio.ogg` (los tres «atlas» completos): no se necesitan, hay un archivo por palabra.

## Verificación

- `npm test`: 67 archivos, 782 pruebas, todas pasan. `npm run lint`: sin errores ni avisos. `npm run build`: sin errores.
- Pruebas del tipo: 13 pasan (determinismo, tres palabras distintas, sílabas, memoria de 6 rondas, carril no repetido, distractor más parecido, pistas, calificación).
- Navegador (página temporal, ya borrada), Chrome real sobre el servidor de desarrollo:
  - Partida completa en modo tranquilo con un doble fallo (revela «La palabra era pela») y un acierto corregido: el resultado dice «8 de 10», como corresponde.
  - Modo carrera: la pausa detiene el avance (valor de avance idéntico antes y después de 2,5 s) y el contacto automático elige el carril ocupado.
  - Racha de tres aciertos: «¡Tres seguidas! Armi se impulsa», líneas de velocidad y confeti en el impacto.
  - Video del fallo y del acierto revisado en hoja de cuadros (carga, lanzamiento, cartel que se abre, «¡PLAF!», regreso; pose mareada en el fallo).
  - 1920×1080, 1440×900 y 390×844 sin desplazamiento horizontal; 1366×768 sobran 16 px verticales.
- Accesibilidad: axe-core (WCAG 2.1 AA) sin violaciones en inicio, juego, fallo en escena y tras el fallo. Queda un contraste «por revisar» automáticamente (texto oscuro sobre fondos crema translúcidos); calculado a mano, ≥ 7:1.

## Decisiones y pendientes

- **Disposición:** carriles horizontales y carteles que llegan por la derecha (en la referencia, verticales y de abajo hacia arriba): Armi se dibuja de lado y se invierte con CSS. Misma mecánica.
- **El acierto y el aviso llegan con el impacto** (se llama a `responder` en ese instante, no al tocar), para que el confeti no salga antes de la acción.
- **La semilla incluye el ritmo:** el mismo JSON con ritmo distinto da otra lista de palabras.
- 🔶 Armi mide ~30 % del alto en escritorio (no ⅓) y ~18 % en teléfono: con tres carriles apilados no cabe más sin forzar el desplazamiento. Excepción declarada del estándar.
- 🔶 «Mostrar la palabra escrita» ayuda a quien no puede oír, pero quita el reto de oír: validar con la docente si cuenta para la nota.
- 🔶 Grado 1.° y asignatura Comprensión lectora: la demo solo tiene 5.°, así que la actividad **no aparece en la demo**; para verla hay que tener un grupo de 1.°.
- 🔶 Ritmo por defecto «tranquilo» (la referencia es «carrera»).
- 🔶 **Licencia de las voces:** el usuario dijo tener los audios; falta el soporte escrito del titular (quién autoriza, alcance, atribución, vigencia). No desplegar `public/audio/palabras/` hasta adjuntarlo, o reemplazar por grabaciones propias con los mismos nombres.
- 🔶 El registro y el acento de la locución no se pudieron comprobar desde aquí: alguien del colegio debe oírla y confirmar que sirve para primero.
- 🔶 Una errata del paquete: el archivo de «mantequilla» se llamaba `matequilla.ogg` (se renombró al convertir).
- La tarjeta con la portada se verificó en la vista de «Comprensión Lectora» con la cuenta demo de 1.° (`apps/web/scripts/demo-primero.ts`, copia de `demo-quinto.ts` para el grupo 1°01; regenera la contraseña al correrlo y la imprime: credencial temporal, fuera de Git).
- No verificado: los efectos y la música (Claude no los oye); la locución de cada una de las 143 palabras (solo se comprobó que cada archivo dura entre 0,7 y 1,6 s).
- No hecho: pasada formal de `/impeccable` (critique/polish) sobre la interfaz.
