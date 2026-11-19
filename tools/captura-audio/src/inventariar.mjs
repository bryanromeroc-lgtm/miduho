/**
 * `inventariar <slug>`: de `audio/captura.json` a `inventario.json`.
 * ffprobe (mime, duración, canales, frecuencia), sonoridad EBU R128, cortes
 * de sprites a `audio/cortes/`, rol y evento inferidos y transcripción si hay
 * whisper. Conserva lo que una persona ya confirmó en un inventario previo.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { inferirRol, leerSonoridad } from "./puro.mjs";
import { carpetaReferencia } from "./rutas.mjs";

export function sondear(ruta) {
  try {
    const salida = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration,format_name:stream=codec_name,channels,sample_rate", "-of", "json", ruta], { encoding: "utf8" });
    const d = JSON.parse(salida);
    const s = (d.streams ?? []).find((x) => x.channels) ?? {};
    return {
      duracion_s: d.format?.duration ? Math.round(Number(d.format.duration) * 1000) / 1000 : null,
      canales: s.channels ?? null,
      frecuencia_hz: s.sample_rate ? Number(s.sample_rate) : null,
      codec: s.codec_name ?? null,
    };
  } catch {
    return { duracion_s: null, canales: null, frecuencia_hz: null, codec: null, ilegible: true };
  }
}

export function sonoridad(ruta, duracion_s = null) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", ruta, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" });
  return leerSonoridad(`${r.stderr}`, duracion_s);
}

function whisperDisponible() {
  for (const cmd of ["faster-whisper", "whisper"]) {
    if (spawnSync("which", [cmd]).status === 0) return cmd;
  }
  return null;
}

function transcribir(cmd, ruta, tmp) {
  try {
    if (cmd === "whisper") {
      execFileSync("whisper", [ruta, "--language", "es", "--model", "small", "--output_format", "txt", "--output_dir", tmp], { stdio: "ignore" });
      return readFileSync(join(tmp, `${basename(ruta).replace(/\.[^.]+$/, "")}.txt`), "utf8").trim() || null;
    }
    const salida = execFileSync("faster-whisper", [ruta, "--language", "es", "--output_format", "txt", "--output_dir", tmp], { encoding: "utf8" });
    return salida.trim() || null;
  } catch {
    return null;
  }
}

const MIME = { mp3: "audio/mpeg", ogg: "audio/ogg", vorbis: "audio/ogg", opus: "audio/ogg", wav: "audio/wav", pcm_s16le: "audio/wav", aac: "audio/aac", m4a: "audio/mp4", webm: "audio/webm", flac: "audio/flac" };

export function inventariar(slug) {
  const dir = carpetaReferencia(slug);
  const captura = JSON.parse(readFileSync(join(dir, "audio", "captura.json"), "utf8"));
  const previoRuta = join(dir, "inventario.json");
  const previo = existsSync(previoRuta) ? JSON.parse(readFileSync(previoRuta, "utf8")) : { pistas: [] };
  const confirmadas = new Map(previo.pistas.map((p) => [p.id, p]));
  const licencia = estadoLicencia(dir);
  const cmdWhisper = whisperDisponible();
  const dirCortes = join(dir, "audio", "cortes");
  const pistas = [];
  const usados = new Set();
  const idDe = (sha, sufijo = "") => {
    let id = `${sha.slice(0, 8)}${sufijo}`;
    while (usados.has(id)) id += "x";
    usados.add(id);
    return id;
  };

  for (const a of captura.archivos ?? []) {
    const ruta = join(dir, a.archivo);
    const sonda = sondear(ruta);
    // El nombre para inferir lleva la ruta de la URL: «…/tts/es-es-…/x.mp3» dice más que «x.mp3».
    const nombre = `${safePath(a.urls[0])} ${basename(a.archivo).replace(/^[0-9a-f]{8}-/, "")}`;
    const id = idDe(a.sha256);
    pistas.push(
      fusionar(confirmadas.get(id), {
        id,
        archivo: a.archivo,
        urls: a.urls,
        pagina: captura.url,
        autor_dominio: captura.autor_dominio,
        sha256: a.sha256,
        mime: a.mime && a.mime !== "application/octet-stream" ? a.mime : MIME[sonda.codec] ?? null,
        duracion_s: sonda.duracion_s,
        canales: sonda.canales,
        frecuencia_hz: sonda.frecuencia_hz,
        sonoridad_lufs: sonda.ilegible ? null : sonoridad(ruta, sonda.duracion_s),
        ...inferirRol({ nombre, duracion_s: sonda.duracion_s, bucle: a.bucle, contexto: a.contexto }),
        transcripcion: null,
        licencia,
        uso: [],
        origen_deteccion: a.origen_deteccion,
        ...(sonda.ilegible ? { nota: "ffprobe no pudo leerlo 🔶" } : {}),
      }),
    );

    // Sprites cuyo atlas es este archivo: una pista por corte.
    for (const s of captura.sprites ?? []) {
      const atlas = [s.atlas].flat().filter(Boolean);
      if (!atlas.some((u) => a.urls.includes(u))) continue;
      mkdirSync(dirCortes, { recursive: true });
      for (const c of s.cortes) {
        const archivoCorte = join(dirCortes, `${a.sha256.slice(0, 8)}-${c.nombre.replace(/[^\w-]+/g, "-")}.mp3`);
        execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", String(c.inicio_ms / 1000), "-t", String(c.duracion_ms / 1000), "-i", ruta, "-c:a", "libmp3lame", "-q:a", "2", archivoCorte]);
        const sc = sondear(archivoCorte);
        const idCorte = idDe(a.sha256, `-${c.nombre}`);
        pistas.push(
          fusionar(confirmadas.get(idCorte), {
            id: idCorte,
            archivo: relative(dir, archivoCorte),
            urls: a.urls,
            pagina: captura.url,
            autor_dominio: captura.autor_dominio,
            sha256: a.sha256,
            mime: "audio/mpeg",
            duracion_s: sc.duracion_s,
            canales: sc.canales,
            frecuencia_hz: sc.frecuencia_hz,
            sonoridad_lufs: sonoridad(archivoCorte, sc.duracion_s),
            ...inferirRol({ nombre: c.nombre, duracion_s: sc.duracion_s, bucle: c.bucle }),
            transcripcion: null,
            licencia,
            uso: [],
            origen_deteccion: a.origen_deteccion,
            sprite: { atlas: a.archivo, inicio_ms: c.inicio_ms, duracion_ms: c.duracion_ms },
          }),
        );
      }
    }
  }

  if (cmdWhisper) {
    const tmp = join(dir, "audio", ".whisper");
    mkdirSync(tmp, { recursive: true });
    for (const p of pistas) {
      if (p.rol === "voz" && p.transcripcion == null) {
        const t = transcribir(cmdWhisper, join(dir, p.archivo), tmp);
        if (t) Object.assign(p, { transcripcion: t, certeza_transcripcion: "transcripción automática" });
      }
    }
  }

  const inventario = {
    slug,
    pagina: captura.url,
    autor_dominio: captura.autor_dominio,
    fecha_captura: captura.fecha,
    herramienta: "tools/captura-audio",
    transcripcion_automatica: cmdWhisper ?? "no disponible (sin whisper) 🔶",
    licencia,
    ...(pistas.length === 0 ? { nota: "sin audio observado" } : {}),
    notas_captura: captura.notas ?? [],
    frames: [...new Set((captura.frames ?? []).map((f) => f.url).filter((u) => /^https?:/.test(u)))],
    pistas,
  };
  writeFileSync(previoRuta, `${JSON.stringify(inventario, null, 2)}\n`);
  console.log(`Inventario: ${pistas.length} pistas → ${relative(process.cwd(), previoRuta)}`);
  return inventario;
}

/** Lo que una persona confirmó (certeza ≠ inferido, transcripción, uso) gana sobre lo inferido. */
function fusionar(previo, nuevo) {
  if (!previo) return nuevo;
  const r = { ...nuevo, uso: previo.uso ?? [] };
  if (previo.certeza && previo.certeza !== "inferido") Object.assign(r, { rol: previo.rol, evento: previo.evento, certeza: previo.certeza });
  if (previo.transcripcion != null) Object.assign(r, { transcripcion: previo.transcripcion, certeza_transcripcion: previo.certeza_transcripcion });
  if (previo.licencia && previo.licencia !== nuevo.licencia && previo.licencia_confirmada) r.licencia = previo.licencia;
  return r;
}

/** Lee la línea «- **Estado:** …» de LICENCIA.md; sin ella, «por registrar 🔶». */
export function estadoLicencia(dir) {
  const ruta = join(dir, "LICENCIA.md");
  if (!existsSync(ruta)) return "por registrar 🔶 (falta LICENCIA.md)";
  const m = readFileSync(ruta, "utf8").match(/^\s*-\s*\*\*Estado:\*\*\s*(.+)$/m);
  return m ? m[1].trim() : "por registrar 🔶";
}

function safePath(u) {
  try {
    return new URL(u).pathname;
  } catch {
    return "";
  }
}
