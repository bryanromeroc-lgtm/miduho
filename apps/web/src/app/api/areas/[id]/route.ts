import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerCuerpo, manejar, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";

export function GET(_req: NextRequest, ctx: RouteContext<"/api/areas/[id]">) {
  return manejar(async () => {
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    return Response.json(await S.areas.obtener(id));
  });
}

export function PATCH(req: NextRequest, ctx: RouteContext<"/api/areas/[id]">) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    const datos = await leerCuerpo(req, E.actualizarArea);
    return Response.json(await S.areas.actualizar(id, datos));
  });
}

export function DELETE(req: NextRequest, ctx: RouteContext<"/api/areas/[id]">) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const { id } = await ctx.params;
    await S.areas.eliminar(id);
    return new Response(null, { status: 204 });
  });
}
