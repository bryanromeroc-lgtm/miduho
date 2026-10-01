import "server-only";
import { db } from "@/server/db";
import { crearServicioAcademico } from "./servicio";

export const servicioAcademico = crearServicioAcademico(db);
export * as esquemasAcademico from "./esquemas";
