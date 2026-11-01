import "server-only";
import { auth } from "@/auth";
import { avatarOPorDefecto, type Avatar } from "@/lib/avatares";
import type { MisMaterias, VistaMateria } from "@/lib/materias";
import { db } from "@/server/db";
import { catalogoActividades, type ActividadDeCatalogo } from "@/server/modules/curriculo";
import { actividadesDeCatalogo } from "./puertos";
import { crearServicioMaterias } from "./servicio";

export const servicioMaterias = crearServicioMaterias(db, { actividades: actividadesDeCatalogo(db, catalogoActividades) });
export { guardarAvatarDe, AVATARES } from "./avatar";
export { rutaVolver } from "./servicio";
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

/** Vista de una asignatura para la sesión actual; null (404) si no es del grupo del estudiante. */
export async function vistaMateriaDeSesion(asignaturaId: string): Promise<VistaMateria | null> {
  return servicioMaterias.vistaMateria(await auth(), asignaturaId);
}

/**
 * Una actividad del currículo para jugar en la sesión actual; null (404) si la
 * materia no es del grupo del estudiante o la actividad no es de su grado.
 */
export async function actividadDeSesion(
  asignaturaId: string,
  slug: string,
): Promise<{ vista: VistaMateria; actividad: ActividadDeCatalogo } | null> {
  const vista = await vistaMateriaDeSesion(asignaturaId);
  if (!vista) return null;
  const grupo = await db.grupo.findUnique({ where: { id: vista.grupo.id }, select: { grado: { select: { orden: true } } } });
  const actividad = grupo && catalogoActividades.una(vista.materia.nombre, grupo.grado.orden, slug);
  return actividad ? { vista, actividad } : null;
}
