import { describe, expect, it } from "vitest";
import {
  contextoVisible,
  etiquetaGrupo,
  inicioDeContexto,
  rutaActiva,
  rutasPorContexto,
} from "./navegacion";

const etiquetas = (c: Parameters<typeof rutasPorContexto>[0]) => rutasPorContexto(c).map((r) => r.etiqueta);

describe("navegación por contexto", () => {
  it("ESTUDIANTE ve la maqueta y Cuenta, sin Mi curso ni administración", () => {
    expect(etiquetas("ESTUDIANTE")).toEqual(["Hoy", "Mis clases", "Biblioteca", "Laboratorios", "Agenda", "Cuenta"]);
  });

  it("DOCENTE ve lo mismo que ESTUDIANTE más Mi curso", () => {
    expect(etiquetas("DOCENTE")).toEqual([
      "Hoy",
      "Mis clases",
      "Biblioteca",
      "Laboratorios",
      "Agenda",
      "Mi curso",
      "Cuenta",
    ]);
  });

  it("ADMIN ve solo administración y Cuenta", () => {
    expect(etiquetas("ADMIN")).toEqual(["Dashboard", "Usuarios", "Estudiantes", "Estructura", "Asignaciones", "Cuenta"]);
    const hrefs = rutasPorContexto("ADMIN").map((r) => r.href);
    expect(hrefs).not.toContain("/");
    expect(hrefs).not.toContain("/mi-curso");
  });

  it("sin contexto solo ofrece Cuenta", () => {
    expect(etiquetas(null)).toEqual(["Cuenta"]);
  });

  it("cada contexto tiene su inicio", () => {
    expect(inicioDeContexto("ADMIN")).toBe("/admin");
    expect(inicioDeContexto("DOCENTE")).toBe("/");
    expect(inicioDeContexto("ESTUDIANTE")).toBe("/");
    expect(inicioDeContexto(null)).toBe("/cuenta");
  });
});

describe("contexto visible", () => {
  it("una cuenta mixta en contexto DOCENTE ve navegación ADMIN dentro de /admin", () => {
    expect(contextoVisible("DOCENTE", ["ADMIN", "DOCENTE"], "/admin/usuarios")).toBe("ADMIN");
    expect(contextoVisible("ADMIN", ["ADMIN", "DOCENTE"], "/mi-curso")).toBe("DOCENTE");
    expect(contextoVisible("ADMIN", ["ADMIN", "DOCENTE"], "/clases/c1")).toBe("DOCENTE");
  });

  it("Biblioteca y Cuenta conservan el contexto guardado", () => {
    expect(contextoVisible("ADMIN", ["ADMIN", "DOCENTE"], "/biblioteca")).toBe("ADMIN");
    expect(contextoVisible("ADMIN", ["ADMIN"], "/cuenta")).toBe("ADMIN");
    expect(contextoVisible("DOCENTE", ["ADMIN", "DOCENTE"], "/cuenta")).toBe("DOCENTE");
  });

  it("no eleva a ADMIN a quien no tiene el rol", () => {
    expect(contextoVisible("DOCENTE", ["DOCENTE"], "/admin")).toBe("DOCENTE");
    expect(contextoVisible("ESTUDIANTE", ["ESTUDIANTE"], "/mi-curso")).toBe("ESTUDIANTE");
  });
});

describe("utilidades", () => {
  it("marca activa sin falsos positivos", () => {
    expect(rutaActiva("/", "/")).toBe(true);
    expect(rutaActiva("/", "/clases")).toBe(false);
    expect(rutaActiva("/admin", "/admin/usuarios")).toBe(false);
    expect(rutaActiva("/admin/usuarios", "/admin/usuarios/123")).toBe(true);
    expect(rutaActiva("/clases", "/clasesx")).toBe(false);
  });

  it("nombra el grupo como grado-identificador", () => {
    expect(etiquetaGrupo("1°", "01")).toBe("1°-01");
  });
});
