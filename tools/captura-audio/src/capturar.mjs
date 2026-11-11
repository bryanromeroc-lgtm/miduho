/**
 * `capturar <url> --slug <slug> [--guion <archivo.mjs>] [--manual <s>] [--zip <url>]`
 *
 * Abre la página en un Chrome propio (perfil temporal, nunca el 9222 de
 * Gemini ni el 9333 de REA), escucha la red de la página y de sus iframe,
 * observa lo que se intenta reproducir y busca URL de audio en scripts y
 * JSON. Después descarga cada audio (una petición por segundo por dominio)
 * y deja `audio/captura.json` con lo observado. No inicia sesión.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { agruparPorHuella, crearLimitador, detectarUrlsAudio, dominio, esAudio, EXTENSIONES_AUDIO, leerSprites, nombreDesdeUrl } from "./puro.mjs";
import { carpetaReferencia } from "./rutas.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 captura-audio-educativa";
const PUBLICIDAD = /(doubleclick|googlesyndication|googletagmanager|google-analytics|adservice|adnxs|amazon-adsystem|criteo|taboola|outbrain|facebook|pubmatic|rubiconproject|openx|smartadserver|teads|seedtag|quantserve|scorecardresearch|cookiebot|consensu|fundingchoices|gstatic|youtube|ytimg|adtrafficquality|recaptcha|google\.com|googleapis|criteo|cloudflareinsights|hotjar|clarity\.ms|tiktok|twitter|pinterest)/i;
const MIME_EXT = { "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/ogg": "ogg", "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav", "audio/mp4": "m4a", "audio/aac": "aac", "audio/webm": "webm", "audio/opus": "opus", "audio/flac": "flac" };

export async function capturar(url, opciones) {
  const { slug, guion, manual, zip } = opciones;
  if (!slug) throw new Error("Falta --slug <plataforma>-<juego>");
  const dir = carpetaReferencia(slug);
  const dirAudio = join(dir, "audio");
  const dirOriginales = join(dirAudio, "originales");
  mkdirSync(dirOriginales, { recursive: true });

  const perfil = mkdtempSync(join(process.env.CAPTURA_TMP || tmpdir(), "captura-audio-perfil-"));
  const registro = { url, slug, fecha: new Date().toISOString(), frames: [], red: [], observado: [], declarado: [], datos: [], sprites: [], notas: [] };
  const textos = []; // { url, texto } de scripts/JSON/HTML para buscar audio declarado

  const contexto = await chromium.launchPersistentContext(perfil, {
    executablePath: process.env.CHROME || "/usr/bin/google-chrome",
    headless: !manual,
    viewport: { width: 1366, height: 860 },
    userAgent: UA,
    locale: "es-CO",
    args: ["--autoplay-policy=no-user-gesture-required", "--no-first-run", "--no-default-browser-check", "--mute-audio"],
  });

  try {
    await contexto.exposeBinding("__capturaAudio", (fuente, datos) => {
      registro.observado.push({ ...datos, frame: fuente.frame?.url?.() ?? null });
    });
    await contexto.addInitScript({ path: join(AQUI, "observador.js") });

    contexto.on("response", async (r) => {
      const u = r.url();
      if (u.startsWith("data:")) return;
      const tipo = (r.headers()["content-type"] || "").toLowerCase();
      const frame = safe(() => r.frame()?.url()) ?? null;
      if (esAudio(u, tipo)) {
        registro.red.push({ url: u, mime: tipo.split(";")[0] || null, estado: r.status(), frame });
        return;
      }
      const recurso = r.request().resourceType();
      if (["script", "document", "xhr", "fetch"].includes(recurso) || /json|javascript|html/.test(tipo)) {
        try {
          const texto = await r.text();
          if (texto.length < 8_000_000) textos.push({ url: u, texto, frame });
        } catch {
          /* respuesta sin cuerpo (redirección) */
        }
      }
    });

    const pagina = contexto.pages()[0] ?? (await contexto.newPage());
    await pagina.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 }).catch((e) => registro.notas.push(`navegación: ${e.message}`));
    await pagina.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await pagina.waitForTimeout(3000);

    if (guion) {
      const mod = await import(pathToFileURL(guion).href);
      try {
        await mod.default({ pagina, contexto, log: (n) => registro.notas.push(`guion: ${n}`), esperar: (ms) => pagina.waitForTimeout(ms) });
      } catch (e) {
        registro.notas.push(`guion falló: ${e.message}`);
      }
    }
    if (manual) {
      console.log(`Navegador visible durante ${manual} s: juega para que cargue el audio perezoso (acierta y falla).`);
      await pagina.waitForTimeout(Number(manual) * 1000);
    }
    await pagina.waitForTimeout(2000);
    // Lo que quedó en el DOM (<audio src>, <source>) de todos los frames.
    for (const p of contexto.pages()) {
      for (const f of p.frames()) {
        registro.frames.push({ url: f.url(), nombre: f.name() || null, padre: f.parentFrame()?.url() ?? null });
        const dom = await f.evaluate(() => [...document.querySelectorAll("audio[src], audio source[src], source[src]")].map((e) => e.src)).catch(() => []);
        for (const s of dom) if (s) registro.declarado.push({ url: s, desde: f.url(), origen_deteccion: "dom" });
      }
    }
  } finally {
    await contexto.close().catch(() => {});
    rmSync(perfil, { recursive: true, force: true });
  }

  // Audio declarado en scripts, JSON y HTML (aunque no se haya pedido).
  for (const { url: u, texto, frame } of textos) {
    if (PUBLICIDAD.test(u)) continue;
    const { urls, datos } = detectarUrlsAudio(texto, u);
    for (const a of urls) {
      const clave = a.split("/").pop().split("?")[0];
      const i = texto.indexOf(clave);
      const contexto = i >= 0 ? texto.slice(Math.max(0, i - 120), i + clave.length + 120).replace(/\s+/g, " ") : "";
      registro.declarado.push({ url: a, desde: u, origen_deteccion: "script", contexto });
    }
    for (const d of datos) registro.datos.push({ ...d, desde: u });
    const sprites = leerSprites(texto);
    if (sprites.length) registro.sprites.push({ desde: u, frame, cortes: sprites, atlas: urls.filter((x) => esAudio(x)) });
  }
  for (const o of registro.observado) {
    if (o.tipo === "howl" && o.sprite) {
      registro.sprites.push({
        desde: o.frame,
        atlas: o.src,
        cortes: Object.entries(o.sprite).map(([nombre, v]) => ({ nombre, inicio_ms: v[0], duracion_ms: v[1], bucle: Boolean(v[2]) })),
      });
    }
  }

  // Descarga: red + observado + declarado, una petición por segundo por dominio.
  const candidatos = new Map();
  const anotar = (u, origen, extra = {}) => {
    if (!u || u.startsWith("blob:") || u.startsWith("data:")) return;
    const previo = candidatos.get(u) ?? { url: u, origen_deteccion: new Set(), ...extra };
    previo.origen_deteccion.add(origen);
    candidatos.set(u, previo);
  };
  for (const r of registro.red) anotar(r.url, "red", { frame: r.frame });
  for (const o of registro.observado) for (const s of [o.src].flat()) if (s && esAudio(s)) anotar(s, "reproducido", { frame: o.frame, bucle: o.bucle });
  for (const d of registro.declarado) if (esAudio(d.url)) anotar(d.url, d.origen_deteccion, { frame: d.desde, contexto: d.contexto });

  const esperarTurno = crearLimitador({ intervaloMs: 1000 });
  const descargas = [];
  const fallosPorCarpeta = new Map(); // tres 404 seguidos en una carpeta: sus demás rutas declaradas están mal resueltas
  const carpeta = (u) => u.replace(/[^/]*$/, "");
  for (const c of candidatos.values()) {
    if (PUBLICIDAD.test(c.url)) continue;
    if ((fallosPorCarpeta.get(carpeta(c.url)) ?? 0) >= 3 && !c.origen_deteccion.has("red")) {
      registro.notas.push(`omitido (carpeta con 404 repetidos): ${c.url}`);
      continue;
    }
    await esperarTurno(c.url);
    try {
      const resp = await fetch(c.url, { headers: { "User-Agent": UA, Referer: url } });
      if (!resp.ok) {
        registro.notas.push(`no descargado (${resp.status}): ${c.url}`);
        if (resp.status === 404) fallosPorCarpeta.set(carpeta(c.url), (fallosPorCarpeta.get(carpeta(c.url)) ?? 0) + 1);
        continue;
      }
      fallosPorCarpeta.set(carpeta(c.url), 0);
      const cuerpo = Buffer.from(await resp.arrayBuffer());
      const mime = (resp.headers.get("content-type") || "").split(";")[0].toLowerCase();
      if (!esAudio(c.url, mime) || cuerpo.length < 200) {
        registro.notas.push(`descartado (no es audio, ${mime || "sin tipo"}): ${c.url}`);
        continue;
      }
      descargas.push({ ...guardar(dirOriginales, cuerpo, nombreDesdeUrl(c.url), mime), url: c.url, origen_deteccion: [...c.origen_deteccion], frame: c.frame ?? null, bucle: Boolean(c.bucle), contexto: c.contexto ?? "" });
    } catch (e) {
      registro.notas.push(`error al descargar ${c.url}: ${e.message}`);
    }
  }
  registro.datos.forEach((d, i) => {
    const cuerpo = Buffer.from(d.base64, "base64");
    descargas.push({ ...guardar(dirOriginales, cuerpo, `data-${i}.${MIME_EXT[d.mime] ?? "bin"}`, d.mime), url: `data:${d.mime} (en ${d.desde})`, origen_deteccion: "data", frame: d.desde });
  });

  if (zip) descargas.push(...(await desdeZip(zip, dirOriginales, esperarTurno, registro)));

  const archivos = agruparPorHuella(descargas);
  registro.archivos = archivos.map((a) => ({ ...a, archivo: relative(dir, a.ruta) }));
  registro.autor_dominio = autoria(registro);
  for (const d of registro.datos) delete d.base64; // ya está guardado en disco
  writeFileSync(join(dirAudio, "captura.json"), JSON.stringify(registro, null, 2));
  console.log(`Capturados ${archivos.length} audios distintos de ${candidatos.size} URL candidatas · autoría: ${registro.autor_dominio}`);
  if (registro.notas.length) console.log(registro.notas.map((n) => `  · ${n}`).join("\n"));
  return registro;
}

