import { describe, expect, it } from "vitest";
import { angulosDe, CUADRILATEROS, paralelos, rayitas, rectos, TRIANGULOS } from "./figuras";

describe("figuras de los vitrales", () => {
  it("cada triángulo cumple su clasificación por lados y por ángulos", () => {
    for (const [clave, p] of Object.entries(TRIANGULOS)) {
      const [lados, angulo] = clave.split("-");
      const iguales = rayitas(p).filter((r) => r > 0).length;
      expect(iguales, clave).toBe(lados === "equilatero" ? 3 : lados === "isosceles" ? 2 : 0);
      const max = Math.max(...angulosDe(p));
      if (angulo === "rectangulo") expect(Math.abs(max - 90), clave).toBeLessThan(1);
      if (angulo === "obtusangulo") expect(max, clave).toBeGreaterThan(95);
      if (angulo === "acutangulo") expect(max, clave).toBeLessThan(85);
    }
  });

  it("cada cuadrilátero cumple su definición", () => {
    const c = CUADRILATEROS;
    expect(paralelos(c.cuadrado)).toEqual([true, true]);
    expect(rectos(c.cuadrado)).toHaveLength(4);
    expect(new Set(rayitas(c.cuadrado))).toEqual(new Set([1]));
    expect(rectos(c.rectangulo)).toHaveLength(4);
    expect(rectos(c.rombo)).toHaveLength(0);
    expect(new Set(rayitas(c.rombo))).toEqual(new Set([1]));
    expect(paralelos(c.romboide)).toEqual([true, true]);
    expect(rectos(c.romboide)).toHaveLength(0);
    expect(paralelos(c.trapecio)).toEqual([true, false]);
    expect(paralelos(c.trapezoide)).toEqual([false, false]);
    expect(rayitas(c.trapezoide).every((r) => r === 0)).toBe(true);
  });
});
