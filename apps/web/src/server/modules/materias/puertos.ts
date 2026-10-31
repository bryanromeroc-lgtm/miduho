/**
 * Puertos de los datos que «Mis materias» todavía no tiene (D3).
 *
 * Hoy los dos adaptadores están vacíos: devuelven un mapa sin entradas y el
 * servicio deja esos campos en null, de modo que el cromo los omite y nunca
 * muestra cifras inventadas. Cuando exista la fuente real se conecta aquí,
 * sin tocar el servicio ni la interfaz.
 */

import type { Estrellas } from "@/lib/materias";

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
