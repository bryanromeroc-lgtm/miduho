import type { NextRequest } from "next/server";
import { esquemasUsuarios as E, servicioUsuarios as S } from "@/server/modules/usuarios";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/**
 * ADMIN: activa o desactiva. Desactivar conserva el historial y revoca las
 * sesiones; nunca se aplica al último ADMIN activo ni a la propia cuenta.
 */
export function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const actor = await requerirRol(["ADMIN"]);
    const { id } = await params;
    const { estado } = await leerCuerpo(req, E.cambiarEstado);
    return Response.json(await S.cambiarEstado(actor.id, id, estado));
  });
}
