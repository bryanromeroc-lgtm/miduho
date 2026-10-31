/**
 * Guardar el avatar del explorador (D6): solo con contexto ESTUDIANTE y solo
 * sobre la cuenta de la sesión. El valor se valida contra el enum; un valor
 * inválido o una sesión ajena se rechazan sin tocar ningún usuario.
 */
import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";
import { AVATARES, type Avatar } from "@/lib/avatares";
import { ErrorDominio } from "@/server/errores";

export { AVATARES };

export const esquemaAvatar = z.enum(AVATARES, { error: "Ese avatar no existe." });

type SesionMinima = { user?: { id?: string | null; contexto?: string | null } | null } | null;

export async function guardarAvatarDe(db: PrismaClient, sesion: SesionMinima, valor: unknown): Promise<Avatar> {
  const id = sesion?.user?.id;
  if (!id) throw new ErrorDominio("NO_AUTENTICADO", "Inicia sesión para elegir tu avatar.", 401);
  if (sesion.user?.contexto !== "ESTUDIANTE") {
    throw new ErrorDominio("PROHIBIDO", "Solo los estudiantes eligen avatar.", 403);
  }
  const datos = esquemaAvatar.safeParse(valor);
  if (!datos.success) throw new ErrorDominio("AVATAR_INVALIDO", "Ese avatar no existe.", 400);
  await db.usuario.update({ where: { id }, data: { avatar: datos.data } });
  return datos.data;
}
