/**
 * Tipo «pizarra-decimales» — juego 2 de Matemáticas de 5.° (lectura y
 * escritura de números decimales). Idea de mecánica del referente público
 * de Mundo Primaria (mat-num-5-2: elegir el decimal que dice el tablero);
 * escena, redacción y rondas propias de MIDUHO.
 *
 * Modos: `letras` (la pizarra dice el decimal en palabras; se elige en
 * cifras), `cifras` (la pizarra trae las cifras; se elige cómo se lee) y
 * `posicion` (se toca la cifra de las décimas, centésimas, milésimas…).
 * Los decimales se escriben como texto con coma: «12,07».
 */
import { z } from "zod";
import { cifrasDecimal, decimalEnLetras, formatearDecimal, nombrePosicion, PATRON_DECIMAL, valorPosicionalDecimal } from "@/lib/numeros";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const decimal = z.string().regex(PATRON_DECIMAL, "decimal con coma, sin puntos y hasta tres decimales: 12,07");

const conOpciones = z.object({ id, numero: decimal, distractores: z.array(decimal).min(1).max(3) });

const ronda = z.discriminatedUnion("modo", [
  conOpciones.extend({ modo: z.literal("letras") }),
  conOpciones.extend({ modo: z.literal("cifras") }),
  z.object({ id, modo: z.literal("posicion"), numero: decimal, posicion: z.number().int().min(-3).max(8) }),
]);

export type RondaPizarra = z.infer<typeof ronda>;
export type ContenidoPizarra = { rondas: RondaPizarra[] };

const contenido = z.object({ rondas: z.array(ronda).min(4).max(12) }).superRefine((c, ctx) => {
  c.rondas.forEach((r, i) => {
    // El formato ya lo revisa `decimal`; aquí solo se comparan los bien escritos.
    const todos = r.modo === "posicion" ? [r.numero] : [r.numero, ...r.distractores];
    if (!todos.every((x) => PATRON_DECIMAL.test(x))) return;
    if (r.modo === "posicion") {
      if (!cifrasDecimal(r.numero).some((x) => x.posicion === r.posicion)) {
        ctx.addIssue({ code: "custom", path: ["rondas", i, "posicion"], message: "la posición no existe en el número" });
      }
      return;
    }
    const lecturas = [r.numero, ...r.distractores].map(decimalEnLetras);
    if (new Set(lecturas).size !== lecturas.length) {
      ctx.addIssue({ code: "custom", path: ["rondas", i, "distractores"], message: "distractores que se leen igual que otra opción" });
    }
  });
});

function rondaDe(c: ContenidoPizarra, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

export function respuestaCorrecta(r: RondaPizarra): string | number {
  return r.modo === "posicion" ? r.posicion : r.numero;
}

export function preguntaDe(r: RondaPizarra): string {
  if (r.modo === "letras") return "¿Qué número escribió Armi en la pizarra? Elige cómo se escribe en cifras.";
  if (r.modo === "cifras") return "¿Cómo se lee el número de la pizarra?";
  return `Toca la cifra que está en las ${nombrePosicion(r.posicion)}.`;
}

export const pizarraDecimales = definirTipo({
  tipo: "pizarra-decimales",
  nombre: "Pizarra",
  versionEsquema: 1,
  esquemaContenido: contenido,
  esquemaRespuesta: z.union([z.string(), z.number().int()]),
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, respuesta) {
    const correcta = respuestaCorrecta(rondaDe(c, itemId)) === respuesta;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    if (r.modo === "letras") return { pregunta: `La pizarra dice «${decimalEnLetras(r.numero)}».`, solucion: formatearDecimal(r.numero) };
    if (r.modo === "cifras") return { pregunta: `La pizarra dice ${formatearDecimal(r.numero)}.`, solucion: decimalEnLetras(r.numero) };
    const cifra = cifrasDecimal(r.numero).find((x) => x.posicion === r.posicion)!.cifra;
    return {
      pregunta: `¿Qué cifra de ${formatearDecimal(r.numero)} está en las ${nombrePosicion(r.posicion)}?`,
      solucion: cifra === "0" ? `El 0: no hay ${nombrePosicion(r.posicion)}.` : `El ${cifra}, que vale ${valorPosicionalDecimal(r.numero, r.posicion)}.`,
    };
  },
});
