/**
 * Tarjetas de la ruta de configuración de /admin/estructura. Puro: convierte
 * los conteos del colegio en el estado de cada paso, para que la administración
 * vea de un vistazo qué falta antes de abrir una sección.
 *
 * El orden importa: sin año no hay períodos ni grupos; sin grados no hay
 * grupos ni asignaturas habilitadas; sin áreas no hay asignaturas.
 */
import type { Clave } from "./consulta";

export type Conteos = {
  anios: number;
  /** Año lectivo activo, si existe. */
  anioActivo: number | null;
  /** Períodos y suma de ponderaciones del año activo. */
  periodosActivo: number;
  ponderacionActivo: number;
  areas: number;
  grados: number;
  /** Grupos del año activo y cuántos no tienen director. */
  gruposActivo: number;
  gruposSinDirector: number;
  asignaturas: number;
  asignaturasSinGrado: number;
};

/** `listo`: completo · `atencion`: existe pero le falta algo · `pendiente`: vacío. */
export type EstadoPaso = "listo" | "atencion" | "pendiente";
export type Paso = { clave: Clave; titulo: string; cifra: string; detalle: string; estado: EstadoPaso };

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
/** Ponderación con hasta dos decimales y coma decimal (es-CO). */
const porcentaje = (n: number) => `${Number(n.toFixed(2)).toLocaleString("es-CO")} %`;

export function pasosEstructura(c: Conteos): Paso[] {
  const sinAnio = c.anioActivo === null;
  const suma = Math.round(c.ponderacionActivo * 100) / 100;
  return [
    {
      clave: "anios", titulo: "Años lectivos", cifra: plural(c.anios, "año", "años"),
      estado: sinAnio ? "pendiente" : "listo",
      detalle: sinAnio ? "Crea el año lectivo para empezar." : `${c.anioActivo} es el año activo.`,
    },
    {
      clave: "periodos", titulo: "Períodos", cifra: plural(c.periodosActivo, "período", "períodos"),
      estado: sinAnio || c.periodosActivo === 0 ? "pendiente" : suma === 100 ? "listo" : "atencion",
      detalle: sinAnio ? "Primero crea un año lectivo." : c.periodosActivo === 0 ? `El año ${c.anioActivo} aún no tiene períodos.`
        : suma === 100 ? `Suman 100 % en ${c.anioActivo}.` : `Suman ${porcentaje(suma)}; deben sumar 100 % para cerrar el año.`,
    },
    {
      clave: "areas", titulo: "Áreas", cifra: plural(c.areas, "área", "áreas"),
      estado: c.areas === 0 ? "pendiente" : "listo",
      detalle: c.areas === 0 ? "Crea las áreas que agrupan las asignaturas." : "Agrupan las asignaturas del plan de estudios.",
    },
    {
      clave: "grados", titulo: "Grados", cifra: plural(c.grados, "grado", "grados"),
      estado: c.grados === 0 ? "pendiente" : "listo",
      detalle: c.grados === 0 ? "Crea los grados que ofrece el colegio." : "Niveles y orden curricular definidos.",
    },
    {
      clave: "grupos", titulo: "Grupos", cifra: plural(c.gruposActivo, "grupo", "grupos"),
      estado: sinAnio || c.gruposActivo === 0 ? "pendiente" : c.gruposSinDirector > 0 ? "atencion" : "listo",
      detalle: sinAnio ? "Primero crea un año lectivo." : c.gruposActivo === 0 ? `El año ${c.anioActivo} aún no tiene grupos.`
        : c.gruposSinDirector > 0 ? `${plural(c.gruposSinDirector, "grupo", "grupos")} sin director.` : "Todos tienen director de grupo.",
    },
    {
      clave: "asignaturas", titulo: "Asignaturas", cifra: plural(c.asignaturas, "asignatura", "asignaturas"),
      estado: c.asignaturas === 0 ? "pendiente" : c.asignaturasSinGrado > 0 ? "atencion" : "listo",
      detalle: c.asignaturas === 0 ? "Crea las asignaturas y habilítalas por grado."
        : c.asignaturasSinGrado > 0 ? `${plural(c.asignaturasSinGrado, "asignatura", "asignaturas")} sin grado habilitado.` : "Todas están habilitadas en algún grado.",
    },
  ];
}

export const TEXTO_ESTADO: Record<EstadoPaso, string> = { listo: "Listo", atencion: "Revisar", pendiente: "Pendiente" };
