import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { divisionTipo, resolver } from "./tipo";

const contenido = {
  divisiones: [
    { id: "a", dividendo: 975, divisor: 125 },
    { id: "b", dividendo: 2548, divisor: 312 },
    { id: "c", dividendo: 864, divisor: 216 },
  ],
};

describe("división", () => {
  it("resuelve cociente y residuo", () => {
    expect(resolver(contenido.divisiones[0])).toEqual({ cociente: 7, residuo: 100 });
    expect(resolver(contenido.divisiones[1])).toEqual({ cociente: 8, residuo: 52 });
  });

  it("da un punto por el cociente y otro por el residuo", () => {
    const r = calificarIntento(divisionTipo, contenido, { a: { cociente: 7, residuo: 100 }, b: { cociente: 8, residuo: 50 }, c: { cociente: null, residuo: 0 } });
    expect(r.items.map((i) => i.puntaje)).toEqual([2, 1, 1]);
    expect(divisionTipo.repaso(contenido, "b").solucion).toBe("Cociente 8 y residuo 52: 312 × 8 + 52 = 2.548.");
  });
});
