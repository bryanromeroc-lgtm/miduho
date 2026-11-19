#!/usr/bin/env node
/**
 * Genera apps/web/src/features/actividades/juegos/mapa/colombia.ts desde
 * Natural Earth (Admin 1 – States, Provinces, 1:10m; dominio público).
 *
 *   node tools/mapas/generar-colombia.mjs <carpeta-con-ne_10m_admin_1_states_provinces.shp>
 *
 * Usa mapshaper con `npx` (no es dependencia del proyecto). Pasos:
 * 1. Filtra Colombia, corrige el código de Bogotá (Natural Earth le pone
 *    CO-CUN) y descarta la unidad sin departamento (CO-X01).
 * 2. Calcula vecinos con la geometría completa: dos unidades son vecinas si
 *    comparten al menos dos vértices del borde.
 * 3. Simplifica conservando la topología (bordes compartidos iguales).
 * 4. Proyecta (equirectangular con corrección por coseno de la latitud) a un
 *    viewBox fijo; San Andrés y Providencia van en un recuadro aparte.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const carpeta = process.argv[2];
if (!carpeta) {
  console.error("Uso: node tools/mapas/generar-colombia.mjs <carpeta de Natural Earth>");
  process.exit(1);
}
const shp = join(resolve(carpeta), "ne_10m_admin_1_states_provinces.shp");
const tmp = mkdtempSync(join(tmpdir(), "mapa-col-"));
const salida = resolve(import.meta.dirname, "../../apps/web/src/features/actividades/juegos/mapa/colombia.ts");

/** Nombre en español de Colombia y región natural (una por departamento para el juego; 🔶 validar con la docente). */
const DEPARTAMENTOS = {
  "CO-AMA": ["Amazonas", "amazonia"],
  "CO-ANT": ["Antioquia", "andina"],
  "CO-ARA": ["Arauca", "orinoquia"],
  "CO-ATL": ["Atlántico", "caribe"],
  "CO-BOL": ["Bolívar", "caribe"],
  "CO-BOY": ["Boyacá", "andina"],
  "CO-CAL": ["Caldas", "andina"],
  "CO-CAQ": ["Caquetá", "amazonia"],
  "CO-CAS": ["Casanare", "orinoquia"],
  "CO-CAU": ["Cauca", "pacifica"],
  "CO-CES": ["Cesar", "caribe"],
  "CO-CHO": ["Chocó", "pacifica"],
  "CO-COR": ["Córdoba", "caribe"],
  "CO-CUN": ["Cundinamarca", "andina"],
  "CO-DC": ["Bogotá D. C.", "andina"],
  "CO-GUA": ["Guainía", "amazonia"],
  "CO-GUV": ["Guaviare", "amazonia"],
  "CO-HUI": ["Huila", "andina"],
  "CO-LAG": ["La Guajira", "caribe"],
  "CO-MAG": ["Magdalena", "caribe"],
  "CO-MET": ["Meta", "orinoquia"],
  "CO-NAR": ["Nariño", "pacifica"],
  "CO-NSA": ["Norte de Santander", "andina"],
  "CO-PUT": ["Putumayo", "amazonia"],
  "CO-QUI": ["Quindío", "andina"],
  "CO-RIS": ["Risaralda", "andina"],
  "CO-SAN": ["Santander", "andina"],
  "CO-SAP": ["San Andrés, Providencia y Santa Catalina", "insular"],
  "CO-SUC": ["Sucre", "caribe"],
  "CO-TOL": ["Tolima", "andina"],
  "CO-VAC": ["Valle del Cauca", "pacifica"],
  "CO-VAU": ["Vaupés", "amazonia"],
  "CO-VID": ["Vichada", "orinoquia"],
};

function mapshaper(...args) {
  execFileSync("npx", ["--yes", "mapshaper@0.6.113", ...args], { stdio: ["ignore", "ignore", "inherit"] });
}

// 1. Colombia con códigos corregidos (Bogotá es la unidad CO-CUN cuyo nombre no es Cundinamarca).
const arreglar = `codigo = iso_3166_2 == 'CO-CUN' && name != 'Cundinamarca' ? 'CO-DC' : iso_3166_2`;
const completo = join(tmp, "completo.json");
const simple = join(tmp, "simple.json");
mapshaper(shp, "-filter", "adm0_a3 == 'COL'", "-each", arreglar, "-filter", "codigo != 'CO-X01~' && codigo != 'CO-X01'", "-filter-fields", "codigo", "-o", completo, "format=geojson", "precision=0.00001");
mapshaper(completo, "-simplify", "12%", "keep-shapes", "-each", "cx = this.innerX, cy = this.innerY", "-o", simple, "format=geojson", "precision=0.0001");

const geoCompleto = JSON.parse(readFileSync(completo, "utf8"));
const geoSimple = JSON.parse(readFileSync(simple, "utf8"));
const codigos = geoSimple.features.map((f) => f.properties.codigo);
for (const c of Object.keys(DEPARTAMENTOS)) if (!codigos.includes(c)) throw new Error(`Falta ${c}`);
if (codigos.length !== 33) throw new Error(`Se esperaban 33 unidades y hay ${codigos.length}: ${codigos.join(", ")}`);

const anillos = (g) => (g.type === "Polygon" ? g.coordinates : g.coordinates.flat());

