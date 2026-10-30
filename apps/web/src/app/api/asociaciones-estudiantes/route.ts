import type { NextRequest } from "next/server";
import { esquemasUsuarios as E, servicioUsuarios as S } from "@/server/modules/usuarios";
import { leerConsulta, manejar, requerirRol } from "@/server/http";

/**
 * ADMIN: estudiantes con su grupo activo e historial del año (INC1R-09, §6 y
 * §11). Búsqueda por nombre/correo; filtros por año, grupo, situación y estado.
 * La asignación y el traslado se hacen con PUT /api/usuarios/:id/grupo.
 */
export function GET(req: NextRequest) {
  return manejar(async () => {
    await requerirRol(["ADMIN"]);
    const f = leerConsulta(req, E.filtroAsociaciones);
    const { data, total, anio } = await S.listarAsociaciones(f);
    return Response.json({ data, page: f.page, pageSize: f.pageSize, total, anio }, { headers: { "Cache-Control": "no-store" } });
  });
}
