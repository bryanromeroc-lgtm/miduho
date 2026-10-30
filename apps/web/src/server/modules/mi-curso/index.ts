import "server-only";
import { db } from "@/server/db";
import { crearServicioMiCurso } from "./servicio";

export const servicioMiCurso = crearServicioMiCurso(db);
export { ETIQUETA_DIA } from "./servicio";
export type { Bloque, DetalleGrupo, EstudianteGrupo, ResumenGrupo } from "./servicio";
