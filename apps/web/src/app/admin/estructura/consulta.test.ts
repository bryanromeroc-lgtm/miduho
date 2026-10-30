import { describe, expect, it } from "vitest";
import { enlace, hayFiltros, leerConsulta, rango } from "./consulta";

const catalogo = { anios: new Set(["anio-1"]), grados: new Set(["grado-1"]), areas: new Set(["area-1"]) };

describe("consulta de /admin/estructura", () => {
  it("sin parámetros usa la página 1 de 20 en todos los listados", () => {
    const { filtros, errores } = leerConsulta({}, catalogo);
    expect(errores).toEqual({});
    expect(filtros.grupos).toEqual({ page: 1, pageSize: 20 });
    expect(filtros.anios).toEqual({ page: 1, pageSize: 20 });
  });

  it("lee búsqueda, filtros de relación y página por listado", () => {
    const { filtros } = leerConsulta(
      { "grupos-q": "01", "grupos-anio": "anio-1", "grupos-grado": "grado-1", "grupos-page": "2", "asignaturas-area": "area-1", "anios-q": "2026" },
      catalogo,
    );
    expect(filtros.grupos).toEqual({ page: 2, pageSize: 20, q: "01", anioLectivoId: "anio-1", gradoId: "grado-1" });
    expect(filtros.asignaturas).toMatchObject({ areaId: "area-1" });
    expect(filtros.anios.q).toBe(2026);
  });

  it("entrada inválida muestra error y vuelve al filtro seguro solo en ese listado", () => {
    const { filtros, errores } = leerConsulta({ "periodos-page": "abc", "grupos-q": "01", "anios-q": "veinte" }, catalogo);
    expect(filtros.periodos).toEqual({ page: 1, pageSize: 20 });
    expect(errores.periodos).toMatch(/página/);
    expect(filtros.anios).toEqual({ page: 1, pageSize: 20 });
    expect(errores.anios).toMatch(/cuatro cifras/);
    expect(filtros.grupos.q).toBe("01");
    expect(errores.grupos).toBeUndefined();
  });

  it("un ID que no está entre las opciones se descarta con aviso", () => {
    const { filtros, errores } = leerConsulta({ "asignaturas-grado": "otro", "asignaturas-q": "robo" }, catalogo);
    expect(filtros.asignaturas).toEqual({ page: 1, pageSize: 20 });
    expect(errores.asignaturas).toMatch(/grado/);
  });

  it("los enlaces de paginación conservan filtros propios y de los demás listados", () => {
    const { filtros } = leerConsulta({ "grupos-q": "1° 01", "grupos-anio": "anio-1", "grupos-page": "2", "areas-q": "arte" }, catalogo);
    const siguiente = new URL(enlace(filtros, "grupos", 3), "http://x");
    expect(siguiente.pathname).toBe("/admin/estructura");
    expect(siguiente.hash).toBe("#estructura-grupos");
    expect(Object.fromEntries(siguiente.searchParams)).toEqual({ "areas-q": "arte", "grupos-q": "1° 01", "grupos-anio": "anio-1", "grupos-page": "3" });
    const primera = new URL(enlace(filtros, "grupos", 1), "http://x");
    expect(primera.searchParams.has("grupos-page")).toBe(false);
    const limpio = new URL(enlace(filtros, "grupos", 1, true), "http://x");
    expect(Object.fromEntries(limpio.searchParams)).toEqual({ "areas-q": "arte" });
    expect(hayFiltros(filtros, "grupos")).toBe(true);
    expect(hayFiltros(filtros, "grados")).toBe(false);
  });

  it("calcula rango, total de páginas y página fuera de rango", () => {
    expect(rango(0, { page: 1, pageSize: 20 })).toEqual({ desde: 0, hasta: 0, paginas: 1, fuera: false });
    expect(rango(45, { page: 3, pageSize: 20 })).toEqual({ desde: 41, hasta: 45, paginas: 3, fuera: false });
    expect(rango(45, { page: 9, pageSize: 20 })).toMatchObject({ desde: 0, fuera: true });
  });
});
