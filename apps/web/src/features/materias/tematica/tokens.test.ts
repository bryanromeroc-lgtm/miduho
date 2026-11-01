import { describe, expect, it } from "vitest";
import { razonContraste } from "@/lib/contraste";
import { ESCENAS } from "@/lib/escenas";
import { hexAOklch } from "./color";
import { OPACIDAD_MARCAS, PARES_TEXTO, TOKENS } from "./tokens";

describe("tokens de color por materia", () => {
  it("hay tokens para las 11 escenas", () => {
    expect(Object.keys(TOKENS).sort()).toEqual([...ESCENAS].sort());
  });

  it.each(ESCENAS)("%s: todos los pares de texto cumplen 4.5:1", (escena) => {
    const k = TOKENS[escena];
    for (const par of PARES_TEXTO) {
      const r = razonContraste(k[par.texto], k[par.fondo]);
      expect(r, `${escena} · ${par.texto} sobre ${par.fondo} (${par.uso}) = ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(ESCENAS)("%s: el fondo es un pastel claro y neutro (croma ≤ 0.03)", (escena) => {
    const { l, c } = hexAOklch(TOKENS[escena].fondo);
    expect(c).toBeLessThanOrEqual(0.03);
    expect(l).toBeGreaterThanOrEqual(0.94);
  });

  it("las marcas de agua son tenues y desaturadas", () => {
    expect(OPACIDAD_MARCAS).toBeLessThanOrEqual(0.12);
    for (const escena of ESCENAS) expect(hexAOklch(TOKENS[escena].marca).c, escena).toBeLessThanOrEqual(0.1);
  });

  it("cada materia tiene su propio acento", () => {
    const acentos = ESCENAS.map((e) => TOKENS[e].acento);
    expect(new Set(acentos).size).toBe(acentos.length);
  });

  it("la conversión OKLCH es correcta en blanco y negro", () => {
    expect(hexAOklch("#ffffff").l).toBeCloseTo(1, 3);
    expect(hexAOklch("#ffffff").c).toBeLessThan(0.001);
    expect(hexAOklch("#000000").l).toBeCloseTo(0, 3);
  });
});
