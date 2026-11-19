// Lógica pura de tools/voz-gemini (sin red ni disco): qué frases tiene una
// actividad, cómo se dicen, qué modelo toca y cómo leer los errores de cuota.
// Probada en test/lib.test.mjs (node --test).

/** Voz por defecto: maestra, español de México (la biblioteca no tiene voces de Colombia). */
export const VOZ_LATINA = "es-419-tutor-3";
/** Voz básica de respaldo para los modelos sin biblioteca (2.5): «Warm». */
export const VOZ_BASICA = "Sulafat";

/** Estilo corto (3.8): la guía advierte que el estilo largo hace derivar la voz. */
export const ESTILO = "cálida y alegre, despacio y clara, hablándole a niños pequeños";
/** Nota de dirección (2.5). Sin mencionar niños: el filtro de seguridad la bloquea en algunos modelos. */
export const NOTA_RESPALDO = "Lee con acento latinoamericano de México, voz de maestra cálida y alegre, despacio y clara: ";

/**
 * Cadena de modelos, del preferido al último recurso. Los dos primeros usan la
 * MISMA voz latina de la biblioteca; los de respaldo solo tienen voces básicas
 * (el acento latino se pide en el texto y no está garantizado 🔶).
 */
export const MODELOS = [
  { id: "gemini-3.8-flash-tts", api: "interactions", respaldo: false },
  { id: "gemini-3.8-flash-lite-tts", api: "interactions", respaldo: false },
  { id: "gemini-2.5-flash-preview-tts", api: "generate", respaldo: true },
  { id: "gemini-2.5-pro-preview-tts", api: "generate", respaldo: true },
];

/** Modelos a intentar, en orden, quitando los agotados y (si se pide) los de respaldo. */
export function cadena({ agotados = {}, ahora = Date.now(), sinRespaldo = false, soloModelo } = {}) {
  return MODELOS.filter((m) => (soloModelo ? m.id === soloModelo : true))
    .filter((m) => !(sinRespaldo && m.respaldo))
    .filter((m) => !(agotados[m.id] && agotados[m.id] > ahora));
}

