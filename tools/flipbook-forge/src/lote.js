#!/usr/bin/env node
/*
  LOTE — el catálogo entero de Maguaré, de la web al lector de MIDUHO.

  Encadena lo que ya existía por separado: catalogo-maguare lee qué hay,
  descargar lo trae, y el conversor de siempre (analizar + rasterizar) lo
  convierte en hojas. Este archivo solo orquesta; la lógica vive en sus
  módulos y se puede usar suelta.

  Las tres etapas se pueden correr por separado porque fallan distinto y
  cuestan distinto. Rastrear el catálogo son segundos; descargar, minutos y
  varios cientos de megas; rasterizar, horas de CPU. Cuando algo se tuerce en
  la tercera no hay por qué repetir la primera.

    node src/lote.js catalogo      escribe catalogo.json (no descarga nada)
    node src/lote.js descargar     baja los PDFs que falten
    node src/lote.js convertir     rasteriza los PDFs bajados
    node src/lote.js todo          las tres, en orden

  Opciones:
    --catalogo <ruta>   dónde vive el índice (por defecto ./catalogo.json)
    --pdfs <ruta>       dónde guardar los PDFs (../../content/biblioteca/maguare)
    --salida <ruta>     dónde escribir las hojas (./salida)
    --solo <slug,slug>  limitar a unos títulos
    --desde <slug>      retomar a partir de un título
    --limite <n>        parar después de n libros (para probar)
    --ligero            preferir el PDF recomprimido, más rápido de bajar
    --dpi <n>           resolución de rasterizado (300)
    --pausa <ms>        espera entre libros al descargar (1500)
    --omitir-libro <slug:pág,…>
                        páginas a quitar en libros concretos (slug:2)
    --hoja-en-blanco <slug,slug>
                        alinear esos libros con una hoja vacía tras la portada en vez
                        de quitarles una página (ver el aviso de paridad)
    --doble-plana <slug,slug>
                        libros cuyo PDF es entero de dobles planas, portada
                        incluida: se parte todo, la tapa abre el libro y la
                        contraportada lo cierra
    --forzar            rehacer lo que ya esté hecho
*/

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  pedirHtml,
  extraerFichas,
  extraerPdfs,
  clasificarPdfs,
  extraerMetadatos,
} from "./catalogo-maguare.js";
import { descargarLibro, verificarPdf } from "./descargar.js";
import { medirPaginas, planificar } from "./analizar.js";
import { rasterizar } from "./rasterizar.js";

const INDICE = "https://maguare.gov.co/leer/";

function leerArgumentos(argv) {
  const opciones = {};
  const sueltos = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const clave = a.slice(2);
      const siguiente = argv[i + 1];
      if (siguiente === undefined || siguiente.startsWith("--")) opciones[clave] = true;
      else { opciones[clave] = siguiente; i += 1; }
    } else sueltos.push(a);
  }
  return { opciones, sueltos };
}

const texto = (v, pordefecto) => (v && v !== true ? v : pordefecto);
const lista = (v) => (!v || v === true ? [] : String(v).split(",").map((s) => s.trim()).filter(Boolean));

async function existe(ruta) {
  try { await stat(ruta); return true; } catch { return false; }
}

/* ── catálogo ────────────────────────────────────────────────────────── */

