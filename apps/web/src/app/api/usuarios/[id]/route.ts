import type { NextRequest } from "next/server";
import { esquemasUsuarios as E, servicioUsuarios as S } from "@/server/modules/usuarios";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

type Ctx = { params: Promise<{ id: string }> };

/** ADMIN: ficha de la cuenta con roles, estado, grupo actual e historial. */
export function GET(_req: NextRequest, { params }: Ctx) {
  return manejar(async () => {
    await requerirRol(["ADMIN"]);
    const { id } = await params;
    return Response.json(await S.obtener(id), { headers: { "Cache-Control": "no-store" } });
  });
}

/** ADMIN: edita nombres, apellidos y correo (único). */
export function PATCH(req: NextRequest, { params }: Ctx) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { id } = await params;
    const datos = await leerCuerpo(req, E.actualizarIdentidad);
    return Response.json(await S.actualizarIdentidad(id, datos));
  });
}
