import type { NextRequest } from "next/server";
import { esquemasUsuarios as E, servicioUsuarios as S } from "@/server/modules/usuarios";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/**
 * ADMIN: asocia un ESTUDIANTE con un grupo. Si ya tiene grupo en ese año es
 * un traslado: requiere `confirmarTraslado` y conserva el historial (§6).
 */
export function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { id } = await params;
    const datos = await leerCuerpo(req, E.asignarGrupo);
    return Response.json(await S.asignarGrupo(id, datos));
  });
}
