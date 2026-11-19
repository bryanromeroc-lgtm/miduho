import { describe, expect, it } from "vitest";
import { escribirExpresion, leerExpresion, pasos } from "./expresion";

describe("operaciones combinadas", () => {
  it("respeta la jerarquía: paréntesis, × y ÷, + y −", () => {
    const r = pasos("7 + 3 × (10 − 4) ÷ 2");
    expect(r.pasos.map((p) => `${p.a} ${p.op} ${p.b} = ${p.valor}`)).toEqual(["10 − 4 = 6", "3 × 6 = 18", "18 ÷ 2 = 9", "7 + 9 = 16"]);
    expect(r.final).toBe(16);
  });

  it("de izquierda a derecha entre operaciones del mismo nivel", () => {
    expect(pasos("20 − 8 + 3").final).toBe(15);
    expect(pasos("24 ÷ 4 × 2").final).toBe(12);
    expect(pasos("5 × 6 − 4 × 3").pasos.map((p) => p.valor)).toEqual([30, 12, 18]);
  });

  it("lee y escribe con los signos de la escuela", () => {
    expect(escribirExpresion(leerExpresion("(6+9)*2"))).toBe("(6 + 9) × 2");
    expect(() => leerExpresion("6 + a")).toThrow(SyntaxError);
  });
});