async function etapaCatalogo(cfg) {
  console.log(`\nLeyendo el índice de ${INDICE}`);
  const fichas = extraerFichas(await pedirHtml(INDICE));
  console.log(`  ${fichas.length} fichas de libro\n`);

  const entradas = [];
  for (const [i, ficha] of fichas.entries()) {
    if (process.stdout.isTTY) {
      process.stdout.write(`\r  ficha ${i + 1}/${fichas.length}  ${ficha.slug.slice(0, 40).padEnd(40)}`);
    }
    try {
      const pagina = await pedirHtml(ficha.url);
      const clase = clasificarPdfs(extraerPdfs(pagina), { preferirLigero: Boolean(cfg.ligero) });
      /* De la misma página que ya está descargada: autoría y resumen no
         están en el PDF y volver a pedirla luego sería rastrear dos veces. */
      entradas.push({ ...ficha, ...clase, ...extraerMetadatos(pagina) });
    } catch (error) {
      entradas.push({ ...ficha, estado: "error", elegido: null, todos: [], error: error.message });
    }
    /* Cortesía con un servidor público que no es nuestro. */
    await new Promise((r) => setTimeout(r, 400));
  }

  await writeFile(cfg.catalogo, `${JSON.stringify(entradas, null, 2)}\n`, "utf8");

  const cuenta = {};
  for (const e of entradas) cuenta[e.estado] = (cuenta[e.estado] ?? 0) + 1;
  console.log(`\n\n  ${cfg.catalogo}`);
  for (const [estado, n] of Object.entries(cuenta)) console.log(`    ${String(n).padStart(3)} ${estado}`);

  const colecciones = entradas.filter((e) => e.estado === "coleccion");
  if (colecciones.length > 0) {
    /* No se eligen solas: una ficha con varias obras puede ser una sección
       índice o dos ediciones del mismo título, y eso lo decide una persona. */
    console.log(`\n  Fichas con varias obras (se omiten; revisar a mano):`);
    for (const c of colecciones) console.log(`    ${c.slug} — ${c.nota}`);
  }
  const sinPdf = entradas.filter((e) => e.estado === "sin-pdf");
  if (sinPdf.length > 0) {
    console.log(`\n  Fichas sin PDF (suelen ser páginas de sección):`);
    for (const s of sinPdf) console.log(`    ${s.slug}`);
  }

  return entradas;
}

async function cargarCatalogo(cfg) {
  if (!(await existe(cfg.catalogo))) {
    throw new Error(`No hay catálogo en ${cfg.catalogo}. Corre primero: node src/lote.js catalogo`);
  }
  return JSON.parse(await readFile(cfg.catalogo, "utf8"));
}

/* Los filtros --solo/--desde/--limite se aplican igual en las tres etapas. */
function seleccionar(entradas, cfg) {
  let sel = entradas.filter((e) => e.estado === "ok" && e.elegido);
  if (cfg.solo.length > 0) sel = sel.filter((e) => cfg.solo.includes(e.slug));
  if (cfg.desde) {
    const i = sel.findIndex((e) => e.slug === cfg.desde);
    if (i >= 0) sel = sel.slice(i);
  }
  if (cfg.limite) sel = sel.slice(0, cfg.limite);
  return sel;
}

/* ── descarga ────────────────────────────────────────────────────────── */

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

async function etapaDescargar(cfg) {
  const entradas = await cargarCatalogo(cfg);
  const sel = seleccionar(entradas, cfg);
  await mkdir(cfg.pdfs, { recursive: true });

  console.log(`\nDescargando ${sel.length} libros a ${cfg.pdfs}\n`);
  const resultados = [];

  for (const [i, ficha] of sel.entries()) {
    const destino = path.join(cfg.pdfs, `${ficha.slug}.pdf`);
    const cabecera = `  ${String(i + 1).padStart(3)}/${sel.length}  ${ficha.slug.slice(0, 36).padEnd(36)}`;

    /* El progreso solo se pinta si hay una terminal mirando, y como mucho
       cuatro veces por segundo. Redirigido a un archivo —que es como se
       corren 76 libros— cada trozo del stream escribiría una línea y el log
       acabaría pesando más que algún PDF. */
    const interactivo = process.stdout.isTTY;
    let ultimoPintado = 0;
    const r = await descargarLibro(ficha, destino, {
      alProgresar: (recibido, total) => {
        if (!interactivo) return;
        const ahora = Date.now();
        if (ahora - ultimoPintado < 250) return;
        ultimoPintado = ahora;
        const pct = total ? ` ${String(Math.round((recibido / total) * 100)).padStart(3)}%` : "";
        process.stdout.write(`\r${cabecera}${pct} ${mb(recibido)}        `);
      },
    });

    const marca = r.estado === "error" ? "ERROR" : r.estado === "ya-estaba" ? "ya estaba" : `${r.paginas} pág`;
    const vuelta = interactivo ? "\r" : "";
    console.log(`${vuelta}${cabecera} ${marca}${r.estado === "error" ? ` — ${r.error}` : ""}          `);

    resultados.push({ slug: ficha.slug, ...r });
    if (r.estado === "descargado") await new Promise((res) => setTimeout(res, cfg.pausa));
  }

  const errores = resultados.filter((r) => r.estado === "error");
  console.log(`\n  ${resultados.length - errores.length} listos, ${errores.length} con error`);
  for (const e of errores) console.log(`    ${e.slug}: ${e.error}`);
  return resultados;
}

