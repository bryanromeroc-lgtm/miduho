import "server-only";
import { db } from "@/server/db";
import { crearServicioActividades } from "./servicio";

export const servicioActividades = crearServicioActividades(db);
export * as esquemasActividades from "./esquemas";
