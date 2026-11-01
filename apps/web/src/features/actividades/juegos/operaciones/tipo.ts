/**
 * Tipo «operaciones» — juego 12 de Matemáticas de 5.° (operaciones
 * combinadas). Idea del referente público de Mundo Primaria (mat-num-5-12:
 * resolver paso a paso con flechas); en MIDUHO se toca la operación que va
 * primero y se escribe su resultado, hasta llegar al final.
 *
 * Cada expresión vale 2: un punto si eligió bien el orden en todos los
 * pasos al primer toque y otro si calculó bien todos los pasos al primer
 * intento. La respuesta guarda, por paso, el primer toque y el primer valor.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";
import { escribirExpresion, leerExpresion, pasos } from "./expresion";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

const expresion = z
  .object({ id, expresion: z.string().trim().min(5).max(60) })
  .superRefine((e, ctx) => {
    try {
      const r = pasos(e.expresion);
      if (r.pasos.length < 2 || r.pasos.length > 5) ctx.addIssue({ code: "custom", message: "entre 2 y 5 pasos" });
      if (r.pasos.some((p) => !Number.isInteger(p.valor) || p.valor < 0)) ctx.addIssue({ code: "custom", message: "cada paso debe dar un entero no negativo" });
      if (!Number.isInteger(r.final)) ctx.addIssue({ code: "custom", message: "la expresión no termina en un número" });
    } catch (err) {
      ctx.addIssue({ code: "custom", message: (err as Error).message });
    }
  });

export type ExpresionCombinada = z.infer<typeof expresion>;
export type ContenidoOperaciones = { expresiones: ExpresionCombinada[] };

export const respuestaOperaciones = z.object({
  pasos: z.array(z.object({ toque: z.number().int().nullable(), valor: z.number().int().nullable() })),
});
export type RespuestaOperaciones = z.infer<typeof respuestaOperaciones>;

function expresionDe(c: ContenidoOperaciones, itemId: string) {
  const e = c.expresiones.find((x) => x.id === itemId);
  if (!e) throw new Error(`Expresión desconocida: ${itemId}`);
  return e;
}

export const operaciones = definirTipo({
  tipo: "operaciones",
  nombre: "Operaciones combinadas",
  versionEsquema: 1,
  esquemaContenido: z.object({ expresiones: z.array(expresion).min(3).max(8) }),
  esquemaRespuesta: respuestaOperaciones,
  items: (c) => c.expresiones.map((e) => ({ itemId: e.id, puntajeMaximo: 2 })),
  calificar(c, itemId, r) {
    const { pasos: lista } = pasos(expresionDe(c, itemId).expresion);
    const orden = lista.every((p, i) => r.pasos[i]?.toque === p.k);
    const calculo = lista.every((p, i) => r.pasos[i]?.valor === p.valor);
    return { correcta: orden && calculo, puntaje: Number(orden) + Number(calculo) };
  },
  repaso(c, itemId) {
    const e = expresionDe(c, itemId);
    const { pasos: lista, final } = pasos(e.expresion);
    return {
      pregunta: escribirExpresion(leerExpresion(e.expresion)),
      solucion: `${lista.map((p) => `${p.a} ${p.op} ${p.b} = ${p.valor}`).join("; ")}. Resultado: ${final}.`,
    };
  },
});