function guardar(dir, cuerpo, nombre, mime) {
  const sha256 = createHash("sha256").update(cuerpo).digest("hex");
  let ext = extname(nombre).slice(1).toLowerCase();
  if (!EXTENSIONES_AUDIO.includes(ext)) ext = MIME_EXT[mime] ?? "bin";
  const base = basename(nombre, extname(nombre)).slice(0, 60) || "audio";
  const previo = readdirSync(dir).find((n) => n.startsWith(`${sha256.slice(0, 8)}-`));
  const ruta = previo ? join(dir, previo) : join(dir, `${sha256.slice(0, 8)}-${base}.${ext}`);
  if (!existsSync(ruta)) writeFileSync(ruta, cuerpo);
  return { sha256, ruta, bytes: cuerpo.length, mime: mime || null };
}

async function desdeZip(urlZip, dirOriginales, esperarTurno, registro) {
  const tmp = mkdtempSync(join(process.env.CAPTURA_TMP || tmpdir(), "captura-audio-zip-"));
  const salida = [];
  try {
    await esperarTurno(urlZip);
    const resp = await fetch(urlZip, { headers: { "User-Agent": UA } });
    if (!resp.ok) {
      registro.notas.push(`zip no descargado (${resp.status}): ${urlZip}`);
      return salida;
    }
    const archivoZip = join(tmp, "paquete.zip");
    writeFileSync(archivoZip, Buffer.from(await resp.arrayBuffer()));
    execFileSync("unzip", ["-q", "-o", archivoZip, "-d", join(tmp, "x")]);
    for (const ruta of recorrer(join(tmp, "x"))) {
      if (!esAudio(ruta)) continue;
      const cuerpo = readFileSync(ruta);
      const dentro = relative(join(tmp, "x"), ruta);
      salida.push({ ...guardar(dirOriginales, cuerpo, basename(ruta), null), url: `${urlZip}#${dentro}`, origen_deteccion: "zip", frame: null, bucle: false });
    }
    registro.notas.push(`zip: ${salida.length} audios en el paquete`);
  } catch (e) {
    registro.notas.push(`zip falló: ${e.message}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return salida;
}

function* recorrer(dir) {
  for (const n of readdirSync(dir)) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) yield* recorrer(r);
    else yield r;
  }
}

/** El dominio del documento que aloja el juego: de donde vino el audio; si no hubo, el primer iframe que no es publicidad. */
function autoria(registro) {
  const cuenta = new Map();
  for (const a of registro.archivos) {
    const d = dominio(a.frame ?? "") ?? dominio(a.urls[0]);
    if (d) cuenta.set(d, (cuenta.get(d) ?? 0) + 1);
  }
  if (cuenta.size) return [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const iframe = registro.frames.find((f) => f.padre && /^https?:/.test(f.url) && !PUBLICIDAD.test(f.url));
  return dominio(iframe?.url ?? registro.url);
}

function safe(f) {
  try {
    return f();
  } catch {
    return undefined;
  }
}