/* ── conversión ──────────────────────────────────────────────────────── */

/*
  Una pasada del conversor de siempre, pero sin preguntar nada: en un lote de
  54 libros no hay nadie mirando. Lo que en el CLI interactivo es un aviso
  para que la persona decida, aquí se anota en el informe.
*/
async function convertirUno(ficha, cfg) {
  const rutaPdf = path.join(cfg.pdfs, `${ficha.slug}.pdf`);
  if (!(await existe(rutaPdf))) return { slug: ficha.slug, estado: "sin-pdf" };

  const destino = path.join(cfg.salida, ficha.slug);
  const manifiesto = path.join(destino, "libro.json");
  if (!cfg.forzar && (await existe(manifiesto))) {
    return { slug: ficha.slug, estado: "ya-estaba", destino };
  }

  await mkdir(destino, { recursive: true });

  const paginas = await medirPaginas(rutaPdf);
  const plan = planificar(paginas, {
    forzarSimples: [],
    omitir: cfg.omitirPorLibro?.[ficha.slug] ?? [],
    hojaEnBlancoTrasPortada: cfg.hojaEnBlanco.includes(ficha.slug),
    doblePlana: cfg.doblePlana.includes(ficha.slug),
  });

  const hojas = await rasterizar({
    rutaPdf, plan, destino, dpi: cfg.dpi, calidad: cfg.calidad,
    alProgresar: (hoja, total) => {
      if (!process.stdout.isTTY) return;
      process.stdout.write(`\r      hoja ${String(hoja.numero).padStart(3)}/${total}     `);
    },
  });

  const porPliego = new Map();
  for (const h of hojas) {
    if (h.pliego === null) continue;
    if (!porPliego.has(h.pliego)) porPliego.set(h.pliego, []);
    porPliego.get(h.pliego).push(h.numero);
  }
  const pliegos = [];
  for (const numeros of porPliego.values()) {
    if (numeros.length !== 2) continue;
    const [a, b] = numeros.sort((x, y) => x - y);
    if (Math.floor(a / 2) !== Math.floor(b / 2)) continue;
    pliegos.push([a, b]);
  }

  const datos = {
    slug: ficha.slug,
    titulo: ficha.titulo ?? "",
    autor: ficha.autor ?? "",
    /* la entidad que edita, cuando la ficha la distingue de la autoría */
    editorial: ficha.editorial
      ? `${ficha.editorial} · Maguaré`
      : "Maguaré · Ministerio de Culturas",
    /* la edad no la publica la ficha: la pone quien revisa */
    edad: "",
    resumen: ficha.resumen ?? "",
    /* la línea de atribución tal como la publica Maguaré */
    creditos: ficha.creditos ?? "",
    paginas: hojas.length,
    razon: Number(plan.razon.toFixed(4)),
    pliegos,
    origen: {
      archivo: path.basename(rutaPdf),
      url: ficha.url, pdf: ficha.elegido, variante: ficha.nota ?? null,
      paginasPdf: plan.totalPaginasPdf, dpi: cfg.dpi, calidad: cfg.calidad,
    },
    hojas,
  };
  await writeFile(manifiesto, `${JSON.stringify(datos, null, 2)}\n`, "utf8");

  return {
    slug: ficha.slug, estado: "convertido", destino,
    paginas: hojas.length,
    /* Sin pliegos partidos no hay desfase posible: el aviso solo aplica
       cuando el PDF traía dobles planas que recomponer. */
    alineado: plan.alineado,
    partioPliegos: plan.hayPliegos,
    planas: hojas.filter((h) => h.plana).map((h) => h.numero),
  };
}

