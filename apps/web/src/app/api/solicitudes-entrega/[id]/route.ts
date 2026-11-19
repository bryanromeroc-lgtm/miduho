import { NextRequest } from "next/server";
import { solicitud } from "@/server/modules/entregas/esquemas";
import { archivarSolicitud, editarSolicitud, eliminarSolicitud } from "@/server/modules/entregas/servicio";
import { manejar, requerirRol, verificarOrigen } from "@/server/http";

export function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { id } = await ctx.params;
    const datos = solicitud.safeParse(await req.json());
    if (!datos.success) return Response.json({ fieldErrors: datos.error.flatten().fieldErrors }, { status: 400 });
    await editarSolicitud(id, datos.data);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  });
}
export function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { id } = await ctx.params;
    await archivarSolicitud(id);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  });
}
export function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { id } = await ctx.params;
    await eliminarSolicitud(id);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  });
}
