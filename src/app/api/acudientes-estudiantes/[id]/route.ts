import type { NextRequest } from "next/server";
import { esquemasAcademico as E, servicioAcademico as S } from "@/server/modules/academico";
import { leerCuerpo, manejar, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { return manejar(async () => { verificarOrigen(req); await requerirRol(ROLES_ACADEMICO); const d = await leerCuerpo(req, E.actualizarAcudienteEstudiante); return Response.json(await S.acudientesEstudiantes.actualizar((await params).id, d)); }); }
