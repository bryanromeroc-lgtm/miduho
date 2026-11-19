# Inc. 2 · Duelo de divisiones

## Decisión y alcance

- **Observado en la referencia pública (2 de noviembre de 2026):** selección de robot, divisiones del tipo `40 ÷ ? = 4`, cuatro opciones, cuenta regresiva por ronda, tres oportunidades, puntaje, pausa, sonido y contador de hasta 100 preguntas.
- **Observado en una segunda partida:** al acertar, la opción se marca, aparecen fichas de puntaje, el panel se retira y el robot elegido avanza contra el rival; al fallar o agotar el tiempo, el rival avanza, hay un destello de impacto y se consume una oportunidad. El siguiente reto llega después de la secuencia.
- **Propuesto para MIDUHO:** actividad original «Duelo de divisiones» en Matemáticas de 5.º, integrada al reproductor existente. Las 100 operaciones exactas se generan con semilla reproducible y 15 segundos por ronda; la primera respuesta o el tiempo agotado se califica. El resultado sigue siendo práctica libre y no se guarda.
- **Por confirmar 🔶:** alineación con la secuencia curricular de Matemáticas de 5.º y cualquier criterio de valoración institucional. No se afirma alineación con DBA ni SIEE.
- **Límite de contenido:** se usa la mecánica matemática general. No se reutilizan código, texto, imágenes, música, voces ni efectos de la referencia. La azotea y el robot son ilustraciones originales generadas para este cambio; los sonidos se sintetizan localmente con Web Audio.

## Criterios de aceptación

1. El estudiante encuentra la actividad en Matemáticas de 5.º y puede elegir una apariencia de robot antes de jugar.
2. Cada pregunta muestra una división exacta con divisor oculto y cuatro respuestas únicas; responde con toque, clic o teclas 1–4.
3. El reloj de 15 segundos se pausa y reanuda; una respuesta incorrecta o agotada consume una de tres oportunidades. El estado se anuncia en texto, sin depender del color o sonido.
4. El juego termina al agotar oportunidades o completar las rondas y repasa únicamente las preguntas que entraron en la partida, incluido un tiempo agotado.
5. Los controles tienen foco visible, texto real y composición adaptable a móvil; los efectos y la música se pueden desactivar por separado.
6. Al iniciar, el combate ocupa la pantalla completa; el control visible permite salir de ese modo. Si el navegador no concede pantalla completa nativa, el juego cubre la ventana.

## Archivos y verificación

