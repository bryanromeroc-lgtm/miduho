import { describe, expect, it } from "vitest";
import { puedeAccederRuta, puedeUsarContexto, resolverContexto } from "./sesion";

describe("contexto de sesión", () => {
  it("inicia como ADMIN para una cuenta mixta y recuerda DOCENTE", () => {
    expect(resolverContexto(["DOCENTE", "ADMIN"], null)).toBe("ADMIN");
    expect(resolverContexto(["DOCENTE", "ADMIN"], "DOCENTE")).toBe("DOCENTE");
  });

  it("no permite seleccionar un contexto que no corresponde a los roles vigentes", () => {
    expect(puedeUsarContexto(["DOCENTE"], "ADMIN")).toBe(false);
    expect(puedeUsarContexto(["ADMIN", "DOCENTE"], "DOCENTE")).toBe(true);
    expect(puedeUsarContexto(["ESTUDIANTE"], "ESTUDIANTE")).toBe(false);
  });
});

describe("matriz de rutas", () => {
  it("permite biblioteca y cuenta a todos los roles autenticados", () => {
    for (const rol of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) {
      expect(puedeAccederRuta([rol], "BIBLIOTECA")).toBe(true);
      expect(puedeAccederRuta([rol], "CUENTA")).toBe(true);
    }
  });

  it("rechaza accesos verticales y horizontales fuera del rol", () => {
    expect(puedeAccederRuta(["DOCENTE"], "ADMIN")).toBe(false);
    expect(puedeAccederRuta(["ESTUDIANTE"], "MI_CURSO")).toBe(false);
    expect(puedeAccederRuta(["ADMIN"], "GENERAL")).toBe(false);
    expect(puedeAccederRuta(["ADMIN", "DOCENTE"], "MI_CURSO")).toBe(true);
  });
});