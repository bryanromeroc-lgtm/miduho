import { describe, expect, it } from "vitest";
import { estrellasDe, estrellasDeMateria } from "./estrellas";
import { totalEstrellas } from "./materias";

describe("estrellas", () => {
  it("convierte 59.99, 60, 89.99 y 90 en 1, 2, 2 y 3", () => {
    expect([59.99, 60, 89.99, 90].map(estrellasDe)).toEqual([1, 2, 2, 3]);
  });

  it("sin intentos enviados son 0 estrellas", () => {
    expect(estrellasDe(null)).toBe(0);
    expect(estrellasDe(undefined)).toBe(0);
  });

  it("los extremos quedan dentro de la escala", () => {
    expect(estrellasDe(0)).toBe(1);
    expect(estrellasDe(100)).toBe(3);
  });

  it("la materia promedia los mejores intentos", () => {
    expect(estrellasDeMateria([100, 80])).toBe(3);
    expect(estrellasDeMateria([95, 70])).toBe(2);
    expect(estrellasDeMateria([50, 60])).toBe(1);
  });

  it("sin actividades calificadas la materia no tiene estrellas", () => {
    expect(estrellasDeMateria([])).toBeNull();
  });
});

describe("total «mis estrellas»", () => {
  it("suma las estrellas de las materias con datos", () => {
    expect(totalEstrellas([{ estrellas: 2 }, { estrellas: null }, { estrellas: 3 }])).toBe(5);
  });

  it("se oculta (null) si ninguna materia tiene datos", () => {
    expect(totalEstrellas([{ estrellas: null }, { estrellas: null }])).toBeNull();
    expect(totalEstrellas([])).toBeNull();
  });
});
