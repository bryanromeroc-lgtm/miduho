/**
 * Estrellas a partir del porcentaje que entrega `fundacion-actividades`.
 * Solo presentación: no es la nota oficial. 🔶 Umbrales provisionales hasta
 * que el colegio entregue su SIEE; viven solo aquí.
 */
import type { Estrellas } from "./materias";

export const UMBRALES_ESTRELLAS = { dos: 60, tres: 90 } as const;

/** null = sin intentos enviados → 0 estrellas. */
export function estrellasDe(porcentaje: number | null | undefined): Estrellas {
  if (porcentaje == null || Number.isNaN(porcentaje)) return 0;
  if (porcentaje >= UMBRALES_ESTRELLAS.tres) return 3;
  if (porcentaje >= UMBRALES_ESTRELLAS.dos) return 2;
  return 1;
}

/**
 * Estrellas de una materia: promedio de los porcentajes de los mejores
 * intentos de las actividades que cuentan como nota. Sin actividades
 * calificadas, null (el cromo no muestra estrellas).
 */
export function estrellasDeMateria(mejoresPorcentajes: number[]): Estrellas | null {
  if (mejoresPorcentajes.length === 0) return null;
  const promedio = mejoresPorcentajes.reduce((t, p) => t + p, 0) / mejoresPorcentajes.length;
  return estrellasDe(promedio);
}
