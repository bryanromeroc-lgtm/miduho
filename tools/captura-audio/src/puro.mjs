/**
 * Lógica pura de la captura sonora: sin red, sin disco, sin ffmpeg.
 * Todo lo que aquí se decide queda con `certeza: "inferido"` hasta que una
 * persona escuche la pista (Claude no oye).
 */

export const EXTENSIONES_AUDIO = ["mp3", "ogg", "oga", "wav", "m4a", "webm", "aac", "opus", "flac"];

const RE_EXT = new RegExp(`\\.(${EXTENSIONES_AUDIO.join("|")})(?:[?#][^\\s"'\`)]*)?$`, "i");

/** ¿La URL (o el tipo MIME) apunta a un audio? */
export function esAudio(url, mime = "") {
  if (/^audio\//i.test(mime)) return true;
  if (/^video\/webm/i.test(mime) && /\.webm/i.test(url)) return false; // un video no es audio
  try {
    const u = new URL(url, "http://x/");
    return RE_EXT.test(u.pathname);
  } catch {
    return false;
  }
}

/**
 * Busca URL de audio declaradas en un texto (script, JSON, HTML). Devuelve
 * URL absolutas resueltas contra `base`, sin repetir, en orden de aparición.
 * Reconoce rutas entre comillas o en `url(...)`, absolutas o relativas, y
 * audios `data:audio/...;base64,...` (que se devuelven aparte).
 */
export function detectarUrlsAudio(texto, base) {
  const baseUrl = base;
  const urls = [];
  const datos = [];
  const vistas = new Set();
  const ext = EXTENSIONES_AUDIO.join("|");
  // Cadena entre comillas o paréntesis que termina en .ext (con query opcional).
  const re = new RegExp(`["'\`(]((?:https?:)?\\/\\/[^"'\`()\\s]+?\\.(?:${ext})(?:\\?[^"'\`()\\s]*)?|[^"'\`()\\s:]*?\\.(?:${ext})(?:\\?[^"'\`()\\s]*)?)["'\`)]`, "gi");
  for (const m of texto.matchAll(re)) {
    const crudo = m[1].replace(/\\\//g, "/");
    if (!crudo || crudo.startsWith(".") && crudo.length < 6 && !crudo.includes("/")) continue; // ".mp3" suelto
    if (/^\.(?:[a-z0-9]+)$/i.test(crudo)) continue;
    let abs;
    try {
      abs = new URL(crudo, base).href;
    } catch {
      continue;
    }
    if (!vistas.has(abs)) {
      vistas.add(abs);
      urls.push(abs);
    }
  }
  // Rutas armadas con un prefijo: var base="/x/sonidos/"; … base+'ok.mp3'. Se prueba cada valor asignado al prefijo.
  const prefijos = new Map();
  for (const m of texto.matchAll(/(?:\b(?:var|let|const)\s+|window\.)([A-Za-z_$][\w$]*)\s*=\s*["'`]([^"'`\s]*\/)["'`]/g)) {
    prefijos.set(m[1], [...(prefijos.get(m[1]) ?? []), m[2]]);
  }
  for (const m of texto.matchAll(new RegExp(`\\b([A-Za-z_$][\\w$]*)\\s*\\+\\s*["'\`]([^"'\`\\s]+?\\.(?:${ext}))["'\`]`, "gi"))) {
    for (const base of prefijos.get(m[1]) ?? []) {
      let abs;
      try {
        abs = new URL(base + m[2], baseUrl).href;
      } catch {
        continue;
      }
      if (!vistas.has(abs)) {
        vistas.add(abs);
        urls.push(abs);
      }
    }
  }
  for (const m of texto.matchAll(/data:audio\/([a-z0-9.+-]+);base64,([A-Za-z0-9+/=]{200,})/gi)) {
    datos.push({ mime: `audio/${m[1].toLowerCase()}`, base64: m[2] });
  }
  return { urls, datos };
}

/**
 * Lee sprites de audio declarados al estilo Howler.js:
 *   sprite: { acierto: [0, 400], error: [500, 300, false] }
 * Devuelve [{ nombre, inicio_ms, duracion_ms, bucle }]. Si el objeto no se
 * puede leer, devuelve [].
 */
export function leerSprites(texto) {
  const cortes = [];
  for (const m of texto.matchAll(/sprite["']?\s*:\s*\{/g)) {
    const inicio = m.index + m[0].length - 1;
    const cuerpo = cerrarLlave(texto, inicio);
    if (!cuerpo) continue;
    for (const c of cuerpo.matchAll(/["']?([\w$.-]+)["']?\s*:\s*\[\s*(-?[\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*(true|false|!0|!1))?\s*\]/g)) {
      cortes.push({
        nombre: c[1],
        inicio_ms: Number(c[2]),
        duracion_ms: Number(c[3]),
        bucle: c[4] === "true" || c[4] === "!0",
      });
    }
  }
  return cortes;
}

function cerrarLlave(texto, desde) {
  let nivel = 0;
  for (let i = desde; i < texto.length && i < desde + 200_000; i++) {
    if (texto[i] === "{") nivel++;
    else if (texto[i] === "}" && --nivel === 0) return texto.slice(desde, i + 1);
  }
  return null;
}

const CLAVES_ROL = [
  ["musica", /(music|musica|música|bgm|song|cancion|canción|melod|loop|soundtrack|fondo|bgm)/i],
  ["ambiente", /(ambien|ambient|lluvia|rain|viento|wind|bosque|forest|selva|pajaros|birds|crowd|multitud)/i],
  ["voz", /(\/tts\/|neural|voz|voice|vo_|locu|narra|instruc|consigna|pregunta|question|dice|say|habla|speech|palabra|word|letra|letter|silaba|sílaba|numero|number|nombre)/i],
  ["efecto", /(sfx|fx|chip|pickup|tiledrop|reveal|click|clic|tap|pop|boton|button|correct|wrong|error|acierto|bien|mal|win|lose|fail|success|ok|ding|beep|whoosh|swoosh|jump|salto|golpe|hit|coin|moneda|star|estrella|drop|soltar|pick|tomar)/i],
];

const CLAVES_EVENTO = [
  ["fin", /(successful|timesup|leaderboard|gameover|victory|victoria)/i],
  ["acierto", /(correct|right|success|acierto|bien|bravo|good|ok(?![a-z])|yes|si(?![a-z]))/i],
  ["error", /(wrong|error|incorrect|mal(?![a-z])|fail|bad|no(?![a-z])|oops)/i],
  ["fin", /((?<![a-z])win(?![a-z])|on_?win|victory|victoria|final|(?<![a-z])fin(?![a-z])|(?<![a-z])end(?![a-z])|complete|gameover|terminar|ganar|successful|timesup|leaderboard)/i],
  ["toque", /(click|clic|tap|pop|boton|button|select|hover|pickup|drop|flip|tile)/i],
  ["inicio", /(start|intro|inicio|begin|comenzar|empezar)/i],
  ["instruccion", /(instruc|consigna|pregunta|question|ayuda|help)/i],
];

/**
 * Propone el rol y el evento de una pista. `datos`: { nombre, duracion_s,
 * bucle, contexto } — `contexto` es texto del código cercano a donde se
 * invoca (si se encontró). Siempre devuelve `certeza: "inferido"`.
 */
export function inferirRol({ nombre = "", duracion_s = null, bucle = false, contexto = "" }) {
  let rol = "desconocido";
  for (const [r, re] of CLAVES_ROL) {
    if (re.test(nombre)) {
      rol = r;
      break;
    }
  }
  if (rol === "desconocido" && contexto) {
    for (const [r, re] of CLAVES_ROL) if (re.test(contexto)) { rol = r; break; }
  }
  if (bucle && (rol === "desconocido" || rol === "efecto")) rol = duracion_s != null && duracion_s < 8 ? "ambiente" : "musica";
  if (duracion_s != null) {
    if (rol === "desconocido") rol = duracion_s >= 25 ? "musica" : duracion_s < 1.2 ? "efecto" : "desconocido";
    if (rol === "efecto" && duracion_s >= 25) rol = "musica";
    if (rol === "musica" && duracion_s < 2 && !bucle) rol = "efecto";
  }
  // El nombre manda; el código cercano solo se usa si el nombre no dice nada.
  let evento = null;
  for (const texto of [nombre, contexto]) {
    for (const [e, re] of CLAVES_EVENTO) {
      if (re.test(texto)) {
        evento = e;
        break;
      }
    }
    if (evento) break;
  }
  if (!evento && (rol === "musica" || rol === "ambiente")) evento = "fondo";
  return { rol, evento, certeza: "inferido" };
}

/**
 * Agrupa descargas por huella: misma `sha256` → una sola copia con todas
 * sus URL. Conserva el orden de la primera aparición.
 */
export function agruparPorHuella(descargas) {
  const porHuella = new Map();
  for (const d of descargas) {
    const previo = porHuella.get(d.sha256);
    if (previo) {
      for (const u of d.urls ?? [d.url]) if (u && !previo.urls.includes(u)) previo.urls.push(u);
      for (const o of [d.origen_deteccion].flat()) if (o && !previo.origen_deteccion.includes(o)) previo.origen_deteccion.push(o);
    } else {
      porHuella.set(d.sha256, {
        ...d,
        urls: [...new Set(d.urls ?? [d.url])].filter(Boolean),
        origen_deteccion: [d.origen_deteccion].flat().filter(Boolean),
      });
    }
  }
  return [...porHuella.values()];
}

/** Dominio sin «www.» para la autoría. */
export function dominio(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Nombre de archivo seguro a partir de una URL. */
export function nombreDesdeUrl(url, respaldo = "audio") {
  try {
    const base = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    const limpio = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
    return limpio || respaldo;
  } catch {
    return respaldo;
  }
}

/**
 * Limitador: como máximo una petición por `intervaloMs` a cada dominio.
 * `ahora` y `dormir` se inyectan para poder probarlo.
 */
export function crearLimitador({ intervaloMs = 1000, ahora = () => Date.now(), dormir = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  const siguiente = new Map();
  return async function esperarTurno(url) {
    const d = dominio(url) ?? "?";
    const t = ahora();
    const turno = Math.max(t, siguiente.get(d) ?? 0);
    siguiente.set(d, turno + intervaloMs);
    if (turno > t) await dormir(turno - t);
  };
}

/** Lee la sonoridad integrada (LUFS) de la salida de `ffmpeg -af ebur128`. */
export function leerSonoridad(salida, duracion_s = null) {
  if (duracion_s != null && duracion_s < 0.4) return null; // EBU R128 integra bloques de 400 ms: más corto no se puede medir
  const resumen = salida.split("Summary:").pop() ?? "";
  const m = resumen.match(/I:\s*(-?[\d.]+|-inf)\s*LUFS/);
  if (!m) return null;
  return m[1] === "-inf" ? null : Number(m[1]);
}

/** Objetivo de normalización según el rol: −23 LUFS música/ambiente en bucle; −18 el resto. */
export function objetivoLufs(rol) {
  return rol === "musica" || rol === "ambiente" ? -23 : -18;
}

/** Fila de `LICENCIAS.md` para un archivo adaptado. */
export function filaLicencia({ archivo, slug, id, url, autor, licencia }) {
  const celda = (x) => String(x ?? "🔶").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return `| \`${celda(archivo)}\` | \`${celda(slug)}#${celda(id)}\` | ${celda(url)} | ${celda(autor)} | ${celda(licencia)} |`;
}
