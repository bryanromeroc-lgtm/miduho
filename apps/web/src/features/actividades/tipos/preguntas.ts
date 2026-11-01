/**
 * Tipos de pregunta y respuesta (D4): selección múltiple (verdadero o falso
 * es el caso de dos opciones), concurso con tiempo y completar la frase.
 */
import { z } from "zod";
import { definirTipo } from "./contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = z.string().trim().min(1);

const pregunta = z
  .object({
    id,
    enunciado: texto,
    opciones: z.array(texto).min(2).max(4),
    correcta: z.number().int().min(0),
    /** Se muestra después de responder: por qué esa es la respuesta. */
    explicacion: texto.optional(),
  })
  .refine((p) => p.correcta < p.opciones.length, { message: "«correcta» apunta a una opción que no existe" })
  .refine((p) => new Set(p.opciones).size === p.opciones.length, { message: "opciones repetidas" });

export type Pregunta = z.infer<typeof pregunta>;

const preguntas = z.array(pregunta).min(3).max(12);

function porPregunta<C extends { preguntas: Pregunta[] }>(c: C, itemId: string) {
  const p = c.preguntas.find((x) => x.id === itemId);
  if (!p) throw new Error(`Pregunta desconocida: ${itemId}`);
  return p;
}

const tipoPreguntas = {
  versionEsquema: 1,
  esquemaRespuesta: z.number().int().min(0),
  items: (c: { preguntas: Pregunta[] }) => c.preguntas.map((p) => ({ itemId: p.id, puntajeMaximo: 1 })),
  calificar(c: { preguntas: Pregunta[] }, itemId: string, r: number) {
    const correcta = porPregunta(c, itemId).correcta === r;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c: { preguntas: Pregunta[] }, itemId: string) {
    const p = porPregunta(c, itemId);
    return { pregunta: p.enunciado, solucion: p.opciones[p.correcta] };
  },
};

export const seleccionMultiple = definirTipo({
  tipo: "seleccion-multiple",
  nombre: "Quiz",
  esquemaContenido: z.object({ preguntas }),
  ...tipoPreguntas,
});

/*
  Concurso: las mismas preguntas con un reloj por pregunta. El reloj solo
  anima; al llegar a cero no corta la respuesta (WCAG 2.2.1) ni cambia la
  nota. Sin puntos ni comparaciones entre estudiantes (PRODUCT.md).
*/
export const concurso = definirTipo({
  tipo: "concurso",
  nombre: "Concurso",
  esquemaContenido: z.object({ segundos: z.number().int().min(10).max(60), preguntas }),
  ...tipoPreguntas,
});

const frase = z
  .object({
    id,
    antes: z.string(),
    despues: z.string(),
    opciones: z.array(texto).min(2).max(4),
    correcta: texto,
    explicacion: texto.optional(),
  })
  .refine((f) => f.opciones.includes(f.correcta), { message: "«correcta» no está entre las opciones" })
  .refine((f) => new Set(f.opciones).size === f.opciones.length, { message: "opciones repetidas" })
  .refine((f) => f.antes.trim() || f.despues.trim(), { message: "la frase no tiene texto alrededor del hueco" });

export type Frase = z.infer<typeof frase>;

function porFrase(c: { frases: Frase[] }, itemId: string) {
  const f = c.frases.find((x) => x.id === itemId);
  if (!f) throw new Error(`Frase desconocida: ${itemId}`);
  return f;
}

/*
  Completar: cada frase tiene un hueco y un banco de palabras. Se compara la
  opción exacta, con tildes: hay actividades de ortografía donde la tilde es
  justamente lo que se evalúa.
*/
export const completar = definirTipo({
  tipo: "completar",
  nombre: "Completar",
  versionEsquema: 1,
  esquemaContenido: z.object({ frases: z.array(frase).min(3).max(12) }),
  esquemaRespuesta: z.string(),
  items: (c) => c.frases.map((f) => ({ itemId: f.id, puntajeMaximo: 1 })),
  calificar(c, itemId, r) {
    const correcta = porFrase(c, itemId).correcta === r.trim();
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const f = porFrase(c, itemId);
    return { pregunta: `${f.antes} ___ ${f.despues}`.replace(/\s+/g, " ").trim(), solucion: f.correcta };
  },
});
