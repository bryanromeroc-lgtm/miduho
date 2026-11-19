#!/usr/bin/env node
/**
 * Captura sonora de referencias (juegos-primero, decisión 2).
 *   capturar <url> --slug <slug> [--guion <archivo.mjs>] [--manual <s>] [--zip <url>]
 *   inventariar <slug>
 *   adaptar <slug> <id…> --destino <carpeta> [--nombre a.mp3,b.mp3]
 *   resumen <slug>
 */
import { copyFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { carpetaReferencia } from "./rutas.mjs";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    slug: { type: "string" },
    guion: { type: "string" },
    manual: { type: "string" },
    zip: { type: "string" },
    destino: { type: "string" },
    nombre: { type: "string" },
  },
});
const [orden, ...resto] = positionals;

const AYUDA = `Uso:
  capturar <url> --slug <slug> [--guion guiones/<plataforma>.mjs] [--manual <segundos>] [--zip <url>]
  inventariar <slug>
  adaptar <slug> <id…> --destino apps/web/public/audio/<carpeta> [--nombre a.mp3,b.mp3]
  resumen <slug>`;

function plantillaLicencia(slug) {
  const destino = join(carpetaReferencia(slug), "LICENCIA.md");
  if (!existsSync(destino)) {
    copyFileSync(fileURLToPath(new URL("../plantillas/LICENCIA.md", import.meta.url)), destino);
    console.log(`LICENCIA.md creada desde la plantilla: complétala (plataforma, autoría, licencia o permiso) 🔶`);
  }
}

switch (orden) {
  case "capturar": {
    const { capturar } = await import("./capturar.mjs");
    await capturar(resto[0], { slug: values.slug, guion: values.guion && resolve(values.guion), manual: values.manual, zip: values.zip });
    plantillaLicencia(values.slug);
    break;
  }
  case "inventariar": {
    const { inventariar } = await import("./inventariar.mjs");
    inventariar(resto[0]);
    break;
  }
  case "adaptar": {
    const { adaptar } = await import("./adaptar.mjs");
    adaptar(resto[0], resto.slice(1), { destino: values.destino, nombre: values.nombre });
    break;
  }
  case "resumen": {
    const { resumen } = await import("./resumen.mjs");
    resumen(resto[0]);
    break;
  }
  default:
    console.log(AYUDA);
    process.exitCode = orden ? 1 : 0;
}
