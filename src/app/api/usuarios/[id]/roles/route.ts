import type { NextRequest } from "next/server";
import { esquemasUsuarios as E, servicioUsuarios as S } from "@/server/modules/usuarios";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/**
 * ADMIN: cambia la combinación de roles (p. ej. promover DOCENTE a ADMIN).
 * Nunca retira ADMIN al último administrador activo; revoca sesiones (trigger).
 */
export function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const actor = await requerirRol(["ADMIN"]);
    const { id } = await params;
    const { combinacion } = await leerCuerpo(req, E.cambiarRoles);
    return Response.json(await S.cambiarRoles(actor.id, id, combinacion));
  });
}
