import "server-only";
import { db } from "@/server/db";
import type { Conteos } from "@/features/estructura-academica/pasos";

/** Conteos sin filtros para las tarjetas de la ruta de configuración (/admin/estructura). */
export async function conteosEstructura(): Promise<Conteos> {
  const activo = await db.anioLectivo.findFirst({ where: { estado: "ACTIVO" }, select: { id: true, anio: true } });
  const delActivo = activo ? { anioLectivoId: activo.id } : { anioLectivoId: "__sin_anio__" };
  const [anios, periodos, areas, grados, gruposActivo, gruposSinDirector, asignaturas, asignaturasSinGrado] = await Promise.all([
    db.anioLectivo.count(),
    db.periodo.aggregate({ where: delActivo, _count: { _all: true }, _sum: { ponderacion: true } }),
    db.area.count(),
    db.grado.count(),
    db.grupo.count({ where: delActivo }),
    db.grupo.count({ where: { ...delActivo, directorId: null } }),
    db.asignatura.count(),
    db.asignatura.count({ where: { grados: { none: {} } } }),
  ]);
  return {
    anios, anioActivo: activo?.anio ?? null,
    periodosActivo: periodos._count._all, ponderacionActivo: Number(periodos._sum.ponderacion ?? 0),
    areas, grados, gruposActivo, gruposSinDirector, asignaturas, asignaturasSinGrado,
  };
}
