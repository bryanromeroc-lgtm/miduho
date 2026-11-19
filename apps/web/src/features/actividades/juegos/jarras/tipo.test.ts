import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { jarras } from "./tipo";

const c = {
  rondas: [
    { id: "a", denominador: 8, a: 2, b: 3, operacion: "+" as const, sabor: "lulo" as const },
    { id: "b", denominador: 6, a: 5, b: 1, operacion: "-" as const, sabor: "mora" as const },
    { id: "c", denominador: 5, a: 1, b: 2, operacion: "+" as const, sabor: "mango" as const },
    { id: "d", denominador: 4, a: 2, b: 1, operacion: "+" as const, sabor: "fresa" as const },
  ],
};

describe("jarras", () => {
  it("acepta el resultado o una fracción equivalente", () => {
    const r = calificarIntento(jarras, c, { a: { n: 5, d: 8 }, b: { n: 2, d: 3 }, c: { n: 3, d: 10 }, d: { n: 3, d: 0 } });
    expect(r.items.map((i) => i.correcta)).toEqual([true, true, false, false]);
    expect(jarras.repaso(c, "b")).toEqual({ pregunta: "5/6 − 1/6", solucion: "4/6" });
  });

  it("rechaza resultados fuera de una jarra", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "jarras", grado: 5, instruccion: "Haz algo.", tema: "Fracciones" };
    expect(leerActividad({ ...base, contenido: { rondas: [...c.rondas.slice(1), { ...c.rondas[0], a: 6, b: 5 }] } }).ok).toBe(false);
  });
});
