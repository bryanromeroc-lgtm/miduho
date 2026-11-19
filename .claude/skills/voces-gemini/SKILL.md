---
name: voces-gemini
description: Genera la voz (consigna, palabras, tarjetas, preguntas y opciones) de un juego o actividad de MIDUHO con la API de Gemini TTS de Google AI Studio (nivel gratuito), con voz latina de maestra, y la deja conectada en el juego. Si un modelo se queda sin cuota usa el siguiente gratuito. Úsala cuando el usuario diga "genera las voces", "ponle voz al juego", "la voz suena robótica", "voz de la maestra", "audio de la consigna", "voces para cada emoción/palabra/tarjeta", o cuando un juego de 1.° o 2.° no tenga grabación y dependa de la síntesis del navegador.
---

# Voces con Gemini TTS

Toda la generación pasa por `tools/voz-gemini/voz.mjs` (lee su `README.md`). Esta skill dice **cuándo** y **cómo** usarla sin repetir los errores ya vividos.

## 0. Antes de empezar

- **Lugar en la prioridad de audio** (juegos-primero, decisión 8): primero la voz capturada de la referencia si dice exactamente el texto de MIDUHO, luego la voz propia del colegio, y después esta voz generada. Siempre va **antes** que la síntesis del navegador. No reemplaces una grabación real sin que el usuario lo pida.
- **Clave:** está en `GEMINI_API_KEY_VOZ`, exportada en `~/.bashrc`. La shell de Claude no la hereda: corre siempre con `bash -ic '…'`. Comprueba solo que exista (`[ -n "$GEMINI_API_KEY_VOZ" ]`) y **nunca** la imprimas ni la escribas en archivos o en el chat. Si vale `tu-clave` o algo parecido, es el texto de ejemplo: pídele la real al usuario.
- **Dónde vive el juego:** puede estar en un worktree (p. ej. `../miduho-meses`). Pasa la ruta del JSON de ese worktree; la herramienta deduce `apps/web` desde ahí.

## 1. Simular

```bash
bash -ic 'node tools/voz-gemini/voz.mjs estado'
bash -ic 'node tools/voz-gemini/voz.mjs actividad <ruta>/curriculo/actividades/<area>/<grado>/<slug>.json --simular'
```

Revisa:
- **Textos:** que cada frase diga lo que debe oír el niño. Para la forma doble («Tranquilo/a») se usa el campo `lectura` («tranquilo o tranquila»). Si falta `lectura`, agrégala en el JSON antes de generar. La consigna se dice sin «».
- **Omitidos:** campos que la herramienta no sabe dónde poner (pares, palabras con pista). Avísalos al usuario; no inventes campos que el esquema no tiene.
- **Cupo:** cuántas frases hay frente al cupo. Cada modelo da unas 10 solicitudes al día y cada frase gasta una. No gastes cupo en pruebas que no necesitas.

## 2. Generar

```bash
bash -ic 'node tools/voz-gemini/voz.mjs actividad <ruta.json>'
```

- **Cadena de modelos:** 3.8 Flash → 3.8 Flash-Lite, ambos con la misma voz latina `es-419-tutor-3`. Si los dos se agotan, pasa al 2.5 de respaldo con la voz básica `Sulafat`, cuyo acento latino no está garantizado 🔶. El estado queda en `~/.cache/miduho-voz/agotados.json`.
- **Reanudable:** si todo se agota, repite el mismo comando cuando se renueve el cupo. Solo hace lo pendiente.
- **Respaldo:** si algo salió con voz de respaldo, díselo al usuario con el nombre de cada archivo. Cuando vuelva el cupo, cámbialo por la voz latina con `--rehacer-respaldo`. Usa `--sin-respaldo` si el usuario no quiere mezclar voces.
- **Lo que hace la herramienta:** escribe los MP3, las rutas en el JSON (`audioInstruccion`, `audio`, `audioOpciones`) y `LICENCIAS.md`. No escribas esos archivos a mano.

## 3. Verificar (no basta con que el comando termine)

1. `npx vitest run src/features/actividades/public-audio.test.ts src/server/modules/curriculo` en `apps/web` del worktree: comprueba licencias y rutas.
2. **En el navegador** (ver memoria `verificar-juego-en-navegador`): entra como admin a la vista previa (`/admin/contenido/<id-asignatura>/<grado>/actividades/<slug>`), toca «Empezar» y cada botón «Escuchar». Registra `HTMLMediaElement.play` y `speechSynthesis.speak`: cada frase debe sonar con su MP3 y ninguna con la síntesis.
3. **Claude no oye el audio.** Nunca afirmes que «suena bien» ni que el acento es latino: entrega los archivos (SendUserFile) o el juego en marcha y pide al usuario que escuche. Recuérdale recargar con Ctrl+Shift+R si se repitieron nombres de archivo.

## 4. Elegir otra voz (solo si el usuario la pide)

- **Biblioteca latina:** `bash -ic 'node tools/voz-gemini/voz.mjs voces --idioma es-419'`. No hay voces de Colombia: 53 argentinas y 33 mexicanas. **Descarta las argentinas**: su «ll» y su «y» suenan «sh» y no son adecuadas para un colegio colombiano. Para comparar, genera la misma consigna con 3 o 4 voces mexicanas con `frase`, junta los audios con ffmpeg y que el usuario elija.
- **Voces diseñadas** (`POST /v1beta/voices`, `type: "prompted"`): aunque se pida `es-CO`, la voz diseñada **salió con acento de España**. No las uses sin que el usuario las apruebe tras escucharlas.
- **Filtro de seguridad:** bloquea descripciones de voz masculina que mencionen «hablar a niños», y el modelo 3.1 bloquea cualquier nota de dirección. Describe la voz sin mencionar niños.

## 5. Reglas duras

- Solo se envía **texto pedagógico** de MIDUHO. Nunca nombres ni datos de estudiantes, docentes o acudientes, ni siquiera de ejemplo: en el nivel gratuito Google puede usar lo que se le envía.
- Los términos de uso del audio generado están 🔶 por confirmar antes de desplegar; `LICENCIAS.md` ya lo dice. No lo quites.
- No hagas commit ni push sin que el usuario lo pida.
