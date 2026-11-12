import type { NextRequest } from "next/server";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";
import { esquemasActividades as E, servicioActividades as S } from "@/server/modules/actividades";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const docente = await requerirRol(["DOCENTE"]);
    const datos = await leerCuerpo(req, E.editarAsignacion);
    return Response.json(await S.editarAsignacion(docente.id, (await params).id, datos));
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const docente = await requerirRol(["DOCENTE"]);
    const todas = req.nextUrl.searchParams.get("todas") === "true";
    return Response.json({ anuladas: await S.anularAsignacion(docente.id, (await params).id, todas) });
  });
}
