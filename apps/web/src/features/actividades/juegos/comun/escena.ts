import { z } from "zod";

/** Escena opcional compartida por los juegos. */
const rutaImagen = z.string().regex(/^\/images\/[\w\-/]+\.webp$/, "ruta /images/….webp");
export const esquemaEscenaJuego = z.object({
  fondo: rutaImagen.optional(),
  personaje: z.object({
    nombre: z.string().trim().min(1),
    reposo: rutaImagen,
    senala: rutaImagen,
    duda: rutaImagen,
  }).optional(),
});
export type EscenaJuego = z.infer<typeof esquemaEscenaJuego>;
