# gemini-media

Puente para que Claude genere imágenes, video y música en **Gemini chat** (gemini.google.com)
usando tu sesión, sin API key. No se despliega.

1. `./tools/gemini-media/abrir-chrome.sh` → abre Chrome con un perfil dedicado (`~/.config/miduho-gemini-chrome`, fuera del repo) y depuración en `127.0.0.1:9222`.
2. Inicia sesión en Gemini **a mano** (una sola vez; la sesión queda en el perfil).
3. Deja esa ventana abierta; Claude se conecta por CDP con `playwright-core`.

Reglas: lo generado es material del colegio → sin datos de menores, sin copiar identidad visual de terceros (AGENTS.md, reglas 1–2), con `alt` y registro de origen.
Los términos de Google pueden restringir la automatización de la interfaz 🔶 revisar antes de uso intensivo.

## Uso (lo ejecuta Claude con la skill `gemini-media`)

```bash
node tools/gemini-media/gemini.cjs estado
node tools/gemini-media/gemini.cjs generar --modo video|imagen|musica --prompt-file p.txt [--ref img.webp] --salida ruta.ext
node tools/gemini-media/gemini.cjs bajar --modo … --salida …   # re-descarga la última respuesta
```

Guía completa (prompts, verificación, optimización y registro): `.claude/skills/gemini-media/SKILL.md`.

## Recortar poses de personajes

Gemini entrega las imágenes con fondo blanco. `recortar-pose.py` quita el blanco conectado al borde y, con `--como`, coloca la pose en el mismo lienzo, altura y suelo que la pose normal del personaje (para cambiar de pose sin saltos en el juego):

```bash
python3 tools/gemini-media/recortar-pose.py pose.jpg apps/web/public/images/juegos/robots/robot-ataque.webp --como apps/web/public/images/juegos/robots/robot.webp
```

Solo necesita Pillow. Cómo se usan las poses en un juego: `.claude/skills/juegos-2d-miduho/SKILL.md`, sección «Poses».
