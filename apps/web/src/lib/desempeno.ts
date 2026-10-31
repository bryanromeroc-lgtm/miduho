/**
 * Textos y reglas de presentación del desempeño: intentos y resultado.
 * Solo presentación (la nota la calcula `fundacion-actividades`). Nunca
 * compara con otros estudiantes ni habla de fracaso.
 */
import type { Estrellas } from "./materias";

export const INTENTOS_MAXIMOS = 3;

export function intentosDisponibles(usados: number, maximo = INTENTOS_MAXIMOS): number {
  return Math.max(0, maximo - Math.max(0, usados));
}

function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`;
}

export function textoDisponibles(usados: number, maximo = INTENTOS_MAXIMOS): string {
  const quedan = intentosDisponibles(usados, maximo);
  return quedan === 0 ? "Sin intentos disponibles" : `${plural(quedan, "intento disponible", "intentos disponibles")}`;
}

/** Forma textual accesible de la tarjeta: «2 de 3 estrellas · 1 intento disponible». */
export function resumenActividad(mejor: Estrellas | null, usados: number, maximo = INTENTOS_MAXIMOS): string {
  const estrellas = mejor === null ? "Sin intentos todavía" : `${mejor} de 3 estrellas`;
  return `${estrellas} · ${textoDisponibles(usados, maximo)}`;
}

export type Resultado = {
  /** Estrellas de este intento. */
  estrellas: Estrellas;
  /** Mejor resultado antes de este intento; null si es el primero. */
  mejorAnterior: Estrellas | null;
  /** Intentos usados contando este. */
  usados: number;
  maximo?: number;
  /** La materia queda con 3 estrellas tras este intento. */
  materiaDominada?: boolean;
};

export type LecturaResultado = {
  titulo: string;
  mejora: boolean;
  detalle: string;
  quedan: number;
  puedeReintentar: boolean;
  cromoBrilla: boolean;
};

export function leerResultado(r: Resultado): LecturaResultado {
  const maximo = r.maximo ?? INTENTOS_MAXIMOS;
  const quedan = intentosDisponibles(r.usados, maximo);
  const mejora = r.mejorAnterior === null || r.estrellas > r.mejorAnterior;
  const titulo = mejora
    ? r.mejorAnterior === null
      ? "¡Lo lograste!"
      : "¡Superaste tu mejor resultado!"
    : "¡Buen intento!";
  const detalle = mejora
    ? `Ganaste ${plural(r.estrellas, "estrella", "estrellas")}.`
    : `Esta vez ${r.estrellas === 1 ? "fue" : "fueron"} ${plural(r.estrellas, "estrella", "estrellas")}. Se conserva tu mejor resultado: ${plural(r.mejorAnterior ?? 0, "estrella", "estrellas")}.`;
  return {
    titulo,
    mejora,
    detalle,
    quedan,
    puedeReintentar: quedan > 0,
    cromoBrilla: mejora && !!r.materiaDominada,
  };
}
