import type { NextRequest } from "next/server";
import { esquemasUsuarios as E, servicioUsuarios as S } from "@/server/modules/usuarios";
import { leerConsulta, leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/** ADMIN: búsqueda, filtros (rol, estado, grupo) y paginación de cuentas (§11). */
export function GET(req: NextRequest) {
  return manejar(async () => {
    await requerirRol(["ADMIN"]);
    const f = leerConsulta(req, E.filtroUsuarios);
    const { data, total } = await S.listar(f);
    return Response.json({ data, page: f.page, pageSize: f.pageSize, total }, { headers: { "Cache-Control": "no-store" } });
  });
}

/**
 * ADMIN: alta individual con combinación válida. La credencial inicial
 * (temporal de DOCENTE o legible de ESTUDIANTE) se devuelve una sola vez;
 * ADMIN puro recibe invitación de 24 h.
 */
export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const datos = await leerCuerpo(req, E.crearUsuario);
    const r = await S.crear(datos);
    return Response.json(r, { status: 201, headers: { "Cache-Control": "no-store" } });
  });
}
