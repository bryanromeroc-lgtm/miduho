import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { manejar, requerirRol, verificarOrigen } from "@/server/http";
import { descifrar } from "@/server/integraciones/google/cifrado";
import { olvidarToken } from "@/server/integraciones/google/drive";
import { revocarToken } from "@/server/integraciones/google/oauth";

export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    const usuario = await requerirRol(["ADMIN"]);
    const integracion = await db.integracionGoogle.findUnique({ where: { usuarioId: usuario.id } });
    if (integracion?.refreshTokenCifrado) {
      try { await revocarToken(descifrar(integracion.refreshTokenCifrado)); } catch { /* mejor esfuerzo */ }
      await db.integracionGoogle.update({ where: { id: integracion.id }, data: { refreshTokenCifrado: null, estado: "REVOCADA" } });
      olvidarToken(integracion.id);
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  });
}
