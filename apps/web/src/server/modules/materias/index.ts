import "server-only";
import { auth } from "@/auth";
import { avatarOPorDefecto, type Avatar } from "@/lib/avatares";
import type { MisMaterias } from "@/lib/materias";
import { db } from "@/server/db";
import { crearServicioMaterias } from "./servicio";

export const servicioMaterias = crearServicioMaterias(db);
export { guardarAvatarDe, AVATARES } from "./avatar";
export type { MisMaterias, ResumenMateria } from "./servicio";

/** Tablero y avatar de la sesión actual; null si el contexto no es ESTUDIANTE. */
export async function misMateriasDeSesion(): Promise<{ datos: MisMaterias; avatar: Avatar; avatarElegido: boolean } | null> {
  const sesion = await auth();
  const id = sesion?.user?.id;
  if (!id || sesion.user.contexto !== "ESTUDIANTE") return null;
  const [datos, usuario] = await Promise.all([
    servicioMaterias.deEstudiante(id),
    db.usuario.findUnique({ where: { id }, select: { avatar: true } }),
  ]);
  return { datos, avatar: avatarOPorDefecto(usuario?.avatar), avatarElegido: usuario?.avatar != null };
}
