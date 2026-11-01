/**
 * Puertos de los datos que «Mis materias» todavía no tiene (D3).
 *
 * Hoy los dos adaptadores están vacíos: devuelven un mapa sin entradas y el
 * servicio deja esos campos en null, de modo que el cromo los omite y nunca
 * muestra cifras inventadas. Cuando exista la fuente real se conecta aquí,
 * sin tocar el servicio ni la interfaz.
 */

import type { ActividadResumen, Estrellas } from "@/lib/materias";

/** Desempeño del estudiante en una asignatura. Lo alimentará `fundacion-actividades`. */
export type DesempenoMateria = {
  /** Promedio de los mejores intentos de las actividades que cuentan como nota, en estrellas. */
  estrellas: Estrellas | null;
  /** Actividades con al menos un intento enviado frente a las asignadas abiertas o cerradas. */
  avance: { hechas: number; total: number } | null;
  /** Título de la primera actividad abierta sin intento, por fecha de cierre. */
  sigue: string | null;
};

export interface PuertoDesempeno {
  /** Desempeño por asignatura; las asignaturas sin datos no aparecen en el mapa. */
  porAsignatura(estudianteId: string, asignaturaIds: string[]): Promise<Map<string, DesempenoMateria>>;
}

/** Estado del contenido asociado a la clase (asignatura · grupo). */
export type ContenidoMateria = {
  /** false: la docente aún no publica material («en preparación»). */
  conMaterial: boolean | null;
  /** Material liberado recientemente y no abierto 🔶 (definición pendiente). */
  nuevo: boolean | null;
};

export interface PuertoContenidoClase {
  porAsignatura(grupoId: string, asignaturaIds: string[]): Promise<Map<string, ContenidoMateria>>;
}

/** Sin `fundacion-actividades`: no hay estrellas, avance ni «Sigue con». */
export const desempenoSinFuente: PuertoDesempeno = {
  porAsignatura: async () => new Map(),
};

/** Sin contenido por clase: ni «¡Nuevo!» ni «en preparación». */
export const contenidoSinFuente: PuertoContenidoClase = {
  porAsignatura: async () => new Map(),
};

/** Actividades asignadas al estudiante en una asignatura de su grupo. Lo alimentará `fundacion-actividades`. */
export interface PuertoActividadesDeMateria {
  /** null = fuente aún no conectada; [] = sin asignaciones. */
  deMateria(estudianteId: string, grupoId: string, asignaturaId: string): Promise<ActividadResumen[] | null>;
}

/** Sin `fundacion-actividades`: la vista muestra «Aún no hay actividades», nunca actividades inventadas. */
export const actividadesSinFuente: PuertoActividadesDeMateria = {
  deMateria: async () => null,
};

/** Dónde vive el currículo: nombre de la asignatura y orden del grado → actividades del catálogo. */
export type FuenteCatalogo = {
  de(asignatura: string, grado: number): { slug: string; titulo: string; tipo: string }[];
};

type ConsultaCatalogo = {
  asignatura: { findUnique(a: { where: { id: string }; select: { nombre: true } }): Promise<{ nombre: string } | null> };
  grupo: {
    findUnique(a: { where: { id: string }; select: { grado: { select: { orden: true } } } }): Promise<{ grado: { orden: number } } | null>;
  };
};

/*
  🔶 Práctica libre: mientras no exista la asignación de la docente
  (fundacion-actividades, 4.x), cada actividad del currículo de la asignatura
  y del grado del grupo se muestra «para jugar», sin fechas ni límite de
  intentos, y nada se guarda. Al llegar 5.8, este adaptador se reemplaza por
  el de «mis actividades» sin tocar la vista.
*/
export function actividadesDeCatalogo(db: ConsultaCatalogo, catalogo: FuenteCatalogo): PuertoActividadesDeMateria {
  return {
    async deMateria(_estudianteId, grupoId, asignaturaId) {
      const [asignatura, grupo] = await Promise.all([
        db.asignatura.findUnique({ where: { id: asignaturaId }, select: { nombre: true } }),
        db.grupo.findUnique({ where: { id: grupoId }, select: { grado: { select: { orden: true } } } }),
      ]);
      if (!asignatura || !grupo) return [];
      return catalogo.de(asignatura.nombre, grupo.grado.orden).map((a) => ({
        id: a.slug,
        titulo: a.titulo,
        tipo: a.tipo,
        estado: "disponible",
        estrellas: null,
        intentosUsados: 0,
        intentosMax: null,
        abre: null,
        cierra: null,
        href: `/materias/${encodeURIComponent(asignaturaId)}/actividades/${encodeURIComponent(a.slug)}`,
      }));
    },
  };
}
