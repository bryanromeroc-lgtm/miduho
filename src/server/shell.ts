import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { db } from "@/server/db";
import type { DatosShell } from "@/components/shell/contexto";
import { etiquetaGrupo } from "@/lib/navegacion";

/**
 * Identidad, grupo y período reales para el shell. Solo lectura y acotado a la
 * propia cuenta: nunca expone datos de terceros. Memoizado por render.
 */
export const obtenerDatosShell = cache(async (): Promise<DatosShell | null> => {
  const sesion = await auth();
  const id = sesion?.user?.id;
  if (!id) return null;

  const roles = sesion.user.roles;
  const [usuario, anio] = await Promise.all([
    db.usuario.findUnique({ where: { id }, select: { nombres: true, apellidos: true, correo: true } }),
    db.anioLectivo.findFirst({
      where: { estado: "ACTIVO" },
      select: { id: true, periodos: { select: { nombre: true, fechaInicio: true, fechaFin: true } } },
    }),
  ]);
  if (!usuario) return null;

  let grupo: string | null = null;
  let gruposDocente: string[] = [];

  if (anio && roles.includes("ESTUDIANTE")) {
    const asociacion = await db.asociacionEstudianteGrupo.findFirst({
      where: { estudianteId: id, anioLectivoId: anio.id, finEn: null },
      select: { grupo: { select: { identificador: true, grado: { select: { nombre: true } } } } },
    });
    if (asociacion) grupo = etiquetaGrupo(asociacion.grupo.grado.nombre, asociacion.grupo.identificador);
  }

  if (anio && roles.includes("DOCENTE")) {
    const asignaciones = await db.asignacionDocente.findMany({
      where: { docenteId: id, anioLectivoId: anio.id, estado: "ACTIVA" },
      select: { grupo: { select: { identificador: true, grado: { select: { nombre: true, orden: true } } } } },
    });
    const unicos = new Map<string, number>();
    for (const a of asignaciones) {
      unicos.set(etiquetaGrupo(a.grupo.grado.nombre, a.grupo.identificador), a.grupo.grado.orden);
    }
    gruposDocente = [...unicos.entries()].sort((x, y) => x[1] - y[1] || x[0].localeCompare(y[0])).map(([g]) => g);
  }

  const hoy = new Date();
  const periodo = anio?.periodos.find((p) => p.fechaInicio <= hoy && hoy <= p.fechaFin)?.nombre ?? null;

  return {
    nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
    correo: usuario.correo,
    roles,
    contexto: sesion.user.contexto,
    grupo,
    gruposDocente,
    periodo,
  };
});
