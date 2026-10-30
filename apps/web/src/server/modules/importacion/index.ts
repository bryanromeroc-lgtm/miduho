import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import { MAX_BYTES_IMPORTACION, TIPOS_IMPORTACION } from "./csv";
import { crearServicioImportacion } from "./servicio";

export const servicioImportacion = crearServicioImportacion(db);
export { ErrorImportacion } from "./servicio";
export { plantillaCsv, TIPOS_IMPORTACION, type TipoImportacion } from "./csv";

export const esquemaTipo = z.enum(TIPOS_IMPORTACION, { error: "Elige estudiantes o docentes." });

/** El archivo viaja como texto dentro del JSON; el servicio lo valida completo. */
export const esquemaImportacion = z.object({
  tipo: esquemaTipo,
  contenido: z
    .string({ error: "Adjunta un archivo CSV." })
    .min(1, "Adjunta un archivo CSV.")
    .max(MAX_BYTES_IMPORTACION, "El archivo supera el tamaño máximo."),
});
