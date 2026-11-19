#!/usr/bin/env node
// Voces de los juegos con la API de Gemini (Google AI Studio, nivel gratuito).
// La clave va en GEMINI_API_KEY_VOZ (en ~/.bashrc: correr con `bash -ic`).
//
//   node tools/voz-gemini/voz.mjs estado
//   node tools/voz-gemini/voz.mjs voces [--idioma es-419]
//   node tools/voz-gemini/voz.mjs frase --texto "Hola." --salida /ruta/x.mp3 [--voz es-419-tutor-3] [--modelo …]
//   node tools/voz-gemini/voz.mjs actividad <ruta/actividad.json> [--web apps/web] [--voz …]
//        [--sin-respaldo] [--rehacer-respaldo] [--rehacer] [--solo clave1,clave2] [--simular]
//
// `actividad` genera la consigna y cada elemento/pregunta/opción, guarda MP3 en
// public/audio/actividades/<slug>/, pone las rutas en el JSON y escribe LICENCIAS.md.
// Es reanudable: lo ya hecho (mismo texto y voz) no se repite.
// Si un modelo agota su cuota diaria pasa al siguiente (ver MODELOS en lib.mjs)
// y lo recuerda en ~/.cache/miduho-voz/agotados.json hasta que se renueve.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ESTILO, MODELOS, NOTA_RESPALDO, VOZ_BASICA, VOZ_LATINA,
  aplicarRutas, cadena, frasesDeActividad, leerError, licencias,
} from "./lib.mjs";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const ESTADO = join(homedir(), ".cache", "miduho-voz", "agotados.json");

function argumentos(lista) {
  const a = { _: [] };
  for (let i = 0; i < lista.length; i++) {
    if (!lista[i].startsWith("--")) { a._.push(lista[i]); continue; }
    const k = lista[i].slice(2);
    const v = lista[i + 1];
    if (v === undefined || v.startsWith("--")) a[k] = true;
    else { a[k] = v; i++; }
  }
  return a;
}

function clave() {
  const k = process.env.GEMINI_API_KEY_VOZ;
  if (!k) throw new Error("Falta GEMINI_API_KEY_VOZ (si está en ~/.bashrc, correr con: bash -ic 'node tools/voz-gemini/voz.mjs …')");
  return k;
}

