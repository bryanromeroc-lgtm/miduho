import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerCuerpo, manejar, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";

export function GET(_req: NextRequest, ctx: RouteContext<"/api/periodos/[id]">) {
  return manejar(async () => {
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    return Response.json(await S.periodos.obtener(id));
  });
}

export function PATCH(req: NextRequest, ctx: RouteContext<"/api/periodos/[id]">) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    const datos = await leerCuerpo(req, E.actualizarPeriodo);
    return Response.json(await S.periodos.actualizar(id, datos));
  });
}

export function DELETE(req: NextRequest, ctx: RouteContext<"/api/periodos/[id]">) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    await S.periodos.eliminar(id);
    return new Response(null, { status: 204 });
  });
}
