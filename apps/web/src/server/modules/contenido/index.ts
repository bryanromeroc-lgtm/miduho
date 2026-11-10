import "server-only";
import { db } from "@/server/db";
import { catalogoActividades } from "@/server/modules/curriculo";
import { crearServicioContenido } from "./servicio";

export const servicioContenido = crearServicioContenido(db, catalogoActividades);
export type { ServicioContenido } from "./servicio";
