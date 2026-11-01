/**
 * Tipo «corrector» — juego 3 de Matemáticas de 5.° (criterios de
 * divisibilidad). Idea de mecánica del referente público de Mundo Primaria
 * (mat-num-5-3: sustituir lo incorrecto de una oración); sin arrastrar: se
 * toca la parte equivocada de la nota y luego se elige el reemplazo.
 * Escena, redacción y notas propias de MIDUHO.
 *
 * Cada nota vale 2: un punto por encontrar el error al primer toque y otro
 * por elegir el reemplazo correcto al primer intento.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = z.string().trim().min(1);

const nota = z
  .object({
    id,
    /** La oración en partes tocables (palabras o grupos cortos), sin el punto final. */
    partes: z.array(texto).min(3).max(24),
    /** Lo que cierra la oración: «.» por defecto. */
    cierre: z.string().default("."),
    /** Índice de la parte equivocada. */
    error: z.number().int().min(0),
    /** Reemplazos posibles para la parte equivocada. */
    opciones: z.array(texto).min(2).max(4),
    correcta: z.number().int().min(0),
    /** Pista para el segundo intento del reemplazo, sin dar la respuesta. */
    pista: texto,
    /** Por qué la nota corregida es cierta; se muestra al cerrar la ronda. */
    explicacion: texto,
  })
  .refine((n) => n.error < n.partes.length, { message: "«error» apunta a una parte que no existe" })
  .refine((n) => n.correcta < n.opciones.length, { message: "«correcta» apunta a una opción que no existe" })
  .refine((n) => new Set(n.opciones).size === n.opciones.length, { message: "opciones repetidas" })
  .refine((n) => !n.opciones.includes(n.partes[n.error]), { message: "las opciones no pueden repetir la parte equivocada" });

export type NotaCorrector = z.infer<typeof nota>;
export type ContenidoCorrector = { notas: NotaCorrector[] };

export const respuestaCorrector = z.object({ error: z.number().int().min(0), cambio: z.number().int().min(0).nullable() });
export type RespuestaCorrector = z.infer<typeof respuestaCorrector>;

function notaDe(c: ContenidoCorrector, itemId: string) {
  const n = c.notas.find((x) => x.id === itemId);
  if (!n) throw new Error(`Nota desconocida: ${itemId}`);
  return n;
}

/** Une las partes en una oración, con una parte cambiada si se pide. */
export function oracion(n: NotaCorrector, cambio?: string): string {
  return n.partes.map((p, i) => (i === n.error && cambio !== undefined ? cambio : p)).join(" ") + n.cierre;
}

export const corrector = definirTipo({
  tipo: "corrector",
  nombre: "Corrector",
  versionEsquema: 1,
  esquemaContenido: z.object({ notas: z.array(nota).min(4).max(10) }),
  esquemaRespuesta: respuestaCorrector,
  items: (c) => c.notas.map((n) => ({ itemId: n.id, puntajeMaximo: 2 })),
  calificar(c, itemId, r) {
    const n = notaDe(c, itemId);
    const encontro = r.error === n.error;
    const cambio = r.cambio === n.correcta;
    return { correcta: encontro && cambio, puntaje: Number(encontro) + Number(cambio) };
  },
  repaso(c, itemId) {
    const n = notaDe(c, itemId);
    return { pregunta: `La nota decía: «${oracion(n)}»`, solucion: oracion(n, n.opciones[n.correcta]) };
  },
});
