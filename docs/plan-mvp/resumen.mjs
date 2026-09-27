// Recalcula tareas y días del plan a partir de las tablas de los .md de esta carpeta.
// Uso: node app/docs/plan-mvp/resumen.mjs
// Las tareas «Descartada» no suman; «Hecha» cuenta aparte para ver lo que falta.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const fila = /^\|\s*([A-Z0-9]+(?:-[A-Z]+)?-\d+)\s*\|/;
const num = (s) => Number(s.replace(",", "."));
const fmt = (n) => String(Math.round(n * 100) / 100).replace(".", ",");

const total = { tareas: 0, P0: 0, P1: 0, P2: 0, hechas: 0, pendiente: 0 };
const filas = [];

for (const archivo of readdirSync(dir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()) {
  const r = { archivo, tareas: 0, P0: 0, P1: 0, P2: 0, hechas: 0, pendiente: 0 };
  for (const linea of readFileSync(join(dir, archivo), "utf8").split("\n")) {
    if (!fila.test(linea)) continue;
    const celdas = linea.split("|").slice(1, -1).map((c) => c.trim());
    const [, , , prio, dias, , estado] = celdas;
    if (estado === "Descartada") continue;
    const d = num(dias);
    if (Number.isNaN(d) || !(prio in r)) {
      console.warn(`Fila ignorada en ${archivo}: ${celdas[0]} (prioridad o días no válidos)`);
      continue;
    }
    r.tareas += 1;
    r[prio] += d;
    if (estado === "Hecha") r.hechas += d;
    else r.pendiente += d;
  }
  if (r.tareas === 0) continue;
  filas.push(r);
  for (const k of Object.keys(total)) total[k] += r[k];
}

const cabecera = "| Archivo | Tareas | P0 | P1 | P2 | Total | Hecho | Falta |";
console.log(cabecera);
console.log("| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const r of [...filas, { archivo: "Total", ...total }]) {
  const t = r.P0 + r.P1 + r.P2;
  console.log(
    `| ${r.archivo} | ${r.tareas} | ${fmt(r.P0)} | ${fmt(r.P1)} | ${fmt(r.P2)} | ${fmt(t)} | ${fmt(r.hechas)} | ${fmt(r.pendiente)} |`,
  );
}
console.log(`\nCon colchón de 1,3: P0 ${fmt(total.P0 * 1.3)} · P1 ${fmt(total.P1 * 1.3)} · falta ${fmt(total.pendiente * 1.3)} días.`);
