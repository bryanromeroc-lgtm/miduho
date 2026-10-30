#!/usr/bin/env node
/*
  DECLARAR — convierte los libro.json de un lote en el código que la
  plataforma necesita para mostrarlos.

  Un libro no existe para MIDUHO hasta que está declarado en dos sitios:
  TITULOS en lib/datos.ts, que es el catálogo que se navega, y LIBROS en
  lib/libros.ts, que dice cuáles de esos títulos se pueden abrir en el lector.
  Convertir 76 libros a mano sería copiar 76 veces los mismos cinco campos.

  No escribe sobre el código: imprime los bloques para revisarlos y pegarlos.
  Los metadatos que el conversor no puede saber —autor, edad, resumen— salen
  vacíos a propósito, marcados con TODO, porque una plantilla silenciosa se
  publica sin que nadie la note y un TODO no.

    node src/declarar.js [--salida ./salida] [--desde-id 104]
*/

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

function leerArgumentos(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    const clave = argv[i].slice(2);
    const sig = argv[i + 1];
    if (sig === undefined || sig.startsWith("--")) o[clave] = true;
    else { o[clave] = sig; i += 1; }
  }
  return o;
}

const comillas = (s) => `"${String(s ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/* Los pliegos son muchos pares cortos: en una sola línea son ilegibles y uno
   por línea ocupa media pantalla. Siete por línea es como está escrito el
   libro que ya hay en el repo. */
function formatearPliegos(pliegos, sangria = "      ") {
  if (!pliegos || pliegos.length === 0) return null;
  const pares = pliegos.map(([a, b]) => `[${a}, ${b}]`);
  const lineas = [];
  for (let i = 0; i < pares.length; i += 7) {
    lineas.push(sangria + pares.slice(i, i + 7).join(", ") + ",");
  }
  return lineas.join("\n");
}

async function principal() {
  const o = leerArgumentos(process.argv.slice(2));
  const salida = path.resolve(o.salida && o.salida !== true ? o.salida : "salida");
  let siguienteId = Number(o["desde-id"]) || 104;

  const carpetas = (await readdir(salida, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const libros = [];
  for (const carpeta of carpetas) {
    try {
      libros.push(JSON.parse(await readFile(path.join(salida, carpeta, "libro.json"), "utf8")));
    } catch {
      /* carpeta a medio convertir: no es un libro todavía */
    }
  }

  if (libros.length === 0) {
    console.error(`No hay libro.json en ${salida}`);
    process.exit(1);
  }

  const titulos = [];
  const entradas = [];

  for (const libro of libros) {
    const id = `lit-${siguienteId}`;
    siguienteId += 1;

    titulos.push(
      `  { id: ${comillas(id)}, titulo: ${comillas(libro.titulo)}, autor: ${comillas(libro.autor || "TODO")}, ` +
      `tipo: "Libro", edad: ${comillas(libro.edad || "TODO")}, idioma: "Español" },`
    );

    const pliegos = formatearPliegos(libro.pliegos);
    const partes = [
      `  {`,
      ...(libro.creditos ? [`    /* ${libro.creditos}`, `       —`] : [`    /*`]),
      `       Maguaré · ${libro.origen?.url ?? ""}`,
      `       Convertido con flipbook-forge desde ${libro.origen?.archivo ?? "?"}` +
        `${libro.origen?.variante ? ` (${libro.origen.variante})` : ""}:`,
      `       ${libro.origen?.paginasPdf ?? "?"} páginas de PDF → ${libro.paginas} hojas` +
        `${libro.pliegos?.length ? `, ${libro.pliegos.length} pliegos` : ""}. */`,
      `    slug: ${comillas(libro.slug)},`,
      `    tituloId: ${comillas(id)},`,
      `    titulo: ${comillas(libro.titulo)},`,
      `    autor: ${comillas(libro.autor || "TODO")},`,
      `    editorial: ${comillas(libro.editorial || "Maguaré · Ministerio de Culturas")},`,
      `    paginas: ${libro.paginas},`,
      `    razon: ${libro.razon},`,
    ];
    if (pliegos) partes.push(`    pliegos: [`, pliegos, `    ],`);
    partes.push(
      `    edad: ${comillas(libro.edad || "TODO")},`,
      `    resumen: ${comillas(libro.resumen || "TODO")},`,
      `  },`
    );
    entradas.push(partes.join("\n"));
  }

  const sinAutor = libros.filter((l) => !l.autor).length;
  const sinResumen = libros.filter((l) => !l.resumen).length;
  /* La edad no la publica Maguaré en la ficha: la pone quien revisa. */
  const sinEdad = libros.filter((l) => !l.edad).length;

  console.log(`\n/* ─── ${libros.length} libros ─── */`);
  console.log(`\n/* 1. En apps/web/src/lib/datos.ts, dentro de TITULOS: */\n`);
  console.log(titulos.join("\n"));
  console.log(`\n\n/* 2. En apps/web/src/lib/libros.ts, dentro de LIBROS: */\n`);
  console.log(entradas.join("\n"));
  console.log(`\n\n/* 3. Copiar las hojas:`);
  console.log(`     cp -r ${path.relative(process.cwd(), salida)}/* ../../content/libros/`);
  console.log(`*/`);

  console.error(`\n  Por completar a mano (marcados TODO):`);
  console.error(`    edad     ${sinEdad}/${libros.length}  — la ficha de Maguaré no la publica`);
  if (sinAutor > 0) console.error(`    autor    ${sinAutor}/${libros.length}  — la ficha no declara autoría`);
  if (sinResumen > 0) console.error(`    resumen  ${sinResumen}/${libros.length}`);
  console.error("");
}

principal().catch((e) => { console.error(`\nError: ${e.message}`); process.exit(1); });
