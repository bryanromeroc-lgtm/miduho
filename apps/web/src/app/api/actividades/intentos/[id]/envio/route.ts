import type { NextRequest } from "next/server";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";
import { esquemasActividades as E, servicioActividades as S } from "@/server/modules/actividades";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const estudiante = await requerirRol(["ESTUDIANTE"]);
    const datos = await leerCuerpo(req, E.enviarIntento);
    return Response.json(await S.enviarIntento(estudiante.id, (await params).id, datos));
  });
}
