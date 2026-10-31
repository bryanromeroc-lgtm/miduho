/**
 * Contrato de «Mis materias» (D3), compartido por el servidor que lo arma y
 * la interfaz que lo pinta. Los campos de progreso y material son opcionales:
 * en null, el cromo los omite. Nunca se rellenan con valores de ejemplo.
 */
import type { Escena } from "./escenas";

export type Estrellas = 0 | 1 | 2 | 3;

export type ResumenMateria = {
  id: string;
  nombre: string;
  area: { nombre: string; orden: number | null };
  escena: Escena;
  claseHref: string;
  estrellas: Estrellas | null;
  avance: { hechas: number; total: number } | null;
  sigue: string | null;
  nuevo: boolean | null;
  conMaterial: boolean | null;
};

export type MisMaterias = {
  grupo: { id: string; etiqueta: string } | null;
  materias: ResumenMateria[];
};

/** Qué partes muestra un cromo según los campos que traen valor. */
export type PartesCromo = {
  sigue: boolean;
  avance: boolean;
  estrellas: boolean;
  invitacion: boolean;
  preparacion: boolean;
  jugar: boolean;
  nuevo: boolean;
  dominada: boolean;
};

export function partesDelCromo(m: Pick<ResumenMateria, "sigue" | "avance" | "estrellas" | "nuevo" | "conMaterial">): PartesCromo {
  const preparacion = m.conMaterial === false;
  const sigue = !preparacion && !!m.sigue?.trim();
  const avance = !preparacion && m.avance !== null && m.avance.total > 0;
  const estrellas = !preparacion && m.estrellas !== null;
  return {
    sigue,
    avance,
    estrellas,
    invitacion: !preparacion && !sigue && !avance && !estrellas,
    preparacion,
    jugar: !preparacion,
    nuevo: m.nuevo === true && !preparacion,
    dominada: !preparacion && m.estrellas === 3,
  };
}

/** Nombre accesible del botón que elige el cromo. */
export function etiquetaElegir(m: Pick<ResumenMateria, "nombre" | "sigue" | "estrellas" | "conMaterial">): string {
  const partes = [`Elegir ${m.nombre}`];
  if (m.conMaterial === false) partes.push("sin material todavía");
  else {
    if (m.estrellas !== null) partes.push(`${m.estrellas} de 3 estrellas`);
    if (m.sigue?.trim()) partes.push(`sigue con ${m.sigue.trim()}`);
  }
  return partes.join(", ");
}

/** Total «mis estrellas» del encabezado; null (se oculta) si ninguna materia tiene datos. */
export function totalEstrellas(materias: Pick<ResumenMateria, "estrellas">[]): number | null {
  const conDatos = materias.filter((m) => m.estrellas !== null);
  return conDatos.length ? conDatos.reduce((t, m) => t + (m.estrellas ?? 0), 0) : null;
}
