/**
 * Tipo «ruta-palabras» — La ruta de las palabras. Armi recorre un camino de
 * tres carriles; suben tres carteles con una palabra y una voz dice una de
 * ellas: se elige el carril del cartel que la tiene escrita.
 *
 * Cada ronda vale 2 si el primer cartel elegido es el correcto, 1 si lo es el
 * segundo y 0 si no. La respuesta guarda las claves elegidas (máximo 2).
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";
import { rondasDe, type ConfigRuta, type RondaRuta } from "./generador";

const esquemaContenido = z.object({
  semilla: z.number().int().min(1),
  rondas: z.number().int().min(5).max(20),
  silabas: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal("mixtas")]),
  ritmo: z.enum(["tranquilo", "carrera"]),
});

export type ContenidoRuta = ConfigRuta;

export const respuestaRuta = z.array(z.string().max(20)).max(2);
export type RespuestaRuta = z.infer<typeof respuestaRuta>;

function rondaDe(c: ContenidoRuta, itemId: string): RondaRuta {
  const ronda = rondasDe(c).find((r) => r.id === itemId);
  if (!ronda) throw new Error(`Ronda desconocida: ${itemId}`);
  return ronda;
}

export function puntajeRonda(correcta: string, elegidas: readonly string[]) {
  if (elegidas[0] === correcta) return 2;
  if (elegidas[1] === correcta) return 1;
  return 0;
}

export const rutaPalabras = definirTipo({
  tipo: "ruta-palabras",
  nombre: "La ruta de las palabras",
  versionEsquema: 1,
  esquemaContenido: esquemaContenido as z.ZodType<ContenidoRuta>,
  esquemaRespuesta: respuestaRuta,
  items: (c) => rondasDe(c).map((r) => ({ itemId: r.id, puntajeMaximo: 2 })),
  calificar(c, itemId, elegidas) {
    const puntaje = puntajeRonda(rondaDe(c, itemId).palabra.clave, elegidas);
    return { correcta: puntaje === 2, puntaje };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    return {
      pregunta: "Elige el cartel con la palabra que dice la voz.",
      solucion: `La palabra era «${r.palabra.texto}» (${r.palabra.silabas} sílabas).`,
    };
  },
});