/** Texto que se pronuncia: sin comillas angulares ni tipográficas, mayúscula inicial y punto final. */
export function paraDecir(texto) {
  let t = String(texto).replace(/[«»“”"]/g, "").replace(/\s+/g, " ").trim();
  if (!t) return t;
  t = t[0].toUpperCase() + t.slice(1);
  if (!/[.!?…]$/.test(t)) t += ".";
  return t;
}

/** Nombre de archivo seguro a partir de un id del contenido. */
export function nombreArchivo(id) {
  return String(id)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Frases con voz de una actividad del currículo. Cada una dice dónde va su ruta:
 *   - la consigna → `audioInstruccion` (raíz del archivo)
 *   - `contenido.elementos[]` con `texto` → `audio` (dice `lectura` si la hay)
 *   - `contenido.preguntas[]` → `audio` (enunciado) y `audioOpciones` (una por opción)
 * Lo demás (p. ej. palabras con `pista`, pares de relaciones) se informa como omitido.
 */
export function frasesDeActividad(act) {
  const frases = [];
  const omitidos = [];
  if (act.instruccion) frases.push({ clave: "instruccion", texto: paraDecir(act.instruccion), destino: { tipo: "raiz", campo: "audioInstruccion" } });
  const c = act.contenido ?? {};
  (c.elementos ?? []).forEach((e, i) => {
    if (typeof e.texto !== "string" || e.palabra) return omitidos.push(`contenido.elementos[${i}]`);
    frases.push({ clave: nombreArchivo(e.id ?? `elemento-${i}`), texto: paraDecir(e.lectura ?? e.texto), destino: { tipo: "elemento", indice: i } });
  });
  (c.preguntas ?? []).forEach((p, i) => {
    const base = nombreArchivo(p.id ?? `pregunta-${i}`);
    if (p.enunciado) frases.push({ clave: base, texto: paraDecir(p.enunciado), destino: { tipo: "pregunta", indice: i } });
    (p.opciones ?? []).forEach((o, j) =>
      frases.push({ clave: `${base}-opcion-${j + 1}`, texto: paraDecir(o), destino: { tipo: "opcion", indice: i, opcion: j } }),
    );
  });
  // `categorias`: ningún esquema les da audio (son rótulos de las cestas).
  for (const llave of Object.keys(c)) if (!["elementos", "preguntas", "categorias"].includes(llave) && Array.isArray(c[llave])) omitidos.push(`contenido.${llave}`);
  return { frases, omitidos };
}

/** Pone la ruta de cada frase en la actividad (copia). Respeta el orden de llaves: `audioInstruccion` tras `instruccion`. */
export function aplicarRutas(act, rutas /* clave → ruta */, frases) {
  const copia = structuredClone(act);
  for (const f of frases) {
    const ruta = rutas[f.clave];
    if (!ruta) continue;
    const d = f.destino;
    if (d.tipo === "elemento") copia.contenido.elementos[d.indice].audio = ruta;
    else if (d.tipo === "pregunta") copia.contenido.preguntas[d.indice].audio = ruta;
    else if (d.tipo === "opcion") {
      const p = copia.contenido.preguntas[d.indice];
      p.audioOpciones ??= p.opciones.map(() => null);
      p.audioOpciones[d.opcion] = ruta;
    }
  }
  if (rutas.instruccion) {
    const salida = {};
    for (const [k, v] of Object.entries(copia)) {
      if (k === "audioInstruccion") continue;
      salida[k] = v;
      if (k === "instruccion") salida.audioInstruccion = rutas.instruccion;
    }
    return salida;
  }
  return copia;
}

/**
 * Lee un error de la API. Devuelve:
 *   { tipo: "dia", hasta }   cuota diaria agotada (hasta = cuándo vuelve, ms)
 *   { tipo: "minuto", esperaMs }  límite por minuto: esperar y repetir
 *   { tipo: "bloqueo" }      filtro de seguridad
 *   { tipo: "otro" }
 */
export function leerError(status, cuerpo, ahora = Date.now()) {
  const t = typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo ?? "");
  if (/PROHIBITED_CONTENT|flagged by safety|SAFETY/i.test(t)) return { tipo: "bloqueo" };
  if (status !== 429) return { tipo: "otro" };
  const espera = esperaDe(t);
  if (/per day|PerDay|daily/i.test(t) || espera > 120_000) return { tipo: "dia", hasta: ahora + (espera || 24 * 3600_000) };
  return { tipo: "minuto", esperaMs: espera || 30_000 };
}

/** «retry in 2h55m26s», «retry in 41.3s», `"retryDelay": "41s"` → ms. */
export function esperaDe(t) {
  const m = /retry in ((?:\d+h)?(?:\d+m)?(?:[\d.]+s)?)/i.exec(t) ?? /"retryDelay":\s*"([\d.]+s)"/.exec(t);
  if (!m || !m[1]) return 0;
  const [, h = 0, mi = 0, s = 0] = /^(?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?$/.exec(m[1]) ?? [];
  return Math.round((Number(h) * 3600 + Number(mi) * 60 + Number(s)) * 1000);
}

/** Tabla de LICENCIAS.md a partir del manifiesto { clave: { archivo, modelo, voz, texto } }. */
export function licencias(titulo, manifiesto, fecha) {
  const filas = Object.values(manifiesto);
  const hayRespaldo = filas.some((f) => MODELOS.find((m) => m.id === f.modelo)?.respaldo);
  return [
    `# Voces de «${titulo}»`,
    "",
    `Voz sintética generada con la API de Gemini de Google AI Studio (\`tools/voz-gemini\`, ${fecha}) a partir del texto de MIDUHO. No es la voz de una persona real. MP3 mono 44,1 kHz, normalizado a −18 LUFS, sin silencio inicial ni final.`,
    "",
    "| Archivo | Modelo | Voz | Texto dicho |",
    "|---|---|---|---|",
    ...filas.map((f) => `| \`${f.archivo}\` | \`${f.modelo}\` | \`${f.voz}\`${MODELOS.find((m) => m.id === f.modelo)?.respaldo ? " 🔶" : ""} | ${f.texto.replace(/\|/g, "\\|")} |`),
    "",
    ...(hayRespaldo ? ["🔶 Voz de respaldo (modelo sin voces latinas): acento no garantizado; regenerar con `--rehacer-respaldo` cuando haya cupo.", ""] : []),
    "Términos de uso del audio generado: los de la API de Gemini de Google 🔶 (por confirmar antes de desplegar; nivel gratuito).",
    "",
  ].join("\n");
}
