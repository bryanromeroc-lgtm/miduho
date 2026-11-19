import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { manejar, requerirRol } from "@/server/http";
import { cifrar, integracionConfigurada } from "@/server/integraciones/google/cifrado";
import { nuevoDesafio, urlAutorizacion } from "@/server/integraciones/google/oauth";

export function GET() {
  return manejar(async () => {
    const usuario = await requerirRol(["ADMIN"]);
    if (!integracionConfigurada()) return Response.json({ error: "Google Drive no está configurado" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    const desafio = nuevoDesafio();
    await db.desafioGoogle.create({ data: {
      stateHash: createHash("sha256").update(desafio.state).digest("hex"), usuarioId: usuario.id,
      expiraEn: new Date(Date.now() + 10 * 60_000),
    } });
    const respuesta = NextResponse.redirect(urlAutorizacion(desafio.state, desafio.challenge));
    respuesta.cookies.set("miduho_google_oauth", cifrar(JSON.stringify({ state: desafio.state, verifier: desafio.verifier, usuarioId: usuario.id })), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/api/integraciones/google",
    });
    respuesta.headers.set("Cache-Control", "no-store");
    return respuesta;
  });
}
