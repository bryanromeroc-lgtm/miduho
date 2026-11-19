/**
 * Tipo «pancarta» — juego 1 de Matemáticas de 5.° (números de más de 7 cifras).
 * Idea de mecánica tomada del referente público de Mundo Primaria
 * (mat-num-5-1: leer el número escrito en una pancarta); escena, redacción
 * y rondas son propias de MIDUHO.
 *
 * Tres modos de ronda:
 * - `letras`: la pancarta dice el número en palabras; se elige su escritura en cifras.
 * - `cifras`: la pancarta trae las cifras; se elige cómo se lee.
 * - `posicion`: la pancarta trae las cifras; se toca la que ocupa la posición pedida.
 *
 * La respuesta siempre es un entero: el número elegido (letras, cifras) o la
 * posición tocada, contada desde la derecha (0 = unidades). Cuenta la primera
 * respuesta; el reintento después de la pista no cambia la nota.
 */
import { z } from "zod";
import { formatearNumero, numeroEnLetras, POSICIONES, cantidadCifras, cifraEn, valorPosicional } from "@/lib/numeros";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const numero = z.number().int().min(1000).max(999_999_999);

const conOpciones = z.object({
  id,
  numero,
  /** Números con los que se confunde (cero de más o de menos, periodo corrido…). */
  distractores: z.array(numero).min(1).max(3),
});

const ronda = z.discriminatedUnion("modo", [
  conOpciones.extend({ modo: z.literal("letras") }),
  conOpciones.extend({ modo: z.literal("cifras") }),
  z.object({
    id,
    modo: z.literal("posicion"),
    numero,
    /** 0 = unidades … 8 = centenas de millón. */
    posicion: z.number().int().min(0).max(8),
  }),
]);

export type RondaPancarta = z.infer<typeof ronda>;
export type ContenidoPancarta = { rondas: RondaPancarta[] };

const contenido = z
  .object({ rondas: z.array(ronda).min(4).max(12) })
  .superRefine((c, ctx) => {
    c.rondas.forEach((r, i) => {
      if (r.modo === "posicion") {
        if (r.posicion >= cantidadCifras(r.numero)) {
          ctx.addIssue({ code: "custom", path: ["rondas", i, "posicion"], message: "la posición no existe en el número" });
        }
        return;
      }
      if (r.distractores.includes(r.numero) || new Set(r.distractores).size !== r.distractores.length) {
        ctx.addIssue({ code: "custom", path: ["rondas", i, "distractores"], message: "distractores repetidos o iguales al número" });
      }
    });
  });

function rondaDe(c: ContenidoPancarta, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

/** Lo que la ronda espera como respuesta correcta. */
export function respuestaCorrecta(r: RondaPancarta): number {
  return r.modo === "posicion" ? r.posicion : r.numero;
}

/** Enunciado de la ronda, dicho al estudiante (también lo lee la voz). */
export function preguntaDe(r: RondaPancarta): string {
  if (r.modo === "letras") return "¿Qué número dice la pancarta? Elige cómo se escribe en cifras.";
  if (r.modo === "cifras") return "¿Cómo se lee el número de la pancarta?";
  return `Toca la cifra que está en las ${POSICIONES[r.posicion]}.`;
}

export const pancarta = definirTipo({
  tipo: "pancarta",
  nombre: "Pancarta",
  versionEsquema: 1,
  esquemaContenido: contenido,
  esquemaRespuesta: z.number().int().min(0),
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, respuesta) {
    const correcta = respuestaCorrecta(rondaDe(c, itemId)) === respuesta;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    if (r.modo === "letras") return { pregunta: `La pancarta dice «${numeroEnLetras(r.numero)}».`, solucion: formatearNumero(r.numero) };
    if (r.modo === "cifras") return { pregunta: `La pancarta dice ${formatearNumero(r.numero)}.`, solucion: numeroEnLetras(r.numero) };
    return {
      pregunta: `¿Qué cifra de ${formatearNumero(r.numero)} está en las ${POSICIONES[r.posicion]}?`,
      solucion:
        cifraEn(r.numero, r.posicion) === 0
          ? `El 0: no hay ${POSICIONES[r.posicion]}.`
          : `El ${cifraEn(r.numero, r.posicion)}, que vale ${formatearNumero(valorPosicional(r.numero, r.posicion))}.`,
    };
  },
});
