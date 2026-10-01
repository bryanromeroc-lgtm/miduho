import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerConsulta, leerCuerpo, manejar, paginada, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";

export function GET(req: NextRequest) { return manejar(async () => { await requerirRol(["ADMIN", "COORDINACION", "DOCENTE"]); const f = leerConsulta(req, E.filtroAsignacionesDocente); const r = await S.asignacionesDocente.listar(f); return paginada(r.data, r.total, f); }); }
export function POST(req: NextRequest) { return manejar(async () => { verificarOrigen(req); const user = await requerirRol(ROLES_ACADEMICO); const d = await leerCuerpo(req, E.crearAsignacionDocente); return Response.json(await S.asignacionesDocente.crear(d, user.id), { status: 201 }); }); }
