import type { NextRequest } from "next/server";
import { servicioAcademico as S } from "@/server/modules/academico";
import { manejar, requerirRol, ROLES_ACADEMICO, verificarOrigen } from "@/server/http";
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { return manejar(async () => { verificarOrigen(req); await requerirRol(ROLES_ACADEMICO); return Response.json(await S.asignacionesDocente.desactivar((await params).id)); }); }
