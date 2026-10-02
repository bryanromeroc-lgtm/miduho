import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerCuerpo, manejar, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const user = await requerirRol(ROLES_ACADEMICO);
    const id = (await params).id;
    const d = await leerCuerpo(req, E.accionAsignacionDocente);
    if (d.accion === "REACTIVAR") return Response.json(await S.asignacionesDocente.reactivar(id));
    return Response.json(await S.asignacionesDocente.reasignar(id, d, user.id));
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    return Response.json(await S.asignacionesDocente.desactivar((await params).id));
  });
}
