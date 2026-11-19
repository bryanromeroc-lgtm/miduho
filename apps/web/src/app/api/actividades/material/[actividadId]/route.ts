import type { NextRequest } from "next/server";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";
import { esquemasActividades as E, servicioActividades as S } from "@/server/modules/actividades";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ actividadId: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const docente = await requerirRol(["DOCENTE"]);
    const datos = await leerCuerpo(req, E.editarMaterial);
    return Response.json(await S.editarMaterial(docente.id, (await params).actividadId, datos));
  });
}
