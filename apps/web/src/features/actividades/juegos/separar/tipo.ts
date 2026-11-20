import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";
import { rutaAudio } from "../../tipos/audio";
import { esquemaEscenaJuego } from "../comun/escena";
import { esquemaEfectosQuiz } from "../../tipos/preguntas";

const rutaImagen = z.string().regex(/^\/images\/[\w\-/]+\.webp$/);
const texto = z.string().trim().min(1);
const elemento = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  texto,
  silabas: z.array(texto).min(1).max(6),
  imagen: rutaImagen,
  alt: texto,
  explicacion: texto.optional(),
  audio: rutaAudio.optional(),
  audioSilabas: rutaAudio.optional(),
}).superRefine((e, ctx) => {
  if (e.silabas.join("") !== e.texto) ctx.addIssue({ code: "custom", path: ["silabas"], message: "Las sílabas deben formar el texto exacto" });
  const permitidos = new Set(huecosPermitidos(e.texto));
  for (const corte of cortesCorrectos(e.silabas)) {
    if (!permitidos.has(corte)) ctx.addIssue({ code: "custom", path: ["silabas"], message: "Un dígrafo ch, ll o rr no se puede partir" });
  }
});
export type ElementoSeparar = z.infer<typeof elemento>;
export const esquemaContenidoSeparar = z.object({
  elementos: z.array(elemento).min(1).max(30),
  escena: esquemaEscenaJuego.optional(),
  efectos: esquemaEfectosQuiz.optional(),
});
export type ContenidoSeparar = z.infer<typeof esquemaContenidoSeparar>;

/** Índices entre letras, contados desde 1. Nunca expone el interior de ch, ll o rr. */
export function huecosPermitidos(palabra: string): number[] {
  const letras = Array.from(palabra);
  return Array.from({ length: Math.max(0, letras.length - 1) }, (_, i) => i + 1)
    .filter((i) => !["ch", "ll", "rr"].includes((letras[i - 1] + letras[i]).toLowerCase()));
}
export function cortesCorrectos(silabas: readonly string[]): number[] {
  let acumulado = 0;
  return silabas.slice(0, -1).map((s) => (acumulado += Array.from(s).length));
}
export function evaluarCortes(silabas: readonly string[], respuesta: readonly number[]): boolean {
  const esperados = cortesCorrectos(silabas);
  return respuesta.length === esperados.length && new Set(respuesta).size === respuesta.length &&
    respuesta.every((c) => esperados.includes(c));
}
function buscar(contenido: ContenidoSeparar, id: string): ElementoSeparar {
  const encontrado = contenido.elementos.find((e) => e.id === id);
  if (!encontrado) throw new Error(`Elemento desconocido: ${id}`);
  return encontrado;
}
export const separar = definirTipo({
  tipo: "separar",
  nombre: "Separar sílabas",
  versionEsquema: 1,
  esquemaContenido: esquemaContenidoSeparar,
  esquemaRespuesta: z.array(z.number().int().min(1)),
  items: (c) => c.elementos.map((e) => ({ itemId: e.id, puntajeMaximo: 1 })),
  validarRespuesta: (c, respuesta) => c.elementos.some((e) => respuesta.every((i) => huecosPermitidos(e.texto).includes(i))),
  calificar(c, id, respuesta) {
    const e = buscar(c, id);
    const correcta = respuesta.every((i) => huecosPermitidos(e.texto).includes(i)) && evaluarCortes(e.silabas, respuesta);
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, id) {
    const e = buscar(c, id);
    return { pregunta: e.texto, solucion: e.silabas.join(" - ") };
  },
});
