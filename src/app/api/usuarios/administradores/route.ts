import { type NextRequest } from "next/server";
import { esquemaNuevaCuenta } from "@/server/auth/esquemas";
import { servicioCuentas } from "@/server/auth/recuperacion";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/** ADMIN invita a un ADMIN puro: enlace de 24 h (en desarrollo, en consola) (§4.1). */
export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const datos = await leerCuerpo(req, esquemaNuevaCuenta);
    const r = await servicioCuentas.invitarAdmin(datos);
    return Response.json(r, { status: 201 });
  });
}
