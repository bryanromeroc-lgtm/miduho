import { z } from "zod";
import { definirTipo } from "./contrato";
import { esquemaPregunta, reglasPreguntas } from "./preguntas";

export const esquemaVideoPreguntas = z.object({
  video: z.object({
    proveedor: z.literal("youtube"),
    id: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "El identificador del video debe tener 11 caracteres"),
    inicio: z.number().int().min(0).optional(),
    fin: z.number().int().positive().optional(),
    tituloOriginal: z.string().trim().min(1),
  }).refine((video) => video.fin === undefined || video.fin > (video.inicio ?? 0), {
    path: ["fin"],
    message: "El fin debe ser posterior al inicio",
  }),
  preguntas: z.array(esquemaPregunta.safeExtend({
    audio: z.never().optional(),
    audioOpciones: z.never().optional(),
  })).min(1).max(10),
});

export const videoPreguntas = definirTipo({
  tipo: "video-preguntas",
  nombre: "Material audiovisual",
  esquemaContenido: esquemaVideoPreguntas,
  ...reglasPreguntas,
});
