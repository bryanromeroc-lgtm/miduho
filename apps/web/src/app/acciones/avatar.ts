"use server";

import { auth } from "@/auth";
import { db } from "@/server/db";
import { ErrorDominio } from "@/server/errores";
import { guardarAvatarDe } from "@/server/modules/materias";

export type ResultadoAvatar = { ok: true } | { ok: false; error: string };

/** Guarda el avatar elegido en «Mi explorador» sobre la propia cuenta. */
export async function guardarAvatar(valor: string): Promise<ResultadoAvatar> {
  try {
    await guardarAvatarDe(db, await auth(), valor);
    return { ok: true };
  } catch (e) {
    if (e instanceof ErrorDominio) return { ok: false, error: e.message };
    throw e;
  }
}
