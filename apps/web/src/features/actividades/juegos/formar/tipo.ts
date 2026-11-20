import { z } from "zod";
import { definirTipo, generador } from "../../tipos/contrato";
import { rutaAudio } from "../../tipos/audio";
import { esquemaEscenaJuego } from "../comun/escena";

const texto = z.string().trim().min(1);
const imagen = z.string().regex(/^\/images\/[\w\-/]+\.webp$/);
const elemento = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), texto,
  silabas: z.array(texto).min(2).max(6), imagen, alt: texto,
  explicacion: texto.optional(), audio: rutaAudio.optional(),
}).refine((e) => e.silabas.join("") === e.texto, { path: ["silabas"], message: "Las sílabas deben formar el texto exacto" });
const efectos = z.object({
  inicio: rutaAudio.optional(), soltar: rutaAudio.optional(), acierto: rutaAudio.optional(),
  error: rutaAudio.optional(), avanzar: rutaAudio.optional(), fin: rutaAudio.optional(),
  felicitacion: rutaAudio.optional(), musica: rutaAudio.optional(),
});
export const esquemaContenidoFormar = z.object({
  elementos: z.array(elemento).min(1).max(30),
  nombreItem: texto.optional(),
  consigna: texto.optional(),
  escena: esquemaEscenaJuego.optional(), efectos: efectos.optional(),
});
export type ContenidoFormar = z.infer<typeof esquemaContenidoFormar>;

/** Consume un único flujo aleatorio en orden de ronda. Las piezas conservan su identidad aunque repitan texto. */
export function fichasBarajadas(elementos: readonly { silabas: readonly string[] }[], semilla: string): number[][] {
  const azar = generador(semilla);
  return elementos.map(({ silabas }) => {
    const orden = silabas.map((_, i) => i);
    for (let i = orden.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [orden[i], orden[j]] = [orden[j], orden[i]];
    }
    if (orden.every((n, i) => n === i)) [orden[0], orden[1]] = [orden[1], orden[0]];
    return orden;
  });
}

export const formar = definirTipo({
  tipo: "formar", nombre: "Formar palabras", versionEsquema: 1,
  esquemaContenido: esquemaContenidoFormar,
  esquemaRespuesta: z.array(texto).min(2).max(6),
  items: (c) => c.elementos.map((e) => ({ itemId: e.id, puntajeMaximo: 1 })),
  calificar(c, id, respuesta) {
    const e = c.elementos.find((x) => x.id === id);
    if (!e) throw new Error(`Elemento desconocido: ${id}`);
    const correcta = respuesta.length === e.silabas.length && respuesta.every((s, i) => s === e.silabas[i]);
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, id) {
    const e = c.elementos.find((x) => x.id === id);
    if (!e) throw new Error(`Elemento desconocido: ${id}`);
    return { pregunta: e.texto, solucion: e.silabas.join(" · ") };
  },
});