const leerJson = (r, d) => { try { return JSON.parse(readFileSync(r, "utf8")); } catch { return d; } };
const agotados = () => leerJson(ESTADO, {});
function marcarAgotado(modelo, hasta) {
  const e = agotados();
  e[modelo] = hasta;
  mkdirSync(dirname(ESTADO), { recursive: true });
  writeFileSync(ESTADO, JSON.stringify(e, null, 2));
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(ruta, cuerpo) {
  const r = await fetch(BASE + ruta, {
    method: cuerpo ? "POST" : "GET",
    headers: { "x-goog-api-key": clave(), "Content-Type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await r.text();
  let json = null;
  try { json = JSON.parse(texto); } catch { /* cuerpo no JSON */ }
  return { status: r.status, ok: r.ok, texto, json };
}

/** Una frase con un modelo concreto. Devuelve { datos: Buffer, formato: "wav"|"pcm" } o lanza { error }. */
async function sintetizar(modelo, texto, voz) {
  if (modelo.api === "interactions") {
    const r = await pedir("/interactions", {
      model: modelo.id,
      input: [{ type: "user_input", content: [{ type: "text", text: texto, annotations: [{ type: "speech_metadata", style: ESTILO }] }] }],
      response_format: { type: "audio", mime_type: "audio/wav" },
      generation_config: { speech_config: [{ voice: voz }] },
    });
    if (!r.ok) throw { status: r.status, cuerpo: r.texto };
    const audio = (r.json.steps ?? []).filter((s) => s.type === "model_output").flatMap((s) => s.content ?? []).find((c) => c.type === "audio" && c.data);
    if (!audio) throw { status: 200, cuerpo: r.texto.slice(0, 500) };
    return { datos: Buffer.from(audio.data, "base64"), formato: "wav" };
  }
  const r = await pedir(`/models/${modelo.id}:generateContent`, {
    contents: [{ parts: [{ text: NOTA_RESPALDO + texto }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOZ_BASICA } } } },
  });
  if (!r.ok) throw { status: r.status, cuerpo: r.texto };
  const parte = r.json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!parte) throw { status: 200, cuerpo: r.texto.slice(0, 500) };
  return { datos: Buffer.from(parte.inlineData.data, "base64"), formato: "pcm" };
}

/** Recorre la cadena de modelos hasta que uno responda. */
async function decir(texto, { voz = VOZ_LATINA, sinRespaldo = false, soloModelo } = {}) {
  for (;;) {
    const opciones = cadena({ agotados: agotados(), sinRespaldo, soloModelo });
    if (!opciones.length) return { agotado: true };
    const modelo = opciones[0];
    let intentos = 0;
    for (;;) {
      try {
        const r = await sintetizar(modelo, texto, voz);
        return { ...r, modelo: modelo.id, voz: modelo.respaldo ? VOZ_BASICA : voz };
      } catch (e) {
        if (!e || typeof e.status !== "number") throw e;
        const err = leerError(e.status, e.cuerpo);
        if (err.tipo === "dia") {
          marcarAgotado(modelo.id, err.hasta);
          console.warn(`  · ${modelo.id}: cuota diaria agotada hasta ${new Date(err.hasta).toLocaleString("es-CO")}; paso al siguiente`);
          break;
        }
        if (err.tipo === "minuto" && intentos < 3) { intentos++; await dormir(err.esperaMs); continue; }
        if ([500, 503].includes(e.status) && intentos < 2) { intentos++; await dormir(5000 * intentos); continue; }
        if (err.tipo === "bloqueo") throw new Error(`bloqueada por el filtro de seguridad: «${texto}»`);
        if (e.status === 429) { marcarAgotado(modelo.id, Date.now() + 3600_000); break; } // sin cupo en este nivel
        throw new Error(`${modelo.id} ${e.status}: ${String(e.cuerpo).slice(0, 300)}`);
      }
    }
  }
}

/** WAV o PCM (s16le 24 kHz mono) → MP3 mono 44,1 kHz, −18 LUFS, sin silencios en los extremos. */
function aMp3({ datos, formato }, salida) {
  const dir = mkdtempSync(join(tmpdir(), "voz-"));
  const entrada = join(dir, formato === "wav" ? "e.wav" : "e.pcm");
  writeFileSync(entrada, datos);
  mkdirSync(dirname(salida), { recursive: true });
  const filtro = "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-1.5";
  const ent = formato === "wav" ? ["-i", entrada] : ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", entrada];
  const r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", ...ent, "-af", filtro, "-ar", "44100", "-ac", "1", "-b:a", "96k", salida]);
  rmSync(dir, { recursive: true, force: true });
  if (r.status !== 0) throw new Error("ffmpeg: " + r.stderr.toString());
}

async function actividad(ruta, a) {
  const archivo = resolve(ruta);
  const act = JSON.parse(readFileSync(archivo, "utf8"));
  if (!act.slug) throw new Error("la actividad no tiene slug");
  const web = resolve(a.web ?? (archivo.includes("/apps/web/") ? archivo.slice(0, archivo.indexOf("/apps/web/") + 9) : join(RAIZ, "apps/web")));
  const carpeta = join(web, "public", "audio", "actividades", act.slug);
  const publica = `/audio/actividades/${act.slug}`;
  const rutaManifiesto = join(carpeta, ".voces.json");
  const manifiesto = leerJson(rutaManifiesto, {});
  const voz = a.voz ?? VOZ_LATINA;
  const solo = a.solo ? new Set(String(a.solo).split(",")) : null;
  const { frases, omitidos } = frasesDeActividad(act);
  if (omitidos.length) console.warn(`Sin voz automática (revisar a mano): ${omitidos.join(", ")}`);

  const pendientes = frases.filter((f) => {
    if (solo && !solo.has(f.clave)) return false;
    const hecho = manifiesto[f.clave];
    if (!hecho || a.rehacer || !existsSync(join(carpeta, hecho.archivo))) return true;
    if (hecho.texto !== f.texto) return true;
    if (a["rehacer-respaldo"] && MODELOS.find((m) => m.id === hecho.modelo)?.respaldo) return true;
    return !MODELOS.find((m) => m.id === hecho.modelo)?.respaldo && hecho.voz !== voz;
  });
  console.log(`${act.titulo}: ${frases.length} frases, ${pendientes.length} por generar → ${carpeta}`);
  if (a.simular) { pendientes.forEach((f) => console.log(`  ${f.clave}: ${f.texto}`)); return; }

  let faltan = 0;
  for (const f of pendientes) {
    const r = await decir(f.texto, { voz, sinRespaldo: Boolean(a["sin-respaldo"]) });
    if (r.agotado) { faltan = pendientes.length - pendientes.indexOf(f); console.warn(`Todos los modelos sin cupo: faltan ${faltan}. Repetir el mismo comando cuando se renueve.`); break; }
    const nombre = `${f.clave}.mp3`;
    aMp3(r, join(carpeta, nombre));
    manifiesto[f.clave] = { archivo: nombre, modelo: r.modelo, voz: r.voz, texto: f.texto };
    writeFileSync(rutaManifiesto, JSON.stringify(manifiesto, null, 2) + "\n");
    console.log(`  ok ${nombre}  (${r.modelo}${MODELOS.find((m) => m.id === r.modelo)?.respaldo ? ", RESPALDO 🔶" : ""})`);
  }

  const vigentes = Object.fromEntries(frases.filter((f) => manifiesto[f.clave] && existsSync(join(carpeta, manifiesto[f.clave].archivo))).map((f) => [f.clave, `${publica}/${manifiesto[f.clave].archivo}`]));
  writeFileSync(archivo, JSON.stringify(aplicarRutas(act, vigentes, frases), null, 2) + "\n");
  const enUso = Object.fromEntries(Object.entries(manifiesto).filter(([k]) => vigentes[k]));
  writeFileSync(join(carpeta, "LICENCIAS.md"), licencias(act.titulo, enUso, new Date().toISOString().slice(0, 10)));
  const respaldo = Object.values(enUso).filter((x) => MODELOS.find((m) => m.id === x.modelo)?.respaldo).length;
  console.log(`Listo: ${Object.keys(vigentes).length}/${frases.length} con voz${respaldo ? `, ${respaldo} con voz de respaldo 🔶` : ""}${faltan ? `, ${faltan} pendientes` : ""}.`);
}

const a = argumentos(process.argv.slice(2));
const [cmd, ...resto] = a._;
if (cmd === "estado") {
  const e = agotados();
  for (const m of MODELOS) console.log(`${m.id.padEnd(30)} ${e[m.id] && e[m.id] > Date.now() ? "agotado hasta " + new Date(e[m.id]).toLocaleString("es-CO") : "disponible (según lo visto)"}${m.respaldo ? "  [respaldo: voz básica]" : ""}`);
} else if (cmd === "voces") {
  const q = new URLSearchParams({ page_size: "1000" });
  q.append("language_code", a.idioma ?? "es-419");
  const r = await pedir(`/voices?${q}`);
  if (!r.ok) throw new Error(r.texto);
  for (const v of r.json.voices ?? []) console.log([v.id, v.accent, v.gender, v.pitch, v.description].join(" | "));
} else if (cmd === "frase") {
  if (!a.texto || !a.salida) throw new Error("uso: frase --texto … --salida …mp3");
  const r = await decir(a.texto, { voz: a.voz ?? VOZ_LATINA, soloModelo: a.modelo, sinRespaldo: Boolean(a["sin-respaldo"]) });
  if (r.agotado) throw new Error("todos los modelos sin cupo");
  aMp3(r, resolve(a.salida));
  console.log(`ok ${a.salida} (${r.modelo}, ${r.voz})`);
} else if (cmd === "actividad" && resto[0]) {
  await actividad(resto[0], a);
} else {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 16).join("\n").replace(/^\/\/ ?/gm, ""));
}