// 2. Vecinos con la geometría completa.
const vertices = new Map();
for (const f of geoCompleto.features) {
  const set = new Set();
  for (const anillo of anillos(f.geometry)) for (const [lon, lat] of anillo) set.add(`${lon.toFixed(4)},${lat.toFixed(4)}`);
  vertices.set(f.properties.codigo, set);
}
const vecinos = Object.fromEntries(codigos.map((c) => [c, []]));
for (const a of codigos) {
  for (const b of codigos) {
    if (a >= b) continue;
    let comunes = 0;
    for (const v of vertices.get(a)) if (vertices.get(b).has(v) && ++comunes >= 2) break;
    if (comunes >= 2) { vecinos[a].push(b); vecinos[b].push(a); }
  }
}

// 4. Proyección. Continente: lon −79,1…−66,8, lat −4,3…12,5 aprox.
const LAT0 = 4;
const K = Math.cos((LAT0 * Math.PI) / 180);
const continente = geoSimple.features.filter((f) => f.properties.codigo !== "CO-SAP");
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const f of continente) for (const anillo of anillos(f.geometry)) for (const [lon, lat] of anillo) {
  minX = Math.min(minX, lon * K); maxX = Math.max(maxX, lon * K);
  minY = Math.min(minY, -lat); maxY = Math.max(maxY, -lat);
}
const ANCHO = 760;
const MARGEN = 16;
const escala = (ANCHO - 2 * MARGEN) / (maxX - minX);
const ALTO = Math.round((maxY - minY) * escala + 2 * MARGEN);
const proyectar = ([lon, lat]) => [MARGEN + (lon * K - minX) * escala, MARGEN + (-lat - minY) * escala];

// Recuadro insular: arriba a la izquierda (mar Caribe en el mapa), a otra escala.
// Solo San Andrés y Providencia (los cayos lejanos no caben a esta escala) y con
// la geometría completa: simplificadas, islas tan pequeñas se vuelven triángulos.
const RECUADRO = { x: 12, y: 12, ancho: 120, alto: 180 };
const islasCompletas = geoCompleto.features.find((f) => f.properties.codigo === "CO-SAP");
const islas = {
  geometry: {
    type: "MultiPolygon",
    coordinates: anillos(islasCompletas.geometry).filter((anillo) => anillo.every(([lon]) => lon < -81)).map((anillo) => [anillo]),
  },
};
geoSimple.features.find((f) => f.properties.codigo === "CO-SAP").geometry = islas.geometry;
let iMinX = Infinity, iMaxX = -Infinity, iMinY = Infinity, iMaxY = -Infinity;
for (const anillo of anillos(islas.geometry)) for (const [lon, lat] of anillo) {
  iMinX = Math.min(iMinX, lon * K); iMaxX = Math.max(iMaxX, lon * K);
  iMinY = Math.min(iMinY, -lat); iMaxY = Math.max(iMaxY, -lat);
}
const iEscala = Math.min((RECUADRO.ancho - 40) / (iMaxX - iMinX), (RECUADRO.alto - 40) / (iMaxY - iMinY));
const proyectarIsla = ([lon, lat]) => [
  RECUADRO.x + RECUADRO.ancho / 2 + (lon * K - (iMinX + iMaxX) / 2) * iEscala,
  RECUADRO.y + RECUADRO.alto / 2 + (-lat - (iMinY + iMaxY) / 2) * iEscala,
];

const r1 = (n) => Math.round(n * 10) / 10;
function trazado(geometria, p) {
  return anillos(geometria)
    .map((anillo) => {
      const puntos = anillo.slice(0, -1).map(p);
      return "M" + puntos.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
    })
    .join("");
}

const unidades = geoSimple.features
  .map((f) => {
    const codigo = f.properties.codigo;
    const esIsla = codigo === "CO-SAP";
    const p = esIsla ? proyectarIsla : proyectar;
    const [cx, cy] = esIsla ? [RECUADRO.x + RECUADRO.ancho / 2, RECUADRO.y + RECUADRO.alto / 2] : p([f.properties.cx, f.properties.cy]);
    const [nombre, region] = DEPARTAMENTOS[codigo];
    return { id: codigo, nombre, region, d: trazado(f.geometry, p), centro: [r1(cx), r1(cy)], vecinos: vecinos[codigo].sort() };
  })
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

const cabecera = `/**
 * Mapa de Colombia por departamentos para el tipo «mapa».
 * ARCHIVO GENERADO por tools/mapas/generar-colombia.mjs — no editar a mano.
 *
 * Fuente: Natural Earth, Admin 1 – States, Provinces (1:10m, v5.1.1),
 * dominio público (https://www.naturalearthdata.com/about/terms-of-use/).
 * Simplificado y proyectado por MIDUHO; vecinos calculados con la geometría
 * completa. San Andrés y Providencia van en el recuadro insular, a otra escala.
 */
`;
const cuerpo = `
export type RegionNatural = "caribe" | "andina" | "pacifica" | "orinoquia" | "amazonia" | "insular";

export type Departamento = {
  id: string;
  nombre: string;
  region: RegionNatural;
  /** Trazado SVG en el sistema del viewBox. */
  d: string;
  /** Punto interior para la etiqueta y la chincheta. */
  centro: [number, number];
  vecinos: string[];
};

export const VIEWBOX = { ancho: ${ANCHO}, alto: ${ALTO} } as const;
export const RECUADRO_INSULAR = ${JSON.stringify(RECUADRO)} as const;

export const DEPARTAMENTOS: Departamento[] = ${JSON.stringify(unidades, null, 2)};
`;
writeFileSync(salida, cabecera + cuerpo);
console.log(`Escrito ${salida}: ${unidades.length} unidades, viewBox ${ANCHO}×${ALTO}`);
