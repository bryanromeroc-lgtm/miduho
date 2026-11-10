import type { Titulo } from "@/data/demo";
import type { ContextoShell } from "@/lib/navegacion";

/**
 * Títulos que ve cada contexto en la Biblioteca. El estudiante nunca ve las
 * guías ni los recursos solo para docentes; la docente y la coordinadora
 * (ADMIN, vista-admin-contenido) ven el catálogo completo.
 */
export function titulosVisibles<T extends Pick<Titulo, "soloDocente">>(titulos: T[], contexto: ContextoShell | null): T[] {
  return contexto === "ESTUDIANTE" ? titulos.filter((t) => !t.soloDocente) : titulos;
}
