/**
 * Tipo «bocadillo» — juego 7 de Matemáticas de 5.° (reducción a común
 * denominador). Idea del referente público de Mundo Primaria (mat-num-5-7:
 * elegir las fracciones equivalentes con denominador común); en MIDUHO se
 * manipula: se elige en cuántas partes cortar las dos barras y luego se
 * pinta en cada barra recortada lo mismo que en la original.
 *
 * Cada ronda vale 3: el denominador común y los dos numeradores nuevos,
 * al primer intento.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const fraccion = z.tuple([z.number().int().min(1), z.number().int().min(2).max(12)]).refine(([n, d]) => n < d, { message: "fracción propia" });

export const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b));
export const mcm = (a: number, b: number): number => (a / mcd(a, b)) * b;

const ronda = z
  .object({
    id,
    a: fraccion,
    b: fraccion,
    /** Números entre los que se elige el corte; exactamente uno es múltiplo de los dos denominadores. */
    cortes: z.array(z.number().int().min(2).max(24)).min(2).max(4),
  })
  .refine((r) => r.a[1] !== r.b[1], { message: "los denominadores deben ser distintos" })
  .refine((r) => r.cortes.filter((c) => c % r.a[1] === 0 && c % r.b[1] === 0).length === 1, {
    message: "exactamente un corte debe ser múltiplo común de los dos denominadores",
  })
  .refine((r) => new Set(r.cortes).size === r.cortes.length, { message: "cortes repetidos" });

export type RondaBocadillo = z.infer<typeof ronda>;
export type ContenidoBocadillo = { rondas: RondaBocadillo[] };

export const respuestaBocadillo = z.object({
  corte: z.number().int().nullable(),
  a: z.number().int().min(0).nullable(),
  b: z.number().int().min(0).nullable(),
});
export type RespuestaBocadillo = z.infer<typeof respuestaBocadillo>;

/** El corte común de la ronda y los numeradores equivalentes. */
export function solucion(r: RondaBocadillo) {
  const corte = r.cortes.find((c) => c % r.a[1] === 0 && c % r.b[1] === 0)!;
  return { corte, a: (r.a[0] * corte) / r.a[1], b: (r.b[0] * corte) / r.b[1] };
}

function rondaDe(c: ContenidoBocadillo, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

export const bocadillo = definirTipo({
  tipo: "bocadillo",
  nombre: "Fracciones",
  versionEsquema: 1,
  esquemaContenido: z.object({ rondas: z.array(ronda).min(3).max(8) }),
  esquemaRespuesta: respuestaBocadillo,
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 3 })),
  calificar(c, itemId, resp) {
    const s = solucion(rondaDe(c, itemId));
    const puntos = Number(resp.corte === s.corte) + Number(resp.a === s.a) + Number(resp.b === s.b);
    return { correcta: puntos === 3, puntaje: puntos };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    const s = solucion(r);
    return {
      pregunta: `Común denominador de ${r.a[0]}/${r.a[1]} y ${r.b[0]}/${r.b[1]}`,
      solucion: `${r.a[0]}/${r.a[1]} = ${s.a}/${s.corte} y ${r.b[0]}/${r.b[1]} = ${s.b}/${s.corte}`,
    };
  },
});
