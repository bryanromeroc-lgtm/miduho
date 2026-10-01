import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerCuerpo, manejar, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";
export function POST(req: NextRequest) { return manejar(async () => { verificarOrigen(req); await requerirRol(ROLES_ACADEMICO); const d = await leerCuerpo(req, E.crearAcudienteEstudiante); return Response.json(await S.acudientesEstudiantes.crear(d), { status: 201 }); }); }
