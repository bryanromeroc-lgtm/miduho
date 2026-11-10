import { describe, expect, it } from "vitest";
import {
  contextoVisible,
  esRutaMaqueta,
  etiquetaGrupo,
  grupoMaqueta,
  inicioDeContexto,
  rutaActiva,
  rutasPorContexto,
  textoGrupo,
} from "./navegacion";

const etiquetas = (c: Parameters<typeof rutasPorContexto>[0]) => rutasPorContexto(c).map((r) => r.etiqueta);

describe("navegación por contexto", () => {
  it("ESTUDIANTE ve «Mis materias» como inicio, sin Mis clases, Mi curso ni administración", () => {
    expect(etiquetas("ESTUDIANTE")).toEqual(["Mis materias", "Biblioteca", "Laboratorios", "Agenda", "Cuenta"]);
    expect(rutasPorContexto("ESTUDIANTE")[0].href).toBe("/");
  });

  it("DOCENTE conserva «Hoy», Mis clases y Mi curso", () => {
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

  it("ADMIN (la coordinadora) ve contenido, Biblioteca y Laboratorios antes de la administración", () => {
    expect(etiquetas("ADMIN")).toEqual([
      "Dashboard",
      "Contenido",
      "Biblioteca",
      "Laboratorios",
      "Usuarios",
      "Estudiantes",
      "Estructura",
      "Asignaciones",
      "Cuenta",
    ]);
    expect(rutasPorContexto("ADMIN")[1].href).toBe("/admin/contenido");
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

  it("Laboratorios conserva el contexto guardado en cada combinación de roles", () => {
    for (const ruta of ["/laboratorios", "/laboratorios/u1", "/emprendimiento"]) {
      expect(contextoVisible("ADMIN", ["ADMIN"], ruta)).toBe("ADMIN");
      expect(contextoVisible("DOCENTE", ["DOCENTE"], ruta)).toBe("DOCENTE");
      expect(contextoVisible("ESTUDIANTE", ["ESTUDIANTE"], ruta)).toBe("ESTUDIANTE");
      expect(contextoVisible("ADMIN", ["ADMIN", "DOCENTE"], ruta)).toBe("ADMIN");
      expect(contextoVisible("DOCENTE", ["ADMIN", "DOCENTE"], ruta)).toBe("DOCENTE");
    }
  });

  it("el resto de rutas de la maqueta siguen pintando DOCENTE a una cuenta mixta", () => {
    for (const ruta of ["/", "/clases", "/clases/c1", "/agenda", "/mi-curso"]) {
      expect(contextoVisible("ADMIN", ["ADMIN", "DOCENTE"], ruta)).toBe("DOCENTE");
    }
    expect(esRutaMaqueta("/laboratorios")).toBe(false);
    expect(esRutaMaqueta("/agenda")).toBe(true);
  });

  it("/admin/contenido pinta ADMIN a la cuenta mixta aunque su contexto sea DOCENTE", () => {
    expect(contextoVisible("DOCENTE", ["ADMIN", "DOCENTE"], "/admin/contenido/x/5")).toBe("ADMIN");
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

  it("nombra el grupo como su grado (un solo grupo por grado)", () => {
    expect(etiquetaGrupo("1°")).toBe("1°");
  });
});

describe("grupo real en shell y maqueta (INC1R-11)", () => {
  it("ESTUDIANTE ve su grupo real o el aviso de sin grupo", () => {
    expect(textoGrupo("ESTUDIANTE", "3°", [])).toBe("Grupo 3°");
    expect(textoGrupo("ESTUDIANTE", null, [])).toBe("Sin grupo asignado");
    expect(grupoMaqueta("ESTUDIANTE", "3°", [])).toBe("3°");
    expect(grupoMaqueta("ESTUDIANTE", null, [])).toBeNull();
  });

  it("DOCENTE rotula la maqueta solo con un grupo inequívoco", () => {
    expect(textoGrupo("DOCENTE", null, ["1°", "2°"])).toBe("Grupos 1°, 2°");
    expect(grupoMaqueta("DOCENTE", null, ["1°"])).toBe("1°");
    expect(grupoMaqueta("DOCENTE", null, ["1°", "2°"])).toBeNull();
    expect(grupoMaqueta("DOCENTE", null, [])).toBeNull();
  });

  it("ADMIN y sin contexto nunca reciben un grupo", () => {
    expect(textoGrupo("ADMIN", "1°", ["1°"])).toBeNull();
    expect(textoGrupo(null, "1°", [])).toBeNull();
    expect(grupoMaqueta("ADMIN", "1°", ["1°"])).toBeNull();
    expect(grupoMaqueta(null, "1°", [])).toBeNull();
  });
});
