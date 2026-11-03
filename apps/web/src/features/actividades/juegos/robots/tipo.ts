import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const esquema = z.object({ semilla: z.number().int().min(1), rondas: z.number().int().min(5).max(100) });
export type ContenidoRobots = z.infer<typeof esquema>;

export type RetoRobot = { id: string; dividendo: number; cociente: number; divisor: number; opciones: number[] };

/** Secuencia reproducible: la respuesta y los distractores nacen de operaciones exactas. */
export function retosDe({ semilla, rondas }: ContenidoRobots): RetoRobot[] {
  let estado = semilla >>> 0;
  const azar = (maximo: number) => {
    estado = (Math.imul(1664525, estado) + 1013904223) >>> 0;
    return estado % maximo;
  };
  return Array.from({ length: rondas }, (_, indice) => {
    const divisor = 2 + azar(11);
    const cociente = 2 + azar(11);
    const opciones = new Set<number>([divisor]);
    for (let paso = 1; opciones.size < 4; paso++) {
      const candidato = divisor + (paso % 2 ? paso : -paso);
      if (candidato >= 2 && candidato <= 15) opciones.add(candidato);
    }
    const mezcladas = [...opciones];
    for (let i = mezcladas.length - 1; i > 0; i--) {
      const j = azar(i + 1);
      [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
    }
    return { id: `r${indice + 1}`, dividendo: divisor * cociente, cociente, divisor, opciones: mezcladas };
  });
}

export const robotsDivisiones = definirTipo({
  tipo: "robots-divisiones",
  nombre: "Divisiones rápidas",
  versionEsquema: 1,
  esquemaContenido: esquema,
  esquemaRespuesta: z.number().int().min(2).max(15).nullable(),
  items: (contenido) => retosDe(contenido).map(({ id }) => ({ itemId: id, puntajeMaximo: 1 })),
  calificar(contenido, itemId, respuesta) {
    const reto = retosDe(contenido).find((item) => item.id === itemId);
    if (!reto) throw new Error(`Reto desconocido: ${itemId}`);
    return { correcta: respuesta === reto.divisor, puntaje: Number(respuesta === reto.divisor) };
  },
  repaso(contenido, itemId) {
    const reto = retosDe(contenido).find((item) => item.id === itemId);
    if (!reto) throw new Error(`Reto desconocido: ${itemId}`);
    return { pregunta: `${reto.dividendo} ÷ ? = ${reto.cociente}`, solucion: `${reto.dividendo} ÷ ${reto.divisor} = ${reto.cociente}, porque ${reto.divisor} × ${reto.cociente} = ${reto.dividendo}.` };
  },
});
