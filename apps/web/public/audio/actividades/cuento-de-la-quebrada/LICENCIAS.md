# Voces de «La piedra que cantaba»

Voz sintética generada con la API de Gemini de Google AI Studio (`tools/voz-gemini`, comando `frase`, `--sin-respaldo`, 2026-11-20) a partir del texto de MIDUHO. No es la voz de una persona real. MP3 mono 44,1 kHz, normalizado a −18 LUFS, sin silencio inicial ni final.

| Archivo | Campo del JSON | Modelo | Voz | Texto dicho |
|---|---|---|---|---|
| `instruccion.mp3` | `contenido.audioInicio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | Escucha el cuento de la quebrada. Después de cada parte, responde la pregunta. |
| `llega-la-mirla.mp3` | `escenas[0].audio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | Al amanecer, una mirla llega a la quebrada. El agua canta entre las piedras: ¡glu, glu, glu! ¿A dónde llega la mirla? |
| `agua-bajito.mp3` | `escenas[1].audio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | Bruno, el oso de anteojos, escucha la quebrada. Hoy el agua suena muy bajito. ¿Cómo suena hoy el agua? |
| `piedra-grande.mp3` | `escenas[2].audio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | Bruno y la mirla miran el agua. ¡Una piedra grande tapa el paso! ¿Qué tapa el paso del agua? |
| `madremonte.mp3` | `escenas[3].audio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | Llega la Madremonte, que cuida el monte. «Antes de mover algo, miremos con cuidado», dice. Junto a la piedra hay una ranita. ¿Por qué hay que mirar con cuidado? |
| `ranita-salta.mp3` | `escenas[4].audio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | La ranita salta a una hoja segura. Después, Bruno empuja la piedra despacio y el agua vuelve a pasar. ¿Qué pasó primero? |
| `canta-otra-vez.mp3` | `escenas[5].audio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | La quebrada canta otra vez: ¡glu, glu, glu! La mirla canta feliz desde una rama. ¿Cómo termina el cuento? |
| `secuencia.mp3` | `secuencia.audio` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | Ordena los tres momentos del cuento: inicio, nudo y desenlace. |
| `final.mp3` | `contenido.audioFinal` | `gemini-3.8-flash-tts` | `es-419-tutor-3` | La quebrada canta de nuevo y todos la escuchan con alegría. |

🔶 Nadie ha escuchado todavía las grabaciones: falta oírlas.

Términos de uso del audio generado: los de la API de Gemini de Google 🔶 (por confirmar antes de desplegar; nivel gratuito).
