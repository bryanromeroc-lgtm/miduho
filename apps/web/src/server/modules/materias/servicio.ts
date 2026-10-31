/**
 * «Mis materias» del ESTUDIANTE (rediseño identidad juvenil, D3).
 *
 * Asignaturas distintas con al menos una asignación docente ACTIVA en el grupo
 * vigente del estudiante y en el año ACTIVO, ordenadas por el orden del área y
 * luego por nombre. Nunca expone datos de docentes ni de otros estudiantes:
 * la consulta solo selecciona la asignatura y su área.
 */
import type { PrismaClient } from "@/generated/prisma/client";
import { escenaDe, type Escena } from "@/lib/escenas";
import type { MisMaterias } from "@/lib/materias";
import { etiquetaGrupo } from "@/lib/navegacion";
import { contenidoSinFuente, desempenoSinFuente, type PuertoContenidoClase, type PuertoDesempeno } from "./puertos";

export type { MisMaterias, ResumenMateria } from "@/lib/materias";

/**
 * Destino del botón de jugar. 🔶 Provisional: la vista de clase aún usa datos
 * de demostración, así que cada materia apunta a donde hoy vive su contenido
 * real; el resto, a «Mis clases».
 */
export function rutaMateria(escena: Escena): string {
  if (escena === "robotica") return "/laboratorios?mundo=robotica";
  if (escena === "emprendimiento") return "/laboratorios?mundo=emprendimiento";
  if (escena === "lectura") return "/biblioteca";
  return "/clases";
}

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
  puertos: { desempeno?: PuertoDesempeno; contenido?: PuertoContenidoClase } = {},
) {
  const desempeno = puertos.desempeno ?? desempenoSinFuente;
  const contenido = puertos.contenido ?? contenidoSinFuente;

  return {
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
            claseHref: rutaMateria(escena),
            estrellas: d?.estrellas ?? null,
            avance: d?.avance ?? null,
            sigue: d?.sigue ?? null,
            nuevo: c?.nuevo ?? null,
            conMaterial: c?.conMaterial ?? null,
          };
        }),
      };
    },
  };
}

export type ServicioMaterias = ReturnType<typeof crearServicioMaterias>;
