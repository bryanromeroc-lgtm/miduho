/**
 * «Mis materias» del ESTUDIANTE (rediseño identidad juvenil, D3).
 *
 * Asignaturas distintas con al menos una asignación docente ACTIVA en el grupo
 * vigente del estudiante y en el año ACTIVO, ordenadas por el orden del área y
 * luego por nombre. Nunca expone datos de docentes ni de otros estudiantes:
 * la consulta solo selecciona la asignatura y su área.
 */
import type { PrismaClient } from "@/generated/prisma/client";
import { escenaDe } from "@/lib/escenas";
import { ordenarActividades, type MisMaterias, type VistaMateria } from "@/lib/materias";
import { etiquetaGrupo } from "@/lib/navegacion";
import {
  actividadesSinFuente,
  contenidoSinFuente,
  desempenoSinFuente,
  type PuertoActividadesDeMateria,
  type PuertoContenidoClase,
  type PuertoDesempeno,
} from "./puertos";

export type { MisMaterias, ResumenMateria } from "@/lib/materias";

/** Destino del botón de jugar: la vista propia de la materia (vistas-de-materia, D9). */
export function rutaMateria(asignaturaId: string): string {
  return `/materias/${encodeURIComponent(asignaturaId)}`;
}

/** Regreso a «Mis materias» con la misma materia elegida. */
export function rutaVolver(asignaturaId: string): string {
  return `/?materia=${encodeURIComponent(asignaturaId)}`;
}

type SesionMinima = { user?: { id?: string | null; contexto?: string | null } | null } | null;

type Fila = { id: string; nombre: string; area: { nombre: string; orden: number | null } };

export function ordenarMaterias<T extends Fila>(filas: T[]): T[] {
  return [...filas].sort(
    (a, b) =>
      (a.area.orden ?? Number.MAX_SAFE_INTEGER) - (b.area.orden ?? Number.MAX_SAFE_INTEGER) ||
      a.nombre.localeCompare(b.nombre, "es"),
  );
}

export function crearServicioMaterias(
  db: PrismaClient,
  puertos: { desempeno?: PuertoDesempeno; contenido?: PuertoContenidoClase; actividades?: PuertoActividadesDeMateria } = {},
) {
  const desempeno = puertos.desempeno ?? desempenoSinFuente;
  const contenido = puertos.contenido ?? contenidoSinFuente;
  const actividades = puertos.actividades ?? actividadesSinFuente;

  const servicio = {
    async deEstudiante(estudianteId: string): Promise<MisMaterias> {
      const asociacion = await db.asociacionEstudianteGrupo.findFirst({
        where: {
          estudianteId,
          finEn: null,
          anioLectivo: { estado: "ACTIVO" },
          grupo: { anioLectivo: { estado: "ACTIVO" } },
        },
        orderBy: { inicioEn: "desc" },
        select: {
          grupo: { select: { id: true, identificador: true, anioLectivoId: true, grado: { select: { nombre: true } } } },
        },
      });
      if (!asociacion) return { grupo: null, materias: [] };
      const { grupo } = asociacion;

      const asignaciones = await db.asignacionDocente.findMany({
        where: { grupoId: grupo.id, anioLectivoId: grupo.anioLectivoId, estado: "ACTIVA" },
        select: { asignatura: { select: { id: true, nombre: true, area: { select: { nombre: true, orden: true } } } } },
      });
      const unicas = new Map<string, Fila>();
      for (const { asignatura } of asignaciones) unicas.set(asignatura.id, asignatura);
      const filas = ordenarMaterias([...unicas.values()]);

      const ids = filas.map((f) => f.id);
      const [porDesempeno, porContenido] = await Promise.all([
        desempeno.porAsignatura(estudianteId, ids),
        contenido.porAsignatura(grupo.id, ids),
      ]);

      return {
        grupo: { id: grupo.id, etiqueta: etiquetaGrupo(grupo.grado.nombre, grupo.identificador) },
        materias: filas.map((f) => {
          const escena = escenaDe(f.nombre, f.area.nombre);
          const d = porDesempeno.get(f.id);
          const c = porContenido.get(f.id);
          return {
            id: f.id,
            nombre: f.nombre,
            area: { nombre: f.area.nombre, orden: f.area.orden },
            escena,
            claseHref: rutaMateria(f.id),
            estrellas: d?.estrellas ?? null,
            avance: d?.avance ?? null,
            sigue: d?.sigue ?? null,
            nuevo: c?.nuevo ?? null,
            conMaterial: c?.conMaterial ?? null,
          };
        }),
      };
    },

    /**
     * Vista de una asignatura (vistas-de-materia, D3). null —la ruta responde
     * 404— si la sesión no es ESTUDIANTE o la asignatura no tiene asignación
     * ACTIVA en su grupo vigente. Reusa el tablero, así que no expone más de
     * lo que ya ve en «Mis materias».
     */
    async vistaMateria(sesion: SesionMinima, asignaturaId: string): Promise<VistaMateria | null> {
      const id = sesion?.user?.id;
      if (!id || sesion.user?.contexto !== "ESTUDIANTE") return null;
      const { grupo, materias } = await servicio.deEstudiante(id);
      const materia = materias.find((m) => m.id === asignaturaId);
      if (!grupo || !materia) return null;
      const lista = await actividades.deMateria(id, grupo.id, materia.id);
      return { materia, grupo, actividades: lista && ordenarActividades(lista) };
    },
  };
  return servicio;
}

export type ServicioMaterias = ReturnType<typeof crearServicioMaterias>;
