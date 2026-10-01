import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerConsulta, leerCuerpo, manejar, paginada, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";

export function GET(req: NextRequest) {
  return manejar(async () => {
    await requerirRol(ROLES_ACADEMICO);
    const f = leerConsulta(req, E.filtroAsignaturas);
    const { data, total } = await S.asignaturas.listar(f);
    return paginada(data, total, f);
  });
}

export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(ROLES_ACADEMICO);
    const datos = await leerCuerpo(req, E.crearAsignatura);
    return Response.json(await S.asignaturas.crear(datos), { status: 201 });
  });
}
