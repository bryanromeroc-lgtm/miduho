import { describe, expect, it } from "vitest";
import { elegirFuente } from "./voz";

describe("elegirFuente (voz de la tarea)", () => {
  it("la grabación va antes que la síntesis", () => {
    expect(elegirFuente({ audio: "/audio/a.mp3", grado: 1, sintesis: true })).toBe("grabacion");
  });
  it("la grabación se usa en cualquier grado", () => {
    expect(elegirFuente({ audio: "/audio/a.mp3", grado: 5, sintesis: false })).toBe("grabacion");
  });
  it("sin grabación, síntesis solo en 1.° y 2.°", () => {
    expect(elegirFuente({ grado: 1, sintesis: true })).toBe("sintesis");
    expect(elegirFuente({ grado: 2, sintesis: true })).toBe("sintesis");
    expect(elegirFuente({ grado: 3, sintesis: true })).toBeNull();
  });
  it("si la grabación falla cae a la síntesis permitida", () => {
    expect(elegirFuente({ audio: "/audio/a.mp3", grado: 1, sintesis: true, grabacionFallo: true })).toBe("sintesis");
    expect(elegirFuente({ audio: "/audio/a.mp3", grado: 4, sintesis: true, grabacionFallo: true })).toBeNull();
  });
  it("sin voz del navegador ni grabación no hay fuente", () => {
    expect(elegirFuente({ grado: 1, sintesis: false })).toBeNull();
  });
});
