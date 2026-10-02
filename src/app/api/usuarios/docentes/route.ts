import { type NextRequest } from "next/server";
import { esquemaNuevaCuenta } from "@/server/auth/esquemas";
import { servicioCuentas } from "@/server/auth/recuperacion";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/** ADMIN crea un DOCENTE: la contraseña temporal se devuelve una sola vez (§4.2). */
export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const datos = await leerCuerpo(req, esquemaNuevaCuenta);
    const r = await servicioCuentas.crearDocente(datos);
    return Response.json(r, { status: 201, headers: { "Cache-Control": "no-store" } });
  });
}
