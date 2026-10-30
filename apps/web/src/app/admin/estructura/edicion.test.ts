import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as E from "@/server/modules/academico/esquemas";
import { accionesAnio, anioCerrado, campoIntensidad, CUERPO_CIERRE, cuerpoFormulario, errorCuerpo } from "./edicion";
import { FormularioEstructura, type Clave, type Listado } from "./formulario";

const fd = (campos: Array<[string, string]>) => {
  const f = new FormData();
  for (const [k, v] of campos) f.append(k, v);
  return f;
};

describe("contrato de formularios de /admin/estructura", () => {
  it("alta de año: nunca envía estado aunque llegue en el formulario (nace ACTIVO)", () => {
    const cuerpo = cuerpoFormulario("anios-lectivos", fd([["anio", "2031"], ["estado", "CERRADO"], ["fechaInicio", "2031-01-20"], ["fechaFin", "2031-12-05"]]), "crear");
    expect(cuerpo).toEqual({ anio: 2031, fechaInicio: "2031-01-20", fechaFin: "2031-12-05" });
    expect(E.crearAnioLectivo.parse(cuerpo).estado).toBe("ACTIVO");
  });

  it("edición de año: envía fechaInicio y fechaFin; el cierre es un PATCH { estado: CERRADO } válido", () => {
    const cuerpo = cuerpoFormulario("anios-lectivos", fd([["anio", "2031"], ["fechaInicio", "2031-01-27"], ["fechaFin", "2031-11-28"]]), "editar");
    expect(cuerpo).toEqual({ fechaInicio: "2031-01-27", fechaFin: "2031-11-28" });
    expect(errorCuerpo("anios-lectivos", "editar", cuerpo)).toBeNull();
    expect(E.actualizarAnioLectivo.parse(CUERPO_CIERRE)).toEqual({ estado: "CERRADO" });
  });

  it("edición de período: todos los campos editables, sin cambiar de año (esquema strict)", () => {
    const campos: Array<[string, string]> = [["anioLectivoId", "otro"], ["nombre", "Primer período"], ["orden", "1"], ["ponderacion", "25.5"], ["fechaInicio", "2031-01-27"], ["fechaFin", "2031-04-04"]];
    const cuerpo = cuerpoFormulario("periodos", fd(campos), "editar");
    expect(cuerpo).toEqual({ nombre: "Primer período", orden: 1, ponderacion: 25.5, fechaInicio: "2031-01-27", fechaFin: "2031-04-04" });
    expect(errorCuerpo("periodos", "editar", cuerpo)).toBeNull();
    expect(cuerpoFormulario("periodos", fd(campos), "crear")).toMatchObject({ anioLectivoId: "otro" });
  });

  it("edición de área y grado: todos sus campos; orden vacío del área se envía como null", () => {
    const area = cuerpoFormulario("areas", fd([["nombre", "Área de prueba"], ["tipo", "DIMENSION"], ["idioma", "en"], ["orden", ""]]), "editar");
    expect(area).toEqual({ nombre: "Área de prueba", tipo: "DIMENSION", idioma: "en", orden: null });
    expect(errorCuerpo("areas", "editar", area)).toBeNull();
    const grado = cuerpoFormulario("grados", fd([["nombre", "Grado de prueba"], ["nivel", "PREESCOLAR"], ["orden", "0"]]), "editar");
    expect(grado).toEqual({ nombre: "Grado de prueba", nivel: "PREESCOLAR", orden: 0 });
    expect(errorCuerpo("grados", "editar", grado)).toBeNull();
  });

  it("edición de grupo: identificador y director (o quitarlo); un director sin cambios no se reenvía", () => {
    const quitar = cuerpoFormulario("grupos", fd([["identificador", "02"], ["directorId", ""]]), "editar", { id: "g", directorId: "d-1" });
    expect(quitar).toEqual({ identificador: "02", directorId: null });
    expect(errorCuerpo("grupos", "editar", quitar)).toBeNull();
    const igual = cuerpoFormulario("grupos", fd([["identificador", "02"], ["directorId", "d-1"]]), "editar", { id: "g", directorId: "d-1" });
    expect(igual).toEqual({ identificador: "02" });
    const alta = cuerpoFormulario("grupos", fd([["anioLectivoId", "a"], ["gradoId", "g"], ["identificador", "01"], ["directorId", ""]]), "crear");
    expect(alta).toEqual({ anioLectivoId: "a", gradoId: "g", identificador: "01", directorId: null });
  });

  it("edición de asignatura: área, intensidad y conjunto completo de grados con intensidad por grado", () => {
    const cuerpo = cuerpoFormulario(
      "asignaturas",
      fd([["nombre", "Asignatura de prueba"], ["areaId", "area-2"], ["intensidadHoraria", ""], ["gradoId", "g1"], ["gradoId", "g3"], [campoIntensidad("g1"), "3"], [campoIntensidad("g2"), "9"], [campoIntensidad("g3"), ""]]),
      "editar",
    );
    expect(cuerpo).toEqual({ nombre: "Asignatura de prueba", areaId: "area-2", intensidadHoraria: null, grados: [{ gradoId: "g1", intensidad: 3 }, { gradoId: "g3", intensidad: null }] });
    expect(errorCuerpo("asignaturas", "editar", cuerpo)).toBeNull();
    // Desmarcar todos los grados se envía como lista vacía (reemplaza el conjunto).
    expect(cuerpoFormulario("asignaturas", fd([["nombre", "X"], ["areaId", "a"]]), "editar").grados).toEqual([]);
  });

  it("errores de esquema se devuelven como texto para la UI", () => {
    expect(errorCuerpo("periodos", "editar", { nombre: "", orden: 0 })).toMatch(/Escribe el nombre del período/);
    expect(errorCuerpo("grupos", "editar", { identificador: "01-A" })).toMatch(/1 a 4 letras o números/);
    expect(errorCuerpo("anios-lectivos", "editar", { estado: "ACTIVO", anio: 2031 })).not.toBeNull();
  });

  it("acciones por estado del año: el cierre solo existe para un año ACTIVO", () => {
    expect(accionesAnio("ACTIVO")).toEqual({ editar: true, cerrar: true, eliminar: true });
    expect(accionesAnio("CERRADO")).toEqual({ editar: false, cerrar: false, eliminar: false });
    expect(anioCerrado({ estado: "CERRADO" })).toBe(true);
    expect(anioCerrado({ estado: "ACTIVO" })).toBe(false);
    expect(anioCerrado(undefined)).toBe(false);
  });
});

