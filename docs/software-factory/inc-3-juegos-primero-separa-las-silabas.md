# Juegos de 1.° · «Separa las sílabas» (tarea 3.8 de `juegos-primero`)

- **Fecha:** 2026-11-19
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.8; delta `specs/actividad-separar/`)
- **Referencia funcional:** `docs/investigacion/referencia-genmagic-separa-silabas.md` (Cokitos → Genmagic «Separa sílabas», motor NeoApp/AngularJS, no Wordwall; mecánica estudiada con REA; nada copiado)
- **Captura sonora:** `content/referencias/cokitos-separar-silabas/` (`inventario.json`, `LICENCIA.md`, `RESUMEN.md`; audio fuera de git). Una sola pista (`2f96d334`, wav de 0,19 s dentro de `main.js`) sin llamada desde ningún evento: el juego es mudo en partida.
- **Personaje:** Bruno, oso de anteojos, guía de Comprensión lectora (poses reutilizadas de `cuenta-las-silabas`)

## Reparto Claude / Codex

| Quién | Qué hizo |
|---|---|
| Claude | Lectura de la tarea, hallazgo del `iframe` de Genmagic, captura sonora y licencia, decisiones con el usuario, 11 imágenes con Gemini, encargos, revisión de diff y capturas, verificación (pruebas con PostgreSQL, partida en navegador) y cierre |
| Codex (CLI) | Estudio REA e informe; construcción del tipo `separar` (esquema, lógica + pruebas, interfaz, JSON, registro, delta OpenSpec) y **las 20 voces con Gemini TTS** (3 encargos; 1 ronda de correcciones) |
| Usuario | Mecánica «tocar para cortar» (tipo nuevo), las 10 palabras propuestas, un intento por palabra con revelado, voces + efectos del quiz ilustrado; delegar las voces en Codex |

Lecciones:

- Cokitos no siempre incrusta Wordwall: leer el `iframe` de `…/play/` (aquí Genmagic). El banco de ítems de Genmagic está en `js/main.js`.
- `tools/voz-gemini` solo lee `contenido.elementos[].texto` y `preguntas`: modelar el tipo nuevo con `elementos[].texto` permitió generar las voces sin tocar la herramienta; las frases extra (lectura por sílabas) van con el subcomando `frase`.
- Cupo de Gemini TTS: 11 + 9 frases agotaron 3.8 Flash y 3.8 Flash-Lite en un día.
- Primera entrega de Codex: los huecos tocables se montaban sobre las letras (margen negativo) y tapaban letras en teléfono → revisar siempre las capturas de 390×844.
- Las rutas de `--ref` de Gemini deben ser del worktree, no del repo principal.

## Qué es

Tipo nuevo `separar`: la palabra entera con su ilustración; entre cada par de letras hay un hueco-botón (`aria-pressed`, flechas izquierda/derecha) que pone o quita un corte (barra vertical visible). Los dígrafos ch, ll y rr no tienen hueco (regla en la lógica pura). «Comprobar» da 1 punto si los cortes son exactos; siempre revela la separación (correcto │, faltaba +, sobraba ×) con explicación en `role="status"`, voz por sílabas y pose de Bruno. Campos: `elementos[]` `{ id, texto, silabas, imagen, alt, explicacion?, audio?, audioSilabas? }`, `escena?` y `efectos?` (los del quiz ilustrado).

## Contenido

