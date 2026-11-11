/*
  Mundo Primaria: muestra un muro de consentimiento («Aceptar todo» o
  «Rechazar y pagar»). Se acepta el aviso (sin iniciar sesión ni pagar).
  Las fichas tienen varios juegos («Juego 1», «Juego 2»…): se abre cada uno,
  se pulsa su inicio y se toca el área para provocar aciertos y fallos.
*/
import { pulsarTexto, tocarArea } from "./comun.mjs";

export default async function ({ pagina, log, esperar }) {
  for (let i = 0; i < 4; i++) {
    if (await pulsarTexto(pagina, /aceptar todo|^aceptar$|aceptar y continuar|accept all/i, { log })) break;
    await esperar(1500);
  }
  await esperar(4000);
  const pestañas = pagina.locator("text=/^\\s*Juego\\s+\\d+\\s*$/");
  const n = Math.max(1, await pestañas.count().catch(() => 0));
  for (let i = 0; i < n; i++) {
    if (await pestañas.count().catch(() => 0)) {
      await pestañas.nth(i).click().catch(() => {});
      log(`abierto «Juego ${i + 1}»`);
      await esperar(5000);
    }
    await pulsarTexto(pagina, /^(jugar|empezar|comenzar|play|start|¡?a jugar!?)$/i, { log });
    const lienzo = pagina.locator("iframe, canvas").first();
    const caja = (await lienzo.boundingBox().catch(() => null)) ?? { x: 250, y: 120, width: 900, height: 600 };
    await pagina.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2).catch(() => {});
    await esperar(3000);
    await tocarArea(pagina, caja, 18, esperar);
  }
}
