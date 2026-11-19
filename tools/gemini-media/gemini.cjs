#!/usr/bin/env node
// Controla Gemini chat (gemini.google.com) en el Chrome abierto por abrir-chrome.sh,
// vía CDP, para generar imagen, video o música con la sesión del usuario.
//
//   node tools/gemini-media/gemini.cjs estado
//   node tools/gemini-media/gemini.cjs generar --modo video|imagen|musica \
//        --prompt-file prompt.txt [--ref a.webp --ref b.webp] --salida ruta.ext [--espera 600]
//   node tools/gemini-media/gemini.cjs bajar --modo video|imagen|musica --salida ruta.ext
//
// La interfaz de Gemini cambia sin aviso: si un paso falla, se guarda una captura
// junto a --salida (<salida>.error.png) para ajustar los selectores.
const path = require("path");
const fs = require("fs");

const RAIZ = path.resolve(__dirname, "../..");
const { chromium } = require(path.join(RAIZ, "apps/web/node_modules/playwright-core"));
const CDP = `http://127.0.0.1:${process.env.GEMINI_PUERTO || 9222}`;

const HERRAMIENTA = { video: "Crear vídeo", imagen: "Crear imagen", musica: "Crear música" };

function argumentos(lista) {
  const a = { ref: [] };
  for (let i = 0; i < lista.length; i++) {
    const k = lista[i].replace(/^--/, "");
    const v = lista[i + 1];
    if (k === "ref") a.ref.push(path.resolve(v));
    else a[k] = v;
    i++;
  }
  return a;
}

async function conectar() {
  let navegador;
  try {
    navegador = await chromium.connectOverCDP(CDP);
  } catch {
    throw new Error(`No hay Chrome en ${CDP}. Ejecuta tools/gemini-media/abrir-chrome.sh e inicia sesión en Gemini.`);
  }
  const contexto = navegador.contexts()[0];
  const pagina =
    contexto.pages().find((p) => p.url().includes("gemini.google.com")) || (await contexto.newPage());
  return { navegador, pagina };
}

const espera = (p, ms) => p.waitForTimeout(ms);

async function cerrarBienvenida(p) {
  const probar = p.getByRole("button", { name: "Probar", exact: true });
  if (await probar.isVisible().catch(() => false)) {
    await probar.click();
    await espera(p, 1000);
  }
}

async function subirReferencias(p, refs) {
  if (!refs.length) return;
  const boton = p.locator('button[aria-label="Subida de archivos"]');
  if (await boton.isVisible().catch(() => false)) {
    // Modo con botón propio de subida: no abre menú, usa un input oculto.
    await boton.click();
    await espera(p, 800);
  } else {
    await p.getByRole("button", { name: "Subidas y herramientas" }).click();
    await espera(p, 800);
  }
  const elegir = p.getByText(/^(Subir archivos|Archivos)$/).first();
  const [selector] = await Promise.all([
    p.waitForEvent("filechooser", { timeout: 5000 }).catch(() => null),
    elegir.click({ timeout: 3000 }).catch(() => {}),
  ]);
  if (selector) await selector.setFiles(refs);
  else await p.locator("input[type=file]").first().setInputFiles(refs);
  await espera(p, 3000 + 1500 * refs.length);
  await p.keyboard.press("Escape").catch(() => {});
}

// Medios del último turno de Gemini, del tipo pedido.
async function mediosRecientes(p, modo) {
  return p.evaluate((modo) => {
    const turnos = document.querySelectorAll("model-response");
    const turno = turnos[turnos.length - 1];
    if (!turno) return [];
    if (modo === "imagen") {
      return [...turno.querySelectorAll("img")]
        .filter((i) => i.naturalWidth >= 256 && i.naturalHeight >= 256)
        .map((i) => i.currentSrc || i.src);
    }
    const sel = modo === "musica" ? "audio, video" : "video";
    return [...turno.querySelectorAll(sel)]
      .map((m) => m.currentSrc || m.src || m.querySelector("source")?.src)
      .filter(Boolean);
  }, modo);
}

