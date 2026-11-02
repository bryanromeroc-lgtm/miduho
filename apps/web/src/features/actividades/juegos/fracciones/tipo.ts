/**
 * Tipo «taller-fracciones» — la fracción como parte de un todo en tres formas
 * (círculos, barras y recta numérica). Objetivo de aprendizaje tomado de la
 * simulación pública «Fractions: Intro» de PhET; la mecánica, la escena, los
 * retos y la redacción son propios de MIDUHO.
 *
 * Tiene dos partes: un laboratorio libre (no se califica) y retos por rondas:
 * - construir: armar n/d en la forma pedida (exacta: se piden d partes);
 * - leer: escribir la fracción que muestra la figura (vale una equivalente);
 * - comparar: elegir, entre tres figuras, la que vale lo mismo.
 * Cada ronda vale 1 al primer intento.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

export const FORMAS = ["circulo", "barra", "recta"] as const;
export type Forma = (typeof FORMAS)[number];

/** Topes del taller: hasta 8 partes por unidad y hasta 3 unidades. */
export const MAX_PARTES = 8;
export const MAX_UNIDADES = 3;

const fraccion = z
  .tuple([z.number().int().min(1), z.number().int().min(2).max(MAX_PARTES)])
  .refine(([n, d]) => n <= d * MAX_UNIDADES, { message: `a lo sumo ${MAX_UNIDADES} unidades` });

const figura = z.object({ forma: z.enum(FORMAS), fraccion });
export type Figura = z.infer<typeof figura>;

const ronda = z.discriminatedUnion("reto", [
  z.object({ id, reto: z.literal("construir"), forma: z.enum(FORMAS), fraccion }),
  z.object({ id, reto: z.literal("leer"), forma: z.enum(FORMAS), fraccion }),
  z
    .object({ id, reto: z.literal("comparar"), fraccion, opciones: z.array(figura).length(3) })
    .refine((r) => r.opciones.filter((o) => mismoValor(o.fraccion, r.fraccion)).length === 1, {
      message: "exactamente una opción debe valer lo mismo que la fracción",
    })
    .refine((r) => new Set(r.opciones.map((o) => `${o.forma}-${o.fraccion.join("/")}`)).size === 3, { message: "opciones repetidas" }),
]);

export type RondaTaller = z.infer<typeof ronda>;
export type ContenidoTaller = { rondas: RondaTaller[] };

export const respuestaTaller = z.union([
  z.object({ n: z.number().int().min(0), d: z.number().int().min(0) }),
  z.object({ opcion: z.number().int().min(0) }),
]);
export type RespuestaTaller = z.infer<typeof respuestaTaller>;
export type FraccionEscrita = { n: number; d: number };

export function mismoValor([n1, d1]: readonly [number, number], [n2, d2]: readonly [number, number]): boolean {
  return d1 > 0 && d2 > 0 && n1 * d2 === n2 * d1;
}

/** Unidades que hay que dibujar para que quepa n/d (al menos una). */
export function unidadesDe(n: number, d: number): number {
  return Math.max(1, Math.ceil(n / d));
}

/** Opción correcta de una ronda de comparar. */
export function opcionCorrecta(r: Extract<RondaTaller, { reto: "comparar" }>): number {
  return r.opciones.findIndex((o) => mismoValor(o.fraccion, r.fraccion));
}

export function esCorrecta(r: RondaTaller, resp: RespuestaTaller): boolean {
  if (r.reto === "comparar") return "opcion" in resp && resp.opcion === opcionCorrecta(r);
  if (!("n" in resp)) return false;
  const [n, d] = r.fraccion;
  // Construir pide n/d tal cual (las partes las fija el número); leer acepta 2/4 por 1/2.
  return r.reto === "construir" ? resp.n === n && resp.d === d : mismoValor([resp.n, resp.d], [n, d]);
}