async function etapaConvertir(cfg) {
  const entradas = await cargarCatalogo(cfg);
  const sel = seleccionar(entradas, cfg);

  console.log(`\nConvirtiendo hasta ${sel.length} libros a ${cfg.salida}`);
  console.log(`  ${cfg.dpi} dpi · calidad ${cfg.calidad}\n`);

  const resultados = [];
  for (const [i, ficha] of sel.entries()) {
    const cabecera = `  ${String(i + 1).padStart(3)}/${sel.length}  ${ficha.slug.slice(0, 36).padEnd(36)}`;
    const vuelta = process.stdout.isTTY ? "\r" : "";
    if (process.stdout.isTTY) process.stdout.write(`${cabecera}`);
    try {
      const r = await convertirUno(ficha, cfg);
      const nota = r.estado === "convertido"
        ? `${r.paginas} hojas${r.partioPliegos && !r.alineado ? "  ⚠ pliegos desfasados" : ""}`
        : r.estado;
      console.log(`${vuelta}${cabecera} ${nota}                    `);
      resultados.push(r);
    } catch (error) {
      console.log(`${vuelta}${cabecera} ERROR — ${error.message}          `);
      resultados.push({ slug: ficha.slug, estado: "error", error: error.message });
    }
  }

  await writeFile(
    path.join(cfg.salida, "informe.json"),
    `${JSON.stringify(resultados, null, 2)}\n`,
    "utf8"
  );

  const hechos = resultados.filter((r) => r.estado === "convertido");
  const errores = resultados.filter((r) => r.estado === "error");
  const desfasados = hechos.filter((r) => r.partioPliegos && !r.alineado);

  console.log(`\n  ${hechos.length} convertidos · ${errores.length} con error`);
  for (const e of errores) console.log(`    ${e.slug}: ${e.error}`);

  if (desfasados.length > 0) {
    /* El único caso que pide mano humana: hay pliegos pero no se recomponen.
       Casi siempre sobra una guarda entre la portada y el primer pliego. */
    console.log(`\n  Revisar — tienen pliegos que no cruzan enteros:`);
    console.log(`    Mira qué hay en la página 2 de cada uno: si sobra, --omitir 2;`);
    console.log(`    si es contenido del libro, --hoja-en-blanco.\n`);
    for (const d of desfasados) {
      console.log(`    ${d.slug}`);
      console.log(`      pdftotext -f 2 -l 2 ${cfg.pdfs}/${d.slug}.pdf - | head`);
      console.log(`      node src/lote.js convertir --solo ${d.slug} --forzar --hoja-en-blanco ${d.slug}`);
    }
  }

  console.log(`\n  informe: ${path.join(cfg.salida, "informe.json")}`);
  return resultados;
}

/* ── main ────────────────────────────────────────────────────────────── */

async function principal() {
  const { opciones, sueltos } = leerArgumentos(process.argv.slice(2));
  const etapa = sueltos[0] ?? "todo";

  const cfg = {
    catalogo: path.resolve(texto(opciones.catalogo, "catalogo.json")),
    pdfs: path.resolve(texto(opciones.pdfs, "../../content/biblioteca/maguare")),
    salida: path.resolve(texto(opciones.salida, "salida")),
    solo: lista(opciones.solo),
    desde: texto(opciones.desde, null),
    limite: Number(opciones.limite) || null,
    ligero: Boolean(opciones.ligero),
    /* libros a los que meter una hoja en blanco inicial para alinear */
    hojaEnBlanco: lista(opciones["hoja-en-blanco"]),
    /* libros exportados enteros a doble plana, portada envolvente incluida */
    doblePlana: lista(opciones["doble-plana"]),
    /* «slug:2,otro:3» — páginas a omitir en libros concretos */
    omitirPorLibro: Object.fromEntries(
      lista(opciones["omitir-libro"]).map((par) => {
        const [slug, paginas] = par.split(":");
        return [slug, (paginas ?? "").split("+").map(Number).filter(Number.isFinite)];
      })
    ),
    dpi: Number(opciones.dpi) || 300,
    calidad: Number(opciones.calidad) || 82,
    pausa: Number(opciones.pausa) || 1500,
    forzar: Boolean(opciones.forzar),
  };

  if (!["catalogo", "descargar", "convertir", "todo"].includes(etapa)) {
    console.error(`Etapa desconocida: ${etapa}\nUsa: catalogo | descargar | convertir | todo`);
    process.exit(1);
  }

  if (etapa === "catalogo" || etapa === "todo") await etapaCatalogo(cfg);
  if (etapa === "descargar" || etapa === "todo") await etapaDescargar(cfg);
  if (etapa === "convertir" || etapa === "todo") await etapaConvertir(cfg);

  console.log("");
}

principal().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
