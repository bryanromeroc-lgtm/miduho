/**
 * Mi curso del DOCENTE (INC1R-10, requerimiento §2.2 y §3).
 *
 * Alcance estricto: solo grupos del año ACTIVO donde el docente tiene al menos
 * una asignación ACTIVA. Muestra asignaturas, bloques de horario y estudiantes
 * con asociación vigente (nombre, correo y estado). No expone perfil
 * académico, calificaciones, entregas ni datos de edición.
 *
 * Aislamiento horizontal: `obtenerGrupo` responde el mismo NO_ENCONTRADO (404)
 * para un id inexistente y para un grupo ajeno, de modo que la URL no permite
 * enumerar grupos. La autorización de rol se hace antes (página o handler).
 */
import type { PrismaClient } from "@/generated/prisma/client";
import { etiquetaGrupo } from "@/lib/navegacion";
import { ErrorDominio } from "@/server/errores";

const ORDEN_DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"] as const;
export type Dia = (typeof ORDEN_DIAS)[number];

export const ETIQUETA_DIA: Record<Dia, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

export type Bloque = { dia: Dia; horaInicio: string; horaFin: string };
export type AsignaturaGrupo = { asignacionId: string; asignatura: string; area: string; bloques: Bloque[] };
export type ResumenGrupo = {
  id: string;
  etiqueta: string;
  anio: number;
  asignaturas: AsignaturaGrupo[];
  totalEstudiantes: number;
};
export type EstudianteGrupo = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estado: "PENDIENTE_ACTIVACION" | "ACTIVO" | "INACTIVO";
};
export type DetalleGrupo = Omit<ResumenGrupo, "totalEstudiantes"> & { estudiantes: EstudianteGrupo[] };

export function ordenarBloques<T extends Bloque>(bloques: T[]): T[] {
  return [...bloques].sort(
    (a, b) => ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia) || a.horaInicio.localeCompare(b.horaInicio),
  );
}

const noEncontrado = () => new ErrorDominio("NO_ENCONTRADO", "El grupo no existe o no está a tu cargo.", 404);

export function crearServicioMiCurso(db: PrismaClient) {
  /** Asignaciones ACTIVAS del docente en el año ACTIVO (opcionalmente de un grupo). */
  function asignaciones(docenteId: string, grupoId?: string) {
    return db.asignacionDocente.findMany({
      where: {
        docenteId,
        estado: "ACTIVA",
        anioLectivo: { estado: "ACTIVO" },
        ...(grupoId ? { grupoId } : {}),
      },
      select: {
        id: true,
        asignatura: { select: { nombre: true, area: { select: { nombre: true } } } },
        bloques: { select: { dia: true, horaInicio: true, horaFin: true } },
        grupo: {
          select: {
            id: true,
            identificador: true,
            grado: { select: { nombre: true, orden: true } },
            anioLectivo: { select: { anio: true } },
          },
        },
      },
    });
  }

  type Fila = Awaited<ReturnType<typeof asignaciones>>[number];

  function agrupar(filas: Fila[]) {
    const grupos = new Map<string, Omit<ResumenGrupo, "totalEstudiantes"> & { orden: number }>();
    for (const a of filas) {
      const g = a.grupo;
      let grupo = grupos.get(g.id);
      if (!grupo) {
        grupo = {
          id: g.id,
          etiqueta: etiquetaGrupo(g.grado.nombre, g.identificador),
          anio: g.anioLectivo.anio,
          orden: g.grado.orden,
          asignaturas: [],
        };
        grupos.set(g.id, grupo);
      }
      grupo.asignaturas.push({
        asignacionId: a.id,
        asignatura: a.asignatura.nombre,
        area: a.asignatura.area.nombre,
        bloques: ordenarBloques(a.bloques as Bloque[]),
      });
    }
    return [...grupos.values()]
      .sort((x, y) => x.orden - y.orden || x.etiqueta.localeCompare(y.etiqueta))
      .map((g) => ({
        id: g.id,
        etiqueta: g.etiqueta,
        anio: g.anio,
        asignaturas: g.asignaturas.sort((x, y) => x.asignatura.localeCompare(y.asignatura, "es")),
      }));
  }

  return {
    /** Grupos asignados al docente con sus asignaturas, bloques y conteo de estudiantes vigentes. */
    async listarGrupos(docenteId: string): Promise<ResumenGrupo[]> {
      const grupos = agrupar(await asignaciones(docenteId));
      if (grupos.length === 0) return [];
      const conteos = await db.asociacionEstudianteGrupo.groupBy({
        by: ["grupoId"],
        where: { grupoId: { in: grupos.map((g) => g.id) }, finEn: null },
        _count: { _all: true },
      });
      const porGrupo = new Map(conteos.map((c) => [c.grupoId, c._count._all]));
      return grupos.map((g) => ({ ...g, totalEstudiantes: porGrupo.get(g.id) ?? 0 }));
    },

    /**
     * Detalle de un grupo asignado. Inexistente o ajeno → el mismo 404, sin
     * consultar estudiantes: no se revela si el grupo existe.
     */
    async obtenerGrupo(docenteId: string, grupoId: string): Promise<DetalleGrupo> {
      if (!grupoId || grupoId.length > 64) throw noEncontrado();
      const [grupo] = agrupar(await asignaciones(docenteId, grupoId));
      if (!grupo) throw noEncontrado();
      const asociaciones = await db.asociacionEstudianteGrupo.findMany({
        where: { grupoId, finEn: null },
        select: {
          estudiante: { select: { id: true, nombres: true, apellidos: true, correo: true, estado: true } },
        },
      });
      const estudiantes = asociaciones
        .map((a) => a.estudiante)
        .sort(
          (a, b) =>
            a.apellidos.localeCompare(b.apellidos, "es") ||
            a.nombres.localeCompare(b.nombres, "es") ||
            a.correo.localeCompare(b.correo),
        );
      return { ...grupo, estudiantes };
    },
  };
}

export type ServicioMiCurso = ReturnType<typeof crearServicioMiCurso>;
