import type { NextRequest } from "next/server";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";
import { esquemasActividades as E, servicioActividades as S } from "@/server/modules/actividades";

export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    const docente = await requerirRol(["DOCENTE"]);
    const datos = await leerCuerpo(req, E.crearMaterial);
    return Response.json(await S.crearMaterial(docente.id, datos), { status: 201 });
  });
}