- `apps/web/src/features/actividades/juegos/robots/`: lógica, interfaz, estilos y pruebas del tipo.
- `apps/web/curriculo/actividades/matematicas/5/duelo-de-divisiones.json`: actividad curricular propuesta.
- `apps/web/public/images/juegos/robots/`: dos recursos originales, `azotea.webp` y `robot.webp` (generación propia, 2 de noviembre de 2026).
- `apps/web/public/images/juegos/robots/rival.webp`: robot rival original generado para la corrección del duelo (2 de noviembre de 2026).
- `apps/web/public/images/juegos/robots/portada.webp`: portada original del duelo para la tarjeta de actividad, generada con los personajes y la azotea propios como referencias visuales (2 de noviembre de 2026). El título permanece como texto HTML seleccionable y accesible.
- `apps/web/public/audio/juegos/robots/accion-original.mp3`: pista electrónica original de 16 segundos, sintetizada con `apps/web/scripts/generar-musica-duelo.py`; no usa muestras ni melodías de la referencia.
- `apps/web/public/audio/juegos/robots/musica-duelo.mp3`: música del duelo desde el 4 de noviembre de 2026 (2:53, MP3 VBR ~128 kbps, 2,7 MB). Generada en Gemini chat (modo Música, plan Pro) con el prompt «Música instrumental alegre y enérgica con sintetizadores y batería electrónica, ritmo rápido, ambiente de reto amistoso entre robots. Sin voces.»; normalizada a ~−23 LUFS, con el silencio final recortado y un fundido de 2 s para el bucle. Se carga solo al empezar a jugar (`preload="none"`) y respeta el botón de música. Reemplaza en el juego a `accion-original.mp3`, que queda en el repo sin uso. 🔶 Por confirmar: revisión de los términos de uso de Gemini para material del colegio.
- `apps/web/public/video/juegos/robots/intro.mp4` y `intro-poster.webp`: intro de 10 s (1280×720, H.264 + AAC, 2,4 MB) generada en Gemini chat (modo Vídeo, plan Pro) el 4 de noviembre de 2026 con `portada.webp` como única referencia visual, vía `tools/gemini-media/`. Azotea vacía → aterriza el robot y saluda → aterriza el rival → choque de chispas; el último cuadro coincide con la portada. Sin texto, voces ni personas; música y efectos generados por Gemini. 🔶 Por confirmar: integración en el juego (no conectada aún) y revisión de los términos de uso de Gemini para material del colegio.
- Escena de acción (4 de noviembre de 2026): los robots escalan con la pantalla (`--robot: clamp(120px, min(24cqw, 40dvh), 460px)`, unos 400 px de alto a 1920×1080 frente a ~120 px antes) y cada ronda se resuelve en cuatro tiempos dentro de los mismos 2650 ms: carga con aura → embestida con líneas de velocidad → impacto con ~130 ms de pausa, estrella, 8 chispas, «¡PUM!» y un temblor corto de cámara → retroceso del golpeado. El fallo usa una versión suave (sin temblor ni «¡PUM!»). Todo en CSS (`transform`, `opacity`, `filter`), con un solo destello por golpe, el marcador fuera de la cámara y movimiento reducido respetado. El mensaje de resultado aparece al retirarse el tablero y se mantiene ~1,8 s. No cambia la calificación.
- `apps/web/public/images/juegos/robots/robot-ataque.webp` (105 KB) y `rival-ataque.webp` (101 KB): pose de ataque (puñetazo hacia el rival) de cada robot, generadas en Gemini chat (modo Imagen, plan Pro) el 4 de noviembre de 2026 con `robot.webp` y `rival.webp` como referencia; fondo blanco recortado por relleno desde el borde y colocadas en el mismo lienzo que la pose normal (mismo alto y suelo) para que el cambio no salte. En el duelo, quien ataca pasa a esta pose al lanzarse (33 %–72 % de la secuencia) y vuelve a la guardia; el color de cada robot se aplica igual a las dos poses. 🔶 Por confirmar: revisión de los términos de uso de Gemini para material del colegio.
- Registro en `tipos/registro.ts` y `reproductor/reproductor.tsx`.
- Comandos: `npm run lint`, `npm run build`, `npm test -- --run src/features/actividades/juegos/robots/tipo.test.ts`.

## QA

- `npm run lint`: aprobado.
- `npm run build`: aprobado con Next.js 16.3.4 y TypeScript.
- `npm test`: 63 archivos y 747 pruebas aprobadas.
- Prueba específica del tipo tras el último ajuste de sonido: 2 pruebas aprobadas.
- Detector Impeccable sobre la interfaz y estilos: sin hallazgos deterministas.
- Revisión visual del duelo en navegador local mediante una ruta temporal de vista previa (retirada tras la revisión): escritorio 1280×720, móvil 390×844, selección, acierto y fallo. La respuesta se marca antes de la animación, ambos combatientes avanzan según el resultado y el texto de estado anuncia la consecuencia.
- Segunda verificación: `npm run lint`, `npm run build` y `npm test` aprobados después de incorporar el combate; 63 archivos y 747 pruebas. Detector Impeccable sin hallazgos deterministas.
- Tercera verificación: `npm run build`, `npm run lint` y `npm test` aprobados tras música, pantalla completa y repaso limitado; 63 archivos y 748 pruebas.
- QA de navegador: pantalla completa 1280×720 y 390×844; controles de música, efectos y salida visibles. Una partida perdida con dos tiempos agotados y un fallo mostró «Acertaste 0 de 3» y exactamente tres operaciones en el repaso. El detector Impeccable no reportó hallazgos.
- QA de portada: tarjeta de «Duelo de divisiones» comprobada en Matemáticas a 1280×800 y 390×844. Ambos robots y el choque central permanecen visibles en el recorte. Después de integrar la imagen, `npm run build`, `npm run lint` y `npm test` pasaron; 63 archivos y 748 pruebas.
- 🔶 Revisión de la ruta autenticada en navegador pendiente: la cuenta demo disponible al inicio de la revisión ya no aceptó la contraseña anterior; no se restableció para evitar interrumpir el acceso de otra persona.
