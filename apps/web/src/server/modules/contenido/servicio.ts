/**
 * «Contenido pedagógico» de la coordinadora (vista-admin-contenido, D2).
 *
 * Solo lecturas: áreas, asignaturas, grados y `AsignaturaGrado` de la base, y
 * el conteo de actividades del catálogo del currículo. No mira grupos,
 * estudiantes, docentes ni intentos. La autorización ADMIN la hace cada
 * página antes de llamar (`exigirRolPagina`).
 *
 * 🔶 Mientras `actividades-en-clase` no lleve el catálogo a la base, la
 * fuente es `curriculo/actividades/` en git.
 */
import type { PrismaClient } from "@/generated/prisma/client";
import {
  rutaActividadPrevia,
  rutaVistaPrevia,
  type AreaContenido,
  type CeldaContenido,
  type GradoContenido,
  type IndiceContenido,
  type VistaPreviaMateria,
} from "@/lib/contenido";
import { escenaDe } from "@/lib/escenas";
import type { ActividadResumen, ResumenMateria } from "@/lib/materias";
import { carpetaAsignatura, type ActividadDeCatalogo, type Catalogo } from "@/server/modules/curriculo/catalogo";

export type FuenteContenido = Pick<Catalogo, "de" | "una"> & Partial<Pick<Catalogo, "todas">>;

const porNombre = (a: { nombre: string }, b: { nombre: string }) => a.nombre.localeCompare(b.nombre, "es");

/** Áreas por su orden (las que no tienen, al final) y luego por nombre. */
export function ordenarAreas<T extends { nombre: string; orden: number | null }>(areas: T[]): T[] {
  return [...areas].sort(
    (a, b) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER) || porNombre(a, b),
  );
}

/** «5» → 5; cualquier otra cosa (vacío, «5a», «0», «-1») → null. */
export function ordenDeGrado(texto: string): number | null {
  return /^[1-9]\d{0,2}$/.test(texto) ? Number(texto) : null;
}

export function crearServicioContenido(db: PrismaClient, catalogo: FuenteContenido) {
  const grados = async (): Promise<GradoContenido[]> =>
    db.grado.findMany({ select: { id: true, nombre: true, orden: true }, orderBy: { orden: "asc" } });

  /** La asignatura y el grado, solo si la asignatura se dicta en ese grado. */
  async function asignaturaEnGrado(asignaturaId: string, gradoTexto: string) {
    const orden = ordenDeGrado(gradoTexto);
    if (orden === null) return null;
    const [asignatura, grado] = await Promise.all([
      db.asignatura.findUnique({
        where: { id: asignaturaId },
        select: { id: true, nombre: true, area: { select: { nombre: true, orden: true } }, grados: { select: { gradoId: true } } },
      }),
      db.grado.findUnique({ where: { orden }, select: { id: true, nombre: true, orden: true } }),
    ]);
    if (!asignatura || !grado || !asignatura.grados.some((g) => g.gradoId === grado.id)) return null;
    return { asignatura, grado };
  }

  function vista(
    asignatura: { id: string; nombre: string; area: { nombre: string; orden: number | null } },
    grado: GradoContenido,
  ): VistaPreviaMateria {
    const materia: ResumenMateria = {
      id: asignatura.id,
      nombre: asignatura.nombre,
      area: asignatura.area,
      escena: escenaDe(asignatura.nombre, asignatura.area.nombre),
      claseHref: rutaVistaPrevia(asignatura.id, grado.orden),
      estrellas: null,
      avance: null,
      sigue: null,
      nuevo: null,
      conMaterial: null,
    };
    const actividades = catalogo
      .de(asignatura.nombre, grado.orden)
      .map(
        (a): ActividadResumen => ({
          id: a.slug,
          titulo: a.titulo,
          tipo: a.tipo,
          ...(a.imagen ? { imagen: a.imagen } : {}),
          estado: "disponible",
          estrellas: null,
          intentosUsados: 0,
          intentosMax: null,
          abre: null,
          cierra: null,
          href: rutaActividadPrevia(asignatura.id, grado.orden, a.slug),
        }),
      )
      .sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
    return { materia, grado, actividades };
  }

  return {
    /** Todas las áreas con sus asignaturas y una celda por cada grado del colegio. */
    async indice(): Promise<IndiceContenido> {
      const [lista, areas] = await Promise.all([
        grados(),
        db.area.findMany({
          select: {
            id: true,
            nombre: true,
            orden: true,
            asignaturas: { select: { id: true, nombre: true, grados: { select: { gradoId: true } } } },
          },
        }),
      ]);
      const resultado: AreaContenido[] = ordenarAreas(areas).map((area) => ({
        id: area.id,
        nombre: area.nombre,
        asignaturas: [...area.asignaturas].sort(porNombre).map((asig) => {
          const dicta = new Set(asig.grados.map((g) => g.gradoId));
          const celdas = lista.map((grado): CeldaContenido => {
            if (!dicta.has(grado.id)) return { estado: "no-se-dicta" };
            const href = rutaVistaPrevia(asig.id, grado.orden);
            const n = catalogo.de(asig.nombre, grado.orden).length;
            return n > 0 ? { estado: "con-contenido", actividades: n, href } : { estado: "sin-contenido", href };
          });
          return { id: asig.id, nombre: asig.nombre, celdas };
        }),
      }));

      // Riesgo del design: una carpeta del currículo sin asignatura cuyo nombre normalice igual.
      if (process.env.NODE_ENV === "development" && catalogo.todas) {
        const conocidas = new Set(areas.flatMap((a) => a.asignaturas.map((s) => carpetaAsignatura(s.nombre))));
        const huerfanas = [...new Set(catalogo.todas().map((a) => a.asignatura))].filter((c) => !conocidas.has(c));
        if (huerfanas.length) console.warn(`[contenido] Carpetas del currículo sin asignatura en la base: ${huerfanas.join(", ")}`);
      }
      return { grados: lista, areas: resultado };
    },

    /** Vista previa de una asignatura en un grado; null (404) si no existe o no se dicta ahí. */
    async materia(asignaturaId: string, grado: string): Promise<VistaPreviaMateria | null> {
      const r = await asignaturaEnGrado(asignaturaId, grado);
      return r && vista(r.asignatura, r.grado);
    },

    /** Una actividad del currículo de esa asignatura y grado; null (404) si no es de ellos. */
    async actividad(
      asignaturaId: string,
      grado: string,
      slug: string,
    ): Promise<{ vista: VistaPreviaMateria; actividad: ActividadDeCatalogo } | null> {
      const r = await asignaturaEnGrado(asignaturaId, grado);
      if (!r) return null;
      const actividad = catalogo.una(r.asignatura.nombre, r.grado.orden, slug);
      return actividad ? { vista: vista(r.asignatura, r.grado), actividad } : null;
    },
  };
}

export type ServicioContenido = ReturnType<typeof crearServicioContenido>;
