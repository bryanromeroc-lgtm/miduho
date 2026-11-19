import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { manejar, requerirRol } from "@/server/http";
import { cifrar, descifrar } from "@/server/integraciones/google/cifrado";
import { correoGoogle, intercambiarCodigo, tienePermisoDrive } from "@/server/integraciones/google/oauth";

function volver(req: NextRequest, aviso: string) {
  const respuesta = NextResponse.redirect(new URL(`/cuenta?google=${encodeURIComponent(aviso)}`, req.url));
  respuesta.headers.set("Cache-Control", "no-store");
  return respuesta;
}

export function GET(req: NextRequest) {
  return manejar(async () => {
    const usuario = await requerirRol(["ADMIN"]);
    const almacen = await cookies();
    const cookie = almacen.get("miduho_google_oauth")?.value;
    almacen.delete("miduho_google_oauth");
    if (!cookie) return Response.json({ error: "Estado OAuth inválido" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    let datos: { state: string; verifier: string; usuarioId: string };
    try { datos = JSON.parse(descifrar(cookie)); }
    catch { return Response.json({ error: "Estado OAuth inválido" }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
    const recibido = req.nextUrl.searchParams.get("state") ?? "";
    const a = Buffer.from(datos.state);
    const b = Buffer.from(recibido);
    if (a.length !== b.length || !timingSafeEqual(a, b) || datos.usuarioId !== usuario.id) {
      return Response.json({ error: "Estado OAuth inválido" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const hash = createHash("sha256").update(recibido).digest("hex");
    const consumido = await db.desafioGoogle.deleteMany({ where: { stateHash: hash, usuarioId: usuario.id, expiraEn: { gt: new Date() } } });
    if (consumido.count !== 1) return Response.json({ error: "Estado OAuth inválido o reutilizado" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    if (req.nextUrl.searchParams.has("error")) return volver(req, "cancelado");
    const code = req.nextUrl.searchParams.get("code");
    if (!code) return volver(req, "error");
    try {
      const tokens = await intercambiarCodigo(code, datos.verifier);
      if (!tokens.refresh_token || !tienePermisoDrive(tokens.scope ?? "")) return volver(req, "permisos");
      const correo = await correoGoogle(tokens.access_token);
      const anterior = await db.integracionGoogle.findUnique({ where: { usuarioId: usuario.id }, select: { correoGoogle: true, id: true } });
      await db.integracionGoogle.upsert({
        where: { usuarioId: usuario.id },
        create: { usuarioId: usuario.id, correoGoogle: correo, refreshTokenCifrado: cifrar(tokens.refresh_token), scopes: (tokens.scope ?? "").split(" "), estado: "CONECTADA" },
        update: { correoGoogle: correo, refreshTokenCifrado: cifrar(tokens.refresh_token), scopes: (tokens.scope ?? "").split(" "), estado: "CONECTADA", conectadaEn: new Date() },
      });
      if (anterior && anterior.correoGoogle.toLowerCase() !== correo.toLowerCase()) {
        await db.solicitudEntrega.updateMany({ where: { integracionId: anterior.id, estado: "ABIERTA" }, data: { carpetaRequiereSeleccion: true } });
      }
      return volver(req, "conectado");
    } catch { return volver(req, "error"); }
  });
}
