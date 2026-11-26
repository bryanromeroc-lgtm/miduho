/**
 * Tipos de pregunta y respuesta (D4): selección múltiple (verdadero o falso
 * es el caso de dos opciones), concurso con tiempo y completar la frase.
 */
import { z } from "zod";
import { rutaAudio } from "./audio";
import { definirTipo } from "./contrato";
import { esquemaEscenaJuego } from "../juegos/comun/escena";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = z.string().trim().min(1);
const rutaImagen = z.string().regex(/^\/images\/[\w\-/]+\.webp$/, "ruta /images/….webp");
export const esquemaEfectosQuiz = z.object({
  acierto: rutaAudio.optional(),
  fallo: rutaAudio.optional(),
  finRonda: rutaAudio.optional(),
  fin: rutaAudio.optional(),
});

export const esquemaPregunta = z
  .object({
    id,
    enunciado: texto,
    opciones: z.array(texto).min(2).max(4),
    correcta: z.number().int().min(0),
    /** Se muestra después de responder: por qué esa es la respuesta. */
    explicacion: texto.optional(),
    /** Enunciado grabado (opcional). */
    audio: rutaAudio.optional(),
    /** Una grabación por opción, en el mismo orden; `null` si esa opción no tiene. */
    audioOpciones: z.array(rutaAudio.nullable()).optional(),
    hablante: id.optional(),
    alResponder: z.object({ efecto: rutaAudio, veces: z.number().int().min(1).max(4).optional(), animar: z.literal("acompanante").optional() }).optional(),
    imagen: rutaImagen.optional(),
    alt: texto.optional(),
    imagenesOpciones: z.array(rutaImagen.nullable()).optional(),
  })
  .refine((p) => p.correcta < p.opciones.length, { message: "«correcta» apunta a una opción que no existe" })
  .refine((p) => new Set(p.opciones).size === p.opciones.length, { message: "opciones repetidas" })
  .refine((p) => !p.audioOpciones || p.audioOpciones.length === p.opciones.length, { message: "audioOpciones debe tener una entrada por opción" })
  .refine((p) => !p.imagen || !!p.alt, { message: "alt es obligatorio si hay imagen" })
  .refine((p) => !p.imagenesOpciones || p.imagenesOpciones.length === p.opciones.length, { message: "imagenesOpciones debe tener una entrada por opción" });

export type Pregunta = z.infer<typeof esquemaPregunta>;

const preguntas = z.array(esquemaPregunta).min(3).max(12);

function porPregunta<C extends { preguntas: Pregunta[] }>(c: C, itemId: string) {
  const p = c.preguntas.find((x) => x.id === itemId);
  if (!p) throw new Error(`Pregunta desconocida: ${itemId}`);
  return p;
}

export const reglasPreguntas = {
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

const esquemaDialogo = z.object({ hablantes: z.array(z.object({ id, nombre: texto, imagen: rutaImagen, alt: texto, lado: z.enum(["izquierda", "derecha"]), acompanante: z.object({ imagen: rutaImagen, alt: texto }).optional() })).length(2).refine((h) => h[0].id !== h[1].id && h[0].lado !== h[1].lado, { message: "Los hablantes deben tener ids y lados distintos" }) });
export type Dialogo = z.infer<typeof esquemaDialogo>;

export const seleccionMultiple = definirTipo({
  tipo: "seleccion-multiple",
  nombre: "Quiz",
  esquemaContenido: z.object({ preguntas, escena: esquemaEscenaJuego.optional(), efectos: esquemaEfectosQuiz.optional(), barajarOpciones: z.boolean().optional(), barajarPreguntas: z.boolean().optional(), presentacion: z.literal("dialogo").optional(), dialogo: esquemaDialogo.optional(), musica: rutaAudio.optional(), audioTitulo: rutaAudio.optional(), tituloAudioTexto: texto.optional(), efectoToque: rutaAudio.optional(), efectoJugar: rutaAudio.optional() }).superRefine((c, ctx) => {
    if (!c.presentacion && !c.dialogo) return;
    if (c.presentacion !== "dialogo" || !c.dialogo) { ctx.addIssue({ code: "custom", message: "La presentación y el bloque dialogo deben aparecer juntos" }); return; }
    const ids = new Set(c.dialogo.hablantes.map((h) => h.id));
    c.preguntas.forEach((p, i) => {
      if (!p.hablante || !ids.has(p.hablante)) ctx.addIssue({ code: "custom", path: ["preguntas", i, "hablante"], message: "El hablante debe existir en dialogo.hablantes" });
      if (!p.audio || !p.audioOpciones?.every(Boolean)) ctx.addIssue({ code: "custom", path: ["preguntas", i], message: "El diálogo exige audio y audioOpciones para cada frase" });
    });
  }),
  ...reglasPreguntas,
});

/*
  Concurso: las mismas preguntas con un reloj por pregunta. El reloj solo
  anima; al llegar a cero no corta la respuesta (WCAG 2.2.1) ni cambia la
  nota. Sin puntos ni comparaciones entre estudiantes (PRODUCT.md).
*/
export const concurso = definirTipo({
  tipo: "concurso",
  nombre: "Concurso",
  esquemaContenido: z.object({ segundos: z.number().int().min(10).max(60), preguntas, escena: esquemaEscenaJuego.optional(), efectos: esquemaEfectosQuiz.optional(), barajarOpciones: z.boolean().optional() }),
  ...reglasPreguntas,
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
