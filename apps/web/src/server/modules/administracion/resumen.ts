import "server-only";
import { db } from "@/server/db";
import { conteosEstructura } from "@/server/modules/academico/resumen";
import { pasosEstructura } from "@/features/estructura-academica/pasos";

/**
 * Cifras reales para las tarjetas de Administración, Usuarios y Coordinación.
 * Sin filtros: cuentan todo el colegio. «Sin grupo» y «sin carga» se miden en
 * el año lectivo activo; sin año activo, todo estudiante cuenta como sin grupo.
 */
export async function resumenUsuarios() {
  const anio = await db.anioLectivo.findFirst({ where: { estado: "ACTIVO" }, select: { id: true, anio: true } });
  const conRol = (codigo: string) => ({ roles: { some: { rol: { codigo } } } });
  const delAnio = anio ? { anioLectivoId: anio.id } : { anioLectivoId: "__sin_anio__" };
  const [estudiantes, estudiantesSinGrupo, estudiantesInactivos, docentes, docentesSinCarga, docentesPorActivar] = await Promise.all([
    db.usuario.count({ where: { estado: "ACTIVO", ...conRol("ESTUDIANTE") } }),
    db.usuario.count({
      where: { estado: "ACTIVO", ...conRol("ESTUDIANTE"), asociacionesGrupo: { none: { finEn: null, ...delAnio } } },
    }),
    db.usuario.count({ where: { estado: "INACTIVO", ...conRol("ESTUDIANTE") } }),
    db.usuario.count({ where: { estado: "ACTIVO", ...conRol("DOCENTE") } }),
    db.usuario.count({
      where: { estado: "ACTIVO", ...conRol("DOCENTE"), asignaciones: { none: { estado: "ACTIVA", ...delAnio } } },
    }),
    db.usuario.count({ where: { estado: "ACTIVO", debeCambiarContrasena: true, ...conRol("DOCENTE") } }),
  ]);
  return {
    anio: anio?.anio ?? null,
    estudiantes: { activos: estudiantes, sinGrupo: estudiantesSinGrupo, inactivos: estudiantesInactivos },
    docentes: { activos: docentes, sinCarga: docentesSinCarga, porActivar: docentesPorActivar },
  };
}

export async function resumenCoordinacion() {
  const conteos = await conteosEstructura();
  const anio = await db.anioLectivo.findFirst({ where: { estado: "ACTIVO" }, select: { id: true } });
  const asignaciones = anio ? await db.asignacionDocente.count({ where: { anioLectivoId: anio.id, estado: "ACTIVA" } }) : 0;
  const pasos = pasosEstructura(conteos);
  return {
    anio: conteos.anioActivo,
    pasosListos: pasos.filter((p) => p.estado === "listo").length,
    pasosTotal: pasos.length,
    pendiente: pasos.find((p) => p.estado !== "listo") ?? null,
    grupos: conteos.gruposActivo,
    gruposSinDirector: conteos.gruposSinDirector,
    asignaturas: conteos.asignaturas,
    asignaciones,
  };
}

export type ResumenUsuarios = Awaited<ReturnType<typeof resumenUsuarios>>;
export type ResumenCoordinacion = Awaited<ReturnType<typeof resumenCoordinacion>>;
