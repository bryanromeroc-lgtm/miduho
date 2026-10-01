import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerConsulta, leerCuerpo, manejar, paginada, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";

export function GET(req: NextRequest) {
  return manejar(async () => {
    await requerirRol(ROLES_ACADEMICO);
    const p = leerConsulta(req, E.paginacion);
    const { data, total } = await S.aniosLectivos.listar(p);
    return paginada(data, total, p);
  });
}

export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const datos = await leerCuerpo(req, E.crearAnioLectivo);
    return Response.json(await S.aniosLectivos.crear(datos), { status: 201 });
  });
}
