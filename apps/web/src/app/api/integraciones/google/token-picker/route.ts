import { db } from "@/server/db";
import { manejar, requerirRol } from "@/server/http";
import { accessToken } from "@/server/integraciones/google/drive";
import { GoogleRevocadoError } from "@/server/integraciones/google/oauth";

export function GET() {
  return manejar(async () => {
    const usuario = await requerirRol(["ADMIN"]);
    const integracion = await db.integracionGoogle.findUnique({ where: { usuarioId: usuario.id } });
    if (!integracion || integracion.estado !== "CONECTADA" || !integracion.refreshTokenCifrado) {
      return Response.json({ error: "Conecta Google Drive desde Cuenta" }, { status: 409, headers: { "Cache-Control": "no-store" } });
    }
    try {
      const access = await accessToken(integracion);
      return Response.json({ accessToken: access, apiKey: process.env.GOOGLE_API_KEY, appId: process.env.GOOGLE_APP_ID }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      if (error instanceof GoogleRevocadoError) await db.integracionGoogle.update({ where: { id: integracion.id }, data: { estado: "REVOCADA" } });
      throw error;
    }
  });
}
