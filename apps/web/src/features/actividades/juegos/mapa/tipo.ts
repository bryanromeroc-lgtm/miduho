/**
 * Tipo «mapa» — Ubica en el mapa. El juego nombra un departamento de Colombia
 * y el estudiante lo toca en el mapa.
 *
 * Cada ronda vale 2 si el primer toque es el correcto, 1 si lo es el segundo
 * y 0 si no. La respuesta guarda los departamentos tocados (máximo 2), en orden.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";
import { departamento, descripcion, disponibles, rondasDe, type ConfigMapa, type RondaMapa } from "./generador";

const region = z.enum(["caribe", "andina", "pacifica", "orinoquia", "amazonia", "insular"]);

const esquemaContenido = z
  .object({
    mapa: z.literal("colombia-departamentos"),
    semilla: z.number().int().min(1),
    rondas: z.number().int().min(3).max(33),
    regiones: z
      .array(region)
      .min(1)
      .max(6)
      .refine((r) => new Set(r).size === r.length, "regiones sin repetir"),
    fronteras: z.boolean(),
  })
  .refine((c) => c.rondas <= disponibles(c.regiones).length, {
    message: "hay más rondas que departamentos en las regiones elegidas",
    path: ["rondas"],
  });

export type ContenidoMapa = ConfigMapa;

export const respuestaMapa = z.array(z.string().regex(/^CO-[A-Z]{2,3}$/)).max(2);
export type RespuestaMapa = z.infer<typeof respuestaMapa>;

function rondaDe(c: ContenidoMapa, itemId: string): RondaMapa {
  const ronda = rondasDe(c).find((r) => r.id === itemId);
  if (!ronda) throw new Error(`Ronda desconocida: ${itemId}`);
  return ronda;
}

export function puntajeRonda(objetivo: string, toques: readonly string[]) {
  if (toques[0] === objetivo) return 2;
  if (toques[1] === objetivo) return 1;
  return 0;
}

export const mapa = definirTipo({
  tipo: "mapa",
  nombre: "Ubica en el mapa",
  versionEsquema: 1,
  esquemaContenido: esquemaContenido as unknown as z.ZodType<ContenidoMapa>,
  esquemaRespuesta: respuestaMapa,
  items: (c) => rondasDe(c).map((r) => ({ itemId: r.id, puntajeMaximo: 2 })),
  calificar(c, itemId, toques) {
    const puntaje = puntajeRonda(rondaDe(c, itemId).departamento, toques);
    return { correcta: puntaje === 2, puntaje };
  },
  repaso(c, itemId) {
    const { departamento: id } = rondaDe(c, itemId);
    return { pregunta: `¿Dónde está ${departamento(id).nombre}?`, solucion: descripcion(id) };
  },
});
