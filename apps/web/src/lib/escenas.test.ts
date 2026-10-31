import { describe, expect, it } from "vitest";
import { escenaDe, normalizar } from "./escenas";

describe("escenas por asignatura", () => {
  it("normaliza tildes, mayúsculas y signos", () => {
    expect(normalizar("  Matemáticas: Pensamiento NUMÉRICO ")).toBe("matematicas pensamiento numerico");
  });

  it.each([
    ["Matemáticas", "matematicas"],
    ["MATEMÁTICAS", "matematicas"],
    ["matematicas", "matematicas"],
    ["Comprensión Lectora", "lectura"],
    ["Lengua Castellana", "lectura"],
    ["Inglés", "ingles"],
    ["Robótica", "robotica"],
    ["Emprendimiento", "emprendimiento"],
    ["Ética y valores", "etica"],
    ["Educación artística", "artistica"],
    ["Educación física", "fisica"],
    ["Ciencias sociales", "sociales"],
    ["Ciencias naturales", "naturales"],
  ])("«%s» → %s", (asignatura, escena) => {
    expect(escenaDe(asignatura)).toBe(escena);
  });

  it("lo específico gana: «Ciencias sociales» no cae en naturales", () => {
    expect(escenaDe("Ciencias Sociales")).toBe("sociales");
    expect(escenaDe("Ciencias")).toBe("naturales");
  });

  it("sin coincidencia en la asignatura, usa la escena de su área", () => {
    expect(escenaDe("Proyecto de aula", "Tecnología e Informática")).toBe("robotica");
    expect(escenaDe("Taller A", "Humanidades: Lengua Castellana")).toBe("lectura");
  });

  it("sin coincidencia en ninguna, usa la escena genérica", () => {
    expect(escenaDe("Asignatura B", "Área demo")).toBe("generica");
    expect(escenaDe("Educación religiosa")).toBe("generica");
  });

  it("no confunde palabras parciales", () => {
    expect(escenaDe("Artesanías")).toBe("generica");
  });
});
