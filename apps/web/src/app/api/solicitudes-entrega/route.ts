import { NextRequest } from "next/server";
import { solicitud } from "@/server/modules/entregas/esquemas";
import { crearSolicitud } from "@/server/modules/entregas/servicio";
import { manejar, requerirRol, verificarOrigen } from "@/server/http";

export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    const usuario = await requerirRol(["ADMIN"]);
    const datos = solicitud.safeParse(await req.json());
    if (!datos.success) return Response.json({ fieldErrors: datos.error.flatten().fieldErrors }, { status: 400 });
    const creada = await crearSolicitud(usuario.id, datos.data);
    return Response.json({ id: creada.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
  });
}
