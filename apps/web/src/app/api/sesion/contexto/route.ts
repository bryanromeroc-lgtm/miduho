import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { ErrorDominio } from "@/server/errores";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";
import { puedeUsarContexto } from "@/server/auth/sesion";

const esquemaContexto = z.object({ contexto: z.enum(["ADMIN", "DOCENTE"]) });

export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    const usuario = await requerirRol(["ADMIN", "DOCENTE"]);
    const { contexto } = await leerCuerpo(req, esquemaContexto);
    if (!puedeUsarContexto(usuario.roles, contexto)) {
      throw new ErrorDominio("CONTEXTO_NO_AUTORIZADO", "No tienes ese contexto habilitado.", 403);
    }
    await db.usuario.update({ where: { id: usuario.id }, data: { ultimoContexto: contexto } });
    return Response.json({ contexto });
  });
}