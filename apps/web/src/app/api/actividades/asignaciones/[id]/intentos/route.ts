import type { NextRequest } from "next/server";
import { manejar, requerirRol, verificarOrigen } from "@/server/http";
import { servicioActividades as S } from "@/server/modules/actividades";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const estudiante = await requerirRol(["ESTUDIANTE"]);
    return Response.json(await S.iniciarIntento(estudiante.id, (await params).id), { status: 201 });
  });
}
