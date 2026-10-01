import "server-only";
import { db } from "@/server/db";
import { enviarCorreo } from "@/server/correo";
import {
  VIGENCIA_RESTABLECIMIENTO_MS,
  generarTokenRestablecimiento,
  hashearContrasena,
  hashearToken,
} from "./contrasena";

function urlBase() {
  return (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * HU-02, paso 1. Para quien llama siempre termina igual: no revela si el
 * correo existe. Invalida enlaces anteriores sin usar del mismo usuario.
 */
export async function solicitarRestablecimiento(correo: string) {
  const usuario = await db.usuario.findUnique({ where: { correo } });
  if (!usuario || usuario.estado !== "ACTIVO") return;

  const token = generarTokenRestablecimiento();
  await db.$transaction([
    db.restablecimientoContrasena.deleteMany({ where: { usuarioId: usuario.id, usadoEn: null } }),
    db.restablecimientoContrasena.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: hashearToken(token),
        expiraEn: new Date(Date.now() + VIGENCIA_RESTABLECIMIENTO_MS),
      },
    }),
  ]);

  const enlace = `${urlBase()}/recuperar/nueva?token=${encodeURIComponent(token)}`;
  await enviarCorreo({
    para: usuario.correo,
    asunto: "MIDUHO · Restablecer tu contraseña",
    texto:
      `Hola, ${usuario.nombres}.\n\n` +
      `Recibimos una solicitud para restablecer tu contraseña. Abre este enlace en las próximas 24 horas:\n\n` +
      `${enlace}\n\n` +
      `Si no la pediste, ignora este correo: tu contraseña no cambia.`,
  });
}

export type ResultadoRestablecer = { ok: true } | { ok: false; motivo: "token-invalido" };

/** HU-02, paso 2. Token de un solo uso, vigente y de usuario activo. */
export async function restablecerContrasena(token: string, nueva: string): Promise<ResultadoRestablecer> {
  const registro = await db.restablecimientoContrasena.findUnique({
    where: { tokenHash: hashearToken(token) },
    include: { usuario: true },
  });
  if (
    !registro ||
    registro.usadoEn ||
    registro.expiraEn.getTime() <= Date.now() ||
    registro.usuario.estado !== "ACTIVO"
  ) {
    return { ok: false, motivo: "token-invalido" };
  }

  const hash = await hashearContrasena(nueva);
  const ahora = new Date();
  // updateMany con usadoEn: null hace el consumo atómico: con dos envíos simultáneos solo uno gana.
  const consumido = await db.$transaction(async (tx) => {
    const r = await tx.restablecimientoContrasena.updateMany({
      where: { id: registro.id, usadoEn: null },
      data: { usadoEn: ahora },
    });
    if (r.count !== 1) return false;
    await tx.usuario.update({ where: { id: registro.usuarioId }, data: { hashContrasena: hash } });
    await tx.restablecimientoContrasena.deleteMany({
      where: { usuarioId: registro.usuarioId, usadoEn: null },
    });
    return true;
  });
  return consumido ? { ok: true } : { ok: false, motivo: "token-invalido" };
}
