import { describe, expect, it } from "vitest";
import { avanzar, estadoInicial, responder, terminado } from "./logica";

describe("cinta", () => {
  it("un acierto a la primera suma y saca la ficha", () => {
    const { estado, resultado } = responder(estadoInicial(), "a", "a");
    expect(resultado).toBe("acierto");
    expect(estado.aciertos).toBe(1);
    expect(estado.quitadas).toEqual(["a"]);
    expect(estado.primeros).toEqual({ a: "a" });
  });

  it("el primer fallo da pista y recuerda la primera ficha tocada", () => {
    const r = responder(estadoInicial(), "a", "b");
    expect(r.resultado).toBe("pista");
    expect(r.estado.fallos).toBe(1);
    expect(r.estado.primeros).toEqual({ a: "b" });
  });

  it("acertar tras un fallo no suma y conserva la primera ficha", () => {
    const r1 = responder(estadoInicial(), "a", "b");
    const r2 = responder(r1.estado, "a", "a");
    expect(r2.resultado).toBe("acierto");
    expect(r2.estado.aciertos).toBe(0);
    expect(r2.estado.primeros).toEqual({ a: "b" });
  });

  it("el segundo fallo revela y avanzar saca también la ficha correcta", () => {
    const r1 = responder(estadoInicial(), "a", "b");
    const r2 = responder(r1.estado, "a", "c");
    expect(r2.resultado).toBe("revelar");
    const sig = avanzar(r2.estado, "a");
    expect(sig.indice).toBe(1);
    expect(sig.fallos).toBe(0);
    expect(sig.quitadas).toContain("a");
  });

  it("tocar una ficha que ya salió no cambia nada", () => {
    const r1 = responder(estadoInicial(), "a", "a");
    const r2 = responder(avanzar(r1.estado, "a"), "b", "a");
    expect(r2.estado).toEqual(avanzar(r1.estado, "a"));
  });

  it("termina al pasar la última tarjeta", () => {
    expect(terminado({ ...estadoInicial(), indice: 2 }, 2)).toBe(true);
    expect(terminado(estadoInicial(), 2)).toBe(false);
  });
});
