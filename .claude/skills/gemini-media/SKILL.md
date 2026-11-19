---
name: gemini-media
description: Genera imágenes, videos y música para MIDUHO usando Gemini chat (gemini.google.com) con la sesión del usuario, sin API key, controlando su Chrome por CDP. Úsala cuando haga falta un recurso visual o sonoro nuevo para la plataforma o un juego (ilustración, personaje, fondo, portada, intro en video, pista musical, efecto ambiental), o cuando el usuario diga "genera con Gemini", "crea un video/imagen/música", "intro", "portada", "pista para el juego".
---

# Medios con Gemini chat

Claude controla la pestaña de Gemini del Chrome dedicado del usuario y descarga el resultado al repo. Todo pasa por `tools/gemini-media/gemini.cjs`; esta skill dice **cuándo** y **cómo** usarlo bien.

## 0. Preparar la conexión

```bash
node tools/gemini-media/gemini.cjs estado
```

- `No hay Chrome en …` → lanza `setsid nohup tools/gemini-media/abrir-chrome.sh >/dev/null 2>&1 &`, espera ~6 s y repite.
- `sesión NO iniciada` → **para y pídele al usuario** que inicie sesión en esa ventana. Nunca escribas credenciales de Google ni intentes saltar verificaciones.
- Plan observado: Gemini Pro (imagen, video y música disponibles). Cada generación gasta cuota del usuario: no hagas pruebas gratuitas ni variantes que nadie pidió.

## 1. Partir de lo que ya existe (homogeneidad)

Antes de escribir el prompt, busca los recursos del mismo juego o sección (`apps/web/public/images/…`, `video/…`, `audio/…`, y el doc del incremento en `docs/software-factory/`). **Míralos** con Read y pásalos como `--ref`: la portada o una escena con los personajes y el escenario es la mejor referencia. Describe en el prompt lo que se ve (colores, rasgos, lugar), no nombres de archivo.

## 2. Escribir el prompt

Guárdalo en un archivo del scratchpad (evita problemas de comillas) y en español. Estructura:

1. **Formato:** duración/relación de aspecto/fondo.
2. **Estilo y referencia:** «Usa EXACTAMENTE el estilo, los personajes y el escenario de la imagen adjunta: …».
3. **Contenido / acción** por tiempos (video) o composición (imagen) o instrumentación y ánimo (música).
4. **Restricciones fijas:** `Sin texto, sin letras, sin logotipos, sin personas.` (video: `sin voces`; música: `Sin voces ni letra` salvo que se pida canción).

Reglas del proyecto (AGENTS.md) que el prompt debe respetar:

- **Nada de menores reales ni datos personales**; tampoco personas reconocibles. Personajes = robots, animales, objetos o figuras genéricas.
- **Sin referencias a marcas, franquicias, artistas ni estilos protegidos** (nada de «estilo Pixar», «como Mario», «al estilo de <artista>», ni «videojuego retro»: Gemini rechazó ese prompt de música). Describe el sonido o la imagen con palabras propias.
- **Ningún texto pedagógico dentro del medio** (regla 3): títulos, operaciones y consignas van como HTML. Por eso siempre «sin texto».
- Tono amistoso, sin violencia, apto para primaria.

## 3. Generar

```bash
node tools/gemini-media/gemini.cjs generar --modo video|imagen|musica \
  --prompt-file "$SCRATCH/prompt.txt" --ref ruta/portada.webp [--ref otra.webp] \
  --salida "$SCRATCH/<nombre>.<ext>" [--espera 600]
```

- Descarga primero al **scratchpad**; al repo solo va lo aprobado y optimizado.
- Corre con `timeout` alto (video ~2 min; música ~1 min; imagen ~30 s).
- El script imprime la URL de la conversación: dásela al usuario.
- Si la descarga falla pero Gemini sí generó, usa `bajar --modo … --salida …` (toma la última respuesta de la pestaña abierta).
- `Gemini rechazó la petición` → reformula quitando nombres propios, estilos o palabras ambiguas; no insistas con el mismo texto.
- Si falla la interfaz, mira `<salida>.error.png` y ajusta los selectores en `gemini.cjs` (Gemini cambia sin aviso).

Lo que entrega Gemini (observado el 4 de noviembre de 2026):

| Modo | Resultado | Ojo |
|---|---|---|
| `video` | MP4 H.264 + AAC, 1280×720, ~10 s, con música y efectos | Sin marca visible. El último cuadro tiende a parecerse a la referencia. |
| `imagen` | JPEG a tamaño completo (~2000 px) vía «Descargar imagen a tamaño completo» | Siempre JPEG aunque pidas `.png`; **fondo blanco, no transparente**. |
| `musica` | MP4 con carátula + AAC, ~3 min | Con salida `.mp3/.m4a/.ogg/.opus` el script extrae solo el audio con ffmpeg. |