/*
  Errores típicos que la pista nombra. Se revisan en este orden; el primero
  que encaje gana. 🔶 Lista propuesta; confirmar con la docente.
*/
export type Diagnostico =
  | "sin-pintar" // escribió abajo las partes sin pintar: 3/1 por 3/4
  | "invertida" // numerador y denominador al revés: 4/3 por 3/4
  | "marcas" // en la recta contó rayitas (con la del 0) y no saltos: 3/5 por 3/4
  | "partes" // pintadas bien, partes de la unidad mal
  | "pintadas" // partes bien, pintadas mal
  | "mismo-numerador" // comparar: eligió la de igual número de arriba
  | "otra";

export function diagnosticar(r: RondaTaller, resp: RespuestaTaller): Diagnostico {
  const [n, d] = r.fraccion;
  if (r.reto === "comparar") {
    if (!("opcion" in resp)) return "otra";
    const elegida = r.opciones[resp.opcion]?.fraccion;
    if (!elegida) return "otra";
    if (elegida[0] === d && elegida[1] === n) return "invertida";
    if (elegida[0] === n) return "mismo-numerador";
    return "otra";
  }
  if (!("n" in resp)) return "otra";
  if (n < d && resp.n === n && resp.d === d - n) return "sin-pintar";
  if (n !== d && resp.n === d && resp.d === n) return "invertida";
  if (r.forma === "recta" && resp.n === n && resp.d === d + 1) return "marcas";
  if (resp.n === n) return "partes";
  if (resp.d === d) return "pintadas";
  return "otra";
}

const NOMBRES = ["", "", "medio", "tercio", "cuarto", "quinto", "sexto", "séptimo", "octavo"];
const NUMEROS = ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiún", "veintidós", "veintitrés", "veinticuatro"];

/** «tres cuartos», «un medio», «cinco tercios», «dos enteros». Hasta 8 partes y 24 tomadas. */
export function enPalabras(n: number, d: number): string {
  const num = NUMEROS[n] ?? String(n);
  if (d === 1) return n === 1 ? "un entero" : `${num} enteros`;
  const nombre = NOMBRES[d] ?? `${d}avo`;
  return n === 1 ? `${num} ${nombre}` : `${num} ${nombre}s`;
}

const NOMBRE_FORMA: Record<Forma, string> = { circulo: "círculos", barra: "barras", recta: "la recta numérica" };

export function nombreForma(f: Forma): string {
  return NOMBRE_FORMA[f];
}

/** Lo que el lector de pantalla oye de una figura: «Círculos: 3 de 4 partes pintadas». */
export function describirFigura(forma: Forma, n: number, d: number): string {
  if (forma === "recta") return `Recta numérica partida en ${d === 1 ? "unidades" : `${d} partes por unidad`}, con un punto a ${n} ${n === 1 ? "salto" : "saltos"} del 0`;
  const objeto = forma === "circulo" ? "Círculos partidos" : "Barras partidas";
  return `${objeto} en ${d} ${d === 1 ? "parte" : "partes iguales"}, con ${n} ${n === 1 ? "parte pintada" : "partes pintadas"}`;
}

function rondaDe(c: ContenidoTaller, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

export const tallerFracciones = definirTipo({
  tipo: "taller-fracciones",
  nombre: "Taller de fracciones",
  versionEsquema: 1,
  esquemaContenido: z.object({ rondas: z.array(ronda).min(4).max(10) }),
  esquemaRespuesta: respuestaTaller,
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, resp) {
    const correcta = esCorrecta(rondaDe(c, itemId), resp);
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    const f = r.fraccion.join("/");
    if (r.reto === "construir") return { pregunta: `Arma ${f} con ${nombreForma(r.forma)}`, solucion: f };
    if (r.reto === "leer") return { pregunta: `¿Qué fracción muestra ${r.forma === "recta" ? "la recta" : `la figura de ${nombreForma(r.forma)}`}?`, solucion: f };
    const o = r.opciones[opcionCorrecta(r)];
    return { pregunta: `¿Qué figura vale ${f}?`, solucion: `${nombreForma(o.forma)} con ${o.fraccion.join("/")}` };
  },
});
