# captura-audio

Captura sonora de páginas de referencia para MIDUHO (cambio `openspec/changes/juegos-primero/`, decisión 2). Paso **obligatorio** del flujo `/crear-juego-referencia`, entre el estudio con REA y el diseño. No se despliega.

```bash
cd tools/captura-audio && npm i --no-fund --no-audit     # solo la primera vez
node src/cli.mjs capturar "<URL>" --slug <plataforma>-<juego> [--guion guiones/<plataforma>.mjs] [--manual 120] [--zip <url>]
node src/cli.mjs inventariar <slug>
node src/cli.mjs resumen <slug>
node src/cli.mjs adaptar <slug> <id…> --destino apps/web/public/audio/<carpeta> [--nombre a.mp3,b.mp3]
npm test                                                  # lógica pura (node:test)
```

## Qué hace cada subcomando

| Subcomando | Qué hace |
|---|---|
| `capturar` | Abre la URL en un Chrome **propio** (perfil temporal; nunca el 9222 de Gemini ni el 9333 de REA), escucha la red de la página y de todos sus `iframe`, inyecta antes de cargar un observador (`HTMLMediaElement.play`, `Audio`, `decodeAudioData`, `Howl`), busca URL de audio en scripts, JSON y HTML (también rutas armadas con un prefijo, como `base + 'ok.mp3'`) y audios `data:`. Descarga cada audio con **una petición por segundo por dominio** y un agente de usuario genérico, sin iniciar sesión. Deja `audio/originales/` y `audio/captura.json`, y crea `LICENCIA.md` desde la plantilla |
| `inventariar` | sha256 (una copia por huella), `ffprobe` (mime, duración, canales, frecuencia), sonoridad EBU R128 (`null` si dura < 0,4 s), cortes de *sprites* a `audio/cortes/`, `rol` y `evento` **inferidos** con `certeza: "inferido"`, transcripción si hay whisper. Conserva lo que una persona confirmó (`certeza` distinta de `inferido`, `transcripcion`, `uso`) |
| `resumen` | `RESUMEN.md`: conteo por rol, duración, autoría, licencia, lista «por escuchar» y usos |
| `adaptar` | Copia pistas a `apps/web/public/audio/…` en MP3 mono 44,1 kHz, sin silencio inicial, `loudnorm` a −18 LUFS (voz y efecto) o −23 LUFS (música y ambiente); escribe la fila en el `LICENCIAS.md` de destino y la ruta en `uso` |

## Dónde queda

```
content/referencias/<slug>/
  inventario.json  LICENCIA.md  RESUMEN.md     ← versionados
  audio/originales/  audio/cortes/  audio/captura.json   ← fuera de git (.gitignore), no se borran
```

`LICENCIA.md` se completa a mano (plantilla en `plantillas/LICENCIA.md`): plataforma, autoría real, licencia pública si existe o **permiso declarado por el usuario el 2026-11-10** con el soporte escrito por adjuntar 🔶. La línea `- **Estado:** …` es la que copia el inventario a cada pista.

## Guiones por plataforma (`guiones/`)

Un guion es un módulo con `export default async ({ pagina, contexto, log, esperar }) => {}` que se ejecuta tras cargar la página, para que el juego cargue su audio perezoso.

| Guion | Plataforma | Qué hace | Probado |
|---|---|---|---|
| `cokitos.mjs` | Cokitos | Va a `…/play/`, encuentra el `iframe` del autor (Wordwall, Digipuzzle…), lo abre como página propia, pulsa inicio y toca el área | Sí (2026-11-10, Wordwall) |
| `mundo-primaria.mjs` | Mundo Primaria | Acepta el muro de consentimiento (sin pagar ni iniciar sesión), abre cada «Juego N» y toca el área | Parcial: el juego no carga en el navegador automático; se capturan los efectos declarados. Para el resto, `--manual` 🔶 |
| `colombia-aprende.mjs` | Colombia Aprende | Recorre la lección y anota los paquetes `.zip`; el audio sale con `--zip` | Sí con `--zip` (el sitio bloquea navegadores sin interfaz; el `.zip` se descarga bien) |
| `comun.mjs` | — | Piezas compartidas (pulsar por texto, buscar el `iframe` del juego, tocar el área) | — |

Pendientes (tarea 1.9 de `juegos-primero`): Árbol ABC, Digipuzzle, Cristic (Canva/Genially), PhET, Code.org, Toy Theater.

## Requisitos (comprobado el 2026-11-10)

| Herramienta | Estado |
|---|---|
| Node | 26.13 ✓ |
| Chrome | `/usr/bin/google-chrome` ✓ (otro con `CHROME=`) |
| `ffmpeg` / `ffprobe` | 6.1.1 ✓ |
| `whisper` / `faster-whisper` | **No instalados**: la transcripción queda `null` y la voz va a «por escuchar» 🔶. Opcional: `pipx install faster-whisper` |
| `unzip` | ✓ (para `--zip`) |

`CAPTURA_TMP` cambia la carpeta temporal del perfil de Chrome y de los `.zip` (por defecto, la del sistema).

## Límites conocidos

- Claude no oye: `rol`, `evento` y transcripción son inferidos o vienen de metadatos del juego; todo queda «por escuchar» hasta que una persona lo marque `certeza: "confirmado"` en `inventario.json`.
- El audio que un juego genera con osciladores (Web Audio sin archivo) no se puede descargar: el observador registra `decode` sin URL.
- Las rutas declaradas en scripts pueden resolverse contra una base equivocada: tres 404 seguidos en una carpeta hacen que se omitan sus demás rutas (quedan en `notas_captura`).
