// Regresión visual de Laboratorios (tareas 2.2 y D7): captura /laboratorios,
// ?mundo=emprendimiento y una ruta de unidad, y las compara píxel a píxel contra
// la línea base. Falla si alguna difiere más allá de la tolerancia.
//
// Uso (desde apps/web, con el servidor de capturas arriba):
//   source scripts/capturas/capturas.env && npm run regresion:labs
import { mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import {
  ANCHOS, APP, CUENTAS, REVISION, RUTAS_LABS, abrirNavegador, capturar, ingresar, nuevoContexto,
} from "./capturas/comun.mjs";

const sharp = createRequire(join(APP, "package.json"))("sharp");

const BASELINE = join(REVISION, "baseline");
const ACTUAL = join(REVISION, "regresion-labs");
// Un canal que cambia menos de UMBRAL_CANAL se considera ruido de antialiasing;
// la página falla si más de TOLERANCIA de sus píxeles cambian.
const UMBRAL_CANAL = 24;
const TOLERANCIA = 0.001;

async function comparar(a, b, diff) {
  const [ia, ib] = await Promise.all([a, b].map((p) => sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (ia.info.width !== ib.info.width || ia.info.height !== ib.info.height) {
    return { proporcion: 1, motivo: `tamaño ${ia.info.width}×${ia.info.height} → ${ib.info.width}×${ib.info.height}` };
  }
  const { width, height } = ia.info;
  const marca = Buffer.alloc(width * height * 4);
  let distintos = 0;
  for (let p = 0; p < width * height; p += 1) {
    const o = p * 4;
    const d = Math.max(
      Math.abs(ia.data[o] - ib.data[o]),
      Math.abs(ia.data[o + 1] - ib.data[o + 1]),
      Math.abs(ia.data[o + 2] - ib.data[o + 2]),
    );
    if (d > UMBRAL_CANAL) {
      distintos += 1;
      marca[o] = 255; marca[o + 3] = 255;
    } else {
      const g = Math.round(ia.data[o] * 0.3 + ia.data[o + 1] * 0.59 + ia.data[o + 2] * 0.11);
      marca[o] = marca[o + 1] = marca[o + 2] = Math.round(g * 0.35 + 165); marca[o + 3] = 255;
    }
  }
  if (distintos) await sharp(marca, { raw: { width, height, channels: 4 } }).png().toFile(diff);
  return { proporcion: distintos / (width * height) };
}

mkdirSync(ACTUAL, { recursive: true });
const navegador = await abrirNavegador();
const fallos = [];
let revisadas = 0;
try {
  for (const rol of ["estudiante", "docente"]) {
    for (const ancho of ANCHOS) {
      const ctx = await nuevoContexto(navegador, ancho);
      const pagina = await ctx.newPage();
      await ingresar(pagina, CUENTAS[rol]);
      for (const { nombre, ruta } of RUTAS_LABS) {
        const archivo = `${rol}-${nombre}-${ancho}.png`;
        const base = join(BASELINE, archivo);
        if (!existsSync(base)) throw new Error(`Falta la línea base ${base}: ejecuta scripts/capturar-linea-base.mjs antes del cambio.`);
        const actual = join(ACTUAL, archivo);
        await capturar(pagina, ruta, actual);
        const r = await comparar(base, actual, join(ACTUAL, archivo.replace(".png", ".diff.png")));
        revisadas += 1;
        const pct = (r.proporcion * 100).toFixed(3);
        if (r.proporcion > TOLERANCIA) fallos.push(`${archivo}: ${r.motivo ?? `${pct} % de píxeles distintos`}`);
        console.log(`${r.proporcion > TOLERANCIA ? "FAIL" : "PASS"} ${archivo} (${pct} %)`);
      }
      await ctx.close();
    }
  }
} finally {
  await navegador.close();
}
if (fallos.length) {
  console.error(`\nLaboratorios cambió en ${fallos.length} de ${revisadas} capturas:\n- ${fallos.join("\n- ")}\nDiferencias en ${ACTUAL}`);
  process.exit(1);
}
console.log(`\nLaboratorios sin cambios (${revisadas} capturas).`);
