/*
  RASTERIZADO Y CORTE — del PDF a las hojas WebP que consume el lector.

  Poppler (pdftoppm) dibuja cada página del PDF a PNG; sharp corta el pliego
  en dos, reescala y codifica. Se rasteriza alto —300 dpi por defecto— porque
  la mitad de un pliego es la que acaba en pantalla: partir una imagen ya
  pequeña deja hojas blandas, y en libro ilustrado eso se nota.

  El PNG intermedio vive en un directorio temporal y se borra al terminar.
  Trabajar página a página, y no todo el PDF de una vez, mantiene el pico de
  memoria plano: un libro de 200 páginas ocupa lo mismo que uno de 20.
*/

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const ejecutar = promisify(execFile);

/* Lado mayor de la hoja publicada y de su miniatura. Coincide con lo que ya
   hay en la biblioteca: hojas de 1000 px, miniaturas de 200. */
export const LADO_HOJA = 1000;
export const LADO_MINIATURA = 200;

/* Dibuja una sola página del PDF a PNG y devuelve su ruta. */
async function dibujarPagina(rutaPdf, numero, dpi, carpeta) {
  const prefijo = path.join(carpeta, `p${String(numero).padStart(5, "0")}`);
  /* -cropbox: se dibuja lo que un visor muestra, que es lo que pdfinfo mide y
     lo que planificar() usó para decidir. Sin él pdftoppm pinta la MediaBox
     entera, y hay PDFs («Canciones, rondas…», «Por qué el elefante…») cuya
     portada es una tapa envolvente recortada a su mitad con la CropBox: saldría
     tapa y contraportada juntas en una hoja apaisada. */
  await ejecutar("pdftoppm", [
    "-cropbox",
    "-r", String(dpi),
    "-png",
    "-f", String(numero),
    "-l", String(numero),
    rutaPdf,
    prefijo,
  ]);

  /* pdftoppm añade su propio sufijo de página y no siempre con el mismo
     ancho de relleno, así que el archivo se busca en vez de suponerse. */
  const base = path.basename(prefijo);
  const archivos = await readdir(carpeta);
  const salida = archivos.find(
    (f) => f.startsWith(base) && f.endsWith(".png")
  );
  if (!salida) {
    throw new Error(`pdftoppm no produjo salida para la página ${numero}`);
  }
  return path.join(carpeta, salida);
}

/*
  ¿Es esta hoja casi de un solo color? Una contraportada plana o una guarda
  no se anuncian en el PDF, pero se reconocen: su desviación estándar es
  mínima en los tres canales. El dato se guarda en el manifiesto para que
  quien revise el libro sepa dónde mirar; no se descarta nada por su cuenta.
*/
async function esPlana(imagen) {
  const { channels } = await imagen.stats();
  const desviacion =
    channels.reduce((suma, c) => suma + c.stdev, 0) / channels.length;
  return desviacion < 12;
}

/*
  Convierte un PDF completo. `alProgresar` recibe cada hoja terminada para
  que la CLI pueda informar sin que este módulo sepa de terminales.
*/
export async function rasterizar({
  rutaPdf,
  plan,
  destino,
  dpi = 300,
  calidad = 82,
  alProgresar,
}) {
  const carpeta = await mkdtemp(path.join(tmpdir(), "flipbook-forge-"));
  const hojas = [];

  try {
    /* Las hojas del mismo pliego comparten página de origen: se dibuja una
       vez y se corta dos veces. */
    let paginaActual = null;
    let png = null;

    for (const h of plan.hojas) {
      /* La hoja en blanco no sale del PDF: se fabrica. Sirve para alinear
         los pliegos cuando la página que estorba no se puede quitar porque
         es contenido del libro (ver planificar). */
      if (h.enBlanco) {
        const nn = String(h.numero).padStart(2, "0");
        const ancho = Math.round(LADO_HOJA * (plan.razon ?? 1));
        const blanca = sharp({
          create: {
            width: Math.max(1, ancho),
            height: LADO_HOJA,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
          },
        });

        await blanca.clone().webp({ quality: calidad }).toFile(path.join(destino, `p${nn}.webp`));
        await blanca
          .clone()
          .resize(LADO_MINIATURA, LADO_MINIATURA, { fit: "inside" })
          .webp({ quality: 70 })
          .toFile(path.join(destino, `t${nn}.webp`));

        const registro = {
          numero: h.numero,
          paginaPdf: null,
          mitad: null,
          pliego: null,
          plana: true,
          enBlanco: true,
        };
        hojas.push(registro);
        alProgresar?.(registro, plan.hojas.length);
        continue;
      }

      if (h.pagina !== paginaActual) {
        if (png) await rm(png, { force: true });
        png = await dibujarPagina(rutaPdf, h.pagina, dpi, carpeta);
        paginaActual = h.pagina;
      }

      const entrada = sharp(png, { limitInputPixels: false });
      const { width, height } = await entrada.metadata();

      /* El corte del pliego cae en el eje. Con ancho impar la mitad
         izquierda se queda el píxel de más: repartirlo desplazaría el
         encuadre de una de las dos hojas. */
      const mitadAncho = Math.floor(width / 2);
      const recorte =
        h.mitad === "izquierda"
          ? { left: 0, top: 0, width: mitadAncho, height }
          : h.mitad === "derecha"
            ? {
                left: mitadAncho,
                top: 0,
                width: width - mitadAncho,
                height,
              }
            : null;

      /* sharp encadena en una sola pasada de libvips: recorte, reescalado
         y codificación sin materializar el bitmap intermedio. */
      const hoja = recorte
        ? sharp(png, { limitInputPixels: false }).extract(recorte)
        : sharp(png, { limitInputPixels: false });

      const nn = String(h.numero).padStart(2, "0");

      await hoja
        .clone()
        .resize(LADO_HOJA, LADO_HOJA, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: calidad })
        .toFile(path.join(destino, `p${nn}.webp`));

      await hoja
        .clone()
        .resize(LADO_MINIATURA, LADO_MINIATURA, { fit: "inside" })
        .webp({ quality: 70 })
        .toFile(path.join(destino, `t${nn}.webp`));

      const plana = await esPlana(hoja.clone());

      const registro = {
        numero: h.numero,
        paginaPdf: h.pagina,
        mitad: h.mitad,
        pliego: h.pliego,
        plana,
      };
      hojas.push(registro);
      alProgresar?.(registro, plan.hojas.length);
    }

    if (png) await rm(png, { force: true });
  } finally {
    await rm(carpeta, { recursive: true, force: true });
  }

  return hojas;
}