async function textoReciente(p) {
  return (await p.locator("model-response").last().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
}

async function descargar(p, url, salida) {
  const b64 = await p.evaluate(async (u) => {
    const r = await fetch(u, { credentials: "include" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = new Uint8Array(await r.arrayBuffer());
    let s = "";
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(s);
  }, url);
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.writeFileSync(salida, Buffer.from(b64, "base64"));
}

// Imágenes: el botón de descarga entrega el tamaño completo (el <img> es un blob reducido).
async function guardarImagenes(p, salida) {
  const botones = p.locator("model-response").last().getByRole("button", { name: "Descargar imagen a tamaño completo" });
  const n = await botones.count();
  if (!n) return null;
  const ext = path.extname(salida);
  const base = salida.slice(0, salida.length - ext.length);
  const rutas = [];
  for (let i = 0; i < n; i++) {
    const [descarga] = await Promise.all([p.waitForEvent("download", { timeout: 60000 }), botones.nth(i).click()]);
    const ruta = n === 1 ? salida : `${base}-${i + 1}${ext}`;
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    await descarga.saveAs(ruta);
    rutas.push(ruta);
  }
  return rutas;
}

async function guardar(p, modo, salida) {
  if (modo === "imagen") {
    const rutas = await guardarImagenes(p, salida);
    if (rutas) return rutas;
  }
  const urls = await mediosRecientes(p, modo);
  if (!urls.length) throw new Error(`No encontré ${modo} en la última respuesta.`);
  const ext = path.extname(salida);
  const base = salida.slice(0, salida.length - ext.length);
  const rutas = urls.map((_, i) => (urls.length === 1 ? salida : `${base}-${i + 1}${ext}`));
  for (let i = 0; i < urls.length; i++) await descargar(p, urls[i], rutas[i]);
  return rutas;
}

// Gemini decide el formato (p. ej. JPEG aunque se pida .png): se informa el real.
function formatoReal(ruta) {
  const b = fs.readFileSync(ruta).subarray(0, 12);
  if (b[0] === 0xff && b[1] === 0xd8) return "jpeg";
  if (b.toString("hex", 0, 4) === "89504e47") return "png";
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (b.toString("ascii", 4, 8) === "ftyp") return "mp4";
  if (b.toString("ascii", 0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return "mp3";
  if (b.toString("ascii", 0, 4) === "OggS") return "ogg";
  if (b.toString("hex", 0, 4) === "1a45dfa3") return "webm";
  return "desconocido";
}

async function generar(p, a) {
  const modo = a.modo;
  if (!HERRAMIENTA[modo]) throw new Error("--modo debe ser video, imagen o musica.");
  if (!a.salida) throw new Error("Falta --salida.");
  const prompt = a["prompt-file"] ? fs.readFileSync(a["prompt-file"], "utf8").trim() : a.prompt;
  if (!prompt) throw new Error("Falta --prompt-file (o --prompt).");

  await p.goto("https://gemini.google.com/app");
  await espera(p, 2500);
  await p.getByRole("button", { name: "Subidas y herramientas" }).click();
  await espera(p, 800);
  await p.getByText(HERRAMIENTA[modo], { exact: true }).first().click();
  await espera(p, 1500);
  await cerrarBienvenida(p);
  await subirReferencias(p, a.ref);
  await cerrarBienvenida(p);

  const caja = p.getByRole("textbox").first();
  await caja.click();
  await caja.fill(prompt);
  await espera(p, 600);
  await caja.press("Enter");

  const limite = Date.now() + Number(a.espera || 600) * 1000;
  let ultimo = "";
  while (Date.now() < limite) {
    await espera(p, 10000);
    if ((await mediosRecientes(p, modo)).length) {
      await espera(p, 4000); // deja terminar de cargar el medio
      break;
    }
    const t = await textoReciente(p);
    if (t && t !== ultimo) {
      ultimo = t;
      console.log(`… ${t.slice(0, 140)}`);
    }
    if (/request failed|violated|PROHIBITED|no puedo (crear|generar|ayudarte)|inténtalo de nuevo más tarde|límite/i.test(t)) {
      throw new Error(`Gemini rechazó la petición: ${t.slice(0, 300)}`);
    }
  }
  console.log(`conversación: ${p.url()}`);
  const rutas = await guardar(p, modo, a.salida);
  const respuesta = await textoReciente(p);
  if (respuesta) console.log(`gemini: ${respuesta.slice(0, 300)}`);
  return rutas;
}

(async () => {
  const [orden, ...resto] = process.argv.slice(2);
  const a = argumentos(resto);
  const { navegador, pagina } = await conectar();
  try {
    if (orden === "estado") {
      const sesion = await pagina.locator('[aria-label^="Cuenta de Google"]').count();
      console.log(`Chrome conectado · ${pagina.url()} · sesión ${sesion ? "iniciada" : "NO iniciada"}`);
    } else if (orden === "generar" || orden === "bajar") {
      const rutas = orden === "generar" ? await generar(pagina, a) : await guardar(pagina, a.modo, a.salida);
      for (const r of rutas) {
        // La música llega como MP4 (audio + carátula): se extrae solo el audio si se pidió.
        if (a.modo === "musica" && formatoReal(r) === "mp4" && /\.(mp3|m4a|ogg|opus)$/i.test(r)) {
          const crudo = `${r}.gemini.mp4`;
          fs.renameSync(r, crudo);
          const codec = { ".mp3": ["libmp3lame", "-q:a", "2"], ".m4a": ["copy"], ".ogg": ["libvorbis", "-q:a", "5"], ".opus": ["libopus", "-b:a", "128k"] }[path.extname(r).toLowerCase()];
          const res = require("child_process").spawnSync("ffmpeg", ["-v", "error", "-y", "-i", crudo, "-vn", "-c:a", ...codec, r]);
          if (res.status !== 0) throw new Error(`ffmpeg no pudo extraer el audio: ${res.stderr}`);
          fs.unlinkSync(crudo);
        }
        console.log(`guardado: ${r} (formato real: ${formatoReal(r)})`);
      }
    } else {
      console.log("Uso: estado | generar --modo … --prompt-file … --salida … [--ref …] | bajar --modo … --salida …");
    }
  } catch (e) {
    if (a.salida) await pagina.screenshot({ path: `${a.salida}.error.png` }).catch(() => {});
    console.error(`error: ${e.message}`);
    process.exitCode = 1;
  } finally {
    await navegador.close(); // solo cierra la conexión CDP, no el Chrome del usuario
  }
})();
