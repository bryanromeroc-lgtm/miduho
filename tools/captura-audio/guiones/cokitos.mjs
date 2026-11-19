/*
  Cokitos: la ficha del juego tiene un enlace «JUGAR» a …/play/, donde el juego
  real vive en un iframe de otro autor (Digipuzzle, Wordwall, Educaplay…).
  Se pulsa «JUGAR», se busca el iframe más grande que no es publicidad, se
  pulsa su botón de inicio y se toca el área para provocar aciertos y fallos.
*/
import { abrirJuegoSolo, frameDelJuego, pulsarTexto, tocarArea } from "./comun.mjs";

export default async function ({ pagina, log, esperar }) {
  if (!pagina.url().includes("/play")) {
    const destino = await pagina.locator('a[href*="/play/"]').first().getAttribute("href").catch(() => null);
    if (destino) {
      await pagina.goto(new URL(destino, pagina.url()).href, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
      log(`abierto ${pagina.url()}`);
    }
    await esperar(6000);
  }
  const juego = await frameDelJuego(pagina);
  if (!juego) return log("no se encontró el iframe del juego 🔶");
  log(`iframe del juego: ${juego.f.url()}`);
  const caja = await abrirJuegoSolo(pagina, juego, { log, esperar });
  await pulsarTexto(pagina, /^(comenzar|empezar|jugar|start|play|iniciar)$/i, { log });
  await pagina.mouse.click(caja.width / 2, caja.height / 2).catch(() => {}); // botón de inicio dibujado en canvas
  await esperar(4000);
  await tocarArea(pagina, caja, 20, esperar);
  await pulsarTexto(pagina, /(enviar|submit|terminar|finalizar|comprobar)/i, { log });
  await esperar(3000);
}