## 4. Verificar antes de mostrar

- **Imagen:** miniatura con ffmpeg (`-vf scale=400:-1`) y míralas con Read.
- **Video:** `ffprobe` (duración, códecs) + hoja de cuadros `ffmpeg -i x.mp4 -vf "fps=1,scale=320:-1,tile=5x2" -frames:v 1 hoja.png` y el último cuadro a tamaño completo. Busca: personajes deformados, texto o marcas espurias, cambios de estilo.
- **Audio:** `ffmpeg -i x.mp3 -af volumedetect -f null -` (pico cercano a −1/−3 dB, sin silencio). Tú no puedes escucharlo: dile al usuario que lo oiga antes de integrarlo.
- Si no cumple, reformula y genera de nuevo **una** vez; si sigue mal, muestra lo que hay y pregunta.

## 5. Optimizar y guardar en el repo

| Tipo | Destino | Conversión |
|---|---|---|
| Imagen | `apps/web/public/images/<sección>/…webp` | `ffmpeg -i in.jpg -c:v libwebp -quality 82 out.webp` (reduce ancho si no se necesita) |
| Video | `apps/web/public/video/<sección>/…mp4` + `…-poster.webp` | `-c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart` |
| Personaje / pose | `apps/web/public/images/juegos/<tipo>/<personaje>-<pose>.webp` | `tools/gemini-media/recortar-pose.py` (ver abajo) |
| Música | `apps/web/public/audio/<sección>/…mp3` | `-af "loudnorm=I=-24:TP=-2,afade=t=out:st=…:d=2" -t <fin sin silencio> -c:a libmp3lame -q:a 5 -map_metadata -1` |

Nombres en español, minúsculas y con guiones.

### Personajes y poses (sprites con fondo transparente)

Gemini entrega fondo blanco. Para un personaje o una pose que va sobre un escenario (p. ej. la pose de ataque de un robot):

1. Prompt con «fondo blanco totalmente liso y plano, sin sombra en el suelo y sin ningún otro elemento», «Usa EXACTAMENTE el mismo personaje de la imagen adjunta» + colores y rasgos, la pose con **dirección explícita** («hacia la DERECHA/IZQUIERDA de la imagen») y «Sin efectos, sin líneas de movimiento, sin destellos». `--ref` = la imagen actual del personaje exportada a PNG sobre blanco.
2. Recorta y encaja con:
   ```bash
   python3 tools/gemini-media/recortar-pose.py "$SCRATCH/pose.jpg" apps/web/public/images/juegos/<tipo>/<personaje>-<pose>.webp --como apps/web/public/images/juegos/<tipo>/<personaje>.webp
   ```
   Quita solo el blanco conectado al borde (conserva brillos internos), suaviza el halo y coloca la pose en el mismo lienzo, altura y suelo que la pose normal, para que no salte al cambiar. Sin `--como`, solo recorta. Necesita únicamente Pillow.
3. Mírala sobre un fondo oscuro antes de usarla (halo blanco, partes borradas). Peso esperado ~100 KB.
4. Cómo se monta en el juego (dos estados y cambio sincronizado): sección «Poses» de `.claude/skills/juegos-2d-miduho/SKILL.md`.

Observado el 4 de noviembre de 2026: con la imagen del personaje como referencia, Gemini conservó paleta, visor, proporciones y la dirección pedida en el primer intento para los dos robots del Duelo.

## 6. Registrar el origen

En el doc del incremento (`docs/software-factory/inc-*.md`, sección «Archivos») agrega una línea por recurso: ruta, formato y peso, «generado en Gemini chat (modo X) el <fecha>», referencias usadas y una frase de lo que muestra. Marca con 🔶 lo pendiente (integración, revisión de términos de uso de Gemini para material del colegio).

## 7. Al integrar en la interfaz (otra tarea, con `impeccable`)

Imágenes informativas con `alt`, decorativas con `alt=""`. Video: control para saltar u omitir con teclado, sin autoplay con sonido, respeta `prefers-reduced-motion` y el silencio del juego, descripción en texto. Música: apagable por separado de los efectos, normalizada a ~−23 LUFS (`loudnorm=I=-24:TP=-2`), sin silencio final y con fundido de 2 s si va en bucle, `<audio loop preload="none">` que arranca al empezar a jugar (ejemplo: `musica-duelo.mp3` en `juegos/robots/juego.tsx`). En juegos, sigue el estándar de `juegos-2d-miduho`.
