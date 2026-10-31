import { describe, expect, it } from "vitest";
import { DEFINICION_ESTADO, ESTADOS } from "./estados";

describe("vocabulario de estado", () => {
  it("es cerrado: ahora, programada, lista, hecha, sin material, en preparación y nuevo", () => {
    expect(ESTADOS).toEqual(["ahora", "programada", "lista", "hecha", "sin-material", "en-preparacion", "nuevo"]);
    expect(Object.keys(DEFINICION_ESTADO).sort()).toEqual([...ESTADOS].sort());
  });

  it.each(ESTADOS)("«%s» tiene marca y texto", (estado) => {
    const { texto, marca } = DEFINICION_ESTADO[estado];
    expect(texto.trim().length).toBeGreaterThan(0);
    expect(marca).toMatch(/^[A-Z][A-Za-z]+$/);
  });

  it("cada estado tiene una marca propia, distinguible sin color", () => {
    const marcas = ESTADOS.map((e) => DEFINICION_ESTADO[e].marca);
    expect(new Set(marcas).size).toBe(marcas.length);
  });
});