10 palabras en orden: ga-to, va-ca, me-sa, ma-no, ga-lli-na, ji-ra-fa, na-ran-ja, e-le-fan-te, co-co-dri-lo, ca-mi-se-ta (del banco «sencillas» del original; sin españolismos ni hiatos). Validación docente 🔶.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/juegos/separar/` | `tipo.ts` (+ pruebas), `juego.tsx`, `separar.module.css` |
| `apps/web/src/features/actividades/{tipos/registro.ts,tipos/preguntas.ts,reproductor/*}` | Registro del tipo, esquema de efectos exportado, reglas visibles |
| `apps/web/src/features/materias/vista/ilustracion-tipo.tsx` | Dibujo del tipo en la tarjeta |
| `apps/web/curriculo/actividades/comprension-lectora/1/separa-las-silabas.json` | Actividad |
| `openspec/changes/juegos-primero/specs/actividad-separar/spec.md` | Delta |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/separa-las-silabas/gato.webp` | Gemini chat — https://gemini.google.com/app/387c6ba3228e90b6 |
| `public/images/juegos/separa-las-silabas/vaca.webp` | Gemini chat — https://gemini.google.com/app/f665f838714c2ba6 |
| `public/images/juegos/separa-las-silabas/mesa.webp` | Gemini chat — https://gemini.google.com/app/ffe9c9843552bcb4 |
| `public/images/juegos/separa-las-silabas/mano.webp` | Gemini chat — https://gemini.google.com/app/333c4f888363d984 |
| `public/images/juegos/separa-las-silabas/gallina.webp` | Gemini chat — https://gemini.google.com/app/19e658b86693e22a |
| `public/images/juegos/separa-las-silabas/jirafa.webp` | Gemini chat — https://gemini.google.com/app/1d61b8ef9a2ff1a8 |
| `public/images/juegos/separa-las-silabas/naranja.webp` | Gemini chat — https://gemini.google.com/app/b239482953b44f76 |
| `public/images/juegos/separa-las-silabas/elefante.webp` | Gemini chat — https://gemini.google.com/app/a38eec33378ab760 |
| `public/images/juegos/separa-las-silabas/cocodrilo.webp` | Gemini chat — https://gemini.google.com/app/406e8ead1dff0efc |
| `public/images/juegos/separa-las-silabas/camiseta.webp` | Gemini chat — https://gemini.google.com/app/b61d5f2c5c8e9046 |
| `public/images/juegos/separa-las-silabas/portada.webp` | Gemini chat — https://gemini.google.com/app/0e831aad4d1fa29a |
| `public/images/juegos/cuenta-las-silabas/bruno-*.webp` | Reutilizadas |
| `public/audio/actividades/separa-las-silabas/*.mp3` (20) | Gemini TTS, voz `es-419-tutor-3`, generadas por Codex: consigna y 7 palabras con `gemini-3.8-flash-tts`; elefante, cocodrilo, camiseta y 9 lecturas por sílabas con `gemini-3.8-flash-lite-tts`; `LICENCIAS.md` (términos de uso por confirmar 🔶) |
| `public/audio/juegos/parejas/*.mp3` | Efectos del quiz ilustrado (permiso declarado 2026-11-10; soporte por adjuntar 🔶) |

## Verificación (2026-11-19)

- `npm test`: 93 archivos, 943 pruebas en verde (con PostgreSQL en 5433). `npm run lint`: 0 errores (1 advertencia previa ajena). `npm run build`: compila (página temporal borrada antes).
- Partida en navegador (1440×900): 2 fallos a propósito (sin cortes; corte sobrante) → «Acertaste 8 de 10»; Bruno `duda` en los fallos y `senala` en los aciertos; «gallina» con 5 huecos (ninguno en «ll»); 0 imágenes rotas, 0 errores de consola, 0 respuestas ≥ 400. Codex: partida solo con teclado a 1920×1080, 1440×900 y 390×844; en 390, «cocodrilo» 310/310 px y documento 390/390 px (sin desborde), huecos 24×48 px, sin solapamientos; control de `cuenta-las-silabas` sin cambios.

## Pendiente 🔶

- Escuchar las 20 voces y los efectos.
- `camiseta-silabas.mp3` sin generar (cupo agotado): al revelar suena «camiseta».
- Recorrido con la cuenta `demo-primero`.
- Validación docente de las 10 palabras y de la regla de dígrafos.
- Términos de uso del audio de Gemini TTS. Soporte escrito del permiso de Genmagic/Cokitos.