describe("render de FormularioEstructura (datos ficticios)", () => {
  const vacio: Listado = { filtros: null, resumen: null, vacio: null, pie: null };
  const listados = Object.fromEntries(["anios", "periodos", "areas", "grados", "grupos", "asignaturas"].map((c) => [c, vacio])) as Record<Clave, Listado>;
  const anioActivo = { id: "a-activo", anio: 2031, estado: "ACTIVO", fechaInicio: "2031-01-20", fechaFin: "2031-12-05" };
  const anioCerradoReg = { id: "a-cerrado", anio: 2030, estado: "CERRADO", fechaInicio: "2030-01-20", fechaFin: "2030-12-05" };
  const html = renderToStaticMarkup(createElement(FormularioEstructura, {
    anios: [anioActivo, anioCerradoReg],
    periodos: [
      { id: "p-activo", nombre: "Período A", orden: 1, ponderacion: 50, fechaInicio: "2031-01-27", fechaFin: "2031-06-13", anioLectivoId: "a-activo", anioLectivo: { anio: 2031, estado: "ACTIVO" } },
      { id: "p-cerrado", nombre: "Período B", orden: 1, ponderacion: 100, fechaInicio: "2030-01-27", fechaFin: "2030-11-27", anioLectivoId: "a-cerrado", anioLectivo: { anio: 2030, estado: "CERRADO" } },
    ],
    areas: [], grados: [], grupos: [], asignaturas: [],
    catalogo: { anios: [{ id: "a-activo", etiqueta: "2031" }, { id: "a-cerrado", etiqueta: "2030 (cerrado)" }], aniosEditables: [{ id: "a-activo", etiqueta: "2031" }], grados: [], areas: [], docentes: [] },
    listados,
  }));
  const formularioAnio = html.slice(html.indexOf('aria-label="Crear año lectivo"'), html.indexOf("</form>", html.indexOf('aria-label="Crear año lectivo"')));

  it("el alta de año no ofrece el estado CERRADO", () => {
    expect(formularioAnio).not.toMatch(/value="CERRADO"/);
    expect(formularioAnio).not.toMatch(/name="estado"/);
  });

  it("un año ACTIVO ofrece Editar y Cerrar año; uno CERRADO es de solo lectura", () => {
    expect(html).toContain("Cerrar año<span class=\"sr-only\"> el año 2031</span>");
    expect(html).toContain("Editar<span class=\"sr-only\"> el año 2031</span>");
    expect(html).not.toContain("el año 2030</span>");
    expect(html).toContain("Solo lectura (año cerrado)");
  });

  it("los períodos de un año cerrado no se editan ni se borran; el alta solo ofrece años activos", () => {
    expect(html).toContain("Editar<span class=\"sr-only\"> el período Período A de 2031</span>");
    expect(html).not.toContain("el período Período B de 2030</span>");
    const altaPeriodo = html.slice(html.indexOf('aria-label="Crear período"'), html.indexOf("</form>", html.indexOf('aria-label="Crear período"')));
    expect(altaPeriodo).toContain('value="a-activo"');
    expect(altaPeriodo).not.toContain('value="a-cerrado"');
  });
});
