#!/usr/bin/env node
/*
  FLIPBOOK FORGE — un PDF entra, una carpeta de hojas sale.

  Proyecto aparte de la plataforma a propósito: rasterizar un libro son
  decenas de segundos de CPU y unos cuantos cientos de megas de pico, y eso
  no cabe en una petición web. Aquí se ejecuta cuando hay un libro nuevo y lo
  que se publica es el resultado, no el proceso.

  La salida está hecha para copiarse tal cual dentro de la plataforma:
  hojas pNN.webp y miniaturas tNN.webp en el formato que ya lee `paginasDe`,
  más un libro.json con lo que el catálogo necesita declarar.

    node src/cli.js <libro.pdf> --slug mi-libro [opciones]

  Opciones:
    --slug <nombre>     carpeta y slug del libro (por defecto, el del PDF)
    --salida <ruta>     dónde escribir (por defecto ./salida)
    --dpi <n>           resolución de rasterizado (300)
    --calidad <n>       calidad WebP de las hojas (82)
    --simples <n,n>     páginas del PDF que NO deben partirse aunque midan
                        como pliego (desplegables, mapas a doble plana)
    --omitir <n,n>      páginas del PDF que no van al libro (guardas, hojas
                        de cortesía). Sirve además para alinear los pliegos:
                        ver el aviso que imprime el conversor.
    --hoja-en-blanco    alinea los pliegos metiendo una hoja vacía tras la
                        portada, sin quitar ninguna página. Para cuando lo
                        que descuadra el libro es contenido y no una guarda.
    --doble-plana       el PDF es entero de dobles planas, portada incluida:
                        se parte todo, la tapa (mitad derecha de la primera
                        página) abre el libro y la contraportada lo cierra.
    --titulo, --autor, --editorial, --edad, --resumen
                        metadatos del catálogo; se pueden completar después
*/

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { medirPaginas, planificar } from "./analizar.js";
import { rasterizar } from "./rasterizar.js";

function leerArgumentos(argv) {
  const opciones = {};
  const sueltos = [];

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const clave = a.slice(2);
      const siguiente = argv[i + 1];
      if (siguiente === undefined || siguiente.startsWith("--")) {
        opciones[clave] = true;
      } else {
        opciones[clave] = siguiente;
        i += 1;
      }
    } else {
      sueltos.push(a);
    }
  }

  return { opciones, sueltos };
}

/* «3,7, 12» → [3, 7, 12] */
function listaNumeros(valor) {
  if (!valor || valor === true) return [];
  return String(valor)
    .split(",")
    .map((n) => Number(n.trim()))
    .filter(Number.isFinite);
}

