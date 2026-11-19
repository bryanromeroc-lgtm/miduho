import { describe, expect, it } from "vitest";
import { armarRondas, iniciarParejas, ubicar } from "./logica";

const elementos = [
  { id: "a1", categoria: "a", pareja: "uno" }, { id: "b1", categoria: "b", pareja: "uno" },
  { id: "a2", categoria: "a", pareja: "dos" }, { id: "b2", categoria: "b", pareja: "dos" },
];

describe("parejas", () => {
  it("baraja rondas y posiciones de forma reproducible", () => {
    expect(armarRondas(elementos, "semilla")).toEqual(armarRondas(elementos, "semilla"));
    expect(armarRondas(elementos, "semilla").flatMap((r) => r.piezas).sort()).toEqual(elementos.map((e) => e.id).sort());
    expect(armarRondas(elementos, "otra")).not.toEqual(armarRondas(elementos, "semilla"));
  });
  it("reparte ambas categorías entre las primeras posiciones de las rondas", () => {
    const seisPares = Array.from({ length: 6 }, (_, i) => [
      { id: `a${i}`, categoria: "a", pareja: `par${i}` },
      { id: `b${i}`, categoria: "b", pareja: `par${i}` },
    ]).flat();
    const primeros = Array.from({ length: 200 }, (_, i) =>
      armarRondas(seisPares, `antes-y-ahora:${i}`).map((r) => r.piezas[0].startsWith("a")),
    );
    const proporcion = primeros.flat().filter(Boolean).length / (200 * 6);
    expect(proporcion).toBeGreaterThanOrEqual(0.35);
    expect(proporcion).toBeLessThanOrEqual(0.65);
    for (const partida of primeros.slice(0, 10)) {
      expect(partida).toContain(true);
      expect(partida).toContain(false);
    }
  });
  it("registra la primera ubicación, rechaza y autocoloca al segundo fallo", () => {
    const rondas = [{ id: "uno", piezas: ["a1", "b1"] }, { id: "dos", piezas: ["a2", "b2"] }];
    const primero = ubicar(iniciarParejas(), rondas, elementos, "a1", "b");
    expect(primero.evento).toBe("fallo");
    expect(primero.estado.primeras.a1).toBe("b");
    expect(primero.estado.colocadas).toEqual([]);
    const segundo = ubicar(primero.estado, rondas, elementos, "a1", "b");
    expect(segundo.autocolocada).toBe(true);
    expect(segundo.estado.colocadas).toEqual(["a1"]);
    expect(ubicar(segundo.estado, rondas, elementos, "a1", "a").evento).toBe("ignorado");
    const cierre = ubicar(segundo.estado, rondas, elementos, "b1", "b");
    expect(cierre.evento).toBe("fin-ronda");
    expect(cierre.estado.ronda).toBe(1);
    expect(cierre.estado.primeras).toEqual({ a1: "b", b1: "b" });
    const a2 = ubicar(cierre.estado, rondas, elementos, "a2", "a");
    expect(ubicar(a2.estado, rondas, elementos, "b2", "b").evento).toBe("fin");
  });
});
