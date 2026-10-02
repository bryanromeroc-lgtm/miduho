/**
 * Estado de búsqueda, filtros y paginación de /admin/estructura en la URL.
 * Cada listado usa parámetros con prefijo propio (`periodos-q`, `grupos-grado`,
 * `asignaturas-page`…) para que avanzar en uno conserve los filtros de los demás.
 */
import type { z } from "zod";
import * as E from "@/server/modules/academico/esquemas";

export const CLAVES = ["anios", "periodos", "areas", "grados", "grupos", "asignaturas"] as const;
export type Clave = (typeof CLAVES)[number];

const ESQUEMAS = {
  anios: E.filtroAnios,
  periodos: E.filtroPeriodos,
  areas: E.paginacion,
  grados: E.paginacion,
  grupos: E.filtroGrupos,
  asignaturas: E.filtroAsignaturas,
} as const;

export type Filtros = { [K in Clave]: z.output<(typeof ESQUEMAS)[K]> };
type Relacion = "anioLectivoId" | "gradoId" | "areaId";

/** Sufijo legible en la URL para cada filtro de relación. */
const SUFIJO: Record<Relacion, string> = { anioLectivoId: "anio", gradoId: "grado", areaId: "area" };
/** Filtros de relación admitidos por cada listado (§7, §11). */
export const RELACIONES: Record<Clave, Relacion[]> = {
  anios: [],
  periodos: ["anioLectivoId"],
  areas: [],
  grados: [],
  grupos: ["anioLectivoId", "gradoId"],
  asignaturas: ["areaId", "gradoId"],
};
const CATALOGO_DE: Record<Relacion, keyof Catalogo> = { anioLectivoId: "anios", gradoId: "grados", areaId: "areas" };
const NOMBRE_RELACION: Record<Relacion, string> = { anioLectivoId: "año", gradoId: "grado", areaId: "área" };

export type Catalogo = { anios: Set<string>; grados: Set<string>; areas: Set<string> };
type Busqueda = Record<string, string | string[] | undefined>;

export const nombreParametro = (clave: Clave, campo: "q" | "page" | Relacion) =>
  `${clave}-${campo === "q" || campo === "page" ? campo : SUFIJO[campo]}`;

const primero = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Valida la consulta de cada listado. Una entrada inválida (página no numérica,
 * año mal escrito, búsqueda demasiado larga o un ID que no está entre las
 * opciones) produce un mensaje y deja ese listado con el filtro seguro por defecto.
 */
export function leerConsulta(sp: Busqueda, catalogo: Catalogo) {
  const filtros = {} as Record<Clave, unknown>;
  const errores: Partial<Record<Clave, string>> = {};
  for (const clave of CLAVES) {
    const entrada: Record<string, string> = {
      q: primero(sp[nombreParametro(clave, "q")]),
      page: primero(sp[nombreParametro(clave, "page")]) || "1",
    };
    for (const r of RELACIONES[clave]) entrada[r] = primero(sp[nombreParametro(clave, r)]);
    const esquema = ESQUEMAS[clave];
    const r = esquema.safeParse(entrada);
    const seguro = esquema.parse({});
    if (!r.success) {
      const detalle = [...new Set(r.error.issues.map((i) => i.message))].join(" ");
      errores[clave] = `${detalle} Se muestra el listado sin filtros.`;
      filtros[clave] = seguro;
      continue;
    }
    const datos = r.data as Record<string, unknown>;
    const ajena = RELACIONES[clave].find((rel) => typeof datos[rel] === "string" && !catalogo[CATALOGO_DE[rel]].has(datos[rel] as string));
    if (ajena) {
      errores[clave] = `El filtro de ${NOMBRE_RELACION[ajena]} no corresponde a una opción disponible. Se muestra el listado sin filtros.`;
      filtros[clave] = seguro;
      continue;
    }
    filtros[clave] = r.data;
  }
  return { filtros: filtros as Filtros, errores };
}

/** Pares nombre/valor que describen el estado no predeterminado de los listados. */
export function parametros(filtros: Filtros, excepto?: Clave): [string, string][] {
  const pares: [string, string][] = [];
  for (const clave of CLAVES) {
    if (clave === excepto) continue;
    const f = filtros[clave] as Record<string, unknown> & { page: number };
    if (f.q !== undefined) pares.push([nombreParametro(clave, "q"), String(f.q)]);
    for (const r of RELACIONES[clave]) if (f[r]) pares.push([nombreParametro(clave, r), String(f[r])]);
    if (f.page > 1) pares.push([nombreParametro(clave, "page"), String(f.page)]);
  }
  return pares;
}

/** Enlace a la página `page` de un listado; `limpiar` descarta su búsqueda y filtros. */
export function enlace(filtros: Filtros, clave: Clave, page: number, limpiar = false) {
  const params = new URLSearchParams(parametros(filtros, clave));
  if (!limpiar) {
    const f = filtros[clave] as Record<string, unknown>;
    if (f.q !== undefined) params.set(nombreParametro(clave, "q"), String(f.q));
    for (const r of RELACIONES[clave]) if (f[r]) params.set(nombreParametro(clave, r), String(f[r]));
  }
  if (page > 1) params.set(nombreParametro(clave, "page"), String(page));
  const consulta = params.toString();
  return `/admin/estructura${consulta ? `?${consulta}` : ""}#estructura-${clave}`;
}

export function hayFiltros(filtros: Filtros, clave: Clave) {
  const f = filtros[clave] as Record<string, unknown>;
  return f.q !== undefined || RELACIONES[clave].some((r) => !!f[r]);
}

/** Rango visible y total de páginas para el contador "desde–hasta de total". */
export function rango(total: number, f: { page: number; pageSize: number }) {
  const inicio = (f.page - 1) * f.pageSize;
  const fuera = total > 0 && inicio >= total;
  return {
    desde: total === 0 || fuera ? 0 : inicio + 1,
    hasta: total === 0 || fuera ? 0 : Math.min(total, f.page * f.pageSize),
    paginas: Math.max(1, Math.ceil(total / f.pageSize)),
    fuera,
  };
}
