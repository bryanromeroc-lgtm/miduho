/**
 * Tipo «division» — juego 5 de Matemáticas de 5.° (división con divisor de
 * tres cifras). Idea de mecánica del referente público de Mundo Primaria
 * (mat-num-5-5: escribir cociente y residuo en la galera); escena,
 * situaciones y números propios de MIDUHO.
 *
 * Cada división vale 2: cociente y residuo, al primer intento. El cociente
 * y el residuo se calculan aquí, nunca se escriben a mano en el contenido.
 */
import { z } from "zod";
import { formatearNumero } from "@/lib/numeros";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

const division = z
  .object({
    id,
    dividendo: z.number().int().min(100).max(99_999),
    divisor: z.number().int().min(100).max(999),
    /** Situación en una o dos frases; la pregunta la pone el juego. */
    contexto: z.string().trim().min(10).max(200).optional(),
  })
  .refine((d) => d.dividendo >= d.divisor, { message: "el dividendo debe ser mayor o igual que el divisor" });

export type Division = z.infer<typeof division>;
export type ContenidoDivision = { divisiones: Division[] };

export const respuestaDivision = z.object({ cociente: z.number().int().min(0).nullable(), residuo: z.number().int().min(0).nullable() });
export type RespuestaDivision = z.infer<typeof respuestaDivision>;

export function resolver(d: Division) {
  return { cociente: Math.floor(d.dividendo / d.divisor), residuo: d.dividendo % d.divisor };
}

function divisionDe(c: ContenidoDivision, itemId: string) {
  const d = c.divisiones.find((x) => x.id === itemId);
  if (!d) throw new Error(`División desconocida: ${itemId}`);
  return d;
}

export const divisionTipo = definirTipo({
  tipo: "division",
  nombre: "División",
  versionEsquema: 1,
  esquemaContenido: z.object({ divisiones: z.array(division).min(3).max(10) }),
  esquemaRespuesta: respuestaDivision,
  items: (c) => c.divisiones.map((d) => ({ itemId: d.id, puntajeMaximo: 2 })),
  calificar(c, itemId, r) {
    const { cociente, residuo } = resolver(divisionDe(c, itemId));
    const bienC = r.cociente === cociente;
    const bienR = r.residuo === residuo;
    return { correcta: bienC && bienR, puntaje: Number(bienC) + Number(bienR) };
  },
  repaso(c, itemId) {
    const d = divisionDe(c, itemId);
    const { cociente, residuo } = resolver(d);
    return {
      pregunta: `${formatearNumero(d.dividendo)} ÷ ${d.divisor}`,
      solucion: `Cociente ${formatearNumero(cociente)} y residuo ${residuo}: ${d.divisor} × ${formatearNumero(cociente)} + ${residuo} = ${formatearNumero(d.dividendo)}.`,
    };
  },
});