async function principal() {
  const { opciones, sueltos } = leerArgumentos(process.argv.slice(2));
  const rutaPdf = sueltos[0];

  if (!rutaPdf) {
    console.error(
      "Uso: node src/cli.js <libro.pdf> --slug mi-libro [--salida ./salida]"
    );
    process.exit(1);
  }

  const slug =
    opciones.slug && opciones.slug !== true
      ? opciones.slug
      : path
          .basename(rutaPdf, path.extname(rutaPdf))
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

  const raiz =
    opciones.salida && opciones.salida !== true ? opciones.salida : "salida";
  const destino = path.resolve(raiz, slug);
  await mkdir(destino, { recursive: true });

  const dpi = Number(opciones.dpi) || 300;
  const calidad = Number(opciones.calidad) || 82;

  console.log(`\nLeyendo ${rutaPdf}`);
  const paginas = await medirPaginas(rutaPdf);
  const plan = planificar(paginas, {
    forzarSimples: listaNumeros(opciones.simples),
    omitir: listaNumeros(opciones.omitir),
    hojaEnBlancoTrasPortada: Boolean(opciones["hoja-en-blanco"]),
    doblePlana: Boolean(opciones["doble-plana"]),
  });

  const pliegos = plan.hojas.filter((h) => h.mitad === "izquierda").length;
  const sueltas = plan.hojas.filter((h) => h.mitad === null).length;

  console.log(
    `  ${plan.totalPaginasPdf} páginas de PDF → ${plan.hojas.length} hojas de libro`
  );
  console.log(`  ${pliegos} pliegos partidos · ${sueltas} hojas sueltas`);
  console.log(
    `  hoja de ${plan.anchoHoja}×${Math.round(plan.altoHoja)} pt · razón ${plan.razon.toFixed(3)}`
  );

  if (!plan.alineado) {
    /* Sin esto el libro se convierte igual y se ve bien página a página,
       pero ningún pliego se recompone: el lector emparejaría cada mitad con
       la del pliego vecino. Vale la pena decirlo antes de los seis minutos
       de rasterizado, no después. */
    const primera = plan.hojas.find((h) => h.mitad === "izquierda");
    console.log(
      `\n  AVISO: los pliegos quedan desfasados. La primera mitad es la hoja
  ${primera.numero}, impar, y el lector empareja 2-3, 4-5, 6-7…: cada pliego
  se partiría entre dos pantallas y la ilustración no cruzaría entera.

  Suele deberse a una guarda entre la portada y el primer pliego. Mira qué
  hay en las primeras páginas del PDF y elige:

    --omitir 2         si esa página sobra (una guarda, una hoja de cortesía)
    --hoja-en-blanco   si hace falta — texto del libro, o lleva impreso el
                       número 1 — y aceptas un reverso de tapa en blanco

  Sin ninguna de las dos el libro se convierte igual: simplemente no habrá
  pliegos recompuestos.\n`
    );
  }

  console.log(`  rasterizando a ${dpi} dpi…\n`);

  const inicio = Date.now();
  const hojas = await rasterizar({
    rutaPdf,
    plan,
    destino,
    dpi,
    calidad,
    alProgresar: (hoja, total) => {
      const etiqueta =
        hoja.mitad === null
          ? `PDF ${hoja.paginaPdf}`
          : `PDF ${hoja.paginaPdf} ${hoja.mitad}`;
      process.stdout.write(
        `\r  hoja ${String(hoja.numero).padStart(3)} / ${total}  (${etiqueta})          `
      );
    },
  });
  const segundos = ((Date.now() - inicio) / 1000).toFixed(1);

  /* Los pares de un mismo pliego. El lector los usa para apagar la sombra
     del lomo y dejar que la ilustración cruce entera: es la razón de ser
     de todo este proceso en un libro infantil. */
  const pliegosPares = [];
  const porPliego = new Map();
  for (const h of hojas) {
    if (h.pliego === null) continue;
    if (!porPliego.has(h.pliego)) porPliego.set(h.pliego, []);
    porPliego.get(h.pliego).push(h.numero);
  }
  for (const numeros of porPliego.values()) {
    if (numeros.length !== 2) continue;
    const [a, b] = numeros.sort((x, y) => x - y);
    /* Solo los que el lector va a mostrar juntos. Declarar un pliego cuyas
       mitades caen en pantallas distintas no uniría nada: le quitaría la
       sombra del lomo a dos junturas que sí existen. */
    if (Math.floor(a / 2) !== Math.floor(b / 2)) continue;
    pliegosPares.push([a, b]);
  }

  const manifiesto = {
    slug,
    titulo: opciones.titulo !== true ? opciones.titulo ?? "" : "",
    autor: opciones.autor !== true ? opciones.autor ?? "" : "",
    editorial: opciones.editorial !== true ? opciones.editorial ?? "" : "",
    edad: opciones.edad !== true ? opciones.edad ?? "" : "",
    resumen: opciones.resumen !== true ? opciones.resumen ?? "" : "",
    paginas: hojas.length,
    razon: Number(plan.razon.toFixed(4)),
    /* pares de hojas que en el original eran una sola ilustración */
    pliegos: pliegosPares,
    origen: {
      archivo: path.basename(rutaPdf),
      paginasPdf: plan.totalPaginasPdf,
      dpi,
      calidad,
    },
    hojas,
  };

  await writeFile(
    path.join(destino, "libro.json"),
    `${JSON.stringify(manifiesto, null, 2)}\n`,
    "utf8"
  );

  console.log(`\n\nListo en ${segundos}s → ${destino}`);
  console.log(`  ${hojas.length} hojas, ${hojas.length} miniaturas, libro.json`);

  const planas = hojas.filter((h) => h.plana).map((h) => h.numero);
  if (planas.length > 0) {
    /* No se descarta nada: se avisa. Una guarda de color plano puede ser
       basura de exportación o puede ser parte del libro, y eso lo decide
       quien lo publica. */
    console.log(
      `  hojas casi de un solo color (revisar si sobran): ${planas.join(", ")}`
    );
  }

  console.log(
    `\nPara publicarlo: copia la carpeta a ../../content/libros/${slug}/\n`
  );
}

principal().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
