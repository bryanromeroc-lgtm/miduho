/*
  DESCARGA — trae los PDFs del catálogo al disco. Reanudable: lo que ya está
  bajado y verificado no se vuelve a pedir.

  Bajar 54 libros son varios cientos de megas contra un servidor público que
  no es nuestro. Dos consecuencias de diseño: se va de uno en uno con pausa
  entre libros —no hay prisa y sí hay una cortesía mínima—, y todo lo que se
  descarga se verifica antes de darlo por bueno. Un PDF truncado que llega al
  rasterizador cuesta minutos de CPU para fallar al final.
*/

import { createWriteStream } from "node:fs";
import { mkdir, rename, stat, unlink } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ejecutar = promisify(execFile);

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/* Un PDF que pdfinfo no sabe leer no sirve, por muchos bytes que pese: casi
   siempre es una descarga truncada o una página de error con extensión .pdf. */
export async function verificarPdf(ruta) {
  try {
    const { stdout } = await ejecutar("pdfinfo", [ruta]);
    const paginas = Number(stdout.match(/^Pages:\s+(\d+)/m)?.[1]);
    if (!Number.isFinite(paginas) || paginas < 1) return { valido: false, motivo: "sin páginas" };
    return { valido: true, paginas };
  } catch (error) {
    return { valido: false, motivo: error.stderr?.trim() || error.message };
  }
}

/*
  Se escribe a un archivo .parcial y se renombra al final. Así una descarga
  interrumpida nunca deja en su sitio un archivo que parece completo: si el
  destino existe, está entero.
*/
export async function descargarArchivo(url, destino, { alProgresar } = {}) {
  await mkdir(path.dirname(destino), { recursive: true });
  const parcial = `${destino}.parcial`;

  const respuesta = await fetch(url, { headers: { "User-Agent": UA } });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  const total = Number(respuesta.headers.get("content-length")) || null;
  let recibido = 0;

  const origen = Readable.fromWeb(respuesta.body);
  if (alProgresar) {
    origen.on("data", (trozo) => {
      recibido += trozo.length;
      alProgresar(recibido, total);
    });
  }

  try {
    await pipeline(origen, createWriteStream(parcial));
  } catch (error) {
    await unlink(parcial).catch(() => {});
    throw error;
  }

  /* El servidor dijo cuánto pesaba: si no coincide, llegó cortado. */
  if (total !== null) {
    const { size } = await stat(parcial);
    if (size !== total) {
      await unlink(parcial).catch(() => {});
      throw new Error(`truncado: ${size} de ${total} bytes`);
    }
  }

  await rename(parcial, destino);
  return { bytes: recibido };
}

export async function descargarLibro(ficha, destino, { alProgresar, reintentos = 3 } = {}) {
  /* Ya estaba, y entero: no se vuelve a pedir. */
  const previo = await verificarPdf(destino).catch(() => ({ valido: false }));
  if (previo.valido) {
    return { estado: "ya-estaba", ruta: destino, paginas: previo.paginas };
  }

  let ultimoError;
  for (let intento = 1; intento <= reintentos; intento += 1) {
    try {
      await descargarArchivo(ficha.elegido, destino, { alProgresar });
      const control = await verificarPdf(destino);
      if (!control.valido) {
        await unlink(destino).catch(() => {});
        throw new Error(`PDF ilegible (${control.motivo})`);
      }
      return { estado: "descargado", ruta: destino, paginas: control.paginas };
    } catch (error) {
      ultimoError = error;
      if (intento < reintentos) await new Promise((r) => setTimeout(r, 2000 * intento));
    }
  }

  return { estado: "error", ruta: destino, error: ultimoError.message };
}
