/**
 * Objetivo tomado de la simulación pública "Comparar números" de PhET (CC BY 4.0, versión 1.0.10); la mecánica, la escena y la redacción son propias de MIDUHO.
 * Construir acepta cualquier entero de 0 a 20 que cumpla la relación pedida de derecha a izquierda.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";
import { rutaAudio } from "../../tipos/audio";
import { esquemaEscenaJuego } from "../comun/escena";

export const RELACIONES = ["mayor", "menor", "igual"] as const;
export type Relacion = (typeof RELACIONES)[number];
export const SIMBOLOS: Record<Relacion, string> = { mayor: ">", menor: "<", igual: "=" };
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const cantidad = z.number().int().min(0).max(20);
const coleccion = z.object({ cantidad, objeto: id });
export type Coleccion = z.infer<typeof coleccion>;
const objeto = z.object({ id, singular: z.string().trim().min(1), plural: z.string().trim().min(1), imagen: z.string().regex(/^\/images\/[\w\-/]+\.webp$/) });
export type Objeto = z.infer<typeof objeto>;
const base = { id, izquierda: coleccion, derecha: coleccion, pista: z.string().trim().min(1), explicacion: z.string().trim().min(1), enunciado: z.string().trim().min(1).optional(), audio: rutaAudio.optional() };
const reto = z.discriminatedUnion("clase", [
  z.object({ ...base, clase: z.literal("leer"), correcta: z.enum(RELACIONES) }).refine((r) => r.correcta === relacionDe(r.izquierda.cantidad, r.derecha.cantidad), "La relación no coincide con las cantidades"),
  z.object({ ...base, clase: z.literal("construir"), correcta: z.enum(RELACIONES) }).refine((r) => Array.from({ length: 21 }, (_, n) => n).some((n) => relacionDe(n, r.izquierda.cantidad) === r.correcta), "No hay solución entre 0 y 20"),
]);
export type RetoComparar = z.infer<typeof reto>;
export const esquemaContenidoComparar = z.object({
  objetos: z.array(objeto).min(1),
  inicial: z.object({ izquierda: coleccion, derecha: coleccion }),
  enunciadoLeer: z.string().trim().min(1),
  audioLeer: rutaAudio.optional(),
  audioRelaciones: z.object({ mayor: rutaAudio.optional(), menor: rutaAudio.optional(), igual: rutaAudio.optional() }).optional(),
  efectos: z.object({ cambiar: rutaAudio.optional(), limite: rutaAudio.optional(), elegir: rutaAudio.optional(), boton: rutaAudio.optional(), reiniciar: rutaAudio.optional(), retos: rutaAudio.optional(), acierto: rutaAudio.optional(), error: rutaAudio.optional(), avanzar: rutaAudio.optional(), fin: rutaAudio.optional() }).optional(),
  escena: esquemaEscenaJuego.optional(),
  rondas: z.array(reto).min(4).max(10),
}).superRefine((c, ctx) => {
  const ids = c.objetos.map((o) => o.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Objetos repetidos", path: ["objetos"] });
  const conocidos = new Set(ids);
  for (const [i, r] of c.rondas.entries()) for (const lado of ["izquierda", "derecha"] as const) if (!conocidos.has(r[lado].objeto)) ctx.addIssue({ code: "custom", message: "Objeto inexistente", path: ["rondas", i, lado, "objeto"] });
  for (const lado of ["izquierda", "derecha"] as const) if (!conocidos.has(c.inicial[lado].objeto)) ctx.addIssue({ code: "custom", message: "Objeto inicial inexistente", path: ["inicial", lado, "objeto"] });
  const rondas = c.rondas.map((r) => r.id);
  if (new Set(rondas).size !== rondas.length) ctx.addIssue({ code: "custom", message: "Ids repetidos", path: ["rondas"] });
});
export type ContenidoComparar = z.infer<typeof esquemaContenidoComparar>;
export const respuestaComparar = z.union([z.enum(RELACIONES), cantidad]);
export type RespuestaComparar = z.infer<typeof respuestaComparar>;

export function relacionDe(a: number, b: number): Relacion { return a > b ? "mayor" : a < b ? "menor" : "igual"; }
export function frase(a: number, b: number): string { return `${a} es ${relacionDe(a, b)} que ${b}`.replace("es igual que", "es igual a"); }
export function describirColeccion(n: number, singular: string, plural: string): string {
  const marcos = n >= 20 ? "dos marcos llenos" : n >= 10 ? `un marco lleno${n > 10 ? ` y ${n - 10} más` : ""}` : `${n} de 10 casillas en el primer marco`;
  return `${n} ${n === 1 ? singular : plural}: ${marcos}`;
}
export function esCorrecta(r: RetoComparar, respuesta: RespuestaComparar): boolean {
  return r.clase === "leer" ? respuesta === r.correcta : typeof respuesta === "number" && relacionDe(respuesta, r.izquierda.cantidad) === r.correcta;
}
export function solucion(r: RetoComparar): string {
  if (r.clase === "leer") return frase(r.izquierda.cantidad, r.derecha.cantidad);
  const validos = Array.from({ length: 21 }, (_, n) => n).filter((n) => relacionDe(n, r.izquierda.cantidad) === r.correcta);
  return validos.length === 1 ? `${validos[0]}: ${frase(validos[0], r.izquierda.cantidad)}` : `${validos[0]} a ${validos.at(-1)}: cualquiera de esas cantidades es ${r.correcta} que ${r.izquierda.cantidad}`;
}
export const tallerComparar = definirTipo({
  tipo: "taller-comparar", nombre: "Taller de comparación", versionEsquema: 1,
  esquemaContenido: esquemaContenidoComparar, esquemaRespuesta: respuestaComparar,
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, respuesta) { const r = c.rondas.find((x) => x.id === itemId); if (!r) throw new Error(`Reto desconocido: ${itemId}`); const correcta = esCorrecta(r, respuesta); return { correcta, puntaje: correcta ? 1 : 0 }; },
  repaso(c, itemId) { const r = c.rondas.find((x) => x.id === itemId); if (!r) throw new Error(`Reto desconocido: ${itemId}`); return { pregunta: r.enunciado ?? c.enunciadoLeer, solucion: solucion(r) }; },
});
