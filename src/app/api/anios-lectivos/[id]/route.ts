import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerCuerpo, manejar, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";

export function GET(_req: NextRequest, ctx: RouteContext<"/api/anios-lectivos/[id]">) {
  return manejar(async () => {
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    return Response.json(await S.aniosLectivos.obtener(id));
  });
}

export function PATCH(req: NextRequest, ctx: RouteContext<"/api/anios-lectivos/[id]">) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    const datos = await leerCuerpo(req, E.actualizarAnioLectivo);
    return Response.json(await S.aniosLectivos.actualizar(id, datos));
  });
}

export function DELETE(req: NextRequest, ctx: RouteContext<"/api/anios-lectivos/[id]">) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    await S.aniosLectivos.eliminar(id);
    return new Response(null, { status: 204 });
  });
}
