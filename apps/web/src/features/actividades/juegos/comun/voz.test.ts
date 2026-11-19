import { describe, expect, it, vi } from "vitest";
import { elegirFuente, usarCanalVoz } from "./voz";

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

describe("usarCanalVoz (cuándo se calla la voz)", () => {
  it("desmontar y volver a montar (modo estricto) no corta la voz", () => {
    vi.useFakeTimers();
    const callar = vi.fn();
    const soltar = usarCanalVoz(callar);
    soltar();
    const soltarOtra = usarCanalVoz(callar);
    vi.runAllTimers();
    expect(callar).not.toHaveBeenCalled();
    soltarOtra();
    vi.runAllTimers();
    expect(callar).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
  it("si se va uno pero queda otro, la voz sigue", () => {
    vi.useFakeTimers();
    const callar = vi.fn();
    const portada = usarCanalVoz(callar);
    const juego = usarCanalVoz(callar);
    portada();
    vi.runAllTimers();
    expect(callar).not.toHaveBeenCalled();
    juego();
    vi.runAllTimers();
    expect(callar).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
