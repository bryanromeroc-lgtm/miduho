/** Piezas compartidas por los guiones de plataforma. */
export const PUBLICIDAD = /(doubleclick|googlesyndication|google|youtube|criteo|openx|adnxs|amazon|facebook|classroom|accounts|recaptcha|adtrafficquality|creativecdn|rubiconproject|media\.net|pubmatic|taboola|outbrain|teads|seedtag|smartadserver|about:)/i;
/** Autores de juegos que los portales suelen incrustar: se prefieren sobre cualquier otro iframe. */
export const AUTORES = /(wordwall\.net|digipuzzle\.net|educaplay\.com|genially|view\.genial\.ly|canva\.com|arbolabc|learningapps\.org|h5p|cerebriti|liveworksheets|phet\.colorado\.edu|toytheater\.com|code\.org|mundoprimaria|cokitos\.com\/juegos)/i;

/** Pulsa el primer botón o enlace visible cuyo texto coincide, en la página o en sus frames. */
export async function pulsarTexto(pagina, patron, { log = () => {}, frames = true } = {}) {
  const lugares = frames ? pagina.frames() : [pagina.mainFrame()];
  for (const f of lugares) {
    const l = f.locator("button, a, [role=button], input[type=button], input[type=submit], div[onclick], span[onclick]").filter({ hasText: patron });
    const n = await l.count().catch(() => 0);
    for (let i = 0; i < n; i++) {
      const e = l.nth(i);
      if (await e.isVisible().catch(() => false)) {
        await e.click({ timeout: 5000 }).catch(() => {});
        log(`pulsado «${(await e.innerText().catch(() => "")).trim().slice(0, 40)}» en ${f.url().slice(0, 80)}`);
        return true;
      }
    }
  }
  return false;
}

/** El iframe del juego: el más grande que no es publicidad. */
export async function frameDelJuego(pagina) {
  let mejor = null;
  for (const f of pagina.frames()) {
    if (f === pagina.mainFrame() || PUBLICIDAD.test(f.url()) || !/^https?:/.test(f.url())) continue;
    const el = await f.frameElement().catch(() => null);
    const caja = el && (await el.boundingBox().catch(() => null));
    const area = (caja ? caja.width * caja.height : 0) + (AUTORES.test(f.url()) ? 1e9 : 0);
    if (!mejor || area > mejor.area) mejor = { f, area, caja };
  }
  return mejor;
}

/** Toca en varios puntos del área del juego para que cargue el audio perezoso (acertar y fallar al azar). */
export async function tocarArea(pagina, caja, veces = 12, esperar) {
  if (!caja) return;
  for (let i = 0; i < veces; i++) {
    const x = caja.x + caja.width * (0.15 + 0.7 * ((i * 37) % 100) / 100);
    const y = caja.y + caja.height * (0.2 + 0.6 * ((i * 61) % 100) / 100);
    await pagina.mouse.click(x, y).catch(() => {});
    await esperar(700);
  }
}

/**
 * Abre el iframe del autor como página propia (como pide referencia-rea): el
 * juego arranca sin anuncios encima y carga su audio. Devuelve la caja del
 * área de juego en la nueva vista.
 */
export async function abrirJuegoSolo(pagina, juego, { log, esperar }) {
  const url = juego.f.url();
  await pagina.goto(url, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  log(`abierto el juego del autor como página: ${url}`);
  await esperar(6000);
  const v = pagina.viewportSize() ?? { width: 1366, height: 860 };
  return { x: 0, y: 0, width: v.width, height: v.height };
}
