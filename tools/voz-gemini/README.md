# voz-gemini

Genera la voz de las actividades de MIDUHO con la API de Gemini (Google AI Studio, nivel gratuito) y la deja lista en el juego: MP3 en `apps/web/public/audio/actividades/<slug>/`, rutas en el JSON de la actividad y `LICENCIAS.md` con el modelo, la voz y el texto de cada archivo.

Lo usa la skill `.claude/skills/voces-gemini/`, que explica cuándo y cómo.

## Requisitos

- Clave de AI Studio en `GEMINI_API_KEY_VOZ` (exportada en `~/.bashrc`; desde Claude Code: `bash -ic 'node tools/voz-gemini/voz.mjs …'`).
- Node 22+ y `ffmpeg`.

## Comandos

```bash
node tools/voz-gemini/voz.mjs estado                      # qué modelos tienen cupo (según lo visto)
node tools/voz-gemini/voz.mjs voces --idioma es-419       # biblioteca de voces
node tools/voz-gemini/voz.mjs frase --texto "Hola." --salida /tmp/x.mp3
node tools/voz-gemini/voz.mjs actividad apps/web/curriculo/actividades/<area>/<grado>/<slug>.json --simular
node tools/voz-gemini/voz.mjs actividad apps/web/curriculo/actividades/<area>/<grado>/<slug>.json
```

Opciones de `actividad`: `--voz <id>` (por defecto `es-419-tutor-3`), `--sin-respaldo`, `--rehacer-respaldo`, `--rehacer`, `--solo clave1,clave2`, `--web <ruta a apps/web>` (se deduce del JSON), `--simular`.

## Cadena de modelos

| Orden | Modelo | Voz | Notas |
|---|---|---|---|
| 1 | `gemini-3.8-flash-tts` | biblioteca (`es-419-tutor-3`) | el más expresivo; ~10 solicitudes/día gratis |
| 2 | `gemini-3.8-flash-lite-tts` | la misma | cupo aparte; ~10/día |
| 3 | `gemini-2.5-flash-preview-tts` | básica `Sulafat` 🔶 | respaldo: acento pedido en el texto, no garantizado |
| 4 | `gemini-2.5-pro-preview-tts` | básica `Sulafat` 🔶 | sin cupo gratis al 2026-11-18 |

`gemini-3.1-flash-tts-preview` se descartó: no acepta voces de la biblioteca ni indicaciones de estilo, y bloquea la nota de dirección.

Al agotar la cuota diaria de un modelo, pasa al siguiente y lo anota en `~/.cache/miduho-voz/agotados.json` hasta la hora de renovación que da la API. Lo generado se apunta en `public/audio/actividades/<slug>/.voces.json`: volver a correr el comando solo hace lo pendiente, y `--rehacer-respaldo` cambia por la voz latina lo que salió con un modelo de respaldo.

## Qué frases genera

- `instruccion` → `audioInstruccion`
- `contenido.elementos[]` con `texto` → `audio` (dice `lectura` si existe)
- `contenido.preguntas[]` → `audio` (enunciado) y `audioOpciones`

Lo demás (pares de relaciones, palabras con pista) se informa como omitido y se hace a mano.

## Pruebas

```bash
node --test tools/voz-gemini/test/
```
