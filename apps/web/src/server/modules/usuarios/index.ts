import "server-only";
import { db } from "@/server/db";
import { servicioCuentas } from "@/server/auth/recuperacion";
import { crearServicioUsuarios } from "./servicio";

export const servicioUsuarios = crearServicioUsuarios(db, servicioCuentas);
export * as esquemasUsuarios from "./esquemas";
