import { describe, expect, it } from "vitest";
import { piezasDe } from "./confeti";

describe("piezasDe", () => {
  it("celebra más al acertar a la primera que al acertar corrigiendo", () => {
    expect(piezasDe("acierto").length).toBeGreaterThan(piezasDe("corregida").length);
  });

  it("mantiene pocas piezas (juego ligero)", () => {
    expect(piezasDe("acierto").length).toBeLessThanOrEqual(12);
  });

  it("todas las piezas suben y quedan dentro de la escena", () => {
    for (const p of piezasDe("acierto")) {
      expect(p.dy).toBeLessThan(0);
      expect(Math.abs(p.dx)).toBeLessThanOrEqual(50);
      expect(p.retardo).toBeLessThanOrEqual(120);
    }
  });

  it("es determinista", () => {
    expect(piezasDe("acierto")).toEqual(piezasDe("acierto"));
  });
});
