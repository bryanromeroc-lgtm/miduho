import { z } from "zod";
import { esquemaVideoPreguntas } from "@/features/actividades/tipos/video";

const id = z.string().min(1);
const fecha = z.coerce.date();

export const crearMaterial = z.object({
  titulo: z.string().trim().min(3).max(120),
  instruccion: z.string().trim().max(1000).optional(),
  url: z.url(),
  contenido: esquemaVideoPreguntas.omit({ video: true }),
  asignaturaId: id,
  gradoId: id,
  grupoIds: z.array(id).min(1),
  inicio: z.number().int().min(0).optional(),
  fin: z.number().int().positive().optional(),
  abreEn: fecha.optional(),
  cierraEn: fecha.optional(),
  maxIntentos: z.number().int().min(1).max(5).default(3),
}).refine((v) => v.fin === undefined || v.fin > (v.inicio ?? 0), {
  path: ["fin"], message: "El fin debe ser posterior al inicio",
});

export const editarMaterial = z.object({
  titulo: z.string().trim().min(3).max(120).optional(),
  instruccion: z.string().trim().max(1000).nullable().optional(),
  url: z.url().optional(),
  contenido: esquemaVideoPreguntas.omit({ video: true }).optional(),
  inicio: z.number().int().min(0).optional(),
  fin: z.number().int().positive().nullable().optional(),
}).strict();

export const editarAsignacion = z.object({
  abreEn: fecha.optional(),
  cierraEn: fecha.optional(),
  maxIntentos: z.number().int().min(1).max(5).optional(),
}).strict();

export const enviarIntento = z.object({ respuestas: z.record(z.string(), z.unknown()) });
