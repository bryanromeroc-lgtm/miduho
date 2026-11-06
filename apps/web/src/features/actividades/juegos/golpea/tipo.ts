/**
 * Tipo «golpea» — Golpea el resultado. Topos robot asoman de una cuadrícula
 * con un número; se golpea el que tiene el resultado de la suma o resta.
 *
 * Cada ronda vale 2 si el primer golpe es el correcto, 1 si lo es el segundo
 * y 0 si no. La respuesta guarda los valores golpeados (máximo 2), en orden.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";
import { rondasDe, signo, textoOperacion, type ConfigGolpea, type RondaGolpea } from "./generador";

const esquemaContenido = z.object({
  semilla: z.number().int().min(1),
  rondas: z.number().int().min(5).max(30),
  rango: z.union([z.literal(10), z.literal(20), z.literal(100)]),
  operaciones: z
    .array(z.enum(["suma", "resta"]))
    .min(1)
    .max(2)
    .refine((ops) => new Set(ops).size === ops.length, "operaciones sin repetir"),
  llevadas: z.boolean(),
});

export type ContenidoGolpea = ConfigGolpea;

export const respuestaGolpea = z.array(z.number().int()).max(2);
export type RespuestaGolpea = z.infer<typeof respuestaGolpea>;

function rondaDe(c: ContenidoGolpea, itemId: string): RondaGolpea {
  const ronda = rondasDe(c).find((r) => r.id === itemId);
  if (!ronda) throw new Error(`Ronda desconocida: ${itemId}`);
  return ronda;
}

export function puntajeRonda(resultado: number, golpes: readonly number[]) {
  if (golpes[0] === resultado) return 2;
  if (golpes[1] === resultado) return 1;
  return 0;
}

export const golpea = definirTipo({
  tipo: "golpea",
  nombre: "Golpea el resultado",
  versionEsquema: 1,
  esquemaContenido: esquemaContenido as z.ZodType<ContenidoGolpea>,
  esquemaRespuesta: respuestaGolpea,
  items: (c) => rondasDe(c).map((r) => ({ itemId: r.id, puntajeMaximo: 2 })),
  calificar(c, itemId, golpes) {
    const puntaje = puntajeRonda(rondaDe(c, itemId).resultado, golpes);
    return { correcta: puntaje === 2, puntaje };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    const pista = !r.conLlevada
      ? ""
      : r.operacion === "suma"
        ? " Las unidades pasan de 10: se lleva una decena."
        : " No alcanzan las unidades: se desagrupa una decena.";
    return { pregunta: `${textoOperacion(r)} = ?`, solucion: `${r.a} ${signo(r.operacion)} ${r.b} = ${r.resultado}.${pista}` };
  },
});
