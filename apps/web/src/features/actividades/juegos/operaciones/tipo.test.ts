import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { operaciones } from "./tipo";

const c = { expresiones: [{ id: "a", expresion: "8 + 4 × 3" }, { id: "b", expresion: "(6 + 9) × 2" }, { id: "c", expresion: "20 − 12 ÷ 4" }] };

describe("operaciones", () => {
  it("un punto por el orden y otro por los cálculos", () => {
    const r = calificarIntento(operaciones, c, {
      a: { pasos: [{ toque: 3, valor: 12 }, { toque: 1, valor: 20 }] },
      b: { pasos: [{ toque: 5, valor: 15 }, { toque: 1, valor: 30 }] },
      c: { pasos: [{ toque: 3, valor: 4 }, { toque: 1, valor: 16 }] },
    });
    expect(r.items.map((i) => i.puntaje)).toEqual([2, 1, 1]);
    expect(operaciones.repaso(c, "b").solucion).toBe("6 + 9 = 15; 15 × 2 = 30. Resultado: 30.");
  });

  it("rechaza divisiones no exactas", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "operaciones", grado: 5, instruccion: "Haz algo.", tema: "Operaciones" };
    expect(leerActividad({ ...base, contenido: { expresiones: [...c.expresiones, { id: "d", expresion: "7 ÷ 2 + 1" }] } }).ok).toBe(false);
  });
});
