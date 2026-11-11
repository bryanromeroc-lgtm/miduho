/*
  Colombia Aprende (contenidos para aprender): lecciones del MEN, a menudo
  con un recurso interactivo incrustado y un paquete descargable sin
  conexión (.zip). El guion recorre la lección y registra los enlaces .zip
  que encuentra; para extraer el audio del paquete, vuelve a correr
  `capturar` con `--zip <url>`.
*/
import { frameDelJuego, tocarArea } from "./comun.mjs";

export default async function ({ pagina, log, esperar }) {
  await pagina.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
  });
  const zips = await pagina.$$eval("a[href]", (as) => as.map((a) => a.href).filter((h) => /\.zip(\?|$)/i.test(h)));
  for (const z of zips) log(`paquete sin conexión: ${z}`);
  const juego = await frameDelJuego(pagina);
  if (juego) {
    log(`recurso incrustado: ${juego.f.url()}`);
    await tocarArea(pagina, juego.caja, 8, esperar);
  }
}
