/**
 * Tipo «jarras» — juego 8 de Matemáticas de 5.° (suma y resta de fracciones
 * con el mismo denominador). Idea del referente público de Mundo Primaria
 * (mat-num-5-8: escribir el resultado de la operación); escena, sabores y
 * números propios de MIDUHO. El resultado nunca pasa de una jarra (1).
 *
 * Se acepta cualquier fracción equivalente al resultado (4/6 o 2/3).
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

export const SABORES = {
  lulo: { nombre: "lulo", color: "#c3cf2f" },
  mora: { nombre: "mora", color: "#8a2253" },
  maracuya: { nombre: "maracuyá", color: "#f2b705" },
  mango: { nombre: "mango", color: "#f08a1c" },
  fresa: { nombre: "fresa", color: "#e0475b" },
  guayaba: { nombre: "guayaba", color: "#ef7f8f" },
} as const;

const ronda = z
  .object({
    id,
    denominador: z.number().int().min(2).max(12),
    a: z.number().int().min(1),
    b: z.number().int().min(1),
    operacion: z.enum(["+", "-"]),
    sabor: z.enum(Object.keys(SABORES) as [keyof typeof SABORES, ...(keyof typeof SABORES)[]]),
  })
  .refine((r) => r.a <= r.denominador && r.b <= r.denominador, { message: "cada jarra tiene a lo sumo una unidad" })
  .refine((r) => (r.operacion === "+" ? r.a + r.b <= r.denominador : r.a > r.b), { message: "el resultado debe estar entre 0 y 1, sin ser 0" });

export type RondaJarras = z.infer<typeof ronda>;
export type ContenidoJarras = { rondas: RondaJarras[] };

export const respuestaJarras = z.object({ n: z.number().int().min(0), d: z.number().int().min(0) });
export type RespuestaJarras = z.infer<typeof respuestaJarras>;

export function resultado(r: RondaJarras): number {
  return r.operacion === "+" ? r.a + r.b : r.a - r.b;
}

/** ¿n/d vale lo mismo que el resultado de la ronda? */
export function esEquivalente(r: RondaJarras, n: number, d: number): boolean {
  return d > 0 && n * r.denominador === resultado(r) * d;
}

const signo = (r: RondaJarras) => (r.operacion === "+" ? "+" : "−");

function rondaDe(c: ContenidoJarras, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

export const jarras = definirTipo({
  tipo: "jarras",
  nombre: "Fracciones",
  versionEsquema: 1,
  esquemaContenido: z.object({ rondas: z.array(ronda).min(4).max(10) }),
  esquemaRespuesta: respuestaJarras,
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, resp) {
    const correcta = esEquivalente(rondaDe(c, itemId), resp.n, resp.d);
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    const d = r.denominador;
    return { pregunta: `${r.a}/${d} ${signo(r)} ${r.b}/${d}`, solucion: `${resultado(r)}/${d}` };
  },
});
