import { describe, expect, it } from "vitest";
import { aciertos, colocar, devolver, ordenRevelado, pila, vacias } from "./logica";

const meses = ["enero", "febrero", "marzo", "abril"].map((id) => ({ id }));
describe("casillas", () => {
  it("coloca, cambia y devuelve sin repetir una ficha", () => {
    const a = colocar(vacias(4), "enero", 0);
    const b = colocar(a, "febrero", 0);
    expect(b).toEqual(["febrero", null, null, null]);
    expect(colocar(b, "febrero", 2)).toEqual([null, null, "febrero", null]);
    expect(devolver(b, "febrero")).toEqual(vacias(4));
    expect(a).toEqual(["enero", null, null, null]);
  });
  it("baraja por semilla y revela todas las posiciones en orden", () => {
    expect(pila(meses, "partida:1")).toEqual(pila(meses, "partida:1"));
    expect(pila(meses, "partida:1").map((e) => e.id)).not.toEqual(meses.map((e) => e.id));
    expect(ordenRevelado(12)).toEqual(Array.from({ length: 12 }, (_, i) => i));
    expect(aciertos(meses, ["enero", null, "abril", "marzo"])).toBe(1);
  });
});
