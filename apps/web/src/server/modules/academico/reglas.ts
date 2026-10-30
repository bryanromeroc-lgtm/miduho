/**
 * Reglas de negocio puras de la estructura académica (sin base de datos).
 * Fuente: docs/modelo-de-entidades.md §4.2 y §6.
 */

export interface Rango {
  fechaInicio: Date;
  fechaFin: Date;
}

/** Fin estrictamente posterior al inicio. */
export function rangoValido(r: Rango): boolean {
  return r.fechaFin.getTime() > r.fechaInicio.getTime();
}

/** `interno` queda completamente dentro de `externo` (bordes incluidos). */
export function dentroDe(interno: Rango, externo: Rango): boolean {
  return (
    interno.fechaInicio.getTime() >= externo.fechaInicio.getTime() &&
    interno.fechaFin.getTime() <= externo.fechaFin.getTime()
  );
}

/** Dos rangos se solapan si comparten al menos un día (bordes incluidos). RN-02. */
export function seSolapan(a: Rango, b: Rango): boolean {
  return (
    a.fechaInicio.getTime() <= b.fechaFin.getTime() &&
    b.fechaInicio.getTime() <= a.fechaFin.getTime()
  );
}

/** Ponderaciones en centésimas para evitar errores de coma flotante. */
const aCentesimas = (n: number) => Math.round(n * 100);

/** Suma de ponderaciones (porcentaje) redondeada a 2 decimales. */
export function sumaPonderaciones(ponderaciones: number[]): number {
  return ponderaciones.reduce((s, p) => s + aCentesimas(p), 0) / 100;
}

/**
 * RN-06: la suma anual debe ser 100 %. Mientras se configuran los períodos
 * se permite una suma parcial ≤ 100; nunca se permite superarla.
 */
export function ponderacionExcede(ponderaciones: number[]): boolean {
  return ponderaciones.reduce((s, p) => s + aCentesimas(p), 0) > 100 * 100;
}

export function ponderacionCompleta(ponderaciones: number[]): boolean {
  return ponderaciones.reduce((s, p) => s + aCentesimas(p), 0) === 100 * 100;
}
