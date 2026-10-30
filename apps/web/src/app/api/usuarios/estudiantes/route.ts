import { type NextRequest } from "next/server";
import { esquemaNuevaCuenta } from "@/server/auth/esquemas";
import { servicioCuentas } from "@/server/auth/recuperacion";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/**
 * ADMIN crea un ESTUDIANTE: la contraseña legible se devuelve una sola vez y
 * solo se guarda su hash (§4.3). La asociación con grupo es de INC1R-05.
 */
export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const datos = await leerCuerpo(req, esquemaNuevaCuenta);
    const r = await servicioCuentas.crearEstudiante(datos);
    return Response.json(r, { status: 201, headers: { "Cache-Control": "no-store" } });
  });
}
