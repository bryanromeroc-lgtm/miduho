/**
 * Rondas y pistas de «Ubica en el mapa». Mecánica estudiada en
 * docs/investigacion/referencia-mapa-departamentos.md; implementación propia.
 *
 * Todo sale de la configuración de la actividad y su semilla: el cliente y el
 * servidor generan exactamente los mismos departamentos en el mismo orden.
 */
import { generador } from "../../tipos/contrato";
import { DEPARTAMENTOS, RECUADRO_INSULAR, VIEWBOX, type Departamento, type RegionNatural } from "./colombia";

export type ConfigMapa = {
  mapa: "colombia-departamentos";
  semilla: number;
  rondas: number;
  regiones: RegionNatural[];
  /** Con fronteras (base) o sin ellas (más difícil). */
  fronteras: boolean;
};

export type RondaMapa = { id: string; departamento: string };

export const REGIONES: Record<RegionNatural, string> = {
  caribe: "Caribe",
  andina: "Andina",
  pacifica: "Pacífica",
  orinoquia: "Orinoquía",
  amazonia: "Amazonía",
  insular: "Insular",
};

export const ISLAS = "CO-SAP";

const POR_ID = new Map(DEPARTAMENTOS.map((d) => [d.id, d]));

export function departamento(id: string): Departamento {
  const d = POR_ID.get(id);
  if (!d) throw new Error(`Departamento desconocido: ${id}`);
  return d;
}

export function esDepartamento(id: string) {
  return POR_ID.has(id);
}

export function disponibles(regiones: readonly RegionNatural[]) {
  return DEPARTAMENTOS.filter((d) => regiones.includes(d.region));
}

export function rondasDe(config: ConfigMapa): RondaMapa[] {
  const azar = generador(`mapa:${config.mapa}:${config.semilla}:${[...config.regiones].sort().join("+")}`);
  const lista = disponibles(config.regiones).map((d) => d.id);
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista.slice(0, config.rondas).map((id, i) => ({ id: `r${i + 1}`, departamento: id }));
}

/* ---------- Rumbos (el eje y del SVG crece hacia abajo) ---------- */

const RUMBOS = ["este", "noreste", "norte", "noroeste", "oeste", "suroeste", "sur", "sureste"] as const;
export type Rumbo = (typeof RUMBOS)[number];

export function rumbo(desde: readonly [number, number], hacia: readonly [number, number]): Rumbo {
  const angulo = Math.atan2(desde[1] - hacia[1], hacia[0] - desde[0]);
  const sector = Math.round(angulo / (Math.PI / 4));
  return RUMBOS[(sector + 8) % 8];
}

/** Pista según el error: vecino, misma región u otra región. */
export function pistaMapa(objetivoId: string, tocadoId: string): string {
  const objetivo = departamento(objetivoId);
  const tocado = departamento(tocadoId);
  if (objetivo.id === ISLAS) return `${tocado.nombre} está en el continente. ${objetivo.nombre} son islas del mar Caribe: búscalas en el recuadro.`;
  if (tocado.id === ISLAS) return `Esas son las islas del mar Caribe. ${objetivo.nombre} está en el continente, en la región ${REGIONES[objetivo.region]}.`;
  const hacia = rumbo(tocado.centro, objetivo.centro);
  if (tocado.vecinos.includes(objetivo.id)) return `¡Estás cerca! ${objetivo.nombre} limita con ${tocado.nombre}: está al ${hacia}.`;
  if (tocado.region === objetivo.region) return `Vas bien: ${objetivo.nombre} también es de la región ${REGIONES[objetivo.region]}. Búscalo más al ${hacia}.`;
  return `${tocado.nombre} es de la región ${REGIONES[tocado.region]}. ${objetivo.nombre} está en la región ${REGIONES[objetivo.region]}, más al ${hacia}.`;
}

/** Lista de nombres en español: «A», «A y B», «A, B y C». */
export function enumerar(nombres: string[]) {
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

/** Lo que enseña el repaso: región y con quién limita. */
export function descripcion(id: string) {
  const d = departamento(id);
  if (d.id === ISLAS) return `${d.nombre} es el departamento insular de Colombia, en el mar Caribe.`;
  const vecinos = enumerar(d.vecinos.map((v) => departamento(v).nombre));
  return `${d.nombre} está en la región ${REGIONES[d.region]} y limita con ${vecinos}.`;
}

/* ---------- Navegación con flechas ---------- */

export type Flecha = "arriba" | "abajo" | "izquierda" | "derecha";
const VECTOR: Record<Flecha, [number, number]> = { arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0] };

/**
 * El departamento más cercano en la dirección de la flecha (cono de ±60°),
 * penalizando lo que se aparta del eje. `null` si no hay ninguno.
 */
export function vecinoEnDireccion(actualId: string, flecha: Flecha, candidatos: readonly string[] = DEPARTAMENTOS.map((d) => d.id)): string | null {
  const [ax, ay] = departamento(actualId).centro;
  const [vx, vy] = VECTOR[flecha];
  let mejor: string | null = null;
  let mejorCosto = Infinity;
  for (const id of candidatos) {
    if (id === actualId) continue;
    const [x, y] = departamento(id).centro;
    const dx = x - ax;
    const dy = y - ay;
    const distancia = Math.hypot(dx, dy);
    if (distancia === 0) continue;
    const avance = dx * vx + dy * vy;
    if (avance / distancia < Math.cos(Math.PI / 3)) continue;
    const costo = distancia + 2 * Math.abs(dx * vy - dy * vx);
    if (costo < mejorCosto) { mejorCosto = costo; mejor = id; }
  }
  return mejor;
}

/** Zona del mapa en palabras, para el nombre accesible de un departamento sin resolver. */
export function zona(id: string) {
  if (id === ISLAS) return "las islas del recuadro";
  const [x, y] = departamento(id).centro;
  const fila = y < VIEWBOX.alto / 3 ? "norte" : y < (2 * VIEWBOX.alto) / 3 ? "centro" : "sur";
  const columna = x < VIEWBOX.ancho / 3 ? "oeste" : x < (2 * VIEWBOX.ancho) / 3 ? "centro" : "este";
  if (fila === "centro" && columna === "centro") return "el centro";
  if (fila === "centro") return `el ${columna}`;
  if (columna === "centro") return `el ${fila}`;
  return `el ${fila === "norte" ? "nor" : "sur"}${columna}`;
}

export { RECUADRO_INSULAR, VIEWBOX };
