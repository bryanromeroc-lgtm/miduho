/**
 * Tipo «angulos» — juego 14 de Matemáticas de 5.° (medida y bisectriz de un
 * ángulo). Idea del referente público de Mundo Primaria (mat-geo-5-2: medir
 * con el transportador y escribir los grados); el transportador ya está
 * puesto y se lee la escala correcta. También se busca la bisectriz.
 * Escena, figuras y ángulos propios de MIDUHO.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

const ronda = z.discriminatedUnion("modo", [
  z.object({
    id,
    modo: z.literal("medir"),
    angulo: z.number().int().min(10).max(170).multipleOf(5),
    /** Hacia dónde sale el primer lado: a la derecha se lee la escala de afuera; a la izquierda, la de adentro. */
    desde: z.enum(["derecha", "izquierda"]),
  }),
  z.object({ id, modo: z.literal("bisectriz"), angulo: z.number().int().min(40).max(160).multipleOf(10) }),
]);

export type RondaAngulos = z.infer<typeof ronda>;
export type ContenidoAngulos = { rondas: RondaAngulos[] };

/** Rayos candidatos a bisectriz (en grados desde el primer lado): uno es la mitad. */
export function candidatos(angulo: number): number[] {
  return [angulo / 2, Math.round((angulo * 0.28) / 5) * 5, Math.round((angulo * 0.74) / 5) * 5];
}

export function correcta(r: RondaAngulos): number {
  return r.modo === "medir" ? r.angulo : r.angulo / 2;
}

function rondaDe(c: ContenidoAngulos, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

export const angulos = definirTipo({
  tipo: "angulos",
  nombre: "Ángulos",
  versionEsquema: 1,
  esquemaContenido: z.object({ rondas: z.array(ronda).min(4).max(10) }),
  esquemaRespuesta: z.number(),
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, resp) {
    const ok = correcta(rondaDe(c, itemId)) === resp;
    return { correcta: ok, puntaje: ok ? 1 : 0 };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    if (r.modo === "medir") return { pregunta: `Medir el ángulo con el transportador`, solucion: `Mide ${r.angulo}°.` };
    return { pregunta: `Bisectriz de un ángulo de ${r.angulo}°`, solucion: `La que lo parte en dos ángulos de ${r.angulo / 2}°.` };
  },
});
