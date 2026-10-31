// Línea base visual del rediseño (tarea 2.1): captura las superficies del
// estudiante y de la docente a 1440, 1024 y 390 px en .impeccable/review/baseline/.
//
// Uso (desde apps/web):
//   ./scripts/capturas/preparar.sh
//   source scripts/capturas/capturas.env && ./node_modules/.bin/next start &
//   source scripts/capturas/capturas.env && node scripts/capturar-linea-base.mjs [--salida <dir>]
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  ANCHOS, CUENTAS, REVISION, RUTAS_LABS, abrirNavegador, capturar, ingresar, nuevoContexto,
} from "./capturas/comun.mjs";

const i = process.argv.indexOf("--salida");
const SALIDA = i > 0 ? resolve(process.argv[i + 1]) : join(REVISION, "baseline");

const RUTAS = {
  publico: [{ nombre: "ingreso", ruta: "/login" }, { nombre: "recuperar", ruta: "/recuperar" }],
  estudiante: [
    { nombre: "inicio", ruta: "/" },
    { nombre: "biblioteca", ruta: "/biblioteca" },
    { nombre: "agenda", ruta: "/agenda" },
    { nombre: "cuenta", ruta: "/cuenta" },
    ...RUTAS_LABS,
  ],
  docente: [
    { nombre: "inicio", ruta: "/" },
    { nombre: "clases", ruta: "/clases" },
    { nombre: "biblioteca", ruta: "/biblioteca" },
    { nombre: "agenda", ruta: "/agenda" },
    { nombre: "mi-curso", ruta: "/mi-curso" },
    { nombre: "cuenta", ruta: "/cuenta" },
    ...RUTAS_LABS,
  ],
};

mkdirSync(SALIDA, { recursive: true });
const navegador = await abrirNavegador();
let total = 0;
try {
  for (const [rol, rutas] of Object.entries(RUTAS)) {
    for (const ancho of ANCHOS) {
      const ctx = await nuevoContexto(navegador, ancho);
      const pagina = await ctx.newPage();
      if (rol !== "publico") await ingresar(pagina, CUENTAS[rol]);
      for (const { nombre, ruta } of rutas) {
        await capturar(pagina, ruta, join(SALIDA, `${rol}-${nombre}-${ancho}.png`));
        total += 1;
      }
      await ctx.close();
    }
  }
} finally {
  await navegador.close();
}
console.log(`${total} capturas en ${SALIDA}`);
